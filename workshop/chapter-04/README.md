# 第三樂章：AI 執行測試腳本編寫 🎬

## 學習目標

在本章節中，您將學習如何指揮 AI 將測試策略轉化為實際的 Playwright 測試腳本：

- 🤖 **Playwright 基礎指令**：掌握核心自動化測試命令
- 🏗️ **Page Object Model**：使用 AI 建立可維護的測試架構
- 🔌 **MCP 整合實踐**：體驗 Model Context Protocol 的強大功能
- 🌐 **跨瀏覽器測試**：確保應用在不同環境下的相容性
- 📝 **雙語提示工程**：優化 AI 生成高品質測試代碼

## 前置需求

- ✅ 完成 Chapter 3：已有完整的測試策略
- ✅ 安裝 Playwright：`npm init playwright@latest`
- ✅ 設置 MCP Server：配置 Playwright MCP
- ✅ 熟悉基本 JavaScript/TypeScript

## 核心概念：從策略到腳本

### 測試腳本生成流程

```mermaid
graph LR
    A[測試策略] --> B[AI 理解需求]
    B --> C[生成測試結構]
    C --> D[實作測試邏輯]
    D --> E[優化與重構]
    E --> F[可執行測試腳本]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#9f9,stroke:#333,stroke-width:2px
```

### Playwright MCP 的革命性整合

MCP (Model Context Protocol) 讓 AI 能夠：
- 直接控制瀏覽器進行測試
- 實時觀察頁面狀態
- 動態調整測試策略
- 自動修復測試腳本

## 實作步驟

### Step 1: 環境設置與 MCP 配置

```bash
# 安裝 Playwright
npm init playwright@latest

# 安裝 MCP Server
npm install -y @modelcontextprotocol/server-playwright
```

配置 Claude Desktop 的 MCP：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-playwright"
      ]
    }
  }
}
```

### Step 2: 使用 AI 生成基礎測試結構

#### 黃金提示詞：測試腳本生成

```markdown
# Playwright Test Generation Prompt

[Context - Technical Analysis in English]
I need to create Playwright E2E tests for a TODO application.
The test should cover:
- Adding a new todo item
- Marking todo as complete
- Deleting a todo
- Filtering todos (All/Active/Completed)
- Data persistence check

[Technical Requirements]
- Use Page Object Model pattern
- Include proper assertions
- Add meaningful test descriptions
- Implement test hooks (beforeEach, afterEach)
- Use data-testid selectors when possible

[輸出需求 - Output in Chinese Comments]
生成 Playwright 測試腳本，包含：
- 中文註解說明每個測試步驟
- 清晰的測試案例命名
- 完整的錯誤處理
```

### Step 3: Page Object Model 實作

AI 將幫您建立結構化的測試架構：

```javascript
// BasePage.js - 基礎頁面類別
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(url) {
    await this.page.goto(url);
  }

  async waitForElement(selector) {
    await this.page.waitForSelector(selector);
  }
}

// TodoPage.js - TODO 應用頁面物件
class TodoPage extends BasePage {
  constructor(page) {
    super(page);
    
    // 定義選擇器
    this.todoInput = '[data-testid="todo-input"]';
    this.todoList = '[data-testid="todo-list"]';
    this.todoItem = '[data-testid="todo-item"]';
    this.deleteButton = '[data-testid="delete-btn"]';
    this.filterAll = '[data-testid="filter-all"]';
    this.filterActive = '[data-testid="filter-active"]';
    this.filterCompleted = '[data-testid="filter-completed"]';
  }

  // 新增待辦事項
  async addTodo(text) {
    await this.page.fill(this.todoInput, text);
    await this.page.press(this.todoInput, 'Enter');
  }

  // 標記完成
  async toggleTodo(index) {
    const checkbox = `${this.todoItem}:nth-child(${index}) input[type="checkbox"]`;
    await this.page.click(checkbox);
  }

  // 刪除待辦事項
  async deleteTodo(index) {
    const deleteBtn = `${this.todoItem}:nth-child(${index}) ${this.deleteButton}`;
    await this.page.click(deleteBtn);
  }

