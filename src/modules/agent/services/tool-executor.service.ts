import { logger } from '../../../infrastructure/logger/pino-logger.js';
import { QueueManager } from '../../../infrastructure/queue/queue-manager.js';
import { AgentDecision } from '../types/agent.types.js';

export class ToolExecutor {
  constructor(private readonly sendQueue: QueueManager<{ chatWaId: string; content: string; correlationId: string }>) {}

  async execute(decision: AgentDecision, params: { chatWaId: string; correlationId: string }): Promise<void> {
    if (decision.action === 'SEND_MESSAGE' && decision.content.trim().length > 0) {
      await this.sendQueue.addJob('send-message', {
        chatWaId: params.chatWaId,
        content: decision.content,
        correlationId: params.correlationId
      });
      return;
    }

    logger.info({ decision, correlationId: params.correlationId }, 'No send action executed');
  }
}
