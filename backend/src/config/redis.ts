import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redisClient.on('error', (error) => {
  console.error('[ERROR] Redis error:', error.message);
});

redisClient.on('connect', () => {
  console.log('[INFO] Redis connected');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('[ERROR] Redis connection failed:', error);
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
  } catch (error) {
    console.error('[ERROR] Redis shutdown failed:', error);
  }
};
