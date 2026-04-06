import { prisma } from '../../../infrastructure/db/prisma-client.js';
import { CreatePersonaDto } from '../dto/persona.dto.js';

export class PersonaRepository {
  async createPersona(input: CreatePersonaDto) {
    return prisma.persona.create({ data: input });
  }

  async getPersonaByChatWaId(chatWaId: string) {
    return prisma.chat.findUnique({ where: { waChatId: chatWaId }, include: { persona: true } });
  }

  async assignPersona(chatWaId: string, personaId: string): Promise<void> {
    await prisma.chat.upsert({
      where: { waChatId: chatWaId },
      create: { waChatId: chatWaId, personaId },
      update: { personaId }
    });
  }
}
