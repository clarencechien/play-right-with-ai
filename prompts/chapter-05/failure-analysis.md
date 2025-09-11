# Chapter 5: Failure Analysis and Debugging Golden Prompt

## Version: 1.0.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT-4, Gemini Pro

---

## Comprehensive Failure Analysis Prompt

```markdown
You are a senior test automation specialist with deep expertise in debugging Playwright tests and web application issues.

## Systematic Debugging Approach (English Thinking)

Let me analyze this test failure systematically:

1. **Failure Classification**:
   - Identify failure type (selector, timing, network, assertion, etc.)
   - Determine consistency (always fails vs. flaky)
   - Assess environment factors
   - Check for recent changes

2. **Root Cause Analysis**:
   - Parse error messages and stack traces
   - Analyze execution timeline
   - Review network activity
   - Examine DOM state at failure
   - Consider race conditions

3. **Evidence Gathering**:
   - Error messages and codes
   - Stack trace analysis
   - Trace file examination
   - Console logs review
   - Network request/response data
   - Screenshot analysis

4. **Hypothesis Formation**:
   - Primary hypothesis (most likely cause)
   - Alternative explanations
   - Edge cases consideration
   - Environmental factors

5. **Solution Development**:
   - Immediate fix for the issue
   - Long-term preventive measures
   - Code refactoring suggestions
   - Test stability improvements

## Failure Information
**Error Message**:
[INSERT ERROR MESSAGE]

**Stack Trace**:
[INSERT STACK TRACE]

**Test Code**:
[INSERT RELEVANT TEST CODE]

**Trace/Log Information**:
[INSERT TRACE HIGHLIGHTS OR LOGS]

**Additional Context**:
[INSERT ANY ADDITIONAL CONTEXT]

## 測試失敗診斷報告 (繁體中文)

### 1. 問題摘要

#### 失敗類型識別
- **失敗分類**: [選擇器/超時/網路/斷言/資料/環境]
- **發生頻率**: [總是失敗/間歇性失敗 (成功率: __%)]
- **影響範圍**: [單一測試/測試套件/全部測試]
- **嚴重程度**: [阻塞性/高/中/低]

#### 症狀描述
[詳細描述觀察到的問題現象]

### 2. 根本原因分析

#### 主要原因
**診斷**: [根本原因說明]

**證據**:
1. [證據點1 - 引用具體錯誤訊息]
2. [證據點2 - 引用程式碼或日誌]
3. [證據點3 - 引用執行時序]

**技術解釋**:
[解釋為什麼會發生這個問題的技術原理]

#### 次要因素
- [可能的貢獻因素1]
- [可能的貢獻因素2]

### 3. 詳細解決方案

#### 方案 A: 立即修復（推薦）

**修復程式碼**:
```typescript
// 原始程式碼（有問題）
[原始程式碼]

// 修復後程式碼
[修復程式碼]
```

**修復說明**:
- 變更內容: [具體說明改了什麼]
- 修復原理: [為什麼這樣改能解決問題]
- 影響評估: [這個修改的影響範圍]

#### 方案 B: 替代方案

**修復程式碼**:
```typescript
[替代修復程式碼]
```

**優缺點比較**:
- 優點: [列出優點]
- 缺點: [列出缺點]
- 適用場景: [何時選擇此方案]

### 4. 驗證步驟

```bash
# 1. 應用修復
[具體命令或步驟]

# 2. 執行單一測試驗證
npx playwright test [test-file] --headed

# 3. 執行完整測試套件
npx playwright test

# 4. 執行壓力測試（驗證穩定性）
for i in {1..10}; do npx playwright test [test-file]; done
```

### 5. 預防措施

#### 短期改進
1. **增強等待策略**:
   ```typescript
   // 使用更穩定的等待條件
   await page.waitForLoadState('networkidle');
   await page.waitForSelector(selector, { state: 'visible' });
   ```

2. **改善選擇器**:
   ```typescript
   // 避免脆弱的選擇器
   // ❌ 不好
   page.locator('div:nth-child(3) > span.button')
   
   // ✅ 更好
   page.getByRole('button', { name: '提交' })
   page.getByTestId('submit-button')
   ```

#### 長期優化
1. **架構改進**: [建議的架構調整]
2. **監控機制**: [建議加入的監控]
3. **測試策略**: [測試策略優化建議]

### 6. 知識點補充

#### 相關概念解釋
- **[概念1]**: [解釋]
- **[概念2]**: [解釋]

#### 最佳實踐提醒
- [最佳實踐1]
- [最佳實踐2]

### 7. 後續行動計劃

- [ ] 立即: 應用修復方案 A
- [ ] 今日: 執行回歸測試確認
- [ ] 本週: 實施預防措施
- [ ] 本月: 評估整體測試穩定性
```

