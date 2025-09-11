# Chapter 2: Application Generation Golden Prompt

## Version: 1.0.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT-4, Gemini Pro

---

## Basic TODO Application Prompt

```markdown
You are an experienced full-stack engineer specializing in modern web development. 

## Thinking Process (English)

Let me analyze the requirements step by step:

1. **Architecture Planning**:
   - Use vanilla JavaScript with ES6+ features for clean, modern code
   - Implement MVC pattern for separation of concerns
   - Use event delegation for dynamic element handling
   - Design mobile-first responsive layout

2. **Core Features to Implement**:
   - Add new todo items with validation
   - Mark items as complete/incomplete with visual feedback
   - Delete items with confirmation
   - Persist data using localStorage with error handling
   - Display item count and completion status

3. **Technical Approach**:
   - HTML5 semantic elements for accessibility
   - CSS Grid and Flexbox for responsive layout
   - JavaScript modules for code organization
   - LocalStorage with JSON serialization
   - Defensive programming with try-catch blocks

4. **Performance Considerations**:
   - Minimize DOM manipulation
   - Use DocumentFragment for batch updates
   - Debounce storage operations
   - Lazy loading for large lists

## 輸出要求 (繁體中文)

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

## Systematic Analysis (English)

1. **Advanced Architecture**:
   - Component-based architecture without frameworks
   - State management pattern
   - Observer pattern for UI updates
   - Factory pattern for todo items

2. **Enhanced Features**:
   - Priority levels (urgent, high, normal, low)
   - Categories and tags
   - Due dates with reminders
   - Search and filter capabilities
   - Bulk operations (select all, bulk delete)
   - Drag-and-drop reordering

3. **Production Considerations**:
   - XSS prevention through input sanitization
   - CSRF token simulation
   - Rate limiting for operations
   - Graceful degradation
   - Progressive enhancement

4. **Performance Optimizations**:
   - Virtual scrolling for large lists
   - Indexed storage for fast retrieval
   - Web Workers for heavy operations
   - RequestAnimationFrame for smooth animations

5. **UX Enhancements**:
   - Keyboard shortcuts
   - Undo/Redo functionality
   - Auto-save with conflict resolution
   - Export/Import functionality
   - Statistics dashboard

## 專業輸出規範 (繁體中文)

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

## Model-Specific Adjustments

### Claude 3.5 Sonnet
- Works best with the prompts as-is
- Excellent at bilingual output
- Strong at maintaining consistency

### GPT-4
- May need explicit reminder about Chinese output
- Add: "記得用繁體中文輸出所有說明和註解"
- Benefits from more structured output requirements

### Gemini Pro
- Requires more explicit structure
- Add section headers in the prompt
- May need follow-up for complete implementation

---

## Prompt Usage Guidelines

1. **Basic Version**: Use for learners in early chapters
2. **Enhanced Version**: Use for advanced learners or Chapter 7
3. **Always Test**: Run each prompt 3+ times to verify consistency
4. **Document Issues**: Log any model-specific quirks
5. **Iterate**: Refine based on learner feedback

---

## Version History

- **1.0.0** (2025-09-11): Initial golden prompts with bilingual strategy
- Future: Add more variations based on workshop feedback