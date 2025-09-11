/**
 * Chapter 6: 自我修復系統模板
 * 
 * 這個模板提供了建構自我修復測試系統的基礎架構
 * 包含重試機制、選擇器修復、和自動化修復流程
 */

const { test, expect } = require('@playwright/test');

/**
 * 自我修復系統核心類別
 */
class SelfRepairSystem {
  /**
   *
   * @param {*} page - page 參數
   * @param {*} options - options 參數
   */
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      maxRetries: options.maxRetries || 3,
      healingEnabled: options.healingEnabled !== false,
      autoFixEnabled: options.autoFixEnabled || false,
      reportingEnabled: options.reportingEnabled !== false,
      ...options
    };
    
    this.repairHistory = [];
    this.selectorMappings = new Map();
    this.failurePatterns = new Map();
  }
  
  /**
   * 初始化自我修復系統
   */
  async initialize() {
    // 載入歷史修復記錄
    await this.loadRepairHistory();
    
    // 載入選擇器映射
    await this.loadSelectorMappings();
    
    // 設定監控
    this.setupMonitoring();
    
    console.log('✅ 自我修復系統已初始化');
  }
  
  /**
   * 設定監控機制
   */
  setupMonitoring() {
    // 監控頁面錯誤
    this.page.on('pageerror', error => {
      this.recordError('page_error', error);
    });
    
    // 監控控制台錯誤
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.recordError('console_error', msg.text());
      }
    });
    
    // 監控請求失敗
    this.page.on('requestfailed', request => {
      this.recordError('request_failed', {
        url: request.url(),
        failure: request.failure()
      });
    });
  }
  
  /**
   * 記錄錯誤
   * @param {*} type - type 參數
   * @param {*} error - error 參數
   */
  recordError(type, error) {
    const errorRecord = {
      timestamp: Date.now(),
      type,
      error,
      context: this.getCurrentContext()
    };
    
    // 分析錯誤模式
    this.analyzeErrorPattern(errorRecord);
  }
  
  /**
   * 分析錯誤模式
   * @param {*} errorRecord - errorRecord 參數
   */
  analyzeErrorPattern(errorRecord) {
    const pattern = this.identifyPattern(errorRecord);
    
    if (pattern) {
      if (!this.failurePatterns.has(pattern)) {
        this.failurePatterns.set(pattern, {
          count: 0,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          repairs: []
        });
      }
      
      const patternData = this.failurePatterns.get(pattern);
      patternData.count++;
      patternData.lastSeen = Date.now();
    }
  }
  
  /**
   * 識別錯誤模式
   * @param {*} errorRecord - errorRecord 參數
   */
  identifyPattern(errorRecord) {
    // TODO: 實作模式識別邏輯
    // 這裡應該分析錯誤類型並返回模式標識
    return null;
  }
  
  /**
   * 獲取當前上下文
   */
  getCurrentContext() {
    return {
      url: this.page.url(),
      timestamp: Date.now()
    };
  }
  
  /**
   * 載入修復歷史
   */
  async loadRepairHistory() {
    // TODO: 從檔案或資料庫載入歷史記錄
    // 範例實作：
    try {
      const fs = require('fs');
      const historyPath = './repair-history.json';
      
      if (fs.existsSync(historyPath)) {
        const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        this.repairHistory = history;
      }
    } catch (error) {
      console.log('無法載入修復歷史:', error.message);
    }
  }
  
  /**
   * 載入選擇器映射
   */
  async loadSelectorMappings() {
    // TODO: 從設定檔載入選擇器映射
    // 範例映射：
    this.selectorMappings.set('#old-button', '[data-testid="new-button"]');
    this.selectorMappings.set('.deprecated-class', '.updated-class');
  }
  
  /**
   * 自動修復執行包裝器
   * @param {*} operation - operation 參數
   * @param {*} context - context 參數
   */
  async autoFix(operation, context = {}) {
    let lastError;
    let repairAttempts = 0;
    
    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        // 嘗試執行操作
        const result = await operation();
        
        // 成功執行，記錄並返回
        if (repairAttempts > 0) {
          this.recordSuccessfulRepair(context, repairAttempts);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        repairAttempts++;
        
        console.log(`嘗試 ${attempt + 1} 失敗: ${error.message}`);
        
        // 嘗試自動修復
        if (this.options.healingEnabled && attempt < this.options.maxRetries - 1) {
          const repaired = await this.attemptRepair(error, context);
          
          if (repaired) {
            console.log('✅ 自動修復成功，重新嘗試操作');
            // 更新操作以使用修復後的方案
            operation = repaired.operation || operation;
          } else {
            // 無法修復，等待後重試
            await this.page.waitForTimeout(1000 * Math.pow(2, attempt));
          }
        }
      }
    }
    
    // 所有嘗試都失敗
    this.recordFailedRepair(lastError, context, repairAttempts);
    throw lastError;
  }
  
  /**
   * 嘗試修復錯誤
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async attemptRepair(error, context) {
    // 判斷錯誤類型並選擇修復策略
    if (this.isSelectorError(error)) {
      return await this.repairSelector(error, context);
    }
    
    if (this.isTimingError(error)) {
      return await this.repairTiming(error, context);
    }
    
    if (this.isNetworkError(error)) {
      return await this.repairNetwork(error, context);
    }
    
    return null;
  }
  
  /**
   * 判斷是否為選擇器錯誤
   * @param {*} error - error 參數
   */
  isSelectorError(error) {
    const message = error.message.toLowerCase();
    return message.includes('selector') || 
           message.includes('element') ||
           message.includes('locator');
  }
  
  /**
   * 判斷是否為時序錯誤
   * @param {*} error - error 參數
   */
  isTimingError(error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || 
           message.includes('waiting');
  }
  
  /**
   * 判斷是否為網路錯誤
   * @param {*} error - error 參數
   */
  isNetworkError(error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') ||
           message.includes('request');
  }
  
  /**
   * 修復選擇器問題
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async repairSelector(error, context) {
    console.log('🔧 嘗試修復選擇器...');
    
    // 從錯誤中提取選擇器
    const selector = this.extractSelector(error);
    if (!selector) return null;
    
    // 檢查是否有映射
    if (this.selectorMappings.has(selector)) {
      const newSelector = this.selectorMappings.get(selector);
      console.log(`使用映射選擇器: ${selector} → ${newSelector}`);
      
      return {
        success: true,
        type: 'selector_mapping',
        original: selector,
        fixed: newSelector
      };
    }
    
    // 嘗試其他修復策略
    // TODO: 實作更多選擇器修復策略
    
    return null;
  }
  
  /**
   * 修復時序問題
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async repairTiming(error, context) {
    console.log('🔧 嘗試修復時序問題...');
    
    // 增加等待時間
    await this.page.waitForTimeout(2000);
    
    // 等待網路空閒
    await this.page.waitForLoadState('networkidle');
    
    return {
      success: true,
      type: 'timing_fix',
      strategy: 'wait_for_idle'
    };
  }
  
  /**
   * 修復網路問題
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async repairNetwork(error, context) {
    console.log('🔧 嘗試修復網路問題...');
    
    // 等待並重試
    await this.page.waitForTimeout(3000);
    
    return {
      success: true,
      type: 'network_retry',
      strategy: 'wait_and_retry'
    };
  }
  
  /**
   * 從錯誤中提取選擇器
   * @param {*} error - error 參數
   */
  extractSelector(error) {
    const match = error.message.match(/selector[:\s]+"([^"]+)"/i);
    return match ? match[1] : null;
  }
  
  /**
   * 記錄成功的修復
   * @param {*} context - context 參數
   * @param {*} attempts - attempts 參數
   */
  recordSuccessfulRepair(context, attempts) {
    const record = {
      timestamp: Date.now(),
      success: true,
      attempts,
      context
    };
    
    this.repairHistory.push(record);
    
    if (this.options.reportingEnabled) {
      console.log(`✅ 修復成功，嘗試次數: ${attempts}`);
    }
  }
  
  /**
   * 記錄失敗的修復
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   * @param {*} attempts - attempts 參數
   */
  recordFailedRepair(error, context, attempts) {
    const record = {
      timestamp: Date.now(),
      success: false,
      attempts,
      error: error.message,
      context
    };
    
    this.repairHistory.push(record);
    
    if (this.options.reportingEnabled) {
      console.log(`❌ 修復失敗，嘗試次數: ${attempts}`);
    }
  }
  
  /**
   * 驗證修復效果
   * @param {*} validation - validation 參數
   */
  async validate(validation) {
    console.log('🔍 驗證修復效果...');
    
    try {
      await validation();
      console.log('✅ 驗證通過');
      return true;
    } catch (error) {
      console.log('❌ 驗證失敗:', error.message);
      return false;
    }
  }
  
  /**
   * 生成修復報告
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      totalRepairs: this.repairHistory.length,
      successfulRepairs: this.repairHistory.filter(r => r.success).length,
      failedRepairs: this.repairHistory.filter(r => !r.success).length,
      patterns: Array.from(this.failurePatterns.entries()),
      mappings: Array.from(this.selectorMappings.entries()),
      history: this.repairHistory.slice(-10) // 最近10筆
    };
    
    console.log('\n=== 自我修復系統報告 ===');
    console.log(`總修復次數: ${report.totalRepairs}`);
    console.log(`成功: ${report.successfulRepairs}`);
    console.log(`失敗: ${report.failedRepairs}`);
    console.log(`成功率: ${(report.successfulRepairs / report.totalRepairs * 100).toFixed(2)}%`);
    
    if (report.patterns.length > 0) {
      console.log('\n常見失敗模式:');
      report.patterns.forEach(([pattern, data]) => {
        console.log(`  ${pattern}: ${data.count} 次`);
      });
    }
    
    return report;
  }
  
  /**
   * 保存修復歷史
   */
  async saveRepairHistory() {
    try {
      const fs = require('fs');
      fs.writeFileSync(
        './repair-history.json',
        JSON.stringify(this.repairHistory, null, 2)
      );
      console.log('✅ 修復歷史已保存');
    } catch (error) {
      console.error('無法保存修復歷史:', error.message);
    }
  }
}

