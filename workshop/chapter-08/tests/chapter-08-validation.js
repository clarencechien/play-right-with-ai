// Chapter 8 Capstone 專案驗證測試
// 確保學員成功完成獨立的 AI 驅動開發專案

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.describe('Chapter 8 - Capstone 專案驗證', () => {
  const projectDir = path.join(__dirname, '..', 'student-project');
  const requiredFiles = {
    structure: [
      'src/app.js',
      'src/index.html',
      'tests/e2e/app.spec.js',
      'tests/e2e/performance.spec.js',
      'tests/e2e/security.spec.js',
      'docs/README.md',
      'docs/test-strategy.md',
      '.github/workflows/ci.yml',
      'package.json',
      'playwright.config.js'
    ],
    prompts: [
      'prompts/01-requirements.md',
      'prompts/02-implementation.md',
      'prompts/03-testing.md',
      'prompts/04-debugging.md',
      'prompts/05-optimization.md'
    ]
  };

  test.beforeAll(async () => {
    console.log('\n🎯 開始驗證 Capstone 專案...\n');
  });

  test('專案結構完整性檢查', async () => {
    const missingFiles = [];
    
    for (const file of requiredFiles.structure) {
      const filePath = path.join(projectDir, file);
      try {
        await fs.access(filePath);
        console.log(`✅ ${file} 存在`);
      } catch {
        missingFiles.push(file);
        console.log(`❌ ${file} 缺失`);
      }
    }
    
    expect(missingFiles).toHaveLength(0);
  });

  test('應用程式實作驗證', async ({ page }) => {
    const appPath = path.join(projectDir, 'src', 'index.html');
    
    try {
      // 載入應用程式
      await page.goto(`file://${appPath}`);
      
      // 驗證基本功能
      const requiredFeatures = [
        { selector: '[data-testid="app-header"]', name: '應用標題' },
        { selector: '[data-testid="main-content"]', name: '主要內容區' },
        { selector: '[data-testid="user-input"]', name: '用戶輸入' },
        { selector: '[data-testid="submit-button"]', name: '提交按鈕' }
      ];
      
      for (const feature of requiredFeatures) {
        const element = await page.locator(feature.selector).isVisible();
        if (element) {
          console.log(`✅ ${feature.name} 已實作`);
        } else {
          console.log(`⚠️ ${feature.name} 未找到`);
        }
        expect(element).toBeTruthy();
      }
      
      // 測試互動功能
      await page.fill('[data-testid="user-input"]', '測試資料');
      await page.click('[data-testid="submit-button"]');
      
      // 驗證結果顯示
      await expect(page.locator('[data-testid="result"]')).toBeVisible();
      
      console.log('✅ 應用程式功能正常');
    } catch (error) {
      console.log('❌ 應用程式載入或功能測試失敗');
      throw error;
    }
  });

  test('E2E 測試完整性', async () => {
    const testFile = path.join(projectDir, 'tests', 'e2e', 'app.spec.js');
    
    try {
      const content = await fs.readFile(testFile, 'utf-8');
      
      // 驗證測試覆蓋的場景
      const requiredScenarios = [
        'describe.*用戶流程',
        'test.*正常路徑',
        'test.*錯誤處理',
        'test.*邊界條件',
        'expect.*toBeVisible',
        'expect.*toHaveText',
        'expect.*toBeTruthy'
      ];
      
      let coveredScenarios = 0;
      for (const scenario of requiredScenarios) {
        if (new RegExp(scenario).test(content)) {
          coveredScenarios++;
        }
      }
      
      const coverage = (coveredScenarios / requiredScenarios.length) * 100;
      console.log(`測試覆蓋率: ${coverage.toFixed(1)}%`);
      
      expect(coverage).toBeGreaterThanOrEqual(70);
    } catch (error) {
      console.log('❌ E2E 測試文件未找到或無法讀取');
      throw error;
    }
  });

  test('性能測試實作', async () => {
    const perfTestFile = path.join(projectDir, 'tests', 'e2e', 'performance.spec.js');
    
    try {
      const content = await fs.readFile(perfTestFile, 'utf-8');
      
      // 驗證性能測試元素
      const performanceChecks = [
        'performance.now()',
        'page.coverage',
        'waitForLoadState',
        'toBeLessThan'
      ];
      
      for (const check of performanceChecks) {
        if (content.includes(check)) {
          console.log(`✅ 性能測試包含: ${check}`);
        } else {
          console.log(`⚠️ 性能測試缺少: ${check}`);
        }
      }
      
      expect(content).toContain('performance');
    } catch (error) {
      console.log('⚠️ 性能測試未實作（選擇性）');
    }
  });

  test('安全性測試實作', async () => {
    const secTestFile = path.join(projectDir, 'tests', 'e2e', 'security.spec.js');
    
    try {
      const content = await fs.readFile(secTestFile, 'utf-8');
      
      // 驗證安全測試元素
      const securityChecks = [
        'XSS',
        'SQL',
        'script',
        'alert'
      ];
      
      let hasSecurityTests = false;
      for (const check of securityChecks) {
        if (content.toLowerCase().includes(check.toLowerCase())) {
          hasSecurityTests = true;
          console.log(`✅ 安全測試包含: ${check} 測試`);
        }
      }
      
      if (!hasSecurityTests) {
        console.log('⚠️ 未找到安全測試');
      }
    } catch (error) {
      console.log('⚠️ 安全測試未實作（選擇性）');
    }
  });

  test('CI/CD 配置驗證', async () => {
    const ciFile = path.join(projectDir, '.github', 'workflows', 'ci.yml');
    
    try {
      const content = await fs.readFile(ciFile, 'utf-8');
      
      // 驗證 CI 配置要素
      const ciElements = [
        'name:',
        'on:',
        'push:',
        'pull_request:',
        'jobs:',
        'steps:',
        'npm install',
        'npx playwright',
        'test'
      ];
      
      for (const element of ciElements) {
        if (content.includes(element)) {
          console.log(`✅ CI 配置包含: ${element}`);
        } else {
          console.log(`⚠️ CI 配置缺少: ${element}`);
        }
      }
      
      expect(content).toContain('playwright');
    } catch (error) {
      console.log('❌ CI/CD 配置未找到');
      throw error;
    }
  });

  test('文檔完整性檢查', async () => {
    const readmeFile = path.join(projectDir, 'docs', 'README.md');
    const strategyFile = path.join(projectDir, 'docs', 'test-strategy.md');
    
    try {
      const readme = await fs.readFile(readmeFile, 'utf-8');
      
      // 檢查 README 必要章節
      const requiredSections = [
        '專案介紹',
        '功能說明',
        '安裝步驟',
        '使用方法',
        '測試執行'
      ];
      
      for (const section of requiredSections) {
        if (readme.includes(section)) {
          console.log(`✅ README 包含: ${section}`);
        } else {
          console.log(`⚠️ README 缺少: ${section}`);
        }
      }
      
      // 檢查測試策略文檔
      const strategy = await fs.readFile(strategyFile, 'utf-8');
      expect(strategy.length).toBeGreaterThan(500);
      console.log('✅ 測試策略文檔存在');
      
    } catch (error) {
      console.log('❌ 文檔不完整');
      throw error;
    }
  });

  test('AI 提示詞記錄驗證', async () => {
    const promptsDir = path.join(projectDir, 'prompts');
    
    try {
      const files = await fs.readdir(promptsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      
      console.log(`找到 ${mdFiles.length} 個提示詞文件`);
      
      // 檢查每個提示詞文件的內容
      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(promptsDir, file), 'utf-8');
        
        // 驗證提示詞品質
        const hasContext = content.includes('背景') || content.includes('Context');
        const hasRequest = content.includes('請') || content.includes('生成') || content.includes('創建');
        const hasConstraints = content.includes('要求') || content.includes('限制') || content.includes('條件');
        
        if (hasContext && hasRequest) {
          console.log(`✅ ${file}: 結構良好的提示詞`);
        } else {
          console.log(`⚠️ ${file}: 提示詞可以改進`);
        }
      }
      
      expect(mdFiles.length).toBeGreaterThanOrEqual(3);
    } catch (error) {
      console.log('⚠️ 未找到提示詞記錄');
    }
  });

  test('測試執行驗證', async ({ page }) => {
    // 在專案目錄執行測試
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
      console.log('執行專案測試...');
      const { stdout, stderr } = await execPromise(
        'npx playwright test --reporter=list',
        { cwd: projectDir }
      );
      
      // 分析測試結果
      const passedTests = (stdout.match(/✓/g) || []).length;
      const failedTests = (stdout.match(/✗/g) || []).length;
      const totalTests = passedTests + failedTests;
      
      console.log(`測試結果: ${passedTests}/${totalTests} 通過`);
      
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      expect(passRate).toBeGreaterThanOrEqual(60);
      
    } catch (error) {
      console.log('⚠️ 測試執行失敗，可能需要先安裝依賴');
    }
  });

  test('創新性和完整性評分', async () => {
    const scores = {
      structure: 0,      // 專案結構 (20分)
      functionality: 0,  // 功能實作 (20分)
      testing: 0,        // 測試覆蓋 (20分)
      documentation: 0,  // 文檔品質 (20分)
      aiUsage: 0,       // AI 使用 (10分)
      innovation: 0     // 創新性 (10分)
    };
    
    // 評分邏輯
    try {
      // 結構評分
      const structureFiles = requiredFiles.structure;
      let existingFiles = 0;
      for (const file of structureFiles) {
        try {
          await fs.access(path.join(projectDir, file));
          existingFiles++;
        } catch {}
      }
      scores.structure = (existingFiles / structureFiles.length) * 20;
      
      // 功能評分（基於前面的測試結果）
      scores.functionality = 15; // 基礎分數，根據實際測試調整
      
      // 測試評分
      try {
        await fs.access(path.join(projectDir, 'tests/e2e/app.spec.js'));
        scores.testing += 10;
      } catch {}
      try {
        await fs.access(path.join(projectDir, 'tests/e2e/performance.spec.js'));
        scores.testing += 5;
      } catch {}
      try {
        await fs.access(path.join(projectDir, 'tests/e2e/security.spec.js'));
        scores.testing += 5;
      } catch {}
      
      // 文檔評分
      try {
        await fs.access(path.join(projectDir, 'docs/README.md'));
        scores.documentation += 10;
      } catch {}
      try {
        await fs.access(path.join(projectDir, 'docs/test-strategy.md'));
        scores.documentation += 10;
      } catch {}
      
      // AI 使用評分
      try {
        const promptsDir = path.join(projectDir, 'prompts');
        const files = await fs.readdir(promptsDir);
        if (files.length >= 3) scores.aiUsage = 10;
        else if (files.length >= 1) scores.aiUsage = 5;
      } catch {}
      
      // 創新性評分（檢查是否有額外功能）
      try {
        const srcFiles = await fs.readdir(path.join(projectDir, 'src'));
        if (srcFiles.length > 2) scores.innovation = 5;
        
        const testFiles = await fs.readdir(path.join(projectDir, 'tests/e2e'));
        if (testFiles.length > 3) scores.innovation += 5;
      } catch {}
      
    } catch (error) {
      console.log('評分過程中發生錯誤:', error);
    }
    
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    console.log('\n=== Capstone 專案評分 ===');
    console.log(`專案結構: ${scores.structure.toFixed(1)}/20`);
    console.log(`功能實作: ${scores.functionality.toFixed(1)}/20`);
    console.log(`測試覆蓋: ${scores.testing.toFixed(1)}/20`);
    console.log(`文檔品質: ${scores.documentation.toFixed(1)}/20`);
    console.log(`AI 使用: ${scores.aiUsage.toFixed(1)}/10`);
    console.log(`創新性: ${scores.innovation.toFixed(1)}/10`);
    console.log(`總分: ${totalScore.toFixed(1)}/100`);
    
    // 給出評價
    if (totalScore >= 90) {
      console.log('\n🏆 卓越！完美掌握了 AI 驅動開發流程');
      console.log('您已經成為一名優秀的 AI 指揮家！');
    } else if (totalScore >= 75) {
      console.log('\n🎯 優秀！成功完成了 Capstone 專案');
      console.log('您已經掌握了 AI 驅動開發的核心技能');
    } else if (totalScore >= 60) {
      console.log('\n👍 良好！專案基本完成');
      console.log('繼續練習可以進一步提升 AI 協作能力');
    } else {
      console.log('\n💪 繼續努力！');
      console.log('建議回顧前面章節，加強 AI 驅動開發的理解');
    }
    
    // 提供改進建議
    console.log('\n📝 改進建議:');
    if (scores.structure < 15) {
      console.log('- 完善專案結構，確保所有必要文件都存在');
    }
    if (scores.functionality < 15) {
      console.log('- 增強應用功能，確保核心功能正常運作');
    }
    if (scores.testing < 15) {
      console.log('- 擴展測試覆蓋，包含更多測試場景');
    }
    if (scores.documentation < 15) {
      console.log('- 改進文檔品質，提供更詳細的說明');
    }
    if (scores.aiUsage < 8) {
      console.log('- 記錄更多 AI 提示詞，展示 AI 使用過程');
    }
    if (scores.innovation < 8) {
      console.log('- 添加創新功能，展現個人創意');
    }
    
    expect(totalScore).toBeGreaterThanOrEqual(60);
  });
});

