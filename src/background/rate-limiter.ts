import { RATE_LIMIT, STORAGE_KEYS } from '@/shared/constants';
import { delay } from '@/core/utils/delay';

interface RateLimiterState {
  messageTimestamps: number[]; // Timestamps of recent messages (for hourly limit)
  dailyCount: number; // Messages sent today
  dailyResetTime: number; // Next midnight timestamp
}

/**
 * Rate limiter to prevent WhatsApp bans
 * Enforces both hourly and daily message limits with random delays
 */
export class RateLimiter {
  private messageTimestamps: number[] = [];
  private dailyCount: number = 0;
  private dailyResetTime: number;

  constructor() {
    this.dailyResetTime = this.getNextMidnight();
    this.loadState();
  }

  /**
   * Initialize the rate limiter by loading persisted state
   */
  async loadState(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.RATE_LIMITER_STATE);
      const state = result[STORAGE_KEYS.RATE_LIMITER_STATE] as RateLimiterState | undefined;

      if (state) {
        this.messageTimestamps = state.messageTimestamps || [];
        this.dailyCount = state.dailyCount || 0;
        this.dailyResetTime = state.dailyResetTime || this.getNextMidnight();

        // Clean up old timestamps
        this.cleanupTimestamps();
        this.resetDailyCountIfNeeded();
      }
    } catch (error) {
      console.error('Failed to load rate limiter state:', error);
    }
  }

  /**
   * Save current state to chrome.storage.local
   */
  async saveState(): Promise<void> {
    const state: RateLimiterState = {
      messageTimestamps: this.messageTimestamps,
      dailyCount: this.dailyCount,
      dailyResetTime: this.dailyResetTime,
    };

    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.RATE_LIMITER_STATE]: state,
      });
    } catch (error) {
      console.error('Failed to save rate limiter state:', error);
    }
  }

  /**
   * Check if we can send a message (within daily limit)
   * @returns True if within daily limit, false otherwise
   */
  canSend(): boolean {
    this.resetDailyCountIfNeeded();
    return this.dailyCount < RATE_LIMIT.MAX_MESSAGES_PER_DAY;
  }

  /**
   * Wait for the next available slot to send a message
   * Enforces both hourly and daily limits with random delays
   */
  async waitForNextSlot(): Promise<void> {
    // Reset daily count if needed
    this.resetDailyCountIfNeeded();

    // Check daily limit
    if (!this.canSend()) {
      throw new Error(
        `Daily limit of ${RATE_LIMIT.MAX_MESSAGES_PER_DAY} messages reached. Try again tomorrow.`
      );
    }

    // Clean up old timestamps (older than 1 hour)
    this.cleanupTimestamps();

    // Check hourly limit
    if (this.messageTimestamps.length >= RATE_LIMIT.MESSAGES_PER_HOUR) {
      const oldestTimestamp = this.messageTimestamps[0];
      const timeSinceOldest = Date.now() - oldestTimestamp;
      const waitTime = RATE_LIMIT.SLIDING_WINDOW_MS - timeSinceOldest;

      if (waitTime > 0) {
        console.log(
          `Hourly limit reached. Waiting ${Math.ceil(waitTime / 1000)} seconds...`
        );
        await delay(waitTime);
      }

      // Clean up again after waiting
      this.cleanupTimestamps();
    }

    // Enforce minimum delay from last message
    const lastTimestamp = this.messageTimestamps[this.messageTimestamps.length - 1];
    if (lastTimestamp) {
      const timeSinceLast = Date.now() - lastTimestamp;
      if (timeSinceLast < RATE_LIMIT.MIN_DELAY_MS) {
        const waitTime = RATE_LIMIT.MIN_DELAY_MS - timeSinceLast;
        await delay(waitTime);
      }
    }

    // Apply random delay for human-like behavior
    const randomDelayMs =
      Math.random() * (RATE_LIMIT.MAX_DELAY_MS - RATE_LIMIT.MIN_DELAY_MS) +
      RATE_LIMIT.MIN_DELAY_MS;
    await delay(randomDelayMs);

    // Record this message
    this.messageTimestamps.push(Date.now());
    this.dailyCount++;

    // Save state
    await this.saveState();
  }

  /**
   * Remove timestamps older than 1 hour
   */
  private cleanupTimestamps(): void {
    const oneHourAgo = Date.now() - RATE_LIMIT.SLIDING_WINDOW_MS;
    this.messageTimestamps = this.messageTimestamps.filter((ts) => ts > oneHourAgo);
  }

  /**
   * Reset daily count if it's a new day
   */
  private resetDailyCountIfNeeded(): void {
    if (Date.now() >= this.dailyResetTime) {
      this.dailyCount = 0;
      this.dailyResetTime = this.getNextMidnight();
      this.messageTimestamps = []; // Also clear hourly timestamps
      this.saveState();
    }
  }

  /**
   * Get timestamp for next midnight (local time)
   */
  private getNextMidnight(): number {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    return midnight.getTime();
  }

  /**
   * Get current rate limiter status
   */
  getStatus(): {
    messagesInLastHour: number;
    messagesToday: number;
    dailyLimitRemaining: number;
    hourlyLimitRemaining: number;
    nextResetTime: number;
  } {
    this.cleanupTimestamps();
    this.resetDailyCountIfNeeded();

    return {
      messagesInLastHour: this.messageTimestamps.length,
      messagesToday: this.dailyCount,
      dailyLimitRemaining: RATE_LIMIT.MAX_MESSAGES_PER_DAY - this.dailyCount,
      hourlyLimitRemaining: RATE_LIMIT.MESSAGES_PER_HOUR - this.messageTimestamps.length,
      nextResetTime: this.dailyResetTime,
    };
  }

  /**
   * Reset rate limiter (for testing or manual reset)
   */
  async reset(): Promise<void> {
    this.messageTimestamps = [];
    this.dailyCount = 0;
    this.dailyResetTime = this.getNextMidnight();
    await this.saveState();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
