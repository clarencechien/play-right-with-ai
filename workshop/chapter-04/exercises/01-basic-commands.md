# 練習 1：基礎 Playwright 指令 🎯

## 學習目標

通過本練習，您將掌握：
- Playwright 核心 API 的使用
- 頁面導航與元素互動
- 等待策略的正確應用
- 斷言驗證的最佳實踐

## 前置準備

### 環境設置

```bash
# 安裝 Playwright
npm init playwright@latest

# 安裝完成後，確認版本
npx playwright --version

# 啟動測試應用
cd ../../chapter-02/example-output/todo-app
npx http-server -p 3000
```

### 專案結構

```
01-basic-commands/
├── tests/
│   ├── 01-navigation.spec.js
│   ├── 02-interactions.spec.js
│   ├── 03-assertions.spec.js
│   └── 04-waiting.spec.js
├── playwright.config.js
└── package.json
```

## Part 1: 頁面導航基礎

### 任務 1.1: 基本導航

創建 `01-navigation.spec.js`，實作以下測試：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('頁面導航測試', () => {
  
  test('應該成功載入 TODO 應用', async ({ page }) => {
    // TODO: 實作以下步驟
    // 1. 導航到 http://localhost:3000
    // 2. 等待頁面完全載入
    // 3. 驗證頁面標題
    // 4. 驗證 URL
    
    // 提示：使用以下 API
    // await page.goto(url, options);
    // await page.waitForLoadState('networkidle');
    // await expect(page).toHaveTitle(title);
    // await expect(page).toHaveURL(url);
  });

  test('應該處理導航錯誤', async ({ page }) => {
    // TODO: 實作錯誤處理
    // 1. 嘗試導航到無效 URL
    // 2. 捕獲並驗證錯誤
  });

  test('應該支援頁面重新載入', async ({ page }) => {
    // TODO: 實作重新載入測試
    // 1. 導航到應用
    // 2. 新增一個任務
    // 3. 重新載入頁面
    // 4. 驗證任務仍然存在
  });
});
```

### AI 輔助提示詞

```markdown
# Navigation Test Implementation

Help me implement Playwright navigation tests for:
1. Basic page loading with proper wait strategies
2. Error handling for failed navigation
3. Page reload with state persistence check

[Technical Requirements]
- Use proper async/await
- Include meaningful assertions
- Add error handling

