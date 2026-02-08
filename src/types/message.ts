export interface BroadcastMessage {
  id: string; // UUID
  campaignId: string;
  contactId: string;
  phone: string; // Denormalized for quick lookup
  messageContent: string; // After template substitution
  status: 'pending' | 'queued' | 'sending' | 'sent' | 'failed' | 'skipped';
  retryAttempt: number;
  scheduledAt?: number;
  sentAt?: number;
  failedAt?: number;
  error?: string;
  whatsappMessageId?: string; // From WhatsApp Web
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  queuePriority: number;
  processingStartedAt?: number;
  processingCompletedAt?: number;
}

export interface QueueState {
  id: string; // 'current-queue-state'
  isProcessing: boolean;
  currentCampaignId?: string;
  currentMessageId?: string;
  lastProcessedAt?: number;
  messagesProcessedToday: number;
  dailyResetAt: number;
}
