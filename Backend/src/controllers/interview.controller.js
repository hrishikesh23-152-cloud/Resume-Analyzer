const { generateInterviewReport, getRateLimitSnapshot } = require("../AI/ai.method");
const interviewReportModel = require("../models/interviewAI.model");
const { extractResumeText } = require("../utils/parseResume");

function setAiUsageHeaders(res, quota, usage = {}) {
    const headerValues = {
        "X-AI-Tokens-Used": usage.total_tokens,
        "X-AI-Tokens-Used-Window": quota.tokenLimit !== null && quota.tokensRemaining !== null
            ? quota.tokenLimit - quota.tokensRemaining
            : null,
        "X-AI-Tokens-Remaining": quota.tokensRemaining,
        "X-AI-Tokens-Limit": quota.tokenLimit,
        "X-AI-Requests-Used": quota.requestLimit !== null && quota.requestsRemaining !== null
            ? quota.requestLimit - quota.requestsRemaining
            : null,
        "X-AI-Requests-Remaining": quota.requestsRemaining,
        "X-AI-Requests-Limit": quota.requestLimit
    };

    for (const [name, value] of Object.entries(headerValues)) {
        if (Number.isFinite(value)) res.set(name, String(value));
    }
}

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;
        let resumeText = "";

        if (req.file && req.file.buffer) {
            resumeText = await extractResumeText(req.file);
            if (!resumeText) {
                resumeText = "Could not parse PDF file.";
            }
        }

        const { report, usage, quota } = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription || ""
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...report
        });

        setAiUsageHeaders(res, quota, usage);
        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error in generateInterViewReportController:", error);
        const status = error.status === 429 ? 429 : 500;
        setAiUsageHeaders(res, getRateLimitSnapshot());
        if (status === 429 && Number.isFinite(error.retryAfter)) {
            res.set("Retry-After", String(error.retryAfter));
        }
        res.status(status).json({
            message: error.message || "Failed to generate interview report"
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        setAiUsageHeaders(res, getRateLimitSnapshot());
        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error in getInterviewReportByIdController:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        setAiUsageHeaders(res, getRateLimitSnapshot());
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Error in getAllInterviewReportsController:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController
};