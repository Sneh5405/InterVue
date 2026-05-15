const { Queue, Worker } = require("bullmq");
const IORedis = require("ioredis");

// Setup the Redis connection configuration
const redisConnection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null,
});

// The name of our Code Execution Queue
const QUEUE_NAME = "code-execution";

// Initialize the Queue where our Web Server drops new submissions
const executionQueue = new Queue(QUEUE_NAME, {
    connection: redisConnection,
});

/**
 * Push a new code submission job to the Redis queue.
 * @param {number} submissionId - The ID of the database Submission record.
 * @param {string} code - The source code to evaluate.
 * @param {string} language - The language to evaluate the code in.
 * @param {string} input - An optional test input to pipe in.
 */
const addCodeExecutionJob = async (submissionId, code, language, input = "") => {
    const jobData = {
        submissionId,
        code,
        language,
        input
    };
    
    // Add job to the queue
    const job = await executionQueue.add(`submit-${submissionId}`, jobData, {
        attempts: 1,           // we generally avoid retrying malicious/buggy user code
        removeOnComplete: true, // Keep DB tidy
        removeOnFail: true,
    });
    
    return job;
};

module.exports = {
    executionQueue,
    addCodeExecutionJob,
    redisConnection,
    QUEUE_NAME
};
