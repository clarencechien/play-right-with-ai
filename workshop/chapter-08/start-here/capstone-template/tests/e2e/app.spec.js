// Capstone 專案 - E2E 測試模板
// 學員需要基於這個模板開發完整的測試套件

const { test, expect } = require('@playwright/test');

test.describe('Capstone 應用程式 E2E 測試', () => {
  // 測試前準備
  test.beforeEach(async ({ page }) => {
    // TODO: 導航到應用程式
    await page.goto('http://localhost:3000');
    
    // TODO: 等待應用程式載入完成
    await page.waitForLoadState('networkidle');
  });

  test.describe('用戶流程測試', () => {
    test('正常路徑 - 完整用戶操作流程', async ({ page }) => {
      // TODO: 實作完整的用戶操作流程
      
      // Step 1: 驗證首頁載入
      await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      
      // Step 2: 填寫表單
      await page.fill('[data-testid="user-input"]', '測試項目');
      await page.fill('#description', '這是一個測試項目的描述');
      await page.selectOption('#category', 'work');
      await page.selectOption('#priority', 'high');
      
      // Step 3: 提交表單
      await page.click('[data-testid="submit-button"]');
      
      // Step 4: 驗證結果
      // TODO: 驗證項目已新增到列表
      await expect(page.locator('.data-item')).toBeVisible();
      await expect(page.locator('.data-item h3')).toHaveText('測試項目');
      
      // Step 5: 測試搜尋功能
      await page.fill('#search-input', '測試');
      await page.keyboard.press('Enter');
      
      // TODO: 驗證搜尋結果
      const searchResults = await page.locator('.data-item').count();
      expect(searchResults).toBeGreaterThan(0);
      
      // Step 6: 測試排序功能
      await page.click('button:has-text("按名稱排序")');
      
      // TODO: 驗證排序結果
      
      // Step 7: 測試刪除功能
      await page.click('.data-item button:has-text("刪除")');
      await page.on('dialog', dialog => dialog.accept()); // 接受確認對話框
      
      // TODO: 驗證項目已刪除
    });

    test('錯誤處理 - 無效輸入', async ({ page }) => {
      // TODO: 測試各種無效輸入情況
      
      // 測試空白必填欄位
      await page.click('[data-testid="submit-button"]');
      
      // TODO: 驗證錯誤訊息
      await expect(page.locator('#message.error')).toBeVisible();
      
      // 測試過長輸入
      const longText = 'a'.repeat(1000);
      await page.fill('[data-testid="user-input"]', longText);
      await page.click('[data-testid="submit-button"]');
      
      // TODO: 驗證處理結果
    });

    test('邊界條件測試', async ({ page }) => {
      // TODO: 測試邊界條件
      
      // 測試特殊字符
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      await page.fill('[data-testid="user-input"]', specialChars);
      await page.click('[data-testid="submit-button"]');
      
      // TODO: 驗證應用程式正確處理特殊字符
      
      // 測試 Unicode 字符
      const unicodeText = '測試 🎯 émoji 文字';
      await page.fill('[data-testid="user-input"]', unicodeText);
      await page.click('[data-testid="submit-button"]');
      
      // TODO: 驗證 Unicode 處理
    });
  });

  test.describe('UI 元件測試', () => {
    test('表單元件功能', async ({ page }) => {
      // TODO: 測試所有表單元件
      
      // 測試輸入欄位
      const nameInput = page.locator('[data-testid="user-input"]');
      await expect(nameInput).toBeEditable();
      await nameInput.fill('測試輸入');
      await expect(nameInput).toHaveValue('測試輸入');
      
      // 測試下拉選單
      const categorySelect = page.locator('#category');
      await categorySelect.selectOption('work');
      await expect(categorySelect).toHaveValue('work');
      
      // 測試文字區域
      const descriptionTextarea = page.locator('#description');
      await descriptionTextarea.fill('多行\n文字\n測試');
      const value = await descriptionTextarea.inputValue();
      expect(value).toContain('多行');
    });

    test('導航功能', async ({ page }) => {
      // TODO: 測試導航連結
      
      const navLinks = page.locator('nav a');
      const linkCount = await navLinks.count();
      
      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        await expect(link).toBeVisible();
        
        // TODO: 測試連結點擊
        // await link.click();
        // 驗證導航結果
      }
    });

    test('響應式設計', async ({ page }) => {
      // TODO: 測試不同視窗大小
      
      // 桌面視圖
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('main')).toHaveCSS('display', 'grid');
      
      // 平板視圖
      await page.setViewportSize({ width: 768, height: 1024 });
      // TODO: 驗證平板佈局
      
      // 手機視圖
      await page.setViewportSize({ width: 375, height: 667 });
      // TODO: 驗證手機佈局
    });
  });

  test.describe('資料操作測試', () => {
    test('CRUD 操作', async ({ page }) => {
      // Create - 創建
      await page.fill('[data-testid="user-input"]', 'CRUD 測試項目');
      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('.data-item')).toBeVisible();
      
      // Read - 讀取
      const itemText = await page.locator('.data-item h3').textContent();
      expect(itemText).toBe('CRUD 測試項目');
      
      // Update - 更新 (如果有編輯功能)
      // TODO: 實作更新測試
      
      // Delete - 刪除
      await page.click('.data-item button:has-text("刪除")');
      await page.on('dialog', dialog => dialog.accept());
      
      // TODO: 驗證刪除成功
    });

    test('批量操作', async ({ page }) => {
      // TODO: 測試批量操作（如果有）
      
      // 創建多個項目
      for (let i = 1; i <= 5; i++) {
        await page.fill('[data-testid="user-input"]', `項目 ${i}`);
        await page.click('[data-testid="submit-button"]');
        await page.waitForTimeout(100); // 短暫等待
      }
      
      // 驗證所有項目都已創建
      const itemCount = await page.locator('.data-item').count();
      expect(itemCount).toBe(5);
      
      // TODO: 測試批量刪除或其他批量操作
    });

    test('資料持久化', async ({ page, context }) => {
      // TODO: 測試資料是否正確持久化
      
      // 創建項目
      await page.fill('[data-testid="user-input"]', '持久化測試');
      await page.click('[data-testid="submit-button"]');
      
      // 重新載入頁面
      await page.reload();
      
      // TODO: 驗證資料仍然存在
      // 注意：這取決於應用程式是否實作了持久化
    });
  });

  test.describe('整合測試', () => {
    test('搜尋和排序組合', async ({ page }) => {
      // 創建測試資料
      const testData = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
      
      for (const item of testData) {
        await page.fill('[data-testid="user-input"]', item);
        await page.click('[data-testid="submit-button"]');
        await page.waitForTimeout(100);
      }
      
      // 搜尋
      await page.fill('#search-input', 'e');
      await page.keyboard.press('Enter');
      
      // TODO: 驗證搜尋結果
      
      // 排序
      await page.click('button:has-text("按名稱排序")');
      
      // TODO: 驗證排序後的搜尋結果
    });

    test('匯入匯出功能', async ({ page }) => {
      // 創建測試資料
      await page.fill('[data-testid="user-input"]', '匯出測試');
      await page.click('[data-testid="submit-button"]');
      
      // 測試匯出
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('button:has-text("匯出 JSON")')
      ]);
      
      // TODO: 驗證下載的文件
      expect(download.suggestedFilename()).toContain('.json');
      
      // TODO: 測試匯入功能
    });
  });

  test.describe('無障礙性測試', () => {
    test('鍵盤導航', async ({ page }) => {
      // TODO: 測試 Tab 鍵導航
      await page.keyboard.press('Tab');
      
      // 驗證焦點移動
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(focusedElement).toBeTruthy();
      
      // 測試 Enter 鍵提交
      await page.fill('[data-testid="user-input"]', 'Tab 測試');
      await page.keyboard.press('Tab'); // 移動到下一個元素
      await page.keyboard.press('Tab'); // 繼續移動
      // TODO: 繼續測試鍵盤操作
    });

    test('ARIA 屬性', async ({ page }) => {
      // TODO: 驗證 ARIA 屬性
      
      const button = page.locator('[data-testid="submit-button"]');
      // 檢查按鈕是否有適當的 ARIA 屬性
      
      const form = page.locator('#main-form');
      // 檢查表單的無障礙性
    });
  });

  test.describe('錯誤恢復測試', () => {
    test('網路錯誤處理', async ({ page, context }) => {
      // TODO: 模擬網路錯誤
      
      // 攔截網路請求
      await context.route('**/api/**', route => {
        route.abort('failed');
      });
      
      // 嘗試提交表單
      await page.fill('[data-testid="user-input"]', '網路測試');
      await page.click('[data-testid="submit-button"]');
      
      // TODO: 驗證錯誤處理
      await expect(page.locator('#message.error')).toBeVisible();
    });

    test('異常輸入恢復', async ({ page }) => {
      // TODO: 測試應用程式從異常輸入中恢復
      
      // 嘗試注入惡意代碼
      await page.fill('[data-testid="user-input"]', '<script>alert("XSS")</script>');
      await page.click('[data-testid="submit-button"]');
      
      // 驗證應用程式仍然正常運作
      await expect(page).not.toHaveTitle('Error');
      
      // TODO: 驗證沒有執行惡意代碼
    });
  });
});

// 輔助函數
async function createTestData(page, count = 5) {
  for (let i = 1; i <= count; i++) {
    await page.fill('[data-testid="user-input"]', `測試項目 ${i}`);
    await page.fill('#description', `描述 ${i}`);
    await page.click('[data-testid="submit-button"]');
    await page.waitForTimeout(100);
  }
}

async function clearAllData(page) {
  // TODO: 實作清除所有資料的函數
  const deleteButtons = page.locator('.data-item button:has-text("刪除")');
  const count = await deleteButtons.count();
  
  for (let i = count - 1; i >= 0; i--) {
    await deleteButtons.nth(i).click();
    await page.on('dialog', dialog => dialog.accept());
  }
}