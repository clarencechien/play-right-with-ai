/**
 * Chapter 5: AI 測試失敗分析模板
 * 
 * 這個模板提供了一個結構化的方法來分析和解決測試失敗
 * 使用 AI 協助進行根本原因分析和解決方案生成
 */

const { test, expect } = require('@playwright/test');

/**
 * 測試失敗分析框架
 */
class TestFailureAnalyzer {
  /**
     * 初始化建構函式
     */
    constructor() {
    this.debugAnalysis = {
      testName: '',
      failureType: '', // timing, dom, api, logic
      errorMessage: '',
      stackTrace: '',
      timestamp: new Date().toISOString()
    };
    
    this.rootCause = {
      category: '', // 問題分類
      description: '', // 詳細描述
      evidence: [], // 支持證據
      hypothesis: '' // 假設
    };
    
    this.solution = {
      approach: '', // 解決方法
      implementation: '', // 實作程式碼
      preventionStrategy: '', // 預防策略
      validation: '' // 驗證方法
    };
  }

  /**
   * 收集失敗資訊
   * @param {*} testInfo - testInfo 參數
   * @param {*} error - error 參數
   */
  async collectFailureInfo(testInfo, error) {
    this.debugAnalysis.testName = testInfo.title;
    this.debugAnalysis.errorMessage = error.message;
    this.debugAnalysis.stackTrace = error.stack;
    
    // 分析錯誤類型
    this.debugAnalysis.failureType = this.classifyError(error);
    
    return this.debugAnalysis;
  }

  /**
   * 分類錯誤類型
   * @param {*} error - error 參數
   */
  classifyError(error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('waiting')) {
      return 'timing';
    }
    
