import Redis from 'ioredis';
import logger from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisClient = null;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });

  redisClient.on('connect', () => {
    logger.info('Redis cache client connected successfully.');
  });

  redisClient.on('error', err => {
    logger.warn('Redis connection failed. Running cache in fallback/disabled mode.');
  });
} catch (error) {
  logger.warn('Failed to initialize Redis. Running cache in fallback/disabled mode.');
}

const getCache = async (key: string) => {
  if (!redisClient || (redisClient as any).status !== 'ready') return null;
  try {
    const data = await (redisClient as any).get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

const setCache = async (key: string, value: any, durationSeconds = 300) => {
  if (!redisClient || (redisClient as any).status !== 'ready') return;
  try {
    await (redisClient as any).set(key, JSON.stringify(value), 'EX', durationSeconds);
  } catch (error) {
    // Fail silently in development/fallback
  }
};

const invalidateCache = async (keyPattern: string) => {
  if (!redisClient || (redisClient as any).status !== 'ready') return;
  try {
    // If exact key, delete it.
    await (redisClient as any).del(keyPattern);
  } catch (error) {
    // Fail silently in development/fallback
  }
};

export { getCache, setCache, invalidateCache };
