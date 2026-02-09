import { messageSender, WhatsAppMessageSender } from './message-sender';
import { MessageType, createResponse } from '@/shared/message-protocol';

/**
 * WhatsApp Web content script injector
 * Listens for messages from service worker and executes actions on WhatsApp Web
 */

console.log('WA Boost content script loaded');

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // Handle SEND_MESSAGE command
  if (message.type === MessageType.SEND_MESSAGE) {
    const { phone, message: messageText, messageId } = message.payload;

    console.log(`Received request to send message to ${phone}`);

    // Send message asynchronously
    messageSender
      .sendMessage(phone, messageText)
      .then(() => {
        console.log(`Message sent successfully to ${phone}`);
        sendResponse(
          createResponse(true, {
            messageId,
            phone,
            sentAt: Date.now(),
          })
        );
      })
      .catch((error) => {
        console.error(`Failed to send message to ${phone}:`, error);
        sendResponse(
          createResponse(false, undefined, error.message, message.requestId)
        );
      });

    // Return true to indicate async response
    return true;
  }

  // Handle other message types
  return false;
});

// Check if WhatsApp Web is ready
WhatsAppMessageSender.isWhatsAppReady().then((isReady) => {
  if (isReady) {
    console.log('WhatsApp Web is ready');
  } else {
    console.log('WhatsApp Web is not ready yet');
  }
});

// Notify service worker that content script is ready
chrome.runtime.sendMessage({
  type: 'CONTENT_SCRIPT_READY',
  payload: {
    url: window.location.href,
    ready: true,
  },
}).catch(() => {
  // Ignore errors if service worker is not ready
});

export {};
