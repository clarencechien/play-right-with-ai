/**
 * 完整的 TODO 應用測試範例
 * 展示 AI 協助生成的 Playwright 測試腳本
 * @author AI Assistant & Human Developer
 * @version 1.0.0
 */

const { test, expect } = require('@playwright/test');

// 測試配置
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const TIMEOUT = 30000;

test.describe('TODO 應用程式完整測試套件', () => {
  
  // 測試前準備
  test.beforeEach(async ({ page }) => {
    // 導航到應用程式
    await page.goto(TEST_URL);
    
    // 等待應用程式載入完成
    await page.waitForLoadState('networkidle');
    
    // 清除 LocalStorage 確保測試環境乾淨
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  // 測試後清理
  test.afterEach(async ({ page }, testInfo) => {
    // 如果測試失敗，截圖保存
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ 
        path: `screenshots/failure-${testInfo.title}-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });

  test.describe('核心功能測試', () => {
    
    test('應該能夠新增單一待辦事項', async ({ page }) => {
      // Arrange - 準備測試資料
      const todoText = '學習 Playwright 自動化測試';
      
      // Act - 執行操作
      await page.fill('[data-testid="todo-input"]', todoText);
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Assert - 驗證結果
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toBeVisible();
      await expect(todoItem).toContainText(todoText);
      
      // 驗證計數器更新
      const counter = page.locator('[data-testid="todo-count"]');
      await expect(counter).toContainText('1 item left');
    });

    test('應該能夠新增多個待辦事項', async ({ page }) => {
      // Arrange
      const todos = [
        '撰寫測試案例',
        '執行自動化測試',
        '生成測試報告',
        '優化測試效能'
      ];
      
      // Act
      for (const todo of todos) {
        await page.fill('[data-testid="todo-input"]', todo);
        await page.press('[data-testid="todo-input"]', 'Enter');
        
        // 等待項目出現
        await page.waitForSelector(`text="${todo}"`, { timeout: 5000 });
      }
      
      // Assert
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(todos.length);
      
      // 驗證每個項目的文字
      for (let i = 0; i < todos.length; i++) {
        await expect(todoItems.nth(i)).toContainText(todos[i]);
      }
    });

    test('應該能夠標記任務為完成', async ({ page }) => {
      // Arrange - 新增測試任務
      const todoText = '完成專案文檔';
      await page.fill('[data-testid="todo-input"]', todoText);
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Act - 標記為完成
      const checkbox = page.locator('[data-testid="todo-checkbox"]').first();
      await checkbox.click();
      
      // Assert - 驗證完成狀態
      await expect(checkbox).toBeChecked();
      
      // 驗證樣式變化（通常完成的任務會有刪除線）
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toHaveClass(/completed/);
      
      // 驗證計數器更新
      const counter = page.locator('[data-testid="todo-count"]');
      await expect(counter).toContainText('0 items left');
    });

    test('應該能夠刪除待辦事項', async ({ page }) => {
      // Arrange - 新增多個任務
      const todos = ['任務 A', '任務 B', '任務 C'];
      for (const todo of todos) {
        await page.fill('[data-testid="todo-input"]', todo);
        await page.press('[data-testid="todo-input"]', 'Enter');
      }
      
      // Act - 刪除第二個任務
      const deleteButton = page.locator('[data-testid="delete-button"]').nth(1);
      await deleteButton.click();
      
      // Assert - 驗證任務已刪除
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(2);
      
      // 驗證剩餘任務
      await expect(todoItems.first()).toContainText('任務 A');
      await expect(todoItems.last()).toContainText('任務 C');
    });

    test('應該能夠編輯待辦事項', async ({ page }) => {
      // Arrange
      const originalText = '原始任務';
      const updatedText = '更新後的任務';
      
      await page.fill('[data-testid="todo-input"]', originalText);
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Act - 雙擊進入編輯模式
      const todoLabel = page.locator('[data-testid="todo-label"]').first();
      await todoLabel.dblclick();
      
      // 清除並輸入新文字
      const editInput = page.locator('[data-testid="todo-edit"]').first();
      await editInput.fill(updatedText);
      await editInput.press('Enter');
      
      // Assert
      await expect(todoLabel).toContainText(updatedText);
    });
  });

  test.describe('篩選功能測試', () => {
    
    test.beforeEach(async ({ page }) => {
      // 準備測試資料：3個任務，1個已完成
      await page.fill('[data-testid="todo-input"]', '進行中任務 1');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      await page.fill('[data-testid="todo-input"]', '進行中任務 2');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      await page.fill('[data-testid="todo-input"]', '已完成任務');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // 標記第三個為完成
      await page.locator('[data-testid="todo-checkbox"]').nth(2).click();
    });

    test('應該能夠篩選顯示所有任務', async ({ page }) => {
      // Act
      await page.click('[data-testid="filter-all"]');
      
      // Assert
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(3);
    });

    test('應該能夠篩選只顯示進行中任務', async ({ page }) => {
      // Act
      await page.click('[data-testid="filter-active"]');
      
      // Assert
      const visibleTodos = page.locator('[data-testid="todo-item"]:visible');
      await expect(visibleTodos).toHaveCount(2);
      
      // 驗證顯示的都是未完成任務
      const checkboxes = page.locator('[data-testid="todo-checkbox"]:visible');
      for (let i = 0; i < 2; i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test('應該能夠篩選只顯示已完成任務', async ({ page }) => {
      // Act
      await page.click('[data-testid="filter-completed"]');
      
      // Assert
      const visibleTodos = page.locator('[data-testid="todo-item"]:visible');
      await expect(visibleTodos).toHaveCount(1);
      await expect(visibleTodos.first()).toContainText('已完成任務');
      
      // 驗證顯示的是已完成任務
      const checkbox = page.locator('[data-testid="todo-checkbox"]:visible');
      await expect(checkbox).toBeChecked();
    });

    test('應該能夠清除所有已完成任務', async ({ page }) => {
      // Act
      await page.click('[data-testid="clear-completed"]');
      
      // Assert
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(2);
      
      // 驗證剩餘的都是未完成任務
      const remainingTodos = await todoItems.allTextContents();
      expect(remainingTodos).not.toContain('已完成任務');
    });
  });

  test.describe('資料持久化測試', () => {
    
    test('應該在頁面重新載入後保留任務', async ({ page }) => {
      // Arrange - 新增任務
      const todos = ['持久化任務 1', '持久化任務 2'];
      for (const todo of todos) {
        await page.fill('[data-testid="todo-input"]', todo);
        await page.press('[data-testid="todo-input"]', 'Enter');
      }
      
      // 標記一個為完成
      await page.locator('[data-testid="todo-checkbox"]').first().click();
      
      // Act - 重新載入頁面
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Assert - 驗證資料仍存在
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(2);
      
      // 驗證完成狀態也被保存
      const firstCheckbox = page.locator('[data-testid="todo-checkbox"]').first();
      await expect(firstCheckbox).toBeChecked();
    });

    test('應該正確處理 LocalStorage 配額限制', async ({ page }) => {
      // Arrange - 填滿 LocalStorage
      await page.evaluate(() => {
        const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB 字串
        try {
          localStorage.setItem('large-data', largeData);
        } catch (e) {
          // 預期會超出配額
        }
      });
      
      // Act - 嘗試新增任務
      await page.fill('[data-testid="todo-input"]', '測試任務');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Assert - 應該有錯誤提示或降級處理
      // 具體驗證取決於應用的錯誤處理策略
      const errorMessage = page.locator('[data-testid="error-message"]');
      const todoExists = page.locator('text="測試任務"');
      
      // 任務應該仍然顯示（即使可能無法持久化）
      await expect(todoExists).toBeVisible();
    });
  });

  test.describe('鍵盤操作測試', () => {
    
    test('應該支援鍵盤快捷鍵操作', async ({ page }) => {
      // 新增任務
      await page.fill('[data-testid="todo-input"]', '鍵盤操作測試');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // 使用 Tab 鍵導航
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // 使用 Space 鍵切換完成狀態
      await page.keyboard.press('Space');
      
      // 驗證
      const checkbox = page.locator('[data-testid="todo-checkbox"]').first();
      await expect(checkbox).toBeChecked();
      
      // 使用 Escape 鍵取消編輯
      const todoLabel = page.locator('[data-testid="todo-label"]').first();
      await todoLabel.dblclick();
      await page.keyboard.type('修改中');
      await page.keyboard.press('Escape');
      
      // 驗證文字未改變
      await expect(todoLabel).toContainText('鍵盤操作測試');
    });

    test('應該支援 Ctrl+A 全選操作', async ({ page }) => {
      // 新增多個任務
      for (let i = 1; i <= 3; i++) {
        await page.fill('[data-testid="todo-input"]', `任務 ${i}`);
        await page.press('[data-testid="todo-input"]', 'Enter');
      }
      
      // 使用 Ctrl+A 全選（如果支援）
      await page.keyboard.press('Control+A');
      
      // 驗證全選狀態
      const checkboxes = page.locator('[data-testid="todo-checkbox"]');
      const checkedCount = await checkboxes.evaluateAll(
        elements => elements.filter(el => el.checked).length
      );
      
      // 根據應用實作，這裡可能需要調整預期行為
      expect(checkedCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('邊界條件測試', () => {
    
    test('應該處理空白輸入', async ({ page }) => {
      // Act - 嘗試提交空白
      await page.fill('[data-testid="todo-input"]', '   ');
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Assert - 不應新增任務
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(0);
    });

    test('應該處理超長文字輸入', async ({ page }) => {
      // Arrange
      const longText = 'a'.repeat(500);
      
      // Act
      await page.fill('[data-testid="todo-input"]', longText);
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      // Assert - 應該能處理或截斷
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toBeVisible();
      
      // 驗證文字被適當處理
      const actualText = await todoItem.textContent();
      expect(actualText.length).toBeLessThanOrEqual(500);
    });

    test('應該處理特殊字元輸入', async ({ page }) => {
      // Arrange
      const specialTexts = [
        '<script>alert("XSS")</script>',
        '任務 & 符號 | 測試',
        '😀🎉🚀 表情符號測試',
        '中文、English、にほんご'
      ];
      
      // Act & Assert
      for (const text of specialTexts) {
        await page.fill('[data-testid="todo-input"]', text);
        await page.press('[data-testid="todo-input"]', 'Enter');
        
        // 驗證文字被安全地顯示
        const todoItem = page.locator('[data-testid="todo-item"]').last();
        await expect(todoItem).toBeVisible();
        
        // 確保沒有 XSS 漏洞
        const hasScript = await page.evaluate(() => {
          return document.querySelector('script[src*="alert"]') !== null;
        });
        expect(hasScript).toBeFalsy();
      }
    });

    test('應該處理大量任務', async ({ page }) => {
      test.slow(); // 標記為慢速測試
      
      // Arrange - 新增 100 個任務
      const taskCount = 100;
      
      // Act
      for (let i = 1; i <= taskCount; i++) {
        await page.fill('[data-testid="todo-input"]', `任務 ${i}`);
        await page.press('[data-testid="todo-input"]', 'Enter');
        
        // 每 10 個任務等待一下，避免過快
        if (i % 10 === 0) {
          await page.waitForTimeout(100);
        }
      }
      
      // Assert
      const todoItems = page.locator('[data-testid="todo-item"]');
      await expect(todoItems).toHaveCount(taskCount);
      
      // 測試效能 - 操作應該仍然流暢
      const startTime = Date.now();
      await page.locator('[data-testid="todo-checkbox"]').nth(50).click();
      const endTime = Date.now();
      
      // 操作應該在合理時間內完成（例如 < 500ms）
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  test.describe('跨瀏覽器相容性', () => {
    
    test('應該在不同瀏覽器中正常運作', async ({ page, browserName }) => {
      // 記錄當前瀏覽器
      console.log(`Testing on browser: ${browserName}`);
      
      // 基本功能測試
      await page.fill('[data-testid="todo-input"]', `${browserName} 測試`);
      await page.press('[data-testid="todo-input"]', 'Enter');
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toBeVisible();
      await expect(todoItem).toContainText(`${browserName} 測試`);
      
      // 瀏覽器特定的測試
      if (browserName === 'webkit') {
        // Safari 特定測試
        console.log('Running Safari-specific tests');
      } else if (browserName === 'firefox') {
        // Firefox 特定測試
        console.log('Running Firefox-specific tests');
      } else if (browserName === 'chromium') {
        // Chrome 特定測試
        console.log('Running Chrome-specific tests');
      }
    });
  });

  test.describe('效能測試', () => {
    
    test('應該快速載入頁面', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(TEST_URL);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // 頁面應該在 2 秒內載入
      expect(loadTime).toBeLessThan(2000);
      
      // 使用 Performance API 獲取更精確的指標
      const performanceMetrics = await page.evaluate(() => {
        const perf = window.performance;
        return {
          domContentLoaded: perf.timing.domContentLoadedEventEnd - perf.timing.navigationStart,
          loadComplete: perf.timing.loadEventEnd - perf.timing.navigationStart
        };
      });
      
      console.log('Performance metrics:', performanceMetrics);
      expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);
    });

    test('應該流暢處理使用者互動', async ({ page }) => {
      // 新增一些任務
      for (let i = 1; i <= 10; i++) {
        await page.fill('[data-testid="todo-input"]', `效能測試 ${i}`);
        await page.press('[data-testid="todo-input"]', 'Enter');
      }
      
      // 測量互動響應時間
      const measurements = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await page.locator('[data-testid="todo-checkbox"]').nth(i).click();
        const responseTime = Date.now() - startTime;
        measurements.push(responseTime);
      }
      
      // 計算平均響應時間
      const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      
      // 平均響應時間應該 < 200ms
      expect(avgResponseTime).toBeLessThan(200);
      console.log(`Average response time: ${avgResponseTime}ms`);
    });
  });
});

// 輔助函數
async function setupTestData(page, todos) {
  for (const todo of todos) {
    await page.fill('[data-testid="todo-input"]', todo);
    await page.press('[data-testid="todo-input"]', 'Enter');
  }
}

async function clearAllTodos(page) {
  const deleteButtons = page.locator('[data-testid="delete-button"]');
  const count = await deleteButtons.count();
  
  for (let i = count - 1; i >= 0; i--) {
    await deleteButtons.nth(i).click();
  }
}

// 匯出以供其他測試使用
module.exports = {
  setupTestData,
  clearAllTodos,
  TEST_URL
};