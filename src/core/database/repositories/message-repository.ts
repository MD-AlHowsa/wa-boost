import { db } from '../db';
import { BroadcastMessage } from '@/types/message';
import { v4 as uuidv4 } from 'uuid';

export class MessageRepository {
  async create(message: Omit<BroadcastMessage, 'id'>): Promise<BroadcastMessage> {
    const newMessage: BroadcastMessage = {
      ...message,
      id: uuidv4(),
    };

    await db.messages.add(newMessage);
    return newMessage;
  }

  async createMany(messages: Array<Omit<BroadcastMessage, 'id'>>): Promise<BroadcastMessage[]> {
    const newMessages: BroadcastMessage[] = messages.map((message) => ({
      ...message,
      id: uuidv4(),
    }));

    await db.messages.bulkAdd(newMessages);
    return newMessages;
  }

  async getById(id: string): Promise<BroadcastMessage | undefined> {
    return await db.messages.get(id);
  }

  async getByCampaign(campaignId: string): Promise<BroadcastMessage[]> {
    return await db.messages.where('campaignId').equals(campaignId).toArray();
  }

  async getByCampaignAndStatus(
    campaignId: string,
    status: BroadcastMessage['status']
  ): Promise<BroadcastMessage[]> {
    return await db.messages.where('[campaignId+status]').equals([campaignId, status]).toArray();
  }

  async getNextPendingMessage(campaignId: string): Promise<BroadcastMessage | undefined> {
    return await db.messages
      .where('[campaignId+status]')
      .equals([campaignId, 'pending'])
      .first();
  }

  async update(id: string, updates: Partial<BroadcastMessage>): Promise<void> {
    await db.messages.update(id, updates);
  }

  async delete(id: string): Promise<void> {
    await db.messages.delete(id);
  }

  async deleteByCampaign(campaignId: string): Promise<void> {
    await db.messages.where('campaignId').equals(campaignId).delete();
  }

  async markAsSent(id: string, whatsappMessageId?: string): Promise<void> {
    await this.update(id, {
      status: 'sent',
      sentAt: Date.now(),
      whatsappMessageId,
    });
  }

  async markAsFailed(id: string, error: string): Promise<void> {
    const message = await this.getById(id);
    if (message) {
      await this.update(id, {
        status: message.retryAttempt >= 2 ? 'failed' : 'pending',
        retryAttempt: message.retryAttempt + 1,
        failedAt: Date.now(),
        error,
      });
    }
  }

  async getStats(campaignId: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
  }> {
    const messages = await this.getByCampaign(campaignId);
    return {
      total: messages.length,
      sent: messages.filter((m) => m.status === 'sent').length,
      failed: messages.filter((m) => m.status === 'failed').length,
      pending: messages.filter((m) => m.status === 'pending').length,
    };
  }
}

export const messageRepository = new MessageRepository();
