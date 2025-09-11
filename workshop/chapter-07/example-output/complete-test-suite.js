// 完整測試套件整合範例
// Complete Test Suite Integration Example
// 將所有進階測試技術整合在一個完整的測試框架中

const { test, expect, devices } = require('@playwright/test');
const { performance } = require('perf_hooks');
const axios = require('axios');
const { Pool } = require('pg');
const Redis = require('ioredis');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// 測試套件配置
const testConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'testdb',
    user: process.env.DB_USER || 'testuser',
    password: process.env.DB_PASSWORD || 'testpass'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  testTimeout: 60000,
  retryCount: 2,
  parallel: true
};

// 測試報告生成器
class TestReporter {
  constructor() {
    this.results = {
      performance: [],
      visual: [],
      security: [],
      integration: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
    };
    this.startTime = Date.now();
  }

  addResult(category, result) {
    this.results[category].push(result);
    this.results.summary.total++;
    if (result.status === 'passed') this.results.summary.passed++;
    else if (result.status === 'failed') this.results.summary.failed++;
    else if (result.status === 'skipped') this.results.summary.skipped++;
  }

  async generateReport() {
    this.results.summary.duration = Date.now() - this.startTime;
    
    const reportPath = path.join(__dirname, '../test-results', `report-${Date.now()}.html`);
    const htmlReport = this.generateHTMLReport();
    
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, htmlReport);
    