    if (errorMessage.includes('element') || 
        errorMessage.includes('selector') ||
        errorMessage.includes('locator')) {
      return 'dom';
    }
    
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('api') ||
        errorMessage.includes('response')) {
      return 'api';
    }
    
    return 'logic';
  }

  /**
   * 生成 AI 提示詞進行分析
   */
  generateAIPrompt() {
    return `
請分析以下測試失敗：

測試名稱：${this.debugAnalysis.testName}
錯誤類型：${this.debugAnalysis.failureType}
錯誤訊息：${this.debugAnalysis.errorMessage}

堆疊追蹤：
${this.debugAnalysis.stackTrace}

請提供：
1. 根本原因分析
2. 詳細的解決方案
3. 預防未來類似問題的策略
4. 驗證修復的方法

Please analyze the test failure and provide solutions in Traditional Chinese.
    `;
  }

  /**
   * 執行根本原因分析
   * @param {*} page - page 參數
   */
  async performRootCauseAnalysis(page) {
    // 收集額外的診斷資訊
    const diagnostics = await this.collectDiagnostics(page);
    
    this.rootCause.evidence = diagnostics;
    
    // 這裡可以整合 AI API 進行自動分析
    // const aiAnalysis = await callAIAPI(this.generateAIPrompt());
    
    return this.rootCause;
  }

  /**
   * 收集診斷資訊
   * @param {*} page - page 參數
   */
  async collectDiagnostics(page) {
    const diagnostics = [];
    
    try {
      // 收集頁面資訊
      diagnostics.push({
        type: 'url',
        value: page.url()
      });
      
      // 收集控制台錯誤
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      if (consoleErrors.length > 0) {
        diagnostics.push({
          type: 'console_errors',
          value: consoleErrors
        });
      }
      
      // 收集網路失敗
      const failedRequests = [];
      page.on('requestfailed', request => {
        failedRequests.push({
          url: request.url(),
          failure: request.failure()
        });
      });
      
      if (failedRequests.length > 0) {
        diagnostics.push({
          type: 'failed_requests',
          value: failedRequests
        });
      }
      
    } catch (e) {
      console.log('收集診斷資訊時發生錯誤：', e);
    }
    
    return diagnostics;
  }

  /**
   * 生成解決方案
   */
  async generateSolution() {
    // 根據錯誤類型提供針對性解決方案
    switch (this.debugAnalysis.failureType) {
      case 'timing':
        this.solution.approach = '使用適當的等待策略';
        this.solution.implementation = `
// 使用 waitForSelector 等待元素
await page.waitForSelector('.target-element', {
  state: 'visible',
  timeout: 30000
});

// 使用 waitForLoadState 等待頁面載入
await page.waitForLoadState('networkidle');

// 使用自定義等待條件
await page.waitForFunction(() => {
  return document.querySelector('.target-element')?.textContent === '預期文字';
});
        `;
        this.solution.preventionStrategy = '始終使用明確的等待條件，避免固定延遲';
        break;
        
      case 'dom':
        this.solution.approach = '改進選擇器策略';
        this.solution.implementation = `
// 使用 data-testid
await page.click('[data-testid="submit-button"]');

// 使用文字內容定位
await page.click('button:has-text("提交")');

// 使用相對定位
await page.locator('.container').locator('button').click();
        `;
        this.solution.preventionStrategy = '與開發團隊協作添加測試友好的屬性';
        break;
        
      case 'api':
        this.solution.approach = '實作 API Mock 或重試機制';
        this.solution.implementation = `
// Mock API 回應
await page.route('**/api/endpoint', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true })
  });
});

// 實作重試邏輯
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000 * (i + 1));
    }
  }
}
        `;
        this.solution.preventionStrategy = '使用 Mock 資料進行測試隔離';
        break;
        
      default:
        this.solution.approach = '檢查業務邏輯和測試假設';
        this.solution.preventionStrategy = '加強測試文檔和團隊溝通';
    }
    
    return this.solution;
  }

  /**
   * 生成修復報告
   */
  generateReport() {
    return {
      summary: {
        test: this.debugAnalysis.testName,
        failureType: this.debugAnalysis.failureType,
        timestamp: this.debugAnalysis.timestamp
      },
      analysis: this.debugAnalysis,
      rootCause: this.rootCause,
      solution: this.solution,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * 生成建議
   */
  generateRecommendations() {
    return [
      '定期審查和更新測試選擇器',
      '實作適當的錯誤處理和重試機制',
      '使用 AI 輔助進行持續的測試優化',
      '建立測試失敗的知識庫',
      '與開發團隊保持緊密溝通'
    ];
  }
}

/**
 * 範例測試：展示如何使用分析框架
 */
test.describe('測試失敗分析範例', () => {
  let analyzer;
  
  test.beforeEach(async () => {
    analyzer = new TestFailureAnalyzer();
  });
  
  test('展示時序問題除錯', async ({ page }, testInfo) => {
    try {
      await page.goto('http://localhost:3000/async-demo');
      
      // 這個測試可能因為時序問題失敗
      await page.click('#load-button');
      
      // 錯誤：沒有等待載入完成
      const result = page;
      await expect(result).toHaveText('.result', '載入完成');
      
    } catch (error) {
      // 收集失敗資訊
      await analyzer.collectFailureInfo(testInfo, error);
      
      // 執行根本原因分析
      await analyzer.performRootCauseAnalysis(page);
      
      // 生成解決方案
      await analyzer.generateSolution();
      
      // 輸出分析報告
      const report = analyzer.generateReport();
      console.log('測試失敗分析報告：', JSON.stringify(report, null, 2));
      
      // 將報告寫入檔案
      const fs = require('fs');
      fs.writeFileSync(
        `failure-report-${Date.now()}.json`,
        JSON.stringify(report, null, 2)
      );
      
      throw error; // 重新拋出錯誤
    }
  });
  
  test('展示 DOM 問題除錯', async ({ page }, testInfo) => {
    try {
      await page.goto('http://localhost:3000/dynamic-content');
      
      // 這個選擇器可能不穩定
      await page.click('.btn-primary-large-blue-submit');
      
    } catch (error) {
      await analyzer.collectFailureInfo(testInfo, error);
      await analyzer.performRootCauseAnalysis(page);
      await analyzer.generateSolution();
      
      const report = analyzer.generateReport();
      console.log('DOM 問題分析：', report.solution);
      
      throw error;
    }
  });
  
  test('展示 API 問題除錯', async ({ page }, testInfo) => {
    try {
      await page.goto('http://localhost:3000/api-integration');
      
      // 監控 API 請求
      const apiResponses = [];
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiResponses.push({
            url: response.url(),
            status: response.status(),
            ok: response.ok()
          });
        }
      });
      
      await page.click('#fetch-data');
      
      // 等待 API 回應
      await page.waitForResponse(
        resp => resp.url().includes('/api/data') && resp.ok()
      );
      
      // 驗證資料
      const data = page;
      await expect(data).not.toHaveText('.api-result', '錯誤');
      
    } catch (error) {
      await analyzer.collectFailureInfo(testInfo, error);
      
      // 添加 API 特定的診斷
      analyzer.rootCause.evidence.push({
        type: 'api_responses',
        value: apiResponses
      });
      
      await analyzer.generateSolution();
      
      const report = analyzer.generateReport();
      console.log('API 整合問題分析：', report);
      
      throw error;
    }
  });
});

/**
 * 輔助函數：智能等待
 * @param {*} page - page 參數
 * @param {*} selector - selector 參數
 * @param {*} options - options 參數
 */
async function smartWait(page, selector, options = {}) {
  const defaultOptions = {
    state: 'visible',
    timeout: 30000,
    retries: 3
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  for (let i = 0; i < finalOptions.retries; i++) {
    try {
      await page.waitForSelector(selector, {
        state: finalOptions.state,
        timeout: finalOptions.timeout
      });
      return;
    } catch (error) {
      if (i === finalOptions.retries - 1) {
        throw error;
      }
      console.log(`等待 ${selector} 失敗，重試 ${i + 1}/${finalOptions.retries}`);
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * 輔助函數：安全點擊
 * @param {*} page - page 參數
 * @param {*} selector - selector 參數
 */
async function safeClick(page, selector) {
  await smartWait(page, selector);
  await page.click(selector);
}

module.exports = {
  TestFailureAnalyzer,
  smartWait,
  safeClick
};