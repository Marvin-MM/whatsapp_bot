import { prisma } from '../../../infrastructure/db/prisma-client.js';

export class MemoryRepository {
  async saveSnapshot(chatWaId: string, summary: string, topics: string[]): Promise<void> {
    const chat = await prisma.chat.upsert({ where: { waChatId: chatWaId }, create: { waChatId: chatWaId }, update: {} });
    await prisma.memorySnapshot.create({ data: { chatId: chat.id, summary, topics } });
  }

  async getLatestSnapshot(chatWaId: string): Promise<{ summary: string; topics: unknown } | null> {
    const chat = await prisma.chat.findUnique({ where: { waChatId: chatWaId } });
    if (!chat) {
      return null;
    }
    return prisma.memorySnapshot.findFirst({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      select: { summary: true, topics: true }
    });
  }
}
