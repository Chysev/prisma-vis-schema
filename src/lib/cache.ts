/**
 * Redis Cache Service
 * 
 * This module provides a robust Redis-based caching implementation with
 * error handling and type safety. It uses the shared Redis client from db/redis.ts
 * to prevent multiple connections to the Redis server.
 * 
 * @module lib/cache
 * @requires ../db/redis
 */

import redisClient, { connectRedis } from "../db/redis";

/**
 * Default TTL for cache entries in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Cache service class providing type-safe Redis cache operations
 */
export class Cache {
    /**
     * Ensures Redis connection is established before operations
     */
    private async ensureConnection() {
        try {
            await connectRedis();
            return redisClient;
        } catch (error) {
            console.error("Failed to ensure Redis connection:", error);
            throw error;
        }
    }

    /**
     * Executes a Redis operation with error handling and connection management
     * @param operation - The Redis operation function to execute
     * @param fallback - The fallback value if operation fails
     * @returns The result of the operation or fallback value
     */
    private async executeRedisOperation<T>(
        operation: () => Promise<T>,
        fallback: T
    ): Promise<T> {
        try {
            await this.ensureConnection();
            return await operation();
        } catch (error) {
            console.error("Redis operation failed:", error);
            return fallback;
        }
    }

    /**
     * Retrieves value from cache by key
     * 
     * @param key - The cache key
     * @returns The cached value or null if not found
     * 
     * @example
     * const userData = await cacheService.get("user:123");
     * if (userData) {
     *     return JSON.parse(userData);
     * }
     */
    async get(key: string): Promise<string | null> {
        return this.executeRedisOperation(
            async () => await redisClient.get(key),
            null
        );
    }

    /**
     * Stores value in cache with a specified TTL
     * 
     * @param key - The cache key
     * @param value - The value to cache
     * @param ttlSeconds - Time to live in seconds (defaults to 1 hour)
     * 
     * @example
     * await cacheService.set("user:123", JSON.stringify(userData), 1800); // 30 minutes TTL
     */
    async set(key: string, value: string, ttlSeconds = DEFAULT_TTL): Promise<void> {
        await this.executeRedisOperation(
            async () => await redisClient.setEx(key, ttlSeconds, value),
            undefined
        );
    }

    /**
     * Removes a value from cache by key
     * 
     * @param key - The cache key to delete
     * 
     * @example
     * await cacheService.del("user:123");
     */
    async del(key: string): Promise<void> {
        await this.executeRedisOperation(
            async () => await redisClient.del(key),
            undefined
        );
    }

    /**
     * Sets multiple cache entries at once
     * 
     * @param entries - Array of key-value pairs to cache
     * @param ttlSeconds - Time to live in seconds (defaults to 1 hour)
     * 
     * @example
     * await cacheService.mset([
     *     { key: "user:123", value: JSON.stringify(userData) },
     *     { key: "posts:123", value: JSON.stringify(posts) }
     * ], 1800);
     */
    async mset(entries: { key: string; value: string }[], ttlSeconds = DEFAULT_TTL): Promise<void> {
        await this.executeRedisOperation(
            async () => {
                const multi = redisClient.multi();
                for (const entry of entries) {
                    multi.setEx(entry.key, ttlSeconds, entry.value);
                }
                return await multi.exec();
            },
            undefined
        );
    }

    /**
     * Gets multiple cache entries at once
     * 
     * @param keys - Array of cache keys to retrieve
     * @returns Object with keys mapped to their values or null
     * 
     * @example
     * const data = await cacheService.mget(["user:123", "posts:123"]);
     * // data = { "user:123": "{...}", "posts:123": "{...}" }
     */
    async mget(keys: string[]): Promise<Record<string, string | null>> {
        return this.executeRedisOperation(
            async () => {
                if (!keys.length) return {};
                const values = await redisClient.mGet(keys);
                return keys.reduce((acc, key, index) => {
                    acc[key] = values[index];
                    return acc;
                }, {} as Record<string, string | null>);
            },
            {}
        );
    }

    /**
     * Store JSON data directly (convenience method)
     * 
     * @param key - The cache key
     * @param data - The data to cache (will be JSON stringified)
     * @param ttlSeconds - Time to live in seconds (defaults to 1 hour)
     * 
     * @example
     * await cacheService.setJSON("app:config", { theme: "dark", features: ["a", "b"] });
     */
    async setJSON<T>(key: string, data: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
        try {
            const jsonString = JSON.stringify(data);
            return await this.set(key, jsonString, ttlSeconds);
        } catch (error) {
            console.error("Failed to JSON stringify value for cache:", error);
        }
    }

    /**
     * Retrieve and parse JSON data (convenience method)
     * 
     * @param key - The cache key
     * @returns The parsed JSON data or null if not found
     * 
     * @example
     * const config = await cacheService.getJSON("app:config");
     * // config = { theme: "dark", features: ["a", "b"] }
     */
    async getJSON<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (!value) return null;

        try {
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Failed to parse cached JSON for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Flush all cache data (use with caution)
     */
    async flush(): Promise<void> {
        await this.executeRedisOperation(
            async () => await redisClient.flushAll(),
            undefined
        );
        console.warn("Redis cache flushed completely");
    }

    /**
     * Note: This doesn't actually close the Redis connection since it's managed externally
     * by db/redis.ts. Use with caution in production environments.
     */
    async close(): Promise<void> {
        // The actual Redis client connection is managed by db/redis.ts
        // This is just a placeholder to maintain API compatibility
        console.info("Cache service closed - Note: actual Redis connection remains open");
    }
}

