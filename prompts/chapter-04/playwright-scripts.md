# Chapter 4: Playwright Test Script Generation Golden Prompt

## Version: 1.1.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT-4, Gemini Pro

---

## Professional Playwright Test Suite Prompt

```markdown
You are a senior test automation engineer specializing in Playwright with 10+ years of experience in building robust, maintainable test frameworks.

## Technical Specification (Think in English)

### Test Automation Architecture

1. **Framework Design Principles**:
   ```
   Architecture components:
   - Page Object Model (POM) for maintainability
   - Fixture pattern for test setup/teardown
   - Data-driven testing with external data sources
   - Configuration management (environments, browsers)
   - Reporting and logging infrastructure
   
   Quality metrics:
   - Test execution time < 5 minutes for smoke tests
   - Flakiness rate < 1%
   - Maintenance effort < 20% of development time
   ```

2. **Selector Strategy Matrix**:
   ```
   Priority order:
   1. User-facing attributes (role, text, label)
   2. Semantic HTML (aria-label, data-testid)
   3. CSS selectors (stable classes, IDs)
   4. XPath (only when necessary)
   
   Anti-patterns to avoid:
   - nth-child without context
   - Deeply nested selectors
   - Dynamic class names
   - Absolute XPath
   ```

3. **Synchronization Strategy**:
   ```
   Wait mechanisms:
   - Auto-waiting (Playwright default)
   - Custom wait conditions (waitForFunction)
   - Network idle (waitForLoadState)
   - Animation completion (waitForTimeout)
   - Request/Response matching (waitForResponse)
   
   Timeout hierarchy:
   - Global: 30s
   - Action: 15s
   - Assertion: 5s
   - Navigation: 30s
   ```

4. **Error Recovery Protocol**:
   ```
   Error handling layers:
   1. Try-catch for expected failures
   2. Retry mechanism for transient issues
   3. Screenshot/video on failure
   4. Detailed error logging with context
   5. Graceful test suite continuation
   
   Retry strategy:
   - Network errors: 3 retries with exponential backoff
   - Element not found: 2 retries with DOM refresh
   - Assertion failures: No retry (fail fast)
   ```

5. **Performance Optimization Techniques**:
   ```
   Optimization areas:
   - Parallel execution (workers = CPU cores)
   - Browser context reuse (shared authentication)
   - Selective media capture (failures only)
   - API response mocking (reduce network latency)
   - Resource preloading (cache static assets)
   
   Performance targets:
   - Test startup: < 2s
   - Page navigation: < 3s
   - API responses: < 500ms
   - Total suite runtime: < 10 minutes
   ```

## Test Requirements
[INSERT TEST PLAN OR APPLICATION DETAILS]

## 輸出要求 (Output in Chinese)

### Playwright 測試腳本實作

Based on the technical specification above, provide a complete Playwright test suite implementation in Traditional Chinese with the following requirements:

1. Use TypeScript with strict typing
2. Implement Page Object Model pattern
3. Include comprehensive error handling
4. Add detailed Chinese comments
5. Follow Playwright best practices

### 1. 專案結構
```
playwright-tests/
├── tests/
│   ├── e2e/
│   │   ├── [feature].spec.ts
│   │   └── [feature2].spec.ts
│   ├── pages/
│   │   ├── basePage.ts
│   │   ├── [page1].page.ts
│   │   └── [page2].page.ts
│   ├── fixtures/
│   │   └── test.fixtures.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── test-data.ts
│   └── types/
│       └── test.types.ts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

### 2. 設定檔 (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### 3. Base Page Object

```typescript
// pages/basePage.ts
import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 導航到指定 URL
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 等待元素出現並返回
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * 安全點擊（含重試機制）
   */
  async safeClick(selector: string, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.click(selector, { timeout: 5000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * 擷取錯誤截圖
   */
  async captureScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * 驗證頁面標題
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }
}
```

### 4. 具體 Page Object 範例