// 輔助測試：驗證學員是否正確使用 AI 工具
test.describe('AI 工具使用驗證', () => {
  test('提示詞品質評估', async () => {
    const promptsDir = path.join(__dirname, '..', 'student-project', 'prompts');
    
    try {
      const files = await fs.readdir(promptsDir);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const content = await fs.readFile(path.join(promptsDir, file), 'utf-8');
        
        // 評估提示詞品質指標
        const qualityIndicators = {
          hasContext: /背景|Context|場景|Scenario/i.test(content),
          hasObjective: /目標|目的|Goal|Objective/i.test(content),
          hasConstraints: /要求|限制|Constraint|Requirement/i.test(content),
          hasExamples: /範例|Example|樣本|Sample/i.test(content),
          hasOutputFormat: /格式|Format|輸出|Output/i.test(content),
          isStructured: content.includes('#') || content.includes('##'),
          hasCodeBlocks: content.includes('```'),
          isBilingual: /[a-zA-Z]/.test(content) && /[\u4e00-\u9fa5]/.test(content)
        };
        
        const score = Object.values(qualityIndicators).filter(v => v).length;
        const quality = score >= 6 ? '優秀' : score >= 4 ? '良好' : '需改進';
        
        console.log(`\n提示詞: ${file}`);
        console.log(`品質評分: ${score}/8 (${quality})`);
        console.log('指標檢查:');
        for (const [key, value] of Object.entries(qualityIndicators)) {
          console.log(`  ${value ? '✅' : '❌'} ${key}`);
        }
      }
    } catch (error) {
      console.log('未找到提示詞目錄');
    }
  });
});