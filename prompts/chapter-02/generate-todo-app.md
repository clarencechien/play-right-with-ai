# Golden Prompt: Generate TODO Application

## 黃金提示詞：生成 TODO 應用程式

這是經過優化和測試的提示詞，能夠生成高品質的 TODO 應用程式。

## Version 1: Basic TODO App

### Technical Specification (Think in English)

```markdown
Create a modern TODO application with the following requirements:

Technical Stack:
- Pure HTML5, CSS3, and JavaScript (ES6+)
- No external dependencies or frameworks
- Mobile-first responsive design
- LocalStorage for data persistence

Core Features:
1. Task Management
   - Add new tasks with title (required, max 100 chars)
   - Add optional description (max 500 chars)
   - Edit existing tasks inline
   - Delete tasks with confirmation
   - Mark tasks as complete/incomplete

2. Data Structure:
   ```javascript
   {
     id: string (UUID),
     title: string,
     description: string,
     priority: 'high' | 'medium' | 'low',
     status: 'pending' | 'completed',
     createdAt: ISO 8601,
     updatedAt: ISO 8601,
     dueDate: ISO 8601 (optional)
   }
   ```

3. UI Requirements:
   - Clean, modern interface with card-based design
   - Color coding for priority levels
   - Smooth animations for all interactions
   - Visual feedback for user actions
   - Empty state when no tasks

4. Code Organization:
   - Separate concerns (UI, logic, storage)
   - Use ES6 modules pattern
   - Implement event delegation
   - Add comprehensive error handling
```

### 輸出要求 (Output in Chinese)

```markdown
所有使用者介面文字使用繁體中文：

介面文字：
- 應用標題：「我的待辦事項」
- 輸入提示：「請輸入任務名稱...」
- 優先級：高優先、中優先、低優先
- 按鈕：新增任務、編輯、刪除、完成、取消
- 狀態：待處理、已完成
- 空白狀態：「目前沒有任務，點擊上方新增您的第一個任務！」

訊息提示：
- 成功：「任務已成功新增」、「任務已更新」、「任務已刪除」
- 錯誤：「請輸入任務名稱」、「儲存失敗，請重試」
- 確認：「確定要刪除此任務嗎？此操作無法復原。」

程式碼註解全部使用繁體中文，詳細說明每個函數的用途和參數。
```

### Example / 範例

```javascript
// 範例輸出結構
// TODO 應用程式主要功能
class TodoApp {
  constructor() {
    // 初始化應用程式
    this.todos = this.loadFromStorage();
    this.init();
  }
  
  // 新增任務
  addTodo(title, description) {
    // 實作細節...
  }
}
```

## Version 2: Enhanced TODO App with Filtering

### Technical Specification (Think in English)

```markdown
Based on the previous TODO app, add these advanced features:

Filtering & Sorting:
1. Filter by status (all, active, completed)
2. Filter by priority (all, high, medium, low)
3. Sort by: creation date, due date, priority, alphabetical
4. Search functionality with real-time filtering

Statistics Dashboard:
- Total tasks count
- Completed percentage
- Tasks by priority breakdown
- Overdue tasks alert

Batch Operations:
- Select multiple tasks
- Batch delete with confirmation
- Batch mark as complete/incomplete
- Clear all completed tasks

Performance Optimizations:
- Implement virtual DOM diffing concept
- Debounce search input (300ms)
- Lazy load task descriptions
- Use requestAnimationFrame for animations
```

### 輸出要求 (Output in Chinese)

```markdown
新增介面元素的中文文字：
- 篩選器：「全部」、「進行中」、「已完成」
- 排序：「建立時間」、「到期日」、「優先級」、「字母順序」
- 統計：「總任務數」、「完成率」、「逾期任務」
- 批次操作：「全選」、「刪除選中」、「標記完成」、「清除已完成」
```

### Example / 範例

```javascript
// 篩選功能實作範例
filterTasks(filterType) {
  switch(filterType) {
    case 'active':  // 進行中
      return this.todos.filter(t => t.status === 'pending');
    case 'completed':  // 已完成
      return this.todos.filter(t => t.status === 'completed');
    default:  // 全部
      return this.todos;
  }
}
```

