# Chapter 2: TODO App Generation - Bilingual Prompt

## 🎯 學習目標
展示如何使用「英文思考，中文輸出」策略生成高品質的應用程式碼。

## 📝 基礎版本 vs 進階版本對比

### Version 1: 純中文提示（基礎）
```
請幫我創建一個待辦事項應用程式，要有以下功能：
- 新增待辦事項
- 刪除待辦事項  
- 標記完成
- 使用 localStorage 儲存
- 介面要美觀
```

### Version 2: 雙語提示（進階）
```
You are an experienced full-stack developer. Let's build a production-ready TODO application.

Technical Requirements Analysis:
1. Frontend Architecture
   - Use MVC or similar pattern for separation of concerns
   - Implement event delegation for dynamic elements
   - Ensure responsive design using CSS Grid/Flexbox
   
2. Core Functionality
   - CRUD operations (Create, Read, Update, Delete)
   - State management without frameworks
   - Data persistence using localStorage with fallback

3. User Experience
   - Smooth animations and transitions
   - Intuitive keyboard shortcuts (Enter to add, Escape to cancel)
   - Visual feedback for all actions
   - Empty state handling

4. Code Quality
   - ES6+ syntax (const/let, arrow functions, template literals)
   - Proper error handling and input validation
   - XSS prevention through proper escaping
   - Performance optimization (debouncing, minimal reflows)

5. Accessibility
   - Semantic HTML5 elements
   - ARIA labels where needed
   - Keyboard navigation support
   - Screen reader friendly

請用繁體中文提供：

1. **完整的 HTML 結構**
   - 語意化標籤
   - 資料屬性用於 JavaScript 選擇器
   - 無障礙設計考量

2. **現代化 CSS 樣式**
   - 使用 CSS 變數管理主題
   - 響應式設計（手機優先）
   - 動畫效果提升體驗

3. **模組化 JavaScript 程式碼**
   - 清晰的函數命名
   - 詳細的中文註解
   - 錯誤處理機制

4. **使用說明文件**
   - 功能介紹
   - 快捷鍵說明
   - 瀏覽器相容性
```

## 🚀 執行範例

### 使用 Claude CLI
```bash
claude < todo-app-bilingual.md > output/todo-app.html
```

### 使用 API
```javascript
const prompt = `
You are an experienced full-stack developer...
[完整提示詞內容]
`;

const response = await claude.complete({
  prompt: prompt,
  max_tokens: 4000
});
```

## 📊 預期效果對比

| 評估項目 | 純中文版 | 雙語版 | 說明 |
|---------|---------|--------|------|
| 程式碼結構 | 基本 | 模組化 | 雙語版產生更好的架構設計 |
| 錯誤處理 | 缺少 | 完整 | 英文思考包含更多邊界情況 |
| 效能優化 | 無 | 有 | 包含防抖、虛擬滾動等優化 |
| 可維護性 | 一般 | 優秀 | 更清晰的函數分割和命名 |
| 註解品質 | 簡單 | 詳細 | 結合技術解釋和中文說明 |

## 💡 優化建議

### 1. 根據需求調整英文思考深度
- 簡單需求：20% 英文思考
- 中等複雜：50% 英文思考
- 高度複雜：80% 英文思考

### 2. 保持輸出語言一致性
- 程式碼註解：繁體中文
- 變數命名：英文（遵循慣例）
- 文件說明：繁體中文
- 錯誤訊息：繁體中文（使用者友善）

### 3. 迭代優化流程
```
初始提示 → 測試輸出 → 調整思考部分 → 重新生成 → 比較改進
```

## 🔍 常見問題

### Q: 為什麼不全部用英文？
A: 保持中文輸出確保本地開發者的理解度，特別是非技術背景的團隊成員。

### Q: 哪些部分最適合用英文思考？
A: 
- 架構設計
- 演算法邏輯
- 效能優化
- 安全考量

### Q: 如何判斷雙語比例？
A: 根據任務複雜度和技術深度調整，越技術性的內容越適合英文思考。

## 📚 延伸學習

1. 嘗試不同的英文思考框架
   - Step-by-step reasoning
   - Pros and cons analysis
   - Architecture decision records

2. 比較不同 AI 模型的反應
   - Claude vs GPT vs Gemini
   - 記錄各模型的優勢領域

3. 建立個人提示詞庫
   - 收集有效的模式
   - 分類整理
   - 持續優化

## ✅ 自我檢測

完成本章練習後，你應該能夠：
- [ ] 理解雙語提示的優勢
- [ ] 編寫結構化的英文思考部分
- [ ] 產生高品質的中文輸出
- [ ] 根據需求調整雙語比例
- [ ] 評估和優化提示詞效果

---

💡 **關鍵要點：英文建立邏輯框架，中文確保溝通順暢！**