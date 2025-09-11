# 練習 2：Page Object Model 實作 🏗️

## 學習目標

通過本練習，您將學會：
- 設計和實作 Page Object Model (POM) 架構
- 分離測試邏輯與頁面操作
- 提高測試的可維護性和可重用性
- 使用 AI 協助生成 POM 結構

## 背景說明

Page Object Model 是一種設計模式，將頁面的結構和行為封裝在物件中，使測試代碼更清晰、更易維護。每個頁面或元件都有對應的 Page Object 類別。

## POM 架構設計

```
02-page-objects/
├── pages/
│   ├── BasePage.js         # 基礎頁面類別
│   ├── TodoPage.js          # TODO 主頁面
│   ├── components/
│   │   ├── Header.js        # 頁首元件
│   │   ├── TodoItem.js      # 任務項目元件
│   │   └── FilterBar.js     # 篩選條元件
├── tests/
│   ├── todo-crud.spec.js    # CRUD 操作測試
│   ├── todo-filter.spec.js  # 篩選功能測試
│   └── todo-batch.spec.js   # 批量操作測試
├── fixtures/
│   └── testData.js          # 測試資料
└── utils/
    └── helpers.js           # 輔助函數

```

## Part 1: 建立基礎架構

### 任務 1.1: 創建 BasePage 類別

創建 `pages/BasePage.js`：

```javascript
/**
 * BasePage - 所有頁面物件的基礎類別
 * 提供通用的頁面操作方法
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * 導航到指定 URL
   * @param {string} url - 目標 URL
   */
  async navigate(url) {
    // TODO: 實作導航邏輯
    // 1. 使用 page.goto()
    // 2. 等待頁面載入完成
    // 3. 處理可能的錯誤
  }

  /**
   * 等待元素出現
   * @param {string} selector - 元素選擇器
   * @param {number} timeout - 超時時間
   */
  async waitForElement(selector, timeout = 30000) {
    // TODO: 實作等待邏輯
  }

  /**
   * 取得元素文字
   * @param {string} selector - 元素選擇器
   * @returns {Promise<string>} 元素文字內容
   */
  async getText(selector) {
    // TODO: 實作取得文字邏輯
  }

  /**
   * 檢查元素是否可見
   * @param {string} selector - 元素選擇器
   * @returns {Promise<boolean>} 是否可見
   */
  async isVisible(selector) {
    // TODO: 實作可見性檢查
  }

  /**
   * 截圖
   * @param {string} filename - 檔案名稱
   */
  async takeScreenshot(filename) {
    // TODO: 實作截圖功能
  }

  /**
   * 等待網路空閒
   */
  async waitForNetworkIdle() {
    // TODO: 等待網路請求完成
  }
}

module.exports = BasePage;
```

### AI 輔助提示詞

```markdown
# BasePage Implementation

Help me implement a robust BasePage class for Playwright with:
1. Navigation with retry logic
2. Smart waiting strategies
3. Error handling
4. Logging capabilities
5. Common utility methods

[Requirements]
- All methods should be async
- Include JSDoc comments
- Handle timeouts gracefully
- Support debugging

[輸出]
完整的 BasePage 實作，包含中文註解
```

## Part 2: 實作 TodoPage

### 任務 2.1: 創建 TodoPage 類別

創建 `pages/TodoPage.js`：