[輸出需求]
提供完整的測試實作，包含中文註解
```

## Part 2: 元素互動操作

### 任務 2.1: 基本互動

創建 `02-interactions.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('元素互動測試', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('輸入文字與提交', async ({ page }) => {
    // TODO: 實作以下互動
    // 1. 在輸入框填入文字
    // 2. 按下 Enter 鍵提交
    // 3. 驗證任務已新增
    
    // API 提示：
    // await page.fill(selector, text);
    // await page.press(selector, key);
    // await page.type(selector, text, {delay: 100});
  });

  test('點擊操作', async ({ page }) => {
    // TODO: 實作點擊測試
    // 1. 新增任務
    // 2. 點擊完成核取方塊
    // 3. 點擊刪除按鈕
    // 4. 驗證操作結果
    
    // API 提示：
    // await page.click(selector);
    // await page.dblclick(selector);
    // await page.check(selector);
  });

  test('鍵盤操作', async ({ page }) => {
    // TODO: 實作鍵盤互動
    // 1. 使用 Tab 鍵導航
    // 2. 使用 Space 鍵勾選
    // 3. 使用 Escape 鍵取消
    
    // API 提示：
    // await page.keyboard.press('Tab');
    // await page.keyboard.down('Shift');
    // await page.keyboard.type('Hello');
  });

  test('滑鼠操作', async ({ page }) => {
    // TODO: 實作滑鼠互動
    // 1. 懸停在元素上
    // 2. 右鍵點擊
    // 3. 拖放操作
    
    // API 提示：
    // await page.hover(selector);
    // await page.click(selector, { button: 'right' });
    // await page.dragAndDrop(source, target);
  });
});
```

### 任務 2.2: 表單操作

```javascript
test.describe('表單操作測試', () => {
  
  test('下拉選單操作', async ({ page }) => {
    // TODO: 如果有篩選下拉選單
    // await page.selectOption(selector, value);
  });

  test('檔案上傳', async ({ page }) => {
    // TODO: 如果支援匯入功能
    // await page.setInputFiles(selector, filePath);
  });

  test('多選操作', async ({ page }) => {
    // TODO: 批量選擇任務
    // 使用 Shift + Click 或 Ctrl + Click
  });
});
```

## Part 3: 斷言驗證

### 任務 3.1: 基本斷言

創建 `03-assertions.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('斷言驗證測試', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // 準備測試資料
    await page.fill('[data-testid="todo-input"]', '測試任務');
    await page.press('[data-testid="todo-input"]', 'Enter');
  });

  test('元素存在性斷言', async ({ page }) => {
    // TODO: 實作以下斷言
    // 1. 元素是否可見
    // 2. 元素是否存在於 DOM
    // 3. 元素是否隱藏
    
    // API 範例：
    // await expect(page.locator(selector)).toBeVisible();
    // await expect(page.locator(selector)).toBeHidden();
    // await expect(page.locator(selector)).toBeAttached();
  });

  test('文字內容斷言', async ({ page }) => {
    // TODO: 驗證文字內容
    // 1. 精確匹配
    // 2. 包含文字
    // 3. 正則匹配
    
    // API 範例：
    // await expect(page.locator(selector)).toHaveText('exact text');
    // await expect(page.locator(selector)).toContainText('partial');
    // await expect(page.locator(selector)).toHaveText(/regex/);
  });

  test('屬性斷言', async ({ page }) => {
    // TODO: 驗證元素屬性
    // 1. class 屬性
    // 2. data 屬性
    // 3. disabled 狀態
    
    // API 範例：
    // await expect(page.locator(selector)).toHaveClass('class-name');
    // await expect(page.locator(selector)).toHaveAttribute('data-id', 'value');
    // await expect(page.locator(selector)).toBeDisabled();
  });

  test('數量斷言', async ({ page }) => {
    // TODO: 驗證元素數量
    // 1. 任務總數
    // 2. 已完成數量
    // 3. 待辦數量
    
    // API 範例：
    // await expect(page.locator(selector)).toHaveCount(3);
    // const count = await page.locator(selector).count();
    // expect(count).toBe(3);
  });

  test('截圖比對', async ({ page }) => {
    // TODO: 視覺測試
    // await expect(page).toHaveScreenshot('todo-list.png');
    // await expect(page.locator(selector)).toHaveScreenshot('component.png');
  });
});
```

## Part 4: 等待策略

### 任務 4.1: 智能等待

創建 `04-waiting.spec.js`：

```javascript
const { test, expect } = require('@playwright/test');

