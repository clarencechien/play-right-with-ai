# Chapter 6: Self-Repair Implementation Golden Prompt

## Version: 1.1.0
## Last Updated: 2025-09-11
## Tested Models: Claude 3.5 Sonnet, GPT, Gemini Pro

---

## Automated Self-Repair Prompt

```markdown
You are a senior software reliability engineer specializing in automated test repair and self-healing systems.

## Technical Specification (Think in English)

### Self-Repair Architecture

1. **Impact Assessment Framework**:
   ```
   Risk matrix:
   ┌─────────────┬───────────┬───────────┐
   │ Component   │ Risk Level│ Action    │
   ├─────────────┼───────────┼───────────┤
   │ Test Code   │ Low       │ Auto-fix  │
   │ Page Object │ Medium    │ Review    │
   │ Core Logic  │ High      │ Manual    │
   │ Framework   │ Critical  │ Escalate  │
   └─────────────┴───────────┴───────────┘
   
   Complexity scoring:
   - Lines changed: 1-10 (Low), 11-50 (Medium), 50+ (High)
   - Files affected: 1 (Low), 2-3 (Medium), 4+ (High)
   - Dependencies: 0 (Low), 1-2 (Medium), 3+ (High)
   ```

2. **Repair Strategy Patterns**:
   ```
   Pattern catalog:
   1. Selector Repair
      - Try alternative selectors
      - Use parent/child navigation
      - Implement fuzzy matching
   
   2. Timing Repair
      - Increase timeouts progressively
      - Add explicit waits
      - Implement retry mechanisms
   
   3. Data Repair
      - Refresh test data
      - Clear cache/storage
      - Reset application state
   
   4. Environment Repair
      - Restart services
      - Clear temporary files
      - Reinitialize connections
   ```

3. **Code Modification Rules**:
   ```
   Principles:
   - Minimal change principle (smallest fix that works)
   - Preservation rule (keep existing functionality)
   - Consistency requirement (match code style)
   - Compatibility constraint (no breaking changes)
   
   Constraints:
   - Max lines changed per fix: 50
   - Max files modified: 3
   - Preserve test coverage: >= original
   - Performance impact: < 5% degradation
   ```

4. **Validation Protocol**:
   ```
   Validation stages:
   1. Syntax validation (compile/lint)
   2. Unit test execution (isolated)
   3. Integration testing (connected)
   4. Regression suite (full coverage)
   5. Performance benchmarking
   6. Security scanning
   
   Success criteria:
   - All modified tests pass
   - No new failures introduced
   - Performance within tolerance
   - Security posture maintained
   ```

5. **Prevention Framework**:
   ```
   Preventive measures:
   ├── Defensive Coding
   │   ├── Input validation
   │   ├── Error boundaries
   │   └── Fallback strategies
   ├── Monitoring Enhancement
   │   ├── Health checks
   │   ├── Performance metrics
   │   └── Anomaly detection
   └── Knowledge Capture
       ├── Pattern documentation
       ├── Runbook updates
       └── Team training
   ```

## Diagnostic Results
[INSERT DIAGNOSTIC ANALYSIS FROM CHAPTER 5]

## Current Code
[INSERT CURRENT FAILING CODE]

## 輸出要求 (Output in Chinese)

### 自動修復實施方案

Based on the technical specification above, provide a comprehensive self-repair implementation in Traditional Chinese with the following requirements:

1. Clear repair strategy with risk assessment
2. Step-by-step code modifications with explanations
3. Validation procedures and success criteria
4. Prevention measures for future occurrences
5. Knowledge documentation for team learning

### 1. 修復策略概述

#### 問題摘要
- **失敗類型**: [類型]
- **根本原因**: [原因]
- **影響範圍**: [範圍]
- **修復優先級**: [高/中/低]

#### 修復方針
- **最小改動原則**: 只修改必要的部分
- **向後相容**: 確保現有功能不受影響
- **防禦性編程**: 加入預防措施
- **可追溯性**: 完整記錄修改內容

### 2. 程式碼修復實施

#### 修復 1: [主要問題修復]

**原始程式碼** (`[檔案路徑]`):
```typescript
// 有問題的程式碼
[原始程式碼區塊]
```

**修復後程式碼**:
```typescript
// 修復後的程式碼，包含詳細註解
[修復程式碼區塊]

// 修復說明：
// 1. [改動點1說明]
// 2. [改動點2說明]
// 3. [預防措施說明]
```

**修復原理**:
- 問題本質: [技術解釋]
- 修復方法: [解決方案說明]
- 效果預期: [預期改善]

#### 修復 2: [測試穩定性改進]

**增強的測試程式碼**:
```typescript
// tests/[test-file].spec.ts

import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/helpers';

