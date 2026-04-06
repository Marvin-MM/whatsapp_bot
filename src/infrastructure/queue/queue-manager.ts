import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { redisClient } from '../cache/redis-client.js';

export const queueConnection = redisClient.duplicate();

export class QueueManager<T = unknown> {
  constructor(public readonly name: string) {}

  private queue = new Queue<T>(this.name, { connection: queueConnection });
  private events = new QueueEvents(this.name, { connection: queueConnection });

  public async addJob(name: string, data: T, opts?: JobsOptions): Promise<void> {
    await this.queue.add(name, data, opts);
  }

  public createWorker(processor: (data: T) => Promise<void>): Worker<T> {
    return new Worker<T>(
      this.name,
      async job => {
        await processor(job.data);
      },
      { connection: queueConnection }
    );
  }

  public get eventsListener(): QueueEvents {
    return this.events;
  }
}
