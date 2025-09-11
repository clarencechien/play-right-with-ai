/**
 * Chapter 5: API 整合問題除錯 - 完整解決方案
 * 
 * 展示如何診斷和解決 API 相關的測試問題
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * API 監控和除錯工具
 */
class APIDebugger {
  constructor(page) {
    this.page = page;
    this.requests = [];
    this.responses = [];
    this.errors = [];
    this.isMonitoring = false;
  }
  
  // 開始監控 API
  async startMonitoring() {
    // 監控請求
    this.page.on('request', request => {
      if (this.isAPIRequest(request.url())) {
        const requestData = {
          timestamp: Date.now(),
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          resourceType: request.resourceType()
        };
        
        this.requests.push(requestData);
        
        // 實時日誌
        console.log(`[請求] ${request.method()} ${request.url()}`);
      }
    });
    
    // 監控回應
    this.page.on('response', async response => {
      if (this.isAPIRequest(response.url())) {
        const responseData = {
          timestamp: Date.now(),
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          headers: response.headers(),
          timing: response.timing()
        };
        
        // 嘗試獲取回應內容
        try {
          const body = await response.body();
          responseData.bodySize = body.length;
          
          // 如果是 JSON，解析內容
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            responseData.json = JSON.parse(body.toString());
          }
        } catch (e) {
          responseData.bodyError = e.message;
        }
        
        this.responses.push(responseData);
        
        // 實時日誌
        const statusColor = response.status() >= 400 ? '❌' : '✅';
        console.log(`[回應] ${statusColor} ${response.status()} ${response.url()}`);
        
        // 記錄錯誤
        if (response.status() >= 400) {
          this.errors.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            timestamp: Date.now()
          });
        }
      }
    });
    
    // 監控請求失敗
    this.page.on('requestfailed', request => {
      if (this.isAPIRequest(request.url())) {
        const failure = {
          timestamp: Date.now(),
          url: request.url(),
          failure: request.failure(),
          method: request.method()
        };
        
        this.errors.push(failure);
        console.log(`[失敗] ❌ ${request.method()} ${request.url()}: ${request.failure().errorText}`);
      }
    });
    
    this.isMonitoring = true;
  }
  
  // 判斷是否為 API 請求
  isAPIRequest(url) {
    return url.includes('/api/') || 
           url.includes('/graphql') || 
           url.includes('/rest/') ||
           url.includes('.json');
  }
  
  // 生成分析報告
  generateReport() {
    const report = {
      summary: {
        totalRequests: this.requests.length,
        totalResponses: this.responses.length,
        totalErrors: this.errors.length,
        successRate: this.calculateSuccessRate()
      },
      performance: this.analyzePerformance(),
      errors: this.errors,
      slowestAPIs: this.findSlowestAPIs(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  // 計算成功率
  calculateSuccessRate() {
    if (this.responses.length === 0) return 0;
    
    const successfulResponses = this.responses.filter(r => r.status < 400).length;
    return Math.round((successfulResponses / this.responses.length) * 100);
  }
  
  // 分析效能
  analyzePerformance() {
    if (this.responses.length === 0) return null;
    
    const timings = this.responses
      .filter(r => r.timing)
      .map(r => r.timing.responseEnd - r.timing.requestStart);
    
    if (timings.length === 0) return null;
    
    return {
      average: Math.round(timings.reduce((a, b) => a + b, 0) / timings.length),
      min: Math.min(...timings),
      max: Math.max(...timings),
      median: this.calculateMedian(timings)
    };
  }
  
  // 計算中位數
  calculateMedian(arr) {
    const sorted = arr.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  // 找出最慢的 API
  findSlowestAPIs(limit = 5) {
    return this.responses
      .filter(r => r.timing)
      .map(r => ({
        url: r.url,
        duration: r.timing.responseEnd - r.timing.requestStart,
        status: r.status
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
  
  // 生成建議
  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push('發現 API 錯誤，建議實作錯誤處理和重試機制');
    }
    
    const perf = this.analyzePerformance();
    if (perf && perf.max > 3000) {
      recommendations.push('發現慢速 API（>3秒），建議優化或實作快取');
    }
    
    if (this.calculateSuccessRate() < 95) {
      recommendations.push('API 成功率低於 95%，建議使用 Mock 提高測試穩定性');
    }
    
    return recommendations;
  }
  
  // 匯出為 HAR 格式
  exportToHAR() {
    const har = {
      log: {
        version: '1.2',
        creator: {
          name: 'APIDebugger',
          version: '1.0'
        },
        entries: this.requests.map((req, index) => {
          const response = this.responses.find(r => r.url === req.url);
          
          return {
            startedDateTime: new Date(req.timestamp).toISOString(),
            time: response ? response.timing.responseEnd - response.timing.requestStart : 0,
            request: {
              method: req.method,
              url: req.url,
              headers: Object.entries(req.headers).map(([name, value]) => ({ name, value })),
              postData: req.postData ? {
                mimeType: 'application/json',
                text: req.postData
              } : undefined
            },
            response: response ? {
              status: response.status,
              statusText: response.statusText,
              headers: Object.entries(response.headers).map(([name, value]) => ({ name, value })),
              content: {
                size: response.bodySize || 0,
                mimeType: response.headers['content-type'] || 'application/json'
              }
            } : undefined
          };
        })
      }
    };
    
    return har;
  }
}

/**
 * API Mock 策略
 */
test.describe('API Mock 和攔截策略', () => {
  
  // 完全 Mock API
  test('完全 Mock API 回應', async ({ page }) => {
    // 定義 Mock 資料
    const mockData = {
      '/api/auth/login': {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          name: '測試使用者',
          email: 'test@example.com',
          roles: ['user', 'admin']
        }
      },
      '/api/users/profile': {
        id: 1,
        name: '測試使用者',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
        preferences: {
          theme: 'dark',
          language: 'zh-TW'
        }
      },
      '/api/products': [
        { id: 1, name: '產品 A', price: 999, stock: 10 },
        { id: 2, name: '產品 B', price: 1999, stock: 5 },
        { id: 3, name: '產品 C', price: 2999, stock: 0 }
      ]
    };
    
    // 攔截所有 API 請求
    await page.route('**/api/**', async route => {
      const url = route.request().url();
      
      // 找到對應的 Mock 資料
      const endpoint = Object.keys(mockData).find(key => url.includes(key));
      
      if (endpoint) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockData[endpoint])
        });
      } else {
        // 沒有 Mock 資料時返回錯誤
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not found' })
        });
      }
    });
    
    // 執行測試
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'any-password');
    await page.click('[type="submit"]');
    
    // 驗證登入成功
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.user-name')).toContainText('測試使用者');
  });
  
  // 條件式 Mock
  test('智能 Mock：僅在錯誤時使用', async ({ page }) => {
    const fallbackData = {
      '/api/products': [
        { id: 1, name: '備用產品 A', price: 999 },
        { id: 2, name: '備用產品 B', price: 1999 }
      ]
    };
    
    await page.route('**/api/**', async route => {
      const request = route.request();
      
      try {
        // 嘗試真實請求
        const response = await route.fetch();
        
        if (response.status() >= 500) {
          // 伺服器錯誤時使用備用資料
          console.log(`API 錯誤 ${response.status()}，使用備用資料`);
          
          const url = request.url();
          const endpoint = Object.keys(fallbackData).find(key => url.includes(key));
          
          if (endpoint) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(fallbackData[endpoint])
            });
          } else {
            await route.continue();
          }
        } else {
          // 正常回應
          await route.continue();
        }
      } catch (error) {
        // 網路錯誤時使用備用資料
        console.log('網路錯誤，使用備用資料');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Network error', fallback: true })
        });
      }
    });
    
    await page.goto('http://localhost:3000/products');
    const products = await page.locator('.product-card').count();
    expect(products).toBeGreaterThan(0);
  });
  
  // 延遲模擬
  test('模擬網路延遲', async ({ page }) => {
    await page.route('**/api/**', async route => {
      // 添加隨機延遲 (500-2000ms)
      const delay = Math.random() * 1500 + 500;
      await page.waitForTimeout(delay);
      
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('http://localhost:3000/slow-api-test');
    await page.click('#load-data');
    
    // 等待載入指示器
    await page.waitForSelector('.loading', { state: 'visible' });
    await page.waitForSelector('.loading', { state: 'hidden' });
    
    const loadTime = Date.now() - startTime;
    console.log(`載入時間: ${loadTime}ms`);
    
    // 驗證有延遲
    expect(loadTime).toBeGreaterThan(500);
  });
});

