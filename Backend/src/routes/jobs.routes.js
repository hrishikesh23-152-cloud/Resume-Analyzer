const express = require("express");
const jobsRouter = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const jobsController = require("../controllers/jobs.controller");

jobsRouter.get("/", authMiddleware.authUser, jobsController.findJobsFromProfileController);

jobsRouter.get(
    "/from-report/:interviewId",
    authMiddleware.authUser,
    jobsController.findJobsFromProfileController
);

jobsRouter.post(
    "/",
    authMiddleware.authUser,
    jobsController.findJobsController
);

module.exports = jobsRouter;

