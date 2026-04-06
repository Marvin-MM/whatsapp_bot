import { MessageDirection, MessageType } from '@prisma/client';
import { prisma } from '../../../infrastructure/db/prisma-client.js';
import { StoredMessageInput } from '../types/message.types.js';

export class MessageRepository {
  async saveMessage(input: StoredMessageInput): Promise<void> {
    const chat = await prisma.chat.upsert({
      where: { waChatId: input.chatWaId },
      create: { waChatId: input.chatWaId, isGroup: input.chatWaId.endsWith('@g.us') },
      update: {}
    });

    const user = await prisma.user.upsert({
      where: { waId: input.senderWaId },
      create: { waId: input.senderWaId },
      update: {}
    });

    await prisma.message.create({
      data: {
        waMessageId: input.waMessageId,
        chatId: chat.id,
        userId: user.id,
        content: input.content,
        direction: input.direction as MessageDirection,
        type: input.type as MessageType,
        metadata: input.metadata
      }
    });
  }

  async getRecentMessages(chatWaId: string, limit = 20): Promise<string[]> {
    const chat = await prisma.chat.findUnique({ where: { waChatId: chatWaId } });
    if (!chat) {
      return [];
    }

    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return messages.reverse().map(message => message.content);
  }
}
