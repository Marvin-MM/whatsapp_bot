import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './infrastructure/logger/pino-logger.js';

async function start(): Promise<void> {
  const app = await buildApp();
  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

void start();
