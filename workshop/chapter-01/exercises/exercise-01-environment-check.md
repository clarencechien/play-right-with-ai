# 練習 1：環境驗證

## 目標
確認所有必要的開發工具都已正確安裝並可以正常運作。

## 預計時間
15-20 分鐘

## 步驟

### 1. 驗證 Node.js 和 npm
執行以下命令並記錄版本號：

```bash
node --version
npm --version
```

預期結果：
- Node.js: v20.0.0 或更新
- npm: 10.0.0 或更新

### 2. 驗證 VS Code
```bash
code --version
```

預期結果：顯示 VS Code 版本資訊

### 3. 驗證 Playwright
```bash
# 在專案目錄中執行
npx playwright --version
```

預期結果：顯示 Playwright 版本

### 4. 創建測試腳本
創建檔案 `test-environment.js`：

```javascript
// test-environment.js
console.log('🔍 開始環境檢查...\n');

// 檢查 Node.js
console.log(`✅ Node.js 版本: ${process.version}`);

// 檢查 npm
const { execSync } = require('child_process');
const npmVersion = execSync('npm --version').toString().trim();
console.log(`✅ npm 版本: ${npmVersion}`);

// 檢查環境變數
const aiServices = {
  'ANTHROPIC_API_KEY': 'Claude',
  'GOOGLE_API_KEY': 'Gemini',
  'OPENAI_API_KEY': 'GPT'
};

console.log('\n📊 AI 服務設定狀態:');
for (const [key, service] of Object.entries(aiServices)) {
  const isSet = process.env[key] ? '✅' : '❌';
  console.log(`${isSet} ${service} (${key})`);
}

console.log('\n🎉 環境檢查完成！');
```

### 5. 執行測試腳本
```bash
node test-environment.js
```

## 成功標準

- [ ] 所有版本檢查都通過
- [ ] 至少有一個 AI 服務的 API 金鑰已設定
- [ ] 測試腳本成功執行無錯誤

## 提交作業

將以下內容保存到 `environment-check-result.txt`：
1. 各工具的版本號
2. 測試腳本的執行結果截圖
3. 遇到的問題及解決方法（如果有）

## 故障排除

### Node.js 版本太舊
```bash
# 使用 nvm 管理 Node 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### Playwright 瀏覽器未安裝
```bash
npx playwright install
```

### 環境變數未生效
```bash
# 重新載入環境變數
source ~/.bashrc  # 或 ~/.zshrc
```

## 延伸學習

嘗試創建一個更完整的環境檢查工具，包含：
- 自動修復常見問題
- 生成詳細的環境報告
- 檢查網路連接和 AI 服務可用性