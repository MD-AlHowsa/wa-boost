import { campaignRepository } from '@/core/database/repositories/campaign-repository';
import { contactRepository } from '@/core/database/repositories/contact-repository';
import { messageQueue } from '@/core/queue/message-queue';
import { Campaign, DEFAULT_CAMPAIGN_SETTINGS } from '@/types/campaign';

/**
 * Broadcast controller
 * Manages campaign creation, starting, pausing, and stopping
 */
export class BroadcastController {
  /**
   * Create a new campaign
   */
  async createCampaign(data: {
    name: string;
    templateMessage: string;
    contacts: Array<{
      phone: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      customFields?: Record<string, string>;
    }>;
  }): Promise<Campaign> {
    // Create campaign
    const campaign = await campaignRepository.create({
      name: data.name,
      templateMessage: data.templateMessage,
      status: 'draft',
      totalContacts: 0,
      sentCount: 0,
      failedCount: 0,
      pendingCount: 0,
      settings: DEFAULT_CAMPAIGN_SETTINGS,
    });

    // Create or find contacts
    const contactIds: string[] = [];
    for (const contactData of data.contacts) {
      const contact = await contactRepository.findOrCreate(contactData.phone, {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        customFields: contactData.customFields || {},
        campaignIds: [campaign.id!],
      });

      contactIds.push(contact.id!);

      // Add campaign to existing contact
      if (!contact.campaignIds.includes(campaign.id!)) {
        await contactRepository.addCampaignToContact(contact.id!, campaign.id!);
      }
    }

    // Enqueue messages
    await messageQueue.enqueue(campaign.id!, contactIds);

    console.log(`Campaign created: ${campaign.name} (${contactIds.length} contacts)`);

    return campaign;
  }

  /**
   * Start a campaign
   */
  async startCampaign(campaignId: string): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'active') {
      throw new Error('Campaign is already active');
    }

    if (campaign.status === 'completed') {
      throw new Error('Campaign is already completed');
    }

    await messageQueue.start(campaignId);
    console.log(`Campaign started: ${campaign.name}`);
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(campaignId: string): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'active') {
      throw new Error('Campaign is not active');
    }

    await messageQueue.pause();
    console.log(`Campaign paused: ${campaign.name}`);
  }

  /**
   * Resume a campaign
   */
  async resumeCampaign(campaignId: string): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'paused') {
      throw new Error('Campaign is not paused');
    }

    await messageQueue.resume();
    console.log(`Campaign resumed: ${campaign.name}`);
  }

  /**
   * Stop a campaign
   */
  async stopCampaign(campaignId: string): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    await messageQueue.stop();
    console.log(`Campaign stopped: ${campaign.name}`);
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign | undefined> {
    return await campaignRepository.getById(campaignId);
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    return await campaignRepository.getAll();
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'active') {
      throw new Error('Cannot delete active campaign. Pause it first.');
    }

    await campaignRepository.delete(campaignId);
    console.log(`Campaign deleted: ${campaign.name}`);
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return messageQueue.getStatus();
  }
}

export const broadcastController = new BroadcastController();
