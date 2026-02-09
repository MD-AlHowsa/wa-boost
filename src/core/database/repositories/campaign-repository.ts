import { db } from '../db';
import { Campaign } from '@/types/campaign';
import { v4 as uuidv4 } from 'uuid';

export class CampaignRepository {
  async create(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const newCampaign: Campaign = {
      ...campaign,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.campaigns.add(newCampaign);
    return newCampaign;
  }

  async getById(id: string): Promise<Campaign | undefined> {
    return await db.campaigns.get(id);
  }

  async getAll(): Promise<Campaign[]> {
    return await db.campaigns.orderBy('createdAt').reverse().toArray();
  }

  async getByStatus(status: Campaign['status']): Promise<Campaign[]> {
    return await db.campaigns.where('status').equals(status).toArray();
  }

  async update(id: string, updates: Partial<Campaign>): Promise<void> {
    await db.campaigns.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await db.campaigns.delete(id);
  }

  async getActiveCampaign(): Promise<Campaign | undefined> {
    return await db.campaigns.where('status').equals('active').first();
  }

  async incrementSentCount(id: string): Promise<void> {
    const campaign = await this.getById(id);
    if (campaign) {
      await this.update(id, {
        sentCount: campaign.sentCount + 1,
        pendingCount: campaign.pendingCount - 1,
      });
    }
  }

  async incrementFailedCount(id: string): Promise<void> {
    const campaign = await this.getById(id);
    if (campaign) {
      await this.update(id, {
        failedCount: campaign.failedCount + 1,
        pendingCount: campaign.pendingCount - 1,
      });
    }
  }

  async markAsCompleted(id: string): Promise<void> {
    await this.update(id, {
      status: 'completed',
      completedAt: Date.now(),
    });
  }

  async markAsFailed(id: string, _error?: string): Promise<void> {
    await this.update(id, {
      status: 'failed',
      completedAt: Date.now(),
    });
  }
}

export const campaignRepository = new CampaignRepository();
