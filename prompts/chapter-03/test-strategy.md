# Chapter 3: Test Strategy Creation Golden Prompt

## Version: 1.0.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT-4, Gemini Pro

---

## Comprehensive Test Strategy Prompt

```markdown
You are a senior QA architect with 15+ years of experience in test strategy design and implementation.

## Analytical Framework (English Thinking)

Let me analyze the application systematically:

1. **Application Analysis**:
   - Identify core functionalities
   - Map user journeys and workflows
   - Determine system boundaries
   - Assess technical architecture
   - Review data flow patterns

2. **Risk Assessment**:
   - Critical business functions
   - High-complexity areas
   - Integration points
   - Security vulnerabilities
   - Performance bottlenecks

3. **Test Strategy Components**:
   - Functional testing (happy path, edge cases)
   - Non-functional testing (performance, security, usability)
   - Integration testing
   - Regression testing
   - Exploratory testing

4. **Test Prioritization Matrix**:
   - Business impact (High/Medium/Low)
   - Technical risk (High/Medium/Low)
   - Frequency of use
   - Implementation complexity

5. **Automation Strategy**:
   - Automation candidates identification
   - Tool selection criteria
   - ROI analysis
   - Maintenance considerations

## Application Code to Analyze
[INSERT APPLICATION CODE HERE]

## 測試策略輸出規範 (繁體中文)

請提供完整的測試策略文檔，包含以下內容：

### 1. 執行摘要
- 測試範圍概述
- 關鍵風險識別
- 測試方法建議
- 資源需求評估

### 2. 測試範圍與目標
- **範圍內 (In Scope)**
  - 功能模組清單
  - 測試類型
  - 支援平台/瀏覽器
  
- **範圍外 (Out of Scope)**
  - 排除項目說明
  - 原因說明

### 3. 關鍵使用者流程 (優先級排序)
請列出 5-10 個最重要的使用者流程，包含：
- 流程名稱
- 流程描述
- 業務重要性 (高/中/低)
- 技術風險 (高/中/低)
- 建議測試深度

### 4. 詳細測試案例設計

對每個關鍵流程，提供：

#### 測試案例範本
```
測試案例 ID: TC_[模組]_[編號]
測試名稱: [描述性名稱]
優先級: P1/P2/P3
測試類型: 功能/整合/效能/安全

前置條件:
- [條件1]
- [條件2]

測試步驟:
1. [步驟描述] | 預期結果: [結果]
2. [步驟描述] | 預期結果: [結果]
3. [步驟描述] | 預期結果: [結果]

測試資料:
- [資料集1]
- [資料集2]

驗證點:
- [斷言1]
- [斷言2]

清理步驟:
- [清理動作]
```

### 5. 邊界條件與異常測試
- 空值處理
- 邊界值測試
- 並發測試
- 超時處理
- 錯誤恢復

### 6. 非功能性測試
- **效能測試**
  - 載入時間要求
  - 並發使用者數
  - 資源使用限制
  
- **安全測試**
  - 輸入驗證
  - XSS 防護
  - CSRF 防護
  - 資料加密

- **可用性測試**
  - 無障礙標準
  - 跨瀏覽器相容
  - 響應式設計

### 7. 測試資料策略
- 資料準備方法
- 測試資料集設計
- 資料隱私考量
- 資料清理程序

### 8. 風險評估與緩解
| 風險項目 | 影響程度 | 發生機率 | 緩解措施 |
|---------|---------|---------|---------|
| [風險1] | 高/中/低 | 高/中/低 | [措施] |

### 9. 測試執行計劃
- 測試環境需求
- 執行順序建議
- 預估時間
- 人力資源需求

### 10. 測試指標與成功標準
- 測試覆蓋率目標: __%
- 缺陷密度閾值: __/KLOC
- 關鍵路徑通過率: 100%
- 效能基準達成率: __%
```

---

## Advanced Test Strategy Prompt (CI/CD Integration)

