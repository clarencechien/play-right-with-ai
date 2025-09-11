# 練習 2：智能重試模式實作

## 學習目標
- 掌握各種重試策略的設計與實作
- 學習指數退避演算法的應用
- 實作條件式重試和智能判斷機制
- 整合 AI 輔助的自適應重試策略

## 背景說明

在自動化測試中，暫時性失敗是常見問題。網路延遲、服務繁忙、資源競爭等因素都可能導致測試偶爾失敗。智能重試機制能夠：

1. **提高測試穩定性**
   - 自動處理暫時性故障
   - 減少假陽性失敗
   - 提升整體通過率

2. **優化執行效率**
   - 避免不必要的重試
   - 動態調整等待時間
   - 快速失敗機制

## 實作步驟

### 步驟 1：基礎重試模式

```javascript
// 簡單重試機制
async function simpleRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`嘗試 ${i + 1}/${maxRetries} 失敗: ${error.message}`);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw lastError;
}

// 使用範例
test('使用簡單重試', async ({ page }) => {
  await simpleRetry(async () => {
    await page.goto('http://localhost:3000/unstable-page');
    await page.click('#submit-button');
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

### 步驟 2：實作指數退避

```javascript
/**
 * 指數退避重試機制
 * 等待時間按指數增長：1s, 2s, 4s, 8s...
 */
class ExponentialBackoffRetry {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.factor = options.factor || 2;
    this.jitter = options.jitter || true;
  }
  
  async execute(fn) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries - 1) {
          const delay = this.calculateDelay(attempt);
          console.log(`第 ${attempt + 1} 次失敗，等待 ${delay}ms 後重試`);
          await this.wait(delay);
        }
      }
    }
    
    throw new Error(`重試 ${this.maxRetries} 次後仍然失敗: ${lastError.message}`);
  }
  
  calculateDelay(attempt) {
    // 計算指數退避延遲
    let delay = Math.min(
      this.baseDelay * Math.pow(this.factor, attempt),
      this.maxDelay
    );
    
    // 添加隨機抖動以避免雷鳴群效應
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }
  
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用指數退避
test('使用指數退避重試', async ({ page }) => {
  const retry = new ExponentialBackoffRetry({
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 10000
  });
  
  await retry.execute(async () => {
    await page.goto('http://localhost:3000/api-endpoint');
    const response = await page.waitForResponse('**/api/data');
    
    if (response.status() !== 200) {
      throw new Error(`API 返回錯誤: ${response.status()}`);
    }
    
    return response.json();
  });
});
```

### 步驟 3：條件式重試策略

```javascript
/**
 * 智能重試決策系統
 * 根據錯誤類型決定是否重試
 */
class SmartRetryStrategy {
  constructor() {
    // 定義可重試的錯誤類型
    this.retryableErrors = [
      'TimeoutError',
      'NetworkError',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN'
    ];
    
    // 定義可重試的 HTTP 狀態碼
    this.retryableStatusCodes = [
      408, // Request Timeout
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504  // Gateway Timeout
    ];
    
    // 不可重試的錯誤
    this.nonRetryableErrors = [
      'SyntaxError',
      'TypeError',
      'ReferenceError',
      'AssertionError'
    ];
  }
  
  shouldRetry(error) {
    // 檢查是否為不可重試錯誤
    if (this.nonRetryableErrors.some(type => error.name === type)) {
      console.log(`錯誤類型 ${error.name} 不可重試`);
      return false;
    }
    
    // 檢查 HTTP 狀態碼
    if (error.status) {
      if (this.retryableStatusCodes.includes(error.status)) {
        console.log(`HTTP ${error.status} 可以重試`);
        return true;
      }
      
      // 4xx 錯誤通常不應重試（除了特定的）
      if (error.status >= 400 && error.status < 500) {
        console.log(`HTTP ${error.status} 客戶端錯誤，不重試`);
        return false;
      }
    }
    
    // 檢查錯誤訊息
    const errorMessage = error.message || error.toString();
    if (this.retryableErrors.some(pattern => errorMessage.includes(pattern))) {
      console.log(`錯誤訊息包含可重試模式`);
      return true;
    }
    
    // 預設不重試
    return false;
  }
  
