# 第一章：AI 指揮家 - 思維轉變與環境搭建

## 學習目標

完成本章後，您將能夠：
- ✅ 理解從「編碼者」到「AI 指揮家」的思維轉變
- ✅ 完成完整的開發環境設置（VS Code、Node.js、Playwright）
- ✅ 設置並測試 AI 服務（Claude、Gemini、GPT-4）
- ✅ 掌握「Think in English, Output in Chinese」的雙語提示策略
- ✅ 執行第一個 AI 驅動的開發任務

## 前置需求

- 基本的命令列操作知識
- 可以連接網際網路的電腦
- 至少一個 AI 服務的存取權限（Claude、Gemini 或 GPT-4）

## 環境設置

### VS Code 安裝與設定

Visual Studio Code 是我們的主要開發環境，它提供了優秀的 AI 整合能力。

#### Windows 安裝步驟
```bash
# 1. 訪問 https://code.visualstudio.com/
# 2. 下載 Windows 版本
# 3. 執行安裝程式，勾選以下選項：
#    - Add to PATH（重要！）
#    - Register Code as an editor for supported file types
#    - Add "Open with Code" action to Windows Explorer
```

#### macOS 安裝步驟
```bash
# 使用 Homebrew
brew install --cask visual-studio-code

# 或從官網下載 DMG 檔案
# https://code.visualstudio.com/download
```

#### Linux 安裝步驟
```bash
# Ubuntu/Debian
sudo snap install code --classic

# 或使用 apt
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code
```

#### 必要的 VS Code 擴充套件
```json
{
  "recommendations": [
    "ms-playwright.playwright",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "streetsidesoftware.code-spell-checker",
    "GitHub.copilot"
  ]
}
```

### Node.js 與 npm

Node.js 是執行 JavaScript 的環境，npm 是套件管理工具。

#### 安裝 Node.js（推薦使用 LTS 版本）
```bash
# 檢查是否已安裝
node --version
npm --version

# Windows - 使用 Chocolatey
choco install nodejs-lts

# macOS - 使用 Homebrew
brew install node@20

# Linux - 使用 NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 驗證安裝
```bash
# 應該顯示 v20.x.x 或更新版本
node --version

# 應該顯示 10.x.x 或更新版本
npm --version
```

### Playwright 安裝

Playwright 是我們用來進行瀏覽器自動化測試的主要工具。

```bash
# 創建專案目錄
mkdir play-right-with-ai-workspace
cd play-right-with-ai-workspace

# 初始化 npm 專案
npm init -y

# 安裝 Playwright
npm install --save-dev @playwright/test

# 安裝瀏覽器
npx playwright install

# 驗證安裝
npx playwright test --version
```

### AI 服務設置

#### Claude (Anthropic)
1. 訪問 https://claude.ai 或 https://console.anthropic.com
2. 註冊帳號並獲取 API 金鑰
3. 設定環境變數：
```bash
# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="your-api-key-here"

# macOS/Linux
export ANTHROPIC_API_KEY="your-api-key-here"
```

#### Gemini (Google)
1. 訪問 https://makersuite.google.com/app/apikey
2. 創建 API 金鑰
3. 設定環境變數：
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

#### GPT-4 (OpenAI)
1. 訪問 https://platform.openai.com/api-keys
2. 創建 API 金鑰
3. 設定環境變數：
```bash
export OPENAI_API_KEY="your-api-key-here"
```

## 心態轉變：從編碼者到指揮家

### 傳統開發者 vs AI 指揮家

| 傳統開發者 | AI 指揮家 |
|-----------|----------|
| 親手編寫每一行程式碼 | 設計高層次需求和架構 |
| 專注於語法和實作細節 | 專注於業務邏輯和流程 |
| 除錯時逐行檢查程式碼 | 引導 AI 分析和修復問題 |
| 手動撰寫測試案例 | 協調 AI 生成完整測試策略 |
| 線性、序列式工作流程 | 循環、迭代式工作流程 |

### 核心思維轉變

1. **從「How」到「What」**
   - 不再關注「如何實作」
   - 專注於「要實現什麼」

2. **從「完美主義」到「迭代優化」**
   - 接受 AI 的初始輸出可能不完美
   - 透過迭代引導達到理想結果

3. **從「單打獨鬥」到「協同合作」**
   - AI 是您的團隊成員
   - 學會有效溝通和指導

## 雙語提示策略

### 為什麼要用雙語策略？

研究和實踐顯示，使用英文思考、中文輸出的策略能顯著提升 AI 的程式碼生成品質：

- **英文思考**：利用 AI 模型在英文技術文件上的訓練優勢
- **中文輸出**：確保最終結果符合本地化需求

### 策略實作範例

#### 純中文提示（較不理想）
```markdown
幫我寫一個待辦事項應用程式，要有新增、刪除、標記完成的功能。
```

#### 雙語策略提示（推薦）
```markdown
[English Planning]
Create a TODO application with the following features:
- Add new tasks with title and description
- Delete tasks with confirmation
- Mark tasks as complete/incomplete
- Local storage persistence
- Responsive design with mobile support

