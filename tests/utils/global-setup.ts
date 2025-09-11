import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 全域設定
 * 在所有測試開始前執行
 * @param {*} config - config 參數
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 開始全域設定...');
  
  // 建立必要的目錄
  const directories = [
    'screenshots',
    'test-results',
    'playwright-report',
    'test-data',
    'downloads'
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 建立目錄: ${dir}`);
    }
  }
  
  // 設定環境變數
  process.env.TEST_ENV = process.env.TEST_ENV || 'local';
  process.env.BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  
  // 清理舊的測試結果
  const testResultsPath = path.join(process.cwd(), 'test-results');
  if (fs.existsSync(testResultsPath)) {
    const files = fs.readdirSync(testResultsPath);
    for (const file of files) {
      const filePath = path.join(testResultsPath, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    }
    console.log('🧹 清理舊的測試結果');
  }
  
  // 初始化測試資料
  const testData = {
    workshop: {
      chapters: [
        { id: 1, title: 'AI Conductor', status: 'available' },
        { id: 2, title: 'First Movement', status: 'available' },
        { id: 3, title: 'Second Movement', status: 'locked' },
        { id: 4, title: 'Third Movement', status: 'locked' },
        { id: 5, title: 'Fourth Movement', status: 'locked' },
        { id: 6, title: 'Final Movement', status: 'locked' },
        { id: 7, title: 'Variations', status: 'locked' },
        { id: 8, title: 'Capstone Project', status: 'locked' }
      ],
      users: [
        { id: 1, name: '測試學員', email: 'test@example.com' }
      ]
    },
    todoApp: {
      defaultTodos: [
        '學習 Playwright',
        '練習 AI 整合',
        '完成工作坊'
      ]
    }
  };
  
  // 寫入測試資料
  const testDataPath = path.join(process.cwd(), 'test-data', 'initial-data.json');
  fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
  console.log('💾 初始化測試資料');
  
  // 記錄測試開始時間
  const startTime = new Date().toISOString();
  process.env.TEST_START_TIME = startTime;
  console.log(`⏰ 測試開始時間: ${startTime}`);
  
  console.log('✅ 全域設定完成\n');
}

export default globalSetup;