## Version 3: Full-Featured TODO App

### Technical Specification (Think in English)

```markdown
Create a production-ready TODO application with enterprise features:

Architecture:
- MVC pattern implementation
- Observer pattern for state management
- Factory pattern for task creation
- Singleton for storage management

Advanced Features:
1. Task Management
   - Subtasks support (nested todos)
   - Task dependencies
   - Recurring tasks
   - Task templates
   - Tags and categories

2. Data Management
   - Import/Export (JSON, CSV)
   - Data backup/restore
   - Sync indication
   - Conflict resolution
   - Undo/Redo functionality

3. User Experience
   - Keyboard shortcuts (with help modal)
   - Drag-and-drop reordering
   - Dark/Light theme toggle
   - Customizable color schemes
   - Sound effects (optional)
   - Desktop notifications

4. Accessibility
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support
   - High contrast mode
   - Focus management

5. Performance
   - Service Worker for offline support
   - IndexedDB for large datasets
   - Lazy loading strategies
   - Code splitting
   - Bundle optimization
```

### 輸出要求 (Output in Chinese)

```markdown
完整的中文化介面需求：

導航與選單：
- 「檔案」：新增、匯入、匯出、備份、還原
- 「編輯」：復原、重做、剪下、複製、貼上
- 「檢視」：主題、篩選器、排序、統計
- 「工具」：設定、快捷鍵、關於

進階功能文字：
- 「子任務」、「相依任務」、「重複任務」
- 「標籤管理」、「分類設定」、「模板庫」
- 「離線模式」、「同步中」、「最後同步時間」

設定選項：
- 「深色主題」、「淺色主題」、「自動切換」
- 「音效開關」、「桌面通知」、「自動儲存」
- 「顯示完成任務」、「顯示刪除確認」

快捷鍵說明：
- 「Ctrl+N：新增任務」
- 「Ctrl+S：儲存變更」
- 「Ctrl+F：搜尋任務」
- 「Delete：刪除選中」
- 「Space：標記完成」

所有程式碼必須包含詳細的中文註解，解釋架構決策和實作細節。
```

### Example / 範例

```javascript
// MVC 架構範例
class TodoModel {
  // 資料模型層
  constructor() {
    this.todos = [];
    this.observers = [];
  }
  
  // 通知觀察者
  notify() {
    this.observers.forEach(observer => observer.update());
  }
}

class TodoView {
  // 視圖層
  render(todos) {
    // 渲染 UI
  }
}

class TodoController {
  // 控制器層
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }
}
```

## 使用指南

### 選擇合適的版本

1. **Version 1**: 適合初學者，專注於核心功能
2. **Version 2**: 適合進階學習，加入篩選和批次操作
3. **Version 3**: 適合專業開發，包含企業級功能

### 提示詞使用技巧

1. **分段提交**：將長提示詞分成多個部分
2. **迭代改進**：先生成基礎版本，再逐步增強
3. **具體反饋**：明確指出需要改進的地方

### 常見調整

如果生成的程式碼不符預期，可以追加以下提示：

```markdown
[Adjustment Request]
The generated code is good, but please:
1. Simplify the CSS using CSS variables
2. Add more detailed error messages in Chinese
3. Improve mobile touch interactions
4. Add loading states for async operations
```

## 測試要點

生成程式碼後，請確認以下功能：

- [ ] 基本 CRUD 操作正常
- [ ] 資料持久化有效
- [ ] 響應式設計適配各種螢幕
- [ ] 中文顯示正確無亂碼
- [ ] 錯誤處理完善
- [ ] 使用者體驗流暢

## 優化建議

### 程式碼品質
- 使用 ESLint 檢查程式碼規範
- 使用 Prettier 格式化程式碼
- 加入 JSDoc 註解

### 效能優化
- 使用 Chrome DevTools 分析效能
- 優化關鍵渲染路徑
- 減少重排和重繪

### 使用者體驗
- 加入載入動畫
- 提供操作反饋
- 優化互動響應時間

---
*這些提示詞經過多次測試和優化，能夠在 Claude、GPT 和 Gemini 上產生高品質的結果。*