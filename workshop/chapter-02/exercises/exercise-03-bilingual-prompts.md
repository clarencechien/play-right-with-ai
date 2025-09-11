# 練習 3：雙語提示策略比較

## 目標
深入理解雙語提示策略對 AI 生成程式碼品質的影響，掌握最佳的提示組合方式。

## 預計時間
40-50 分鐘

## 實驗設計

您將使用三種不同的語言策略生成相同的應用程式，並進行系統性比較。

## 測試案例：線上學習平台

創建一個簡單的線上學習平台，包含課程列表、課程詳情、進度追蹤等功能。

### 方法 A：純中文提示（10 分鐘）

```markdown
請創建一個線上學習平台，需要以下功能：

1. 課程管理
   - 顯示課程列表
   - 課程詳細資訊頁面
   - 課程分類（程式設計、設計、商業等）
   - 課程難度等級（初級、中級、高級）

2. 學習進度
   - 追蹤每個課程的完成度
   - 顯示學習時數統計
   - 成就徽章系統

3. 使用者功能
   - 註冊和登入（模擬）
   - 個人資料頁面
   - 學習歷史記錄

4. 介面設計
   - 現代化的視覺設計
   - 響應式布局
   - 深色模式支援

請使用 HTML、CSS 和 JavaScript 實現，資料儲存在 LocalStorage。
```

### 方法 B：純英文提示（10 分鐘）

```markdown
Create an online learning platform with the following features:

1. Course Management
   - Display course catalog
   - Course detail pages
   - Course categories (Programming, Design, Business, etc.)
   - Difficulty levels (Beginner, Intermediate, Advanced)

2. Learning Progress
   - Track completion percentage for each course
   - Display learning hours statistics
   - Achievement badge system

3. User Features
   - Registration and login (simulated)
   - User profile page
   - Learning history

4. UI Design
   - Modern visual design
   - Responsive layout
   - Dark mode support

Implement using HTML, CSS, and JavaScript with LocalStorage for data persistence.
```

### 方法 C：雙語優化策略（10 分鐘）

```markdown
[English Technical Specification]
Create a comprehensive online learning platform with:

Technical Architecture:
- Single Page Application (SPA) pattern
- Component-based structure
- Event-driven architecture
- Observer pattern for state management

Core Features:
1. Course Management System
   - RESTful-like data structure
   - Lazy loading for course content
   - Filtering and sorting algorithms
   - Search with fuzzy matching

2. Progress Tracking Engine
   - Granular progress calculation
   - Time tracking with sessionStorage
   - Achievement system with unlock conditions
   - Data visualization using Canvas API

3. User Management
   - JWT-like token simulation
   - Role-based access (student, instructor)
   - Profile CRUD operations
   - Activity logging

4. Performance Optimizations
   - Virtual scrolling for long lists
   - Image lazy loading
   - CSS animations with GPU acceleration
   - Debounced search input

Data Models:
```javascript
Course: {
  id: UUID,
  title: string,
  description: string,
  category: enum,
  difficulty: enum,
  duration: number,
  modules: Module[],
  thumbnail: string,
  rating: number
}

Progress: {
  userId: string,
  courseId: string,
  completedModules: string[],
  timeSpent: number,
  lastAccessed: Date,
  notes: string[]
}
```

[Chinese Localization Requirements]
平台名稱：「智慧學院」

介面文字：
- 導航選單：「課程總覽」、「我的學習」、「成就」、「個人設定」
- 課程分類：「程式開發」、「設計創意」、「商業管理」、「資料科學」
- 難度等級：「入門」、「進階」、「專家」
- 進度顯示：「已完成 60%」、「預計剩餘 2 小時」
- 成就徽章：「初學者」、「勤奮學習者」、「課程達人」、「知識專家」

操作提示：
- 「歡迎回來！繼續您的學習之旅」
- 「恭喜完成本章節！」
- 「您已連續學習 7 天，保持下去！」
- 「新課程推薦：基於您的興趣」

錯誤訊息：
- 「載入失敗，請重新整理頁面」
- 「請先登入以追蹤進度」
- 「網路連線不穩定」

所有程式碼註解使用繁體中文，詳細說明實作邏輯。
```

## 實作步驟

### 步驟 1：生成三個版本
1. 使用方法 A 生成，保存到 `learning-platform-chinese/`
2. 使用方法 B 生成，保存到 `learning-platform-english/`
3. 使用方法 C 生成，保存到 `learning-platform-bilingual/`

### 步驟 2：功能測試
對每個版本進行相同的測試：
- [ ] 課程列表正確顯示
- [ ] 可以查看課程詳情
- [ ] 進度追蹤功能正常
- [ ] 資料正確保存
- [ ] 響應式設計有效

### 步驟 3：程式碼分析
使用以下標準評估每個版本：

