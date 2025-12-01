
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis, { connectRedis } from '../db/redis';
import { Request, Response } from 'express';

export const shouldRateLimit = (req: Request, res: Response): boolean => {
    if (process.env.NODE_ENV !== 'production') {
        return false;
    }

    return true;
};

const createRedisStore = async () => {
    await connectRedis();

    return new RedisStore({
        sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
        prefix: 'rate-limit:',
    });
};

export const standardRateLimiterOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests, please try again later.'
    },
    skip: (req: Request, res: Response) => !shouldRateLimit(req, res),
};

export const createRateLimiterMiddleware = async () => {
    await connectRedis();

    return rateLimit({
        ...standardRateLimiterOptions,
        store: new RedisStore({
            sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
            prefix: 'rate-limit:',
        })
    });
};


export const basicRateLimiterMiddleware = rateLimit(standardRateLimiterOptions);


export const authRateLimiterOptions = {
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many login attempts, please try again later.',
    },
    skip: (req: Request) => process.env.NODE_ENV !== 'production',
};

export const createAuthRateLimiterMiddleware = async () => {
    await connectRedis();

    return rateLimit({
        ...authRateLimiterOptions,
        store: new RedisStore({
            sendCommand: (...args: unknown[]) => redis.sendCommand(args as any),
            prefix: 'auth-rate-limit:',
        }),
    });
};