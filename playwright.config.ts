import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 配置 - Play right with AI 工作坊
 * 
 * 此配置針對工作坊的測試需求進行優化
 * 支援多瀏覽器測試、行動裝置測試、以及 AI 整合測試
 */
export default defineConfig({
  // 測試目錄
  testDir: './tests',
  
  // 完全平行執行
  fullyParallel: true,
  
  // CI 環境禁止 .only
  forbidOnly: !!process.env.CI,
  
  // 重試策略
  retries: process.env.CI ? 2 : 0,
  
  // 工作執行緒數量
  workers: process.env.CI ? 1 : undefined,
  
  // 報告格式
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],
  
  // 全域測試設定
  use: {
    // 基礎 URL - 預設為本地開發環境
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // 追蹤設定
    trace: 'on-first-retry',
    
    // 截圖策略
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    
    // 影片錄製
    video: 'retain-on-failure',
    
    // 動作超時
    actionTimeout: 10000,
    
    // 導航超時
    navigationTimeout: 30000,
    
    // 測試 ID 屬性
    testIdAttribute: 'data-testid',
  },
  
  // 專案配置 - 支援多種瀏覽器和裝置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
    // AI 整合測試專用配置
    {
      name: 'ai-integration',
      use: {
        ...devices['Desktop Chrome'],
        // 慢速模式，便於 AI 觀察
        slowMo: 100,
        // 保留所有追蹤資訊
        trace: 'on',
        video: 'on',
      },
    },
  ],
  
  // 全域設定
  globalSetup: './tests/utils/global-setup.ts',
  globalTeardown: './tests/utils/global-teardown.ts',
  
  // 輸出資料夾
  outputDir: 'test-results/',
  
  // Web 伺服器配置（開發環境）
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});