```javascript
const BasePage = require('./BasePage');

/**
 * TodoPage - TODO 應用主頁面物件
 */
class TodoPage extends BasePage {
  constructor(page) {
    super(page);
    
    // 定義選擇器
    this.selectors = {
      // 輸入區域
      todoInput: '[data-testid="todo-input"]',
      addButton: '[data-testid="add-button"]',
      
      // 任務列表
      todoList: '[data-testid="todo-list"]',
      todoItem: '[data-testid="todo-item"]',
      todoCheckbox: '[data-testid="todo-checkbox"]',
      todoText: '[data-testid="todo-text"]',
      deleteButton: '[data-testid="delete-button"]',
      
      // 篩選條
      filterAll: '[data-testid="filter-all"]',
      filterActive: '[data-testid="filter-active"]',
      filterCompleted: '[data-testid="filter-completed"]',
      
      // 統計
      todoCount: '[data-testid="todo-count"]',
      clearCompleted: '[data-testid="clear-completed"]'
    };
  }

  /**
   * 導航到 TODO 應用
   */
  async goto() {
    // TODO: 實作導航
    await this.navigate('http://localhost:3000');
  }

  /**
   * 新增待辦事項
   * @param {string} text - 任務文字
   */
  async addTodo(text) {
    // TODO: 實作新增任務
    // 1. 填入文字
    // 2. 按 Enter 或點擊新增按鈕
    // 3. 等待任務出現在列表中
  }

  /**
   * 標記任務完成/未完成
   * @param {number} index - 任務索引（從 1 開始）
   */
  async toggleTodo(index) {
    // TODO: 實作切換完成狀態
  }

  /**
   * 刪除任務
   * @param {number} index - 任務索引
   */
  async deleteTodo(index) {
    // TODO: 實作刪除功能
  }

  /**
   * 編輯任務
   * @param {number} index - 任務索引
   * @param {string} newText - 新文字
   */
  async editTodo(index, newText) {
    // TODO: 實作編輯功能（如果支援）
    // 1. 雙擊任務文字
    // 2. 清除並輸入新文字
    // 3. 按 Enter 保存
  }

  /**
   * 取得所有任務
   * @returns {Promise<Array>} 任務陣列
   */
  async getAllTodos() {
    // TODO: 取得所有任務資訊
    // 返回格式: [{ text: '任務1', completed: false }, ...]
  }

  /**
   * 取得任務數量
   * @returns {Promise<number>} 任務總數
   */
  async getTodoCount() {
    // TODO: 計算任務數量
  }

  /**
   * 篩選任務
   * @param {'all'|'active'|'completed'} filter - 篩選類型
   */
  async filterTodos(filter) {
    // TODO: 實作篩選功能
  }

  /**
   * 清除所有已完成任務
   */
  async clearCompleted() {
    // TODO: 實作清除已完成
  }

  /**
   * 批量新增任務
   * @param {Array<string>} tasks - 任務文字陣列
   */
  async addMultipleTodos(tasks) {
    // TODO: 批量新增
    for (const task of tasks) {
      await this.addTodo(task);
    }
  }

  /**
   * 檢查任務是否存在
   * @param {string} text - 任務文字
   * @returns {Promise<boolean>} 是否存在
   */
  async todoExists(text) {
    // TODO: 檢查特定任務是否存在
  }

  /**
   * 取得已完成任務數量
   * @returns {Promise<number>} 已完成數量
   */
  async getCompletedCount() {
    // TODO: 計算已完成任務數
  }

  /**
   * 驗證頁面載入完成
   */
  async waitForPageReady() {
    // TODO: 等待頁面關鍵元素載入
    await this.waitForElement(this.selectors.todoInput);
  }
}

module.exports = TodoPage;
```

## Part 3: 創建元件物件

### 任務 3.1: Header 元件

創建 `pages/components/Header.js`：

```javascript
class Header {
  constructor(page) {
    this.page = page;
    this.selectors = {
      title: 'h1',
      todoInput: '.new-todo',
      toggleAll: '.toggle-all'
    };
  }

  async getTitle() {
    // TODO: 取得標題文字
  }

  async toggleAllTodos() {
    // TODO: 全選/取消全選
  }
}

module.exports = Header;
```

### 任務 3.2: TodoItem 元件

創建 `pages/components/TodoItem.js`：

