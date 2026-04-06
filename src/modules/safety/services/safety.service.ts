import { prisma } from '../../../infrastructure/db/prisma-client.js';
import { redisClient } from '../../../infrastructure/cache/redis-client.js';

export class SafetyService {
  async isBlockedUser(waId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { waId } });
    return user?.blocked ?? false;
  }

  async checkCooldown(chatWaId: string): Promise<boolean> {
    const value = await redisClient.get(`cooldown:${chatWaId}`);
    return Boolean(value);
  }

  async enforceCooldown(chatWaId: string, seconds: number): Promise<void> {
    await redisClient.set(`cooldown:${chatWaId}`, '1', 'EX', seconds);
  }

  async canSendByRateLimit(chatWaId: string, maxPerHour: number): Promise<boolean> {
    const key = `rate:${chatWaId}:${new Date().toISOString().slice(0, 13)}`;
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, 3600);
    }
    return count <= maxPerHour;
  }
}
