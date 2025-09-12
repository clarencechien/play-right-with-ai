# 部署指南 - Play Right with AI Workshop

本指南說明如何將工作坊部署到 GitHub Pages 以及其他平台。

## 目錄

- [快速開始](#快速開始)
- [GitHub Pages 部署](#github-pages-部署)
- [本地測試](#本地測試)
- [自動化部署](#自動化部署)
- [自訂網域](#自訂網域)
- [疑難排解](#疑難排解)
- [監控與維護](#監控與維護)

## 快速開始

### 前置需求

- Node.js 18+ 
- npm 或 yarn
- Git
- GitHub 帳號

### 安裝相依套件

```bash
# 克隆專案
git clone https://github.com/your-username/play-right-with-ai.git
cd play-right-with-ai

# 安裝套件
npm install
```

## GitHub Pages 部署

### 方法一：自動部署（推薦）

1. **啟用 GitHub Pages**
   - 前往專案的 Settings → Pages
   - Source 選擇 "GitHub Actions"

2. **推送到主分支**
   ```bash
   git add .
   git commit -m "Deploy workshop to GitHub Pages"
   git push origin main
   ```

3. **等待部署完成**
   - 查看 Actions 頁面確認部署狀態
   - 部署成功後網站會在以下網址可用：
   ```
   https://[your-username].github.io/play-right-with-ai/
   ```

### 方法二：手動部署

1. **建構靜態網站**
   ```bash
   npm run build:site
   ```

2. **驗證輸出**
   ```bash
   # 檢查關鍵檔案
   ls -la docs/
   ls -la docs/assets/
   ls -la docs/chapters/
   ```

3. **部署到 GitHub Pages**
   ```bash
   npm run deploy:gh-pages
   ```

## 本地測試

### 開發伺服器

```bash
# 建構網站
npm run build:site

# 啟動本地伺服器
npm run serve:docs

# 瀏覽 http://localhost:8080
```

### 測試檢查清單

- [ ] 首頁正確載入
- [ ] 導航功能正常
- [ ] 所有章節頁面可訪問
- [ ] Playground 互動功能運作
- [ ] 搜尋功能正常
- [ ] 示範應用可執行
- [ ] 響應式設計在不同裝置正常顯示

## 自動化部署

### GitHub Actions 工作流程

工作流程位於 `.github/workflows/deploy.yml`，包含以下步驟：

1. **建構階段**
   - 安裝相依套件
   - 執行建構腳本
   - 生成靜態檔案

2. **測試階段**
   - 執行冒煙測試
   - 驗證關鍵檔案
   - 檢查章節完整性

3. **部署階段**
   - 上傳到 GitHub Pages
   - 設定網站配置
   - 發布網站

### 觸發條件

- 推送到 `main` 分支
- 手動觸發（workflow_dispatch）
- Pull Request（僅建構，不部署）

## 自訂網域

### 設定步驟

1. **新增 CNAME 檔案**
   ```bash
   echo "workshop.yourdomain.com" > docs/CNAME
   ```

2. **DNS 設定**
   
   新增以下 DNS 記錄之一：
   
   **A 記錄（推薦）**
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   
   **CNAME 記錄**
   ```
   CNAME workshop.yourdomain.com → [username].github.io
   ```

3. **GitHub 設定**
   - Settings → Pages → Custom domain
   - 輸入您的網域
   - 勾選 "Enforce HTTPS"

## 配置選項

### 建構配置

編輯 `scripts/build-site.js` 自訂：

```javascript
// 自訂輸出目錄
this.outputDir = path.join(this.sourceDir, 'custom-output');

// 自訂樣式主題
const cssContent = `
  :root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
  }
`;
```

### 環境變數

```bash
# .env.local
SITE_URL=https://workshop.yourdomain.com
ANALYTICS_ID=GA-XXXXX
API_ENDPOINT=https://api.yourdomain.com
```

## 疑難排解

### 常見問題

#### 1. 建構失敗

**問題**：`npm run build:site` 失敗

**解決方案**：
```bash
# 清理並重新安裝
npm run clean:all
npm install
npm run build:site
```

#### 2. 404 錯誤

**問題**：GitHub Pages 顯示 404

**解決方案**：
- 確認 GitHub Pages 已啟用
- 檢查部署分支設定
- 等待 10 分鐘讓 CDN 更新

#### 3. 樣式遺失

**問題**：網站樣式無法載入

**解決方案**：
```bash
# 檢查路徑設定
grep -r "/docs/assets" docs/*.html

# 修正為相對路徑
sed -i 's|/docs/assets|./assets|g' docs/*.html
```

#### 4. JavaScript 錯誤

**問題**：Console 顯示 JavaScript 錯誤

**解決方案**：
- 檢查瀏覽器相容性
- 確認所有相依套件已載入
- 查看 `docs/assets/js/main.js` 錯誤

### 除錯指令

```bash
# 檢查檔案結構
find docs -type f -name "*.html" | head -20

# 驗證 JSON 格式
python -m json.tool docs/search-index.json

# 測試連結
wget --spider -r -nd -nv -H -l 1 http://localhost:8080

# 檢查檔案大小
du -sh docs/*
```

## 監控與維護

### 健康檢查

建立監控腳本 `scripts/health-check.js`：

```javascript
const axios = require('axios');

async function checkHealth() {
  const siteUrl = process.env.SITE_URL || 'https://your-site.github.io';
  
  const endpoints = [
    '/',
    '/playground/',
    '/demos/',
    '/search-index.json'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${siteUrl}${endpoint}`);
      console.log(`✅ ${endpoint} - ${response.status}`);
    } catch (error) {
      console.error(`❌ ${endpoint} - ${error.message}`);
    }
  }
}

checkHealth();
```

### 效能優化

1. **啟用快取**
   ```html
   <meta http-equiv="Cache-Control" content="max-age=3600">
   ```

2. **壓縮資源**
   ```bash
   # 壓縮 CSS/JS
   npm install -D terser cssnano
   npx terser docs/assets/js/main.js -o docs/assets/js/main.min.js
   ```

3. **圖片優化**
   ```bash
   # 安裝圖片優化工具
   npm install -D imagemin imagemin-cli
   npx imagemin docs/assets/images/* --out-dir=docs/assets/images
   ```

### 備份策略

```bash
# 備份腳本
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 備份建構輸出
tar -czf $BACKUP_DIR/docs.tar.gz docs/

# 備份原始碼
tar -czf $BACKUP_DIR/source.tar.gz workshop/ prompts/

echo "備份完成：$BACKUP_DIR"
```

## 更新流程

### 內容更新

1. **編輯原始檔案**
   ```bash
   # 編輯章節內容
   vim workshop/chapter-01/README.md
   ```

2. **重新建構**
   ```bash
   npm run build:site
   ```

3. **本地測試**
   ```bash
   npm run serve:docs
   ```

4. **部署更新**
   ```bash
   git add .
   git commit -m "Update chapter 1 content"
   git push origin main
   ```

### 版本管理

使用語意化版本：

```json
{
  "version": "1.0.0",
  "releases": {
    "1.0.0": "初始版本",
    "1.1.0": "新增 Playground 功能",
    "1.2.0": "改善搜尋功能"
  }
}
```

## 安全性考量

### 最佳實踐

1. **不要提交敏感資料**
   ```bash
   # .gitignore
   .env
   .env.local
   api-keys.json
   ```

2. **使用 GitHub Secrets**
   - Settings → Secrets → Actions
   - 新增 API 金鑰和敏感配置

3. **內容安全政策**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

## 支援與資源

### 相關連結

- [GitHub Pages 文件](https://docs.github.com/pages)
- [GitHub Actions 文件](https://docs.github.com/actions)
- [Playwright 文件](https://playwright.dev)

### 取得協助

- 提交 Issue：[GitHub Issues](https://github.com/your-repo/play-right-with-ai/issues)
- 討論區：[GitHub Discussions](https://github.com/your-repo/play-right-with-ai/discussions)

### 貢獻指南

歡迎貢獻！請參考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何參與專案。

---

最後更新：2024-01-11