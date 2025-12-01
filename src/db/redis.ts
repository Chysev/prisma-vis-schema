import { createClient } from 'redis';

const redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
 
let isConnected = false;

export const connectRedis = async () => {
    if (!isConnected) {
        await redis.connect();
        isConnected = true;
    }
};

export default redis;