# 練習 2：風險評估工作坊 ⚖️

## 學習目標

通過本練習，您將學會：
- 識別應用程式的技術與業務風險
- 建立風險評估矩陣
- 制定風險緩解策略
- 根據風險調整測試優先級

## 背景說明

風險評估是測試策略的核心。透過系統化的風險分析，我們可以將有限的測試資源投入到最關鍵的區域，確保應用程式的品質與穩定性。

## 任務說明

### Part 1: 風險識別

使用 AI 協助識別各層面的風險：

```markdown
# Risk Identification Prompt

[Application Context - English]
TODO application with:
- Client-side JavaScript
- LocalStorage for persistence
- No backend/API
- Expected 1000+ daily active users
- Critical for task management workflow

[Risk Analysis Task]
Identify risks in these categories:
1. Technical Risks
   - Architecture vulnerabilities
   - Performance bottlenecks
   - Browser compatibility issues
   - Data integrity concerns

2. Business Risks
   - User experience failures
   - Data loss scenarios
   - Functionality gaps
   - Scalability limitations

3. Security Risks
   - XSS vulnerabilities
   - Data exposure
   - Input validation issues

[輸出需求 - 繁體中文]
提供完整的風險清單，每個風險包含：
- 風險描述
- 影響程度 (1-5)
- 發生機率 (1-5)
- 風險分數 (影響 × 機率)
- 建議的緩解措施
```

### Part 2: 建立風險評估矩陣

創建風險評估矩陣 `02-risk-assessment.json`：

```json
{
  "riskMatrix": {
    "critical": [
      {
        "id": "R001",
        "name": "資料遺失風險",
        "description": "LocalStorage 被清除導致所有待辦事項遺失",
        "impact": 5,
        "probability": 2,
        "score": 10,
        "category": "technical",
        "mitigation": [
          "實作資料備份機制",
          "提供資料匯出功能",
          "增加恢復選項"
        ],
        "testPriority": "P0",
        "testCases": ["TC001", "TC002", "TC003"]
      }
    ],
    "high": [],
    "medium": [],
    "low": []
  },
  "criticalPaths": [
    {
      "name": "新增待辦事項流程",
      "impact": 5,
      "probability": 3,
      "testPriority": "P0",
      "components": [
        "輸入驗證",
        "資料儲存",
        "UI 更新",
        "狀態同步"
      ]
    }
  ],
  "mitigationStrategies": {
    "preventive": [],
    "detective": [],
    "corrective": []
  }
}
```

### Part 3: 風險評分計算

#### 風險評分矩陣

| 影響/機率 | 1-很低 | 2-低 | 3-中 | 4-高 | 5-很高 |
|----------|--------|------|------|------|--------|
| 5-災難性 | 5 | 10 | 15 | 20 | 25 |
| 4-重大 | 4 | 8 | 12 | 16 | 20 |
| 3-中等 | 3 | 6 | 9 | 12 | 15 |
| 2-輕微 | 2 | 4 | 6 | 8 | 10 |
| 1-可忽略 | 1 | 2 | 3 | 4 | 5 |

#### 風險等級定義

- **極高風險 (20-25)**: 立即處理，P0 測試優先級
- **高風險 (12-19)**: 優先處理，P1 測試優先級
- **中風險 (6-11)**: 計劃處理，P2 測試優先級
- **低風險 (1-5)**: 監控狀態，P3 測試優先級

### Part 4: 技術風險深度分析

#### 1. 瀏覽器相容性風險

```markdown
# Browser Compatibility Risk Analysis

[Context]
Analyze browser-specific risks for TODO app

[Considerations]
- LocalStorage API differences
- JavaScript engine variations
- CSS rendering inconsistencies
- Event handling differences

[Output]
風險評估報告與測試建議
```

#### 2. 效能風險

```markdown
# Performance Risk Analysis

[Scenarios to Analyze]
- 1000+ todo items
- Rapid user interactions
- Memory leaks
- DOM manipulation overhead

[Metrics]
- Response time thresholds
- Memory usage limits
- Rendering performance

[輸出]
效能風險矩陣與測試策略
```

#### 3. 資料完整性風險

```markdown
# Data Integrity Risk Analysis

[Risk Factors]
- Concurrent modifications
- Storage quota exceeded
- Corrupted data format
- Browser crashes

[Expected Analysis]
- Risk scenarios
- Impact assessment
- Prevention strategies
- Recovery procedures
```

