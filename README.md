# Play right with AI 🎭🤖

> **用 AI 重新定義測試開發流程** - 一個開源線上工作坊，教你如何成為「AI 指揮家」，編排完整的開發測試自循環工作流程。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Workshop](https://img.shields.io/badge/Workshop-8%20Chapters-blue)](./workshop)
[![Language](https://img.shields.io/badge/Language-Traditional%20Chinese-red)](./README.md)
[![GitHub Pages](https://img.shields.io/badge/Demo-Live-success)](https://clarencechien.github.io/play-right-with-ai/)

## 🌐 線上體驗

🔗 **立即體驗**:
[https://clarencechien.github.io/play-right-with-ai/](https://clarencechien.github.io/play-right-with-ai/)

## 🎯 工作坊願景

從「寫程式」到「指揮 AI 寫程式」- 這不只是工具的改變，而是思維模式的革命。本工作坊將帶領你掌握 AI 驅動的自循環開發流程，讓 AI 成為你的開發夥伴，自動完成：生成應用 → 撰寫測試 → 執行測試 → 分析失敗 → 自我修復的完整循環。

## 🚀 你將學到什麼

- 🧠 **AI 指揮家思維** - 從寫程式到編排 AI 的思維轉變
- 🔄 **自循環工作流** - 建立 AI 驅動的開發測試自動化流程
- 🌐 **雙語提示策略** - "Think in English, Output in Chinese" 最佳實踐
- 🎭 **Playwright + AI** - 整合 Playwright MCP 實現智能測試
- 🔧 **自我修復系統** - 讓測試自動診斷和修復問題
- 🎯 **實戰專案經驗** - 從 TODO 應用到複雜系統的完整實作

## 📚 工作坊章節

### 第一樂章：基礎建立

1. **[Chapter 1: AI 指揮家](./workshop/chapter-01)** - 環境設置與心態轉變
2. **[Chapter 2: 第一樂章](./workshop/chapter-02)** - AI 生成應用程式

### 第二樂章：測試策略

3. **[Chapter 3: 第二樂章](./workshop/chapter-03)** - AI 作為測試策略師
4. **[Chapter 4: 第三樂章](./workshop/chapter-04)** -
   AI 編寫 Playwright 測試腳本

### 第三樂章：智能診斷

5. **[Chapter 5: 第四樂章](./workshop/chapter-05)** - AI 分析測試失敗
6. **[Chapter 6: 終樂章](./workshop/chapter-06)** - AI 完成自我修復

### 第四樂章：進階應用

7. **[Chapter 7: 變奏曲](./workshop/chapter-07)** - 擴展工作流程到複雜場景
8. **[Chapter 8: 總譜](./workshop/chapter-08)** - 獨立端到端 AI 編排挑戰

## 🛠️ 前置需求

### 基礎知識

- ✅ 基本 JavaScript/TypeScript 知識
- ✅ 基礎 HTML/CSS 理解
- ✅ 命令列操作經驗

### 環境需求

- Node.js 18+
- VS Code 或其他程式編輯器
- Chrome/Edge 瀏覽器
- Git

### AI 服務帳號（至少一個）

- [Claude API](https://console.anthropic.com/)
- [Google Gemini API](https://makersuite.google.com/app/apikey)
- [OpenAI API](https://platform.openai.com/)

## 🎉 最新更新 (2025-09-12)

### 近期重大改進

- 🎨 **深色主題優化** - 統一所有頁面的深色主題，改善輸入框可見度
- 🔗 **導航修復** - 修復所有 404 錯誤，建立完整導航系統
- 📚 **內容架構完成** - 單一來源架構實作，消除內容重複
- 🧪 **TDD 測試完成** - 81 個測試確保內容管線品質
- 🚀 **生產就緒** - 98% 完成度，已部署至 GitHub Pages

## 🚀 快速開始

### 1. Clone 專案

```bash
git clone https://github.com/clarencechien/play-right-with-ai.git
cd play-right-with-ai
```

### 2. 安裝依賴

```bash
npm install
npx playwright install --with-deps
```

### 3. 設定 AI 服務

```bash
cp .env.example .env
# 編輯 .env 檔案，加入你的 API keys
```

### 4. 驗證環境

```bash
npm run validate:env
```

### 5. 開始學習

```bash
npm run workshop:start
```

## 📂 專案結構

完整專案結構詳見 [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)  
內容架構實作總結詳見 [CONTENT_ARCHITECTURE_SUMMARY.md](./docs/CONTENT_ARCHITECTURE_SUMMARY.md)  
快速學習指南詳見
[llms.txt](./docs/llms.txt) - 為 AI 助手準備的專案總覽

```
play-right-with-ai/
├── content/           # 🆕 單一來源內容架構 (全部 8 章節)
│   ├── chapters/     # 所有章節內容與元資料
│   ├── templates/    # 內容模板
│   └── config.yaml   # 全域設定
├── workshop/          # 工作坊章節內容 (自動生成)
│   ├── chapter-01/   # 環境設置
│   ├── chapter-02/   # AI 生成應用
│   └── ...
├── scripts/          # 🆕 建構與驗證腳本
│   ├── build-chapters.js    # 內容生成管線
│   ├── validate-links.js    # 連結驗證系統
│   └── sync-content.js      # 同步檢查器
├── tests/            # 測試套件 (含 81 個 TDD 測試)
│   ├── content/     # 🆕 內容管線測試
│   ├── e2e/         # 端到端測試
│   └── specs/       # 測試規格
├── docs/             # 靜態網站內容 (自動生成)
│   ├── chapters/    # 章節 HTML 頁面
│   ├── playground/  # 互動式練習場
│   └── reports/     # 驗證報告
├── prompts/          # 黃金提示詞集合 (40+ 提示詞)
├── sample-app-source/ # 範例應用程式 (4 個應用)
├── integrations/     # AI 服務整合
├── memory-bank/      # 專案記憶系統
└── .github/         # CI/CD 設定
    └── workflows/   # GitHub Actions (含內容驗證)
```

## 🎭 範例應用程式

工作坊包含多個漸進式複雜度的範例應用：

1. **TODO App** - 基礎 CRUD 操作與測試
2. **Shopping List** - 分類管理與預算追蹤
3. **Multi-Page App** - 路由與複雜互動
4. **Capstone Starter** - 整合所有概念的專案模板

每個應用都包含：

- 完整原始碼
- Playwright 測試套件
- 刻意設計的 bugs（用於除錯練習）
- 修復後的解決方案

## 🤖 AI 整合特色

### Playwright MCP (Model Context Protocol)

```javascript
// AI 可以透過自然語言控制瀏覽器
const mcp = new PlaywrightMCP(page);
await mcp.execute({
  action: 'type',
  target: '[data-testid="todo-input"]',
  value: 'AI 生成的任務',
});
```

### 雙語提示策略

```markdown
# Think in English (Technical Specification)

Create a web application with CRUD operations...

# Output in Chinese (User Interface)

建立一個待辦事項應用程式，包含新增、編輯、刪除功能...
```

## 📊 學習成果評估

### 自我評估檢查表

- [ ] 能夠設定 AI 開發環境
- [ ] 掌握雙語提示策略
- [ ] 能用 AI 生成完整應用程式
- [ ] 會用 AI 設計測試策略
- [ ] 能讓 AI 編寫 Playwright 測試
- [ ] 會分析測試失敗原因
- [ ] 能實作自我修復機制
- [ ] 完成總整專案

### 認證標準

完成所有章節練習並通過總整專案挑戰，即可獲得：

- 🏆 工作坊完成證書
- 💼 LinkedIn 技能認證
- 🌟 GitHub 成就徽章

## 🤝 社群參與

### 獲得幫助

- 💬
  [GitHub Discussions](https://github.com/clarencechien/play-right-with-ai/discussions) - 學習討論
- 🐛
  [Issues](https://github.com/clarencechien/play-right-with-ai/issues) - 回報問題
- 📧 Email: workshop@playrightwithAI.com

### 貢獻指南

我們歡迎各種形式的貢獻：

- 提交改進的提示詞
- 分享學習心得
- 回報和修復 bugs
- 翻譯其他語言版本

詳見 [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 📈 成功指標

### 學習者成果

- 500+ GitHub stars ⭐
- 100+ 完成總整專案 🎓
- 50+ 社群討論 💬
- 95% 滿意度 😊

### 技能提升

- 開發效率提升 3-5 倍
- 測試覆蓋率達 80%+
- Bug 修復時間減少 60%
- 程式碼品質顯著提升

## 📝 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](./LICENSE) 檔案

## 📖 重要文檔

### 專案文檔

- [專案結構說明](./docs/PROJECT_STRUCTURE.md) - 完整的目錄結構解析
- [內容架構總結](./docs/CONTENT_ARCHITECTURE_SUMMARY.md) - 單一來源架構實作細節
- [部署指南](./docs/DEPLOYMENT.md) - GitHub Pages 部署說明
- [更新日誌](./docs/CHANGELOG.md) - 版本更新記錄

### 社群文檔

- [貢獻指南](./docs/CONTRIBUTING.md) - 如何參與專案貢獻
- [行為準則](./docs/CODE_OF_CONDUCT.md) - 社群行為規範
- [作者名單](./docs/AUTHORS.md) - 專案貢獻者
- [公告事項](./docs/ANNOUNCEMENT.md) - 最新消息與更新

### 技術文檔

- [講師指南](./docs/instructor-guide.md) - 工作坊教學指引
- [常見問題](./docs/faq.md) - FAQ 解答
- [隱私政策](./docs/privacy-policy.html) - 資料使用說明
- [實作報告](./docs/reports/) - 各項驗證與測試報告

## 🙏 致謝

感謝以下專案和社群的支援：

- [Playwright](https://playwright.dev/) - 現代化的端到端測試框架
- [Anthropic Claude](https://www.anthropic.com/) - 強大的 AI 助手
- [Google Gemini](https://deepmind.google/technologies/gemini/) - 多模態 AI 模型
- [OpenAI](https://openai.com/) - GPT 系列模型

## 🚦 專案狀態

![Build Status](https://img.shields.io/github/actions/workflow/status/clarencechien/play-right-with-ai/workshop-tests.yml)
![Coverage](https://img.shields.io/codecov/c/github/clarencechien/play-right-with-ai)
![Last Commit](https://img.shields.io/github/last-commit/clarencechien/play-right-with-ai)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Active-green)
![Progress](https://img.shields.io/badge/Progress-98%25-brightgreen)

### 工作坊完成度 (98% 完成 - 生產就緒)

- ✅ **章節內容**: 8/8 章節完整 (25,000+ 字教學內容)
- ✅ **內容架構**: 單一來源架構實作完成
- ✅ **範例應用**: 4/4 應用實作 (TODO, 計算機, 計時器, 多頁應用)
- ✅ **提示詞庫**: 40+ 黃金提示詞 (版本無關化)
- ✅ **測試套件**: 81 個 TDD 測試 + E2E 測試
- ✅ **建構系統**: 自動化內容生成管線
- ✅ **文檔資料**: 完整中文文檔
- ✅ **線上部署**: GitHub Pages 運行中
- ✅ **CI/CD**: GitHub Actions 內容驗證管線
- ✅ **UX/UI**: 深色主題統一，優化使用者體驗
- ✅ **導航系統**: 所有連結已修復並測試通過

---

<div align="center">

**開始你的 AI 指揮家之旅 🎭**

[立即開始](./workshop/chapter-01) | [查看範例](./sample-app-source) |
[加入社群](https://github.com/clarencechien/play-right-with-ai/discussions)

Made with ❤️ by the Play right with AI Community

</div>
