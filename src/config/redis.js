const Redis = require('ioredis');
const logger = require('./logger');

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

  redisClient.on('error', (err) => {
    logger.warn('Redis connection failed. Running cache in fallback/disabled mode.');
  });
} catch (error) {
  logger.warn('Failed to initialize Redis. Running cache in fallback/disabled mode.');
}

const getCache = async (key) => {
  if (!redisClient || redisClient.status !== 'ready') return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

const setCache = async (key, value, durationSeconds = 300) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', durationSeconds);
  } catch (error) {
    // Fail silently in development/fallback
  }
};

const invalidateCache = async (keyPattern) => {
  if (!redisClient || redisClient.status !== 'ready') return;
  try {
    // If exact key, delete it.
    await redisClient.del(keyPattern);
  } catch (error) {
    // Fail silently in development/fallback
  }
};

module.exports = {
  getCache,
  setCache,
  invalidateCache
};
