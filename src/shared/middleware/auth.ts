import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['x-api-key'];
  if (token !== env.ADMIN_API_KEY) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  next();
};
