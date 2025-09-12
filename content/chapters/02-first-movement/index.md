# 第一樂章：AI 生成應用程式

## 章節概述

在這個章節中，我們將學習如何從「AI 指揮家」的角度，使用自然語言描述需求，引導 AI 生成完整的應用程式。這是自循環工作流程的第一步，也是最關鍵的基礎。

## 學習目標

完成本章節後，你將能夠：

- 理解如何將業務需求轉換為清晰的自然語言描述
- 掌握「英文思考，中文輸出」的雙語提示詞策略
- 學會評估和驗證 AI 生成的程式碼品質
- 運用迭代優化技術改進生成結果
- 建立對 AI 程式碼生成能力的正確期待

## 前置需求

- 完成 Chapter 1 的環境設置
- 具備基本的 JavaScript/TypeScript 知識
- 已配置好 AI 工具（Claude、Gemini 或 GPT）
- 準備好 VS Code 開發環境

## 核心概念

### 1. 從需求到程式碼的轉換

傳統開發流程中，我們需要：
1. 理解需求
2. 設計架構
3. 編寫程式碼
4. 測試驗證

作為 AI 指揮家，我們將這個流程轉變為：
1. **清晰描述**需求給 AI
2. **引導** AI 生成架構和程式碼
3. **評估**生成結果
4. **迭代**優化

### 2. 雙語提示詞策略的威力

#### 為什麼要「英文思考」？

AI 模型在英文訓練資料上有更豐富的程式設計範例，使用英文描述技術需求能夠：
- 獲得更精確的程式碼結構
- 減少歧義和誤解
- 利用 AI 的最佳能力範圍

#### 為什麼要「中文輸出」？

保持中文輸出確保：
- 團隊成員易於理解
- 註釋和文檔符合本地需求
- 降低溝通成本

### 3. 實例比較：純中文 vs 雙語策略

讓我們通過一個簡單的 TODO 應用來比較兩種方法：

#### 純中文提示詞
```
請幫我創建一個待辦事項應用程式，需要有新增、刪除、標記完成的功能。
```

#### 雙語策略提示詞
```
[Technical Requirements in English]
Create a TODO application with the following features:
- Add new todo items with title and description
- Mark items as complete/incomplete with checkbox
- Delete items with confirmation
- Filter by status (all/active/completed)
- Persist data in localStorage
- Responsive design with mobile support

[Output Requirements in Chinese]
請使用繁體中文編寫所有註釋、變數名稱和使用者介面文字。
程式碼結構要清晰，包含適當的錯誤處理。
```

## 實作練習：生成 TODO 應用程式

### 步驟 1：準備需求描述

創建一個清晰、結構化的需求文檔：

```markdown
# TODO Application Requirements

## Functional Requirements
1. User can add new todo items
2. User can mark items as complete/incomplete
3. User can delete items
4. User can filter items by status
5. Data persists across sessions

## Technical Requirements
- Pure JavaScript/HTML/CSS (no frameworks initially)
- localStorage for data persistence
- Responsive design
- Clean code architecture
- Error handling

## UI/UX Requirements
- Clean, modern interface
- Intuitive interactions
- Visual feedback for actions
- Mobile-friendly layout
```

### 步驟 2：構建黃金提示詞

```markdown
You are an expert full-stack developer. Please create a TODO application based on the following requirements:

[Core Features]
1. Add TODO items with:
   - Title (required)
   - Description (optional)
   - Created timestamp
   - Unique ID

2. Item Management:
   - Toggle complete/incomplete status
   - Delete with confirmation dialog
   - Edit existing items
   - Display completion percentage

3. Filtering & Sorting:
   - Filter by: All, Active, Completed
   - Sort by: Date created, Alphabetical
   - Search by keyword

4. Data Persistence:
   - Use localStorage API
   - Handle storage errors gracefully
   - Data validation before saving

[Technical Implementation]
- Use vanilla JavaScript with ES6+ features
- Implement MVC or similar pattern for organization
- Add proper error handling and user feedback
- Ensure cross-browser compatibility
- Mobile-responsive design

[Code Quality]
- Clear variable and function names
- Comprehensive comments in Traditional Chinese
- Modular, reusable code structure
- Follow JavaScript best practices

請使用繁體中文為所有使用者介面文字、註釋和文檔。
```

