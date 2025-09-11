// Chapter 7 驗證測試
// 確保學員正確完成進階測試場景

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.describe('Chapter 7 - 進階工作流程驗證', () => {
  const workshopDir = path.join(__dirname, '..');
  const startHereDir = path.join(workshopDir, 'start-here');
  const studentWorkDir = path.join(workshopDir, 'student-work');

  test.beforeAll(async () => {
    // 確保學員工作目錄存在
    await fs.mkdir(studentWorkDir, { recursive: true });
  });

  test('驗證性能測試實作', async ({ page }) => {
    // 檢查學員是否創建了性能測試文件
    const perfTestFile = path.join(studentWorkDir, 'performance-test.js');
    
    try {
      const content = await fs.readFile(perfTestFile, 'utf-8');
      
      // 驗證必要的性能測試元素
      expect(content).toContain('performance.now()');
      expect(content).toContain('waitForLoadState');
      expect(content).toContain('coverage.startJSCoverage');
      
      // 驗證 Web Vitals 測量
      expect(content).toContain('first-contentful-paint');
      expect(content).toContain('largest-contentful-paint');
      
      // 驗證性能斷言
      expect(content).toMatch(/expect\(.*\)\.toBeLessThan\(\d+\)/);
      
      console.log('✅ 性能測試實作完成');
    } catch (error) {
      console.log('❌ 性能測試實作未完成或有錯誤');
      throw error;
    }
  });

  test('驗證視覺回歸測試實作', async ({ page }) => {
    const visualTestFile = path.join(studentWorkDir, 'visual-test.js');
    
    try {
      const content = await fs.readFile(visualTestFile, 'utf-8');
      
      // 驗證視覺測試元素
      expect(content).toContain('toHaveScreenshot');
      expect(content).toContain('animations: \'disabled\'');
      expect(content).toContain('fullPage: true');
      
      // 驗證響應式測試
      expect(content).toMatch(/viewport.*width.*height/);
      expect(content).toContain('setViewportSize');
      
      // 驗證遮罩功能
      expect(content).toContain('mask:');
      
      console.log('✅ 視覺回歸測試實作完成');
    } catch (error) {
      console.log('❌ 視覺回歸測試實作未完成');
      throw error;
    }
  });

  test('驗證安全性測試實作', async ({ page }) => {
    const securityTestFile = path.join(studentWorkDir, 'security-test.js');
    
    try {
      const content = await fs.readFile(securityTestFile, 'utf-8');
      
      // 驗證 XSS 測試
      expect(content).toContain('<script>');
      expect(content).toContain('alert');
      expect(content).toContain('onerror');
      
      // 驗證 SQL 注入測試
      expect(content).toContain('OR \'1\'=\'1');
      expect(content).toContain('DROP TABLE');
      
      // 驗證安全標頭檢查
      expect(content).toMatch(/x-frame-options/i);
      expect(content).toMatch(/content-security-policy/i);
      
      console.log('✅ 安全性測試實作完成');
    } catch (error) {
      console.log('❌ 安全性測試實作未完成');
      throw error;
    }
  });

  test('驗證多服務整合測試實作', async ({ page }) => {
    const integrationTestFile = path.join(studentWorkDir, 'integration-test.js');
    
    try {
      const content = await fs.readFile(integrationTestFile, 'utf-8');
      
      // 驗證服務連接
      expect(content).toMatch(/postgres|mysql|mongodb/i);
      expect(content).toMatch(/redis/i);
      
      // 驗證 API 測試
      expect(content).toContain('request.post');
      expect(content).toContain('request.get');
      
      // 驗證事務處理
      expect(content).toMatch(/BEGIN|START TRANSACTION/i);
      expect(content).toMatch(/COMMIT|ROLLBACK/i);
      
      console.log('✅ 多服務整合測試實作完成');
    } catch (error) {
      console.log('❌ 多服務整合測試實作未完成');
      throw error;
    }
  });

  test('驗證測試報告生成', async ({ page }) => {
    const reportDir = path.join(studentWorkDir, 'test-results');
    
    try {
      const files = await fs.readdir(reportDir);
      
      // 檢查是否有測試報告文件
      const hasHtmlReport = files.some(f => f.endsWith('.html'));
      const hasJsonReport = files.some(f => f.endsWith('.json'));
      const hasScreenshots = files.some(f => f.endsWith('.png'));
      
      expect(hasHtmlReport || hasJsonReport).toBeTruthy();
      
      console.log('✅ 測試報告生成完成');
      console.log(`  - HTML 報告: ${hasHtmlReport ? '有' : '無'}`);
      console.log(`  - JSON 報告: ${hasJsonReport ? '有' : '無'}`);
      console.log(`  - 截圖: ${hasScreenshots ? '有' : '無'}`);
    } catch (error) {
      console.log('⚠️ 測試報告目錄不存在或為空');
    }
  });

  test('驗證 AI 提示詞使用', async () => {
    const promptsFile = path.join(studentWorkDir, 'ai-prompts.md');
    
    try {
      const content = await fs.readFile(promptsFile, 'utf-8');
      
      // 檢查是否記錄了用於生成進階測試的提示詞
      expect(content).toContain('性能測試');
      expect(content).toContain('視覺回歸');
      expect(content).toContain('安全性');
      expect(content).toContain('整合測試');
      
      // 檢查是否有優化建議
      expect(content).toMatch(/優化|改進|建議/);
      
      console.log('✅ AI 提示詞記錄完整');
    } catch (error) {
      console.log('⚠️ 未找到 AI 提示詞記錄文件');
    }
  });

  test('綜合評分', async () => {
    const scores = {
      performance: 0,
      visual: 0,
      security: 0,
      integration: 0,
      documentation: 0
    };
    
    // 評分邏輯
    try {
      await fs.access(path.join(studentWorkDir, 'performance-test.js'));
      scores.performance = 20;
    } catch {}
    
    try {
      await fs.access(path.join(studentWorkDir, 'visual-test.js'));
      scores.visual = 20;
    } catch {}
    
    try {
      await fs.access(path.join(studentWorkDir, 'security-test.js'));
      scores.security = 20;
    } catch {}
    
    try {
      await fs.access(path.join(studentWorkDir, 'integration-test.js'));
      scores.integration = 20;
    } catch {}
    
    try {
      await fs.access(path.join(studentWorkDir, 'ai-prompts.md'));
      scores.documentation = 20;
    } catch {}
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    console.log('\n=== Chapter 7 評分結果 ===');
    console.log(`性能測試: ${scores.performance}/20`);
    console.log(`視覺測試: ${scores.visual}/20`);
    console.log(`安全測試: ${scores.security}/20`);
    console.log(`整合測試: ${scores.integration}/20`);
    console.log(`文檔記錄: ${scores.documentation}/20`);
    console.log(`總分: ${totalScore}/100`);
    
    if (totalScore >= 80) {
      console.log('🎉 優秀！已掌握進階測試技術');
    } else if (totalScore >= 60) {
      console.log('👍 良好！繼續練習可以更進一步');
    } else {
      console.log('💪 加油！建議重新複習本章內容');
    }
    
    expect(totalScore).toBeGreaterThanOrEqual(60);
  });
});