  async executeWithRetry(fn, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const baseDelay = options.baseDelay || 1000;
    
    let lastError;
    let consecutiveFailures = 0;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // 成功後重置連續失敗計數
        consecutiveFailures = 0;
        return result;
        
      } catch (error) {
        lastError = error;
        consecutiveFailures++;
        
        // 判斷是否應該重試
        if (!this.shouldRetry(error)) {
          console.log('錯誤不可重試，立即失敗');
          throw error;
        }
        
        // 如果還有重試機會
        if (attempt < maxRetries - 1) {
          // 連續失敗太多次，可能有更嚴重的問題
          if (consecutiveFailures >= 3) {
            console.log('連續失敗次數過多，停止重試');
            throw error;
          }
          
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`可重試錯誤，${delay}ms 後進行第 ${attempt + 2} 次嘗試`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

// 使用智能重試
test('條件式重試策略', async ({ page }) => {
  const strategy = new SmartRetryStrategy();
  
  await strategy.executeWithRetry(async () => {
    await page.goto('http://localhost:3000/flaky-endpoint');
    
    // 可能會拋出各種錯誤
    const button = await page.waitForSelector('#dynamic-button', {
      timeout: 5000
    });
    
    await button.click();
    
    // 等待結果
    const result = await page.waitForSelector('.result', {
      state: 'visible',
      timeout: 10000
    });
    
    return await result.textContent();
  }, {
    maxRetries: 5,
    baseDelay: 500
  });
});
```

### 步驟 4：使用 AI 輔助的自適應重試

向 AI 提供以下提示詞來生成智能重試策略：

```markdown
我需要一個自適應的重試機制，能夠：
1. 根據歷史成功率動態調整重試次數
2. 學習最佳的延遲時間
3. 識別模式並預測失敗可能性
4. 提供重試建議

測試場景：
- 目標網站有時會返回 503 錯誤
- 某些時段（如整點）特別繁忙
- API 有速率限制（每分鐘 60 次）

請生成一個智能重試系統的實作。

Generate an adaptive retry system implementation in Traditional Chinese comments.
```

### 步驟 5：實作自適應重試系統

```javascript
/**
 * AI 輔助的自適應重試系統
 */
class AdaptiveRetrySystem {
  constructor() {
    this.history = [];
    this.patterns = new Map();
    this.learningRate = 0.1;
  }
  
  // 記錄執行結果
  recordAttempt(context, success, attemptCount, totalTime) {
    const record = {
      timestamp: Date.now(),
      hour: new Date().getHours(),
      context,
      success,
      attemptCount,
      totalTime
    };
    
    this.history.push(record);
    this.updatePatterns(record);
  }
  
  // 更新模式識別
  updatePatterns(record) {
    const hourKey = `hour_${record.hour}`;
    
    if (!this.patterns.has(hourKey)) {
      this.patterns.set(hourKey, {
        successRate: 0,
        avgAttempts: 0,
        samples: 0
      });
    }
    
    const pattern = this.patterns.get(hourKey);
    pattern.samples++;
    
    // 使用移動平均更新統計
    pattern.successRate = pattern.successRate * (1 - this.learningRate) +
                         (record.success ? 1 : 0) * this.learningRate;
    
    pattern.avgAttempts = pattern.avgAttempts * (1 - this.learningRate) +
                         record.attemptCount * this.learningRate;
  }
  
  // 預測最佳重試策略
  predictOptimalStrategy(context) {
    const hour = new Date().getHours();
    const hourKey = `hour_${hour}`;
    const pattern = this.patterns.get(hourKey);
    
    // 基礎策略
    let strategy = {
      maxRetries: 3,
      baseDelay: 1000,
      factor: 2
    };
    
    // 根據歷史模式調整
    if (pattern && pattern.samples > 10) {
      // 成功率低時增加重試次數
      if (pattern.successRate < 0.5) {
        strategy.maxRetries = Math.min(5, Math.ceil(3 / pattern.successRate));
      }
      
      // 根據平均嘗試次數調整
      if (pattern.avgAttempts > 2) {
        strategy.baseDelay = 1500; // 增加基礎延遲
        strategy.factor = 2.5; // 更激進的退避
      }
    }
    
    // 檢查最近的失敗模式
    const recentFailures = this.history
      .slice(-10)
      .filter(r => !r.success)
      .length;
    
    if (recentFailures > 5) {
      // 最近失敗率高，採用更保守策略
      strategy.maxRetries = 5;
      strategy.baseDelay = 2000;
      console.log('檢測到高失敗率，採用保守策略');
    }
    
    return strategy;
  }
  
  // 執行自適應重試
  async executeWithAdaptiveRetry(fn, context = {}) {
    const strategy = this.predictOptimalStrategy(context);
    console.log('使用策略:', strategy);
    
    const startTime = Date.now();
    let lastError;
    let attemptCount = 0;
    
    for (let attempt = 0; attempt < strategy.maxRetries; attempt++) {
      attemptCount++;
      
      try {
        const result = await fn();
        
        // 記錄成功
        this.recordAttempt(
          context,
          true,
          attemptCount,
          Date.now() - startTime
        );
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < strategy.maxRetries - 1) {
          const delay = strategy.baseDelay * Math.pow(strategy.factor, attempt);
          console.log(`第 ${attempt + 1} 次失敗，等待 ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // 記錄失敗
    this.recordAttempt(
      context,
      false,
      attemptCount,
      Date.now() - startTime
    );
    
    throw lastError;
  }
  
  // 生成報告
  generateReport() {
    const totalAttempts = this.history.length;
    const successCount = this.history.filter(r => r.success).length;
    const successRate = successCount / totalAttempts;
    
    console.log('\n=== 自適應重試系統報告 ===');
    console.log(`總執行次數: ${totalAttempts}`);
    console.log(`成功率: ${(successRate * 100).toFixed(2)}%`);
    
    console.log('\n時段分析:');
    this.patterns.forEach((pattern, hour) => {
      console.log(`${hour}: 成功率 ${(pattern.successRate * 100).toFixed(2)}%, 平均嘗試 ${pattern.avgAttempts.toFixed(1)} 次`);
    });
    
    return {
      totalAttempts,
      successRate,
      patterns: Array.from(this.patterns.entries())
    };
  }
}

// 使用自適應重試系統
test('自適應重試系統', async ({ page }) => {
  const adaptiveSystem = new AdaptiveRetrySystem();
  
  // 執行多個測試以訓練系統
  for (let i = 0; i < 10; i++) {
    try {
      await adaptiveSystem.executeWithAdaptiveRetry(async () => {
        await page.goto('http://localhost:3000/adaptive-test');
        await page.click('#action-button');
        
        const result = await page.waitForSelector('.result', {
          timeout: 5000
        });
        
        return await result.textContent();
      }, {
        testRun: i,
        feature: 'user-action'
      });
      
    } catch (error) {
      console.log(`測試 ${i} 最終失敗: ${error.message}`);
    }
  }
  
  // 生成學習報告
  adaptiveSystem.generateReport();
});
```

## 預期結果

完成本練習後，你應該能夠：

1. **實作各種重試策略**
   - 簡單重試
   - 指數退避
   - 條件式重試
   - 自適應重試

2. **智能判斷重試時機**
   - 識別可重試錯誤
   - 避免無效重試
   - 優化重試參數

3. **整合 AI 輔助決策**
   - 模式識別
   - 預測優化
   - 自動調整策略

## 思考與挑戰

### 進階挑戰 1：分散式重試協調
設計一個能在多個測試執行器之間協調的重試系統：

```javascript
class DistributedRetryCoordinator {
  async coordinateRetries(testId, executor) {
    // 實作分散式鎖
    // 共享重試狀態
    // 避免重複重試
  }
}
```

### 進階挑戰 2：成本感知重試
根據資源成本優化重試策略：

```javascript
class CostAwareRetry {
  calculateRetryCost(attempt, resource) {
    // 計算時間成本
    // 計算資源消耗
    // 決定是否值得重試
  }
}
```

### 進階挑戰 3：預測性重試
預測失敗並主動調整：

```javascript
class PredictiveRetry {
  async predictFailureProbability(context) {
    // 分析歷史資料
    // 識別失敗模式
    // 預先調整策略
  }
}
```

## 實用提示

1. **重試策略選擇**
   - 網路問題：使用指數退避
   - API 限流：使用固定延遲
   - 資源競爭：使用隨機抖動
   - 未知問題：使用自適應策略

2. **最佳實踐**
   - 設定合理的最大重試次數
   - 記錄所有重試嘗試
   - 區分暫時性和永久性失敗
   - 實作熔斷機制

3. **效能考量**
   - 避免過度重試
   - 考慮並行重試
   - 實作快速失敗
   - 監控重試成本

## 相關資源

- [重試模式最佳實踐](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)
- [指數退避演算法](https://en.wikipedia.org/wiki/Exponential_backoff)
- [斷路器模式](https://martinfowler.com/bliki/CircuitBreaker.html)

---

💡 **提示**：智能重試是自我修復系統的核心。正確的重試策略可以將測試成功率從 80% 提升到 95% 以上，同時減少執行時間和資源消耗。