### 步驟 3：評估生成的程式碼

當 AI 生成程式碼後，使用以下檢查清單評估：

#### 功能完整性檢查
- [ ] 所有需求功能都已實現
- [ ] 使用者介面直觀易用
- [ ] 資料持久化正常運作
- [ ] 錯誤處理機制完善

#### 程式碼品質評估
- [ ] 程式碼結構清晰
- [ ] 命名規範一致
- [ ] 註釋充分且有意義
- [ ] 無明顯的效能問題

#### 可維護性考量
- [ ] 模組化設計
- [ ] 易於擴展新功能
- [ ] 程式碼可讀性高
- [ ] 遵循最佳實踐

### 步驟 4：迭代優化技巧

如果初次生成的結果不理想，使用以下策略優化：

#### 1. 具體化改進請求
```
The current implementation lacks proper error handling. 
Please add:
1. Try-catch blocks for localStorage operations
2. User-friendly error messages in Traditional Chinese
3. Fallback behavior when storage is full
4. Input validation with clear feedback
```

#### 2. 分步驟重構
```
Let's refactor the code step by step:
Step 1: Extract the data layer into a separate module
Step 2: Implement a proper event system
Step 3: Add unit tests for core functions
Step 4: Optimize for performance
```

#### 3. 提供範例參考
```
Please refactor the TODO item component to follow this pattern:

class TodoItem {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    // ... other properties
  }
  
  render() {
    // Return HTML string or DOM element
  }
  
  update(newData) {
    // Update internal state and re-render
  }
}
```

## 進階技巧

### 1. 架構模式指導

教導 AI 使用特定的架構模式：

```
Please implement the TODO app using the MVC pattern:
- Model: Handle data and business logic
- View: Manage UI rendering and updates
- Controller: Coordinate between Model and View

Ensure clear separation of concerns and use event-driven communication.
```

### 2. 效能優化指引

```
Optimize the application for performance:
1. Implement virtual scrolling for large lists
2. Use debouncing for search input
3. Lazy load non-critical features
4. Minimize DOM manipulations
```

### 3. 測試導向開發

```
Before implementing features, write test cases:
1. Define expected behavior
2. Create test scenarios
3. Implement code to pass tests
4. Refactor for quality
```

## 實戰演練：擴展功能

### 練習 1：添加優先級功能

擴展 TODO 應用，加入優先級管理：

```
Extend the TODO app with priority levels:
- High, Medium, Low priority options
- Color coding for visual distinction
- Sort by priority
- Priority-based notifications

保持所有使用者介面文字使用繁體中文。
```

### 練習 2：協作功能

加入簡單的協作特性：

```
Add collaboration features:
- Export/Import TODO lists as JSON
- Share lists via URL
- Basic conflict resolution
- Activity history log

確保匯出的資料格式清晰且易於理解。
```

### 練習 3：智慧建議

整合 AI 輔助功能：

```
Implement smart suggestions:
- Auto-categorize TODOs
- Suggest due dates based on patterns
- Provide completion time estimates
- Generate task breakdowns for complex items

使用繁體中文顯示所有建議內容。
```

## 常見問題與解決方案

### Q1: AI 生成的程式碼結構混亂怎麼辦？

**解決方案**：
1. 在提示詞中明確指定檔案結構
2. 要求使用特定的設計模式
3. 提供程式碼組織範例
4. 分步驟請求重構

