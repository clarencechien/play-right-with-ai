# Chapter 2: Application Generation Prompt Test Criteria

## Test ID: CH02-APP-001

### Purpose
驗證應用程式生成提示詞是否能夠一致且可靠地生成功能完整的網頁應用程式。

### Test Criteria

#### 1. Consistency (一致性)
- [ ] 5次執行中至少4次產生結構相似的應用程式
- [ ] 核心功能在所有輸出中都存在
- [ ] 程式碼風格保持一致

#### 2. Completeness (完整性)
- [ ] 包含完整的 HTML 結構 (DOCTYPE, head, body)
- [ ] 包含 CSS 樣式定義
- [ ] 包含 JavaScript 功能實作
- [ ] 所有必要功能都實作完成

#### 3. Functionality (功能性)
- [ ] 應用程式可以直接執行無錯誤
- [ ] CRUD 操作正常運作
- [ ] 資料持久化 (localStorage) 正常
- [ ] 響應式設計適應不同螢幕

#### 4. Code Quality (程式碼品質)
- [ ] 程式碼包含適當註解
- [ ] 使用語義化 HTML
- [ ] CSS 組織結構清晰
- [ ] JavaScript 遵循最佳實踐

#### 5. Bilingual Strategy (雙語策略)
- [ ] 英文思考過程清晰可見
- [ ] 中文輸出準確專業
- [ ] 技術術語使用正確
- [ ] 解釋清楚易懂

#### 6. Cross-Model Compatibility (跨模型相容性)
- [ ] Claude 3.5 Sonnet: 成功率 > 90%
- [ ] GPT-4: 成功率 > 85%
- [ ] Gemini Pro: 成功率 > 80%
- [ ] 輸出格式在不同模型間一致

### Test Scenarios

#### Scenario 1: Basic TODO App
**Input**: 建立一個基礎的待辦事項應用程式
**Expected Output**:
- HTML with input field and list container
- CSS with clean, modern styling
- JavaScript with add, complete, delete functions
- LocalStorage integration

#### Scenario 2: Enhanced TODO App
**Input**: 建立一個進階的待辦事項應用程式，包含優先級和分類
**Expected Output**:
- All basic features
- Priority levels (high, medium, low)
- Categories/tags
- Filter functionality
- Due dates

#### Scenario 3: Edge Cases
**Input**: 建立一個能處理大量資料的待辦事項應用程式
**Expected Output**:
- Performance optimization
- Pagination or virtual scrolling
- Bulk operations
- Error handling for storage limits

### Validation Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| Success Rate | 95% | 85% |
| Time to Generate | < 10s | < 30s |
| Code Lines | 200-500 | 150-800 |
| Test Pass Rate | 100% | 90% |
| User Satisfaction | 4.5/5 | 4.0/5 |

### Test Execution Log Template

```markdown
## Test Run: [Date Time]
**Model**: [Claude/GPT-4/Gemini]
**Prompt Version**: [Version Number]

### Results
- Consistency: [Pass/Fail] - [Score]
- Completeness: [Pass/Fail] - [Details]
- Functionality: [Pass/Fail] - [Details]
- Code Quality: [Pass/Fail] - [Score]
- Bilingual: [Pass/Fail] - [Notes]

### Issues Found
[List any issues]

### Recommendations
[Improvement suggestions]
```