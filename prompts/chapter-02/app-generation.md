# Chapter 2: Application Generation Golden Prompt

## Version: 1.1.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT-4, Gemini Pro

---

## Basic TODO Application Prompt

```markdown
You are an experienced full-stack engineer specializing in modern web development.

## Technical Specification (Think in English)

Analyze and implement a TODO application with the following technical requirements:

### Architecture Requirements
- **Design Pattern**: Model-View-Controller (MVC) for separation of concerns
- **Language**: Vanilla JavaScript ES6+ (no frameworks)
- **Storage**: Browser localStorage with JSON serialization
- **Performance**: Optimize for minimal DOM manipulation

### Core Functionality
1. **Data Model**:
   - Todo item structure: { id, text, completed, createdAt, updatedAt }
   - CRUD operations: Create, Read, Update, Delete
   - Data validation and sanitization
   - LocalStorage persistence with error handling

2. **View Layer**:
   - Semantic HTML5 elements
   - Responsive CSS Grid/Flexbox layout
   - Mobile-first design approach
   - Accessibility features (ARIA labels, keyboard navigation)

3. **Controller Logic**:
   - Event delegation for dynamic elements
   - Input validation before processing
   - State management and synchronization
   - Error handling with user feedback

4. **Technical Implementation**:
   - Use DocumentFragment for batch DOM updates
   - Implement debouncing for storage operations
   - Add try-catch blocks for defensive programming
   - Use requestAnimationFrame for smooth animations

### Non-Functional Requirements
- **Performance**: Page load < 1 second, smooth 60fps interactions
- **Compatibility**: Support modern browsers (Chrome, Firefox, Safari, Edge)
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Security**: XSS prevention through input sanitization

## 輸出要求 (Output in Chinese)

請使用繁體中文提供一個完整的待辦事項網頁應用程式，包含以下內容：

### 1. HTML 結構
- 完整的 HTML5 文檔結構
- 語義化標籤使用
- 無障礙設計考量 (ARIA labels)
- Meta 標籤優化

### 2. CSS 樣式
- 現代化視覺設計
- 響應式佈局 (手機優先)
- 動畫過渡效果
- 深色模式支援（可選）

### 3. JavaScript 功能
- 新增待辦事項（含輸入驗證）
- 標記完成狀態（視覺回饋）
- 刪除功能（確認提示）
- 本地儲存（localStorage）
- 錯誤處理機制

### 4. 程式碼要求
- 詳細的中文註解
- 清晰的函數命名
- 模組化程式結構
- 錯誤處理完善

請提供可直接執行的完整程式碼，將 HTML、CSS、JavaScript 整合在單一 HTML 檔案中。
```

---

## Enhanced TODO Application Prompt

