const Groq = require("groq-sdk")
const { z } = require("zod")
const dotenv = require("dotenv")
dotenv.config()

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const interviewReportSchema = z.object({
  matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
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
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

const jsonSchemaExample = {
  matchScore: 85,
  technicalQuestions: [{ question: "", intention: "", answer: "" }],
  behavioralQuestions: [{ question: "", intention: "", answer: "" }],
  skillGaps: [{ skill: "", severity: "medium" }],
  preparationPlan: [{ day: 1, focus: "", tasks: [""] }],
  title: ""
};

const prompt = `
Generate a JSON interview report. 
STRICT REQUIREMENT: You must include every single field defined in this example structure:
${JSON.stringify(jsonSchemaExample, null, 2)}

Data to process:
- Resume: ${resume}
- Self Description: ${selfDescription}
- Job Description: ${jobDescription}

Return ONLY the JSON object. Do not include markdown formatting or backticks.`;

const response = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { 
      role: "system", 
      content: "You are a professional recruiter. You only communicate in valid, minified JSON. Never use markdown code blocks." 
    },
    { role: "user", content: prompt }
  ],
  response_format: { "type": "json_object" },
  temperature: 0.2
})
// console.log(response)
const parsed = JSON.parse(response.choices[0].message.content)

const result = interviewReportSchema.safeParse(parsed)

if (!result.success) {
  console.log(result.error)
  throw new Error("Invalid AI response format")
}

return result.data
}

module.exports = {
  generateInterviewReport
}