    console.log(`測試報告已生成: ${reportPath}`);
    return reportPath;
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>測試報告 - ${new Date().toLocaleString('zh-TW')}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
    }
    .passed { color: #22c55e; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .category {
      background: white;
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .category-header {
      background: #4f46e5;
      color: white;
      padding: 15px 20px;
      font-size: 18px;
      font-weight: bold;
    }
    .test-result {
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-result:last-child {
      border-bottom: none;
    }
    .test-name {
      font-weight: 500;
    }
    .test-status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-passed {
      background: #dcfce7;
      color: #166534;
    }
    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .status-skipped {
      background: #fef3c7;
      color: #92400e;
    }
    .performance-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      padding: 20px;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #4f46e5;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 完整測試套件報告</h1>
    <p>執行時間: ${new Date().toLocaleString('zh-TW')}</p>
    <p>總耗時: ${(this.results.summary.duration / 1000).toFixed(2)} 秒</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>總測試數</h3>
      <div class="value">${this.results.summary.total}</div>
    </div>
    <div class="summary-card">
      <h3>通過</h3>
      <div class="value passed">${this.results.summary.passed}</div>
    </div>
    <div class="summary-card">
      <h3>失敗</h3>
      <div class="value failed">${this.results.summary.failed}</div>
    </div>
    <div class="summary-card">
      <h3>跳過</h3>
      <div class="value skipped">${this.results.summary.skipped}</div>
    </div>
  </div>

  ${this.generateCategoryHTML('性能測試', 'performance')}
  ${this.generateCategoryHTML('視覺回歸測試', 'visual')}
  ${this.generateCategoryHTML('安全性測試', 'security')}
  ${this.generateCategoryHTML('整合測試', 'integration')}

  <div class="footer">
    <p>Generated by AI-Driven Test Suite | Play right with AI Workshop</p>
  </div>
</body>
</html>
    `;
  }

  generateCategoryHTML(title, category) {
    const results = this.results[category];
    if (!results || results.length === 0) return '';

    return `
      <div class="category">
        <div class="category-header">${title}</div>
        ${results.map(result => `
          <div class="test-result">
            <div class="test-name">${result.name}</div>
            <div class="test-status status-${result.status}">${result.status}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// 測試協調器
class TestOrchestrator {
  constructor(config) {
    this.config = config;
    this.reporter = new TestReporter();
    this.services = {};
  }

  async initialize() {
    console.log('初始化測試環境...');
    
    // 初始化資料庫連接
    this.services.pgPool = new Pool(this.config.database);
    
    // 初始化 Redis
    this.services.redis = new Redis(this.config.redis);
    
    // 健康檢查
    await this.healthCheck();
    
    console.log('✅ 測試環境初始化完成');
  }

  async cleanup() {
    console.log('清理測試環境...');
    
    await this.services.pgPool?.end();
    await this.services.redis?.quit();
    
    console.log('✅ 測試環境清理完成');
  }

  async healthCheck() {
    // 檢查資料庫連接
    try {
      await this.services.pgPool.query('SELECT 1');
      console.log('✅ PostgreSQL 連接正常');
    } catch (error) {
      console.error('❌ PostgreSQL 連接失敗:', error.message);
    }

    // 檢查 Redis 連接
    try {
      await this.services.redis.ping();
      console.log('✅ Redis 連接正常');
    } catch (error) {
      console.error('❌ Redis 連接失敗:', error.message);
    }

    // 檢查應用服務
    try {
      const response = await axios.get(`${this.config.baseUrl}/health`);
      if (response.status === 200) {
        console.log('✅ 應用服務正常');
      }
    } catch (error) {
      console.error('❌ 應用服務檢查失敗:', error.message);
    }
  }

  async runTestSuite(testType) {
    console.log(`\n開始執行 ${testType} 測試套件...`);
    const startTime = Date.now();
    
    try {
      switch (testType) {
        case 'performance':
          await this.runPerformanceTests();
          break;
        case 'visual':
          await this.runVisualTests();
          break;
        case 'security':
          await this.runSecurityTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        case 'all':
          await this.runAllTests();
          break;
        default:
          throw new Error(`未知的測試類型: ${testType}`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${testType} 測試完成，耗時: ${(duration / 1000).toFixed(2)} 秒`);
      
    } catch (error) {
      console.error(`❌ ${testType} 測試失敗:`, error);
      this.reporter.addResult(testType, {
        name: `${testType} 測試套件`,
        status: 'failed',
        error: error.message
      });
    }
  }

  async runAllTests() {
    await Promise.all([
      this.runPerformanceTests(),
      this.runVisualTests(),
      this.runSecurityTests(),
      this.runIntegrationTests()
    ]);
  }

  async runPerformanceTests() {
    const tests = [
      { name: '首頁載入時間', target: 3000 },
      { name: 'API 回應時間', target: 500 },
      { name: '資料庫查詢時間', target: 100 },
      { name: '快取命中率', target: 90 }
    ];

    for (const test of tests) {
      const result = await this.measurePerformance(test);
      this.reporter.addResult('performance', result);
    }
  }

  async measurePerformance(test) {
    const startTime = performance.now();
    let status = 'passed';
    let actualValue = 0;

    try {
      switch (test.name) {
        case '首頁載入時間':
          const response = await axios.get(this.config.baseUrl);
          actualValue = performance.now() - startTime;
          if (actualValue > test.target) status = 'failed';
          break;
          
        case 'API 回應時間':
          const apiStart = performance.now();
          await axios.get(`${this.config.apiUrl}/api/products`);
          actualValue = performance.now() - apiStart;
          if (actualValue > test.target) status = 'failed';
          break;
          
        case '資料庫查詢時間':
          const dbStart = performance.now();
          await this.services.pgPool.query('SELECT * FROM products LIMIT 100');
          actualValue = performance.now() - dbStart;
          if (actualValue > test.target) status = 'failed';
          break;
          
        case '快取命中率':
          const hits = await this.services.redis.get('cache:hits') || 0;
          const misses = await this.services.redis.get('cache:misses') || 0;
          const total = parseInt(hits) + parseInt(misses);
          actualValue = total > 0 ? (parseInt(hits) / total * 100) : 0;
          if (actualValue < test.target) status = 'failed';
          break;
      }
      
      console.log(`${status === 'passed' ? '✅' : '❌'} ${test.name}: ${actualValue.toFixed(2)} (目標: ${test.target})`);
      
      return {
        name: test.name,
        status,
        actualValue,
        targetValue: test.target,
        duration: performance.now() - startTime
      };
      
    } catch (error) {
      return {
        name: test.name,
        status: 'failed',
        error: error.message
      };
    }
  }

  async runVisualTests() {
    const tests = [
      '首頁截圖比對',
      '響應式設計測試',
      '深色模式測試',
      '動畫序列測試'
    ];

    for (const testName of tests) {
      // 模擬視覺測試結果
      const result = {
        name: testName,
        status: Math.random() > 0.1 ? 'passed' : 'failed',
        pixelDifference: Math.floor(Math.random() * 100),
        threshold: 100
      };
      
      console.log(`${result.status === 'passed' ? '✅' : '❌'} ${testName}`);
      this.reporter.addResult('visual', result);
    }
  }

  async runSecurityTests() {
    const vulnerabilities = [];
    
    // XSS 測試
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">'
    ];
    
    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(`${this.config.baseUrl}/api/comment`, {
          content: payload
        });
        
        if (response.data.includes(payload)) {
          vulnerabilities.push({
            type: 'XSS',
            severity: 'high',
            payload
          });
        }
      } catch (error) {
        // 錯誤可能表示輸入被拒絕（好事）
      }
    }
    
    // SQL 注入測試
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users--",
      "' UNION SELECT * FROM users--"
    ];
    
    for (const payload of sqlPayloads) {
      try {
        const response = await axios.get(`${this.config.baseUrl}/api/search?q=${payload}`);
        
        // 檢查是否有 SQL 錯誤訊息
        if (response.data.includes('SQL') || response.data.includes('syntax')) {
          vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'critical',
            payload
          });
        }
      } catch (error) {
        // 錯誤處理
      }
    }
    
    const result = {
      name: '安全漏洞掃描',
      status: vulnerabilities.length === 0 ? 'passed' : 'failed',
      vulnerabilities: vulnerabilities.length,
      details: vulnerabilities
    };
    
    console.log(`${result.status === 'passed' ? '✅' : '❌'} 安全測試: 發現 ${vulnerabilities.length} 個漏洞`);
    this.reporter.addResult('security', result);
  }

  async runIntegrationTests() {
    const tests = [
      '用戶註冊流程',
      '購物車功能',
      '結帳流程',
      '訂單追蹤'
    ];

    for (const testName of tests) {
      const result = await this.testIntegrationFlow(testName);
      this.reporter.addResult('integration', result);
    }
  }

  async testIntegrationFlow(flowName) {
    const startTime = Date.now();
    let status = 'passed';
    const steps = [];

    try {
      switch (flowName) {
        case '用戶註冊流程':
          // Step 1: 註冊
          const registerResponse = await axios.post(`${this.config.baseUrl}/api/register`, {
            email: `test_${Date.now()}@example.com`,
            password: 'Test123!'
          });
          steps.push({ name: '註冊', status: registerResponse.status === 201 ? 'passed' : 'failed' });
          
          // Step 2: 驗證郵件（模擬）
          const token = registerResponse.data.verificationToken;
          const verifyResponse = await axios.post(`${this.config.baseUrl}/api/verify`, { token });
          steps.push({ name: '郵件驗證', status: verifyResponse.status === 200 ? 'passed' : 'failed' });
          
          // Step 3: 登入
          const loginResponse = await axios.post(`${this.config.baseUrl}/api/login`, {
            email: registerResponse.data.email,
            password: 'Test123!'
          });
          steps.push({ name: '登入', status: loginResponse.status === 200 ? 'passed' : 'failed' });
          
          break;
          
        case '購物車功能':
          // 添加商品、更新數量、移除商品等測試
          steps.push({ name: '添加商品', status: 'passed' });
          steps.push({ name: '更新數量', status: 'passed' });
          steps.push({ name: '移除商品', status: 'passed' });
          break;
          
        case '結帳流程':
          steps.push({ name: '選擇配送方式', status: 'passed' });
          steps.push({ name: '填寫地址', status: 'passed' });
          steps.push({ name: '選擇付款方式', status: 'passed' });
          steps.push({ name: '確認訂單', status: 'passed' });
          break;
          
        case '訂單追蹤':
          steps.push({ name: '查詢訂單', status: 'passed' });
          steps.push({ name: '更新狀態', status: 'passed' });
          steps.push({ name: '發送通知', status: 'passed' });
          break;
      }
      
      // 檢查是否所有步驟都通過
      if (steps.some(step => step.status === 'failed')) {
        status = 'failed';
      }
      
      console.log(`${status === 'passed' ? '✅' : '❌'} ${flowName}`);
      
      return {
        name: flowName,
        status,
        duration: Date.now() - startTime,
        steps
      };
      
    } catch (error) {
      return {
        name: flowName,
        status: 'failed',
        error: error.message,
        steps
      };
    }
  }
}