```javascript
class TodoItem {
  constructor(page, index) {
    this.page = page;
    this.index = index;
    this.root = `.todo-item:nth-child(${index})`;
  }

  async getText() {
    // TODO: 取得任務文字
  }

  async toggle() {
    // TODO: 切換完成狀態
  }

  async delete() {
    // TODO: 刪除任務
  }

  async edit(newText) {
    // TODO: 編輯任務
  }

  async isCompleted() {
    // TODO: 檢查是否已完成
  }
}

module.exports = TodoItem;
```

### 任務 3.3: FilterBar 元件

創建 `pages/components/FilterBar.js`：

```javascript
class FilterBar {
  constructor(page) {
    this.page = page;
    this.selectors = {
      all: '[href="#/"]',
      active: '[href="#/active"]',
      completed: '[href="#/completed"]',
      count: '.todo-count',
      clearCompleted: '.clear-completed'
    };
  }

  async selectFilter(filter) {
    // TODO: 選擇篩選器
  }

  async getActiveFilter() {
    // TODO: 取得當前篩選狀態
  }

  async getItemCount() {
    // TODO: 取得項目計數
  }

  async clearCompleted() {
    // TODO: 清除已完成
  }
}

module.exports = FilterBar;
```

## Part 4: 使用 POM 撰寫測試

### 任務 4.1: CRUD 操作測試

創建 `tests/todo-crud.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');
const TodoPage = require('../pages/TodoPage');

test.describe('TODO CRUD 操作測試', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForPageReady();
  });

  test('新增單一任務', async () => {
    // TODO: 使用 POM 實作測試
    // 1. 新增任務
    await todoPage.addTodo('學習 Playwright');
    
    // 2. 驗證任務存在
    const exists = await todoPage.todoExists('學習 Playwright');
    expect(exists).toBeTruthy();
    
    // 3. 驗證數量
    const count = await todoPage.getTodoCount();
    expect(count).toBe(1);
  });

  test('編輯任務', async () => {
    // TODO: 實作編輯測試
  });

  test('刪除任務', async () => {
    // TODO: 實作刪除測試
  });

  test('標記完成', async () => {
    // TODO: 實作完成狀態測試
  });

  test('批量操作', async () => {
    // TODO: 實作批量操作測試
    const tasks = ['任務1', '任務2', '任務3'];
    await todoPage.addMultipleTodos(tasks);
    
    // 驗證所有任務
    for (const task of tasks) {
      expect(await todoPage.todoExists(task)).toBeTruthy();
    }
  });
});
```

### 任務 4.2: 篩選功能測試

創建 `tests/todo-filter.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');
const TodoPage = require('../pages/TodoPage');

test.describe('TODO 篩選功能測試', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    
    // 準備測試資料
    await todoPage.addTodo('進行中任務');
    await todoPage.addTodo('已完成任務');
    await todoPage.toggleTodo(2);
  });

  test('篩選進行中任務', async () => {
    // TODO: 實作篩選測試
    await todoPage.filterTodos('active');
    // 驗證只顯示進行中任務
  });

  test('篩選已完成任務', async () => {
    // TODO: 實作篩選測試
    await todoPage.filterTodos('completed');
    // 驗證只顯示已完成任務
  });

  test('顯示所有任務', async () => {
    // TODO: 實作顯示全部測試
    await todoPage.filterTodos('all');
    // 驗證顯示所有任務
  });
});
```

## Part 5: 測試資料管理

### 任務 5.1: 創建測試資料

創建 `fixtures/testData.js`：

```javascript
const testData = {
  todos: {
    valid: [
      '購買牛奶',
      '完成專案報告',
      '預約醫生',
      '學習 Playwright'
    ],
    invalid: [
      '',
      '   ',
      null,
      undefined
    ],
    special: [
      '包含 & 特殊符號',
      '<script>alert("XSS")</script>',
      '很長的任務描述'.repeat(100),
      '😀 包含表情符號'
    ]
  },
  
  bulkData: {
    small: Array.from({ length: 5 }, (_, i) => `任務 ${i + 1}`),
    medium: Array.from({ length: 50 }, (_, i) => `任務 ${i + 1}`),
    large: Array.from({ length: 200 }, (_, i) => `任務 ${i + 1}`)
  },
  
  filters: {
    all: 'all',
    active: 'active',
    completed: 'completed'
  }
};

module.exports = testData;
```