```markdown
# 程式碼品質評估表

## 1. 架構設計（滿分 10）
- 程式碼組織結構：__/3
- 模組化程度：__/3
- 擴展性：__/2
- 可維護性：__/2

## 2. 功能實現（滿分 10）
- 功能完整度：__/3
- 邏輯正確性：__/3
- 錯誤處理：__/2
- 邊界條件：__/2

## 3. 程式碼品質（滿分 10）
- 命名規範：__/2
- 註解質量：__/2
- 程式碼重用：__/3
- 效能考量：__/3

## 4. 使用者體驗（滿分 10）
- 介面美觀：__/3
- 操作流暢：__/3
- 回饋明確：__/2
- 無障礙支援：__/2

總分：__/40
```

## 深入分析任務

### 任務 A：量化比較

創建詳細的比較報告：

| 評估維度 | 純中文 | 純英文 | 雙語策略 |
|---------|--------|--------|----------|
| 程式碼行數 | | | |
| 檔案大小 (KB) | | | |
| 函數數量 | | | |
| 全域變數數 | | | |
| 註解比例 | | | |
| 圈複雜度 | | | |
| 載入時間 (ms) | | | |
| 記憶體使用 (MB) | | | |

### 任務 B：質化分析

針對以下方面撰寫分析：

1. **程式碼風格差異**
   - 命名慣例
   - 程式碼組織
   - 設計模式使用

2. **問題解決方法**
   - 演算法選擇
   - 資料結構
   - 效能優化策略

3. **錯誤處理**
   - 異常捕獲
   - 使用者提示
   - 降級策略

4. **創新性**
   - 獨特功能
   - 創意實現
   - 使用者體驗亮點

### 任務 C：混合策略實驗

嘗試不同的中英文比例：

#### 實驗 1：技術英文 + 業務中文
```markdown
[Technical Specs in English]
Use React-like component pattern
Implement Redux-like state management

[業務需求用中文]
使用者可以收藏喜歡的課程
系統推薦相關課程
學習提醒功能
```

#### 實驗 2：核心英文 + 詳細中文
```markdown
[Core Requirements]
Build an e-learning platform

[詳細規格說明]
平台需要支援影片播放、筆記功能、討論區、作業提交等完整的學習功能...
```

#### 實驗 3：交替使用
```markdown
Create course listing page
課程列表需要顯示縮圖、標題、講師、評分

Implement progress tracking
進度追蹤要精確到每個章節，顯示完成百分比

Add user authentication
使用者認證支援第三方登入（Google、Facebook）
```

## 進階研究

### 研究問題 1：語言對架構的影響
分析不同語言提示對系統架構設計的影響：
- 是否產生不同的設計模式？
- 模組劃分是否有差異？
- 抽象層次是否不同？

### 研究問題 2：最佳混合比例
找出最佳的中英文混合比例：
- 100% 英文技術 + 100% 中文 UI
- 70% 英文 + 30% 中文
- 50% 英文 + 50% 中文
- 30% 英文 + 70% 中文

### 研究問題 3：特定領域優化
測試特定領域的最佳策略：
- 前端開發
- 後端 API
- 資料庫設計
- 演算法實現
- UI/UX 設計

## 實戰應用指南

### 何時使用純中文
✅ 適合場景：
- 快速原型
- 業務邏輯討論
- 需求確認
- 使用者故事

❌ 避免場景：
- 複雜技術實現
- 效能關鍵程式碼
- 系統架構設計

### 何時使用純英文
✅ 適合場景：
- 技術文件
- API 設計
- 開源專案
- 演算法實現

❌ 避免場景：
- 本地化應用
- 中文使用者介面
- 團隊溝通

### 何時使用雙語策略
✅ 適合場景：
- 完整應用開發
- 企業級專案
- 需要本地化的產品
- 團隊協作專案

❌ 避免場景：
- 簡單腳本
- 純技術POC
- 國際化產品

## 最佳實踐總結

### 雙語提示黃金法則

1. **技術規格永遠用英文**
   - 資料結構定義
   - API 介面設計
   - 演算法描述
   - 效能要求

2. **業務邏輯可混合**
   - 核心概念用英文
   - 詳細說明用中文
   - 專有名詞保持一致

3. **UI/UX 永遠用目標語言**
   - 介面文字用中文
   - 錯誤訊息用中文
   - 操作提示用中文

4. **註解遵循團隊規範**
   - 技術註解可用英文
   - 業務註解用中文
   - 保持一致性

## 提交要求

1. 三個版本的完整程式碼
2. 詳細的比較分析報告（1000+ 字）
3. 程式碼品質評估表
4. 效能測試數據
5. 最佳策略建議書（500 字）
6. 學習心得與反思（300 字）

## 參考資源

- [Multilingual Prompting Research](https://arxiv.org/)
- [Code Generation Benchmarks](https://github.com/features/copilot)
- [Cross-lingual Transfer Learning](https://huggingface.co/blog)

---
*重要發現：雙語策略不是簡單的翻譯，而是利用不同語言的優勢來獲得最佳結果。掌握這項技能將大幅提升您作為 AI 指揮家的能力。*