/**
 * 自我修復測試範例
 */
test.describe('自我修復測試範例', () => {
  let repairSystem;
  
  test.beforeEach(async ({ page }) => {
    // 初始化自我修復系統
    repairSystem = new SelfRepairSystem(page, {
      maxRetries: 3,
      healingEnabled: true,
      autoFixEnabled: true,
      reportingEnabled: true
    });
    
    await repairSystem.initialize();
  });
  
  test.afterEach(async () => {
    // 生成報告並保存歷史
    repairSystem.generateReport();
    await repairSystem.saveRepairHistory();
  });
  
  test('展示自動修復功能', async ({ page }) => {
    await page.goto('http://localhost:3000/demo');
    
    // 使用自動修復包裝器執行操作
    await repairSystem.autoFix(async () => {
      // 這個選擇器可能會失效
      await page.click('#dynamic-button');
    }, {
      action: 'click',
      element: 'dynamic-button'
    });
    
    // 填寫表單（帶自動修復）
    await repairSystem.autoFix(async () => {
      await page.fill('input[name="username"]', 'testuser');
    }, {
      action: 'fill',
      field: 'username'
    });
    
    // 驗證結果
    await repairSystem.validate(async () => {
      const result = page;
      await expect(result).toHaveText('.result', 'Success');
    });
  });
  
  test('批量操作自動修復', async ({ page }) => {
    await page.goto('http://localhost:3000/form');
    
    const formFields = [
      { selector: '#name', value: 'Test User' },
      { selector: '#email', value: 'test@example.com' },
      { selector: '#phone', value: '1234567890' }
    ];
    
    // 批量填寫表單，每個都有自動修復
    for (const field of formFields) {
      await repairSystem.autoFix(async () => {
        await page.fill(field.selector, field.value);
      }, {
        action: 'fill',
        field: field.selector
      });
    }
    
    // 提交表單
    await repairSystem.autoFix(async () => {
      await page.click('button[type="submit"]');
      await page.waitForSelector('.success-message');
    }, {
      action: 'submit',
      form: 'user-form'
    });
  });
});