  // 取得待辦事項數量
  async getTodoCount() {
    const items = await this.page.$$(this.todoItem);
    return items.length;
  }
}
```

### Step 4: MCP 增強測試能力

使用 MCP 讓 AI 直接控制瀏覽器：

```markdown
# MCP-Enhanced Test Prompt

[MCP Context]
Use the Playwright MCP server to:
1. Navigate to the TODO application
2. Perform visual verification of UI elements
3. Take screenshots at key test points
4. Generate detailed test reports

[Dynamic Test Generation]
Create tests that adapt based on:
- Current page state
- Previous test results
- Performance metrics
- Error patterns

[中文輸出]
生成包含 MCP 功能的測試腳本
```

### Step 5: 跨瀏覽器測試配置

```javascript
// playwright.config.js
module.exports = {
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 測試 Chrome 瀏覽器
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // 測試 Firefox 瀏覽器
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // 測試 Safari 瀏覽器
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
        // 測試行動裝置
      },
    },
  ],
};
```

## 練習項目

### 練習 1：基礎 Playwright 指令 🎯
**檔案位置**: `exercises/01-basic-commands.md`

學習並實作基礎 Playwright 命令：
- 頁面導航 (`page.goto`)
- 元素互動 (`click`, `fill`, `press`)
- 等待策略 (`waitForSelector`, `waitForTimeout`)
- 斷言驗證 (`expect`)

**實作任務**：
```javascript
// 完成以下測試案例
test('應該能夠新增待辦事項', async ({ page }) => {
  // TODO: 實作測試邏輯
  // 1. 導航到應用程式
  // 2. 輸入待辦事項文字
  // 3. 按下 Enter 鍵
  // 4. 驗證項目已新增
});
```

### 練習 2：Page Object Model 實作 🏗️
**檔案位置**: `exercises/02-page-object-model.md`

建立完整的 POM 架構：
- 建立 BasePage 基礎類別
- 實作 TodoPage 頁面物件
- 分離測試邏輯與頁面操作
- 提高測試可維護性

**架構範例**：
```
/exercises/02-page-objects/
  ├── BasePage.js       # 基礎頁面類別
  ├── TodoPage.js       # TODO 頁面物件
  ├── LoginPage.js      # 登入頁面物件
  └── todo.spec.js      # 使用 POM 的測試
```

### 練習 3：MCP 整合實踐 🔌
**檔案位置**: `exercises/03-mcp-integration.md`

體驗 MCP 的強大功能：
- 配置 MCP Server
- 使用 AI 直接控制瀏覽器
- 實現智能等待策略
- 動態生成測試步驟

**MCP 配置檔案**：
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

### 練習 4：跨瀏覽器測試 🌐
**檔案位置**: `exercises/04-cross-browser.md`

實現全面的瀏覽器相容性測試：
- Chromium 系列測試
- Firefox 相容性驗證
- WebKit (Safari) 測試
- 行動裝置模擬測試

**測試矩陣**：
| 瀏覽器 | 桌面版 | 行動版 | 測試重點 |
|-------|--------|--------|----------|
| Chrome | ✅ | ✅ | 主要功能 |
| Firefox | ✅ | ❌ | 相容性 |
| Safari | ✅ | ✅ | iOS 體驗 |
| Edge | ✅ | ❌ | 企業環境 |

## 完整測試腳本範例

查看 `playwright-tests/` 目錄中的完整測試腳本：

```javascript
// todo-complete.spec.js
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO 應用程式完整測試', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate('http://localhost:3000');
  });

  test('完整的 CRUD 操作流程', async () => {
    // 新增待辦事項
    await todoPage.addTodo('學習 Playwright');
    await todoPage.addTodo('實作測試腳本');
    await todoPage.addTodo('執行跨瀏覽器測試');
    
    // 驗證項目數量
    expect(await todoPage.getTodoCount()).toBe(3);
    
    // 標記完成
    await todoPage.toggleTodo(1);
    
    // 篩選已完成項目
    await todoPage.filterCompleted();
    expect(await todoPage.getTodoCount()).toBe(1);
    
    // 刪除項目
    await todoPage.deleteTodo(1);
    expect(await todoPage.getTodoCount()).toBe(0);
  });

  test('資料持久化驗證', async ({ page }) => {
    // 新增項目
    await todoPage.addTodo('持久化測試');
    
    // 重新載入頁面
    await page.reload();
    
    // 驗證資料仍存在
    expect(await todoPage.getTodoCount()).toBe(1);
  });
});
```

## 範例輸出

`example-output/` 目錄包含：

- `complete-todo-test.spec.js` - 完整的測試腳本
- `page-objects/` - POM 實作範例
- `test-results/` - 測試執行報告
- `screenshots/` - 測試截圖

## 思考與挑戰 💭

### 深度思考問題

1. **測試穩定性**：如何確保 AI 生成的測試腳本具有良好的穩定性？
2. **選擇器策略**：data-testid vs CSS selector vs XPath，如何選擇？
3. **測試資料管理**：如何有效管理測試資料和測試環境？
4. **效能考量**：大量測試執行時，如何優化執行時間？

### 進階挑戰

🚀 **挑戰 1：視覺迴歸測試**
整合視覺測試工具，實現 UI 變更的自動檢測。

🚀 **挑戰 2：API 測試整合**
結合 API 測試與 E2E 測試，實現全面的測試覆蓋。

🚀 **挑戰 3：CI/CD 整合**
將測試腳本整合到 CI/CD pipeline，實現自動化測試流程。

🚀 **挑戰 4：測試報告優化**
使用 AI 生成智能測試報告，包含失敗分析和改進建議。

## 最佳實踐指南 📚

### 測試腳本編寫原則

1. **獨立性**：每個測試應該獨立執行，不依賴其他測試
2. **可讀性**：使用描述性的測試名稱和清晰的步驟
3. **可維護性**：使用 Page Object Model 分離關注點
4. **穩定性**：使用智能等待策略，避免硬編碼等待時間
5. **可擴展性**：設計易於擴展的測試架構

### AI 提示詞優化技巧

```markdown
# 優化前
寫一個測試腳本

