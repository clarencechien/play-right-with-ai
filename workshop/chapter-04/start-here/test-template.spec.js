/**
 * Playwright 測試模板
 * 使用此模板開始撰寫您的測試
 * @description TODO 應用程式測試起始模板
 */

const { test, expect } = require('@playwright/test');

// ============================================
// 測試配置
// ============================================
const CONFIG = {
  url: 'http://localhost:3000',
  timeout: 30000,
  retries: 2
};

// ============================================
// 選擇器定義
// ============================================
const SELECTORS = {
  // TODO: 定義您的選擇器
  todoInput: '[data-testid="todo-input"]',
  todoItem: '[data-testid="todo-item"]',
  todoCheckbox: '[data-testid="todo-checkbox"]',
  deleteButton: '[data-testid="delete-button"]',
  filterAll: '[data-testid="filter-all"]',
  filterActive: '[data-testid="filter-active"]',
  filterCompleted: '[data-testid="filter-completed"]'
};

// ============================================
// 測試套件
// ============================================
test.describe('TODO 應用程式測試', () => {
  
  // 測試前準備
  test.beforeEach(async ({ page }) => {
    // TODO: 實作測試前準備
    // 1. 導航到應用程式
    // 2. 等待頁面載入
    // 3. 清理測試環境
    
    await page.goto(CONFIG.url);
    // 在此新增更多準備步驟...
  });

  // 測試後清理
  test.afterEach(async ({ page }, testInfo) => {
    // TODO: 實作測試後清理
    // 1. 截圖（如果測試失敗）
    // 2. 清理測試資料
    // 3. 記錄測試結果
    
    if (testInfo.status !== testInfo.expectedStatus) {
      // 測試失敗時的處理
    }
  });

  // ============================================
  // Test 1: 新增待辦事項
  // ============================================
  test('應該能夠新增待辦事項', async ({ page }) => {
    // TODO: 實作測試邏輯
    
    // Arrange - 準備測試資料
    const todoText = '我的第一個待辦事項';
    
    // Act - 執行操作
    // TODO: 填入文字並提交
    
    // Assert - 驗證結果
    // TODO: 驗證任務已新增
    
  });

  // ============================================
  // Test 2: 標記任務完成
  // ============================================
  test('應該能夠標記任務為完成', async ({ page }) => {
    // TODO: 實作測試邏輯
    
    // Arrange
    // TODO: 新增一個測試任務
    
    // Act
    // TODO: 點擊核取方塊
    
    // Assert
    // TODO: 驗證任務狀態改變
    
  });

  // ============================================
  // Test 3: 刪除任務
  // ============================================
  test('應該能夠刪除任務', async ({ page }) => {
    // TODO: 實作測試邏輯
    
    // Arrange
    // TODO: 新增測試任務
    
    // Act
    // TODO: 點擊刪除按鈕
    
    // Assert
    // TODO: 驗證任務已刪除
    
  });

  // ============================================
  // Test 4: 篩選任務
  // ============================================
  test.describe('篩選功能', () => {
    
    test.beforeEach(async ({ page }) => {
      // TODO: 準備不同狀態的任務
      // 1. 新增進行中任務
      // 2. 新增已完成任務
    });

    test('應該能夠篩選進行中的任務', async ({ page }) => {
      // TODO: 實作篩選測試
      
      // Act
      // TODO: 點擊 "Active" 篩選器
      
      // Assert
      // TODO: 驗證只顯示進行中任務
      
    });

    test('應該能夠篩選已完成的任務', async ({ page }) => {
      // TODO: 實作篩選測試
      
      // Act
      // TODO: 點擊 "Completed" 篩選器
      
      // Assert
      // TODO: 驗證只顯示已完成任務
      
    });
  });

  // ============================================
  // Test 5: 資料持久化
  // ============================================
  test('應該在重新載入後保留任務', async ({ page }) => {
    // TODO: 實作持久化測試
    
    // Arrange
    // TODO: 新增任務
    
    // Act
    // TODO: 重新載入頁面
    
    // Assert
    // TODO: 驗證任務仍存在
    
  });

  // ============================================
  // Test 6: 邊界測試
  // ============================================
  test.describe('邊界條件測試', () => {
    
    test('應該處理空白輸入', async ({ page }) => {
      // TODO: 測試空白輸入處理
    });

    test('應該處理超長文字', async ({ page }) => {
      // TODO: 測試長文字處理
      const longText = 'a'.repeat(500);
    });

    test('應該處理特殊字元', async ({ page }) => {
      // TODO: 測試特殊字元處理
      const specialChars = '<script>alert("test")</script>';
    });
  });

  // ============================================
  // Test 7: 鍵盤操作
  // ============================================
  test('應該支援鍵盤操作', async ({ page }) => {
    // TODO: 實作鍵盤操作測試
    
    // Test Tab navigation
    // TODO: await page.keyboard.press('Tab');
    
    // Test Enter to submit
    // TODO: await page.keyboard.press('Enter');
    
    // Test Escape to cancel
    // TODO: await page.keyboard.press('Escape');
  });

  // ============================================
  // Test 8: 效能測試
  // ============================================
  test('應該在合理時間內載入', async ({ page }) => {
    // TODO: 實作效能測試
    
    const startTime = Date.now();
    // TODO: 載入頁面
    const loadTime = Date.now() - startTime;
    
    // Assert
    // expect(loadTime).toBeLessThan(2000);
  });
});

