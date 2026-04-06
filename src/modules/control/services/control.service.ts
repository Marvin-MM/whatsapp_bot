import { prisma } from '../../../infrastructure/db/prisma-client.js';
import { updateConfigSchema } from '../dto/control.dto.js';

export class ControlService {
  async getStatus() {
    const config = await this.getConfig();
    return { enabled: config.enabled, config };
  }

  async toggleAgent(enabled: boolean): Promise<void> {
    const current = await this.getConfig();
    await prisma.agentConfig.update({ where: { id: current.id }, data: { enabled } });
  }

  async updateConfig(payload: unknown): Promise<void> {
    const parsed = updateConfigSchema.parse(payload);
    const current = await this.getConfig();
    await prisma.agentConfig.update({ where: { id: current.id }, data: parsed });
  }

  async getChats() {
    return prisma.chat.findMany({ include: { persona: true }, orderBy: { updatedAt: 'desc' }, take: 200 });
  }

  async getConfig() {
    const existing = await prisma.agentConfig.findFirst({ orderBy: { createdAt: 'asc' } });
    if (existing) {
      return existing;
    }
    return prisma.agentConfig.create({ data: { enabled: true } });
  }
}
