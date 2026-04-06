import { logger } from '../../../infrastructure/logger/pino-logger.js';
import { DecisionEngine } from './decision-engine.service.js';
import { PersonaEngine } from './persona-engine.service.js';
import { ToolExecutor } from './tool-executor.service.js';
import { MemoryService } from '../../memory/services/memory.service.js';
import { SafetyService } from '../../safety/services/safety.service.js';

export class AgentService {
  constructor(
    private readonly decisionEngine: DecisionEngine,
    private readonly personaEngine: PersonaEngine,
    private readonly toolExecutor: ToolExecutor,
    private readonly memoryService: MemoryService,
    private readonly safetyService: SafetyService
  ) {}

  async processMessage(input: {
    chatWaId: string;
    senderWaId: string;
    content: string;
    correlationId: string;
    maxMessagesPerHour: number;
  }): Promise<void> {
    if (await this.safetyService.isBlockedUser(input.senderWaId)) {
      logger.info({ sender: input.senderWaId, correlationId: input.correlationId }, 'Blocked user ignored');
      return;
    }

    if (await this.safetyService.checkCooldown(input.chatWaId)) {
      logger.info({ chat: input.chatWaId, correlationId: input.correlationId }, 'Cooldown active');
      return;
    }

    const allowedByRate = await this.safetyService.canSendByRateLimit(input.chatWaId, input.maxMessagesPerHour);
    if (!allowedByRate) {
      logger.warn({ chat: input.chatWaId, correlationId: input.correlationId }, 'Rate limit reached');
      return;
    }

    const [context, personaPrompt] = await Promise.all([
      this.memoryService.getContext(input.chatWaId),
      this.personaEngine.resolvePrompt(input.chatWaId)
    ]);

    const decision = await this.decisionEngine.decide({
      message: input.content,
      context,
      personaPrompt,
      rules: 'Return action in SEND_MESSAGE|IGNORE|WAIT|ESCALATE. Never produce unsafe content.'
    });

    logger.info({ decision, correlationId: input.correlationId }, 'Agent decision generated');

    await this.toolExecutor.execute(decision, {
      chatWaId: input.chatWaId,
      correlationId: input.correlationId
    });

    await this.safetyService.enforceCooldown(input.chatWaId, 4);
  }
}
