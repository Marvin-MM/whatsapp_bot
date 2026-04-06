import pinoHttp from 'pino-http';
import { logger } from '../logger/pino-logger.js';
import { createCorrelationId } from '../../shared/utils/correlation.js';

export const httpLogger = pinoHttp({
  logger,
  genReqId: req => (req.headers['x-correlation-id'] as string) || createCorrelationId(),
  customProps: req => ({ correlationId: req.id })
});
