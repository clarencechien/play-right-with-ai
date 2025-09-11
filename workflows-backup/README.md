# GitHub Actions 工作流程設定指南

## 概述

本目錄包含 "Play right with AI" 工作坊所需的 GitHub Actions 工作流程檔案。這些工作流程負責自動化部署、測試和持續整合等任務。

## 工作流程清單

| 工作流程 | 檔案 | 用途 |
|---------|------|------|
| 部署到 GitHub Pages | `deploy.yml` | 自動建構並部署工作坊網站 |
| 工作坊測試 | `workshop-tests.yml` | 執行章節範例測試和整合測試 |

## 快速開始

### 步驟 1：準備 GitHub Repository

1. 確保您的 repository 已啟用 GitHub Actions
2. 前往 Settings → Actions → General
3. 確認 "Actions permissions" 設定為 "Allow all actions and reusable workflows"

### 步驟 2：設定 GitHub Pages

1. 前往 Settings → Pages
2. Source 選擇 "GitHub Actions"
3. 儲存設定

### 步驟 3：設定必要的 Secrets

某些工作流程需要 API 金鑰。請依照以下步驟設定：

1. 前往 Settings → Secrets and variables → Actions
2. 點擊 "New repository secret"
3. 新增以下 secrets（如需要）：
   - `ANTHROPIC_API_KEY`: Claude API 金鑰
   - `GOOGLE_API_KEY`: Gemini API 金鑰  
   - `OPENAI_API_KEY`: OpenAI API 金鑰

### 步驟 4：新增工作流程檔案

#### 方法一：手動新增（推薦）

1. 在您的 repository 根目錄建立 `.github/workflows/` 資料夾
2. 將本目錄中的 `.yml` 檔案複製到 `.github/workflows/`
3. 提交並推送變更

```bash
# 在 repository 根目錄執行
mkdir -p .github/workflows
cp workflows-backup/*.yml .github/workflows/
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push
```

#### 方法二：使用設定腳本

執行提供的設定腳本：

```bash
cd workflows-backup
chmod +x setup-workflows.sh
./setup-workflows.sh
```

## 工作流程詳細說明

### 1. Deploy to GitHub Pages (`deploy.yml`)

**觸發條件：**
- 推送到 `main` 分支
- 手動觸發（workflow_dispatch）

**必要權限：**
- `contents: read`
- `pages: write`
- `id-token: write`

**執行步驟：**
1. 建構工作坊網站
2. 執行冒煙測試驗證輸出
3. 上傳成品到 GitHub Pages
4. 部署網站
5. 通知部署狀態

[詳細文件](./deploy.yml.md)

### 2. Workshop Tests (`workshop-tests.yml`)

**觸發條件：**
- 推送到 `main` 或 `develop` 分支
- Pull Request 到 `main` 分支
- 每日定時執行（UTC 00:00）

**測試矩陣：**
- Node.js 版本: 18.x, 20.x
- 章節: 1-8

**執行內容：**
1. 各章節範例測試
2. AI 整合腳本測試
3. MCP 伺服器測試

[詳細文件](./workshop-tests.yml.md)

## 權限設定說明

### Repository 權限

確保以下權限已正確設定：

1. **Actions 權限**
   - Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - 勾選 "Allow GitHub Actions to create and approve pull requests"

2. **Pages 權限**
   - Settings → Pages
   - Build and deployment → Source: "GitHub Actions"

### 個人存取權杖（PAT）

如果需要跨 repository 操作，可能需要設定 PAT：

1. 前往 GitHub Settings → Developer settings → Personal access tokens
2. 建立新的 token，授予必要權限
3. 將 token 新增為 repository secret

## 疑難排解

### 常見問題

#### 1. 工作流程未觸發

**檢查項目：**
- 確認檔案位於 `.github/workflows/` 目錄
- 檢查 YAML 語法是否正確
- 確認分支名稱符合觸發條件

#### 2. Pages 部署失敗

**可能原因：**
- GitHub Pages 未啟用
- 權限設定不正確
- 建構輸出路徑錯誤

**解決方法：**
```bash
# 檢查建構輸出
npm run build:site
ls -la docs/
```

#### 3. 測試失敗

**偵錯步驟：**
1. 查看 Actions 日誌
2. 下載測試報告 artifacts
3. 本地執行測試：
```bash
npm test
npx playwright test
```

#### 4. Secrets 無法存取

**確認事項：**
- Secret 名稱完全符合（區分大小寫）
- Secret 已正確設定在 repository 層級
- 工作流程中使用正確的語法：`${{ secrets.SECRET_NAME }}`

### 日誌查看

1. 前往 Actions 標籤
2. 選擇執行的工作流程
3. 點擊失敗的 job
4. 展開失敗的步驟查看詳細日誌

### 本地測試工作流程

使用 [act](https://github.com/nektos/act) 在本地測試：

```bash
# 安裝 act
brew install act  # macOS
# 或
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# 測試工作流程
act -W .github/workflows/deploy.yml
act -W .github/workflows/workshop-tests.yml
```

## 維護建議

### 定期檢查

1. **每週檢查：**
   - 查看定時執行的測試結果
   - 確認部署狀態

2. **每月檢查：**
   - 更新 Actions 版本
   - 清理舊的 artifacts
   - 檢查 secrets 有效性

### 版本更新

定期更新 Actions 版本以獲得最新功能和安全修補：

```yaml
# 舊版本
- uses: actions/checkout@v3

# 新版本
- uses: actions/checkout@v4
```

### 效能優化

1. **使用快取：**
   - npm 快取：`cache: 'npm'`
   - pip 快取：`cache: 'pip'`

2. **並行執行：**
   - 使用 matrix strategy
   - 獨立 jobs 並行運行

3. **條件執行：**
   - 使用 `if` 條件避免不必要的步驟
   - 使用 path filters 限制觸發

## 安全性考量

### Secrets 管理

1. **永遠不要：**
   - 在程式碼中硬編碼 secrets
   - 在日誌中輸出 secrets
   - 將 secrets 提交到版本控制

2. **最佳實踐：**
   - 定期輪換 API 金鑰
   - 使用最小權限原則
   - 限制 secrets 存取範圍

### 第三方 Actions

使用第三方 Actions 時：
- 優先使用官方 Actions
- 固定版本號避免意外更新
- 審查 Action 原始碼

## 相關資源

- [GitHub Actions 官方文件](https://docs.github.com/en/actions)
- [GitHub Pages 文件](https://docs.github.com/en/pages)
- [Playwright 測試文件](https://playwright.dev/docs/test-runners)
- [工作坊主要 README](../README.md)

## 聯絡支援

如遇到問題，請透過以下方式尋求協助：

1. 在 repository 開啟 Issue
2. 查看 [Discussions](https://github.com/[your-username]/play-right-with-ai/discussions)
3. 參考工作坊 Discord 社群

---

最後更新：2024年12月