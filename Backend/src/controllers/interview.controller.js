const { generateInterviewReport } = require("../AI/ai.method");
const pdfParse = require("pdf-parse");
const interviewReportModel = require("../models/interviewAI.model");

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;
        let resumeText = "";

        if (req.file && req.file.buffer) {
            try {
                if (typeof pdfParse === 'function') {
                    const parsed = await pdfParse(req.file.buffer);
                    resumeText = parsed.text || "";
                } else if (pdfParse.PDFParse) {
                    const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer));
                    const resumeContent = await parser.getText();
                    resumeText = typeof resumeContent === 'string' ? resumeContent : (resumeContent.text || "");
                } else {
                    resumeText = req.file.buffer.toString('utf-8');
                }
            } catch (pdfErr) {
                console.error("PDF Parsing error:", pdfErr);
                resumeText = "Could not parse PDF file.";
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription: selfDescription || "",
            jobDescription: jobDescription || ""
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error in generateInterViewReportController:", error);
        res.status(500).json({
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