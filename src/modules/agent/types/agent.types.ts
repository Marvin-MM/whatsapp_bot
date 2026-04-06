export type AgentAction = 'SEND_MESSAGE' | 'IGNORE' | 'WAIT' | 'ESCALATE';

export interface AgentDecision {
  action: AgentAction;
  content: string;
  confidence: number;
  reason: string;
}
