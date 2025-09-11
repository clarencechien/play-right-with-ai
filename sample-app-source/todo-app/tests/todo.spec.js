/**
 * TODO 應用程式測試規範
 * 使用 Playwright 進行端對端測試
 */

const { test, expect } = require('@playwright/test');

test.describe('TODO 應用程式', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + __dirname + '/../src/index.html');
  });

  test.describe('基本功能', () => {
    test('應該顯示應用標題', async ({ page }) => {
      const title = await page.locator('h1');
      await expect(title).toContainText('我的待辦事項');
    });

    test('應該有輸入框和新增按鈕', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await expect(input).toBeVisible();
      await expect(addButton).toBeVisible();
    });
  });

  test.describe('新增待辦事項', () => {
    test('應該能新增待辦事項', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill('購買牛奶');
      await addButton.click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toContainText('購買牛奶');
    });

    test('應該在新增後清空輸入框', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill('測試項目');
      await addButton.click();
      
      await expect(input).toHaveValue('');
    });

    test('不應該新增空白待辦事項', async ({ page }) => {
      const addButton = page.locator('[data-testid="add-button"]');
      const initialCount = await page.locator('[data-testid="todo-item"]').count();
      
      await addButton.click();
      
      const afterCount = await page.locator('[data-testid="todo-item"]').count();
      expect(afterCount).toBe(initialCount);
    });

    test('應該支援 Enter 鍵新增', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      
      await input.fill('使用 Enter 新增');
      await input.press('Enter');
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toContainText('使用 Enter 新增');
    });
  });

  test.describe('標記完成狀態', () => {
    test('應該能標記待辦事項為完成', async ({ page }) => {
      // 先新增一個項目
      await page.locator('[data-testid="todo-input"]').fill('待完成項目');
      await page.locator('[data-testid="add-button"]').click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      const checkbox = todoItem.locator('input[type="checkbox"]');
      
      await checkbox.click();
      await expect(todoItem).toHaveClass(/completed/);
    });

    test('應該能取消完成狀態', async ({ page }) => {
      // 新增並標記完成
      await page.locator('[data-testid="todo-input"]').fill('測試項目');
      await page.locator('[data-testid="add-button"]').click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      const checkbox = todoItem.locator('input[type="checkbox"]');
      
      await checkbox.click(); // 標記完成
      await checkbox.click(); // 取消完成
      
      await expect(todoItem).not.toHaveClass(/completed/);
    });
  });

  test.describe('刪除功能', () => {
    test('應該能刪除待辦事項', async ({ page }) => {
      // 新增項目
      await page.locator('[data-testid="todo-input"]').fill('即將刪除');
      await page.locator('[data-testid="add-button"]').click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      const deleteButton = todoItem.locator('[data-testid="delete-button"]');
      
      await deleteButton.click();
      await expect(todoItem).not.toBeVisible();
    });
  });

  test.describe('篩選功能', () => {
    test.beforeEach(async ({ page }) => {
      // 新增測試資料
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill('已完成項目');
      await addButton.click();
      await page.locator('[data-testid="todo-item"]').first().locator('input[type="checkbox"]').click();
      
      await input.fill('未完成項目');
      await addButton.click();
    });

    test('應該能篩選所有項目', async ({ page }) => {
      const filterAll = page.locator('[data-filter="all"]');
      await filterAll.click();
      
      const items = await page.locator('[data-testid="todo-item"]').count();
      expect(items).toBe(2);
    });

    test('應該能篩選進行中項目', async ({ page }) => {
      const filterActive = page.locator('[data-filter="active"]');
      await filterActive.click();
      
      const items = page.locator('[data-testid="todo-item"]');
      await expect(items).toHaveCount(1);
      await expect(items.first()).toContainText('未完成項目');
    });

    test('應該能篩選已完成項目', async ({ page }) => {
      const filterCompleted = page.locator('[data-filter="completed"]');
      await filterCompleted.click();
      
      const items = page.locator('[data-testid="todo-item"]');
      await expect(items).toHaveCount(1);
      await expect(items.first()).toContainText('已完成項目');
    });
  });

  test.describe('持久化儲存', () => {
    test('應該在重新載入後保留待辦事項', async ({ page, context }) => {
      // 新增項目
      await page.locator('[data-testid="todo-input"]').fill('持久化測試');
      await page.locator('[data-testid="add-button"]').click();
      
      // 重新載入頁面
      await page.reload();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toContainText('持久化測試');
    });

    test('應該保存完成狀態', async ({ page }) => {
      // 新增並標記完成
      await page.locator('[data-testid="todo-input"]').fill('狀態測試');
      await page.locator('[data-testid="add-button"]').click();
      
      const checkbox = page.locator('[data-testid="todo-item"]').first().locator('input[type="checkbox"]');
      await checkbox.click();
      
      // 重新載入
      await page.reload();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toHaveClass(/completed/);
    });
  });

  test.describe('統計功能', () => {
    test('應該顯示待辦事項總數', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill('項目1');
      await addButton.click();
      await input.fill('項目2');
      await addButton.click();
      
      const stats = page.locator('[data-testid="stats"]');
      await expect(stats).toContainText('總計: 2');
    });

    test('應該顯示已完成數量', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill('項目1');
      await addButton.click();
      await input.fill('項目2');
      await addButton.click();
      
      await page.locator('[data-testid="todo-item"]').first().locator('input[type="checkbox"]').click();
      
      const stats = page.locator('[data-testid="stats"]');
      await expect(stats).toContainText('已完成: 1');
    });
  });

  test.describe('錯誤處理', () => {
    test('應該處理超長文字輸入', async ({ page }) => {
      const longText = 'a'.repeat(1000);
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill(longText);
      await addButton.click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toBeVisible();
    });

    test('應該處理特殊字元', async ({ page }) => {
      const specialText = '<script>alert("XSS")</script>';
      const input = page.locator('[data-testid="todo-input"]');
      const addButton = page.locator('[data-testid="add-button"]');
      
      await input.fill(specialText);
      await addButton.click();
      
      const todoItem = page.locator('[data-testid="todo-item"]').first();
      await expect(todoItem).toContainText(specialText);
      
      // 確保沒有執行腳本
      const alerts = [];
      page.on('dialog', dialog => alerts.push(dialog));
      await page.waitForTimeout(1000);
      expect(alerts.length).toBe(0);
    });
  });
});