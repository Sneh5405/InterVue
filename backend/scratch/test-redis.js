const IORedis = require("ioredis");
require('dotenv').config();

const redisConnection = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});

async function main() {
    console.log("Connecting to Redis...");
    console.log("Host:", process.env.REDIS_HOST);
    console.log("Port:", process.env.REDIS_PORT);
    
    await redisConnection.ping();
    console.log("Successfully pinged Redis!");
    
    await redisConnection.set("test-key", "working!");
    const val = await redisConnection.get("test-key");
    console.log("Test key value:", val);
    
    process.exit(0);
}

main().catch(err => {
    console.error("Redis Connection Failed:", err);
    process.exit(1);
});
