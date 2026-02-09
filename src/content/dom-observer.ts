/**
 * DOM Observer utility for waiting for elements to appear
 */

export class DOMObserver {
  /**
   * Wait for an element to appear in the DOM
   * @param selector - CSS selector to wait for
   * @param timeout - Maximum time to wait in milliseconds
   * @returns Promise that resolves with the element
   */
  static async waitForElement(selector: string, timeout: number = 10000): Promise<HTMLElement> {
    const startTime = Date.now();

    // Check if element already exists
    const existingElement = document.querySelector(selector) as HTMLElement;
    if (existingElement) {
      return existingElement;
    }

    // Wait for element to appear
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          observer.disconnect();
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Also set a timeout
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Try multiple selectors and return the first match
   * @param selectors - Array of CSS selectors
   * @param timeout - Maximum time to wait in milliseconds
   * @returns Promise that resolves with the element
   */
  static async waitForAnyElement(
    selectors: string[],
    timeout: number = 10000
  ): Promise<HTMLElement> {
    const promises = selectors.map((selector) =>
      this.waitForElement(selector, timeout).catch(() => null)
    );

    const results = await Promise.race([
      Promise.all(promises),
      new Promise<null[]>((resolve) => setTimeout(() => resolve([]), timeout)),
    ]);

    const element = results.find((el) => el !== null);
    if (element) {
      return element;
    }

    throw new Error(`None of the selectors found within ${timeout}ms`);
  }

  /**
   * Wait for element to disappear
   * @param selector - CSS selector
   * @param timeout - Maximum time to wait
   */
  static async waitForElementToDisappear(
    selector: string,
    timeout: number = 5000
  ): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const element = document.querySelector(selector);
        if (!element) {
          clearInterval(checkInterval);
          resolve();
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Element ${selector} still present after ${timeout}ms`));
        }
      }, 100);
    });
  }
}
