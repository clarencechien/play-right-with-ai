# Playwright 測試基礎設施

## 📁 專案結構

```
tests/
├── e2e/                      # 端到端測試
│   ├── workshop-flow.spec.ts   # 工作坊流程測試
│   ├── todo-app.spec.ts        # TODO 應用測試
│   └── prompt-validation.spec.ts # 提示詞驗證測試
├── integration/              # 整合測試
│   └── ai-cycle.spec.ts       # AI 自循環工作流測試
├── page-objects/             # 頁面物件模型
│   ├── workshop-page.ts       # 工作坊頁面物件
│   └── todo-page.ts          # TODO 應用頁面物件
├── utils/                    # 測試工具
│   ├── base-page.ts          # 基礎頁面類別
│   ├── test-helpers.ts       # 測試輔助函數
│   ├── mcp-integration.ts    # MCP 協議整合
│   ├── global-setup.ts       # 全域設定
│   └── global-teardown.ts    # 全域清理
└── fixtures/                 # 測試資料
    └── test-data.ts          # 測試資料固定檔
```

## 🚀 快速開始

### 安裝依賴

```bash
npm install
npx playwright install --with-deps
```

### 執行測試

```bash
# 執行所有測試
npm test

# 執行特定測試檔案
npm run test:workshop   # 工作坊流程測試
npm run test:todo       # TODO 應用測試
npm run test:prompt     # 提示詞驗證測試
npm run test:ai-cycle   # AI 循環測試

# 以 UI 模式執行
npm run test:ui

# 偵錯模式
npm run test:debug

# 有頭模式（顯示瀏覽器）
npm run test:headed
```

### 跨瀏覽器測試

```bash
npm run test:chrome     # Chrome 測試
npm run test:firefox    # Firefox 測試
npm run test:webkit     # Safari 測試
npm run test:mobile     # 行動裝置測試
```

## 🎯 測試覆蓋範圍

### E2E 測試

1. **工作坊流程** (`workshop-flow.spec.ts`)
   - 章節導航與解鎖機制
   - 進度追蹤與儲存
   - 練習執行與驗證
   - 程式碼編輯器功能
   - 響應式設計測試
   - 效能與無障礙性測試

2. **TODO 應用** (`todo-app.spec.ts`)
   - CRUD 操作（新增、編輯、刪除）
   - 完成狀態管理
   - 篩選與搜尋功能
   - 拖放排序
   - 資料持久化
   - 復原/重做功能
   - 鍵盤快捷鍵

3. **提示詞驗證** (`prompt-validation.spec.ts`)
   - 各章節提示詞執行
   - AI 生成測試驗證
   - MCP 指令執行
   - 智能定位功能
   - 錯誤處理驗證

### 整合測試

**AI 自循環** (`ai-cycle.spec.ts`)
- 完整 AI 開發循環
- 測試失敗分析與修復
- 效能問題優化
- MCP 協議深度整合
- 自我修復機制
- AI 學習與改進

## 🔧 MCP (Model Context Protocol) 整合

### 基本用法

```typescript
import { PlaywrightMCP } from './utils/mcp-integration';

const mcp = new PlaywrightMCP(page);

// 執行單一指令
const result = await mcp.execute({
  action: 'click',
  target: '[data-testid="button"]'
});

// 批次執行
const results = await mcp.executeBatch([
  { action: 'navigate', value: '/todo-app' },
  { action: 'type', target: 'input', value: 'test' },
  { action: 'click', target: 'button' }
]);
```

### 支援的動作

- `navigate`: 導航到 URL
- `click`: 點擊元素
- `type`: 輸入文字
- `wait`: 等待
- `assert`: 斷言驗證
- `screenshot`: 截圖
- `extract`: 擷取頁面資料

## 📊 測試報告

```bash
# 生成 HTML 報告
npm test -- --reporter=html

# 查看報告
npm run test:report
```

## 🛠️ Page Object Model

### 建立新的頁面物件

```typescript
import { BasePage } from '../utils/base-page';

export class MyPage extends BasePage {
  // 定義定位器
  readonly myButton = this.page.locator('[data-testid="my-button"]');
  
  // 定義動作
  async clickMyButton() {
    await this.myButton.click();
  }
  
  // 定義驗證
  async isButtonVisible(): Promise<boolean> {
    return await this.myButton.isVisible();
  }
}
```

## 🎨 測試資料管理

使用 `fixtures/test-data.ts` 管理測試資料：

```typescript
import { workshopTestData, generateRandomTodos } from '../fixtures/test-data';

// 使用預定義資料
const chapters = workshopTestData.chapters;

// 生成隨機資料
const todos = generateRandomTodos(10);
```

## 🐛 偵錯技巧

### 1. 使用 Page Inspector

```bash
npx playwright test --debug
```

### 2. 追蹤記錄

```bash
npx playwright test --trace on
```

### 3. 截圖與影片

配置在 `playwright.config.ts`:
- 截圖：失敗時自動截圖
- 影片：失敗時保留影片

## 🔄 CI/CD 整合

### GitHub Actions 範例

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload report
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📝 最佳實踐

1. **使用 Page Object Model**
   - 將頁面邏輯封裝在頁面物件中
   - 重複使用共用功能

2. **適當的等待策略**
   - 使用 `waitFor` 而非硬編碼等待
   - 利用 Playwright 的自動等待

3. **資料隔離**
   - 每個測試應該獨立
   - 使用 `beforeEach` 和 `afterEach` 設定/清理

4. **有意義的斷言**
   - 驗證業務邏輯而非實作細節
   - 使用描述性的錯誤訊息

5. **並行執行**
   - 設計可並行的測試
   - 避免測試間的依賴

## 🤝 貢獻指南

1. 遵循現有的檔案結構
2. 為新功能撰寫測試
3. 確保所有測試通過
4. 更新相關文件

## 📚 相關資源

- [Playwright 官方文件](https://playwright.dev)
- [MCP 協議規範](https://github.com/playwright/mcp)
- [工作坊教材](../workshop/)

## ⚠️ 注意事項

- 測試需要本地開發伺服器運行在 `http://localhost:3000`
- 某些測試可能需要特定的環境變數設定
- 行動裝置測試需要額外的瀏覽器安裝

## 🆘 疑難排解

### 測試失敗

1. 確認開發伺服器正在運行
2. 檢查瀏覽器版本是否最新
3. 清理測試快取：`npm run clean`

### 效能問題

1. 減少並行工作執行緒數
2. 使用 `--project` 指定單一瀏覽器
3. 關閉影片錄製功能

### 定位器問題

1. 使用 `data-testid` 屬性
2. 避免使用易變的選擇器
3. 利用 Playwright 的智能定位器