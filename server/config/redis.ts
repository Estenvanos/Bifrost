import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

redis.on("connect", () => {
    console.log("Redis connected successfully");
});
