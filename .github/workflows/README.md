# GitHub Actions CI/CD 工作流程

本目錄包含 "Play right with AI" 工作坊的所有自動化工作流程。

## 工作流程總覽

### 1. 工作坊測試 (`workshop-tests.yml`)
- **觸發條件**: 推送到 main/develop 分支、PR、每日定時執行
- **功能**:
  - 測試所有章節的範例程式碼
  - 執行 Playwright E2E 測試
  - 測試 AI 整合腳本
  - 驗證 MCP 伺服器功能
- **矩陣測試**: Node.js 18.x 和 20.x，涵蓋所有 8 個章節

### 2. 內容驗證 (`content-validation.yml`)
- **觸發條件**: 修改 workshop/、prompts/、docs/ 或 markdown 檔案
- **功能**:
  - 檢查 Markdown 格式
  - 驗證連結有效性
  - 確認繁體中文內容
  - 驗證章節結構完整性
  - 檢查程式碼範例語法

### 3. 提示詞測試 (`prompt-testing.yml`)
- **觸發條件**: 修改 prompts/ 或 integrations/，手動觸發
- **功能**:
  - 測試 Claude API 提示詞
  - 測試 Gemini API 提示詞
  - 測試 OpenAI API 提示詞
  - 分析提示詞品質
  - 成本估算

### 4. 部署到 GitHub Pages (`deploy.yml`)
- **觸發條件**: 推送到 main 分支，手動觸發
- **功能**:
  - 建立靜態網站
  - 轉換 Markdown 為 HTML
  - 部署到 GitHub Pages
  - 通知部署狀態

## 設定步驟

### 1. 設定 GitHub Secrets

在 GitHub 儲存庫設定中，新增以下 Secrets：

```bash
# API 金鑰
ANTHROPIC_API_KEY=your-claude-api-key
GOOGLE_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# 可選：監控服務
ANALYTICS_ENDPOINT=your-analytics-endpoint
```

### 2. 啟用 GitHub Pages

1. 前往儲存庫設定 > Pages
2. Source 選擇 "GitHub Actions"
3. 儲存設定

### 3. 設定分支保護規則

建議為 main 分支設定保護規則：

```yaml
保護規則:
  - 需要 PR 審查
  - 需要狀態檢查通過:
    - workshop-tests
    - content-validation
  - 需要分支為最新
  - 包含管理員
```

## 本地測試

### 執行工作流程測試

```bash
# 安裝 act (GitHub Actions 本地執行器)
brew install act  # macOS
# 或
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# 執行特定工作流程
act -W .github/workflows/workshop-tests.yml

# 使用 secrets
act -W .github/workflows/prompt-testing.yml --secret-file .env.secrets
```

### 測試個別工作流程元件

```bash
# 測試 Markdown 驗證
npm install -g markdownlint-cli
markdownlint '**/*.md' --ignore node_modules

# 測試連結檢查
npm install -g markdown-link-check
find . -name "*.md" | xargs -I {} markdown-link-check {}

# 測試 HTML 驗證
npm install -g html-validate
find . -name "*.html" | xargs -I {} html-validate {}
```

## 工作流程客製化

### 新增測試矩陣

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18.x, 20.x, 21.x]
    browser: [chromium, firefox, webkit]
```

### 新增通知

```yaml
- name: 發送 Slack 通知
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: '工作流程失敗！'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 新增快取

```yaml
- name: 快取 node_modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 監控與報告

### 查看工作流程執行狀態

1. 前往 Actions 標籤
2. 選擇特定工作流程
3. 查看執行歷史和日誌

### 下載測試報告

測試報告會自動上傳為 artifacts：

```bash
# 使用 GitHub CLI 下載
gh run download <run-id> -n playwright-report-ch1-node20.x
```

### 成本優化建議

1. **使用條件執行**:
   ```yaml
   if: github.event_name != 'schedule' || github.repository == 'your-org/your-repo'
   ```

2. **限制並行作業**:
   ```yaml
   concurrency:
     group: ${{ github.workflow }}-${{ github.ref }}
     cancel-in-progress: true
   ```

3. **使用較小的運行器**:
   ```yaml
   runs-on: ubuntu-latest  # 比 ubuntu-20.04 更快
   ```

## 故障排除

### 常見問題

1. **API 金鑰錯誤**
   - 確認 Secrets 設定正確
   - 檢查 API 配額

2. **測試逾時**
   - 增加 timeout-minutes
   - 優化測試效能

3. **部署失敗**
   - 確認 Pages 設定
   - 檢查權限設定

### 除錯技巧

```yaml
# 啟用除錯輸出
- name: 除錯資訊
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
  env:
    ACTIONS_RUNNER_DEBUG: true
    ACTIONS_STEP_DEBUG: true
```

## 最佳實踐

1. **保持工作流程簡潔**: 每個工作流程專注單一目的
2. **使用可重用工作流程**: 避免重複程式碼
3. **設定適當的逾時**: 避免無限等待
4. **使用 matrix 策略**: 平行執行測試
5. **快取相依套件**: 加速執行時間
6. **定期清理 artifacts**: 避免儲存空間爆滿

## 相關資源

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [Playwright CI 指南](https://playwright.dev/docs/ci)
- [act - 本地執行 Actions](https://github.com/nektos/act)
- [GitHub Actions 市集](https://github.com/marketplace?type=actions)