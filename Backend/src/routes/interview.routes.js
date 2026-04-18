const express = require("express")
const interviewRouter = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const {upload} = require("../middlewares/file.middleware")
const interviewController = require("../controllers/interview.controller")


interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)


interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

module.exports = interviewRouter