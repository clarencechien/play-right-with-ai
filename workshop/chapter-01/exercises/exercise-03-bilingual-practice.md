# 練習 3：雙語策略實踐

## 目標
掌握「Think in English, Output in Chinese」的雙語提示策略，體驗其對程式碼品質的影響。

## 預計時間
30-40 分鐘

## 背景說明

雙語策略利用了 AI 模型的訓練特性：
- 大部分高品質技術文件和程式碼都是英文
- 英文技術術語更精確、無歧義
- 但我們需要中文的使用者介面和註解

## 實驗任務：創建使用者註冊表單

您將使用三種不同的提示策略來生成相同的功能，比較結果差異。

### 方法 A：純中文提示

```markdown
請幫我創建一個使用者註冊表單，需要包含：
- 使用者名稱（6-20字元）
- 電子郵件（需要驗證格式）
- 密碼（至少8字元，包含大小寫和數字）
- 確認密碼（需要與密碼相同）
- 同意條款的勾選框
- 提交按鈕

要有即時驗證，錯誤訊息要清楚，使用現代化的設計。
```

### 方法 B：純英文提示

```markdown
Create a user registration form with:
- Username (6-20 characters)
- Email (with format validation)
- Password (minimum 8 chars, must include uppercase, lowercase, and numbers)
- Confirm password (must match password)
- Terms agreement checkbox
- Submit button

Include real-time validation, clear error messages, and modern design.
```

### 方法 C：雙語策略提示（推薦）

```markdown
[English Planning]
Create a user registration form with the following specifications:

Technical Requirements:
- Username field: 6-20 characters, alphanumeric only
- Email field: RFC 5322 compliant validation
- Password field: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - Optional special characters
- Confirm password: Real-time matching validation
- Terms checkbox: Required before submission
- Submit button: Disabled until all validations pass

Features:
- Real-time validation with debouncing (300ms)
- Progressive error messages (show after user stops typing)
- Password strength indicator
- Accessible form with proper ARIA labels
- Responsive design with mobile-first approach

[Chinese Delivery]
所有使用者介面文字請使用繁體中文：
- 表單標題：「建立新帳號」
- 欄位標籤和錯誤訊息都用繁體中文
- 提供友善、鼓勵性的提示文字
- 成功訊息：「註冊成功！歡迎加入」

程式碼註解請用繁體中文詳細說明每個功能的用途。
```

## 實作步驟

### 步驟 1：生成三個版本
1. 使用方法 A 生成程式碼，保存到 `form-chinese/`
2. 使用方法 B 生成程式碼，保存到 `form-english/`
3. 使用方法 C 生成程式碼，保存到 `form-bilingual/`

### 步驟 2：比較分析

創建比較表格 `comparison.md`：

```markdown
# 三種提示策略比較

| 評估項目 | 純中文 | 純英文 | 雙語策略 |
|---------|--------|--------|----------|
| 程式碼結構清晰度 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 功能完整性 | | | |
| 錯誤處理 | | | |
| 程式碼可維護性 | | | |
| UI/UX 設計 | | | |
| 效能考量 | | | |
| 安全性考量 | | | |
| 註解品質 | | | |

## 具體觀察

### 純中文版本
- 優點：
- 缺點：

### 純英文版本
- 優點：
- 缺點：

### 雙語策略版本
- 優點：
- 缺點：
```

### 步驟 3：優化實驗

選擇雙語策略版本，嘗試進一步優化：

```markdown
[Enhancement Request]
Based on the previous form, please add:

Technical Improvements:
1. Implement password strength algorithm (zxcvbn library)
2. Add username availability check (simulate API call)
3. Implement CAPTCHA integration point
4. Add social login options (Google, GitHub)
5. Include progress indicator for multi-step registration

UX Improvements:
1. Show password requirements on focus
2. Implement show/hide password toggle
3. Add inline success indicators
4. Smooth transitions and micro-animations
5. Dark mode support

[Chinese UI Updates]
更新所有新功能的中文介面文字，保持友善和專業的語氣。
```

## 深度分析任務

### 任務 1：程式碼品質分析

對每個版本執行以下檢查：
1. 使用瀏覽器開發者工具檢查效能
2. 測試各種邊界情況
3. 檢查無障礙性（使用螢幕閱讀器）
4. 評估程式碼的可讀性和可維護性

### 任務 2：提示詞優化實驗

嘗試不同的雙語比例：
- 80% 英文 / 20% 中文
- 50% 英文 / 50% 中文
- 20% 英文 / 80% 中文

記錄哪種比例產生最佳結果。

### 任務 3：領域特定測試

在不同領域測試雙語策略：
1. 資料視覺化元件
2. API 端點設計
3. 資料庫架構設計
4. 演算法實作

## 評估標準

### 必須完成
- [ ] 生成三個版本的註冊表單
- [ ] 完成比較分析表格
- [ ] 所有表單都能正常運作

### 進階要求
- [ ] 實施至少 3 個優化建議
- [ ] 進行效能測試比較
- [ ] 撰寫詳細的分析報告

## 反思問題

1. **語言對程式碼品質的影響**
   - 您觀察到最顯著的差異是什麼？
   - 為什麼英文提示往往產生更好的程式碼結構？

2. **雙語策略的最佳實踐**
   - 哪些部分適合用英文描述？
   - 哪些部分必須用中文說明？
   - 如何找到最佳平衡點？

3. **實際應用考量**
   - 在真實專案中，您會如何應用雙語策略？
   - 團隊協作時如何統一提示詞風格？

## 提交作業

1. 三個版本的完整程式碼
2. 詳細的比較分析報告（500-800字）
3. 優化後的最終版本
4. 對雙語策略的個人見解（300-500字）

## 延伸研究

### 研究方向 1：跨語言測試
測試其他語言組合：
- 日文技術描述 + 中文輸出
- 德文技術描述 + 中文輸出
- 比較不同語言的技術表達能力

### 研究方向 2：提示詞模板化
創建標準化的雙語提示詞模板：
```markdown
[Technical Specification in English]
${technicalRequirements}

[Business Logic in Structured Format]
${businessRules}

[Localization Requirements in Target Language]
${localizationNeeds}
```

### 研究方向 3：自動化測試
編寫腳本自動評估不同提示策略的效果：
- 程式碼行數
- 圈複雜度
- 測試覆蓋率
- 執行效能

## 學習資源

- [The Art of Prompt Engineering](https://www.promptingguide.ai/)
- [Multilingual Prompting Strategies](https://arxiv.org/)
- [Code Quality Metrics](https://www.sonarqube.org/)

---
*記住：雙語策略不是固定規則，而是一種思維方式。關鍵是理解何時使用哪種語言能達到最佳效果。*