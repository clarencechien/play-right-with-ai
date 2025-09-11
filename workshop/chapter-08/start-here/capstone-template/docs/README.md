# Capstone 專案文檔

## 專案介紹

這是 "Play right with AI" 工作坊的 Capstone 專案。本專案展示了如何使用 AI 驅動開發方法，從零開始構建一個完整的 Web 應用程式，包含完整的測試套件和 CI/CD 流程。

### 專案目標

- 展示 AI 驅動開發的完整流程
- 實踐自循環開發工作流程
- 整合所有學習到的測試技術
- 建立可維護和可擴展的代碼架構

## 功能說明

### 核心功能

1. **資料管理 (CRUD)**
   - 創建新項目
   - 查看項目列表
   - 更新項目資訊
   - 刪除項目

2. **搜尋與篩選**
   - 關鍵字搜尋
   - 類別篩選
   - 優先級篩選

3. **排序功能**
   - 按名稱排序
   - 按時間排序
   - 按優先級排序

4. **資料匯入匯出**
   - 匯出 JSON 格式
   - 匯出 CSV 格式
   - 匯入 JSON 資料

5. **統計資訊**
   - 項目總數
   - 類別分佈
   - 優先級分析

### 技術特色

- 響應式設計 (RWD)
- 無障礙性支援 (A11y)
- 漸進式增強 (Progressive Enhancement)
- 離線功能 (Offline Support)

## 安裝步驟

### 前置需求

- Node.js 18.0 或更高版本
- npm 或 yarn
- Git

### 安裝流程

1. 複製專案
```bash
git clone [repository-url]
cd capstone-project
```

2. 安裝依賴
```bash
npm install
```

3. 安裝 Playwright 瀏覽器
```bash
npx playwright install
```

4. 設置環境變數
```bash
cp .env.example .env
# 編輯 .env 文件，設置必要的環境變數
```

## 使用方法

### 開發模式

```bash
# 啟動開發伺服器
npm run dev

# 應用程式將在 http://localhost:3000 運行
```

### 生產模式

```bash
# 構建生產版本
npm run build

# 啟動生產伺服器
npm start
```

### 測試執行

```bash
# 執行所有測試
npm test

# 執行 E2E 測試
npm run test:e2e

# 執行特定瀏覽器測試
npx playwright test --project=chromium

# 執行測試並生成報告
npx playwright test --reporter=html

# 開啟測試報告
npx playwright show-report
```

### 測試覆蓋率

```bash
# 生成覆蓋率報告
npm run test:coverage

# 查看覆蓋率報告
open coverage/index.html
```

## 專案結構

```
capstone-project/
├── src/                    # 源代碼
│   ├── app.js             # 主要應用邏輯
│   ├── index.html         # 主頁面
│   └── styles.css         # 樣式表
├── tests/                  # 測試文件
│   ├── e2e/               # E2E 測試
│   │   ├── app.spec.js   # 主要功能測試
│   │   ├── performance.spec.js  # 性能測試
│   │   └── security.spec.js     # 安全測試
│   └── unit/              # 單元測試
├── docs/                   # 文檔
│   ├── README.md          # 專案說明
│   ├── test-strategy.md   # 測試策略
│   └── api.md            # API 文檔
├── prompts/               # AI 提示詞記錄
├── .github/               # GitHub 配置
│   └── workflows/         # CI/CD 工作流程
├── playwright.config.js   # Playwright 配置
├── package.json          # 專案配置
└── README.md            # 專案根目錄說明
```

## API 文檔

### 資料結構

```javascript
{
  "id": "unique-id",
  "name": "項目名稱",
  "description": "項目描述",
  "category": "work|personal|study|other",
  "priority": "low|medium|high",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "pending|completed|archived"
}
```

### 主要方法

#### `app.initialize()`
初始化應用程式，載入配置和資料。

#### `app.createItem(data)`
創建新項目。

**參數:**
- `data` (Object): 項目資料

**返回:**
- Promise<Object>: 創建的項目

#### `app.updateItem(id, data)`
更新現有項目。

**參數:**
- `id` (String): 項目 ID
- `data` (Object): 更新的資料

**返回:**
- Promise<Object>: 更新後的項目

#### `app.deleteItem(id)`
刪除項目。

**參數:**
- `id` (String): 項目 ID

**返回:**
- Promise<Boolean>: 刪除結果

#### `app.search(query)`
搜尋項目。

**參數:**
- `query` (String): 搜尋關鍵字

**返回:**
- Array<Object>: 符合的項目列表

## 部署指南

### 部署到 GitHub Pages

```bash
# 構建並部署
npm run deploy
```

### 部署到 Vercel

1. 安裝 Vercel CLI
```bash
npm i -g vercel
```

2. 部署
```bash
vercel
```

### 部署到 Netlify

1. 構建專案
```bash
npm run build
```

2. 拖放 `dist` 資料夾到 Netlify

## 故障排除

### 常見問題

**Q: Playwright 測試失敗**
A: 確保已安裝所有必要的瀏覽器：
```bash
npx playwright install
```

**Q: 應用程式無法啟動**
A: 檢查端口是否被佔用：
```bash
lsof -i :3000
```

**Q: 測試超時**
A: 增加測試超時時間：
```javascript
test.setTimeout(60000);
```

## 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件。

## 聯絡資訊

- 專案連結: [https://github.com/username/capstone-project](https://github.com/username/capstone-project)
- 問題回報: [Issues](https://github.com/username/capstone-project/issues)
- 討論區: [Discussions](https://github.com/username/capstone-project/discussions)

## 致謝

- 感謝 "Play right with AI" 工作坊提供的學習機會
- 感謝所有貢獻者的支持
- 特別感謝 AI 工具在開發過程中的協助

---

📝 本文檔使用 AI 輔助生成，並經過人工審核和優化。