```typescript
// pages/todoApp.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './basePage';

export class TodoAppPage extends BasePage {
  // 定位器定義
  readonly todoInput: Locator;
  readonly addButton: Locator;
  readonly todoList: Locator;
  readonly todoItems: Locator;
  readonly completeCheckbox: (index: number) => Locator;
  readonly deleteButton: (index: number) => Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;
  readonly todoCount: Locator;

  constructor(page: Page) {
    super(page);
    
    // 初始化所有定位器
    this.todoInput = page.getByTestId('todo-input');
    this.addButton = page.getByRole('button', { name: '新增' });
    this.todoList = page.getByTestId('todo-list');
    this.todoItems = page.locator('[data-testid^="todo-item-"]');
    this.completeCheckbox = (index: number) => 
      page.locator(`[data-testid="todo-item-${index}"] input[type="checkbox"]`);
    this.deleteButton = (index: number) => 
      page.locator(`[data-testid="todo-item-${index}"] button.delete`);
    this.filterAll = page.getByRole('button', { name: '全部' });
    this.filterActive = page.getByRole('button', { name: '進行中' });
    this.filterCompleted = page.getByRole('button', { name: '已完成' });
    this.todoCount = page.getByTestId('todo-count');
  }

  /**
   * 新增待辦事項
   */
  async addTodo(text: string): Promise<void> {
    await this.todoInput.fill(text);
    await this.addButton.click();
    
    // 驗證項目已新增
    await expect(this.todoItems).toContainText(text);
  }

  /**
   * 標記待辦事項為完成
   */
  async completeTodo(index: number): Promise<void> {
    const checkbox = this.completeCheckbox(index);
    await checkbox.check();
    
    // 驗證狀態變更
    await expect(checkbox).toBeChecked();
  }

  /**
   * 刪除待辦事項
   */
  async deleteTodo(index: number): Promise<void> {
    const initialCount = await this.todoItems.count();
    await this.deleteButton(index).click();
    
    // 確認刪除對話框（如果有）
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible()) {
      await this.page.getByRole('button', { name: '確認' }).click();
    }
    
    // 驗證項目已刪除
    await expect(this.todoItems).toHaveCount(initialCount - 1);
  }

  /**
   * 取得待辦事項數量
   */
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  /**
   * 篩選待辦事項
   */
  async filterTodos(filter: 'all' | 'active' | 'completed'): Promise<void> {
    switch (filter) {
      case 'all':
        await this.filterAll.click();
        break;
      case 'active':
        await this.filterActive.click();
        break;
      case 'completed':
        await this.filterCompleted.click();
        break;
    }
    
    // 等待篩選完成
    await this.page.waitForTimeout(500);
  }

  /**
   * 驗證待辦事項文字
   */
  async verifyTodoText(index: number, expectedText: string): Promise<void> {
    const todoItem = this.todoItems.nth(index);
    await expect(todoItem).toContainText(expectedText);
  }

  /**
   * 批量新增待辦事項
   */
  async addMultipleTodos(todos: string[]): Promise<void> {
    for (const todo of todos) {
      await this.addTodo(todo);
      // 避免操作過快
      await this.page.waitForTimeout(100);
    }
  }
}
```

### 5. 測試套件實作

