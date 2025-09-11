import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 全域清理
 * 在所有測試結束後執行
 * @param {*} config - config 參數
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 開始全域清理...');
  
  // 計算測試執行時間
  const startTime = process.env.TEST_START_TIME;
  if (startTime) {
    const duration = Date.now() - new Date(startTime).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    console.log(`⏱️  測試總執行時間: ${minutes}分${remainingSeconds}秒`);
  }
  
  // 生成測試摘要
  const testResultsPath = path.join(process.cwd(), 'test-results.json');
  if (fs.existsSync(testResultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(testResultsPath, 'utf-8'));
      console.log('📊 測試摘要:');
      console.log(`   通過: ${results.passed || 0}`);
      console.log(`   失敗: ${results.failed || 0}`);
      console.log(`   跳過: ${results.skipped || 0}`);
    } catch (error) {
      console.log('⚠️  無法讀取測試結果');
    }
  }
  
  // 清理臨時檔案（保留重要的測試結果）
  const tempFiles = [
    'test-data/temp',
    'downloads/temp'
  ];
  
  for (const tempPath of tempFiles) {
    const fullPath = path.join(process.cwd(), tempPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  清理臨時檔案: ${tempPath}`);
    }
  }
  
  // 壓縮測試報告（如果在 CI 環境）
  if (process.env.CI) {
    console.log('📦 壓縮測試報告...');
    // 這裡可以加入壓縮邏輯
  }
  
  console.log('✅ 全域清理完成');
}

export default globalTeardown;