### 任務 5.2: 輔助函數

創建 `utils/helpers.js`：

```javascript
/**
 * 輔助函數模組
 */

/**
 * 生成隨機任務文字
 * @returns {string} 隨機任務
 */
function generateRandomTodo() {
  const tasks = [
    '完成程式碼審查',
    '更新文檔',
    '修復錯誤',
    '優化效能',
    '撰寫測試'
  ];
  const random = Math.floor(Math.random() * tasks.length);
  return `${tasks[random]} - ${Date.now()}`;
}

/**
 * 等待指定時間
 * @param {number} ms - 毫秒數
 */
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重試執行
 * @param {Function} fn - 要執行的函數
 * @param {number} retries - 重試次數
 */
async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1));
    }
  }
}

module.exports = {
  generateRandomTodo,
  delay,
  retry
};
```

## Part 6: 進階 POM 技巧

### 任務 6.1: 鏈式調用

增強 TodoPage 支援鏈式調用：

```javascript
class TodoPage extends BasePage {
  async addTodo(text) {
    // 實作...
    return this; // 返回 this 支援鏈式調用
  }

  async toggleTodo(index) {
    // 實作...
    return this;
  }
}

// 使用範例
await todoPage
  .addTodo('任務1')
  .addTodo('任務2')
  .toggleTodo(1)
  .filterTodos('active');
```

### 任務 6.2: 工廠模式

創建頁面工廠：

```javascript
class PageFactory {
  static async create(page, pageName) {
    const pages = {
      'todo': TodoPage,
      'login': LoginPage,
      'settings': SettingsPage
    };
    
    const PageClass = pages[pageName];
    if (!PageClass) {
      throw new Error(`Page ${pageName} not found`);
    }
    
    return new PageClass(page);
  }
}
```

## AI 輔助優化

使用以下提示詞優化您的 POM：

```markdown
# POM Optimization

Review my Page Object Model implementation:
[貼上您的代碼]

Please suggest improvements for:
1. Code organization
2. Selector strategies
3. Method naming conventions
4. Error handling
5. Performance optimization

[輸出]
提供優化建議和改進代碼
```

## 最佳實踐檢查清單

### 設計原則 ✅

- [ ] 單一職責：每個 Page Object 只負責一個頁面
- [ ] 封裝性：隱藏實作細節，只暴露必要方法
- [ ] 可重用性：方法設計通用且可重用
- [ ] 可維護性：選擇器集中管理

### 實作品質 🎯

- [ ] 方法命名清晰描述行為
- [ ] 包含適當的錯誤處理
- [ ] 提供有用的日誌輸出
- [ ] 支援除錯模式
- [ ] 文檔註解完整

### 測試效果 🚀

- [ ] 測試代碼更簡潔
- [ ] 維護更容易
- [ ] 重複代碼減少
- [ ] 測試可讀性提升

## 提交要求

完成練習後，請確保：

1. 所有 Page Object 類別完整實作
2. 測試使用 POM 且全部通過
3. 代碼符合最佳實踐
4. 包含適當的文檔註解

執行驗證：

```bash
# 執行測試
npx playwright test tests/

# 檢查代碼品質
npx eslint pages/ tests/

# 生成測試報告
npx playwright show-report
```

## 學習資源

- [Page Object Model 設計模式](https://martinfowler.com/bliki/PageObject.html)
- [Playwright POM 最佳實踐](https://playwright.dev/docs/pom)
- [測試架構設計](https://testautomationu.applitools.com/page-object-model/)

---

🏗️ **架構提示**: 好的 POM 設計讓測試維護變得簡單。記住：頁面變了，只需要更新 Page Object！

🎭 **Play right with AI** - 用 POM 構建可維護的測試架構！