/**
 * 錯誤注入測試
 */
test.describe('API 錯誤處理測試', () => {
  
  test('測試各種 HTTP 錯誤碼處理', async ({ page }) => {
    const errorScenarios = [
      { 
        status: 400, 
        message: '請求參數錯誤',
        expectedUI: '請檢查輸入資料'
      },
      { 
        status: 401, 
        message: '未授權',
        expectedUI: '請重新登入'
      },
      { 
        status: 403, 
        message: '權限不足',
        expectedUI: '您沒有權限執行此操作'
      },
      { 
        status: 404, 
        message: '資源不存在',
        expectedUI: '找不到請求的資源'
      },
      { 
        status: 429, 
        message: '請求過於頻繁',
        expectedUI: '請稍後再試'
      },
      { 
        status: 500, 
        message: '伺服器內部錯誤',
        expectedUI: '系統錯誤，請聯繫管理員'
      },
      { 
        status: 503, 
        message: '服務暫時不可用',
        expectedUI: '服務維護中'
      }
    ];
    
    for (const scenario of errorScenarios) {
      console.log(`測試錯誤碼: ${scenario.status}`);
      
      // 設定錯誤回應
      await page.route('**/api/test-endpoint', route => {
        route.fulfill({
          status: scenario.status,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: scenario.message,
            code: scenario.status
          })
        });
      });
      
      await page.goto('http://localhost:3000/error-handling');
      await page.click('#trigger-api-call');
      
      // 等待錯誤訊息顯示
      await page.waitForSelector('.error-message', { state: 'visible' });
      
      // 驗證錯誤處理
      const errorMessage = await page.textContent('.error-message');
      expect(errorMessage).toContain(scenario.expectedUI);
      
      // 驗證錯誤碼顯示
      const errorCode = await page.textContent('.error-code');
      expect(errorCode).toContain(scenario.status.toString());
      
      // 清除錯誤狀態
      await page.click('#clear-error');
    }
  });
  
  test('測試網路中斷處理', async ({ page, context }) => {
    await page.goto('http://localhost:3000/network-test');
    
    // 模擬離線
    await context.setOffline(true);
    
    await page.click('#fetch-data');
    
    // 應該顯示離線訊息
    await expect(page.locator('.offline-message')).toBeVisible();
    await expect(page.locator('.offline-message')).toContainText('網路連線中斷');
    
    // 恢復連線
    await context.setOffline(false);
    
    // 重試
    await page.click('#retry-button');
    
    // 應該成功載入
    await expect(page.locator('.data-container')).toBeVisible();
  });
});