# 優化後
[Context]
Application: TODO app with CRUD operations
Framework: Playwright with TypeScript
Pattern: Page Object Model

[Requirements]
1. Test should be independent and idempotent
2. Use data-testid selectors
3. Include proper error handling
4. Add Chinese comments for clarity

[Expected Output]
Complete test script with:
- Setup and teardown
- Clear test steps
- Meaningful assertions
- Error recovery logic
```

## 常見問題 ❓

### Q1: Playwright 與 Selenium 的差異？
**A**: Playwright 提供更現代的 API、更好的效能、內建等待機制，以及對現代 web 功能的原生支援。

### Q2: 如何處理動態內容測試？
**A**: 使用 Playwright 的智能等待機制，如 `waitForSelector`、`waitForLoadState`，避免使用固定時間等待。

### Q3: MCP 整合的價值在哪？
**A**: MCP 讓 AI 能直接觀察和控制瀏覽器，實現更智能的測試生成和執行，減少人工介入。

### Q4: 如何除錯 AI 生成的測試腳本？
**A**: 使用 Playwright 的除錯模式 (`--debug`)、追蹤檔案 (`--trace`)，以及詳細的日誌輸出。

## 學習檢查點 ✅

完成本章後，您應該能夠：

- [ ] 熟練使用 Playwright 基礎命令
- [ ] 實作 Page Object Model 架構
- [ ] 配置並使用 MCP 增強測試能力
- [ ] 執行跨瀏覽器測試
- [ ] 使用雙語提示詞生成高品質測試腳本
- [ ] 理解測試腳本的最佳實踐

## 執行您的測試

```bash
# 執行所有測試
npx playwright test

# 執行特定測試檔案
npx playwright test todo-complete.spec.js

# 以 UI 模式執行
npx playwright test --ui

# 生成測試報告
npx playwright show-report

# 除錯模式
npx playwright test --debug
```

## 下一步

太棒了！您已經學會如何使用 AI 編寫 Playwright 測試腳本。下一章，我們將學習如何使用 AI 分析測試結果並進行智能除錯。

➡️ [前往 Chapter 5: AI 進行測試分析與除錯](../chapter-05/README.md)

---

💡 **專業提示**: 優秀的測試腳本就像優秀的代碼一樣，需要不斷重構和優化。使用 AI 作為您的結對程式設計夥伴，持續改進測試品質。

🎭 **Play right with AI** - 讓測試腳本成為您應用品質的守護者！