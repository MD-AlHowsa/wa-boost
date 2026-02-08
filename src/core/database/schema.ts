import { Campaign } from '@/types/campaign';
import { Contact } from '@/types/contact';
import { BroadcastMessage } from '@/types/message';

// Re-export types for convenience
export type { Campaign, Contact, BroadcastMessage };

// Analytics event types
export interface AnalyticsEvent {
  id?: string;
  campaignId: string;
  eventType: 'message_sent' | 'message_failed' | 'campaign_started' | 'campaign_completed' | 'campaign_paused';
  timestamp: number;
  metadata: Record<string, any>;
}