```markdown
As a DevOps-oriented QA strategist, create a comprehensive test strategy that integrates with modern CI/CD pipelines.

## Strategic Analysis (English)

1. **Test Pyramid Design**:
   - Unit tests (70%): Fast, isolated, numerous
   - Integration tests (20%): API and service layer
   - E2E tests (10%): Critical user journeys only
   - Manual exploratory tests: Edge cases and UX

2. **Shift-Left Testing**:
   - Developer testing requirements
   - Pre-commit hooks
   - Code review checklist
   - Static analysis integration

3. **Continuous Testing Pipeline**:
   - Smoke tests on every commit
   - Regression suite on merge
   - Performance tests nightly
   - Security scans weekly

4. **Test Environment Strategy**:
   - Local development environment
   - Integration environment
   - Staging (production-like)
   - Production monitoring

5. **Quality Gates**:
   - Code coverage thresholds
   - Performance benchmarks
   - Security scan results
   - Accessibility compliance

## 現代化測試策略規範 (繁體中文)

建立符合 CI/CD 的完整測試策略：

### 1. 測試金字塔架構

```
        /\
       /  \  E2E Tests (10%)
      /    \  - Critical paths only
     /      \  - Playwright/Cypress
    /--------\
   /          \ Integration Tests (20%)
  /            \ - API testing
 /              \ - Service layer
/________________\
     Unit Tests (70%)
     - Fast execution
     - High coverage
     - TDD approach
```

### 2. 持續測試管線

#### Stage 1: Pre-Commit
- Linting 檢查
- 單元測試執行
- 程式碼覆蓋率檢查

#### Stage 2: Pull Request
- 整合測試套件
- 程式碼品質分析
- 安全掃描

#### Stage 3: Main Branch
- 完整迴歸測試
- 效能基準測試
- E2E 關鍵路徑

#### Stage 4: Pre-Production
- 完整 E2E 測試
- 負載測試
- 安全滲透測試

### 3. 自動化測試策略

#### Playwright 測試架構
```typescript
// 測試結構建議
describe('功能模組', () => {
  beforeEach(async ({ page }) => {
    // 測試前置設定
  });

  test('測試案例名稱', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  afterEach(async ({ page }) => {
    // 清理動作
  });
});
```

### 4. 測試工具選擇矩陣

| 測試類型 | 建議工具 | 替代方案 | 原因 |
|---------|---------|---------|------|
| 單元測試 | Jest | Vitest | 速度快、生態系完整 |
| E2E 測試 | Playwright | Cypress | 跨瀏覽器支援 |
| API 測試 | Postman/Newman | REST Client | CI/CD 整合容易 |
| 效能測試 | K6 | JMeter | 程式化測試腳本 |
| 安全測試 | OWASP ZAP | Burp Suite | 自動化掃描 |

### 5. 品質指標儀表板

關鍵指標追蹤：
- 測試覆蓋率趨勢
- 缺陷逃逸率
- 測試執行時間
- 失敗測試分析
- 技術債務指標

### 6. 測試資料管理

- 測試資料工廠模式
- 資料遮罩策略
- 測試資料版本控制
- 環境隔離策略

提供完整可執行的測試策略，確保團隊能立即實施。
```

---

## Model-Specific Tips

### Claude 3.5 Sonnet
- Excellent at comprehensive analysis
- Strong systematic thinking
- May provide very detailed output

### GPT-4
- Good at structured output
- May need prompting for Chinese sections
- Strong at risk analysis

### Gemini Pro
- Benefits from explicit structure
- May need follow-up for completeness
- Good at technical details

---

## Usage Notes

1. **Always provide actual code**: The prompt works best with real application code
2. **Adjust scope**: Scale test cases based on application complexity
3. **Iterate based on feedback**: Refine strategy based on team needs
4. **Document assumptions**: Make testing assumptions explicit
5. **Consider context**: Adapt to team's maturity and tools

---

## Version History

- **1.0.0** (2025-09-11): Initial test strategy prompts with bilingual approach