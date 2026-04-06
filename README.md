# Autonomous WhatsApp AI Agent Backend

Production-grade modular monolith backend using Node.js, TypeScript, Express, Baileys, Redis, BullMQ, Prisma, and PostgreSQL.

## Quick start

1. Copy `.env.example` to `.env` and fill secrets.
2. Install dependencies: `npm install`.
3. Generate prisma client: `npm run prisma:generate`.
4. Run migrations: `npm run prisma:migrate`.
5. Seed personas: `npm run prisma:seed`.
6. Start service: `npm run dev`.

## Core flow

Incoming WhatsApp message -> message-processing queue -> agent-decision queue -> message-send queue.

Agent returns actions (`SEND_MESSAGE`, `IGNORE`, `WAIT`, `ESCALATE`); execution is handled by queue workers, never directly by LLM output.