test.describe('等待策略測試', () => {
  
  test('等待元素出現', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // TODO: 實作不同的等待策略
    
    // 1. 等待選擇器
    // await page.waitForSelector(selector, { timeout: 5000 });
    
    // 2. 等待特定狀態
    // await page.waitForSelector(selector, { state: 'visible' });
    // await page.waitForSelector(selector, { state: 'hidden' });
    // await page.waitForSelector(selector, { state: 'attached' });
    
    // 3. 等待函數
    // await page.waitForFunction(() => document.querySelectorAll('.todo-item').length > 5);
    
    // 4. 等待載入狀態
    // await page.waitForLoadState('networkidle');
    // await page.waitForLoadState('domcontentloaded');
  });

  test('等待網路請求', async ({ page }) => {
    // TODO: 等待 API 請求完成
    
    // 等待請求
    // const requestPromise = page.waitForRequest(url);
    // await page.click('button');
    // const request = await requestPromise;
    
    // 等待回應
    // const responsePromise = page.waitForResponse(url);
    // await page.click('button');
    // const response = await responsePromise;
  });

  test('自訂等待條件', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // TODO: 實作自訂等待邏輯
    
    // 等待特定條件
    await page.waitForFunction(
      () => {
        const items = document.querySelectorAll('.todo-item');
        return items.length >= 3 && 
               Array.from(items).some(item => 
                 item.textContent.includes('特定文字')
               );
      },
      { timeout: 10000 }
    );
  });

  test('超時處理', async ({ page }) => {
    // TODO: 處理等待超時
    
    try {
      await page.waitForSelector('.non-existent', { timeout: 1000 });
    } catch (error) {
      console.log('等待超時，元素未出現');
      // 執行備用方案
    }
  });
});
```

## Part 5: 進階操作

### 任務 5.1: 多頁面處理

```javascript
test('處理多個頁面', async ({ context }) => {
  // 創建多個頁面
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  
  // TODO: 實作多頁面互動
  // 1. 在 page1 新增任務
  // 2. 在 page2 驗證同步
  // 3. 切換頁面操作
});
```

### 任務 5.2: iframe 處理

```javascript
test('處理 iframe', async ({ page }) => {
  // TODO: 如果應用包含 iframe
  
  // 獲取 iframe
  const frame = page.frameLocator('iframe');
  
  // 在 iframe 內操作
  await frame.locator('button').click();
});
```

### 任務 5.3: 對話框處理

```javascript
test('處理對話框', async ({ page }) => {
  // 監聽對話框
  page.on('dialog', async dialog => {
    console.log(dialog.message());
    await dialog.accept(); // 或 dialog.dismiss()
  });
  
  // TODO: 觸發會產生對話框的操作
});
```

## 實作檢查清單

### 基礎功能 ✅

- [ ] 頁面導航成功
- [ ] 文字輸入正常
- [ ] 點擊操作有效
- [ ] 鍵盤互動正確
- [ ] 基本斷言通過

### 進階功能 🚀

- [ ] 等待策略適當
- [ ] 錯誤處理完善
- [ ] 多元素操作
- [ ] 複雜互動流程
- [ ] 效能考量

## 完成標準

您的測試應該：

1. **可靠性**: 執行 10 次都能穩定通過
2. **可讀性**: 清晰的測試描述和步驟
3. **可維護性**: 使用良好的選擇器策略
4. **完整性**: 覆蓋正向和負向場景

## 除錯技巧

### 1. 使用除錯模式

```bash
# 開啟除錯模式
npx playwright test --debug

# 使用 UI 模式
npx playwright test --ui

# 產生追蹤檔案
npx playwright test --trace on
```

### 2. 加入除錯點

```javascript
await page.pause(); // 暫停執行
```

### 3. 截圖除錯

```javascript
await page.screenshot({ path: 'debug.png' });
```

## AI 輔助完成

使用以下提示詞獲得幫助：

```markdown
# Playwright Test Completion

I'm implementing basic Playwright tests for a TODO app.
Current code:
[貼上您的代碼]

Issues I'm facing:
[描述問題]

Please help me:
1. Complete the implementation
2. Fix any issues
3. Suggest improvements

[輸出]
提供完整的測試代碼和解釋
```

## 學習資源

- [Playwright 官方文檔](https://playwright.dev/docs/intro)
- [Playwright API 參考](https://playwright.dev/docs/api/class-playwright)
- [最佳實踐指南](https://playwright.dev/docs/best-practices)

## 提交要求

完成後，確保：

```bash
# 執行所有測試
npx playwright test

# 生成報告
npx playwright show-report

# 檢查測試覆蓋
npx nyc playwright test
```

您的提交應包含：
- 所有 4 個測試檔案
- 測試執行報告
- 學習心得筆記

---

💡 **專業提示**: 好的測試從好的選擇器開始。優先使用 data-testid，其次是 role 和 text。

🎭 **Play right with AI** - 掌握 Playwright，自動化無所不能！