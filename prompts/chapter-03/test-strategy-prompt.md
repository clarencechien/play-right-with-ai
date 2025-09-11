# Chapter 3: Test Strategy Golden Prompts

## Prompt 1: Comprehensive Test Strategy Analysis

```markdown
[Context]
I have a TODO application with the following features and code structure:

Features:
- Add new tasks
- Mark tasks as complete/incomplete
- Delete tasks
- Filter tasks (All/Active/Completed)
- Clear all completed tasks
- Local storage persistence

HTML Structure:
[Paste your HTML code here]

JavaScript Implementation:
[Paste your JavaScript code here]

[Requirements - Think in English]
Please analyze this application and create a comprehensive test strategy:

1. Risk Assessment:
   - Identify technical risks (performance, compatibility, security)
   - Identify business risks (data loss, functionality failure)
   - Calculate risk scores (Impact × Probability)
   - Prioritize testing based on risk

2. Test Coverage Strategy:
   - Define functional coverage targets
   - Define code coverage targets
   - Identify critical paths
   - Plan test distribution (unit/integration/e2e)

3. Test Case Categories:
   - Core functionality tests
   - Edge cases and boundary conditions
   - Negative testing scenarios
   - Performance and load tests
   - Cross-browser compatibility tests

4. Resource Planning:
   - Estimate effort for each test category
   - Define automation priorities
   - Plan manual vs automated distribution

[Expected Output - 繁體中文]
請提供完整的測試策略文檔，包含：

1. 執行摘要
2. 風險評估矩陣
3. 測試範圍定義
4. 測試優先級排序
5. 覆蓋率目標設定
6. 資源分配計劃
7. 測試執行時程
8. 成功標準定義

格式要求：
- 使用表格呈現矩陣
- 包含具體數字指標
- 提供可執行的行動項目
```

## Prompt 2: Risk-Based Test Planning

```markdown
[Context]
TODO application for task management
Expected users: 1000+ daily
Critical for productivity workflow
No backend, pure client-side with LocalStorage

[Task - English Analysis]
Perform risk-based test planning:

1. Identify failure modes:
   - What can go wrong?
   - What's the impact?
   - How likely is it?

2. Create risk mitigation through testing:
   - Which risks need immediate testing?
   - What type of tests address each risk?
   - How much testing is enough?

3. Prioritize test efforts:
   - P0: Critical - must test
   - P1: Important - should test
   - P2: Nice to have - could test
   - P3: Low priority - won't test (this iteration)

[輸出需求 - 繁體中文]
生成風險驅動的測試計劃，包含：

風險評估表：
| 風險項目 | 影響(1-5) | 機率(1-5) | 風險分數 | 測試策略 | 優先級 |

測試分配建議：
- 高風險區域：__% 測試資源
- 中風險區域：__% 測試資源
- 低風險區域：__% 測試資源

具體行動計劃：
1. 第一週：[測試活動]
2. 第二週：[測試活動]
```

## Prompt 3: Test Case Generation Strategy

```markdown
[Application Context]
TODO app with CRUD operations and filtering

[Requirements - Systematic Analysis]
Generate test cases using multiple techniques:

1. Equivalence Partitioning:
   - Valid input classes
   - Invalid input classes
   - Edge cases

2. Boundary Value Analysis:
   - Minimum values
   - Maximum values
   - Just inside/outside boundaries

3. Decision Table Testing:
   - Combinations of conditions
   - Expected outcomes

4. State Transition Testing:
   - Task states (new/active/completed)
   - Valid transitions
   - Invalid transitions

5. Error Guessing:
   - Common user mistakes
   - System stress points
   - Integration issues

[輸出格式 - 繁體中文]
測試案例矩陣：

功能測試案例（核心功能）：
TC001: [測試案例名稱]
- 前置條件：
- 測試步驟：
- 預期結果：
- 優先級：P0

邊界測試案例：
TC101: [邊界條件測試]
- 測試資料：
- 預期行為：

負向測試案例：
TC201: [錯誤處理測試]
- 錯誤場景：
- 系統反應：

每個類別至少提供 5 個測試案例
```

## Prompt 4: Coverage Strategy Design