範例：
```
Please organize the code into the following structure:
/src
  /models     - Data models and business logic
  /views      - UI components and templates
  /controllers - Application logic and event handlers
  /utils      - Helper functions and utilities
  /styles     - CSS files
index.html    - Main HTML file
app.js        - Application entry point
```

### Q2: 如何確保生成的程式碼安全？

**解決方案**：
1. 明確要求安全措施
2. 指定輸入驗證規則
3. 要求處理邊界情況
4. 請求安全性檢查

範例：
```
Ensure the application is secure:
1. Sanitize all user inputs
2. Validate data before saving
3. Implement XSS protection
4. Add CSRF token for forms
5. Use Content Security Policy
```

### Q3: AI 不理解複雜的業務邏輯怎麼辦？

**解決方案**：
1. 將複雜邏輯分解為小步驟
2. 提供具體的業務規則範例
3. 使用流程圖或偽代碼說明
4. 逐步驗證理解

範例：
```
Let me explain the business logic step by step:

1. When user creates a TODO:
   - Check if similar task exists
   - If yes, suggest merging
   - If no, create new with auto-generated ID

2. For recurring tasks:
   - Daily: Create new instance each day at 00:00
   - Weekly: Create on specified weekday
   - Monthly: Create on specified date

3. Completion rules:
   - Single task: Mark as done
   - Recurring: Complete current instance only
   - Project: Update parent progress
```

## 最佳實踐總結

### 1. 提示詞編寫原則

- **具體明確**：避免模糊的描述
- **結構化**：使用清晰的章節和編號
- **漸進式**：從簡單到複雜逐步構建
- **包含範例**：提供期望輸出的範例

### 2. 程式碼評估標準

- **功能性**：是否滿足所有需求
- **可讀性**：程式碼是否易於理解
- **可維護性**：是否易於修改和擴展
- **效能**：是否有明顯的效能問題
- **安全性**：是否有安全漏洞

### 3. 迭代優化流程

1. **初次生成**：獲得基本實現
2. **功能驗證**：確認核心功能運作
3. **品質提升**：改進程式碼結構
4. **效能優化**：處理效能瓶頸
5. **安全加固**：修復安全問題

## 思考與挑戰

### 深度思考題

1. **架構選擇**：為什麼某些架構模式更適合 AI 生成？
2. **提示詞優化**：如何量化提示詞的效果？
3. **品質保證**：如何建立 AI 生成程式碼的品質標準？
4. **團隊協作**：如何在團隊中推廣 AI 指揮家方法？

### 進階挑戰

1. **多語言支援**：擴展應用支援英文、簡體中文介面
2. **離線功能**：實現完整的離線工作能力
3. **資料同步**：加入雲端同步功能
4. **AI 整合**：整合 AI API 提供智慧功能

## 下一步

恭喜你完成了第一樂章！你已經學會了如何指揮 AI 生成應用程式。在下一章「第二樂章：AI 擔任測試策略師」中，我們將學習如何讓 AI 為生成的程式碼制定全面的測試策略。

記住，成為優秀的 AI 指揮家需要不斷練習。多嘗試不同類型的應用，探索各種提示詞技巧，逐步建立自己的「黃金提示詞」庫。

## 資源連結

- [Playwright 官方文檔](https://playwright.dev)
- [JavaScript MDN 文檔](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript)
- [Web Storage API](https://developer.mozilla.org/zh-TW/docs/Web/API/Web_Storage_API)
- [前端最佳實踐](https://github.com/bendc/frontend-guidelines)

## 本章作業

1. **基礎任務**：使用本章學到的技巧，生成一個完整的 TODO 應用
2. **進階任務**：加入至少三個額外功能（如標籤、提醒、統計）
3. **挑戰任務**：將應用改造為 Progressive Web App (PWA)

提交作業時，請包含：
- 完整的源代碼
- 使用的提示詞記錄
- 迭代優化的過程說明
- 學習心得分享

---

*「優秀的指揮家不是自己演奏每個樂器，而是引導每個樂器發揮最佳表現。」*