/**
 * 效能監控
 */
test('API 效能監控和分析', async ({ page }) => {
  const debugger = new APIDebugger(page);
  await debugger.startMonitoring();
  
  // 設定效能閾值
  const performanceThresholds = {
    maxResponseTime: 2000, // 2秒
    maxTotalTime: 10000, // 10秒
    minSuccessRate: 95 // 95%
  };
  
  await page.goto('http://localhost:3000/performance-test');
  
  // 執行多個 API 操作
  await page.click('#load-user-profile');
  await page.waitForResponse('**/api/users/profile');
  
  await page.click('#load-products');
  await page.waitForResponse('**/api/products');
  
  await page.click('#load-recommendations');
  await page.waitForResponse('**/api/recommendations');
  
  // 生成效能報告
  const report = debugger.generateReport();
  
  console.log('\n=== API 效能報告 ===');
  console.log('總請求數:', report.summary.totalRequests);
  console.log('成功率:', report.summary.successRate + '%');
  console.log('平均回應時間:', report.performance.average + 'ms');
  console.log('最慢 API:', report.slowestAPIs[0]);
  
  // 驗證效能指標
  expect(report.summary.successRate).toBeGreaterThanOrEqual(performanceThresholds.minSuccessRate);
  expect(report.performance.max).toBeLessThan(performanceThresholds.maxResponseTime);
  
  // 匯出 HAR 檔案
  const har = debugger.exportToHAR();
  fs.writeFileSync(
    path.join(__dirname, `api-debug-${Date.now()}.har`),
    JSON.stringify(har, null, 2)
  );
});

