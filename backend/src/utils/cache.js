const { redisConnection } = require("../services/queue");

/**
 * Get value from Redis cache and parse it from JSON.
 * @param {string} key
 * @returns {Promise<any>}
 */
const get = async (key) => {
    try {
        const val = await redisConnection.get(key);
        if (!val) return null;
        return JSON.parse(val);
    } catch (err) {
        console.error(`[Cache Error] Failed to get key ${key}:`, err);
        return null; // Return null so request falls back to DB on Redis error
    }
};

/**
 * Set value in Redis cache with an expiration (TTL) in seconds.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - Time-To-Live in seconds (default: 300 / 5 minutes)
 */
const set = async (key, value, ttlSeconds = 300) => {
    try {
        const stringified = JSON.stringify(value);
        await redisConnection.set(key, stringified, "EX", ttlSeconds);
    } catch (err) {
        console.error(`[Cache Error] Failed to set key ${key}:`, err);
    }
};

/**
 * Delete a specific key from Redis cache.
 * @param {string} key
 */
const del = async (key) => {
    try {
        await redisConnection.del(key);
    } catch (err) {
        console.error(`[Cache Error] Failed to delete key ${key}:`, err);
    }
};

/**
 * Delete all keys matching a pattern (wildcard like 'questions:list:*') using SCAN cursor.
 * This is non-blocking and safe to use on cloud Redis instances.
 * @param {string} pattern
 */
const clearPattern = async (pattern) => {
    try {
        let cursor = "0";
        do {
            const reply = await redisConnection.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = reply[0];
            const keys = reply[1];
            if (keys && keys.length > 0) {
                await redisConnection.del(...keys);
            }
        } while (cursor !== "0");
    } catch (err) {
        console.error(`[Cache Error] Failed to clear pattern ${pattern}:`, err);
    }
};

module.exports = {
    get,
    set,
    del,
    clearPattern
};
