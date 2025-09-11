// 視覺回歸測試完整實作範例
// Visual Regression Testing Complete Implementation

const { test, expect, devices } = require('@playwright/test');
const path = require('path');
const fs = require('fs').promises;

test.describe('視覺回歸測試套件', () => {
  // 測試配置
  test.use({
    // 視覺測試的特定配置
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    }
  });

  // 基準圖片目錄
  const baselineDir = path.join(__dirname, 'visual-baselines');
  const diffDir = path.join(__dirname, 'visual-diffs');

  test.beforeAll(async () => {
    // 確保目錄存在
    await fs.mkdir(baselineDir, { recursive: true });
    await fs.mkdir(diffDir, { recursive: true });
  });

  test('首頁完整視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 等待所有圖片載入
    await page.waitForLoadState('networkidle');
    
    // 禁用動畫以獲得穩定的快照
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    // 等待任何延遲載入的內容
    await page.waitForTimeout(1000);
    
    // 捕獲全頁面截圖
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('[data-testid="timestamp"]')], // 遮罩動態內容
      maxDiffPixels: 100,
      threshold: 0.2
    });
  });

  test('響應式設計視覺測試', async ({ browser }) => {
    const viewports = [
      { name: 'iphone-12', device: devices['iPhone 12'] },
      { name: 'ipad-air', device: devices['iPad Air'] },
      { name: 'desktop-1080p', device: { viewport: { width: 1920, height: 1080 } } },
      { name: 'desktop-4k', device: { viewport: { width: 3840, height: 2160 } } }
    ];
    
    for (const { name, device } of viewports) {
      const context = await browser.newContext(device);
      const page = await context.newPage();
      
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // 禁用動畫
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        `
      });
      
      // 為每個視窗大小捕獲截圖
      await expect(page).toHaveScreenshot(`responsive-${name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
      
      // 測試導航選單在不同裝置上的顯示
      if (name.includes('iphone') || name.includes('ipad')) {
        // 移動裝置應該顯示漢堡選單
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        
        // 點擊漢堡選單
        await page.click('[data-testid="mobile-menu"]');
        await page.waitForTimeout(300); // 等待選單動畫
        
        await expect(page).toHaveScreenshot(`responsive-${name}-menu-open.png`, {
          animations: 'disabled'
        });
      } else {
        // 桌面裝置應該顯示完整導航
        await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
      }
      
      await context.close();
    }
  });

  test('元件狀態視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000/components');
    
    // 測試按鈕的各種狀態
    const button = page.locator('[data-testid="primary-button"]');
    
    // 正常狀態
    await expect(button).toHaveScreenshot('button-normal.png');
    
    // Hover 狀態
    await button.hover();
    await page.waitForTimeout(100);
    await expect(button).toHaveScreenshot('button-hover.png');
    
    // Focus 狀態
    await button.focus();
    await expect(button).toHaveScreenshot('button-focus.png');
    
    // Active (按下) 狀態
    await page.mouse.move(100, 100); // 移動滑鼠到按鈕位置
    await page.mouse.down();
    await expect(button).toHaveScreenshot('button-active.png');
    await page.mouse.up();
    
    // Disabled 狀態
    await page.evaluate(() => {
      document.querySelector('[data-testid="primary-button"]').disabled = true;
    });
    await expect(button).toHaveScreenshot('button-disabled.png');
  });

  test('表單視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000/form');
    
    // 空表單狀態
    await expect(page.locator('form')).toHaveScreenshot('form-empty.png');
    
    // 填寫部分欄位
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'test@example.com');
    await expect(page.locator('form')).toHaveScreenshot('form-partial.png');
    
    // 驗證錯誤狀態
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('[type="submit"]');
    await page.waitForSelector('.error-message');
    await expect(page.locator('form')).toHaveScreenshot('form-error.png');
    
    // 成功提交狀態
    await page.fill('[name="email"]', 'valid@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('[type="submit"]');
    await page.waitForSelector('.success-message');
    await expect(page.locator('form')).toHaveScreenshot('form-success.png');
  });

  test('深色模式視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 淺色模式截圖
    await expect(page).toHaveScreenshot('theme-light.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 切換到深色模式
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500); // 等待主題切換動畫
    
    // 深色模式截圖
    await expect(page).toHaveScreenshot('theme-dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 測試深色模式下的各個頁面
    const pages = ['/about', '/products', '/contact'];
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      await expect(page).toHaveScreenshot(`theme-dark${pagePath.replace('/', '-')}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('動態內容遮罩測試', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // 遮罩會變動的內容
    await expect(page).toHaveScreenshot('dashboard-masked.png', {
      fullPage: true,
      mask: [
        page.locator('[data-testid="current-time"]'),     // 時間戳記
        page.locator('[data-testid="random-number"]'),    // 隨機數字
        page.locator('[data-testid="user-avatar"]'),      // 用戶頭像
        page.locator('.advertisement'),                   // 廣告區域
      ],
      maskColor: '#FF00FF'  // 使用明顯的顏色標記遮罩區域
    });
  });

  test('捲動位置視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000/long-page');
    
    // 頂部截圖
    await expect(page).toHaveScreenshot('scroll-top.png', {
      fullPage: false  // 只擷取可見區域
    });
    
    // 捲動到中間
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('scroll-middle.png', {
      fullPage: false
    });
    
    // 捲動到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('scroll-bottom.png', {
      fullPage: false
    });
    
    // 測試固定元素（如返回頂部按鈕）
    const backToTop = page.locator('[data-testid="back-to-top"]');
    await expect(backToTop).toBeVisible();
    await expect(backToTop).toHaveScreenshot('back-to-top-button.png');
  });

  test('互動元件動畫序列測試', async ({ page }) => {
    await page.goto('http://localhost:3000/animations');
    
    // 捕獲動畫的關鍵幀
    const modal = page.locator('[data-testid="modal"]');
    
    // 打開 modal 前
    await expect(page).toHaveScreenshot('modal-closed.png');
    
    // 觸發 modal 開啟
    await page.click('[data-testid="open-modal"]');
    
    // 動畫進行中（可能需要調整時間）
    await page.waitForTimeout(150);
    await expect(page).toHaveScreenshot('modal-opening.png');
    
    // 完全開啟
    await page.waitForTimeout(350);
    await expect(page).toHaveScreenshot('modal-open.png');
    
    // 關閉 modal
    await page.click('[data-testid="close-modal"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('modal-closed-again.png');
  });

  test('圖表和資料視覺化測試', async ({ page }) => {
    await page.goto('http://localhost:3000/charts');
    
    // 等待圖表渲染完成
    await page.waitForSelector('[data-testid="chart-container"] canvas');
    await page.waitForTimeout(1000); // 等待動畫完成
    
    // 測試不同類型的圖表
    const chartTypes = ['bar', 'line', 'pie', 'scatter'];
    
    for (const chartType of chartTypes) {
      // 切換圖表類型
      await page.selectOption('[data-testid="chart-type-selector"]', chartType);
      await page.waitForTimeout(500); // 等待圖表重新渲染
      
      // 擷取圖表截圖
      const chartContainer = page.locator('[data-testid="chart-container"]');
      await expect(chartContainer).toHaveScreenshot(`chart-${chartType}.png`, {
        animations: 'disabled'
      });
      
      // 測試圖表互動（如 hover 效果）
      const chartCanvas = page.locator('[data-testid="chart-container"] canvas');
      await chartCanvas.hover({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(200);
      await expect(chartContainer).toHaveScreenshot(`chart-${chartType}-hover.png`);
    }
  });

  test('列印樣式視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000/printable');
    
    // 模擬列印媒體
    await page.emulateMedia({ media: 'print' });
    
    // 擷取列印版本的截圖
    await expect(page).toHaveScreenshot('print-view.png', {
      fullPage: true
    });
    
    // 恢復螢幕媒體
    await page.emulateMedia({ media: 'screen' });
    
    // 比較螢幕版本
    await expect(page).toHaveScreenshot('screen-view.png', {
      fullPage: true
    });
  });

  test('無障礙性視覺測試', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 測試高對比模式
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await expect(page).toHaveScreenshot('high-contrast.png', {
      fullPage: true
    });
    
    // 測試焦點指示器
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-indicator-1.png');
    
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-indicator-2.png');
    
    await page.keyboard.press('Tab');
    await expect(page).toHaveScreenshot('focus-indicator-3.png');
  });

  test('跨瀏覽器視覺一致性', async ({ browserName, page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 為不同瀏覽器擷取截圖
    await expect(page).toHaveScreenshot(`cross-browser-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
    
    // 測試瀏覽器特定的 CSS 特性
    const hasWebkitFeature = await page.evaluate(() => {
      return CSS.supports('-webkit-line-clamp', '3');
    });
    
    if (hasWebkitFeature) {
      await expect(page.locator('.text-truncate')).toHaveScreenshot(
        `webkit-line-clamp-${browserName}.png`
      );
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === 'failed') {
      // 失敗時保存額外的診斷截圖
      const screenshotPath = path.join(
        'test-results',
        `failure-${testInfo.title}-${Date.now()}.png`
      );
      
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      
      console.log(`失敗截圖已保存至: ${screenshotPath}`);
      
      // 保存 HTML 快照
      const html = await page.content();
      const htmlPath = path.join(
        'test-results',
        `failure-${testInfo.title}-${Date.now()}.html`
      );
      
      await fs.writeFile(htmlPath, html);
      console.log(`HTML 快照已保存至: ${htmlPath}`);
    }
  });
});

// 輔助函數：生成視覺差異報告
/**
 *
 * @param {*} baselinePath - baselinePath 參數
 * @param {*} actualPath - actualPath 參數
 * @param {*} diffPath - diffPath 參數
 */
async function generateVisualReport(baselinePath, actualPath, diffPath) {
  // 這裡可以整合 pixelmatch 或其他圖片比對工具
  console.log(`比對基準圖片: ${baselinePath}`);
  console.log(`實際圖片: ${actualPath}`);
  console.log(`差異輸出至: ${diffPath}`);
}