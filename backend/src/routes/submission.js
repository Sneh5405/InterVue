const express = require("express");
const submissionRouter = express.Router();
const authenticateToken = require("../middleware/auth"); 
const { submitCodeForExecution, getSubmissionResult } = require("../controllers/submission");

// Route to manually submit code
submissionRouter.post("/", authenticateToken, submitCodeForExecution);

// Route to poll for results
submissionRouter.get("/:id", authenticateToken, getSubmissionResult);

module.exports = submissionRouter;
