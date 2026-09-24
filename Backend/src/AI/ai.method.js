const Groq = require("groq-sdk");
const { z } = require("zod");
const dotenv = require("dotenv");
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "You are a professional recruiter. Output ONLY valid, minified JSON matching the exact structure requested."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  const result = interviewReportSchema.safeParse(parsed);

  if (!result.success) {
    console.error("Zod Schema Validation Error:", result.error);
    throw new Error("AI generated an invalid response schema structure");
  }

  return result.data;
}

module.exports = {
  generateInterviewReport
};