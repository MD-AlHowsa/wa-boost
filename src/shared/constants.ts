// Rate limiting configuration (Moderate profile)
export const RATE_LIMIT = {
  MIN_DELAY_MS: 2000, // 2 seconds
  MAX_DELAY_MS: 3000, // 3 seconds
  MESSAGES_PER_HOUR: 60,
  MAX_MESSAGES_PER_DAY: 1000,
  SLIDING_WINDOW_MS: 3600000, // 1 hour in milliseconds
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 5000, // 5 seconds
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
  MAX_DELAY_MS: 60000, // 1 minute
} as const;

// WhatsApp Web selectors (NOTE: These may break when WhatsApp updates)
export const WHATSAPP_SELECTORS = {
  SEARCH_BOX: 'div[contenteditable="true"][data-tab="3"]',
  MESSAGE_BOX: 'div[contenteditable="true"][data-tab="10"]',
  SEND_BUTTON: 'button[data-tab="11"]',
  CHAT_HEADER: 'header._amid',
  MESSAGE_PENDING: 'span[data-icon="msg-time"]',
  MESSAGE_SENT: 'span[data-icon="msg-check"]',
  MESSAGE_DELIVERED: 'span[data-icon="msg-dblcheck"]',
  MESSAGE_READ: 'span[data-icon="msg-dblcheck-ack"]',
  ERROR_ICON: 'span[data-icon="alert-phone"]',
} as const;

// Database names
export const DB_NAME = 'WhatsAppBroadcastDB';
export const DB_VERSION = 1;

// Storage keys
export const STORAGE_KEYS = {
  QUEUE_STATE: 'queue_state',
  RATE_LIMITER_STATE: 'rate_limiter_state',
  USER_SETTINGS: 'user_settings',
} as const;

// Message status
export const MESSAGE_STATUS = {
  PENDING: 'pending',
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

// Campaign status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
