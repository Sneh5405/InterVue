require("dotenv").config();
const { Worker } = require("bullmq");
const { redisConnection, QUEUE_NAME } = require("./services/queue");
const { runInSandbox } = require("./services/sandbox");
const prisma = require("./config/prisma"); // Adjust path if needed given where worker.js is

// Initialize 5 concurrent workers
const executionWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
        const { submissionId, code, language, input } = job.data;
        const startTime = Date.now();
        console.log(`[Worker] Picked up job ${job.id} for submission ${submissionId}`);

        try {
            // 1. Mark the submission as RUNNING
            await prisma.submission.update({
                where: { id: submissionId },
                data: { status: "RUNNING" }
            });

            // 2. Execute Code in Sandbox
            const { error, stdout, stderr } = await runInSandbox(code, language, input);

            const duration = (Date.now() - startTime) / 1000; // time in seconds

            // 3. Determine Result
            let finalStatus = "COMPLETED";
            let finalOutput = stdout.trim();

            if (error) {
                if (error.killed) {
                    finalStatus = "TIMEOUT";
                    finalOutput = `Execution timed out after ${duration} seconds. Infinite loop detected or command exceeded limit.`;
                } else {
                    finalStatus = "FAILED";
                    finalOutput = stderr.trim() || error.message || "Unknown Runtime Error";
                }
            } else if (stderr) {
                // E.g., warnings or normal runtime errors print to stderr
                finalStatus = "FAILED";
                finalOutput = stderr.trim();
            }

            // 4. Save results to DB
            await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    status: finalStatus,
                    output: finalOutput,
                    executionTime: duration
                }
            });

            console.log(`[Worker] Job ${job.id} completed. Status: ${finalStatus}`);
            // Option to emit socket event via Redis Pub/Sub here
        } catch (err) {
            console.error(`[Worker] Critical error processing job ${job.id}:`, err);
            // Panic fail!
            await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    status: "FAILED",
                    output: "Internal Worker Error",
                    executionTime: (Date.now() - startTime) / 1000
                }
            });
        }
    },
    {
        connection: redisConnection,
        concurrency: 5 // Run up to 5 Sandboxes parallel
    }
);

executionWorker.on("ready", () => {
    console.log("[Worker] Started and listening to queue...");
});

executionWorker.on("error", (err) => {
    console.error("[Worker] Error:", err);
});

module.exports = executionWorker;
