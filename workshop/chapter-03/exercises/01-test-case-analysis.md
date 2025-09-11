# 練習 1：測試案例分析 🔍

## 學習目標

通過本練習，您將學會：
- 使用 AI 分析應用程式碼並識別測試需求
- 區分不同類型的測試案例（正向、負向、邊界）
- 建立系統化的測試案例矩陣
- 應用雙語思維優化測試設計

## 背景說明

您有一個 TODO 應用程式，需要進行全面的測試案例分析。應用程式具有以下功能：
- 新增待辦事項
- 標記完成/未完成
- 刪除待辦事項
- 篩選功能（全部/進行中/已完成）
- 清除所有已完成項目
- 本地儲存持久化

## 任務說明

### Part 1: 功能分析與測試識別

使用以下提示詞模板，讓 AI 幫助您分析應用並識別測試案例：

```markdown
# Test Case Analysis Prompt

[Application Context - English]
I have a TODO application with the following HTML structure:
[貼上您的 HTML 代碼]

And JavaScript functionality:
[貼上您的 JavaScript 代碼]

[Analysis Task]
Please analyze this application and identify:
1. All user interactions and workflows
2. Data flow and state changes
3. Edge cases and boundary conditions
4. Potential failure points
5. Performance considerations

[Output Requirements - 繁體中文]
請提供完整的測試案例分析，包含：
- 功能測試案例（至少 10 個）
- 邊界測試案例（至少 5 個）
- 負向測試案例（至少 5 個）
- 效能測試案例（至少 3 個）

每個測試案例需包含：
- 測試編號
- 測試描述
- 前置條件
- 測試步驟
- 預期結果
- 優先級（P0-P3）
- 測試類型
```

### Part 2: 建立測試案例矩陣

創建一個 JSON 格式的測試案例矩陣，保存為 `01-output.json`：

```json
{
  "testCases": [
    {
      "id": "TC001",
      "description": "新增單一待辦事項",
      "preconditions": "應用程式已載入，待辦清單為空",
      "steps": [
        "在輸入框輸入 '購買牛奶'",
        "按下 Enter 鍵"
      ],
      "expectedResult": "待辦事項 '購買牛奶' 出現在清單中",
      "priority": "high",
      "type": "functional",
      "category": "核心功能"
    },
    // 更多測試案例...
  ],
  "summary": {
    "totalCases": 23,
    "byPriority": {
      "high": 8,
      "medium": 10,
      "low": 5
    },
    "byType": {
      "functional": 10,
      "edge-case": 5,
      "negative": 5,
      "performance": 3
    }
  }
}
```

### Part 3: 特殊場景測試設計

#### 邊界條件測試

思考並設計以下邊界條件的測試：

1. **輸入長度限制**
   - 空字串輸入
   - 單一字元輸入
   - 極長字串輸入（1000+ 字元）
   - 特殊字元輸入（emoji、Unicode）

2. **數量限制**
   - 大量待辦事項（100+ 項）
   - 全部標記為完成
   - 快速連續操作

3. **儲存限制**
   - LocalStorage 容量限制
   - 瀏覽器隱私模式
   - 跨分頁同步

#### 負向測試案例

設計破壞性測試，驗證系統的錯誤處理：

1. **網路相關**
   - 離線狀態操作
   - 網路延遲模擬

2. **資料相關**
   - 損壞的 LocalStorage 資料
   - 資料格式錯誤
   - 並發修改衝突

3. **使用者操作**
   - 快速重複點擊
   - 拖放操作中斷
   - 瀏覽器返回/前進

### Part 4: 測試優先級評估

使用風險矩陣評估測試優先級：

```markdown
# Priority Assessment Prompt

Based on the test cases identified, help me prioritize them using:

[Risk Factors - English]
1. Business Impact (High/Medium/Low)
2. Probability of Failure (High/Medium/Low)
3. User Frequency (Often/Sometimes/Rarely)
4. Technical Complexity (Complex/Moderate/Simple)

[輸出格式]
創建優先級矩陣，根據風險評分排序測試案例
```

## 實作步驟

### Step 1: 準備應用程式碼
```bash
# 取得 TODO 應用的源代碼
cp ../../chapter-02/example-output/todo-app/*.{html,js,css} ./
```

### Step 2: 執行 AI 分析
使用提供的提示詞，讓 AI 分析您的應用程式碼。

### Step 3: 整理測試案例
將 AI 的輸出整理成結構化的 JSON 格式。

### Step 4: 驗證完整性
確認測試案例覆蓋所有功能點和風險區域。

## 預期產出

完成練習後，您應該有：

1. ✅ `01-output.json` - 完整的測試案例矩陣
2. ✅ `test-priority-matrix.md` - 優先級評估文檔
3. ✅ `edge-cases.md` - 邊界條件測試詳細說明
4. ✅ `negative-tests.md` - 負向測試案例集

## 評估標準

您的測試案例分析將根據以下標準評估：

| 標準 | 權重 | 說明 |
|-----|-----|-----|
| 完整性 | 30% | 是否覆蓋所有功能點 |
| 多樣性 | 25% | 測試類型的多樣化程度 |
| 優先級 | 20% | 優先級評估的合理性 |
| 可執行性 | 15% | 測試步驟的清晰度 |
| 創新性 | 10% | 特殊場景的思考深度 |

## 參考範例

查看 `../example-output/test-case-matrix-example.json` 了解預期的輸出格式。

## 挑戰任務 🎯

### 初級挑戰
找出至少 3 個 AI 可能遺漏的測試案例。

### 中級挑戰
設計一個自動化測試案例生成器，能根據 HTML 結構自動識別可測試元素。

### 高級挑戰
建立測試案例與需求的追溯矩陣，確保需求覆蓋率 100%。

## 學習資源

- [測試案例設計技術](https://www.guru99.com/test-case.html)
- [邊界值分析](https://www.geeksforgeeks.org/boundary-value-analysis/)
- [風險驅動測試](https://www.stickyminds.com/article/risk-based-testing)

## 提交您的作業

完成後，請確保您的檔案結構如下：
```
exercises/
├── 01-test-case-analysis.md (this file)
├── 01-output.json
├── test-priority-matrix.md
├── edge-cases.md
└── negative-tests.md
```

---

💡 **提示**：優秀的測試案例應該是獨立的、可重複的、有明確預期結果的。記住 INVEST 原則！

🎭 **Play right with AI** - 讓 AI 成為您的測試分析專家！