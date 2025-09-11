# 練習 1：實作自我修復測試系統

## 練習目標

建立一個完整的自我修復測試系統，能夠自動檢測、診斷並修復測試失敗。

## 背景說明

您的團隊維護著一個大型測試套件，經常因為應用程式的小改動而導致測試失敗。您需要建立一個智能系統，能夠自動適應這些變化。

## 練習任務

### 任務 1：建立自我修復框架

創建一個基礎的自我修復測試框架：

```javascript
// self-healing-framework.js
class SelfHealingTest {
    constructor(options = {}) {
        this.healingEnabled = options.healingEnabled ?? true;
        this.maxHealingAttempts = options.maxHealingAttempts || 3;
        this.healingStrategies = [];
        this.healingLog = [];
    }
    
    async run(testFn, context) {
        // TODO: 實作測試執行邏輯
        // 1. 執行測試
        // 2. 捕獲錯誤
        // 3. 應用修復
        // 4. 重試測試
    }
    
    addHealingStrategy(strategy) {
        // TODO: 添加修復策略
    }
    
    async diagnose(error) {
        // TODO: 診斷錯誤並選擇修復策略
    }
    
    async heal(error, context) {
        // TODO: 應用修復
    }
}
```

**要求**：
1. 實作完整的錯誤捕獲機制
2. 支援多種修復策略
3. 記錄修復歷史
4. 生成修復報告

### 任務 2：實作選擇器自動修復

建立智能選擇器修復機制：

```javascript
class SelectorHealer {
    async healSelector(page, failedSelector, options = {}) {
        console.log(`修復選擇器: ${failedSelector}`);
        
        // TODO: 實作選擇器修復邏輯
        // 1. 分析選擇器失敗原因
        // 2. 生成替代選擇器
        // 3. 驗證新選擇器
        // 4. 更新測試代碼
        
        return newSelector;
    }
    
    async findAlternatives(page, originalSelector) {
        // TODO: 生成替代選擇器列表
    }
    
    async validateSelector(page, selector) {
        // TODO: 驗證選擇器有效性
    }
}
```

**要求**：
1. 支援多種選擇器類型（CSS、XPath、文字）
2. 智能推薦最穩定的選擇器
3. 自動更新測試文件

### 任務 3：建立智能重試機制

實作自適應的重試策略：

```javascript
class AdaptiveRetry {
    constructor() {
        this.retryHistory = new Map();
        this.successPatterns = new Map();
    }
    
    async retryWithLearning(testFn, testId) {
        // TODO: 實作學習型重試
        // 1. 檢查歷史成功模式
        // 2. 應用成功的策略
        // 3. 記錄新的成功模式
        // 4. 優化未來執行
    }
    
    learnFromSuccess(testId, context) {
        // TODO: 從成功執行中學習
    }
    
    predictOptimalStrategy(testId) {
        // TODO: 預測最佳策略
    }
}
```

### 任務 4：整合 AI 診斷

將 AI 診斷整合到自我修復流程：

```javascript
class AIHealingAssistant {
    async diagnoseWithAI(error, pageContext) {
        const prompt = this.generateDiagnosticPrompt(error, pageContext);
        
        // TODO: 呼叫 AI API
        // TODO: 解析 AI 回應
        // TODO: 生成修復方案
        
        return {
            diagnosis: '',
            fixCode: '',
            confidence: 0
        };
    }
    
    generateDiagnosticPrompt(error, context) {
        // TODO: 生成 AI 診斷提示詞
    }
    
    async applyAIFix(fixCode, testFile) {
        // TODO: 應用 AI 生成的修復
    }
}
```

## 實作練習

### 步驟 1：建立測試場景

創建一個容易失敗的測試場景：

```javascript
// fragile-test.js
test('購物車功能測試', async ({ page }) => {
    await page.goto('/shop');
    
    // 這些選擇器容易失效
    await page.click('#add-to-cart-btn');  // ID 可能改變
    await page.click('.checkout');         // Class 可能改變
    await page.fill('input[name="email"]', 'test@test.com');
    
    // 斷言容易失敗
    const total = await page.textContent('.total-price');
    expect(total).toBe('$99.99');  // 價格可能變動
});
```

### 步驟 2：實作修復策略

