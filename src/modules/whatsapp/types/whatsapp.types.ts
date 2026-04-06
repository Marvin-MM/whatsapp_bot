export interface IncomingWhatsAppEvent {
  waMessageId: string;
  chatWaId: string;
  senderWaId: string;
  content: string;
  timestamp: number;
}
