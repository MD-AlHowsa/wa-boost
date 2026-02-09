/**
 * WhatsApp Web DOM selectors
 * NOTE: These selectors may break when WhatsApp updates their UI
 * Last verified: February 2026
 */

export const SELECTORS = {
  // Main chat elements
  SEARCH_BOX: 'div[contenteditable="true"][data-tab="3"]',
  MESSAGE_BOX: 'div[contenteditable="true"][data-tab="10"]',
  SEND_BUTTON: 'button[data-tab="11"]',
  CHAT_HEADER: 'header._amid',
  MAIN_PANEL: '#main',

  // Message status indicators
  MESSAGE_PENDING: 'span[data-icon="msg-time"]',
  MESSAGE_SENT: 'span[data-icon="msg-check"]',
  MESSAGE_DELIVERED: 'span[data-icon="msg-dblcheck"]',
  MESSAGE_READ: 'span[data-icon="msg-dblcheck-ack"]',

  // Error indicators
  ERROR_ICON: 'span[data-icon="alert-phone"]',
  ERROR_MESSAGE: 'div[data-id="error"]',

  // Loading states
  LOADING_SPINNER: 'div[data-icon="refresh"]',
} as const;

/**
 * Alternative selectors as fallbacks
 */
export const FALLBACK_SELECTORS = {
  MESSAGE_BOX: [
    'div[contenteditable="true"][data-tab="10"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[data-testid="conversation-compose-box-input"]',
  ],
  SEND_BUTTON: [
    'button[data-tab="11"]',
    'button[aria-label="Send"]',
    'span[data-icon="send"]',
  ],
} as const;
