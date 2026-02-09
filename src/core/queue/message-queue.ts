import { rateLimiter } from '@/background/rate-limiter';
import { campaignRepository } from '@/core/database/repositories/campaign-repository';
import { messageRepository } from '@/core/database/repositories/message-repository';
import { contactRepository } from '@/core/database/repositories/contact-repository';
import { db } from '@/core/database/db';
import { BroadcastMessage, QueueState } from '@/types/message';
import { STORAGE_KEYS } from '@/shared/constants';
// import { delay } from '@/core/utils/delay';
import { MessageType } from '@/shared/message-protocol';

/**
 * Message queue processor
 * Handles broadcast campaign execution with rate limiting and retry logic
 */
export class MessageQueue {
  private isProcessing = false;
  private currentCampaignId?: string;
  private shouldStop = false;

  constructor() {
    this.loadState();
  }

  /**
   * Load queue state from storage
   */
  async loadState(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.QUEUE_STATE);
      const state = result[STORAGE_KEYS.QUEUE_STATE] as QueueState | undefined;

      if (state) {
        this.isProcessing = state.isProcessing;
        this.currentCampaignId = state.currentCampaignId;
      }
    } catch (error) {
      console.error('Failed to load queue state:', error);
    }
  }

  /**
   * Save queue state to storage
   */
  async saveState(): Promise<void> {
    const state: QueueState = {
      id: 'current-queue-state',
      isProcessing: this.isProcessing,
      currentCampaignId: this.currentCampaignId,
      lastProcessedAt: Date.now(),
      messagesProcessedToday: rateLimiter.getStatus().messagesToday,
      dailyResetAt: rateLimiter.getStatus().nextResetTime,
    };

    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.QUEUE_STATE]: state,
      });
    } catch (error) {
      console.error('Failed to save queue state:', error);
    }
  }

  /**
   * Enqueue messages for a campaign
   * @param campaignId - Campaign ID
   * @param contactIds - Array of contact IDs
   */
  async enqueue(campaignId: string, contactIds: string[]): Promise<void> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const messages: Omit<BroadcastMessage, 'id'>[] = [];

    for (let i = 0; i < contactIds.length; i++) {
      const contact = await contactRepository.getById(contactIds[i]);
      if (!contact) continue;

      // Import template service
      const { substituteTemplate } = await import('@/core/utils/template-engine');
      const messageContent = substituteTemplate(campaign.templateMessage, contact);

      messages.push({
        campaignId,
        contactId: contact.id!,
        phone: contact.phone,
        messageContent,
        status: 'pending',
        retryAttempt: 0,
        metadata: {
          queuePriority: i,
        },
      });
    }

    // Bulk insert messages
    await messageRepository.createMany(messages);

    // Update campaign
    await campaignRepository.update(campaignId, {
      totalContacts: contactIds.length,
      pendingCount: contactIds.length,
      sentCount: 0,
      failedCount: 0,
    });

    console.log(`Enqueued ${messages.length} messages for campaign ${campaignId}`);
  }

  /**
   * Start processing a campaign
   * @param campaignId - Campaign ID to process
   */
  async start(campaignId: string): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Queue is already processing. Pause current campaign first.');
    }

    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    this.isProcessing = true;
    this.currentCampaignId = campaignId;
    this.shouldStop = false;

    await campaignRepository.update(campaignId, {
      status: 'active',
      startedAt: Date.now(),
    });

    await this.saveState();

    // Start processing in background
    this.processQueue().catch((error) => {
      console._error('Queue processing _error:', _error);
      this.handleError(error);
    });
  }

  /**
   * Pause current campaign
   */
  async pause(): Promise<void> {
    this.shouldStop = true;
    this.isProcessing = false;

    if (this.currentCampaignId) {
      await campaignRepository.update(this.currentCampaignId, {
        status: 'paused',
      });
    }

    await this.saveState();
    console.log('Campaign paused');
  }

  /**
   * Resume paused campaign
   */
  async resume(): Promise<void> {
    if (!this.currentCampaignId) {
      throw new Error('No campaign to resume');
    }

    const campaign = await campaignRepository.getById(this.currentCampaignId);
    if (!campaign || campaign.status !== 'paused') {
      throw new Error('Campaign cannot be resumed');
    }

    this.isProcessing = true;
    this.shouldStop = false;

    await campaignRepository.update(this.currentCampaignId, {
      status: 'active',
    });

    await this.saveState();

    // Resume processing
    this.processQueue().catch((error) => {
      console._error('Queue processing _error:', _error);
      this.handleError(error);
    });
  }

  /**
   * Stop current campaign
   */
  async stop(): Promise<void> {
    this.shouldStop = true;
    this.isProcessing = false;

    if (this.currentCampaignId) {
      await campaignRepository.update(this.currentCampaignId, {
        status: 'completed',
        completedAt: Date.now(),
      });
    }

    this.currentCampaignId = undefined;
    await this.saveState();
    console.log('Campaign stopped');
  }

  /**
   * Main queue processing loop
   */
  private async processQueue(): Promise<void> {
    if (!this.currentCampaignId) {
      console.error('No campaign ID set');
      return;
    }

    while (this.isProcessing && !this.shouldStop) {
      // Check rate limiter
      if (!rateLimiter.canSend()) {
        console.log('Daily limit reached, pausing campaign');
        await this.pause();
        break;
      }

      // Get next pending message
      const message = await messageRepository.getNextPendingMessage(this.currentCampaignId);

      if (!message) {
        // No more messages, campaign completed
        console.log('Campaign completed - no more messages');
        await this.completeCampaign();
        break;
      }

      // Update message status to queued
      await messageRepository.update(message.id!, { status: 'queued' });

      // Wait for rate limiter
      try {
        await rateLimiter.waitForNextSlot();
      } catch (error) {
        console.error('Rate limiter error:', error);
        await this.pause();
        break;
      }

      // Update to sending
      await messageRepository.update(message.id!, { status: 'sending' });

      // Send message
      try {
        await this.sendMessage(message);
        await this.handleMessageSuccess(message);
      } catch (error) {
        await this.handleMessageFailure(message, error);
      }

      // Notify UI of progress
      await this.notifyProgress();

      // Save state periodically
      await this.saveState();
    }
  }

  /**
   * Send message via content script
   */
  private async sendMessage(message: BroadcastMessage): Promise<void> {
    // Find WhatsApp Web tab
    const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' });

    if (tabs.length === 0) {
      throw new Error('WhatsApp Web is not open. Please open WhatsApp Web in a tab.');
    }

    const tab = tabs[0];
    if (!tab.id) {
      throw new Error('Invalid tab ID');
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MessageType.SEND_MESSAGE,
      payload: {
        phone: message.phone,
        message: message.messageContent,
        messageId: message.id,
      },
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to send message');
    }
  }

  /**
   * Handle successful message send
   */
  private async handleMessageSuccess(message: BroadcastMessage): Promise<void> {
    await messageRepository.markAsSent(message.id!);
    await campaignRepository.incrementSentCount(message.campaignId);
    await contactRepository.updateLastContacted(message.contactId);

    // Track analytics
    await db.analytics.add({
      campaignId: message.campaignId,
      eventType: 'message_sent',
      timestamp: Date.now(),
      metadata: {
        messageId: message.id,
        phone: message.phone,
      },
    });

    console.log(`Message sent successfully to ${message.phone}`);
  }

  /**
   * Handle message send failure
   */
  private async handleMessageFailure(message: BroadcastMessage, _error: any): Promise<void> {
    const _errorMessage = _error instanceof Error ? _error.message : String(_error);

    await messageRepository.markAsFailed(message.id!, errorMessage);

    // If max retries exceeded, increment failed count
    if (message.retryAttempt >= 2) {
      await campaignRepository.incrementFailedCount(message.campaignId);

      await db.analytics.add({
        campaignId: message.campaignId,
        eventType: 'message_failed',
        timestamp: Date.now(),
        metadata: {
          messageId: message.id,
          phone: message.phone,
          error: errorMessage,
          retryAttempt: message.retryAttempt,
        },
      });
    }

    console.error(`Message failed to ${message.phone}:`, errorMessage);
  }

  /**
   * Complete campaign
   */
  private async completeCampaign(): Promise<void> {
    if (!this.currentCampaignId) return;

    await campaignRepository.markAsCompleted(this.currentCampaignId);

    await db.analytics.add({
      campaignId: this.currentCampaignId,
      eventType: 'campaign_completed',
      timestamp: Date.now(),
      metadata: {},
    });

    this.isProcessing = false;
    this.currentCampaignId = undefined;
    await this.saveState();

    console.log('Campaign completed successfully');
  }

  /**
   * Handle queue error
   */
  private async handleError(_error: any): Promise<void> {
    if (!this.currentCampaignId) return;

    await campaignRepository.markAsFailed(this.currentCampaignId);

    this.isProcessing = false;
    await this.saveState();
  }

  /**
   * Notify UI of campaign progress
   */
  private async notifyProgress(): Promise<void> {
    if (!this.currentCampaignId) return;

    const stats = await messageRepository.getStats(this.currentCampaignId);
    const campaign = await campaignRepository.getById(this.currentCampaignId);

    if (!campaign) return;

    // Broadcast progress to all listeners (UI tabs)
    chrome.runtime.sendMessage({
      type: MessageType.CAMPAIGN_PROGRESS,
      payload: {
        campaignId: this.currentCampaignId,
        totalContacts: stats.total,
        sentCount: stats.sent,
        failedCount: stats.failed,
        pendingCount: stats.pending,
        percentComplete: Math.round((stats.sent / stats.total) * 100),
      },
    }).catch(() => {
      // Ignore errors if no listeners
    });
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      currentCampaignId: this.currentCampaignId,
      rateLimiterStatus: rateLimiter.getStatus(),
    };
  }
}

// Export singleton instance
export const messageQueue = new MessageQueue();
