# 第二章：第一樂章 - AI 生成應用程式

## 學習目標

完成本章後，您將能夠：
- ✅ 使用自然語言精確描述應用程式需求
- ✅ 掌握有效的提示詞工程技巧
- ✅ 理解雙語提示策略對程式碼品質的影響
- ✅ 評估和優化 AI 生成的程式碼
- ✅ 運用迭代式改進流程達到理想結果

## 前置需求

- 完成第一章的環境設置
- 至少一個可用的 AI 服務（Claude、Gemini 或 GPT）
- 基本的 HTML、CSS、JavaScript 知識
- 理解雙語提示策略的概念

## 本章概述

在傳統開發中，我們從空白檔案開始，一行一行編寫程式碼。作為 AI 指揮家，我們的工作是清晰地表達「想要什麼」，讓 AI 處理「如何實現」。本章將透過創建一個 TODO 應用程式，學習如何有效地指揮 AI 生成高品質的應用程式碼。

## 自然語言需求規範

### 需求描述的層次結構

優秀的需求描述應該包含多個層次的資訊：

```
1. 高層次目標（What）
   └── 2. 功能需求（Features）
       └── 3. 技術規格（How）
           └── 4. 品質要求（Quality）
               └── 5. 本地化需求（Localization）
```

### 範例：TODO 應用程式需求

#### 不良示範（過於簡略）
```
做一個待辦事項應用程式
```

#### 良好示範（結構化描述）
```markdown
# TODO 應用程式需求規範

## 應用程式目標
創建一個幫助使用者管理日常任務的網頁應用程式

## 核心功能
1. 任務管理
   - 新增任務（標題 + 選填描述）
   - 刪除任務（需確認）
   - 編輯任務內容
   - 標記完成/未完成

2. 任務組織
   - 依優先級分類（高/中/低）
   - 設定截止日期
   - 任務分類標籤

3. 資料持久化
   - 使用 LocalStorage 保存資料
   - 自動儲存變更
   - 匯出/匯入功能

## 使用者體驗要求
- 響應式設計（手機優先）
- 深色/淺色主題切換
- 動畫過渡效果
- 鍵盤快捷鍵支援
```

## 提示詞工程

### 核心原則

1. **具體性 (Specificity)**
   - ❌ "make it look good"
   - ✅ "use a modern card-based design with subtle shadows and 8px border radius"

2. **完整性 (Completeness)**
   - ❌ "add a delete button"
   - ✅ "add a delete button with confirmation dialog to prevent accidental deletion"

3. **一致性 (Consistency)**
   - 使用統一的術語和命名規範
   - 保持技術棧的一致性

### 雙語提示策略實戰

#### 策略 A：純中文提示
```markdown
創建一個 TODO 應用程式，包含：
- 新增、刪除、編輯任務
- 標記完成狀態
- 本地儲存
- 美觀的介面設計
```

**預期問題：**
- 技術實現可能不夠精確
- 程式碼結構可能較鬆散
- 可能缺少最佳實踐

#### 策略 B：雙語優化提示
```markdown
[English Technical Specification]
Create a TODO application using:
- HTML5 semantic elements
- CSS Grid and Flexbox for layout
- Vanilla JavaScript ES6+ features
- LocalStorage API for persistence
- Event delegation for performance
- Modular code structure with separation of concerns

Features:
1. Task CRUD operations
   - Create: Add task with title (required) and description (optional)
   - Read: Display tasks in sortable list
   - Update: Inline editing with save/cancel
   - Delete: Soft delete with undo option

2. Task properties:
   - id: UUID v4
   - title: string (max 100 chars)
   - description: string (max 500 chars)
   - priority: enum (high, medium, low)
   - status: enum (pending, completed)
   - createdAt: ISO 8601 timestamp
   - updatedAt: ISO 8601 timestamp
   - dueDate: ISO 8601 date (optional)

3. UI Components:
   - Header with app title and stats
   - Input form with validation
   - Task list with filters
   - Task item with actions
   - Footer with bulk operations

[Chinese UI Requirements]
介面文字全部使用繁體中文：
- 應用程式標題：「我的待辦事項」
- 按鈕文字：新增、編輯、刪除、完成、取消
- 提示訊息範例：
  - 「請輸入任務標題」
  - 「確定要刪除此任務嗎？」
  - 「任務已成功新增」
- 優先級標籤：高優先、中優先、低優先
- 狀態標籤：待處理、已完成

程式碼註解請用繁體中文，解釋每個函數和重要邏輯。
```

## 生成 TODO 應用程式

### 步驟 1：初始生成

使用上述雙語提示，向 AI 請求生成完整的應用程式碼。

### 步驟 2：程式碼組織

將生成的程式碼整理為以下結構：
```
todo-app/
├── index.html       # 主要 HTML 結構
├── styles.css       # 樣式表
├── app.js          # 主要應用邏輯
├── storage.js      # LocalStorage 處理
├── utils.js        # 工具函數
└── README.md       # 應用程式文件
```

### 步驟 3：功能驗證清單

- [ ] 可以新增任務
- [ ] 可以刪除任務
- [ ] 可以編輯任務
- [ ] 可以標記完成
- [ ] 資料持久保存
- [ ] 響應式設計
- [ ] 無障礙支援

## 評估 AI 生成的程式碼

### 程式碼品質檢查清單

