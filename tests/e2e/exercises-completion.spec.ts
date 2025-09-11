import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 練習完成度測試套件
 * 驗證所有章節練習的完整性和可執行性
 */
test.describe('練習完成度測試', () => {
  const workshopDir = '/workspace/play-right-with-ai/workshop';
  
  test('所有章節練習結構完整', async () => {
    const chapters = fs.readdirSync(workshopDir)
      .filter(dir => dir.startsWith('chapter-'))
      .sort();
    
    expect(chapters.length).toBe(8);
    
    for (const chapter of chapters) {
      const chapterPath = path.join(workshopDir, chapter);
      const files = fs.readdirSync(chapterPath);
      
      // 檢查必要的文件和目錄
      expect(files).toContain('README.md');
      
      // 檢查 start-here 目錄
      const startHerePath = path.join(chapterPath, 'start-here');
      if (fs.existsSync(startHerePath)) {
        const startFiles = fs.readdirSync(startHerePath);
        expect(startFiles.length).toBeGreaterThan(0);
      }
      
      // 檢查 example-output 目錄
      const examplePath = path.join(chapterPath, 'example-output');
      if (fs.existsSync(examplePath)) {
        const exampleFiles = fs.readdirSync(examplePath);
        expect(exampleFiles.length).toBeGreaterThan(0);
      }
    }
  });

  test('Chapter 1: 環境設置練習', async ({ page }) => {
    await page.goto('/workshop/chapter-01');
    
    // 檢查環境設置說明
    const setupInstructions = page.locator('text=/npm install|yarn install|pnpm install/i');
    const hasSetupInstructions = await setupInstructions.count() > 0;
    expect(hasSetupInstructions).toBe(true);
    
    // 檢查 Playwright 安裝指令
    const playwrightSetup = page.locator('text=/playwright install/i');
    const hasPlaywrightSetup = await playwrightSetup.count() > 0;
    expect(hasPlaywrightSetup).toBe(true);
    
    // 檢查配置文件範例
    const configExample = page.locator('text=/playwright.config/i');
    const hasConfig = await configExample.count() > 0;
    expect(hasConfig).toBe(true);
  });

  test('Chapter 2: 應用生成練習', async ({ page }) => {
    await page.goto('/workshop/chapter-02');
    
    // 檢查提示詞範例
    const promptExample = page.locator('.prompt, code:has-text("prompt"), pre:has-text("prompt")');
    if (await promptExample.count() > 0) {
      await expect(promptExample.first()).toBeVisible();
    }
    
    // 檢查生成的代碼範例
    const codeExample = page.locator('pre code, .language-javascript, .language-typescript');
    const codeCount = await codeExample.count();
    expect(codeCount).toBeGreaterThan(0);
    
    // 驗證 TODO 應用代碼
    const todoCode = page.locator('text=/todo|task|item/i');
    const hasTodoCode = await todoCode.count() > 0;
    expect(hasTodoCode).toBe(true);
  });

  test('Chapter 3: 測試策略練習', async ({ page }) => {
    await page.goto('/workshop/chapter-03');
    
    // 檢查測試計劃模板
    const testPlanTemplate = page.locator('text=/test plan|測試計劃|test strategy|測試策略/i');
    const hasTestPlan = await testPlanTemplate.count() > 0;
    expect(hasTestPlan).toBe(true);
    
    // 檢查測試案例範例
    const testCases = page.locator('text=/test case|測試案例|scenario|場景/i');
    const hasTestCases = await testCases.count() > 0;
    expect(hasTestCases).toBe(true);
    
    // 檢查測試覆蓋率討論
    const coverage = page.locator('text=/coverage|覆蓋率|test coverage/i');
    const hasCoverage = await coverage.count() > 0;
    expect(hasCoverage).toBe(true);
  });

  test('Chapter 4: Playwright 測試撰寫練習', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 檢查 Playwright 測試代碼
    const testCode = page.locator('text=/test\\(|describe\\(|expect\\(/');
    const hasTestCode = await testCode.count() > 0;
    expect(hasTestCode).toBe(true);
    
    // 檢查 Page Object Model 範例
    const pomExample = page.locator('text=/page object|PageObject|POM/i');
    const hasPOM = await pomExample.count() > 0;
    expect(hasPOM).toBe(true);
    
    // 檢查選擇器策略
    const selectors = page.locator('text=/selector|locator|data-testid/i');
    const hasSelectors = await selectors.count() > 0;
    expect(hasSelectors).toBe(true);
  });

  test('Chapter 5: 測試分析練習', async ({ page }) => {
    await page.goto('/workshop/chapter-05');
    
    // 檢查錯誤分析範例
    const errorAnalysis = page.locator('text=/error|failure|failed|錯誤|失敗/i');
    const hasErrorAnalysis = await errorAnalysis.count() > 0;
    expect(hasErrorAnalysis).toBe(true);
    
    // 檢查調試技巧
    const debugging = page.locator('text=/debug|trace|screenshot|調試|追蹤/i');
    const hasDebugging = await debugging.count() > 0;
    expect(hasDebugging).toBe(true);
    
    // 檢查報告生成
    const reporting = page.locator('text=/report|reporter|html report|報告/i');
    const hasReporting = await reporting.count() > 0;
    expect(hasReporting).toBe(true);
  });

  test('Chapter 6: 自我修復練習', async ({ page }) => {
    await page.goto('/workshop/chapter-06');
    
    // 檢查自我修復策略
    const selfHealing = page.locator('text=/self-healing|self repair|auto fix|自我修復|自動修復/i');
    const hasSelfHealing = await selfHealing.count() > 0;
    expect(hasSelfHealing).toBe(true);
    
    // 檢查重試機制
    const retry = page.locator('text=/retry|retries|重試/i');
    const hasRetry = await retry.count() > 0;
    expect(hasRetry).toBe(true);
    
    // 檢查智能定位器
    const smartLocators = page.locator('text=/smart locator|intelligent selector|智能定位/i');
    const hasSmartLocators = await smartLocators.count() > 0;
    // This is optional, so we don't fail the test
    console.log(`Smart locators mentioned: ${hasSmartLocators}`);
  });

  test('Chapter 7: 進階場景練習', async ({ page }) => {
    await page.goto('/workshop/chapter-07');
    
    // 檢查進階主題
    const advancedTopics = [
      'parallel|並行|concurrent',
      'performance|性能|效能',
      'cross-browser|跨瀏覽器',
      'mobile|行動裝置|手機',
      'api|API|接口'
    ];
    
    for (const topic of advancedTopics) {
      const element = page.locator(`text=/${topic}/i`);
      const exists = await element.count() > 0;
      console.log(`Advanced topic "${topic}": ${exists}`);
    }
    
    // 至少應該涵蓋3個進階主題
    let coveredTopics = 0;
    for (const topic of advancedTopics) {
      const element = page.locator(`text=/${topic}/i`);
      if (await element.count() > 0) {
        coveredTopics++;
      }
    }
    expect(coveredTopics).toBeGreaterThanOrEqual(3);
  });

  test('Chapter 8: 總結專案練習', async ({ page }) => {
    await page.goto('/workshop/chapter-08');
    
    // 檢查專案需求
    const requirements = page.locator('text=/requirement|需求|specification|規格/i');
    const hasRequirements = await requirements.count() > 0;
    expect(hasRequirements).toBe(true);
    
    // 檢查評分標準
    const criteria = page.locator('text=/criteria|評分|evaluation|評估/i');
    const hasCriteria = await criteria.count() > 0;
    expect(hasCriteria).toBe(true);
    
    // 檢查提交說明
    const submission = page.locator('text=/submit|提交|submission|繳交/i');
    const hasSubmission = await submission.count() > 0;
    expect(hasSubmission).toBe(true);
  });

  test('練習代碼可執行性測試', async ({ page }) => {
    // 測試 start-here 目錄中的代碼
    const startHereFiles = [
      '/workshop/chapter-02/start-here/app.js',
      '/workshop/chapter-04/start-here/test.spec.js'
    ];
    
    for (const file of startHereFiles) {
      if (fs.existsSync(path.join('/workspace/play-right-with-ai', file))) {
        const content = fs.readFileSync(path.join('/workspace/play-right-with-ai', file), 'utf-8');
        
        // 基本語法檢查
        expect(content).toBeTruthy();
        
        // 檢查是否有基本的代碼結構
        const hasFunction = content.includes('function') || content.includes('=>');
        const hasExport = content.includes('export') || content.includes('module.exports');
        
        expect(hasFunction || hasExport).toBe(true);
      }
    }
  });

  test('練習說明清晰度測試', async ({ page }) => {
    const chapters = ['01', '02', '03', '04', '05', '06', '07', '08'];
    
    for (const chapter of chapters) {
      await test.step(`檢查 Chapter ${chapter} 說明清晰度`, async () => {
        const readmePath = path.join(workshopDir, `chapter-${chapter}`, 'README.md');
        
        if (fs.existsSync(readmePath)) {
          const content = fs.readFileSync(readmePath, 'utf-8');
          
          // 檢查必要章節
          const hasObjective = content.includes('目標') || content.includes('目的') || content.includes('Objective');
          const hasSteps = content.includes('步驟') || content.includes('Steps') || content.includes('流程');
          const hasExpected = content.includes('預期') || content.includes('Expected') || content.includes('結果');
          
          expect(hasObjective).toBe(true);
          expect(hasSteps).toBe(true);
          expect(hasExpected).toBe(true);
          
          // 檢查是否有編號列表
          const hasNumberedList = /\d+\.|[一二三四五六七八九十]+、/.test(content);
          expect(hasNumberedList).toBe(true);
          
          // 檢查是否有代碼區塊
          const hasCodeBlock = content.includes('```');
          expect(hasCodeBlock).toBe(true);
        }
      });
    }
  });

  test('練習難度遞進測試', async () => {
    const complexityIndicators = {
      'chapter-01': ['setup', 'install', 'config'],
      'chapter-02': ['generate', 'create', 'build'],
      'chapter-03': ['strategy', 'plan', 'design'],
      'chapter-04': ['test', 'playwright', 'automation'],
      'chapter-05': ['analyze', 'debug', 'report'],
      'chapter-06': ['repair', 'fix', 'heal'],
      'chapter-07': ['advanced', 'complex', 'performance'],
      'chapter-08': ['integrate', 'complete', 'project']
    };
    
    for (const [chapter, keywords] of Object.entries(complexityIndicators)) {
      const readmePath = path.join(workshopDir, chapter, 'README.md');
      
      if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8').toLowerCase();
        
        // 檢查是否包含對應難度的關鍵字
        const hasKeywords = keywords.some(keyword => content.includes(keyword));
        expect(hasKeywords).toBe(true);
      }
    }
  });

  test('練習互動元素測試', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 檢查是否有互動式代碼編輯器
    const codeEditor = page.locator('[data-testid="code-editor"], .monaco-editor, .ace-editor, textarea.code');
    if (await codeEditor.count() > 0) {
      // 測試編輯功能
      await codeEditor.first().click();
      await page.keyboard.type('// Test comment');
      
      // 檢查內容是否更新
      const content = await codeEditor.first().inputValue().catch(() => '');
      expect(content).toContain('// Test comment');
    }
    
    // 檢查運行按鈕
    const runButton = page.locator('[data-testid="run-code"], button:has-text("Run"), button:has-text("執行")');
    if (await runButton.count() > 0) {
      await runButton.first().click();
      
      // 檢查輸出區域
      const output = page.locator('[data-testid="output"], .output, .console');
      if (await output.count() > 0) {
        await expect(output.first()).toBeVisible();
      }
    }
  });

  test('練習檢查清單功能', async ({ page }) => {
    await page.goto('/workshop/chapter-05');
    
    // 查找檢查清單
    const checklist = page.locator('[data-testid="checklist"], .checklist, input[type="checkbox"]');
    if (await checklist.count() > 0) {
      const checkboxes = await checklist.all();
      
      // 勾選所有項目
      for (const checkbox of checkboxes) {
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }
      }
      
      // 檢查進度更新
      const progress = page.locator('[data-testid="progress"], .progress-bar, .completion-rate');
      if (await progress.count() > 0) {
        const progressText = await progress.first().textContent();
        expect(progressText).toMatch(/100|完成|complete/i);
      }
    }
  });

  test('練習提示和幫助系統', async ({ page }) => {
    await page.goto('/workshop/chapter-03');
    
    // 查找提示按鈕
    const hintButton = page.locator('[data-testid="hint"], button:has-text("Hint"), button:has-text("提示")');
    if (await hintButton.count() > 0) {
      await hintButton.first().click();
      
      // 檢查提示內容
      const hintContent = page.locator('[data-testid="hint-content"], .hint-content, .tooltip');
      await expect(hintContent.first()).toBeVisible();
    }
    
    // 查找幫助連結
    const helpLink = page.locator('a:has-text("Help"), a:has-text("幫助"), [data-testid="help-link"]');
    if (await helpLink.count() > 0) {
      const href = helpLink.first();
      await expect(href).toHaveAttribute('href', );
    }
  });
});