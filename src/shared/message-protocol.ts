// Message types for communication between UI, Service Worker, and Content Script

export enum MessageType {
  // Campaign operations
  CREATE_CAMPAIGN = 'CREATE_CAMPAIGN',
  UPDATE_CAMPAIGN = 'UPDATE_CAMPAIGN',
  DELETE_CAMPAIGN = 'DELETE_CAMPAIGN',
  START_CAMPAIGN = 'START_CAMPAIGN',
  PAUSE_CAMPAIGN = 'PAUSE_CAMPAIGN',
  RESUME_CAMPAIGN = 'RESUME_CAMPAIGN',
  STOP_CAMPAIGN = 'STOP_CAMPAIGN',
  GET_CAMPAIGN = 'GET_CAMPAIGN',
  GET_ALL_CAMPAIGNS = 'GET_ALL_CAMPAIGNS',

  // Contact operations
  IMPORT_CONTACTS = 'IMPORT_CONTACTS',
  GET_CONTACTS = 'GET_CONTACTS',
  DELETE_CONTACT = 'DELETE_CONTACT',

  // Message operations
  SEND_MESSAGE = 'SEND_MESSAGE',
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_FAILED = 'MESSAGE_FAILED',
  GET_MESSAGES = 'GET_MESSAGES',

  // Status updates
  CAMPAIGN_PROGRESS = 'CAMPAIGN_PROGRESS',
  QUEUE_STATUS = 'QUEUE_STATUS',

  // Analytics
  GET_ANALYTICS = 'GET_ANALYTICS',
  TRACK_EVENT = 'TRACK_EVENT',
}

export interface Message<T = any> {
  type: MessageType;
  payload: T;
  requestId?: string;
  timestamp: number;
}

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

// Payload types for each message type
export interface CreateCampaignPayload {
  name: string;
  templateMessage: string;
  contacts: Array<{
    phone: string;
    firstName?: string;
    lastName?: string;
    customFields?: Record<string, string>;
  }>;
}

export interface SendMessagePayload {
  phone: string;
  message: string;
  messageId: string;
}

export interface CampaignProgressPayload {
  campaignId: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  percentComplete: number;
}

// Helper function to create messages
export function createMessage<T>(type: MessageType, payload: T): Message<T> {
  return {
    type,
    payload,
    requestId: crypto.randomUUID(),
    timestamp: Date.now(),
  };
}

// Helper function to create responses
export function createResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  requestId?: string
): MessageResponse<T> {
  return {
    success,
    data,
    error,
    requestId,
  };
}
