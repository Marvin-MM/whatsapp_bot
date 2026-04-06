import { openaiClient } from '../../../infrastructure/llm/openai-client.js';
import { env } from '../../../config/env.js';
import { AgentDecision } from '../types/agent.types.js';

export class DecisionEngine {
  async decide(input: {
    message: string;
    context: string[];
    personaPrompt: string;
    rules: string;
  }): Promise<AgentDecision> {
    const completion = await openaiClient.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${input.personaPrompt}\nRules:${input.rules}` },
        { role: 'user', content: `Context:\n${input.context.join('\n')}\nIncoming:${input.message}` }
      ]
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return { action: 'IGNORE', content: '', confidence: 0.2, reason: 'Empty model output' };
    }

    const parsed = JSON.parse(raw) as AgentDecision;
    return {
      action: parsed.action,
      content: parsed.content,
      confidence: parsed.confidence,
      reason: parsed.reason ?? 'Model decision'
    };
  }
}
