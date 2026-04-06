import { EventEmitter } from 'node:events';
import { DomainEventName } from '../../shared/constants/events.js';

interface EventPayloadMap {
  [key: string]: unknown;
}

export class EventBus {
  private readonly emitter = new EventEmitter();

  public emit<T>(event: DomainEventName, payload: T): void {
    this.emitter.emit(event, payload);
  }

  public on<T>(event: DomainEventName, handler: (payload: T) => void): void {
    this.emitter.on(event, handler as (payload: unknown) => void);
  }
}

export const eventBus = new EventBus();
