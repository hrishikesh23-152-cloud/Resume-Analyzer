const Groq = require("groq-sdk");
const { z } = require("zod");
const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 0
});

const providerQuota = {
  requestLimit: null,
  requestsRemaining: null,
  requestsResetAt: null,
  tokenLimit: null,
  tokensRemaining: null,
  tokensResetAt: null
};
let reservedTokens = 0;
let inFlightRequests = 0;

function readHeader(headers, name) {
  if (typeof headers?.get === "function") {
    return headers.get(name);
  }

  return headers?.[name] ?? headers?.[name.toLowerCase()];
}

function readNumberHeader(headers, name) {
  const value = readHeader(headers, name);
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseResetDuration(value) {
  if (!value) return null;

  const parts = [...value.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g)];
  if (!parts.length) return null;

  return parts.reduce((total, [, amount, unit]) => {
    const multiplier = { ms: 1, s: 1000, m: 60000, h: 3600000 }[unit];
    return total + Number(amount) * multiplier;
  }, 0);
}

function updateProviderQuota(headers) {
  const requestLimit = readNumberHeader(headers, "x-ratelimit-limit-requests");
  const requestsRemaining = readNumberHeader(headers, "x-ratelimit-remaining-requests");
  const tokenLimit = readNumberHeader(headers, "x-ratelimit-limit-tokens");
  const tokensRemaining = readNumberHeader(headers, "x-ratelimit-remaining-tokens");
  const requestsReset = parseResetDuration(readHeader(headers, "x-ratelimit-reset-requests"));
  const tokensReset = parseResetDuration(readHeader(headers, "x-ratelimit-reset-tokens"));

  if (requestLimit !== null) providerQuota.requestLimit = requestLimit;
  if (requestsRemaining !== null) providerQuota.requestsRemaining = requestsRemaining;
  if (tokenLimit !== null) providerQuota.tokenLimit = tokenLimit;
  if (tokensRemaining !== null) providerQuota.tokensRemaining = tokensRemaining;
  if (requestsReset !== null) providerQuota.requestsResetAt = Date.now() + requestsReset;
  if (tokensReset !== null) providerQuota.tokensResetAt = Date.now() + tokensReset;

  return getRateLimitSnapshot();
}

function getRateLimitSnapshot() {
  return {
    requestLimit: providerQuota.requestLimit,
    requestsRemaining: providerQuota.requestsResetAt && Date.now() >= providerQuota.requestsResetAt
      ? null
      : providerQuota.requestsRemaining,
    tokenLimit: providerQuota.tokenLimit,
    tokensRemaining: providerQuota.tokensResetAt && Date.now() >= providerQuota.tokensResetAt
      ? null
      : providerQuota.tokensRemaining
  };
}

function getRetryAfterSeconds() {
  const resetAt = Math.max(
    providerQuota.requestsResetAt || 0,
    providerQuota.tokensResetAt || 0
  );
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

function enforceKnownQuota(estimatedTokens) {
  const quota = getRateLimitSnapshot();
  const requestsExhausted = quota.requestsRemaining !== null && quota.requestsRemaining <= inFlightRequests;
  const tokensExhausted = quota.tokensRemaining !== null
    && quota.tokensRemaining < estimatedTokens + reservedTokens;

  if (requestsExhausted || tokensExhausted) {
    const error = new Error("The AI provider quota is temporarily exhausted. Please try again after the quota resets.");
    error.status = 429;
    error.retryAfter = getRetryAfterSeconds();
    throw error;
  }
}

const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating candidate match percentage"),
  technicalQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  behavioralQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string()
  })),
  skillGaps: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"])
  })),
  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string())
  })),
  title: z.string()
});

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const jsonSchemaExample = {
    matchScore: 85,
    technicalQuestions: [{ question: "", intention: "", answer: "" }],
    behavioralQuestions: [{ question: "", intention: "", answer: "" }],
    skillGaps: [{ skill: "", severity: "medium" }],
    preparationPlan: [{ day: 1, focus: "", tasks: [""] }],
    title: ""
  };

  const prompt = `Generate a comprehensive interview preparation report in valid JSON.
STRICT REQUIREMENT: Respond ONLY with a JSON object matching this schema:
${JSON.stringify(jsonSchemaExample, null, 2)}

Candidate Context:
- Resume Content: ${resume || "Not provided"}
- Candidate Self Description: ${selfDescription || "Not provided"}

Target Position Requirements:
- Job Description: ${jobDescription || "General Software Engineer Position"}

Return ONLY the JSON object. Do not include markdown formatting or backticks.`;

  const systemPrompt = "You are a professional recruiter. Output ONLY valid, minified JSON matching the exact structure requested.";
  const maxCompletionTokens = 2048;
  const estimatedTokens = Math.ceil((prompt.length + systemPrompt.length) / 4) + maxCompletionTokens;
  enforceKnownQuota(estimatedTokens);
  reservedTokens += estimatedTokens;
  inFlightRequests += 1;

  let response;
  let quota;
  try {
    const result = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: maxCompletionTokens,
      temperature: 0.1
    }).withResponse();

    response = result.data;
    quota = updateProviderQuota(result.response.headers);
  } catch (error) {
    if (error.status === 429) {
      updateProviderQuota(error.headers);
      error.retryAfter = error.retryAfter || getRetryAfterSeconds();
    }
    throw error;
  } finally {
    reservedTokens -= estimatedTokens;
    inFlightRequests -= 1;
  }

  const parsed = JSON.parse(response.choices[0].message.content);
  const result = interviewReportSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Zod Schema Validation Error:", result.error);
    throw new Error("AI generated an invalid response schema structure");
  }

  return {
    report: result.data,
    usage: response.usage || {},
    quota
  };
}

module.exports = {
  generateInterviewReport,
  getRateLimitSnapshot
};