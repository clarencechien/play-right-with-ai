# Bilingual Prompting Guide (雙語提示詞指南)

## 核心理念：Think in English, Output in Chinese

本指南展示如何運用「英文思考，中文輸出」策略來獲得更精確的 AI 回應。

## 為什麼要用雙語策略？

1. **技術精確度提升**: AI 模型在英文環境下的推理能力更強
2. **邏輯結構更清晰**: 英文的技術文檔結構有助於組織思路
3. **術語準確性**: 避免中文技術術語的歧義
4. **在地化輸出**: 保持中文輸出確保本地開發者易於理解

## 基礎模式對比

### ❌ 純中文提示（較不精確）
```
請幫我寫一個待辦事項應用程式，要有新增、刪除、標記完成的功能，
資料要存在本地端，介面要好看一點。
```

### ✅ 雙語提示（更精確）
```
You are a senior full-stack developer. Think through the requirements:

1. Create a TODO application with CRUD operations
2. Implement local storage persistence
3. Design responsive UI with modern aesthetics
4. Follow MVC pattern for code organization
5. Include error handling and input validation

Technical stack: Vanilla JavaScript, HTML5, CSS3
Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

請用繁體中文提供：
- 完整的實作程式碼
- 詳細的功能說明
- 使用者操作指南
```

## Chapter 2: 應用程式生成範例

### 初級版本
```
Think about a simple TODO app with basic features:
- Add new tasks
- Mark tasks as complete
- Delete tasks
- Save to localStorage

請用繁體中文實作一個簡單的待辦事項應用。
```

### 中級版本
```
Design a TODO application considering:
- User experience: smooth interactions, clear feedback
- Data management: CRUD operations with localStorage
- Error handling: graceful degradation
- Responsive design: mobile-first approach

Implementation requirements:
- No frameworks (vanilla JS only)
- ES6+ syntax
- Semantic HTML5
- CSS Grid/Flexbox

請提供繁體中文的完整實作，包含詳細註解。
```

### 高級版本
```
As a senior architect, design a production-ready TODO application.

Architecture considerations:
- Separation of concerns (MVC/MVP pattern)
- State management without frameworks
- Event-driven architecture
- Performance optimization (debouncing, virtual scrolling for large lists)

Advanced features:
- Drag-and-drop reordering
- Categories and tags
- Search and filter
- Export/import functionality
- Offline-first with sync capabilities

Security considerations:
- XSS prevention
- Input sanitization
- Content Security Policy compliance

請用繁體中文提供：
1. 完整的架構設計文件
2. 實作程式碼（含詳細註解）
3. 測試策略
4. 部署指南
```

## Chapter 3: 測試策略範例

### 基礎測試策略
```
Analyze the TODO app and create a test strategy:
- Identify user journeys
- Define test cases
- Determine edge cases

請用繁體中文輸出測試計畫。
```

### 進階測試策略
```
As a QA architect, perform comprehensive test planning.

Test dimensions to consider:
1. Functional testing
   - Happy path scenarios
   - Edge cases and boundary conditions
   - Error scenarios
   
2. Non-functional testing
   - Performance benchmarks
   - Security vulnerabilities
   - Accessibility (WCAG 2.1)
   - Cross-browser compatibility
   
3. Test automation strategy
   - Unit test coverage targets
   - E2E test scenarios
   - CI/CD integration

Risk assessment:
- Critical user paths
- Data integrity concerns
- Performance bottlenecks

請用繁體中文提供：
- 完整測試策略文件
- 優先級排序的測試案例
- 自動化測試實作建議
- 風險緩解計畫
```

## Chapter 4: Playwright 測試腳本

### 基礎測試腳本
```
Create Playwright tests for the TODO app:
- Test adding items
- Test marking complete
- Test deletion

請用繁體中文撰寫 Playwright 測試腳本。
```

### 專業測試腳本
```
Design comprehensive Playwright test suite following best practices.

Test architecture:
- Page Object Model implementation
- Fixture management
- Test data factories
- Custom assertions

Test scenarios:
1. User workflows (E2E)
2. Component isolation tests
3. API integration tests
4. Visual regression tests

Advanced patterns:
- Parallel execution strategy
- Retry mechanisms for flaky tests
- Test result reporting
- Performance metrics collection

Framework setup:
- TypeScript with strict mode
- ESLint and Prettier configuration
- Git hooks for pre-commit testing
- Docker containerization

請用繁體中文輸出：
1. 完整的 Page Object 架構
2. 測試套件實作
3. 測試資料管理策略
4. CI/CD 整合配置
5. 執行和維護指南
```

## Chapter 5: 除錯分析範例

### 簡單除錯
```
Debug this test failure:
Error: TimeoutError - waiting for selector
Think about possible causes.

請用中文說明問題原因和解決方案。
```