test.describe('穩定性增強測試套件', () => {
  // 增加重試機制
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    // 改進的前置設定
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // 確保應用程式完全載入
    await page.waitForFunction(() => {
      return document.readyState === 'complete' && 
             window.appInitialized === true;
    }, { timeout: 10000 });
    
    // 清理可能的干擾狀態
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('修復後的測試案例', async ({ page }) => {
    // 使用更穩定的選擇器策略
    const button = page.getByRole('button', { name: '提交' });
    
    // 智慧等待策略
    await button.waitFor({ state: 'visible' });
    await expect(button).toBeEnabled();
    
    // 使用 Promise.all 處理並發操作
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/submit')),
      button.click()
    ]);
    
    // 驗證回應
    expect(response.status()).toBe(200);
    
    // 使用更可靠的斷言
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible({ timeout: 5000 });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // 失敗時收集診斷資訊
    if (testInfo.status !== 'passed') {
      await TestHelpers.collectDiagnostics(page, testInfo);
    }
  });
});
```

#### 修復 3: [Page Object 改進]

**增強的 Page Object**:
```typescript
// pages/enhanced.page.ts

export class EnhancedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 智慧點擊with重試和錯誤處理
   */
  async smartClick(
    selector: string | Locator,
    options?: { retries?: number; delay?: number }
  ): Promise<void> {
    const { retries = 3, delay = 1000 } = options || {};
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const element = typeof selector === 'string' 
          ? this.page.locator(selector)
          : selector;
        
        // 確保元素可互動
        await element.waitFor({ state: 'visible' });
        await element.scrollIntoViewIfNeeded();
        
        // 檢查是否被遮擋
        const isClickable = await element.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const point = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
          const topElement = document.elementFromPoint(point.x, point.y);
          return el.contains(topElement);
        });
        
        if (!isClickable) {
          throw new Error('Element is covered by another element');
        }
        
        await element.click();
        return; // 成功則返回
        
      } catch (error) {
        console.log(`Attempt ${attempt}/${retries} failed: ${error.message}`);
        
        if (attempt === retries) {
          throw new Error(`Failed to click after ${retries} attempts: ${error.message}`);
        }
        
        await this.page.waitForTimeout(delay * attempt); // 指數退避
      }
    }
  }

  /**
   * 安全填寫表單
   */
  async safeFill(
    selector: string | Locator,
    value: string
  ): Promise<void> {
    const element = typeof selector === 'string'
      ? this.page.locator(selector)
      : selector;
    
    await element.waitFor({ state: 'visible' });
    await element.clear();
    await element.fill(value);
    
    // 驗證值已正確填入
    const actualValue = await element.inputValue();
    if (actualValue !== value) {
      throw new Error(`Failed to set value. Expected: ${value}, Got: ${actualValue}`);
    }
  }
}
```

### 3. 配置優化

**playwright.config.ts 更新**:
```typescript
export default defineConfig({
  // 增加全局超時時間
  timeout: 45000,
  
  expect: {
    // 增加斷言超時
    timeout: 10000
  },
  
  use: {
    // 改進的預設配置
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // 更好的錯誤追蹤
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 網路重試
    extraHTTPHeaders: {
      'X-Test-Retry': 'true'
    }
  },
  
  // 智慧重試策略
  retries: process.env.CI ? 2 : 1,
  
  // 優化的工作器配置
  workers: process.env.CI ? 2 : undefined,
  
  // 更詳細的報告
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
    ['list']
  ]
});
```

### 4. 輔助工具函數

**utils/repair-helpers.ts**:
```typescript
export class RepairHelpers {
  /**
   * 自動修復選擇器
   */
  static async findAlternativeSelector(
    page: Page,
    brokenSelector: string,
    expectedText?: string
  ): Promise<string> {
    // 嘗試多種選擇器策略
    const strategies = [
      // 策略1: 通過文字內容
      expectedText ? `text="${expectedText}"` : null,
      // 策略2: 通過 role
      `[role="button"]:has-text("${expectedText}")`,
      // 策略3: 通過相近的 class
      brokenSelector.replace(/\d+/g, ''),
      // 策略4: 通過父元素
      `:has(${brokenSelector})`
    ].filter(Boolean);
    
    for (const selector of strategies) {
      try {
        const element = page.locator(selector);
        if (await element.count() === 1) {
          console.log(`Found alternative selector: ${selector}`);
          return selector;
        }
      } catch {
        continue;
      }
    }
    
    throw new Error('No alternative selector found');
  }

  /**
   * 網路請求監控
   */
  static async monitorNetworkStability(
    page: Page,
    callback: () => Promise<void>
  ): Promise<void> {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await callback();
    
    if (failedRequests.length > 0) {
      console.warn('Failed requests detected:', failedRequests);
      // 可以選擇重試或報告問題
    }
  }

  /**
   * 效能監控
   */
  static async measurePerformance(
    page: Page,
    operation: () => Promise<void>
  ): Promise<number> {
    const startTime = Date.now();
    
    await page.evaluate(() => performance.mark('operation-start'));
    await operation();
    await page.evaluate(() => performance.mark('operation-end'));
    
    const duration = Date.now() - startTime;
    
    const metrics = await page.evaluate(() => {
      performance.measure('operation', 'operation-start', 'operation-end');
      const measure = performance.getEntriesByName('operation')[0];
      return measure ? measure.duration : null;
    });
    
    console.log(`Operation took ${duration}ms (browser: ${metrics}ms)`);
    return duration;
  }
}
```

### 5. 驗證腳本

```bash
#!/bin/bash
# verify-repair.sh