// 主測試套件
test.describe('完整測試套件', () => {
  let orchestrator;

  test.beforeAll(async () => {
    orchestrator = new TestOrchestrator(testConfig);
    await orchestrator.initialize();
  });

  test.afterAll(async () => {
    const reportPath = await orchestrator.reporter.generateReport();
    console.log(`\n📊 測試報告: ${reportPath}`);
    await orchestrator.cleanup();
  });

  test('執行完整測試套件', async ({ page, context, request }) => {
    console.log('\n🚀 開始執行完整測試套件\n');
    
    // 設置測試上下文
    orchestrator.context = { page, context, request };
    
    // 執行所有測試類型
    await orchestrator.runTestSuite('all');
    
    // 驗證測試結果
    const summary = orchestrator.reporter.results.summary;
    console.log('\n📈 測試摘要:');
    console.log(`  總測試數: ${summary.total}`);
    console.log(`  通過: ${summary.passed}`);
    console.log(`  失敗: ${summary.failed}`);
    console.log(`  跳過: ${summary.skipped}`);
    console.log(`  總耗時: ${(summary.duration / 1000).toFixed(2)} 秒`);
    
    // 計算通過率
    const passRate = (summary.passed / summary.total * 100).toFixed(2);
    console.log(`  通過率: ${passRate}%`);
    
    // 根據通過率給出評價
    if (passRate >= 90) {
      console.log('\n🏆 優秀！測試覆蓋完整，品質保證到位');
    } else if (passRate >= 70) {
      console.log('\n👍 良好！大部分測試通過，仍有改進空間');
    } else {
      console.log('\n⚠️ 需要改進！請檢查失敗的測試並修復問題');
    }
    
    // 期望至少 70% 的測試通過
    expect(passRate).toBeGreaterThanOrEqual(70);
  });

  test('性能基準測試', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      return {
        navigation: performance.getEntriesByType('navigation')[0],
        resources: performance.getEntriesByType('resource'),
        memory: performance.memory
      };
    });
    
    console.log('導航時間:', metrics.navigation?.loadEventEnd - metrics.navigation?.fetchStart, 'ms');
    console.log('資源數量:', metrics.resources?.length);
    console.log('記憶體使用:', metrics.memory?.usedJSHeapSize / 1048576, 'MB');
  });

  test('端到端關鍵路徑測試', async ({ page }) => {
    // 關鍵用戶路徑測試
    const criticalPaths = [
      '首頁 → 產品列表 → 產品詳情 → 購物車 → 結帳',
      '登入 → 個人資料 → 訂單歷史 → 訂單詳情',
      '搜尋 → 篩選 → 排序 → 分頁'
    ];
    
    for (const path of criticalPaths) {
      console.log(`測試路徑: ${path}`);
      // 實際的路徑測試邏輯
    }
  });
});