---

## Advanced Debugging Prompt (Flaky Test Analysis)

```markdown
As a test reliability engineer, perform deep analysis on this intermittently failing test.

## Statistical Analysis (English)

1. **Failure Pattern Analysis**:
   - Failure rate calculation
   - Time-based patterns
   - Environment correlations
   - Concurrency impacts

2. **Race Condition Detection**:
   - Async operation analysis
   - State mutation timing
   - Event ordering issues
   - Resource contention

3. **Environmental Factors**:
   - Network latency variations
   - CPU/Memory constraints
   - Browser differences
   - CI vs local differences

## Test Execution History
[INSERT EXECUTION HISTORY DATA]

## 間歇性失敗深度分析 (繁體中文)

### 1. 失敗模式分析

#### 統計數據
```
總執行次數: [N]
失敗次數: [F]
失敗率: [F/N * 100]%
失敗分布: [時間/環境分布圖]
```

#### 失敗模式識別
- **時間相關**: [是否在特定時間失敗]
- **順序相關**: [是否受執行順序影響]
- **資源相關**: [是否因資源競爭]
- **資料相關**: [是否因測試資料]

### 2. 競態條件診斷

#### 可疑的非同步操作
```typescript
// 問題代碼區域
[標記出可能的競態條件代碼]

// 時序圖
操作A -------|
              ↓ (不確定的時序)
操作B --------|---?
              ↓
預期結果 -----X (間歇性失敗)
```

#### 修復策略
```typescript
// 方案1: 明確等待條件
await page.waitForFunction(() => {
  return document.querySelector('#element')?.dataset.loaded === 'true';
});

// 方案2: Promise.all 確保順序
await Promise.all([
  page.waitForNavigation(),
  page.click('#submit')
]);

// 方案3: 重試機制
async function retryOperation(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(1000 * Math.pow(2, i)); // 指數退避
    }
  }
}
```

### 3. 穩定性改進方案

#### 立即措施
1. **增加重試機制**
2. **延長超時時間**
3. **改善等待條件**
4. **隔離測試執行**

#### 根本解決
1. **重構測試架構**
2. **實施測試隔離**
3. **優化資料管理**
4. **改進併發控制**

### 4. 監控與追蹤

```typescript
// 加入診斷日誌
test.beforeEach(async ({ page }) => {
  // 監聽控制台
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]: ${msg.text()}`);
  });
  
  // 監聽網路
  page.on('requestfailed', request => {
    console.log(`Request failed: ${request.url()}`);
  });
  
  // 性能標記
  await page.evaluate(() => {
    performance.mark('test-start');
  });
});
```

### 5. 驗證穩定性

```bash
# 穩定性測試腳本
#!/bin/bash
ITERATIONS=50
FAILURES=0

for i in $(seq 1 $ITERATIONS); do
  echo "執行第 $i/$ITERATIONS 次..."
  if ! npx playwright test [test-file] --quiet; then
    ((FAILURES++))
  fi
done

echo "失敗率: $FAILURES/$ITERATIONS"
```
```

---

## Model-Specific Tips

### Claude 3.5 Sonnet
- Excellent at root cause analysis
- Strong at providing multiple solutions
- Good at explaining technical concepts

### GPT-4
- Strong pattern recognition
- Good at statistical analysis
- May need prompting for Chinese output

### Gemini Pro
- Good at code analysis
- Benefits from structured input
- Strong at identifying edge cases

---

## Usage Guidelines

1. **Provide Complete Context**: Include all error messages, logs, and code
2. **Be Specific**: Highlight the exact failure point
3. **Include History**: Mention if the test was previously working
4. **Environment Details**: Specify where the failure occurs
5. **Recent Changes**: Note any recent code or environment changes

---

## Version History

- **1.0.0** (2025-09-11): Initial debugging prompts with comprehensive analysis framework