/**
 * 進階自我修復功能
 */
class AdvancedSelfRepair extends SelfRepairSystem {
  /**
   *
   * @param {*} page - page 參數
   * @param {*} options - options 參數
   */
  constructor(page, options = {}) {
    super(page, options);
    
    // 進階功能配置
    this.aiEnabled = options.aiEnabled || false;
    this.learningEnabled = options.learningEnabled || false;
    this.predictiveRepair = options.predictiveRepair || false;
  }
  
  /**
   * AI 輔助修復
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async aiAssistedRepair(error, context) {
    if (!this.aiEnabled) return null;
    
    // TODO: 整合 AI API 進行智能修復
    console.log('🤖 使用 AI 輔助修復...');
    
    // 模擬 AI 分析
    const aiSuggestion = await this.getAISuggestion(error, context);
    
    if (aiSuggestion) {
      return await this.applyAISuggestion(aiSuggestion);
    }
    
    return null;
  }
  
  /**
   * 獲取 AI 建議
   * @param {*} error - error 參數
   * @param {*} context - context 參數
   */
  async getAISuggestion(error, context) {
    // TODO: 呼叫 AI API
    // 這裡是模擬實作
    return {
      type: 'selector_update',
      suggestion: '[data-testid="suggested-selector"]',
      confidence: 0.85
    };
  }
  
