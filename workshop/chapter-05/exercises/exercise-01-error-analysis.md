# 練習 1：錯誤分析實戰

## 練習目標

學習使用 AI 進行系統化的錯誤分析，從錯誤訊息中提取關鍵資訊並生成解決方案。

## 背景說明

您的團隊正在測試一個電商網站，測試經常失敗但錯誤訊息不一致。您需要使用 AI 來分析這些錯誤並找出根本原因。

## 練習任務

### 任務 1：分析選擇器錯誤

給定以下錯誤日誌：

```
TimeoutError: waiting for selector "[data-testid="add-to-cart-btn"]" to be visible
  Timeout 30000ms exceeded.
  =========================== logs ===========================
  waiting for selector "[data-testid="add-to-cart-btn"]" to be visible
  ============================================================
    at ProductPage.addToCart (product.spec.js:45:10)
```

**要求**：
1. 使用 AI 分析可能的原因
2. 生成至少 3 種診斷方法
3. 提供修復建議

**AI 提示詞模板**：
```markdown
分析這個 Playwright 測試錯誤：

錯誤類型：TimeoutError
選擇器：[data-testid="add-to-cart-btn"]
超時時間：30000ms
失敗位置：ProductPage.addToCart

請提供：
1. 可能的失敗原因（至少 5 個）
2. 診斷步驟
3. 修復代碼示例
4. 預防措施
```

### 任務 2：診斷間歇性失敗

**場景描述**：
```javascript
test('搜尋功能測試', async ({ page }) => {
    await page.goto('/search');
    await page.fill('#search-input', 'laptop');
    await page.click('#search-button');
    
    // 這行有時成功，有時失敗
    const results = await page.locator('.search-result').count();
    expect(results).toBeGreaterThan(0);
});
```

**失敗統計**：
- 成功率：70%
- 平均執行時間：3.5 秒
- 失敗時執行時間：0.5 秒

**要求**：
1. 分析為什麼測試間歇性失敗
2. 設計診斷策略
3. 提供穩定化方案

### 任務 3：解析複雜錯誤堆疊

**錯誤堆疊**：
```
Error: Execution context was destroyed, most likely because of a navigation
    at ExecutionContext._evaluateInternal (node_modules/playwright/lib/server/frames.js:1234:15)
    at ExecutionContext.evaluate (node_modules/playwright/lib/server/frames.js:1111:10)
    at Frame.evaluate (node_modules/playwright/lib/server/frames.js:567:20)
    at CheckoutFlow.completeOrder (checkout.spec.js:89:15)
    
Previous action:
  page.click('#submit-order')
```

**要求**：
1. 解釋錯誤含義
2. 識別問題發生的時機
3. 提供完整的修復方案

## 實作練習

### 步驟 1：建立錯誤收集器

創建 `error-collector.js`：

```javascript
class ErrorCollector {
    constructor() {
        this.errors = [];
    }
    
    async collectError(error, context) {
        const errorData = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context: context,
            // TODO: 添加更多診斷資訊
        };
        
        this.errors.push(errorData);
        return errorData;
    }
    
    async analyzeWithAI(errorData) {
        // TODO: 實作 AI 分析
        const prompt = this.generateAnalysisPrompt(errorData);
        // 呼叫 AI API
    }
    
    generateAnalysisPrompt(errorData) {
        // TODO: 生成分析提示詞
    }
}
```

### 步驟 2：實作診斷工具

創建 `diagnostic-tool.js`：

```javascript
class DiagnosticTool {
    async diagnose(page, error) {
        const diagnostics = {
            error: error,
            pageInfo: await this.collectPageInfo(page),
            networkInfo: await this.collectNetworkInfo(page),
            consoleErrors: await this.collectConsoleErrors(page),
            screenshot: await this.takeScreenshot(page)
        };
        
        return diagnostics;
    }
    
    async collectPageInfo(page) {
        // TODO: 收集頁面資訊
    }
    
    async collectNetworkInfo(page) {
        // TODO: 收集網路請求資訊
    }
    
    // ... 其他方法
}
```

### 步驟 3：整合 AI 分析

```javascript
async function analyzeTestFailure(error, diagnostics) {
    const analysisPrompt = `
    測試失敗分析請求：
    
    錯誤訊息：${error.message}
    頁面 URL：${diagnostics.pageInfo.url}
    失敗操作：${diagnostics.lastAction}
    網路錯誤：${diagnostics.networkInfo.failures}
    控制台錯誤：${diagnostics.consoleErrors}
    
    請分析：
    1. 根本原因
    2. 修復方案
    3. 程式碼改進建議
    `;
    
    // 呼叫 AI API 進行分析
    const analysis = await callAI(analysisPrompt);
    return analysis;
}
```

## 挑戰任務

### 進階挑戰 1：自動錯誤分類

建立一個系統，能夠自動將錯誤分類為：
- 選擇器問題
- 時序問題
- 網路問題
- 資料問題
- 環境問題

### 進階挑戰 2：錯誤模式學習

實作一個機制，記錄並學習錯誤模式：
```javascript
class ErrorPatternLearner {
    constructor() {
        this.patterns = new Map();
    }
    
    async learnFromError(error, solution) {
        // 記錄錯誤和解決方案的關聯
    }
    
    async suggestSolution(error) {
        // 基於歷史記錄建議解決方案
    }
}
```

### 進階挑戰 3：預測性診斷

開發預測性診斷功能：
```javascript
class PredictiveDiagnostics {
    async analyzeTestHealth(testHistory) {
        // 分析測試歷史
        // 預測可能的問題
        // 提供預防建議
    }
}
```

## 評估標準

### 基礎要求（60分）
- [ ] 完成所有基本任務
- [ ] 錯誤收集器能正常運作
- [ ] AI 提示詞設計合理

### 進階要求（30分）
- [ ] 實作至少一個挑戰任務
- [ ] 診斷工具功能完整
- [ ] 能生成有價值的分析報告

### 卓越要求（10分）
- [ ] 創新的錯誤分析方法
- [ ] 高效的診斷流程
- [ ] 可重用的工具元件

## 提交要求

1. 提交完整的程式碼實作
2. 包含測試錯誤的分析報告
3. AI 互動的對話記錄
4. 學習心得（至少 200 字）

## 參考資源

- [Playwright 錯誤處理文檔](https://playwright.dev/docs/test-retry)
- [調試最佳實踐](https://playwright.dev/docs/debug)
- 本章節提供的錯誤場景範例

## 學習提示

💡 **提示 1**：好的錯誤分析始於完整的資訊收集。

💡 **提示 2**：不要只關注錯誤訊息本身，也要考慮執行環境和上下文。

💡 **提示 3**：使用 AI 時，提供越多上下文，得到的分析越準確。

---

完成這個練習後，您將掌握使用 AI 進行智能錯誤診斷的核心技能！