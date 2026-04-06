import makeWASocket, { DisconnectReason, useMultiFileAuthState, WAMessage } from 'baileys';
import { Boom } from '@hapi/boom';
import { env } from '../../../config/env.js';
import { eventBus } from '../../../infrastructure/event/event-bus.js';
import { DomainEvents } from '../../../shared/constants/events.js';
import { logger } from '../../../infrastructure/logger/pino-logger.js';
import { IncomingWhatsAppEvent } from '../types/whatsapp.types.js';

export class WhatsAppService {
  private socket: ReturnType<typeof makeWASocket> | null = null;

  async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(env.BAILEYS_AUTH_PATH);
    this.socket = makeWASocket({ auth: state, printQRInTerminal: true });

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const status = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
        if (status !== DisconnectReason.loggedOut) {
          logger.warn('Reconnecting WhatsApp socket...');
          void this.connect();
        }
      }
    });

    this.socket.ev.on('messages.upsert', ({ messages }) => {
      for (const message of messages) {
        const normalized = this.normalizeIncoming(message);
        if (normalized) {
          eventBus.emit<IncomingWhatsAppEvent>(DomainEvents.MessageReceived, normalized);
        }
      }
    });
  }

  async sendMessage(chatWaId: string, content: string): Promise<void> {
    if (!this.socket) {
      throw new Error('WhatsApp socket not initialized');
    }

    await this.socket.presenceSubscribe(chatWaId);
    await this.socket.sendPresenceUpdate('composing', chatWaId);
    await this.delay(this.randomMs(800, 2000));
    await this.socket.sendMessage(chatWaId, { text: content });
    await this.socket.sendPresenceUpdate('available', chatWaId);
    eventBus.emit(DomainEvents.MessageSent, { chatWaId, content });
  }

  private normalizeIncoming(message: WAMessage): IncomingWhatsAppEvent | null {
    const content = message.message?.conversation;
    const waMessageId = message.key.id;
    const chatWaId = message.key.remoteJid;
    const senderWaId = message.key.participant || message.key.remoteJid;

    if (!content || !waMessageId || !chatWaId || !senderWaId) {
      return null;
    }

    return {
      waMessageId,
      chatWaId,
      senderWaId,
      content,
      timestamp: message.messageTimestamp || Math.floor(Date.now() / 1000)
    };
  }

  private randomMs(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}
