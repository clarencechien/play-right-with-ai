import { test, expect } from '@playwright/test';
import { WorkshopPage } from '../page-objects/workshop-page';
import { waitForPageLoad, getPerformanceMetrics } from '../utils/test-helpers';

/**
 * 工作坊流程 E2E 測試
 * 測試整體工作坊體驗
 */
test.describe('工作坊流程測試', () => {
  let workshopPage: WorkshopPage;

  test.beforeEach(async ({ page }) => {
    workshopPage = new WorkshopPage(page);
    await workshopPage.navigate('/');
    await waitForPageLoad(page);
  });

  test.describe('章節導航', () => {
    test('應該顯示所有 8 個章節', async () => {
      const chapters = await workshopPage.getAllChapterStatuses();
      expect(chapters).toHaveLength(8);
      
      // 驗證章節標題
      expect(chapters[0].title).toContain('AI Conductor');
      expect(chapters[1].title).toContain('First Movement');
      expect(chapters[7].title).toContain('Capstone Project');
    });

    test('初始只有第一章解鎖', async () => {
      const chapters = await workshopPage.getAllChapterStatuses();
      expect(chapters[0].status).toBe('available');
      
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i].status).toBe('locked');
      }
    });

    test('完成章節後解鎖下一章', async () => {
      // 進入第一章
      await workshopPage.navigateToChapter(1);
      
      // 完成練習
      await workshopPage.executePrompt('建立一個簡單的 TODO 應用程式');
      await workshopPage.completeExercise();
      
      // 檢查第二章是否解鎖
      const isUnlocked = await workshopPage.isChapterUnlocked(2);
      expect(isUnlocked).toBeTruthy();
    });

    test('可以在已解鎖章節間切換', async () => {
      await workshopPage.navigateToChapter(1);
      const chapter1Title = await workshopPage.getCurrentChapterTitle();
      
      await workshopPage.goToNextChapter();
      const chapter2Title = await workshopPage.getCurrentChapterTitle();
      
      expect(chapter1Title).not.toBe(chapter2Title);
      
      await workshopPage.goToPreviousChapter();
      const backToChapter1 = await workshopPage.getCurrentChapterTitle();
      expect(backToChapter1).toBe(chapter1Title);
    });
  });

  test.describe('進度追蹤', () => {
    test('顯示正確的進度百分比', async () => {
      const initialProgress = await workshopPage.getProgressPercentage();
      expect(initialProgress).toBe(0);
      
      // 完成第一章
      await workshopPage.navigateToChapter(1);
      await workshopPage.completeExercise();
      
      const progressAfterOne = await workshopPage.getProgressPercentage();
      expect(progressAfterOne).toBeGreaterThan(0);
      expect(progressAfterOne).toBeLessThanOrEqual(15); // 約 12.5% (1/8)
    });

    test('儲存進度到本地存儲', async ({ page }) => {
      await workshopPage.navigateToChapter(1);
      await workshopPage.completeExercise();
      
      // 重新載入頁面
      await page.reload();
      
      // 檢查進度是否保留
      const progress = await workshopPage.getProgressPercentage();
      expect(progress).toBeGreaterThan(0);
    });
  });

  test.describe('練習執行', () => {
    test('可以執行提示詞並顯示輸出', async () => {
      await workshopPage.navigateToChapter(1);
      
      const prompt = '使用 Playwright 測試 TODO 應用程式';
      await workshopPage.executePrompt(prompt);
      
      const output = await workshopPage.getOutput();
      expect(output).toBeTruthy();
      expect(output.length).toBeGreaterThan(0);
    });

    test('顯示練習說明', async () => {
      await workshopPage.navigateToChapter(1);
      
      const hasExercise = await workshopPage.hasExercise();
      expect(hasExercise).toBeTruthy();
      
      const instructions = await workshopPage.getExerciseInstructions();
      expect(instructions).toContain('AI');
    });

    test('可以重置練習', async () => {
      await workshopPage.navigateToChapter(1);
      
      await workshopPage.executePrompt('測試提示詞');
      await workshopPage.resetExercise();
      
      const output = await workshopPage.getOutput();
      expect(output).toBe('');
    });

    test('顯示提示功能', async () => {
      await workshopPage.navigateToChapter(1);
      
      const hint = await workshopPage.getHint();
      expect(hint).toBeTruthy();
      expect(hint).toContain('提示');
    });
  });

  test.describe('程式碼編輯器', () => {
    test('可以執行程式碼', async () => {
      await workshopPage.navigateToChapter(2);
      
      await workshopPage.runCode();
      const output = await workshopPage.getCodeOutput();
      
      expect(output).toBeTruthy();
    });

    test('顯示錯誤訊息', async ({ page }) => {
      await workshopPage.navigateToChapter(2);
      
      // 輸入錯誤的程式碼
      const codeEditor = page.locator('[data-testid="code-editor"]');
      await codeEditor.fill('console.log(undefinedVariable)');
      
      await workshopPage.runCode();
      const output = await workshopPage.getCodeOutput();
      
      expect(output).toContain('error');
    });
  });

  test.describe('完成工作坊', () => {
    test('完成所有章節後顯示完成徽章', async () => {
      // 模擬完成所有章節
      for (let i = 1; i <= 8; i++) {
        await workshopPage.navigateToChapter(i);
        await workshopPage.completeExercise();
      }
      
      const isComplete = await workshopPage.isWorkshopComplete();
      expect(isComplete).toBeTruthy();
    });

    test('可以下載完成證書', async () => {
      // 模擬完成工作坊
      for (let i = 1; i <= 8; i++) {
        await workshopPage.navigateToChapter(i);
        await workshopPage.completeExercise();
      }
      
      const download = await workshopPage.downloadCertificate();
      expect(download).toBeTruthy();
      expect(download.suggestedFilename()).toContain('certificate');
    });
  });

  test.describe('響應式設計', () => {
    test('在手機裝置上正常顯示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await workshopPage.navigate('/');
      
      // 檢查導航選單是否轉為漢堡選單
      const hamburger = page.locator('[data-testid="mobile-menu"]');
      await expect(hamburger).toBeVisible();
      
      // 檢查章節列表是否可以捲動
      const chapterList = workshopPage.chapterList;
      await expect(chapterList).toHaveCSS('overflow-x', 'auto');
    });

    test('在平板裝置上正常顯示', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await workshopPage.navigate('/');
      
      const chapters = await workshopPage.getAllChapterStatuses();
      expect(chapters.length).toBe(8);
    });
  });

  test.describe('效能測試', () => {
    test('頁面載入時間應小於 3 秒', async ({ page }) => {
      const metrics = await getPerformanceMetrics(page);
      
      expect(metrics.loadTime).toBeLessThan(3000);
      expect(metrics.domReady).toBeLessThan(1500);
    });

    test('章節切換應該流暢', async ({ page }) => {
      const startTime = Date.now();
      
      await workshopPage.navigateToChapter(1);
      await workshopPage.navigateToChapter(2);
      await workshopPage.navigateToChapter(3);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // 三次切換應該在 2 秒內完成
      expect(totalTime).toBeLessThan(2000);
    });
  });

  test.describe('錯誤處理', () => {
    test('網路錯誤時顯示友善訊息', async ({ page }) => {
      // 模擬網路錯誤
      await page.route('**/api/**', route => {
        route.abort();
      });
      
      await workshopPage.navigate('/');
      
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('網路');
    });

    test('無效章節導航時的處理', async ({ page }) => {
      // 嘗試直接訪問未解鎖的章節
      await page.goto('/workshop/chapter/5');
      
      // 應該重定向到第一個可用章節
      await expect(page).toHaveURL(/chapter\/1/);
    });
  });

  test.describe('無障礙性', () => {
    test('所有互動元素都有適當的 ARIA 標籤', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        expect(ariaLabel || text).toBeTruthy();
      }
    });

    test('支援鍵盤導航', async ({ page }) => {
      await workshopPage.navigate('/');
      
      // Tab 鍵導航
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // 應該能夠使用鍵盤導航
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    });
  });
});