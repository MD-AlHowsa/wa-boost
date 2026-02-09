import { RETRY_CONFIG } from '@/shared/constants';
import { delay } from '@/core/utils/delay';

/**
 * Retry handler with exponential backoff
 */
export class RetryHandler {
  /**
   * Execute a function with retry logic
   * @param fn - Async function to execute
   * @param context - Context description for logging
   * @returns Result of the function
   */
  async execute<T>(fn: () => Promise<T>, context: string = 'Operation'): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryable(lastError)) {
          throw lastError;
        }

        // Don't delay on last attempt
        if (attempt < RETRY_CONFIG.MAX_ATTEMPTS - 1) {
          const delayMs = this.calculateBackoff(attempt);
          console.log(
            `${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.MAX_ATTEMPTS}). ` +
              `Retrying in ${delayMs}ms...`,
            lastError.message
          );
          await delay(delayMs);
        }
      }
    }

    throw new Error(
      `${context} failed after ${RETRY_CONFIG.MAX_ATTEMPTS} attempts: ${lastError?.message}`
    );
  }

  /**
   * Calculate exponential backoff delay
   * @param attempt - Current attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  private calculateBackoff(attempt: number): number {
    const exponentialDelay =
      RETRY_CONFIG.BASE_DELAY_MS *
      Math.pow(RETRY_CONFIG.EXPONENTIAL_BACKOFF_MULTIPLIER, attempt);
    return Math.min(exponentialDelay, RETRY_CONFIG.MAX_DELAY_MS);
  }

  /**
   * Determine if an error is retryable
   * @param error - Error to check
   * @returns True if error is retryable
   */
  private isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Non-retryable errors
    const nonRetryablePatterns = [
      'invalid phone',
      'invalid number',
      'account banned',
      'account suspended',
      'blocked',
      'not found',
      'unauthorized',
    ];

    for (const pattern of nonRetryablePatterns) {
      if (message.includes(pattern)) {
        return false;
      }
    }

    // All other errors are retryable (network issues, temporary failures, etc.)
    return true;
  }
}

export const retryHandler = new RetryHandler();