```javascript
// healing-strategies.js
class HealingStrategies {
    static selectorStrategies = [
        {
            name: 'useDataTestId',
            apply: (selector) => {
                // 轉換為 data-testid
                return `[data-testid="${selector.replace(/[#.]/g, '')}"]`;
            }
        },
        {
            name: 'useText',
            apply: (selector, text) => {
                // 使用文字定位
                return `text="${text}"`;
            }
        },
        {
            name: 'useNearby',
            apply: (selector, nearbyText) => {
                // 使用相對定位
                return `text="${nearbyText}" >> ${selector}`;
            }
        }
    ];
    
    static timingStrategies = [
        {
            name: 'increaseTimeout',
            apply: (options) => {
                return { ...options, timeout: options.timeout * 2 };
            }
        },
        {
            name: 'waitForStable',
            apply: async (page) => {
                await page.waitForLoadState('networkidle');
            }
        }
    ];
}
```

### 步驟 3：建立修復報告

```javascript
class HealingReporter {
    generateReport(healingLog) {
        const report = {
            summary: {
                totalHealing: healingLog.length,
                successful: healingLog.filter(h => h.success).length,
                failed: healingLog.filter(h => !h.success).length
            },
            details: healingLog,
            recommendations: this.generateRecommendations(healingLog)
        };
        
        return report;
    }
    
    generateRecommendations(healingLog) {
        // TODO: 基於修復歷史生成建議
    }
}
```

## 挑戰任務

### 進階挑戰 1：預測性修復

實作預測性修復系統：

```javascript
class PredictiveHealing {
    async predictFailures(testSuite, recentChanges) {
        // 分析最近的代碼變更
        // 預測可能受影響的測試
        // 預先生成修復方案
    }
}
```

### 進階挑戰 2：自動代碼更新

實作自動更新測試代碼：

```javascript
class TestCodeUpdater {
    async updateTestFile(filePath, fixes) {
        // 解析測試文件
        // 應用修復
        // 保存更新
        // 創建 Git commit
    }
}
```

### 進階挑戰 3：修復知識庫

建立共享的修復知識庫：

```javascript
class HealingKnowledgeBase {
    async shareKnowledge(fix) {
        // 將成功的修復分享到團隊知識庫
    }
    
    async learnFromTeam() {
        // 從團隊的修復經驗中學習
    }
}
```

## 評估標準

### 基礎要求（60分）
- [ ] 完成基本的自我修復框架
- [ ] 實作至少 3 種修復策略
- [ ] 能夠自動重試失敗的測試
- [ ] 生成修復報告

### 進階要求（30分）
- [ ] 整合 AI 診斷功能
- [ ] 實作學習型重試機制
- [ ] 支援自動更新測試代碼
- [ ] 建立修復知識庫

### 卓越要求（10分）
- [ ] 實作預測性修復
- [ ] 優化修復效率（< 5秒）
- [ ] 創新的修復策略
- [ ] 完整的測試覆蓋

## 測試您的實作

使用以下腳本測試您的自我修復系統：

```javascript
// test-self-healing.js
const { SelfHealingTest } = require('./self-healing-framework');

async function runTest() {
    const healer = new SelfHealingTest({
        healingEnabled: true,
        maxHealingAttempts: 3
    });
    
    // 添加修復策略
    healer.addHealingStrategy(new SelectorHealer());
    healer.addHealingStrategy(new TimingHealer());
    
    // 執行容易失敗的測試
    const result = await healer.run(async (context) => {
        const { page } = context;
        await page.goto('/test-app');
        await page.click('#dynamic-button'); // 可能失敗
        // ... 更多測試步驟
    });
    
    // 生成報告
    const report = healer.generateReport();
    console.log(report);
}

runTest();
```

## 提交要求

1. 完整的自我修復框架實作
2. 至少 3 個修復策略的實作
3. 測試執行日誌和修復報告
4. 實作說明文檔（包含架構設計）
5. 學習心得（至少 300 字）

## 參考資源

- [Playwright 自動等待機制](https://playwright.dev/docs/actionability)
- [測試重試最佳實踐](https://playwright.dev/docs/test-retries)
- 本章節提供的範例代碼

## 學習提示

💡 **提示 1**：自我修復的關鍵是準確的錯誤診斷。

💡 **提示 2**：不是所有錯誤都應該自動修復，要識別真正的應用問題。

💡 **提示 3**：修復策略應該從簡單到複雜逐步嘗試。

💡 **提示 4**：記錄和學習是持續改進的關鍵。

---

完成這個練習後，您將掌握建立智能、自適應測試系統的核心技能！