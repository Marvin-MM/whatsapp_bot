import { Request, Response } from 'express';
import { createPersonaSchema } from '../dto/persona.dto.js';
import { PersonaService } from '../services/persona.service.js';

export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  createPersona = async (req: Request, res: Response): Promise<void> => {
    const payload = createPersonaSchema.parse(req.body);
    const persona = await this.personaService.createPersona(payload);
    res.status(201).json(persona);
  };
}
