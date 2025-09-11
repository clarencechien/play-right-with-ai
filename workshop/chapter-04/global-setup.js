/**
 * 全域設定檔案
 * 在所有測試執行前執行一次
 */

const { chromium } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

async function globalSetup(config) {
  console.log('🚀 開始全域設定...');
  
  // 1. 建立必要的目錄
  const directories = [
    'test-results',
    'screenshots',
    'videos',
    'traces',
    'test-data'
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 建立目錄: ${dir}`);
  }
  
  // 2. 清理舊的測試結果（可選）
  if (process.env.CLEAN_RESULTS === 'true') {
    console.log('🧹 清理舊的測試結果...');
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const files = await fs.readdir(testResultsDir);
    for (const file of files) {
      await fs.unlink(path.join(testResultsDir, file)).catch(() => {});
    }
  }
  
  // 3. 準備測試資料
  console.log('📊 準備測試資料...');
  const testData = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    baseUrl: config.use.baseURL,
    browsers: config.projects.map(p => p.name)
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'test-data', 'test-metadata.json'),
    JSON.stringify(testData, null, 2)
  );
  
  // 4. 驗證測試環境（可選）
  if (!process.env.SKIP_ENV_CHECK) {
    console.log('🔍 驗證測試環境...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // 檢查應用程式是否可訪問
      const response = await page.goto(config.use.baseURL, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      if (!response || !response.ok()) {
        console.error(`❌ 無法訪問應用程式: ${config.use.baseURL}`);
        throw new Error('應用程式不可用');
      }
      
      console.log(`✅ 應用程式可訪問: ${config.use.baseURL}`);
      
      // 檢查關鍵元素是否存在
      const todoInput = await page.locator('[data-testid="todo-input"]').isVisible();
      if (!todoInput) {
        console.warn('⚠️ 警告: 找不到 TODO 輸入框');
      }
      
    } catch (error) {
      console.error('❌ 環境驗證失敗:', error.message);
      if (process.env.CI === 'true') {
        throw error; // 在 CI 環境中失敗
      }
    } finally {
      await context.close();
      await browser.close();
    }
  }
  
  // 5. 設定測試用戶（如果需要認證）
  if (process.env.REQUIRES_AUTH === 'true') {
    console.log('🔐 設定測試用戶...');
    // 這裡可以創建測試用戶或獲取認證令牌
    // const authToken = await setupTestUser();
    // process.env.TEST_AUTH_TOKEN = authToken;
  }
  
  // 6. 記錄環境資訊
  console.log('\n📋 測試環境資訊:');
  console.log(`   Node 版本: ${process.version}`);
  console.log(`   作業系統: ${process.platform}`);
  console.log(`   CPU 架構: ${process.arch}`);
  console.log(`   測試 URL: ${config.use.baseURL}`);
  console.log(`   並行數: ${config.workers || '預設'}`);
  console.log(`   重試次數: ${config.retries}`);
  console.log(`   測試專案: ${config.projects.map(p => p.name).join(', ')}`);
  
  // 7. 初始化測試報告服務（如果使用外部服務）
  if (process.env.REPORT_SERVICE_URL) {
    console.log('📈 初始化測試報告服務...');
    // await initializeReportService();
  }
  
  console.log('\n✨ 全域設定完成！\n');
  
  // 返回清理函數（可選）
  return async () => {
    console.log('執行全域設定清理...');
  };
}

module.exports = globalSetup;