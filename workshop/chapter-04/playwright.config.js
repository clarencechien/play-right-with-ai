/**
 * Playwright 配置檔案
 * 用於 "Play right with AI" Workshop Chapter 4
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

const { defineConfig, devices } = require('@playwright/test');

/**
 * 從環境變數讀取配置
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CI = process.env.CI === 'true';

module.exports = defineConfig({
  // 測試檔案位置
  testDir: './tests',
  
  // 測試執行的最大並行數
  workers: CI ? 2 : undefined,
  
  // 每個測試的超時時間
  timeout: 30 * 1000,
  
  // 測試失敗時的重試次數
  retries: CI ? 2 : 1,
  
  // 報告器配置
  reporter: [
    // 終端機輸出
    ['list'],
    // HTML 報告
    ['html', { 
      outputFolder: 'playwright-report',
      open: !CI ? 'never' : 'always'
    }],
    // JSON 報告（用於 CI）
    ['json', { outputFile: 'test-results.json' }],
    // JUnit XML（用於 CI 整合）
    CI ? ['junit', { outputFile: 'junit.xml' }] : null,
  ].filter(Boolean),
  
  // 全域測試配置
  use: {
    // 基礎 URL
    baseURL: BASE_URL,
    
    // 追蹤設定（用於除錯）
    trace: CI ? 'on-first-retry' : 'retain-on-failure',
    
    // 截圖設定
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // 影片錄製
    video: CI ? 'retain-on-failure' : 'on',
    
    // 動作超時
    actionTimeout: 15 * 1000,
    
    // 導航超時
    navigationTimeout: 30 * 1000,
    
    // 測試 ID 屬性
    testIdAttribute: 'data-testid',
    
    // 瀏覽器視窗大小
    viewport: { width: 1280, height: 720 },
    
    // 忽略 HTTPS 錯誤
    ignoreHTTPSErrors: true,
    
    // 使用者代理（可選）
    // userAgent: 'Playwright Test Agent',
    
    // 額外 HTTP 標頭（可選）
    // extraHTTPHeaders: {
    //   'X-Test-Type': 'E2E'
    // },
    
    // 地理位置（可選）
    // geolocation: { longitude: 121.5654, latitude: 25.0330 },
    
    // 語言設定
    locale: 'zh-TW',
    
    // 時區
    timezoneId: 'Asia/Taipei',
  },
  
  // 專案配置 - 不同瀏覽器和裝置
  projects: [
    // 桌面瀏覽器
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome 特定設定
        launchOptions: {
          args: ['--disable-dev-shm-usage']
        }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox 特定設定
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.video.enabled': true,
            'media.navigator.streams.fake': true
          }
        }
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit 特定設定
      },
    },
    
    // Microsoft Edge
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },
    
    // 行動裝置
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // 行動版 Chrome 設定
      },
    },
    
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        // 行動版 Safari 設定
      },
    },
    
    // 平板裝置
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
      },
    },
    
    // 特定視窗大小測試
    {
      name: 'desktop-1080p',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    {
      name: 'desktop-720p',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
  ],
  
  // 全域設定 - 在所有測試前執行一次
  globalSetup: require.resolve('./global-setup.js'),
  
  // 全域清理 - 在所有測試後執行一次
  globalTeardown: require.resolve('./global-teardown.js'),
  
  // Web Server 配置（自動啟動測試伺服器）
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    timeout: 120 * 1000,
    reuseExistingServer: !CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // 輸出資料夾
  outputDir: 'test-results/',
  
  // 測試比對模式
  grep: /@smoke/,  // 只執行包含 @smoke 標籤的測試
  grepInvert: /@skip/,  // 跳過包含 @skip 標籤的測試
  
  // 最大失敗數（達到後停止執行）
  maxFailures: CI ? 10 : undefined,
  
  // 保留測試輸出
  preserveOutput: 'failures-only',
  
  // 更新快照
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' ? 'all' : 'missing',
  
  // 使用的瀏覽器引擎
  // 可以透過環境變數覆寫
  use: process.env.BROWSER ? {
    browserName: process.env.BROWSER
  } : undefined,
});

/**
 * 額外的測試配置選項
 */

// 分片執行配置（用於平行化）
if (process.env.SHARD) {
  const [current, total] = process.env.SHARD.split('/').map(Number);
  module.exports.shard = { current, total };
}

// 調試模式配置
if (process.env.DEBUG) {
  module.exports.use = {
    ...module.exports.use,
    headless: false,
    video: 'on',
    trace: 'on',
    launchOptions: {
      slowMo: 500
    }
  };
  module.exports.workers = 1;
  module.exports.timeout = 0; // 無限超時
}

// 效能測試模式
if (process.env.PERF_TEST) {
  module.exports.use = {
    ...module.exports.use,
    video: 'off',
    trace: 'off',
    screenshot: 'off'
  };
}

/**
 * 環境變數說明：
 * 
 * BASE_URL - 測試目標 URL
 * CI - 是否在 CI 環境執行
 * BROWSER - 指定瀏覽器 (chromium/firefox/webkit)
 * SHARD - 分片執行 (例如: "1/4")
 * DEBUG - 除錯模式
 * PERF_TEST - 效能測試模式
 * UPDATE_SNAPSHOTS - 更新快照
 * 
 * 使用範例：
 * BASE_URL=https://example.com npx playwright test
 * BROWSER=firefox npx playwright test
 * DEBUG=true npx playwright test
 * SHARD=1/4 npx playwright test
 */