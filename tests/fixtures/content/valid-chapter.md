---
chapter: 1
title:
  zh: "AI 指揮家 - 思維轉變與環境搭建"
  en: "AI Conductor - Mindset Shift and Environment Setup"
objectives:
  - "理解從『編碼者』到『AI 指揮家』的思維轉變"
  - "完成完整的開發環境設置"
  - "設置並測試 AI 服務"
prerequisites:
  - "基本的命令列操作知識"
  - "網際網路連接"
duration: "2 hours"
tags: ["setup", "mindset", "environment"]
---

# AI 指揮家：思維轉變與環境搭建

## 學習目標

在本章節中，您將學習：

1. **思維模式轉變**：從傳統編碼者轉變為 AI 指揮家
2. **環境準備**：設置完整的開發和測試環境
3. **工具配置**：配置 AI 工具和 Playwright

## 前置需求

- Node.js 18+ 已安裝
- 基本的命令列操作能力
- 穩定的網際網路連接

## 核心概念

### 什麼是 AI 指揮家？

AI 指揮家是能夠協調多個 AI 工具，引導它們完成複雜開發任務的新型開發者角色。

```javascript
// 範例：AI 指揮家的工作流程
const workflow = {
  step1: 'Define requirements in natural language',
  step2: 'AI generates application code',
  step3: 'AI creates test strategy',
  step4: 'AI writes test scripts',
  step5: 'AI analyzes and repairs'
};
```

### 內部連結測試

- [下一章節](../02-first-movement/index.md)
- [練習檔案](./exercises/exercise-01.md)
- [提示範本](./prompts/setup-prompt.md)

### 外部連結測試

- [Playwright 官方文件](https://playwright.dev)
- [Claude AI](https://claude.ai)
- [GitHub 專案](https://github.com/clarencechien/play-right-with-ai)

## 實作練習

### 練習 1：環境設置

1. 安裝 Node.js 和 npm
2. 設置 Playwright
3. 配置 AI 工具

### 練習 2：第一個 AI 生成應用

使用 AI 生成一個簡單的 TODO 應用程式。

## 程式碼範例

```javascript
// TODO 應用程式結構
class TodoApp {
  constructor() {
    this.todos = [];
  }
  
  addTodo(text) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }
}
```

## 總結

本章介紹了 AI 指揮家的概念，並完成了基礎環境的搭建。您現在已經準備好開始 AI 驅動的開發旅程。

## 下一步

在下一章「第一樂章：AI 應用生成」中，我們將使用 AI 從自然語言需求生成完整的應用程式。

---
<!-- Source: content/chapters/01-ai-conductor/index.md -->
<!-- Generated: 2025-09-12 -->
<!-- Version: 1.0.0 -->