echo "開始驗證修復..."

# 1. 執行單一測試確認修復
echo "步驟 1: 驗證特定測試..."
npx playwright test [repaired-test-file] --reporter=list

if [ $? -ne 0 ]; then
  echo "❌ 修復驗證失敗"
  exit 1
fi

# 2. 執行相關測試套件
echo "步驟 2: 執行迴歸測試..."
npx playwright test --grep "@smoke" --reporter=list

if [ $? -ne 0 ]; then
  echo "⚠️ 迴歸測試發現問題"
  exit 1
fi

# 3. 執行完整測試（可選）
if [ "$1" == "--full" ]; then
  echo "步驟 3: 執行完整測試套件..."
  npx playwright test --reporter=json
fi

echo "✅ 修復驗證成功！"

# 生成報告
npx playwright show-report
```

### 6. 預防措施實施

#### 監控與警報
```typescript
// monitoring/test-health.ts
export class TestHealthMonitor {
  private static failureHistory: Map<string, number[]> = new Map();
  
  static recordTestResult(testName: string, passed: boolean): void {
    if (!this.failureHistory.has(testName)) {
      this.failureHistory.set(testName, []);
    }
    
    const history = this.failureHistory.get(testName)!;
    history.push(passed ? 1 : 0);
    
    // 保留最近 10 次執行記錄
    if (history.length > 10) {
      history.shift();
    }
    
    // 計算成功率
    const successRate = history.reduce((a, b) => a + b, 0) / history.length;
    
    // 如果成功率低於閾值，發出警報
    if (successRate < 0.8) {
      console.warn(`⚠️ Test "${testName}" is flaky! Success rate: ${successRate * 100}%`);
      // 可以整合通知系統
    }
  }
}
```

### 7. 知識庫更新

將此次修復經驗加入團隊知識庫：

```markdown
## 修復模式 #[ID]

**問題類型**: [分類]
**症狀**: [描述]
**根本原因**: [原因]
**解決方案**: [方案]
**預防措施**: [措施]

### 可重用程式碼片段
[程式碼]

### 檢查清單
- [ ] [檢查項1]
- [ ] [檢查項2]

### 相關問題
- [連結到類似問題]
```

### 8. 持續改進計劃

- **短期** (1週內):
  - 監控修復效果
  - 收集效能數據
  - 調整重試策略

- **中期** (1個月內):
  - 評估測試穩定性
  - 優化等待策略
  - 更新測試文檔

- **長期** (3個月內):
  - 實施自動修復機制
  - 建立問題預測模型
  - 完善知識庫系統
```

---

## Example / 範例

### English Thinking Process:
```
"The diagnostic shows a selector timeout issue. 
Risk assessment: Low risk - only test code affected.
Repair strategy: Implement smart selector with fallback.
Validation: Run affected test 10 times for stability.
Prevention: Add selector validation to code review."
```

### Chinese Output (繁體中文實施):
```markdown
### 修復策略

**風險評估**: 低風險 - 僅影響測試程式碼
**修復方法**: 實作智慧選擇器含備援機制

**程式碼修正**:
```typescript
// 原始程式碼 - 單一選擇器策略
const button = page.locator('.submit-btn');
await button.click();

// 修復後 - 智慧選擇器含備援
const button = await this.smartLocator(page, [
  '.submit-btn',                          // 優先使用 class
  'button[type="submit"]',                // 備援 1: 屬性選擇器
  page.getByRole('button', { name: '提交' }) // 備援 2: 角色選擇器
]);
await button.click();

// 智慧選擇器實作
private async smartLocator(page: Page, selectors: Array<string | Locator>) {
  for (const selector of selectors) {
    try {
      const element = typeof selector === 'string' 
        ? page.locator(selector) 
        : selector;
      if (await element.count() > 0) {
        return element;
      }
    } catch {
      continue;
    }
  }
  throw new Error('無法找到元素: ' + selectors.join(', '));
}
```

**驗證程序**:
```bash
# 穩定性測試 - 執行 10 次
for i in {1..10}; do
  echo "執行第 $i 次測試..."
  npx playwright test affected-test.spec.ts
done
```

**預防措施**:
1. 將選擇器驗證加入程式碼審查清單
2. 建立選擇器最佳實踐文件
3. 實作自動選擇器健康檢查
```

---

## Model-Specific Notes

### Claude 3.5 Sonnet
- Excellent at comprehensive fixes
- Strong at explaining repair rationale
- Good at preventive measures

### GPT
- Strong at code generation
- Good at pattern recognition
- May need Chinese output reminder

### Gemini Pro
- Good at optimization
- Strong at performance improvements
- Benefits from structured format

---

## Version History

- **1.0.0** (2025-09-11): Initial self-repair prompt with comprehensive automation