```markdown
As a senior full-stack developer with expertise in production-ready applications, create an advanced TODO application.

## Technical Specification (Think in English)

### System Architecture
1. **Design Patterns**:
   - Component-based architecture (without frameworks)
   - Observer pattern for reactive UI updates
   - Factory pattern for todo item creation
   - Strategy pattern for different storage backends
   - Command pattern for undo/redo functionality

2. **Data Architecture**:
   ```javascript
   // Todo item schema
   {
     id: string (UUID),
     text: string,
     priority: enum ['urgent', 'high', 'normal', 'low'],
     category: string,
     tags: string[],
     dueDate: ISO8601 timestamp,
     completed: boolean,
     createdAt: timestamp,
     updatedAt: timestamp,
     attachments: array,
     subtasks: array
   }
   ```

3. **Advanced Features Implementation**:
   - **Search Algorithm**: Fuzzy search with ranking
   - **Filter System**: Multi-criteria filtering with AND/OR logic
   - **Drag-Drop**: HTML5 Drag and Drop API with touch support
   - **Virtual Scrolling**: Render only visible items for performance
   - **Bulk Operations**: Batch processing with progress indication

4. **Performance Strategy**:
   - Use IndexedDB for large datasets (> 1000 items)
   - Implement Web Workers for search/filter operations
   - Use requestIdleCallback for non-critical updates
   - Implement lazy loading with Intersection Observer
   - Cache computed values with memoization

5. **Security Measures**:
   - Content Security Policy (CSP) headers
   - Input sanitization with DOMPurify principles
   - Rate limiting with token bucket algorithm
   - Secure random ID generation
   - Protection against prototype pollution

6. **State Management**:
   ```javascript
   // State structure
   state = {
     todos: Map<id, TodoItem>,
     filters: { category, priority, status, dateRange },
     sortOrder: { field, direction },
     view: { mode, itemsPerPage, currentPage },
     history: { past: [], future: [] }
   }
   ```

## 輸出要求 (Output in Chinese)

請建立一個生產級別的進階待辦事項應用程式：

### 核心功能需求

1. **任務管理**
   - 新增、編輯、刪除任務
   - 優先級設定（緊急/高/中/低）
   - 分類標籤系統
   - 到期日與提醒功能
   - 任務狀態追蹤

2. **進階功能**
   - 搜尋與篩選（按狀態、優先級、標籤）
   - 批量操作功能
   - 拖放排序
   - 鍵盤快捷鍵
   - 撤銷/重做功能

3. **資料管理**
   - localStorage 與 IndexedDB 雙重儲存
   - 資料匯出/匯入 (JSON/CSV)
   - 自動儲存與衝突處理
   - 資料備份機制

4. **使用者體驗**
   - 深色/淺色主題切換
   - 多語言支援架構
   - 無障礙設計 (WCAG 2.1 AA)
   - 響應式設計（手機、平板、桌面）
   - 載入動畫與狀態提示

5. **效能與安全**
   - 虛擬滾動處理大量資料
   - 防 XSS 攻擊措施
   - 輸入驗證與消毒
   - 錯誤邊界處理
   - 效能監控機制

### 輸出格式
請提供：
1. 完整的單檔 HTML 應用程式
2. 詳細的中文程式碼註解
3. 使用說明文件
4. 測試案例建議

程式碼應該是生產就緒的品質，包含完整的錯誤處理、效能優化和安全措施。
```

---

## Example / 範例

### English Thinking Process:
```
Analyzing requirements:
1. User needs a TODO app
2. Must handle CRUD operations
3. Requires persistent storage
4. Needs responsive design

Technical decisions:
- Use MVC pattern for clean architecture
- LocalStorage for persistence
- Event delegation for performance
- CSS Grid for layout
```

### Chinese Output Result:
```html
<!-- 完整的待辦事項應用程式 -->
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>待辦事項管理系統</title>
    <!-- CSS 樣式定義 -->
</head>
<body>
    <!-- 應用程式介面 -->
    <script>
        // 待辦事項控制器
        class TodoController {
            constructor() {
                // 初始化應用程式
            }
        }
    </script>
</body>
</html>
```

---

## Model-Specific Adjustments

### Claude 3.5 Sonnet
- Naturally handles bilingual structure
- Strong technical analysis in English
- Excellent Chinese output quality

### GPT-4
- Add explicit instruction: "Think through the solution in English, then provide output in Traditional Chinese"
- May need reminder: "所有使用者介面文字、註解、錯誤訊息請使用繁體中文"

### Gemini Pro
- Requires clear section separation
- Benefits from examples
- Add: "First section: English technical analysis. Second section: Chinese implementation."

---

## Prompt Usage Guidelines

1. **Bilingual Principle**: Always maintain English thinking -> Chinese output flow
2. **Basic Version**: For beginners (Chapter 2-3)
3. **Enhanced Version**: For advanced users (Chapter 4+)
4. **Testing Protocol**: Test 5 times across 3 models
5. **Consistency Check**: Verify technical accuracy remains constant

---

## Version History

- **1.1.0** (2025-09-11): Restructured with strict bilingual separation
- **1.0.0** (2025-09-11): Initial golden prompts
- Future: Add domain-specific variations