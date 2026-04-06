import { eventBus } from '../../../infrastructure/event/event-bus.js';
import { DomainEvents } from '../../../shared/constants/events.js';
import { MessageRepository } from '../repositories/message.repository.js';
import { NormalizedMessage, StoredMessageInput } from '../types/message.types.js';

export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  public normalizeIncoming(payload: {
    waMessageId: string;
    chatWaId: string;
    senderWaId: string;
    content: string;
    timestamp: number;
  }): NormalizedMessage {
    return {
      waMessageId: payload.waMessageId,
      chatWaId: payload.chatWaId,
      senderWaId: payload.senderWaId,
      content: payload.content,
      messageType: 'TEXT',
      timestamp: new Date(payload.timestamp * 1000).toISOString(),
      isGroup: payload.chatWaId.endsWith('@g.us')
    };
  }

  public async persistIncoming(message: NormalizedMessage): Promise<void> {
    const storeInput: StoredMessageInput = {
      waMessageId: message.waMessageId,
      chatWaId: message.chatWaId,
      senderWaId: message.senderWaId,
      content: message.content,
      direction: 'INCOMING',
      type: message.messageType
    };

    await this.messageRepository.saveMessage(storeInput);
    eventBus.emit(DomainEvents.MessagePersisted, message);
  }

  public async persistOutgoing(data: {
    waMessageId: string;
    chatWaId: string;
    senderWaId: string;
    content: string;
  }): Promise<void> {
    await this.messageRepository.saveMessage({
      waMessageId: data.waMessageId,
      chatWaId: data.chatWaId,
      senderWaId: data.senderWaId,
      content: data.content,
      direction: 'OUTGOING',
      type: 'TEXT'
    });
  }
}
