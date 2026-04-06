import { Request, Response } from 'express';
import { assignChatSchema, toggleAgentSchema, updateConfigSchema } from '../dto/control.dto.js';
import { ControlService } from '../services/control.service.js';
import { PersonaService } from '../../persona/services/persona.service.js';

export class ControlController {
  constructor(
    private readonly controlService: ControlService,
    private readonly personaService: PersonaService
  ) {}

  toggleAgent = async (req: Request, res: Response): Promise<void> => {
    const { enabled } = toggleAgentSchema.parse(req.body);
    await this.controlService.toggleAgent(enabled);
    res.status(200).json({ success: true });
  };

  getStatus = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.controlService.getStatus();
    res.status(200).json(status);
  };

  updateConfig = async (req: Request, res: Response): Promise<void> => {
    const payload = updateConfigSchema.parse(req.body);
    await this.controlService.updateConfig(payload);
    res.status(200).json({ success: true });
  };

  getChats = async (_req: Request, res: Response): Promise<void> => {
    const chats = await this.controlService.getChats();
    res.status(200).json(chats);
  };

  assignChatPersona = async (req: Request, res: Response): Promise<void> => {
    const { chatWaId, personaId } = assignChatSchema.parse(req.body);
    await this.personaService.assignPersona(chatWaId, personaId);
    res.status(200).json({ success: true });
  };
}
