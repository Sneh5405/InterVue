const prisma = require("../config/prisma");
const { addCodeExecutionJob } = require("../services/queue");

const submitCodeForExecution = async (req, res) => {
    const { code, language, input, questionId } = req.body;
    // user ID can come from JWT
    const userId = req.user.id; 

    try {
        // 1. Create a submission in Database
        const submission = await prisma.submission.create({
            data: {
                code,
                language,
                status: "PENDING",
                userId,
                ...(questionId && { questionId })
            }
        });

        // 2. Add it to our Redis Worker Queue
        await addCodeExecutionJob(submission.id, code, language, input || "");

        // 3. Immediately respond with Pending status
        res.status(202).json({ 
            message: "Submission queued successfully", 
            submissionId: submission.id,
            status: "PENDING"
        });
    } catch (err) {
        console.error("Submission API Error:", err);
        res.status(500).json({ error: "Failed to submit code" });
    }
};

const getSubmissionResult = async (req, res) => {
    const { id } = req.params;

    try {
        const submission = await prisma.submission.findUnique({
            where: { id: parseInt(id, 10) }
        });

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        res.status(200).json({ submission });
    } catch (err) {
        console.error("Submission Search Error:", err);
        res.status(500).json({ error: "Failed to fetch submission details" });
    }
};

module.exports = {
    submitCodeForExecution,
    getSubmissionResult
};
