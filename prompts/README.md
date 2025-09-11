# Golden Prompts Library 🪄

## 概述

這是 "Play right with AI" 工作坊的核心提示詞庫，包含經過測試和優化的 Golden Prompts，能夠可靠地引導 AI 模型生成高品質的程式碼、測試和分析。

## 目錄結構

```
prompts/
├── chapter-02/              # 應用程式生成
│   ├── app-generation.md    # Golden Prompt
│   └── app-generation.test.md # 測試條件
├── chapter-03/              # 測試策略創建
│   ├── test-strategy.md
│   └── test-strategy.test.md
├── chapter-04/              # Playwright 腳本生成
│   ├── playwright-scripts.md
│   └── playwright-scripts.test.md
├── chapter-05/              # 失敗分析與除錯
│   ├── failure-analysis.md
│   └── failure-analysis.test.md
├── chapter-06/              # 自動修復實施
│   ├── self-repair.md
│   └── self-repair.test.md
├── validation/              # 驗證工具
│   └── prompt-tester.js    # 自動化測試腳本
└── README.md               # 本文檔
```

## 雙語策略 (Think in English, Output in Chinese)

### 核心原則

所有 Golden Prompts 都採用雙語策略：

1. **英文思考**：利用 AI 模型在英文環境下的優越推理能力
2. **中文輸出**：確保本地開發者的可讀性和實用性
3. **技術精確**：透過英文邏輯結構提升技術準確性
4. **文化適應**：使用台灣常見的技術術語

### 實施範例

```markdown
## English Thinking Process
[Analyze requirements and design solution in English]

## 輸出要求 (繁體中文)
[Provide detailed implementation in Traditional Chinese]
```

## 各章節 Golden Prompts

### Chapter 2: Application Generation (應用程式生成)

**用途**：從自然語言需求生成完整的網頁應用程式

**特色**：
- 完整的 HTML/CSS/JavaScript 實作
- 響應式設計
- LocalStorage 資料持久化
- 詳細的中文註解

### Chapter 3: Test Strategy (測試策略)

**用途**：分析應用程式碼並創建全面的測試計劃

**特色**：
- 系統化的測試分析
- 風險評估矩陣
- 詳細的測試案例設計
- 自動化建議

### Chapter 4: Playwright Scripts (測試腳本)

**用途**：生成專業的 Playwright 自動化測試腳本

**特色**：
- Page Object Model 架構
- TypeScript 支援
- 智慧等待策略
- 錯誤處理機制

### Chapter 5: Failure Analysis (失敗分析)

**用途**：診斷測試失敗並提供根本原因分析

**特色**：
- 系統化的除錯方法
- 多層次原因分析
- 證據驅動的診斷
- 具體的解決方案

### Chapter 6: Self-Repair (自動修復)

**用途**：基於診斷結果自動實施修復

**特色**：
- 最小改動原則
- 完整的驗證流程
- 預防措施整合
- 知識庫更新

## 使用指南

### 1. 選擇適當的 Prompt

根據學習者程度選擇：
- **初學者**：使用基礎版本
- **進階者**：使用增強版本
- **專家**：可以自定義和擴展

### 2. 模型特定調整

**Claude 3.5 Sonnet**：原始 prompt 通常效果最佳
**GPT-4**：可能需要明確提醒中文輸出
**Gemini Pro**：需要更結構化的格式

### 3. 驗證輸出品質

使用測試條件檢查：
- ✅ 一致性
- ✅ 完整性
- ✅ 功能性
- ✅ 程式碼品質
- ✅ 雙語品質

## 自動化測試

```bash
# 測試單一章節
node validation/prompt-tester.js --chapter 2 --model claude

# 測試所有章節
node validation/prompt-tester.js --all --model gpt4 --iterations 5
```

## 版本歷史

- **v1.0.0** (2025-09-11): 初始版本，包含 5 個章節的 Golden Prompts

---

**Remember**: Golden Prompts 是活的文檔，會隨著 AI 技術演進持續改進！ 🚀
