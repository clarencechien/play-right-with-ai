# 練習 2：使用 AI 生成應用程式

## 目標
實踐使用 AI 工具生成完整的應用程式，掌握有效的提示技巧和迭代改進流程。

## 預計時間
45-60 分鐘

## 任務：生成個人財務追蹤應用

您將使用 AI 生成一個個人財務追蹤應用程式，包含收入、支出記錄和視覺化圖表。

### 階段 1：初始生成（15 分鐘）

#### 基礎提示詞
```markdown
[English Specification]
Create a personal finance tracker web application with:
- Income and expense tracking
- Category management
- Monthly budget setting
- Basic charts and reports
- Data persistence using LocalStorage

[Chinese UI]
請使用繁體中文作為介面語言，應用程式名稱為「個人財務管家」
```

#### 執行步驟
1. 將提示詞提交給您選擇的 AI（Claude、GPT-4 或 Gemini）
2. 保存生成的程式碼到 `finance-tracker-v1/` 資料夾
3. 在瀏覽器中測試基本功能
4. 記錄問題和不足之處

### 階段 2：功能增強（20 分鐘）

#### 增強提示詞
```markdown
[Enhancement Request]
Based on the previous finance tracker, please add:

1. Advanced Features:
   - Multiple account support (cash, bank, credit card)
   - Recurring transactions
   - Bill reminders
   - Export to CSV/PDF
   - Data backup and restore

2. Visualization:
   - Pie chart for expense categories
   - Line chart for balance trend
   - Bar chart for monthly comparison
   - Budget vs actual gauge

3. Smart Features:
   - Expense predictions
   - Saving suggestions
   - Spending alerts
   - Category auto-detection

[Chinese Enhancements]
新功能的中文介面：
- 帳戶類型：現金、銀行、信用卡
- 重複交易：每日、每週、每月、每年
- 帳單提醒：「即將到期」、「已逾期」
- 智慧建議：「本月支出偏高」、「建議增加儲蓄」
```

#### 執行步驟
1. 使用增強提示詞改進應用
2. 保存到 `finance-tracker-v2/` 資料夾
3. 比較 v1 和 v2 的差異
4. 測試新功能的完整性

### 階段 3：UI/UX 優化（15 分鐘）

#### UI 優化提示詞
```markdown
[UI/UX Refinement]
Improve the finance tracker's user interface:

1. Modern Design:
   - Material Design 3 principles
   - Smooth animations and transitions
   - Professional color scheme
   - Mobile-first responsive design

2. User Experience:
   - Quick add transaction button
   - Swipe gestures for mobile
   - Keyboard shortcuts
   - Undo/redo functionality
   - Onboarding tutorial

3. Dashboard Improvements:
   - At-a-glance summary cards
   - Recent transactions list
   - Quick stats widgets
   - Customizable layout

[視覺優化中文元素]
- 使用台灣慣用的貨幣格式：NT$ 1,234
- 日期顯示：2024年3月15日
- 友善的空狀態提示
- 成就系統：「連續記帳7天！」
```

#### 執行步驟
1. 應用 UI/UX 改進
2. 保存最終版本到 `finance-tracker-final/`
3. 進行完整的使用者測試

## 實作檢查清單

### 功能完整性
- [ ] 可以新增收入和支出
- [ ] 支援多種類別
- [ ] 資料正確保存和載入
- [ ] 圖表正確顯示資料
- [ ] 匯出功能正常運作

### 程式碼品質
- [ ] 程式碼結構清晰
- [ ] 有適當的錯誤處理
- [ ] 包含中文註解
- [ ] 遵循命名規範
- [ ] 無明顯的安全漏洞

### 使用者體驗
- [ ] 介面美觀專業
- [ ] 操作直覺流暢
- [ ] 響應式設計完善
- [ ] 載入速度快速
- [ ] 錯誤提示友善

## 比較分析任務

### 任務 A：版本對比
創建比較表格：

| 評估項目 | V1 版本 | V2 版本 | Final 版本 |
|---------|---------|---------|------------|
| 功能完整度 | | | |
| 程式碼行數 | | | |
| 檔案大小 | | | |
| 載入時間 | | | |
| 使用體驗評分 | | | |

### 任務 B：AI 服務比較
如果可能，使用不同的 AI 服務生成相同應用，比較：
1. 程式碼風格差異
2. 功能實現方式
3. UI 設計風格
4. 效能表現
5. 程式碼可維護性

### 任務 C：提示詞效果分析
測試不同的提示詞策略：

1. **極簡提示**
```
創建一個財務追蹤應用
```

2. **技術導向提示**
```
Create a finance tracker using React, TypeScript, and Tailwind CSS
```

3. **業務導向提示**
```
我需要一個應用來幫助年輕人養成記帳習慣，要有遊戲化元素
```

記錄每種策略的效果。

## 進階挑戰

### 挑戰 1：整合真實 API
修改應用以整合真實的匯率 API：
```markdown
Integrate a real-time currency exchange API:
- Support multiple currencies
- Auto-update exchange rates
- Currency conversion calculator
```

### 挑戰 2：加入 AI 分析
```markdown
Add AI-powered financial insights:
- Spending pattern analysis
- Anomaly detection
- Personalized saving tips
- Budget optimization suggestions
```

### 挑戰 3：多使用者支援
```markdown
Implement multi-user support:
- User authentication (simulated)
- Family budget sharing
- Permission management
- Collaborative planning
```

## 故障排除指南

### 常見問題

**Q1: AI 生成的程式碼無法執行**
- 檢查是否有語法錯誤
- 確認所有檔案都已正確連結
- 查看瀏覽器控制台錯誤訊息

**Q2: 功能不完整**
- 提供更具體的需求描述
- 分階段請求功能實現
- 明確指出缺失的部分

**Q3: UI 不美觀**
- 提供設計參考圖片或網站
- 指定具體的設計系統
- 要求使用現代 CSS 框架

## 學習反思

完成所有階段後，請回答：

1. **提示詞演進**
   - 您的提示詞如何隨著迭代改進？
   - 哪些關鍵詞最有效？

2. **AI 能力邊界**
   - AI 在哪些方面表現優秀？
   - 哪些部分需要人工介入？

3. **效率提升**
   - 相比手動編碼，節省了多少時間？
   - 品質是否達到預期？

4. **最佳實踐**
   - 您發現了哪些有效的提示技巧？
   - 如何確保生成的程式碼品質？

## 提交要求

1. 三個版本的完整程式碼
2. 版本比較分析報告
3. 使用的所有提示詞歷史
4. 功能測試截圖或影片
5. 學習反思（500-800 字）

## 延伸學習

### 推薦嘗試
1. 生成不同類型的應用（社交、遊戲、工具）
2. 嘗試生成後端 API 程式碼
3. 生成行動應用版本（React Native）
4. 生成完整的測試套件

### 學習資源
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [AI-Assisted Development Best Practices](https://github.com/ai-assisted-dev)
- [財務應用 UI 設計參考](https://dribbble.com/tags/finance_app)

---
*提示：記住，AI 是您的助手而非替代品。關鍵是學會如何有效地指導 AI，而不是完全依賴它。*