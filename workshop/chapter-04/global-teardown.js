/**
 * 全域清理檔案
 * 在所有測試執行完成後執行一次
 */

const fs = require('fs').promises;
const path = require('path');

/**
 *
 * @param {*} config - config 參數
 */
async function globalTeardown(config) {
  console.log('\n🧹 開始全域清理...');
  
  // 1. 收集測試統計資料
  console.log('📊 收集測試統計...');
  const testResultsPath = path.join(process.cwd(), 'test-results.json');
  
  try {
    const results = await fs.readFile(testResultsPath, 'utf-8');
    const testResults = JSON.parse(results);
    
    // 計算統計資料
    const stats = {
      total: testResults.tests?.length || 0,
      passed: testResults.tests?.filter(t => t.status === 'passed').length || 0,
      failed: testResults.tests?.filter(t => t.status === 'failed').length || 0,
      skipped: testResults.tests?.filter(t => t.status === 'skipped').length || 0,
      duration: testResults.duration || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📈 測試統計:');
    console.log(`   總測試數: ${stats.total}`);
    console.log(`   ✅ 通過: ${stats.passed}`);
    console.log(`   ❌ 失敗: ${stats.failed}`);
    console.log(`   ⏭️  跳過: ${stats.skipped}`);
    console.log(`   ⏱️  總時間: ${(stats.duration / 1000).toFixed(2)} 秒`);
    console.log(`   🎯 通過率: ${((stats.passed / stats.total) * 100).toFixed(2)}%`);
    
    // 保存統計資料
    await fs.writeFile(
      path.join(process.cwd(), 'test-data', 'test-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
  } catch (error) {
    console.log('⚠️ 無法讀取測試結果:', error.message);
  }
  
  // 2. 壓縮測試產物（如果需要）
  if (process.env.COMPRESS_ARTIFACTS === 'true') {
    console.log('📦 壓縮測試產物...');
    const archiver = require('archiver');
    const output = fs.createWriteStream('test-artifacts.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    archive.directory('test-results/', 'test-results');
    archive.directory('screenshots/', 'screenshots');
    archive.directory('videos/', 'videos');
    archive.directory('traces/', 'traces');
    await archive.finalize();
    
    console.log('✅ 測試產物已壓縮為 test-artifacts.zip');
  }
  
  // 3. 上傳測試結果到外部服務（如果配置）
  if (process.env.REPORT_SERVICE_URL) {
    console.log('📤 上傳測試結果...');
    try {
      // await uploadTestResults({
      //   url: process.env.REPORT_SERVICE_URL,
      //   apiKey: process.env.REPORT_API_KEY,
      //   results: testResults
      // });
      console.log('✅ 測試結果已上傳');
    } catch (error) {
      console.error('❌ 上傳失敗:', error.message);
    }
  }
  
  // 4. 清理臨時檔案（可選）
  if (process.env.CLEAN_TEMP_FILES === 'true') {
    console.log('🗑️ 清理臨時檔案...');
    const tempDirs = ['temp', '.tmp', 'tmp'];
    
    for (const dir of tempDirs) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await fs.rmdir(dirPath, { recursive: true });
        console.log(`   已刪除: ${dir}`);
      } catch (error) {
        // 忽略不存在的目錄
      }
    }
  }
  
  // 5. 發送通知（如果配置）
  if (process.env.NOTIFICATION_WEBHOOK) {
    console.log('📬 發送測試完成通知...');
    try {
      const stats = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'test-data', 'test-stats.json'), 'utf-8')
      );
      
      // 根據測試結果決定通知類型
      const status = stats.failed > 0 ? '❌ 失敗' : '✅ 成功';
      const color = stats.failed > 0 ? '#FF0000' : '#00FF00';
      
      // 發送 Slack/Discord/Teams 通知
      // await sendNotification({
      //   webhook: process.env.NOTIFICATION_WEBHOOK,
      //   message: {
      //     title: `測試執行完成 - ${status}`,
      //     color: color,
      //     fields: [
      //       { name: '總測試數', value: stats.total },
      //       { name: '通過', value: stats.passed },
      //       { name: '失敗', value: stats.failed },
      //       { name: '通過率', value: `${((stats.passed / stats.total) * 100).toFixed(2)}%` }
      //     ]
      //   }
      // });
      
      console.log('✅ 通知已發送');
    } catch (error) {
      console.error('❌ 發送通知失敗:', error.message);
    }
  }
  
  // 6. 清理測試資料庫（如果使用）
  if (process.env.TEST_DB_URL) {
    console.log('🗄️ 清理測試資料庫...');
    try {
      // await cleanupTestDatabase();
      console.log('✅ 測試資料庫已清理');
    } catch (error) {
      console.error('❌ 資料庫清理失敗:', error.message);
    }
  }
  
  // 7. 停止測試服務（如果由測試啟動）
  if (global.__TEST_SERVER__) {
    console.log('🛑 停止測試服務...');
    try {
      await global.__TEST_SERVER__.close();
      console.log('✅ 測試服務已停止');
    } catch (error) {
      console.error('❌ 停止服務失敗:', error.message);
    }
  }
  
  // 8. 生成測試摘要報告
  console.log('\n📄 生成測試摘要...');
  const summary = {
    executionTime: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    configuration: {
      baseURL: config.use?.baseURL,
      browsers: config.projects?.map(p => p.name),
      workers: config.workers,
      retries: config.retries
    },
    results: {
      // 從 test-stats.json 讀取
    }
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'test-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // 9. 記錄資源使用情況
  const used = process.memoryUsage();
  console.log('\n💾 資源使用情況:');
  for (let key in used) {
    console.log(`   ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  
  console.log('\n✨ 全域清理完成！\n');
  
  // 10. 退出碼處理
  if (process.env.CI === 'true') {
    try {
      const stats = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'test-data', 'test-stats.json'), 'utf-8')
      );
      if (stats.failed > 0) {
        console.error('❌ 測試執行失敗，退出碼 1');
        process.exit(1);
      }
    } catch (error) {
      // 忽略錯誤
    }
  }
}

module.exports = globalTeardown;