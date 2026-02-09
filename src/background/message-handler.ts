import { MessageType, MessageResponse, createResponse } from '@/shared/message-protocol';
import { broadcastController } from './broadcast-controller';
import { contactRepository } from '@/core/database/repositories/contact-repository';
// import { parseContactsCSV } from '@/core/utils/csv-parser';

/**
 * Message handler for service worker
 * Routes messages from UI to appropriate handlers
 */
export class MessageHandler {
  /**
   * Handle incoming messages
   */
  async handleMessage(message: any, _sender: chrome.runtime.MessageSender): Promise<MessageResponse> {
    try {
      console.log('Received message:', message.type);

      switch (message.type) {
        case MessageType.CREATE_CAMPAIGN:
          return await this.handleCreateCampaign(message.payload);

        case MessageType.START_CAMPAIGN:
          return await this.handleStartCampaign(message.payload);

        case MessageType.PAUSE_CAMPAIGN:
          return await this.handlePauseCampaign(message.payload);

        case MessageType.RESUME_CAMPAIGN:
          return await this.handleResumeCampaign(message.payload);

        case MessageType.STOP_CAMPAIGN:
          return await this.handleStopCampaign(message.payload);

        case MessageType.GET_CAMPAIGN:
          return await this.handleGetCampaign(message.payload);

        case MessageType.GET_ALL_CAMPAIGNS:
          return await this.handleGetAllCampaigns();

        case MessageType.DELETE_CAMPAIGN:
          return await this.handleDeleteCampaign(message.payload);

        case MessageType.IMPORT_CONTACTS:
          return await this.handleImportContacts(message.payload);

        case MessageType.GET_CONTACTS:
          return await this.handleGetContacts();

        case MessageType.QUEUE_STATUS:
          return await this.handleGetQueueStatus();

        default:
          return createResponse(false, undefined, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Message handler error:', error);
      return createResponse(
        false,
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async handleCreateCampaign(payload: any): Promise<MessageResponse> {
    const campaign = await broadcastController.createCampaign(payload);
    return createResponse(true, campaign);
  }

  private async handleStartCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    await broadcastController.startCampaign(payload.campaignId);
    return createResponse(true, { message: 'Campaign started' });
  }

  private async handlePauseCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    await broadcastController.pauseCampaign(payload.campaignId);
    return createResponse(true, { message: 'Campaign paused' });
  }

  private async handleResumeCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    await broadcastController.resumeCampaign(payload.campaignId);
    return createResponse(true, { message: 'Campaign resumed' });
  }

  private async handleStopCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    await broadcastController.stopCampaign(payload.campaignId);
    return createResponse(true, { message: 'Campaign stopped' });
  }

  private async handleGetCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    const campaign = await broadcastController.getCampaign(payload.campaignId);
    return createResponse(true, campaign);
  }

  private async handleGetAllCampaigns(): Promise<MessageResponse> {
    const campaigns = await broadcastController.getAllCampaigns();
    return createResponse(true, campaigns);
  }

  private async handleDeleteCampaign(payload: { campaignId: string }): Promise<MessageResponse> {
    await broadcastController.deleteCampaign(payload.campaignId);
    return createResponse(true, { message: 'Campaign deleted' });
  }

  private async handleImportContacts(_payload: { csvData: string }): Promise<MessageResponse> {
    // This would need to be implemented with file handling
    // For now, return success
    return createResponse(true, { imported: 0, errors: [] });
  }

  private async handleGetContacts(): Promise<MessageResponse> {
    const contacts = await contactRepository.getAll();
    return createResponse(true, contacts);
  }

  private async handleGetQueueStatus(): Promise<MessageResponse> {
    const status = broadcastController.getQueueStatus();
    return createResponse(true, status);
  }
}

export const messageHandler = new MessageHandler();
