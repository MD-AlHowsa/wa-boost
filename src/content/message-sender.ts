import { SELECTORS, FALLBACK_SELECTORS } from './selectors';
import { DOMObserver } from './dom-observer';

/**
 * WhatsApp Web message sender
 * Handles DOM manipulation to send messages through WhatsApp Web
 */
export class WhatsAppMessageSender {
  /**
   * Send a message to a phone number
   * @param phone - Phone number in E.164 format
   * @param message - Message to send
   * @returns Promise that resolves when message is sent
   */
  async sendMessage(phone: string, message: string): Promise<void> {
    try {
      // Step 1: Navigate to chat
      await this.openChat(phone);

      // Step 2: Wait for chat to load
      await this.waitForChatToLoad();

      // Step 3: Type and send message
      await this.typeAndSendMessage(message);

      // Step 4: Verify message was sent
      await this.verifyMessageSent();
    } catch (error) {
      throw new Error(
        `Failed to send message to ${phone}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Open chat with a phone number
   */
  private async openChat(phone: string): Promise<void> {
    // Format phone number (remove + and spaces)
    const formattedPhone = phone.replace(/[^0-9]/g, '');

    // Navigate to chat URL
    const chatUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}`;
    window.location.href = chatUrl;

    console.log(`Opening chat with ${phone}`);
  }

  /**
   * Wait for chat to load
   */
  private async waitForChatToLoad(): Promise<void> {
    // Wait for main panel to appear
    await DOMObserver.waitForElement(SELECTORS.MAIN_PANEL, 15000);

    // Wait for message box with fallback selectors
    await DOMObserver.waitForAnyElement([...FALLBACK_SELECTORS.MESSAGE_BOX], 15000);

    // Additional delay to ensure everything is loaded
    await this.delay(1000);

    console.log('Chat loaded successfully');
  }

  /**
   * Type and send a message
   */
  private async typeAndSendMessage(message: string): Promise<void> {
    // Find message box
    const messageBox = await this.findMessageBox();
    if (!messageBox) {
      throw new Error('Message box not found');
    }

    // Focus on message box
    messageBox.focus();
    await this.delay(300);

    // Type message character by character (human-like)
    await this.typeMessage(messageBox, message);

    // Wait a bit before sending
    await this.delay(500);

    // Find and click send button
    await this.clickSendButton();

    console.log('Message typed and sent');
  }

  /**
   * Find message box element
   */
  private async findMessageBox(): Promise<HTMLElement | null> {
    // Try primary selector
    let messageBox = document.querySelector(SELECTORS.MESSAGE_BOX) as HTMLElement;

    if (!messageBox) {
      // Try fallback selectors
      for (const selector of [...FALLBACK_SELECTORS.MESSAGE_BOX]) {
        messageBox = document.querySelector(selector) as HTMLElement;
        if (messageBox) break;
      }
    }

    return messageBox;
  }

  /**
   * Type message character by character with human-like delays
   */
  private async typeMessage(element: HTMLElement, message: string): Promise<void> {
    const lines = message.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Type each character
      for (const char of line) {
        // Insert text using document.execCommand (works with WhatsApp Web)
        document.execCommand('insertText', false, char);

        // Random delay between characters (50-150ms)
        await this.delay(50 + Math.random() * 100);
      }

      // Add newline if not last line
      if (i < lines.length - 1) {
        document.execCommand('insertText', false, '\n');
        await this.delay(100);
      }
    }

    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Click send button
   */
  private async clickSendButton(): Promise<void> {
    // Try primary selector
    let sendButton = document.querySelector(SELECTORS.SEND_BUTTON) as HTMLElement;

    if (!sendButton) {
      // Try fallback selectors
      for (const selector of [...FALLBACK_SELECTORS.SEND_BUTTON]) {
        sendButton = document.querySelector(selector) as HTMLElement;
        if (sendButton) break;
      }
    }

    if (!sendButton) {
      throw new Error('Send button not found');
    }

    sendButton.click();
    await this.delay(500);
  }

  /**
   * Verify message was sent successfully
   */
  private async verifyMessageSent(): Promise<void> {
    // Wait a bit for message to be processed
    await this.delay(2000);

    // Check for error icon
    const errorIcon = document.querySelector(SELECTORS.ERROR_ICON);
    if (errorIcon) {
      throw new Error('Message failed to send (error icon detected - phone may be invalid)');
    }

    // Check for sent indicator (checkmark)
    const sentIcon = document.querySelector(SELECTORS.MESSAGE_SENT);
    if (!sentIcon) {
      // Message might still be sending, wait a bit more
      await this.delay(2000);

      const sentIconRetry = document.querySelector(SELECTORS.MESSAGE_SENT);
      if (!sentIconRetry) {
        throw new Error('Message status unclear (no confirmation received)');
      }
    }

    console.log('Message verified as sent');
  }

  /**
   * Simple delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if WhatsApp Web is ready
   */
  static async isWhatsAppReady(): Promise<boolean> {
    try {
      // Check if we're on WhatsApp Web
      if (!window.location.href.includes('web.whatsapp.com')) {
        return false;
      }

      // Check if main elements are present
      const mainPanel = document.querySelector(SELECTORS.MAIN_PANEL);
      return mainPanel !== null;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const messageSender = new WhatsAppMessageSender();
