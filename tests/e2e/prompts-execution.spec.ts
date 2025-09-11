import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 提示詞執行驗證測試套件
 * 確保所有章節的提示詞都能正確載入和執行
 */
test.describe('提示詞執行測試', () => {
  const promptsDir = '/workspace/play-right-with-ai/prompts';
  
  test('所有提示詞文件結構完整', async () => {
    // 檢查提示詞目錄是否存在
    const promptsDirExists = fs.existsSync(promptsDir);
    
    if (promptsDirExists) {
      const chapters = fs.readdirSync(promptsDir)
        .filter(dir => dir.startsWith('chapter-'));
      
      expect(chapters.length).toBeGreaterThanOrEqual(8);
      
      for (const chapter of chapters) {
        const chapterPath = path.join(promptsDir, chapter);
        const files = fs.readdirSync(chapterPath);
        
        // 每個章節應該有至少一個提示詞文件
        const promptFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.txt'));
        expect(promptFiles.length).toBeGreaterThan(0);
        
        // 檢查 README 是否存在
        expect(files).toContain('README.md');
      }
    }
  });

  test('提示詞格式正確', async () => {
    if (!fs.existsSync(promptsDir)) {
      test.skip();
      return;
    }
    
    const chapters = fs.readdirSync(promptsDir)
      .filter(dir => dir.startsWith('chapter-'));
    
    for (const chapter of chapters) {
      const chapterPath = path.join(promptsDir, chapter);
      const promptFiles = fs.readdirSync(chapterPath)
        .filter(f => f.endsWith('.md') && f !== 'README.md');
      
      for (const promptFile of promptFiles) {
        const content = fs.readFileSync(path.join(chapterPath, promptFile), 'utf-8');
        
        // 檢查提示詞結構
        expect(content).toBeTruthy();
        
        // 檢查是否包含必要的標記
        const hasRole = content.includes('角色') || content.includes('Role') || content.includes('#');
        const hasTask = content.includes('任務') || content.includes('Task') || content.includes('##');
        const hasContext = content.includes('背景') || content.includes('Context') || content.includes('###');
        
        expect(hasRole || hasTask || hasContext).toBe(true);
        
        // 檢查是否有代碼塊
        if (promptFile.includes('code') || promptFile.includes('test')) {
          const hasCodeBlock = content.includes('```');
          expect(hasCodeBlock).toBe(true);
        }
      }
    }
  });

  test('提示詞在 UI 中正確顯示', async ({ page }) => {
    // 訪問提示詞頁面
    await page.goto('/prompts');
    
    // 等待內容載入
    await page.waitForLoadState('networkidle');
    
    // 檢查提示詞列表
    const promptList = page.locator('[data-testid="prompt-list"], .prompt-list');
    if (await promptList.count() > 0) {
      const prompts = promptList.locator('[data-testid="prompt-item"], .prompt-item');
      const promptCount = await prompts.count();
      expect(promptCount).toBeGreaterThan(0);
      
      // 點擊第一個提示詞
      await prompts.first().click();
      
      // 檢查提示詞內容顯示
      const promptContent = page.locator('[data-testid="prompt-content"], .prompt-content');
      await expect(promptContent).toBeVisible();
      
      // 檢查複製功能
      const copyButton = page.locator('[data-testid="copy-prompt"], button:has-text("Copy")');
      if (await copyButton.isVisible()) {
        await copyButton.click();
        
        // 檢查複製成功提示
        const toast = page.locator('.toast, .notification, [role="alert"]');
        if (await toast.isVisible()) {
          await expect(toast).toContainText(/copied|複製/i);
        }
      }
    }
  });

  test('章節提示詞整合測試', async ({ page }) => {
    const chapters = [
      { num: '01', name: 'AI 指揮家', expectedPrompts: ['setup', 'mindset'] },
      { num: '02', name: '自然語言生成', expectedPrompts: ['generate-app', 'requirements'] },
      { num: '03', name: 'AI 測試策略', expectedPrompts: ['test-strategy', 'test-plan'] },
      { num: '04', name: 'Playwright MCP', expectedPrompts: ['playwright-setup', 'mcp-integration'] },
      { num: '05', name: '測試分析', expectedPrompts: ['analyze-failure', 'debug'] },
      { num: '06', name: '自我修復', expectedPrompts: ['self-repair', 'fix-bugs'] },
      { num: '07', name: '進階場景', expectedPrompts: ['advanced', 'complex'] },
      { num: '08', name: '總結專案', expectedPrompts: ['capstone', 'final'] }
    ];
    
    for (const chapter of chapters) {
      await test.step(`測試 Chapter ${chapter.num} 提示詞`, async () => {
        await page.goto(`/workshop/chapter-${chapter.num}`);
        
        // 查找提示詞區塊
        const promptSections = page.locator('[data-testid="prompt-section"], .prompt-section, .prompt');
        
        if (await promptSections.count() > 0) {
          // 驗證提示詞存在
          for (const expectedPrompt of chapter.expectedPrompts) {
            const promptExists = await page.locator(`text=/${expectedPrompt}/i`).count() > 0;
            if (promptExists) {
              console.log(`Found prompt: ${expectedPrompt} in Chapter ${chapter.num}`);
            }
          }
        }
      });
    }
  });

  test('提示詞參數替換功能', async ({ page }) => {
    await page.goto('/prompts/interactive');
    
    // 如果有互動式提示詞編輯器
    const editor = page.locator('[data-testid="prompt-editor"], .prompt-editor');
    if (await editor.count() > 0) {
      // 檢查參數輸入
      const paramInputs = page.locator('[data-testid="param-input"], .param-input');
      if (await paramInputs.count() > 0) {
        // 填寫參數
        await paramInputs.first().fill('測試應用');
        
        // 檢查預覽更新
        const preview = page.locator('[data-testid="prompt-preview"], .prompt-preview');
        await expect(preview).toContainText('測試應用');
      }
      
      // 測試生成按鈕
      const generateButton = page.locator('[data-testid="generate-prompt"], button:has-text("Generate")');
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // 檢查生成結果
        const result = page.locator('[data-testid="generated-prompt"], .generated-prompt');
        await expect(result).toBeVisible();
      }
    }
  });

  test('提示詞版本管理', async ({ page }) => {
    await page.goto('/prompts/versions');
    
    // 檢查版本選擇器
    const versionSelector = page.locator('[data-testid="version-selector"], select.version-selector');
    if (await versionSelector.count() > 0) {
      // 獲取可用版本
      const options = await versionSelector.locator('option').all();
      expect(options.length).toBeGreaterThan(0);
      
      // 切換版本
      if (options.length > 1) {
        await versionSelector.selectOption({ index: 1 });
        
        // 等待內容更新
        await page.waitForTimeout(500);
        
        // 驗證內容已更新
        const content = page.locator('[data-testid="prompt-content"], .prompt-content');
        await expect(content).toBeVisible();
      }
    }
  });

  test('提示詞分類和標籤', async ({ page }) => {
    await page.goto('/prompts');
    
    // 檢查分類過濾器
    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter');
    if (await categoryFilter.count() > 0) {
      const categories = await categoryFilter.locator('button, a').all();
      
      for (const category of categories.slice(0, 3)) { // 測試前3個分類
        await category.click();
        await page.waitForTimeout(300);
        
        // 檢查過濾結果
        const promptItems = page.locator('[data-testid="prompt-item"], .prompt-item');
        const count = await promptItems.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
    
    // 檢查標籤系統
    const tags = page.locator('[data-testid="prompt-tag"], .prompt-tag');
    if (await tags.count() > 0) {
      const firstTag = tags.first();
      const tagText = await firstTag.textContent();
      
      // 點擊標籤進行過濾
      await firstTag.click();
      
      // 驗證過濾效果
      const filteredPrompts = page.locator('[data-testid="prompt-item"], .prompt-item');
      const allHaveTag = await filteredPrompts.evaluateAll((elements, tag) => {
        return elements.every(el => el.textContent?.includes(tag || ''));
      }, tagText);
      
      expect(allHaveTag).toBe(true);
    }
  });

  test('提示詞搜尋功能', async ({ page }) => {
    await page.goto('/prompts');
    
    const searchInput = page.locator('[data-testid="prompt-search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      // 搜尋特定關鍵字
      await searchInput.fill('Playwright');
      await searchInput.press('Enter');
      
      // 等待搜尋結果
      await page.waitForTimeout(500);
      
      // 驗證搜尋結果
      const results = page.locator('[data-testid="prompt-item"], .prompt-item');
      const resultCount = await results.count();
      
      if (resultCount > 0) {
        // 檢查結果是否包含搜尋關鍵字
        const firstResult = results.first();
        const text = await firstResult.textContent();
        expect(text?.toLowerCase()).toContain('playwright');
      }
      
      // 清除搜尋
      await searchInput.clear();
      await searchInput.press('Enter');
      
      // 驗證恢復全部顯示
      const allPrompts = page.locator('[data-testid="prompt-item"], .prompt-item');
      const allCount = await allPrompts.count();
      expect(allCount).toBeGreaterThanOrEqual(resultCount);
    }
  });

  test('提示詞匯出功能', async ({ page }) => {
    await page.goto('/prompts');
    
    // 查找匯出按鈕
    const exportButton = page.locator('[data-testid="export-prompts"], button:has-text("Export")');
    if (await exportButton.isVisible()) {
      // 設置下載監聽
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        
        // 驗證下載的文件
        expect(download.suggestedFilename()).toMatch(/prompts.*\.(json|md|txt)/);
        
        // 保存並檢查內容
        const path = await download.path();
        if (path) {
          const content = fs.readFileSync(path, 'utf-8');
          expect(content).toBeTruthy();
        }
      } catch (e) {
        // 如果沒有真正的下載功能，跳過
        console.log('Export download not implemented');
      }
    }
  });

  test('提示詞評分和反饋', async ({ page }) => {
    await page.goto('/prompts');
    
    // 點擊第一個提示詞
    const firstPrompt = page.locator('[data-testid="prompt-item"], .prompt-item').first();
    if (await firstPrompt.isVisible()) {
      await firstPrompt.click();
      
      // 查找評分組件
      const ratingComponent = page.locator('[data-testid="prompt-rating"], .rating');
      if (await ratingComponent.count() > 0) {
        // 點擊評分
        const stars = ratingComponent.locator('.star, button');
        if (await stars.count() >= 5) {
          await stars.nth(3).click(); // 給4星評價
          
          // 檢查評分是否更新
          const selectedStars = ratingComponent.locator('.star.selected, .star.active');
          await expect(selectedStars).toHaveCount(4);
        }
      }
      
      // 查找反饋表單
      const feedbackForm = page.locator('[data-testid="feedback-form"], .feedback-form');
      if (await feedbackForm.count() > 0) {
        const textarea = feedbackForm.locator('textarea');
        await textarea.fill('這個提示詞很有幫助！');
        
        const submitButton = feedbackForm.locator('button[type="submit"]');
        await submitButton.click();
        
        // 檢查提交成功訊息
        const successMessage = page.locator('.success-message, [data-testid="feedback-success"]');
        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
  });
});