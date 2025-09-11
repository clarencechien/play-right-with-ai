import { Page, expect } from '@playwright/test';

/**
 * 測試輔助函數
 */

/**
 * 等待並驗證頁面載入
 */
export async function waitForPageLoad(page: Page, url?: string) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  
  if (url) {
    await expect(page).toHaveURL(url);
  }
}

/**
 * 模擬使用者輸入延遲
 */
export async function typeWithDelay(page: Page, selector: string, text: string, delay = 50) {
  await page.locator(selector).clear();
  await page.locator(selector).type(text, { delay });
}

/**
 * 驗證元素包含文字
 */
export async function expectTextInElement(page: Page, selector: string, text: string) {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}

/**
 * 等待 API 回應
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }
  );
}

/**
 * 模擬網路錯誤
 */
export async function simulateNetworkError(page: Page, urlPattern: string | RegExp) {
  await page.route(urlPattern, route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });
}

/**
 * 模擬慢速網路
 */
export async function simulateSlowNetwork(page: Page, latency = 3000) {
  await page.route('**/*', async route => {
    await new Promise(resolve => setTimeout(resolve, latency));
    await route.continue();
  });
}

/**
 * 取得所有 console 訊息
 */
export function collectConsoleMessages(page: Page): string[] {
  const messages: string[] = [];
  
  page.on('console', msg => {
    messages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  return messages;
}

/**
 * 驗證無障礙性
 */
export async function checkAccessibility(page: Page, selector?: string) {
  const target = selector ? page.locator(selector) : page;
  
  // 檢查 ARIA 屬性
  const ariaLabels = await target.locator('[aria-label]').count();
  const ariaRoles = await target.locator('[role]').count();
  
  return {
    hasAriaLabels: ariaLabels > 0,
    hasAriaRoles: ariaRoles > 0,
    ariaLabelCount: ariaLabels,
    ariaRoleCount: ariaRoles
  };
}

/**
 * 截圖比較
 */
export async function compareScreenshots(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    maxDiffPixels: 100,
    fullPage: true
  });
}

/**
 * 模擬鍵盤快捷鍵
 */
export async function pressShortcut(page: Page, shortcut: string) {
  await page.keyboard.press(shortcut);
}

/**
 * 取得效能指標
 */
export async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      firstContentfulPaint: navigation?.loadEventStart || 0,
      domInteractive: timing.domInteractive - timing.navigationStart,
    };
  });
}

/**
 * 驗證表單驗證
 */
export async function checkFormValidation(page: Page, formSelector: string) {
  const form = page.locator(formSelector);
  const invalidFields = await form.locator(':invalid').count();
  const requiredFields = await form.locator('[required]').count();
  
  return {
    hasInvalidFields: invalidFields > 0,
    invalidFieldCount: invalidFields,
    requiredFieldCount: requiredFields
  };
}

/**
 * 清理測試資料
 */
export async function cleanupTestData(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // 清理 cookies
  const context = page.context();
  await context.clearCookies();
}