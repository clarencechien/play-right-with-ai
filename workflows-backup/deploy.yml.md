# Deploy to GitHub Pages 工作流程詳細文件

## 概述

`deploy.yml` 工作流程負責自動建構工作坊網站並部署到 GitHub Pages。這個工作流程確保每次推送到主分支時，網站都會自動更新。

## 工作流程結構

```yaml
name: Deploy to GitHub Pages
```

## 觸發條件

### 自動觸發
```yaml
on:
  push:
    branches: [ main ]
```
- 當程式碼推送到 `main` 分支時自動執行

### 手動觸發
```yaml
  workflow_dispatch:
```
- 可從 GitHub Actions 介面手動執行
- 用於緊急部署或測試

## 權限設定

```yaml
permissions:
  contents: read      # 讀取 repository 內容
  pages: write       # 寫入 GitHub Pages
  id-token: write    # OIDC token 用於安全部署
```

### 權限說明

1. **contents: read**
   - 允許工作流程讀取 repository 的檔案
   - 必要權限，用於 checkout 程式碼

2. **pages: write**
   - 允許工作流程部署到 GitHub Pages
   - 必要權限，用於上傳網站內容

3. **id-token: write**
   - 允許使用 OIDC (OpenID Connect) 進行安全驗證
   - 提供更安全的部署方式，避免使用長期 token

## 並發控制

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

- **group**: 確保同時只有一個部署在執行
- **cancel-in-progress**: 設為 `false` 避免中斷進行中的部署

## Jobs 詳細說明

### Job 1: Build（建構）

#### 執行環境
```yaml
runs-on: ubuntu-latest
```
使用最新版 Ubuntu 虛擬機器

#### 步驟詳解

##### 1. 檢出程式碼
```yaml
- uses: actions/checkout@v4
```
- 從 repository 檢出最新程式碼
- v4 版本提供更好的效能和功能

##### 2. 設定 Node.js
```yaml
- name: 設定 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```
- 安裝 Node.js 20.x 版本
- 啟用 npm 快取加速後續執行

##### 3. 安裝相依套件
```yaml
- name: 安裝相依套件
  run: npm ci
```
- 使用 `npm ci` 而非 `npm install`
- 確保使用 package-lock.json 中的確切版本
- 提供更快、更可靠的安裝

##### 4. 建立文件網站
```yaml
- name: 建立文件網站
  run: |
    # 使用自訂的建構腳本
    npm run build:site
    
    # 驗證輸出
    test -d docs || exit 1
    test -f docs/index.html || exit 1
    test -f docs/assets/css/main.css || exit 1
    test -f docs/assets/js/main.js || exit 1
    
    echo "✅ 網站建構完成"
```

**驗證項目：**
- `docs/` 目錄存在
- `index.html` 主頁面存在
- CSS 樣式檔案存在
- JavaScript 檔案存在

##### 5. 設定 GitHub Pages
```yaml
- name: 設定 GitHub Pages
  uses: actions/configure-pages@v4
```
準備 GitHub Pages 部署環境

##### 6. 執行冒煙測試
```yaml
- name: 執行冒煙測試
  run: |
    echo "執行網站完整性檢查..."
    
    # 檢查關鍵檔案
    test -f docs/index.html || exit 1
    test -f docs/search-index.json || exit 1
    test -d docs/playground || exit 1
    test -d docs/demos || exit 1
    
    # 檢查章節頁面
    for i in {1..8}; do
      if [ -f "docs/chapters/chapter-0${i}.html" ]; then
        echo "✅ 第 ${i} 章已生成"
      else
        echo "⚠️ 第 ${i} 章未找到"
      fi
    done
    
    echo "✅ 冒煙測試通過"
```

**測試內容：**
- 搜尋索引檔案
- Playground 目錄
- Demos 目錄
- 8 個章節的頁面

##### 7. 上傳成品
```yaml
- name: 上傳成品
  uses: actions/upload-pages-artifact@v3
  with:
    path: 'docs'
```
將建構完成的網站上傳為 artifact

### Job 2: Deploy（部署）

