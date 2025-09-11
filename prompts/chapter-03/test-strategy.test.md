# Chapter 3: Test Strategy Creation Prompt Test Criteria

## Test ID: CH03-TEST-001

### Purpose
驗證測試策略生成提示詞能夠產生全面、可執行的測試計劃。

### Test Criteria

#### 1. Comprehensiveness (全面性)
- [ ] 涵蓋功能測試、邊界測試、異常測試
- [ ] 包含正向和負向測試案例
- [ ] 考慮效能和安全性測試
- [ ] 涵蓋不同使用者角色和場景

#### 2. Clarity (清晰度)
- [ ] 測試目標明確定義
- [ ] 測試步驟詳細可執行
- [ ] 預期結果清楚描述
- [ ] 優先級別合理分配

#### 3. Executability (可執行性)
- [ ] 測試案例可直接轉換為自動化腳本
- [ ] 包含具體的測試資料
- [ ] 定義清楚的前置條件
- [ ] 提供驗證點和斷言

#### 4. Risk Coverage (風險覆蓋)
- [ ] 識別高風險區域
- [ ] 提供風險緩解策略
- [ ] 考慮迴歸測試需求
- [ ] 包含錯誤恢復測試

#### 5. Bilingual Quality (雙語品質)
- [ ] 英文分析邏輯清晰
- [ ] 中文測試文檔專業
- [ ] 術語使用一致準確
- [ ] 適合台灣開發環境

#### 6. Model Compatibility (模型相容性)
- [ ] Claude: 策略完整度 > 95%
- [ ] GPT: 策略完整度 > 90%
- [ ] Gemini: 策略完整度 > 85%

### Test Scenarios

#### Scenario 1: Simple Application
**Input**: 基礎計算機應用程式碼
**Expected Output**:
- 10-15 個核心測試案例
- 基本運算測試
- 邊界值測試
- 錯誤處理測試

#### Scenario 2: Complex Application
**Input**: 電子商務購物車系統
**Expected Output**:
- 30-50 個測試案例
- 使用者流程測試
- 整合測試策略
- 效能測試計劃
- 安全性測試要點

#### Scenario 3: API Testing
**Input**: RESTful API 服務
**Expected Output**:
- API 端點測試策略
- 資料驗證測試
- 錯誤碼測試
- 負載測試建議

### Quality Metrics

| Metric | Target | Minimum |
|--------|--------|---------|
| Test Coverage | 90% | 80% |
| Critical Path Coverage | 100% | 95% |
| Edge Case Identification | 15+ cases | 10+ cases |
| Risk Assessment Accuracy | 90% | 80% |
| Actionability Score | 4.5/5 | 4.0/5 |

### Validation Checklist

```markdown
## Test Strategy Evaluation

### Structure
- [ ] Clear test objectives
- [ ] Organized test categories
- [ ] Prioritized test cases
- [ ] Defined test data
- [ ] Exit criteria specified

### Content Quality
- [ ] Comprehensive coverage
- [ ] Clear prerequisites
- [ ] Specific test steps
- [ ] Measurable outcomes
- [ ] Risk mitigation included

### Practical Value
- [ ] Directly executable
- [ ] Time estimates provided
- [ ] Resource requirements clear
- [ ] Automation potential identified
- [ ] Maintenance plan included
```

### Test Execution Template

```markdown
## Test Run: [Date Time]
**Model**: [AI Model]
**Application Type**: [Type]
**Code Lines**: [Number]

### Results Summary
- Total Test Cases Generated: [Number]
- Coverage Areas: [List]
- Risk Items Identified: [Number]
- Automation Candidates: [Percentage]

### Quality Assessment
- Comprehensiveness: [Score/10]
- Clarity: [Score/10]
- Executability: [Score/10]
- Risk Coverage: [Score/10]

### Issues & Improvements
[Detailed feedback]
```