[Chinese Delivery]
請用繁體中文生成程式碼註解和使用者介面文字。
應用程式名稱：待辦事項管理系統
所有按鈕、標籤、提示訊息都要使用繁體中文。
```

### 雙語提示的最佳實踐

1. **技術規格用英文**
   ```markdown
   [Technical Specs]
   - Use React 18 with TypeScript
   - Implement Redux for state management
   - Use Material-UI components
   ```

2. **業務邏輯用清晰的結構**
   ```markdown
   [Business Logic]
   1. User authentication required
   2. Task priority: High, Medium, Low
   3. Due date validation
   ```

3. **本地化需求用中文**
   ```markdown
   [本地化需求]
   - 日期格式：YYYY年MM月DD日
   - 時間顯示：24小時制
   - 錯誤訊息：使用友善的繁體中文提示
   ```

## 實作練習

### 練習 1：環境驗證
請完成 `exercises/exercise-01-environment-check.md` 中的任務

### 練習 2：第一個 AI 提示
請完成 `exercises/exercise-02-first-ai-prompt.md` 中的任務

### 練習 3：雙語策略實踐
請完成 `exercises/exercise-03-bilingual-practice.md` 中的任務

## 範例輸出

查看 `example-output/` 目錄中的範例，了解預期的輸出結果。

## 思考與挑戰

### 深度思考題

1. **思維模式轉變**
   - 您認為從編碼者轉變為 AI 指揮家，最大的挑戰是什麼？
   - 這種轉變對軟體開發產業會有什麼長期影響？

2. **雙語策略的價值**
   - 為什麼英文思考能產生更好的程式碼結構？
   - 除了程式碼生成，雙語策略還能應用在哪些場景？

3. **AI 協作模式**
   - 如何判斷何時該自己編碼，何時該讓 AI 生成？
   - 怎樣的提示詞能最大化 AI 的能力？

### 延伸挑戰

1. **環境自動化**
   - 創建一個腳本，自動完成所有環境設置
   - 加入環境檢查和錯誤處理

2. **提示詞模板**
   - 設計一套標準化的提示詞模板
   - 測試不同模板的效果差異

3. **多 AI 協作**
   - 嘗試同時使用多個 AI 服務
   - 比較不同 AI 的輸出品質和特點

## 常見問題

### Q1: 一定要使用所有提到的 AI 服務嗎？
**A:** 不需要。至少有一個 AI 服務即可開始學習。建議從 Claude 或 GPT-4 開始。

### Q2: 為什麼選擇 Playwright 而不是 Selenium？
**A:** Playwright 提供更現代的 API、更好的效能、內建的等待機制，以及優秀的除錯工具。

### Q3: 雙語提示是否適用於所有 AI 模型？
**A:** 大部分現代 AI 模型都支援雙語提示。效果可能因模型而異，建議實際測試。

### Q4: 如果環境設置遇到問題怎麼辦？
**A:** 請參考 `start-here/check-environment.js` 腳本進行診斷，或在課程討論區尋求協助。

## 下一步

恭喜您完成第一章！您已經：
- ✅ 理解了 AI 指揮家的思維模式
- ✅ 完成了開發環境設置
- ✅ 掌握了雙語提示策略

準備好進入[第二章：第一樂章 - AI 生成應用程式](../chapter-02/README.md)了嗎？

---
*提醒：學習過程中遇到任何問題，歡迎在 GitHub Issues 中提出，我們會盡快協助您。*