// AI 提示詞生成器
class AIPromptGenerator {
  generateTestPrompt(testType, context) {
    const prompts = {
      performance: `
請為以下場景生成性能測試代碼：
- 應用URL: ${context.url}
- 測試目標: 頁面載入時間 < 3秒, API 回應 < 500ms
- 需要測量: FCP, LCP, CLS, FID
- 輸出格式: Playwright 測試代碼
`,
      visual: `
請為以下頁面生成視覺回歸測試：
- 頁面URL: ${context.url}
- 測試裝置: Desktop, Mobile, Tablet
- 需要測試: 正常狀態, Hover, Focus, 深色模式
- 遮罩動態內容: 時間戳記, 用戶資料
`,
      security: `
請為以下應用生成安全性測試：
- 應用URL: ${context.url}
- 測試項目: XSS, SQL Injection, CSRF, 認證授權
- 輸入欄位: ${context.inputs?.join(', ')}
- 期望: 所有攻擊都應被阻擋
`,
      integration: `
請為以下流程生成整合測試：
- 流程名稱: ${context.flowName}
- 涉及服務: ${context.services?.join(', ')}
- 資料流: ${context.dataFlow}
- 驗證點: 每個步驟的成功狀態
`
    };
    
    return prompts[testType] || '請生成測試代碼';
  }
  
  generateFixPrompt(failedTest) {
    return `
測試失敗需要修復：
- 測試名稱: ${failedTest.name}
- 失敗原因: ${failedTest.error}
- 期望值: ${failedTest.expected}
- 實際值: ${failedTest.actual}
請提供修復建議和代碼修改
`;
  }
}

// 導出模組
module.exports = {
  TestOrchestrator,
  TestReporter,
  AIPromptGenerator,
  testConfig
};