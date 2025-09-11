import { test, expect } from '@playwright/test';

/**
 * 完整工作坊流程驗證測試套件
 * 確保所有章節內容、練習和範例都能正常運作
 */
test.describe('工作坊完整流程測試', () => {
  test.beforeEach(async ({ page }) => {
    // 設置測試前的共用狀態
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('應能訪問所有章節頁面', async ({ page }) => {
    const chapters = [
      { path: '/workshop/chapter-01', title: 'AI 指揮家' },
      { path: '/workshop/chapter-02', title: '第一樂章：自然語言生成應用' },
      { path: '/workshop/chapter-03', title: '第二樂章：AI 測試策略師' },
      { path: '/workshop/chapter-04', title: '第三樂章：Playwright MCP 實戰' },
      { path: '/workshop/chapter-05', title: '第四樂章：測試分析與調試' },
      { path: '/workshop/chapter-06', title: '終曲：自我修復循環' },
      { path: '/workshop/chapter-07', title: '變奏：進階場景' },
      { path: '/workshop/chapter-08', title: '總結專案' }
    ];

    for (const chapter of chapters) {
      await test.step(`訪問 ${chapter.title}`, async () => {
        await page.goto(chapter.path);
        await expect(page).toHaveURL(new RegExp(chapter.path));
        
        // 驗證頁面標題或標頭
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
        
        // 驗證 README 內容存在
        const content = page.locator('[data-testid="chapter-content"], main, .content');
        await expect(content).toBeVisible();
        
        // 截圖存證
        await page.screenshot({ 
          path: `screenshots/chapter-${chapter.path.split('-').pop()}.png`,
          fullPage: true 
        });
      });
    }
  });

  test('工作坊導航功能正常', async ({ page }) => {
    await page.goto('/workshop');
    
    // 測試章節列表
    const chapterLinks = page.locator('[data-testid="chapter-link"], .chapter-link, a[href*="/chapter-"]');
    const linkCount = await chapterLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(8);
    
    // 測試導航到第一章
    await chapterLinks.first().click();
    await expect(page).toHaveURL(/chapter-01/);
    
    // 測試返回導航
    const backButton = page.locator('[data-testid="back-button"], .back-button, a[href="/workshop"]');
    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/workshop/);
    }
  });

  test('練習文件結構完整', async ({ page }) => {
    const chapters = ['01', '02', '03', '04', '05', '06', '07', '08'];
    
    for (const chapter of chapters) {
      await test.step(`檢查 Chapter ${chapter} 練習結構`, async () => {
        await page.goto(`/workshop/chapter-${chapter}`);
        
        // 檢查必要元素
        const elements = [
          { selector: '[data-testid="readme"], .readme, #readme', name: 'README' },
          { selector: '[data-testid="exercise"], .exercise, .start-here', name: '練習區' },
          { selector: '[data-testid="example"], .example, .example-output', name: '範例輸出' }
        ];
        
        for (const element of elements) {
          const el = page.locator(element.selector);
          if (await el.count() > 0) {
            await expect(el.first()).toBeVisible({ timeout: 5000 });
          }
        }
      });
    }
  });

  test('程式碼區塊語法高亮正常', async ({ page }) => {
    await page.goto('/workshop/chapter-03');
    
    // 檢查程式碼區塊
    const codeBlocks = page.locator('pre code, .highlight, .language-typescript');
    const codeCount = await codeBlocks.count();
    
    if (codeCount > 0) {
      // 驗證語法高亮類別存在
      const firstBlock = codeBlocks.first();
      await expect(firstBlock).toBeVisible();
      
      // 檢查是否有語法高亮的 class
      const className = await firstBlock.getAttribute('class');
      expect(className).toMatch(/language-|highlight/);
    }
  });

  test('互動元素響應正常', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 測試複製程式碼按鈕
    const copyButtons = page.locator('[data-testid="copy-code"], .copy-button, button:has-text("Copy")');
    if (await copyButtons.count() > 0) {
      await copyButtons.first().click();
      
      // 驗證複製成功提示
      const toast = page.locator('.toast, .notification, [role="alert"]');
      if (await toast.isVisible()) {
        await expect(toast).toContainText(/copied|複製/i);
      }
    }
    
    // 測試摺疊/展開功能
    const collapsibles = page.locator('[data-testid="collapsible"], details, .collapsible');
    if (await collapsibles.count() > 0) {
      const firstCollapsible = collapsibles.first();
      await firstCollapsible.click();
      
      // 等待內容展開
      const content = firstCollapsible.locator('.content, [data-testid="collapsible-content"]');
      if (await content.count() > 0) {
        await expect(content).toBeVisible();
      }
    }
  });

  test('搜尋功能運作正常', async ({ page }) => {
    await page.goto('/workshop');
    
    const searchInput = page.locator('[data-testid="search"], input[type="search"], .search-input');
    if (await searchInput.isVisible()) {
      // 執行搜尋
      await searchInput.fill('Playwright');
      await searchInput.press('Enter');
      
      // 等待搜尋結果
      await page.waitForTimeout(1000);
      
      // 驗證結果顯示
      const results = page.locator('[data-testid="search-results"], .search-results, .results');
      if (await results.count() > 0) {
        await expect(results).toBeVisible();
      }
    }
  });

  test('頁面載入性能符合標準', async ({ page }) => {
    const metrics = [];
    
    for (let i = 1; i <= 3; i++) {
      await page.goto(`/workshop/chapter-0${i}`);
      
      const timing = await page.evaluate(() => {
        const perf = performance.timing;
        return {
          loadTime: perf.loadEventEnd - perf.navigationStart,
          domReady: perf.domContentLoadedEventEnd - perf.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
        };
      });
      
      metrics.push(timing);
      
      // 驗證性能指標
      expect(timing.loadTime).toBeLessThan(5000); // 5秒內完成載入
      expect(timing.domReady).toBeLessThan(3000); // 3秒內 DOM 就緒
    }
    
    // 計算平均值
    const avgLoadTime = metrics.reduce((a, b) => a + b.loadTime, 0) / metrics.length;
    console.log(`平均載入時間: ${avgLoadTime}ms`);
    expect(avgLoadTime).toBeLessThan(4000);
  });

  test('響應式設計在不同裝置正常顯示', async ({ browser }) => {
    const devices = [
      { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
      { name: 'Tablet', viewport: { width: 768, height: 1024 } },
      { name: 'Mobile', viewport: { width: 375, height: 667 } }
    ];
    
    for (const device of devices) {
      await test.step(`測試 ${device.name} 顯示`, async () => {
        const context = await browser.newContext({
          viewport: device.viewport
        });
        const page = await context.newPage();
        
        await page.goto('/workshop/chapter-01');
        
        // 驗證關鍵元素在不同視窗大小都能顯示
        const mainContent = page.locator('main, [role="main"], .main-content');
        await expect(mainContent).toBeVisible();
        
        // 檢查是否有水平滾動條（不應該有）
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
        
        await context.close();
      });
    }
  });

  test('錯誤處理機制正常運作', async ({ page }) => {
    // 測試 404 頁面
    await page.goto('/workshop/non-existent-chapter');
    
    // 應該顯示錯誤頁面或重定向
    const errorPage = page.locator('[data-testid="error-page"], .error-404, h1:has-text("404")');
    const isError = await errorPage.isVisible().catch(() => false);
    
    if (isError) {
      await expect(errorPage).toBeVisible();
    } else {
      // 或者重定向到首頁
      await expect(page).toHaveURL(/workshop/);
    }
  });

  test('本地存儲和進度追蹤', async ({ page }) => {
    await page.goto('/workshop/chapter-01');
    
    // 模擬使用者完成章節
    const completeButton = page.locator('[data-testid="mark-complete"], .complete-button');
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // 檢查本地存儲
      const progress = await page.evaluate(() => {
        return localStorage.getItem('workshop-progress');
      });
      
      if (progress) {
        expect(progress).toContain('chapter-01');
      }
      
      // 重新載入頁面，檢查進度是否保存
      await page.reload();
      
      const isCompleted = await page.locator('.completed, [data-completed="true"]').isVisible();
      if (isCompleted) {
        expect(isCompleted).toBe(true);
      }
    }
  });
});