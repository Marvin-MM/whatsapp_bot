import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../infrastructure/logger/pino-logger.js';
import { AppError } from '../errors/app-error.js';

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed', issues: error.flatten() });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message, code: error.code });
    return;
  }

  logger.error({ err: error, path: req.path }, 'Unhandled error');
  res.status(500).json({ message: 'Internal server error' });
};