### 深度診斷
```
Perform root cause analysis as a debugging specialist.

Diagnostic approach:
1. Symptom analysis
   - Error messages and stack traces
   - Reproduction steps
   - Environment factors
   
2. Hypothesis formation
   - Timing issues
   - State management problems
   - Environmental differences
   
3. Investigation techniques
   - Trace file analysis
   - Network inspection
   - Console log examination
   
4. Solution design
   - Minimal fix approach
   - Regression prevention
   - Long-term improvements

Available data:
- Error: [error details]
- Trace: [trace information]
- Logs: [console output]
- Code: [relevant snippets]

請用繁體中文提供：
1. 詳細的問題診斷報告
2. 根本原因分析（含證據）
3. 修復方案與實作
4. 預防措施建議
5. 相關知識補充
```

## Chapter 6: 自動修復範例

### 基礎修復
```
Fix the identified bug in the TODO app.
The issue is with localStorage not saving properly.

請用中文提供修復程式碼。
```

### 智能自修復
```
Implement self-healing mechanisms as a reliability engineer.

Self-healing strategy:
1. Error detection and classification
2. Automated root cause analysis
3. Fix generation and validation
4. Rollback mechanisms
5. Learning from failures

Implementation approach:
- Minimal intervention principle
- Preserve system stability
- Maintain audit trail
- Progressive enhancement

Fix categories:
- Selector updates (DOM changes)
- Timing adjustments (async issues)
- Data validation (input errors)
- State recovery (corruption handling)

請用繁體中文提供：
1. 自修復架構設計
2. 實作程式碼範例
3. 修復策略決策樹
4. 監控和警報機制
5. 持續改進流程
```

## Chapter 7: 進階優化技巧

### 提示詞優化對比

#### 優化前（模糊）
```
幫我優化這個測試，讓它跑快一點。
```

#### 優化後（精確）
```
Optimize test performance focusing on:
1. Parallel execution opportunities
2. Shared setup/teardown optimization
3. Unnecessary wait elimination
4. Resource pooling (browser contexts)
5. Data preparation strategies

Measure and improve:
- Total execution time
- Resource utilization
- Flakiness rate
- Maintenance overhead

請用繁體中文提供優化方案，包含：
- 具體優化措施
- 預期效能提升
- 實作程式碼
- 效能測量方法
```

### 多模型協作範例
```
// 使用不同 AI 模型的專長
[Claude]
Analyze the application architecture and suggest improvements.

[GPT-4]
Review the code for security vulnerabilities.

[Gemini]
Optimize the performance and suggest caching strategies.

整合所有 AI 的建議，請用繁體中文提供：
1. 綜合改進方案
2. 優先級排序
3. 實施路線圖
4. 風險評估
```

## 最佳實踐總結

### 1. 結構化思考
```
Break down the problem:
- Requirement analysis
- Solution design
- Implementation approach
- Testing strategy
- Deployment plan

請用中文輸出每個階段的詳細內容。
```

### 2. 漸進式複雜度
```
Start simple:
Basic implementation → Add features → Optimize → Scale

請提供中文的漸進式開發指南。
```

### 3. 錯誤預防
```
Consider failure modes:
- Input validation
- Error boundaries
- Graceful degradation
- Recovery mechanisms

請用中文說明錯誤處理策略。
```

### 4. 知識遷移
```
Apply learned patterns:
- From TODO app to shopping cart
- From Playwright to Cypress
- From JavaScript to TypeScript

請用中文解釋如何應用所學知識。
```

## 練習建議

1. **對比練習**: 同一個需求，分別用純中文和雙語策略，比較輸出品質
2. **漸進練習**: 從簡單的雙語提示開始，逐步增加英文思考的比重
3. **領域練習**: 在不同技術領域（前端、後端、測試、DevOps）練習雙語提示
4. **協作練習**: 多人共同優化同一個提示詞，分享最佳版本

## 常見錯誤

### ❌ 錯誤：中英混雜無章法
```
請 create 一個 TODO app，要有 CRUD 功能，
使用 localStorage 來 persist data。
```

### ✅ 正確：清晰分離思考與輸出
```
[English thinking section]
Design a TODO app with CRUD operations and localStorage persistence.

[Chinese output instruction]
請用繁體中文提供完整實作。
```

## 進階技巧：Chain of Thought

```
Let me think through this step by step:

Step 1: Understand the requirements
- User needs a TODO application
- Must support CRUD operations
- Data persistence is required

Step 2: Design the architecture
- MVC pattern for separation of concerns
- Event-driven updates
- LocalStorage for persistence layer

Step 3: Plan the implementation
- Start with HTML structure
- Add CSS for responsive design
- Implement JavaScript functionality
- Add error handling

Based on this analysis, 請用繁體中文提供：
1. 完整的實作計畫
2. 程式碼實現
3. 測試方案
```

記住：**英文思考讓邏輯更清晰，中文輸出讓溝通更順暢！**