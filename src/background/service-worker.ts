import { messageHandler } from './message-handler';
import { messageQueue } from '@/core/queue/message-queue';
import { rateLimiter } from './rate-limiter';

/**
 * Service Worker - Central hub for WA Boost extension
 */

console.log('WA Boost service worker initialized');

// Initialize components
async function initialize() {
  try {
    // Load rate limiter state
    await rateLimiter.loadState();

    // Load message queue state
    await messageQueue.loadState();

    console.log('Service worker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize service worker:', error);
  }
}

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  initialize();
});

// Initialize on startup
initialize();

// Handle messages from UI and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type);

  // Handle content script ready notification
  if (message.type === 'CONTENT_SCRIPT_READY') {
    console.log('Content script is ready');
    sendResponse({ success: true });
    return false;
  }

  // Route message to handler
  messageHandler
    .handleMessage(message, sender)
    .then((response) => {
      sendResponse(response);
    })
    .catch((error) => {
      console.error('Message handling error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    });

  // Return true to indicate async response
  return true;
});

// Handle extension icon click
chrome.action.onClicked.addListener((_tab) => {
  console.log('Extension icon clicked');
});

// Keep service worker alive (prevents it from going to sleep)
const KEEP_ALIVE_INTERVAL = 20000; // 20 seconds
setInterval(() => {
  console.log('Service worker keepalive ping');
}, KEEP_ALIVE_INTERVAL);

// Export empty object to make this a module
export {};
