import Redis from 'ioredis';
import { env } from '../../config/env.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});
