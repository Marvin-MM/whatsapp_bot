export type NormalizedMessage = {
  waMessageId: string;
  chatWaId: string;
  senderWaId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'UNKNOWN';
  timestamp: string;
  isGroup: boolean;
};

export type StoredMessageInput = {
  waMessageId: string;
  chatWaId: string;
  senderWaId: string;
  content: string;
  direction: 'INCOMING' | 'OUTGOING';
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'UNKNOWN';
  metadata?: Record<string, unknown>;
};
