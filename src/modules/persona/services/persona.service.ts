import { AppError } from '../../../shared/errors/app-error.js';
import { CreatePersonaDto } from '../dto/persona.dto.js';
import { PersonaRepository } from '../repositories/persona.repository.js';

export class PersonaService {
  constructor(private readonly personaRepository: PersonaRepository) {}

  async createPersona(input: CreatePersonaDto) {
    return this.personaRepository.createPersona(input);
  }

  async getPersonaForChat(chatWaId: string) {
    const chat = await this.personaRepository.getPersonaByChatWaId(chatWaId);
    return chat?.persona ?? null;
  }

  async assignPersona(chatWaId: string, personaId: string): Promise<void> {
    const assigned = await this.personaRepository.assignPersona(chatWaId, personaId);
    if (!assigned) {
      throw new AppError('Failed to assign persona', 500, 'PERSONA_ASSIGN_FAILED');
    }
  }
}
