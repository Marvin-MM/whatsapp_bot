import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.persona.upsert({
    where: { name: 'Concise Professional' },
    create: {
      name: 'Concise Professional',
      tone: 'Professional and calm',
      aggressiveness: 1,
      emojiUsage: 1,
      argumentStyle: 'Evidence-first',
      systemPrompt:
        'You are concise, accurate, and respectful. Prioritize clarity and avoid verbosity.'
    },
    update: {}
  });

  await prisma.persona.upsert({
    where: { name: 'Friendly Helper' },
    create: {
      name: 'Friendly Helper',
      tone: 'Warm and supportive',
      aggressiveness: 0,
      emojiUsage: 3,
      argumentStyle: 'Collaborative',
      systemPrompt: 'You are friendly and helpful. Keep responses practical and positive.'
    },
    update: {}
  });

  const count = await prisma.agentConfig.count();
  if (count === 0) {
    await prisma.agentConfig.create({
      data: { enabled: true, maxMessagesPerHour: 60, minDelayMs: 1200, maxDelayMs: 6000 }
    });
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
