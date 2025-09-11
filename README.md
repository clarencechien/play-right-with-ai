# Play right with AI 🎭🤖

> **用 AI 重新定義測試開發流程** - 一個開源線上工作坊，教你如何成為「AI 指揮家」，編排完整的開發測試自循環工作流程。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Workshop](https://img.shields.io/badge/Workshop-8%20Chapters-blue)](./workshop)
[![Language](https://img.shields.io/badge/Language-Traditional%20Chinese-red)](./README.md)

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
4. **[Chapter 4: 第三樂章](./workshop/chapter-04)** - AI 編寫 Playwright 測試腳本

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

```
play-right-with-ai/
├── workshop/           # 工作坊章節內容
│   ├── chapter-01/    # 環境設置
│   ├── chapter-02/    # AI 生成應用
│   └── ...           
├── prompts/           # 黃金提示詞集合
│   ├── chapter-02/    # 應用生成提示
│   ├── chapter-03/    # 測試策略提示
│   └── ...
├── sample-app-source/ # 範例應用程式
│   ├── todo-app/      # TODO 應用
│   ├── shopping-list/ # 購物清單應用
│   └── ...
├── tests/             # 測試套件
│   ├── e2e/          # 端到端測試
│   ├── specs/        # 測試規格
│   └── utils/        # 測試工具
├── integrations/      # AI 服務整合
│   ├── claude/       # Claude API
│   ├── gemini/       # Gemini API
│   └── openai/       # OpenAI API
└── .github/          # CI/CD 設定
    └── workflows/    # GitHub Actions
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
  value: 'AI 生成的任務'
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
- 💬 [GitHub Discussions](https://github.com/clarencechien/play-right-with-ai/discussions) - 學習討論
- 🐛 [Issues](https://github.com/clarencechien/play-right-with-ai/issues) - 回報問題
- 📧 Email: workshop@playrightwithAI.com

### 貢獻指南
我們歡迎各種形式的貢獻：
- 提交改進的提示詞
- 分享學習心得
- 回報和修復 bugs
- 翻譯其他語言版本

詳見 [CONTRIBUTING.md](./CONTRIBUTING.md)

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

---

<div align="center">

**開始你的 AI 指揮家之旅 🎭**

[立即開始](./workshop/chapter-01) | [查看範例](./sample-app-source) | [加入社群](https://github.com/clarencechien/play-right-with-ai/discussions)

Made with ❤️ by the Play right with AI Community

</div>