#### 1. 結構與組織
- [ ] 程式碼是否模組化？
- [ ] 關注點是否分離？
- [ ] 命名是否一致且有意義？

#### 2. 功能完整性
- [ ] 所有需求功能是否實現？
- [ ] 邊界情況是否處理？
- [ ] 錯誤處理是否完善？

#### 3. 效能考量
- [ ] 是否有不必要的 DOM 操作？
- [ ] 事件監聽器是否正確管理？
- [ ] 資料結構是否高效？

#### 4. 安全性
- [ ] 是否有 XSS 漏洞？
- [ ] 使用者輸入是否驗證？
- [ ] 敏感資料是否保護？

#### 5. 可維護性
- [ ] 程式碼是否易讀？
- [ ] 註解是否充分？
- [ ] 是否遵循最佳實踐？

### 常見問題與解決方案

| 問題 | 解決方案 |
|------|----------|
| 程式碼過於冗長 | 要求重構，使用更簡潔的寫法 |
| 缺少錯誤處理 | 明確要求添加 try-catch 和驗證 |
| UI 不夠美觀 | 提供具體的設計參考或要求 |
| 功能不完整 | 逐項列出缺失功能並要求補充 |
| 效能問題 | 要求優化特定的效能瓶頸 |

## 迭代優化技巧

### 迭代策略

#### 第一次迭代：基礎功能
```markdown
Focus on core CRUD operations with basic UI.
Ensure all functions work correctly before styling.
```

#### 第二次迭代：使用者體驗
```markdown
Enhance UI with:
- Smooth animations (CSS transitions)
- Loading states
- Success/error feedback
- Keyboard navigation
```

#### 第三次迭代：進階功能
```markdown
Add advanced features:
- Drag-and-drop reordering
- Batch operations
- Search and filter
- Data export/import
```

### 優化提示範例

```markdown
[Optimization Request]
The current TODO app works well, but needs improvements:

Performance:
- Implement virtual scrolling for large lists
- Add debouncing for search input
- Use requestAnimationFrame for animations

UX Enhancements:
- Add skeleton loading states
- Implement optimistic UI updates
- Add haptic feedback for mobile
- Include keyboard shortcuts guide

Code Quality:
- Refactor to use Observer pattern
- Add JSDoc comments
- Implement unit tests structure
- Add error boundary

[保持中文介面]
所有新功能的介面文字保持繁體中文
```

## 實作練習

完成以下練習以鞏固所學：

1. **練習 1：需求規範** (`exercises/exercise-01-requirements-spec.md`)
   - 撰寫完整的應用程式需求文件

2. **練習 2：生成應用** (`exercises/exercise-02-generate-app.md`)
   - 使用 AI 生成完整的 TODO 應用

3. **練習 3：雙語比較** (`exercises/exercise-03-bilingual-prompts.md`)
   - 比較不同提示策略的效果

4. **練習 4：迭代優化** (`exercises/exercise-04-iterative-refinement.md`)
   - 透過多輪迭代改進應用程式

## 範例輸出

查看 `example-output/` 目錄中的範例：
- `generated-app-v1/` - 初始版本
- `generated-app-final/` - 優化後的最終版本

## 思考與挑戰

### 核心思考題

1. **需求表達的藝術**
   - 如何在詳細和靈活之間找到平衡？
   - 什麼樣的需求描述最能激發 AI 的創造力？

2. **程式碼品質標準**
   - AI 生成的程式碼達到了什麼水準？
   - 與資深開發者手寫的程式碼相比如何？

3. **迭代的價值**
   - 需要多少輪迭代才能達到生產級品質？
   - 每次迭代應該關注什麼？

### 進階挑戰

1. **複雜應用生成**
   - 嘗試生成包含後端 API 的全棧應用
   - 加入使用者認證和資料同步

2. **框架遷移**
   - 將 Vanilla JS 版本遷移到 React
   - 比較不同框架版本的優劣

3. **效能優化**
   - 使用 Lighthouse 進行效能評估
   - 達到 90+ 的效能分數

## 常見問題

### Q1: AI 生成的程式碼可以直接用於生產環境嗎？
**A:** 需要經過完整的測試和審查。AI 生成的程式碼是很好的起點，但仍需要人工驗證和優化。

### Q2: 如何處理 AI 生成的程式碼中的 bug？
**A:** 可以直接描述 bug 現象，讓 AI 分析並修復，或者自己修復後讓 AI 學習改進模式。

### Q3: 不同 AI 服務生成的程式碼品質差異大嗎？
**A:** 確實存在差異。建議嘗試多個服務，選擇最適合您需求的。

### Q4: 雙語提示真的有必要嗎？
**A:** 根據實踐經驗，雙語提示確實能提升程式碼品質，特別是在複雜的技術需求上。

## 本章總結

透過本章學習，您已經掌握了：
- 📝 如何撰寫清晰的需求規範
- 🎯 有效的提示詞工程技巧
- 🔄 雙語提示策略的實際應用
- 📊 評估 AI 生成程式碼的方法
- 🔧 迭代優化的最佳實踐

## 下一步

準備好進入[第三章：第二樂章 - AI 擔任測試策略師](../chapter-03/README.md)了嗎？

在下一章，我們將學習如何讓 AI 設計完整的測試策略，確保應用程式的品質和穩定性。

---
*記住：優秀的 AI 指揮家知道如何清晰表達需求，並透過迭代引導 AI 產出高品質的程式碼。*