```markdown
[Project Context]
TODO application testing project
Team: 2 testers
Timeline: 2 weeks
Automation tools: Playwright

[Analysis Task - English]
Design optimal coverage strategy considering:

1. Coverage Types:
   - Functional coverage (features tested)
   - Code coverage (lines/branches/functions)
   - Requirements coverage (user stories)
   - Risk coverage (critical areas)

2. Coverage Targets:
   - What's realistic given constraints?
   - Where to focus for maximum value?
   - How to measure and track?

3. Test Pyramid:
   - Unit test percentage
   - Integration test percentage
   - E2E test percentage
   - Manual test percentage

4. ROI Analysis:
   - Cost of achieving coverage
   - Value of defects prevented
   - Maintenance considerations

[期望輸出 - 繁體中文]
覆蓋率策略設計：

1. 覆蓋率目標設定
   功能覆蓋率：__%
   代碼覆蓋率：__%
   需求覆蓋率：__%
   風險覆蓋率：__%

2. 測試層級分配
   ```
   手動測試 (10%)
   E2E 測試 (25%)
   整合測試 (30%)
   單元測試 (35%)
   ```

3. 成本效益分析
   - 預期投入：__ 人時
   - 預期收益：缺陷預防率 __%
   - ROI：__x

4. 實施路線圖
   Phase 1: [重點區域]
   Phase 2: [擴展區域]
   Phase 3: [優化區域]
```

## Prompt 5: Test Plan Documentation

```markdown
[Context]
Need to create IEEE 829 compliant test plan for TODO app

[Requirements - Professional Documentation]
Create comprehensive test plan covering:

1. Test Plan Identifier
2. Introduction (purpose, scope)
3. Test Items
4. Features to be Tested
5. Features not to be Tested
6. Testing Approach
7. Pass/Fail Criteria
8. Suspension/Resumption Criteria
9. Test Deliverables
10. Testing Tasks
11. Environmental Needs
12. Responsibilities
13. Staffing and Training
14. Schedule
15. Risks and Contingencies

[輸出要求 - 繁體中文專業文檔]
生成完整測試計劃文檔

格式要求：
- 專業術語準確
- 邏輯結構清晰
- 包含具體指標
- 可直接使用於專案

文檔品質：
- 符合 IEEE 829 標準
- 適合團隊規模
- 考慮實際限制
- 包含應變計劃
```

## Advanced Prompts for AI-Assisted Testing

### Prompt 6: Intelligent Test Prioritization

```markdown
[Historical Data]
Previous defects: [list defect patterns]
User feedback: [common complaints]
Performance metrics: [current baselines]

[Smart Prioritization Task]
Use data-driven approach to prioritize tests:

1. Analyze defect patterns
2. Identify high-risk areas
3. Predict failure probability
4. Optimize test sequence
5. Suggest continuous adjustments

[輸出]
智能測試優先級建議與理由
```

### Prompt 7: Test Strategy Optimization

```markdown
[Current Strategy]
[Paste your current test strategy]

[Optimization Request]
Review and optimize for:

1. Efficiency improvements
2. Coverage gaps
3. Resource optimization
4. Risk mitigation
5. Automation opportunities

[期望改進]
提供具體優化建議，包含預期改善指標
```

## Tips for Using These Prompts

### 雙語策略最佳實踐

1. **英文思考階段**：
   - 技術分析
   - 邏輯推理
   - 系統化思考

2. **中文輸出階段**：
   - 清晰表達
   - 文檔撰寫
   - 團隊溝通

### 提示詞優化技巧

1. **具體化Context**：提供詳細的應用資訊
2. **明確化Requirements**：清楚說明需求
3. **結構化Output**：定義輸出格式
4. **迭代式改進**：根據結果調整提示詞

### 使用建議

- 根據專案特性調整提示詞
- 保存成功的提示詞作為模板
- 持續優化提示詞效果
- 分享優秀提示詞給團隊

---

💡 **專業提示**：優秀的提示詞是迭代出來的，不斷測試和改進直到獲得理想結果。

🎭 **Play right with AI** - 用智慧的提示詞，獲得卓越的測試策略！