### Part 5: 業務風險評估

#### 關鍵業務流程識別

1. **核心功能風險**
   - 新增任務失敗
   - 任務狀態不同步
   - 篩選功能錯誤

2. **使用者體驗風險**
   - 回應時間過長
   - UI 錯誤顯示
   - 操作回饋不明確

3. **資料風險**
   - 資料遺失
   - 資料洩漏
   - 資料損壞

### Part 6: 風險緩解策略

#### 預防性措施
```json
{
  "preventive": [
    {
      "risk": "資料遺失",
      "measures": [
        "定期自動備份",
        "多重儲存機制",
        "資料驗證檢查"
      ]
    }
  ]
}
```

#### 偵測性措施
```json
{
  "detective": [
    {
      "risk": "效能降級",
      "measures": [
        "效能監控",
        "錯誤日誌",
        "使用者回饋收集"
      ]
    }
  ]
}
```

#### 修正性措施
```json
{
  "corrective": [
    {
      "risk": "功能故障",
      "measures": [
        "錯誤恢復機制",
        "降級方案",
        "快速修復流程"
      ]
    }
  ]
}
```

## 實作步驟

### Step 1: 執行風險識別
使用提供的提示詞，讓 AI 協助識別所有潛在風險。

### Step 2: 風險評分
對每個識別的風險進行影響和機率評分。

### Step 3: 優先級排序
根據風險分數排序，確定測試優先級。

### Step 4: 制定策略
為高風險項目制定具體的緩解策略。

### Step 5: 建立追蹤機制
設計風險追蹤和監控方案。

## 預期產出

完成練習後，您應該有：

1. ✅ `02-risk-assessment.json` - 完整的風險評估矩陣
2. ✅ `risk-mitigation-plan.md` - 風險緩解計劃
3. ✅ `critical-path-analysis.md` - 關鍵路徑分析
4. ✅ `risk-based-test-strategy.md` - 基於風險的測試策略

## 評估標準

| 標準 | 權重 | 說明 |
|-----|-----|-----|
| 風險識別完整性 | 30% | 涵蓋技術、業務、安全各層面 |
| 評分合理性 | 25% | 影響和機率評估的準確性 |
| 策略可行性 | 25% | 緩解措施的實用性 |
| 優先級邏輯 | 20% | 測試優先級分配的合理性 |

## 實戰演練

### 情境模擬 1：儲存空間耗盡

```markdown
情境：使用者的 LocalStorage 即將達到上限
風險：新增待辦事項失敗，資料可能遺失

請分析：
1. 風險影響範圍
2. 偵測機制
3. 處理策略
4. 測試方案
```

### 情境模擬 2：瀏覽器崩潰

```markdown
情境：瀏覽器在操作過程中意外崩潰
風險：未儲存的資料遺失，狀態不一致

請設計：
1. 資料恢復機制
2. 狀態同步策略
3. 使用者通知方案
4. 測試案例
```

## 進階挑戰 🚀

### 挑戰 1：自動化風險評分
開發一個腳本，自動根據代碼複雜度和歷史缺陷計算風險分數。

### 挑戰 2：風險熱圖
創建視覺化的風險熱圖，直觀展示高風險區域。

### 挑戰 3：預測性風險分析
使用 AI 預測未來可能出現的風險，提前制定應對方案。

## 學習資源

- [ISO 31000 風險管理標準](https://www.iso.org/iso-31000-risk-management.html)
- [軟體測試風險分析](https://www.softwaretestinghelp.com/risk-analysis-in-software-testing/)
- [FMEA 失效模式與影響分析](https://asq.org/quality-resources/fmea)

## 實用工具推薦

- Risk Matrix Generator
- JIRA Risk Register
- Risk Heat Map Tools

## 提交檢查清單

- [ ] 風險評估矩陣完整
- [ ] 包含至少 15 個風險項目
- [ ] 每個風險都有緩解策略
- [ ] 測試優先級明確
- [ ] 關鍵路徑已識別

---

⚠️ **重要提醒**：風險評估是動態的過程，需要定期更新和審視。

🎭 **Play right with AI** - 讓風險無所遁形，品質穩如泰山！