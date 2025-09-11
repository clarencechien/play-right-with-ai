import { Page, Locator } from '@playwright/test';

/**
 * 基礎頁面物件類別
 * 提供所有頁面物件的共用功能
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * 導航到指定路徑
   */
  async navigate(path: string) {
    await this.page.goto(path);
    await this.waitForLoadComplete();
  }

  /**
   * 等待頁面完全載入
   */
  async waitForLoadComplete() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 截圖功能
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * 等待元素出現
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * 檢查元素是否存在
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 取得頁面標題
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * 取得頁面 URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * 執行 JavaScript
   */
  async evaluate<T>(fn: () => T): Promise<T> {
    return await this.page.evaluate(fn);
  }

  /**
   * 等待網路閒置
   */
  async waitForNetwork() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 模擬鍵盤輸入
   */
  async type(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  /**
   * 點擊元素
   */
  async click(selector: string) {
    await this.page.click(selector);
  }

  /**
   * 取得元素文字
   */
  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  /**
   * 檢查元素是否可見
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * 捲動到元素
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * 取得所有符合選擇器的元素數量
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }
}