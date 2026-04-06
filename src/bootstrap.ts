import { eventBus } from './infrastructure/event/event-bus.js';
import { QueueManager } from './infrastructure/queue/queue-manager.js';
import { DomainEvents } from './shared/constants/events.js';
import { createCorrelationId } from './shared/utils/correlation.js';
import { MessageRepository } from './modules/message/repositories/message.repository.js';
import { MessageService } from './modules/message/services/message.service.js';
import { MemoryRepository } from './modules/memory/repositories/memory.repository.js';
import { MemoryService } from './modules/memory/services/memory.service.js';
import { PersonaRepository } from './modules/persona/repositories/persona.repository.js';
import { PersonaService } from './modules/persona/services/persona.service.js';
import { SafetyService } from './modules/safety/services/safety.service.js';
import { DecisionEngine } from './modules/agent/services/decision-engine.service.js';
import { PersonaEngine } from './modules/agent/services/persona-engine.service.js';
import { ToolExecutor } from './modules/agent/services/tool-executor.service.js';
import { AgentService } from './modules/agent/services/agent.service.js';
import { AgentOrchestrator } from './modules/agent/controllers/agent-orchestrator.js';
import { WhatsAppService } from './modules/whatsapp/services/whatsapp.service.js';
import { ControlService } from './modules/control/services/control.service.js';
import { ControlController } from './modules/control/controllers/control.controller.js';
import { PersonaController } from './modules/persona/controllers/persona.controller.js';
import { logger } from './infrastructure/logger/pino-logger.js';

const messageProcessingQueue = new QueueManager<{
  waMessageId: string;
  chatWaId: string;
  senderWaId: string;
  content: string;
  timestamp: number;
  correlationId: string;
}>('message-processing');

const agentDecisionQueue = new QueueManager<{
  chatWaId: string;
  senderWaId: string;
  content: string;
  correlationId: string;
}>('agent-decision');

const messageSendQueue = new QueueManager<{ chatWaId: string; content: string; correlationId: string }>(
  'message-send'
);

export const bootstrap = async () => {
  const messageRepository = new MessageRepository();
  const memoryRepository = new MemoryRepository();
  const personaRepository = new PersonaRepository();

  const messageService = new MessageService(messageRepository);
  const memoryService = new MemoryService(memoryRepository, messageRepository);
  const personaService = new PersonaService(personaRepository);
  const safetyService = new SafetyService();
  const controlService = new ControlService();

  const decisionEngine = new DecisionEngine();
  const personaEngine = new PersonaEngine(personaService);
  const toolExecutor = new ToolExecutor(messageSendQueue);
  const agentService = new AgentService(
    decisionEngine,
    personaEngine,
    toolExecutor,
    memoryService,
    safetyService
  );

  const whatsAppService = new WhatsAppService();
  const orchestrator = new AgentOrchestrator(agentDecisionQueue, agentService, controlService);
  orchestrator.registerWorkers();

  messageProcessingQueue.createWorker(async payload => {
    const normalized = messageService.normalizeIncoming(payload);
    await messageService.persistIncoming(normalized);
    await memoryService.appendContext(payload.chatWaId, payload.content);
    await agentDecisionQueue.addJob(
      'agent-decide',
      {
        chatWaId: payload.chatWaId,
        senderWaId: payload.senderWaId,
        content: payload.content,
        correlationId: payload.correlationId
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
    );
  });

  messageSendQueue.createWorker(async payload => {
    const config = await controlService.getConfig();
    const delay = Math.floor(Math.random() * (config.maxDelayMs - config.minDelayMs + 1) + config.minDelayMs);
    await new Promise(resolve => setTimeout(resolve, delay));

    await whatsAppService.sendMessage(payload.chatWaId, payload.content);
    await messageService.persistOutgoing({
      waMessageId: `out-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      chatWaId: payload.chatWaId,
      senderWaId: 'agent',
      content: payload.content
    });
    await memoryService.appendContext(payload.chatWaId, payload.content);
    await memoryService.summarizeConversation(payload.chatWaId);
  });

  eventBus.on<{
    waMessageId: string;
    chatWaId: string;
    senderWaId: string;
    content: string;
    timestamp: number;
  }>(DomainEvents.MessageReceived, payload => {
    const correlationId = createCorrelationId();
    void messageProcessingQueue.addJob(
      'process-message',
      { ...payload, correlationId },
      { attempts: 5, removeOnComplete: 1000, removeOnFail: 5000 }
    );
  });

  eventBus.on(DomainEvents.MessageSent, payload => {
    logger.info({ payload }, 'Message sent event');
  });

  await whatsAppService.connect();

  return {
    controlController: new ControlController(controlService, personaService),
    personaController: new PersonaController(personaService)
  };
};
