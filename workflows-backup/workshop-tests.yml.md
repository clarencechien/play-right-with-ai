# Workshop Tests 工作流程詳細文件

## 概述

`workshop-tests.yml` 工作流程負責執行工作坊的所有自動化測試，包括章節範例測試、AI 整合測試和 MCP 伺服器測試。這個工作流程確保所有教學內容和整合功能正常運作。

## 工作流程結構

```yaml
name: Workshop Tests
```

## 觸發條件

### 推送觸發
```yaml
on:
  push:
    branches: [ main, develop ]
```
- 推送到 `main` 或 `develop` 分支時執行

### Pull Request 觸發
```yaml
  pull_request:
    branches: [ main ]
```
- 當 PR 目標為 `main` 分支時執行
- 確保程式碼品質

### 定時執行
```yaml
  schedule:
    - cron: '0 0 * * *'
```
- 每天 UTC 時間 00:00 執行
- 確保範例持續可用
- 及早發現外部相依性問題

### Cron 語法說明
```
分 時 日 月 星期
0  0  *  *  *
```
- 第一個 0：第 0 分鐘
- 第二個 0：第 0 小時 (UTC)
- 第三個 *：每天
- 第四個 *：每月
- 第五個 *：每週任何一天

## Jobs 詳細說明

### Job 1: test-workshop-examples（章節範例測試）

#### 測試矩陣策略
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    chapter: [1, 2, 3, 4, 5, 6, 7, 8]
```

**矩陣說明：**
- 產生 16 個並行測試 (2 Node 版本 × 8 章節)
- 確保跨版本相容性
- 獨立測試每個章節

#### 執行環境
```yaml
runs-on: ubuntu-latest
```

#### 步驟詳解

##### 1. 檢出程式碼
```yaml
- uses: actions/checkout@v4
```

##### 2. 設定 Node.js
```yaml
- name: 設定 Node.js ${{ matrix.node-version }}
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
```
- 使用矩陣中指定的 Node.js 版本
- 啟用 npm 快取

##### 3. 安裝相依套件
```yaml
- name: 安裝相依套件
  run: |
    npm ci
    npx playwright install --with-deps
```
- `npm ci`: 安裝專案相依套件
- `playwright install --with-deps`: 安裝 Playwright 瀏覽器和系統相依

##### 4. 執行章節測試
```yaml
- name: 執行第 ${{ matrix.chapter }} 章範例測試
  run: |
    if [ -d "workshop/chapter-${{ matrix.chapter }}" ]; then
      cd workshop/chapter-${{ matrix.chapter }}
      if [ -f "test.spec.ts" ]; then
        npx playwright test
      fi
    fi
  env:
    CI: true
```

**測試邏輯：**
1. 檢查章節目錄是否存在
2. 進入章節目錄
3. 如果有測試檔案，執行測試
4. 設定 CI 環境變數

##### 5. 上傳測試報告
```yaml
- name: 上傳測試報告
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report-ch${{ matrix.chapter }}-node${{ matrix.node-version }}
    path: workshop/chapter-${{ matrix.chapter }}/playwright-report/
    retention-days: 30
```

**重要設定：**
- `if: always()`: 無論測試成功或失敗都上傳報告
- 報告命名包含章節和 Node 版本
- 保留 30 天

### Job 2: test-integration-scripts（整合腳本測試）

#### 執行環境
```yaml
runs-on: ubuntu-latest
```

#### 步驟詳解

##### 1. 檢出程式碼
```yaml
- uses: actions/checkout@v4
```

##### 2. 設定 Node.js
```yaml
- name: 設定 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```

##### 3. 設定 Python
```yaml
- name: 設定 Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'
    cache: 'pip'
```
- 支援 Python 整合測試
- 啟用 pip 快取

##### 4. 安裝套件
```yaml
- name: 安裝套件
  run: |
    npm ci
    pip install -r requirements.txt || echo "No requirements.txt found"
```
- 安裝 Node.js 和 Python 相依套件
- 容錯處理：如果沒有 requirements.txt 也不會失敗

##### 5. 測試 AI 整合
```yaml
- name: 測試 AI 整合腳本
  run: |
    # 測試 Claude 整合
    if [ -f "integrations/claude/test.js" ]; then
      node integrations/claude/test.js
    fi
    
    # 測試 Gemini 整合
    if [ -f "integrations/gemini/test.py" ]; then
      python integrations/gemini/test.py
    fi
    
    # 測試 MCP 整合
    if [ -f "integrations/mcp/test.js" ]; then
      node integrations/mcp/test.js
    fi
  env:
    CI: true
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

**測試項目：**
- Claude (Anthropic) 整合
- Gemini (Google) 整合
- MCP (Model Context Protocol) 整合

**環境變數：**
- 使用 GitHub Secrets 安全存儲 API 金鑰
- CI 標記表示在 CI 環境執行

### Job 3: test-mcp-server（MCP 伺服器測試）

#### 執行環境
```yaml
runs-on: ubuntu-latest
```

#### 步驟詳解

##### 1. 檢出程式碼
```yaml
- uses: actions/checkout@v4
```

##### 2. 設定 Node.js
```yaml
- name: 設定 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
```

##### 3. 安裝 Playwright
```yaml
- name: 安裝 Playwright
  run: |
    npm ci
    npx playwright install chromium
```
- 只安裝 Chromium 瀏覽器（節省時間和資源）