  /**
   * 應用 AI 建議
   * @param {*} suggestion - suggestion 參數
   */
  async applyAISuggestion(suggestion) {
    if (suggestion.confidence < 0.7) {
      console.log('AI 建議信心度過低，跳過');
      return null;
    }
    
    console.log(`應用 AI 建議 (信心度: ${suggestion.confidence})`);
    
    return {
      success: true,
      type: 'ai_suggestion',
      applied: suggestion
    };
  }
  
  /**
   * 學習型修復
   */
  async learnFromRepairs() {
    if (!this.learningEnabled) return;
    
    // 分析修復歷史，學習模式
    const patterns = this.analyzeRepairPatterns();
    
    // 更新修復策略優先級
    this.updateRepairStrategies(patterns);
  }
  
  /**
   * 分析修復模式
   */
  analyzeRepairPatterns() {
    const patterns = {};
    
    this.repairHistory.forEach(repair => {
      if (repair.success) {
        const key = `${repair.context.action}_${repair.type}`;
        patterns[key] = (patterns[key] || 0) + 1;
      }
    });
    
    return patterns;
  }
  
  /**
   * 更新修復策略
   * @param {*} patterns - patterns 參數
   */
  updateRepairStrategies(patterns) {
    // 根據成功模式調整策略優先級
    console.log('根據學習結果更新修復策略');
  }
  
  /**
   * 預測性修復
   * @param {*} operation - operation 參數
   * @param {*} context - context 參數
   */
  async predictAndPrevent(operation, context) {
    if (!this.predictiveRepair) return null;
    
    // 預測可能的失敗
    const prediction = await this.predictFailure(operation, context);
    
    if (prediction.probability > 0.7) {
      console.log(`預測到可能失敗 (機率: ${prediction.probability})`);
      
      // 預先應用修復
      return await this.applyPreventiveRepair(prediction);
    }
    
    return null;
  }
  
  /**
   * 預測失敗
   * @param {*} operation - operation 參數
   * @param {*} context - context 參數
   */
  async predictFailure(operation, context) {
    // TODO: 實作失敗預測邏輯
    return {
      probability: 0.8,
      type: 'selector_failure',
      suggestion: 'use_alternative_selector'
    };
  }
  
  /**
   * 應用預防性修復
   * @param {*} prediction - prediction 參數
   */
  async applyPreventiveRepair(prediction) {
    console.log('應用預防性修復措施');
    
    // TODO: 實作預防性修復
    return {
      success: true,
      type: 'preventive',
      applied: prediction.suggestion
    };
  }
}

module.exports = {
  SelfRepairSystem,
  AdvancedSelfRepair
};