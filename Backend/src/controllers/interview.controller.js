const {generateInterviewReport} = require("../AI/ai.method")
const pdfParse = require("pdf-parse")
const interviewReportModel = require("../models/interviewAI.model")

async function generateInterViewReportController(req, res) {

        const { selfDescription, jobDescription } = req.body
        // Change this:
const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
const resumeText = typeof resumeContent === 'string' ? resumeContent : (resumeContent.text || "");

// Then use resumeText in your calls:
const interViewReportByAi = await generateInterviewReport({
    resume: resumeText,
    selfDescription,
    jobDescription
});

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}
module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController
}