#### 環境設定
```yaml
environment:
  name: github-pages
  url: ${{ steps.deployment.outputs.page_url }}
```
- 使用 `github-pages` 環境
- 自動設定部署 URL

#### 相依性
```yaml
needs: build
```
必須等待 build job 完成

#### 部署步驟
```yaml
- name: 部署到 GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```
執行實際的部署操作

### Job 3: Notify（通知）

#### 執行條件
```yaml
needs: deploy
if: always()
```
- 等待 deploy 完成
- 無論成功或失敗都執行

#### 通知邏輯
```yaml
- name: 通知部署狀態
  run: |
    if [ "${{ needs.deploy.result }}" == "success" ]; then
      echo "✅ 成功部署到 GitHub Pages"
      echo "🔗 網站連結: https://${{ github.repository_owner }}.github.io/play-right-with-ai/"
    else
      echo "❌ 部署失敗，請檢查錯誤日誌"
    fi
```

## 環境變數

### 內建變數
- `${{ github.repository_owner }}`: Repository 擁有者名稱
- `${{ steps.deployment.outputs.page_url }}`: 部署後的網站 URL
- `${{ needs.deploy.result }}`: 前一個 job 的執行結果

## 故障排除

### 問題 1：npm ci 失敗

**症狀：**
```
npm ERR! The package-lock.json file was created with an old version of npm
```

**解決方法：**
1. 本地更新 npm：`npm install -g npm@latest`
2. 刪除 node_modules 和 package-lock.json
3. 重新執行 `npm install`
4. 提交更新的 package-lock.json

### 問題 2：建構失敗 - 找不到檔案

**症狀：**
```
test: docs/index.html: No such file or directory
```

**可能原因：**
- `npm run build:site` 腳本錯誤
- 輸出目錄不正確

**偵錯步驟：**
```bash
# 本地測試建構
npm run build:site
ls -la docs/
```

### 問題 3：Pages 部署權限錯誤

**症狀：**
```
Error: Deployment failed with error: You don't have permission to deploy to GitHub Pages
```

**解決方法：**
1. 檢查 repository Settings → Pages
2. 確認 Source 設為 "GitHub Actions"
3. 檢查工作流程權限設定

### 問題 4：並發錯誤

**症狀：**
```
Error: Concurrency group 'pages' has a job already running
```

**解決方法：**
- 等待前一個部署完成
- 或取消進行中的部署

## 最佳實踐

### 1. 版本管理
- 定期更新 Actions 版本
- 使用特定版本號而非 `@latest`

### 2. 快取策略
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: package-lock.json
```

### 3. 錯誤處理
- 在關鍵步驟加入驗證
- 使用 `exit 1` 明確失敗
- 提供清晰的錯誤訊息

### 4. 安全性
- 避免在日誌中輸出敏感資訊
- 使用 OIDC 而非長期 token
- 定期審查權限設定

## 自訂調整

### 修改觸發分支
```yaml
on:
  push:
    branches: [ main, develop ]  # 新增 develop 分支
```

### 新增路徑過濾
```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'docs/**'
      - 'src/**'
      - 'package.json'
```

### 新增環境變數
```yaml
env:
  NODE_ENV: production
  BUILD_TARGET: github-pages
```

### 新增建構參數
```yaml
- name: 建立文件網站
  run: |
    npm run build:site -- --minify --optimize
```

## 監控與維護

### 查看執行歷史
1. 前往 Actions 標籤
2. 選擇 "Deploy to GitHub Pages" 工作流程
3. 查看執行記錄和時間

### 效能指標
- 平均建構時間：3-5 分鐘
- 平均部署時間：1-2 分鐘
- 總執行時間：4-7 分鐘

### 定期檢查
- [ ] Actions 版本更新
- [ ] Node.js 版本相容性
- [ ] 建構輸出完整性
- [ ] 部署成功率

## 相關連結

- [GitHub Pages 官方文件](https://docs.github.com/en/pages)
- [actions/deploy-pages](https://github.com/actions/deploy-pages)
- [actions/configure-pages](https://github.com/actions/configure-pages)
- [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact)

---

最後更新：2024年12月