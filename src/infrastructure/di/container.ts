import { AgentService } from '../../modules/agent/services/agent.service.js';
import { ControlService } from '../../modules/control/services/control.service.js';
import { MemoryService } from '../../modules/memory/services/memory.service.js';
import { MessageService } from '../../modules/message/services/message.service.js';
import { PersonaService } from '../../modules/persona/services/persona.service.js';
import { SafetyService } from '../../modules/safety/services/safety.service.js';
import { WhatsAppService } from '../../modules/whatsapp/services/whatsapp.service.js';

export interface Container {
  whatsAppService: WhatsAppService;
  messageService: MessageService;
  memoryService: MemoryService;
  personaService: PersonaService;
  safetyService: SafetyService;
  agentService: AgentService;
  controlService: ControlService;
}
