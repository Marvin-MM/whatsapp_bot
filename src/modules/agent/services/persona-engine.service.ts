import { PersonaService } from '../../persona/services/persona.service.js';

export class PersonaEngine {
  constructor(private readonly personaService: PersonaService) {}

  async resolvePrompt(chatWaId: string): Promise<string> {
    const persona = await this.personaService.getPersonaForChat(chatWaId);
    if (!persona) {
      return 'You are a safe and helpful assistant. Avoid risky content and be concise.';
    }

    return `${persona.systemPrompt}\nTone:${persona.tone}\nAggressiveness:${persona.aggressiveness}/10\nEmoji:${persona.emojiUsage}/10\nStyle:${persona.argumentStyle}`;
  }
}
