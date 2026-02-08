export interface Campaign {
  id: string; // UUID
  name: string;
  templateMessage: string; // "Hi {{firstName}}, ..."
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  settings: CampaignSettings;
}

export interface CampaignSettings {
  delayBetweenMessages: number; // milliseconds (2000-3000 for moderate)
  randomDelayRange: [number, number]; // [min, max] for randomization
  maxRetries: number; // default: 3
  retryDelay: number; // milliseconds for exponential backoff base
}

export const DEFAULT_CAMPAIGN_SETTINGS: CampaignSettings = {
  delayBetweenMessages: 2500,
  randomDelayRange: [2000, 3000],
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds base delay
};
