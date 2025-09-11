# Chapter 5: Failure Analysis and Debugging Prompt Test Criteria

## Test ID: CH05-DEBUG-001

### Purpose
驗證失敗分析提示詞能夠準確診斷測試失敗原因並提供可行的解決方案。

### Test Criteria

#### 1. Diagnostic Accuracy (診斷準確性)
- [ ] 正確識別失敗類型（定位器、超時、斷言、網路等）
- [ ] 準確定位失敗程式碼位置
- [ ] 識別根本原因而非表面症狀
- [ ] 區分環境問題與程式碼問題

#### 2. Analysis Depth (分析深度)
- [ ] 提供多層次的原因分析
- [ ] 考慮時序和競態條件
- [ ] 分析相關依賴影響
- [ ] 評估最近變更的影響

#### 3. Solution Quality (解決方案品質)
- [ ] 提供具體可執行的修復代碼
- [ ] 包含多個解決方案選項
- [ ] 評估每個方案的優缺點
- [ ] 提供預防措施建議

#### 4. Evidence-Based (基於證據)
- [ ] 引用具體的錯誤訊息
- [ ] 分析 stack trace
- [ ] 利用 trace 檔案資訊
- [ ] 參考網路和控制台日誌

#### 5. Learning Value (學習價值)
- [ ] 解釋失敗的技術原理
- [ ] 提供相關知識點
- [ ] 包含最佳實踐建議
- [ ] 預防類似問題的指導

#### 6. Actionability (可執行性)
- [ ] 修復步驟清晰明確
- [ ] 驗證方法具體可行
- [ ] 包含測試修復的方法
- [ ] 提供回滾計劃

### Test Scenarios

#### Scenario 1: Selector Failure
**Input**: 
```
Error: locator.click: Timeout 30000ms exceeded
Call log:
- waiting for locator('#submit-button')
```
**Expected Analysis**:
- Selector 不存在或變更
- 元素被遮擋
- 動態載入延遲
- iframe 問題

#### Scenario 2: Flaky Test
**Input**: Test passes 60% of the time
**Expected Analysis**:
- 競態條件分析
- 網路延遲影響
- 資料相依性
- 並行執行衝突

#### Scenario 3: API Integration Failure
**Input**: 
```
Error: Request failed with status code 500
Network: POST /api/user 500 Internal Server Error
```
**Expected Analysis**:
- 後端服務問題
- 請求資料格式
- 認證授權問題
- 環境配置差異

### Quality Metrics

| Metric | Target | Minimum |
|--------|--------|---------|
| Root Cause Accuracy | 95% | 85% |
| Fix Success Rate | 90% | 75% |
| Analysis Completeness | 90% | 80% |
| Time to Solution | < 5 min | < 10 min |
| Prevention Effectiveness | 85% | 70% |

### Validation Framework

```markdown
## Failure Analysis Evaluation

### Diagnostic Quality
- [ ] Correctly identified failure type
- [ ] Found actual root cause
- [ ] Considered all possibilities
- [ ] Evidence properly analyzed
- [ ] Timeline reconstructed

### Solution Assessment
- [ ] Fix addresses root cause
- [ ] Code changes minimal
- [ ] No side effects introduced
- [ ] Performance maintained
- [ ] Security preserved

### Documentation
- [ ] Clear explanation provided
- [ ] Learning points included
- [ ] Prevention steps documented
- [ ] Knowledge transferable
- [ ] Future reference value
```

### Common Failure Patterns

```markdown
## Pattern Recognition Checklist

### UI Failures
- [ ] Element not found
- [ ] Element not interactable
- [ ] Visibility issues
- [ ] Timing problems
- [ ] Animation interference

### Data Failures
- [ ] Stale test data
- [ ] Data dependencies
- [ ] Concurrent modifications
- [ ] Cache inconsistencies
- [ ] Storage limits

### Environment Failures
- [ ] Configuration differences
- [ ] Network issues
- [ ] Resource constraints
- [ ] Permission problems
- [ ] Version mismatches

### Test Design Failures
- [ ] Flaky selectors
- [ ] Hard-coded values
- [ ] Missing waits
- [ ] Test coupling
- [ ] Inadequate cleanup
```

### Test Execution Template

```markdown
## Debug Analysis Test Run

**Date**: [Date Time]
**Model**: [AI Model]
**Failure Type**: [Category]

### Input Data
- Error Message: [Full error]
- Stack Trace: [Trace]
- Test Code: [Relevant code]
- Logs: [Console/Network]

### Analysis Results
- Root Cause Identified: [Yes/No]
- Accuracy: [Percentage]
- Solutions Provided: [Count]
- Best Solution: [Description]

### Quality Scores
- Diagnostic Depth: [/10]
- Solution Quality: [/10]
- Evidence Usage: [/10]
- Actionability: [/10]
- Learning Value: [/10]

### Validation
- Fix Applied: [Yes/No]
- Test Passed: [Yes/No]
- Issue Resolved: [Yes/No]
- Side Effects: [None/List]

### Notes
[Additional observations]
```