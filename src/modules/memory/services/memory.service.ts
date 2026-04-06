import { redisClient } from '../../../infrastructure/cache/redis-client.js';
import { MessageRepository } from '../../message/repositories/message.repository.js';
import { MemoryRepository } from '../repositories/memory.repository.js';

const MEMORY_TTL_SECONDS = 60 * 60 * 6;

export class MemoryService {
  constructor(
    private readonly memoryRepository: MemoryRepository,
    private readonly messageRepository: MessageRepository
  ) {}

  async getContext(chatWaId: string): Promise<string[]> {
    const key = `chat:context:${chatWaId}`;
    const cached = await redisClient.lrange(key, 0, -1);
    if (cached.length > 0) {
      return cached;
    }

    const history = await this.messageRepository.getRecentMessages(chatWaId, 20);
    if (history.length > 0) {
      await redisClient.rpush(key, ...history);
      await redisClient.expire(key, MEMORY_TTL_SECONDS);
    }
    return history;
  }

  async appendContext(chatWaId: string, text: string): Promise<void> {
    const key = `chat:context:${chatWaId}`;
    await redisClient.rpush(key, text);
    await redisClient.ltrim(key, -25, -1);
    await redisClient.expire(key, MEMORY_TTL_SECONDS);
  }

  async summarizeConversation(chatWaId: string): Promise<void> {
    const context = await this.getContext(chatWaId);
    if (context.length < 10) {
      return;
    }

    const summary = context.slice(-10).join(' | ');
    const topics = Array.from(new Set(context.flatMap(text => text.toLowerCase().split(' ').slice(0, 2)))).slice(0, 10);
    await this.memoryRepository.saveSnapshot(chatWaId, summary, topics);
  }
}
