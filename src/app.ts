import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { httpLogger } from './infrastructure/http/http-logger.js';
import { adminAuth } from './shared/middleware/auth.js';
import { notFoundHandler } from './shared/middleware/not-found.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { bootstrap } from './bootstrap.js';

export const buildApp = async () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(httpLogger);

  const deps = await bootstrap();

  app.post('/agent/toggle', adminAuth, deps.controlController.toggleAgent);
  app.get('/agent/status', adminAuth, deps.controlController.getStatus);
  app.post('/agent/config', adminAuth, deps.controlController.updateConfig);
  app.get('/logs', adminAuth, (_req, res) => res.status(501).json({ message: 'Use centralized log sink.' }));
  app.post('/persona', adminAuth, deps.personaController.createPersona);
  app.get('/chats', adminAuth, deps.controlController.getChats);
  app.post('/chat/assign', adminAuth, deps.controlController.assignChatPersona);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