/**
 * GraphQL 特定除錯
 */
test('GraphQL API 除錯', async ({ page }) => {
  // 監控 GraphQL 請求
  const graphqlQueries = [];
  
  await page.route('**/graphql', async route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData) {
      const body = JSON.parse(postData);
      graphqlQueries.push({
        query: body.query,
        variables: body.variables,
        operationName: body.operationName
      });
      
      // Mock 回應
      if (body.operationName === 'GetUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: '1',
                name: '測試使用者',
                email: 'test@example.com'
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    }
  });
  
  await page.goto('http://localhost:3000/graphql-test');
  await page.click('#fetch-user');
  
  // 分析 GraphQL 查詢
  console.log('GraphQL 查詢記錄:');
  graphqlQueries.forEach((q, i) => {
    console.log(`查詢 ${i + 1}:`, q.operationName);
    console.log('Variables:', q.variables);
  });
  
  // 驗證資料載入
  await expect(page.locator('.user-info')).toContainText('測試使用者');
});

/**
 * 重試機制實作
 */
class APIRetryHandler {
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      maxRetries: options.maxRetries || 3,
      delay: options.delay || 1000,
      backoff: options.backoff || 2,
      timeout: options.timeout || 30000
    };
  }
  
  // 使用指數退避的重試
  async retryRequest(requestFn, validateFn) {
    let lastError;
    
    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        const result = await requestFn();
        
        if (validateFn && !validateFn(result)) {
          throw new Error('驗證失敗');
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < this.options.maxRetries - 1) {
          const delay = this.options.delay * Math.pow(this.options.backoff, attempt);
          console.log(`重試 ${attempt + 1}/${this.options.maxRetries}，等待 ${delay}ms`);
          await this.page.waitForTimeout(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  // 智能重試（根據錯誤類型決定是否重試）
  shouldRetry(error) {
    // 可重試的錯誤
    const retryableErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'NetworkError',
      'TimeoutError'
    ];
    
    // 不可重試的狀態碼
    const nonRetryableStatusCodes = [400, 401, 403, 404, 422];
    
    if (error.status && nonRetryableStatusCodes.includes(error.status)) {
      return false;
    }
    
    return retryableErrors.some(e => error.message?.includes(e));
  }
}

// 使用重試機制
test('使用智能重試機制', async ({ page }) => {
  const retryHandler = new APIRetryHandler(page);
  
  // 模擬不穩定的 API
  let attemptCount = 0;
  await page.route('**/api/unstable', route => {
    attemptCount++;
    
    if (attemptCount < 3) {
      // 前兩次失敗
      route.abort('failed');
    } else {
      // 第三次成功
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, attempts: attemptCount })
      });
    }
  });
  
  await page.goto('http://localhost:3000/retry-test');
  
  // 使用重試機制執行請求
  const result = await retryHandler.retryRequest(
    async () => {
      await page.click('#call-unstable-api');
      return await page.waitForResponse(
        resp => resp.url().includes('/api/unstable') && resp.ok(),
        { timeout: 5000 }
      );
    },
    response => response.ok()
  );
  
  expect(result.ok()).toBe(true);
  console.log(`成功！總嘗試次數: ${attemptCount}`);
});

module.exports = {
  APIDebugger,
  APIRetryHandler
};