// ============================================
// 輔助函數
// ============================================

/**
 * 新增待辦事項的輔助函數
 * @param {Page} page - Playwright page 物件
 * @param {string} text - 待辦事項文字
 */
async function addTodo(page, text) {
  // TODO: 實作輔助函數
  await page.fill(SELECTORS.todoInput, text);
  await page.press(SELECTORS.todoInput, 'Enter');
}

/**
 * 取得所有待辦事項
 * @param {Page} page - Playwright page 物件
 * @returns {Promise<string[]>} 待辦事項文字陣列
 */
async function getAllTodos(page) {
  // TODO: 實作輔助函數
  const todos = await page.locator(SELECTORS.todoItem).allTextContents();
  return todos;
}

/**
 * 清除所有待辦事項
 * @param {Page} page - Playwright page 物件
 */
async function clearAllTodos(page) {
  // TODO: 實作輔助函數
  const deleteButtons = page.locator(SELECTORS.deleteButton);
  const count = await deleteButtons.count();
  
  for (let i = count - 1; i >= 0; i--) {
    await deleteButtons.nth(i).click();
  }
}

/**
 * 等待動畫完成
 * @param {Page} page - Playwright page 物件
 * @param {number} duration - 等待時間（毫秒）
 */
async function waitForAnimation(page, duration = 300) {
  await page.waitForTimeout(duration);
}

// ============================================
// 自訂斷言
// ============================================

/**
 * 驗證待辦事項數量
 * @param {Page} page - Playwright page 物件
 * @param {number} expectedCount - 預期數量
 */
async function expectTodoCount(page, expectedCount) {
  const todos = page.locator(SELECTORS.todoItem);
  await expect(todos).toHaveCount(expectedCount);
}

/**
 * 驗證待辦事項文字
 * @param {Page} page - Playwright page 物件
 * @param {number} index - 項目索引
 * @param {string} expectedText - 預期文字
 */
async function expectTodoText(page, index, expectedText) {
  const todo = page.locator(SELECTORS.todoItem).nth(index);
  await expect(todo).toContainText(expectedText);
}

// ============================================
// 測試資料
// ============================================

const TEST_DATA = {
  todos: {
    valid: [
      '購買牛奶',
      '完成報告',
      '運動 30 分鐘'
    ],
    invalid: [
      '',
      '   ',
      null
    ],
    special: [
      '包含 & 符號',
      '<script>XSS</script>',
      '😀 表情符號'
    ]
  }
};

// ============================================
// AI 輔助提示
// ============================================

/**
 * 使用以下提示詞來完成測試實作：
 * 
 * Prompt:
 * Help me implement the TODO tests in this template.
 * I need to test:
 * 1. Adding todos
 * 2. Marking as complete
 * 3. Deleting todos
 * 4. Filtering (all/active/completed)
 * 5. Data persistence
 * 
 * Please provide:
 * - Complete test implementations
 * - Proper assertions
 * - Error handling
 * - Chinese comments
 */

// ============================================
// 測試執行指令
// ============================================

/**
 * 執行測試：
 * npx playwright test test-template.spec.js
 * 
 * 除錯模式：
 * npx playwright test test-template.spec.js --debug
 * 
 * UI 模式：
 * npx playwright test test-template.spec.js --ui
 * 
 * 生成報告：
 * npx playwright show-report
 */

// ============================================
// 注意事項
// ============================================

/**
 * 1. 記得更新選擇器以符合您的應用程式
 * 2. 調整超時設定以符合需求
 * 3. 新增適當的錯誤處理
 * 4. 考慮測試的獨立性
 * 5. 避免測試之間的相依性
 */

// ============================================
// 匯出模組
// ============================================

module.exports = {
  addTodo,
  getAllTodos,
  clearAllTodos,
  expectTodoCount,
  expectTodoText,
  TEST_DATA,
  CONFIG,
  SELECTORS
};