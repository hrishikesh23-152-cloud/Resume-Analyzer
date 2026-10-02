const interviewReportModel = require("../models/interviewAI.model");
const { extractResumeText } = require("../utils/parseResume");
const { inferJobRoles } = require("../utils/inferJobRoles");
const { searchJobsForRoles } = require("../services/adzuna.service");

async function findJobsFromProfileController(req, res) {
    try {
        const interviewId = req.params.interviewId || req.query.interviewId;
        const { where, country } = req.query;

        let report = null;
        if (interviewId) {
            report = await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id
            });
        } else {
            report = await interviewReportModel.findOne({
                user: req.user.id
            }).sort({ createdAt: -1 });
        }

        if (!report) {
            return res.status(404).json({
                message: "No saved resume or interview report found in database. Please upload/submit your resume or create an interview plan first."
            });
        }

        const resumeText = report.resume || "";
        const extraText = [report.selfDescription, report.jobDescription].filter(Boolean).join("\n");

        const { roles } = inferJobRoles(resumeText, extraText);

        if (!roles || !roles.length) {
            return res.status(200).json({
                message: "No matching job roles inferred from your saved resume.",
                roles: [],
                jobs: [],
                sourceReport: {
                    id: report._id,
                    title: report.title || "Interview Plan",
                    createdAt: report.createdAt
                },
                errors: []
            });
        }

        const { jobs, errors } = await searchJobsForRoles({
            roles,
            where,
            country
        });

        res.status(200).json({
            message: "Job listings fetched successfully.",
            roles,
            jobs,
            sourceReport: {
                id: report._id,
                title: report.title || "Interview Plan",
                createdAt: report.createdAt
            },
            errors
        });
    } catch (error) {
        console.error("Error in findJobsFromProfileController:", error);
        res.status(500).json({
            message: error.message || "Failed to find jobs"
        });
    }
}

async function findJobsController(req, res) {
    try {
        const { selfDescription, where, country, interviewId } = req.body;
        let resumeText = "";
        let extraText = selfDescription || "";
        let sourceReport = null;

        if (req.file) {
            resumeText = await extractResumeText(req.file);
        } else if (interviewId) {
            const report = await interviewReportModel.findOne({
                _id: interviewId,
                user: req.user.id
            });

            if (report) {
                resumeText = report.resume || "";
                extraText = [report.selfDescription, selfDescription].filter(Boolean).join("\n");
                sourceReport = {
                    id: report._id,
                    title: report.title || "Interview Plan",
                    createdAt: report.createdAt
                };
            }
        } else {
            const latestReport = await interviewReportModel.findOne({
                user: req.user.id
            }).sort({ createdAt: -1 });

            if (latestReport) {
                resumeText = latestReport.resume || "";
                extraText = [latestReport.selfDescription, selfDescription].filter(Boolean).join("\n");
                sourceReport = {
                    id: latestReport._id,
                    title: latestReport.title || "Interview Plan",
                    createdAt: latestReport.createdAt
                };
            }
        }

        const { roles } = inferJobRoles(resumeText, extraText);

        if (!roles || !roles.length) {
            return res.status(200).json({
                message: "No matching job roles found from the resume skills.",
                roles: [],
                jobs: [],
                sourceReport,
                errors: []
            });
        }

        const { jobs, errors } = await searchJobsForRoles({
            roles,
            where,
            country
        });

        res.status(200).json({
            message: "Job listings fetched successfully.",
            roles,
            jobs,
            sourceReport,
            errors
        });
    } catch (error) {
        console.error("Error in findJobsController:", error);
        res.status(500).json({
            message: error.message || "Failed to find jobs"
        });
    }
}

module.exports = {
    findJobsFromProfileController,
    findJobsFromReportController: findJobsFromProfileController,
    findJobsController
};