```typescript
// tests/e2e/todoApp.spec.ts
import { test, expect } from '@playwright/test';
import { TodoAppPage } from '../pages/todoApp.page';

test.describe('待辦事項應用程式測試套件', () => {
  let todoPage: TodoAppPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoAppPage(page);
    await todoPage.navigate('/');
    
    // 清理 localStorage（如需要）
    await page.evaluate(() => localStorage.clear());
  });

  test.afterEach(async ({ page }, testInfo) => {
    // 失敗時擷取截圖
    if (testInfo.status !== 'passed') {
      await todoPage.captureScreenshot(testInfo.title);
    }
  });

  test('應該能新增單一待辦事項', async () => {
    // Arrange
    const todoText = '完成 Playwright 測試';
    
    // Act
    await todoPage.addTodo(todoText);
    
    // Assert
    const count = await todoPage.getTodoCount();
    expect(count).toBe(1);
    await todoPage.verifyTodoText(0, todoText);
  });

  test('應該能標記待辦事項為完成', async () => {
    // Arrange
    await todoPage.addTodo('測試項目');
    
    // Act
    await todoPage.completeTodo(0);
    
    // Assert
    await todoPage.filterTodos('completed');
    const completedCount = await todoPage.getTodoCount();
    expect(completedCount).toBe(1);
  });

  test('應該能刪除待辦事項', async () => {
    // Arrange
    await todoPage.addMultipleTodos(['項目1', '項目2', '項目3']);
    
    // Act
    await todoPage.deleteTodo(1); // 刪除第二個項目
    
    // Assert
    const remainingCount = await todoPage.getTodoCount();
    expect(remainingCount).toBe(2);
  });

  test('應該能正確篩選待辦事項', async () => {
    // Arrange
    await todoPage.addMultipleTodos(['未完成1', '未完成2']);
    await todoPage.completeTodo(0);
    
    // Act & Assert - 全部
    await todoPage.filterTodos('all');
    expect(await todoPage.getTodoCount()).toBe(2);
    
    // Act & Assert - 進行中
    await todoPage.filterTodos('active');
    expect(await todoPage.getTodoCount()).toBe(1);
    
    // Act & Assert - 已完成
    await todoPage.filterTodos('completed');
    expect(await todoPage.getTodoCount()).toBe(1);
  });

  test('應該處理空輸入的情況', async () => {
    // Act
    await todoPage.todoInput.fill('');
    await todoPage.addButton.click();
    
    // Assert - 應該顯示錯誤訊息或不新增項目
    const count = await todoPage.getTodoCount();
    expect(count).toBe(0);
  });

  test('應該保存待辦事項到 localStorage', async ({ page }) => {
    // Arrange & Act
    await todoPage.addTodo('持久化測試');
    
    // Assert - 檢查 localStorage
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('todos');
    });
    
    expect(storageData).toBeTruthy();
    expect(storageData).toContain('持久化測試');
  });
});

// 資料驅動測試範例
test.describe('資料驅動測試', () => {
  const testData = [
    { input: '買菜', category: '生活' },
    { input: '完成報告', category: '工作' },
    { input: '運動30分鐘', category: '健康' },
  ];

  testData.forEach(({ input, category }) => {
    test(`應該能新增 ${category} 類別的待辦事項: ${input}`, async ({ page }) => {
      const todoPage = new TodoAppPage(page);
      await todoPage.navigate('/');
      
      await todoPage.addTodo(`[${category}] ${input}`);
      
      const count = await todoPage.getTodoCount();
      expect(count).toBeGreaterThan(0);
      await todoPage.verifyTodoText(0, input);
    });
  });
});
```

### 6. 測試輔助工具

```typescript
// utils/helpers.ts
import { Page } from '@playwright/test';

export class TestHelpers {
  /**
   * 等待網路請求完成
   */
  static async waitForAPI(page: Page, endpoint: string): Promise<void> {
    await page.waitForResponse(response => 
      response.url().includes(endpoint) && response.status() === 200
    );
  }

  /**
   * Mock API 回應
   */
  static async mockAPIResponse(page: Page, endpoint: string, data: any): Promise<void> {
    await page.route(endpoint, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data)
      });
    });
  }

  /**
   * 產生隨機測試資料
   */
  static generateTestData() {
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      random: Math.floor(Math.random() * 1000)
    };
  }
}
```

### 7. 執行指令

```json
// package.json
{
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:chrome": "playwright test --project=chromium",
    "test:parallel": "playwright test --workers=4",
    "test:report": "playwright show-report",
    "codegen": "playwright codegen"
  }
}
```

請根據具體的測試需求調整上述程式碼，確保測試的可靠性和維護性。
```

---

## Example / 範例

### English Thinking Process:
```
"I need to create a robust test for a login flow. The test should:
1. Navigate to the login page
2. Enter credentials with proper waiting
3. Handle potential errors
4. Verify successful login
5. Include retry logic for flakiness"
```

### Chinese Output (繁體中文實作):
```typescript
// 登入流程測試 - 包含完整錯誤處理和重試機制
test('使用者應該能成功登入系統', async ({ page }) => {
  // 導航到登入頁面並等待完全載入
  await page.goto('/login', { waitUntil: 'networkidle' });
  
  // 使用智慧等待策略填寫憑證
  const emailInput = page.getByLabel('電子郵件');
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill('user@example.com');
  
  // 實作重試邏輯處理潛在的不穩定性
  await retryOperation(async () => {
    await page.getByLabel('密碼').fill('password123');
    await page.getByRole('button', { name: '登入' }).click();
  }, { retries: 3, delay: 1000 });
  
  // 驗證成功登入
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('歡迎回來')).toBeVisible();
});
```

---

## Model-Specific Adjustments

### Claude 3.5 Sonnet
- Excellent at POM implementation
- Strong TypeScript typing
- Comprehensive error handling

### GPT-4
- May need explicit TypeScript annotations
- Good at test data generation
- Strong async/await patterns

### Gemini Pro
- Benefits from more structure
- May need explicit imports
- Good at selector strategies

---

## Version History

- **1.0.0** (2025-09-11): Initial Playwright prompt with complete POM example