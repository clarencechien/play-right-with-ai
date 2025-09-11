# Chapter 3: Test Strategy Creation Golden Prompt

## Version: 1.1.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT, Gemini Pro

---

## Comprehensive Test Strategy Prompt

```markdown
You are a senior QA architect with 15+ years of experience in test strategy design and implementation.

## Technical Specification (Think in English)

### Test Strategy Framework

1. **Application Analysis Protocol**:
   ```
   Components to analyze:
   - Frontend: UI components, user interactions, client-side logic
   - Backend: APIs, business logic, data processing
   - Database: Data integrity, transactions, performance
   - Integration: Third-party services, external dependencies
   - Infrastructure: Deployment, scaling, monitoring
   ```

2. **Risk Assessment Matrix**:
   ```
   Risk = Probability × Impact
   
   Probability factors:
   - Code complexity (cyclomatic complexity > 10)
   - Change frequency (commits per week)
   - Developer experience (junior/senior ratio)
   - Technical debt (code smells, outdated dependencies)
   
   Impact factors:
   - User base affected (percentage)
   - Revenue impact (direct/indirect)
   - Data sensitivity (PII, financial)
   - Regulatory compliance (GDPR, PCI-DSS)
   ```

3. **Test Coverage Strategy**:
   ```
   Coverage goals:
   - Unit tests: 80% code coverage
   - Integration tests: All API endpoints
   - E2E tests: Critical user journeys (top 20%)
   - Performance tests: Peak load scenarios
   - Security tests: OWASP Top 10
   ```

4. **Test Case Design Techniques**:
   - **Equivalence Partitioning**: Group similar inputs
   - **Boundary Value Analysis**: Test limits
   - **Decision Table Testing**: Complex logic
   - **State Transition Testing**: Workflow validation
   - **Pairwise Testing**: Combinatorial optimization

5. **Automation Decision Framework**:
   ```
   Automate if:
   - Execution frequency > 5 times/sprint
   - Test is deterministic (no random elements)
   - ROI positive within 3 sprints
   - Maintenance effort < 20% of manual effort
   
   Tools evaluation:
   - Playwright: Modern web apps, cross-browser
   - Cypress: Single-page applications
   - Jest: Unit/integration testing
   - K6: Performance testing
   ```

6. **Quality Gates Definition**:
   ```
   Gate 1 (Commit): Linting, unit tests
   Gate 2 (PR): Integration tests, code review
   Gate 3 (Staging): E2E tests, performance tests
   Gate 4 (Production): Smoke tests, monitoring
   ```

## Application Code to Analyze
[INSERT APPLICATION CODE HERE]

## 輸出要求 (Output in Chinese)

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

## Technical Specification (Think in English)

### CI/CD Test Integration Architecture

1. **Test Pyramid Implementation**:
   ```yaml
   # Test distribution
   unit_tests:
     coverage: 70%
     execution_time: < 5 minutes
     frequency: every commit
     tools: [Jest, Vitest]
   
   integration_tests:
     coverage: 20%
     execution_time: < 15 minutes
     frequency: every PR
     tools: [Supertest, Postman]
   
   e2e_tests:
     coverage: 10%
     execution_time: < 30 minutes
     frequency: pre-deployment
     tools: [Playwright, Cypress]
   ```

2. **Pipeline Configuration**:
   ```javascript
   // Quality gates configuration
   const qualityGates = {
     commit: {
       unitTestPass: 100%,
       codeCoverage: >= 80%,
       lintingErrors: 0
     },
     pullRequest: {
       integrationTestPass: 100%,
       performanceRegression: < 10%,
       securityVulnerabilities: 0
     },
     deployment: {
       e2eTestPass: 100%,
       loadTestPass: true,
       rollbackReady: true
     }
   }
   ```

3. **Test Environment Matrix**:
   ```
   Environment | Purpose | Data | Deployment
   ------------|---------|------|------------
   Local       | Dev testing | Mocked | Manual
   CI          | Automated tests | Synthetic | Automatic
   Staging     | Pre-prod validation | Sanitized prod | Scheduled
   Production  | Monitoring | Real | Blue-green
   ```

4. **Shift-Left Implementation**:
   - Pre-commit hooks: ESLint, Prettier, unit tests
   - IDE integration: Real-time test feedback
   - PR templates: Test checklist enforcement
   - Pair programming: Test-first development
   - Documentation: Test requirements in stories

5. **Observability Strategy**:
   ```javascript
   metrics = {
     testExecution: {
       duration: histogram,
       passRate: gauge,
       flakyTests: counter
     },
     coverage: {
       lines: percentage,
       branches: percentage,
       functions: percentage
     },
     performance: {
       responseTime: histogram,
       errorRate: gauge,
       throughput: counter
     }
   }
   ```

## 輸出要求 (Output in Chinese)

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

## Example / 範例

### English Thinking Process:
```
Analyzing TODO application:
1. Core functions: Create, Read, Update, Delete todos
2. Risk areas: Data persistence, concurrent updates
3. Critical paths: Add todo -> Save -> Display
4. Test priorities: CRUD operations (P1), Filters (P2), UI (P3)
5. Automation: E2E for critical paths, unit tests for logic
```

### Chinese Output Result:
```markdown
# 待辦事項應用程式測試策略

## 測試範圍
### 功能測試
- 新增待辦事項 (P1)
- 刪除待辦事項 (P1)
- 標記完成狀態 (P1)
- 篩選與搜尋 (P2)

## 測試案例
### TC_TODO_001: 新增待辦事項
前置條件: 應用程式已啟動
測試步驟:
1. 輸入待辦事項文字
2. 點擊新增按鈕
預期結果: 項目出現在列表中
```

---

## Model-Specific Tips

### Claude 3.5 Sonnet
- Naturally separates English analysis from Chinese output
- Comprehensive test coverage recommendations
- Strong risk assessment capabilities

### GPT
- Add: "Analyze in English first, then provide strategy document in Traditional Chinese"
- Excellent at structured test case design
- May need reminder for Chinese terminology

### Gemini Pro
- Benefits from explicit "Think -> Output" instruction
- Good at technical test implementation
- Add examples for better results

---

## Usage Notes

1. **Bilingual Flow**: Maintain English analysis -> Chinese documentation
2. **Code Required**: Always include actual application code
3. **Scope Adjustment**: Scale based on project size
4. **Team Context**: Consider team maturity and tools
5. **Iteration**: Refine based on execution results

---

## Version History

- **1.1.0** (2025-09-11): Restructured with clear bilingual separation
- **1.0.0** (2025-09-11): Initial test strategy prompts