##### 4. 測試 MCP 伺服器
```yaml
- name: 測試 MCP 伺服器
  run: |
    if [ -f "integrations/mcp/playwright-mcp.js" ]; then
      # 啟動 MCP 伺服器
      node integrations/mcp/playwright-mcp.js &
      MCP_PID=$!
      
      # 等待伺服器啟動
      sleep 5
      
      # 執行測試
      curl -X POST http://localhost:3001/test || true
      
      # 關閉伺服器
      kill $MCP_PID
    fi
  env:
    CI: true
```

**測試流程：**
1. 背景啟動 MCP 伺服器
2. 記錄程序 ID
3. 等待 5 秒確保啟動完成
4. 發送測試請求
5. 關閉伺服器程序

## 環境變數配置

### 必要的 Secrets

在 GitHub repository 設定以下 secrets：

1. **ANTHROPIC_API_KEY**
   - 用途：Claude API 測試
   - 取得方式：[Anthropic Console](https://console.anthropic.com/)

2. **GOOGLE_API_KEY**
   - 用途：Gemini API 測試
   - 取得方式：[Google AI Studio](https://makersuite.google.com/app/apikey)

3. **OPENAI_API_KEY**
   - 用途：OpenAI API 測試
   - 取得方式：[OpenAI Platform](https://platform.openai.com/api-keys)

### 設定步驟

1. 前往 Settings → Secrets and variables → Actions
2. 點擊 "New repository secret"
3. 輸入 Name（例如：`ANTHROPIC_API_KEY`）
4. 輸入 Value（API 金鑰）
5. 點擊 "Add secret"

## 測試報告分析

### 下載測試報告

1. 前往 Actions 標籤
2. 選擇執行的工作流程
3. 在 Artifacts 區域下載報告
4. 解壓縮並開啟 `index.html`

### 報告內容

Playwright 測試報告包含：
- 測試總覽（通過/失敗/跳過）
- 詳細的測試步驟
- 截圖和錄影（如果設定）
- 錯誤堆疊追蹤
- 測試執行時間

### 本地查看報告

```bash
# 下載報告後
unzip playwright-report-ch1-node20.x.zip
cd playwright-report
npx playwright show-report
```

## 故障排除

### 問題 1：Playwright 安裝失敗

**症狀：**
```
Error: Failed to install browsers
```

**解決方法：**
```yaml
- name: 安裝 Playwright
  run: |
    npx playwright install-deps
    npx playwright install
```

### 問題 2：API 金鑰錯誤

**症狀：**
```
Error: Invalid API key provided
```

**檢查項目：**
1. Secret 名稱是否正確（區分大小寫）
2. API 金鑰是否有效
3. API 金鑰是否有必要權限

### 問題 3：測試超時

**症狀：**
```
Test timeout of 30000ms exceeded
```

**解決方法：**
```javascript
// 在測試檔案中增加超時時間
test.setTimeout(60000); // 60 秒
```

或在 playwright.config.ts 中全域設定：
```javascript
export default {
  timeout: 60000,
  // ...
}
```

### 問題 4：MCP 伺服器連線失敗

**症狀：**
```
curl: (7) Failed to connect to localhost port 3001
```

**可能原因：**
- 伺服器啟動時間不足
- 端口被佔用
- 伺服器啟動失敗

**解決方法：**
```bash
# 增加等待時間
sleep 10

# 或使用 retry 邏輯
for i in {1..10}; do
  if curl -X POST http://localhost:3001/test; then
    break
  fi
  sleep 1
done
```

## 最佳實踐

### 1. 測試隔離
- 每個測試應該獨立執行
- 避免測試間的相依性
- 清理測試資料

### 2. 並行優化
```yaml
strategy:
  matrix:
    # 限制並行數量避免資源競爭
    max-parallel: 4
```

### 3. 條件執行
```yaml
# 只在特定檔案變更時執行
on:
  push:
    paths:
      - 'workshop/**'
      - 'integrations/**'
      - '*.json'
```

### 4. 錯誤容錯
```yaml
# 允許特定測試失敗
strategy:
  matrix:
    include:
      - chapter: experimental
        continue-on-error: true
```

### 5. 快取優化
```yaml
# 快取 Playwright 瀏覽器
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

## 效能監控

### 關鍵指標

1. **測試執行時間**
   - 單章節測試：1-3 分鐘
   - 整合測試：2-5 分鐘
   - MCP 測試：1-2 分鐘

2. **並行效率**
   - 矩陣測試並行度：最多 16
   - 總執行時間：5-10 分鐘

3. **成功率追蹤**
   - 目標成功率：> 95%
   - 定時執行成功率：> 90%

### 優化建議

1. **減少測試時間**
   - 使用測試分組
   - 跳過不必要的測試
   - 優化測試邏輯

2. **提高穩定性**
   - 增加重試機制
   - 改善等待策略
   - 處理網路異常

## 維護檢查清單

### 每週檢查
- [ ] 查看定時執行結果
- [ ] 分析失敗測試
- [ ] 清理舊的 artifacts

### 每月檢查
- [ ] 更新 Actions 版本
- [ ] 更新測試相依套件
- [ ] 審查測試覆蓋率
- [ ] 優化測試效能

### 每季檢查
- [ ] 更新 Node.js 版本矩陣
- [ ] 評估新的測試需求
- [ ] 重構測試架構

## 相關連結

- [Playwright 官方文件](https://playwright.dev/)
- [GitHub Actions 測試最佳實踐](https://docs.github.com/en/actions/automating-builds-and-tests)
- [Node.js 測試指南](https://nodejs.org/en/docs/guides/testing/)
- [Python 測試框架](https://docs.python.org/3/library/unittest.html)

---

最後更新：2024年12月