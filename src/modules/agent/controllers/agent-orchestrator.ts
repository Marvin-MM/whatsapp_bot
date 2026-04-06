import { QueueManager } from '../../../infrastructure/queue/queue-manager.js';
import { AgentService } from '../services/agent.service.js';
import { ControlService } from '../../control/services/control.service.js';

export interface AgentDecisionJob {
  chatWaId: string;
  senderWaId: string;
  content: string;
  correlationId: string;
}

export class AgentOrchestrator {
  constructor(
    private readonly decisionQueue: QueueManager<AgentDecisionJob>,
    private readonly agentService: AgentService,
    private readonly controlService: ControlService
  ) {}

  registerWorkers(): void {
    this.decisionQueue.createWorker(async payload => {
      const config = await this.controlService.getConfig();
      if (!config.enabled) {
        return;
      }

      await this.agentService.processMessage({
        ...payload,
        maxMessagesPerHour: config.maxMessagesPerHour
      });
    });
  }
}
