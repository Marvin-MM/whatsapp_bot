export const DomainEvents = {
  MessageReceived: 'message.received',
  MessagePersisted: 'message.persisted',
  AgentDecisionRequested: 'agent.decision.requested',
  AgentDecisionCompleted: 'agent.decision.completed',
  MessageSendRequested: 'message.send.requested',
  MessageSent: 'message.sent',
  GroupJoined: 'group.joined'
} as const;

export type DomainEventName = (typeof DomainEvents)[keyof typeof DomainEvents];
