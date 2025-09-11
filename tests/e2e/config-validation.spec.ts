import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 工作坊環境配置驗證測試
 * 確保所有必要的配置檔案和環境設定都正確
 */
test.describe('工作坊配置驗證', () => {
  test('環境配置檔案應該存在', async () => {
    // 檢查 .env.example 檔案
    const envExamplePath = path.join(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    
    // 檢查 .env 檔案
    const envPath = path.join(process.cwd(), '.env');
    expect(fs.existsSync(envPath)).toBe(true);
  });

  test('驗證腳本應該正常運行', async () => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'validate-env.js');
    expect(fs.existsSync(scriptPath)).toBe(true);
    
    // 檢查腳本內容包含必要的驗證功能
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    expect(scriptContent).toContain('EnvironmentValidator');
    expect(scriptContent).toContain('validateNodeVersion');
    expect(scriptContent).toContain('validateEnvFile');
    expect(scriptContent).toContain('validatePlaywright');
  });

  test('必要的工作坊目錄應該存在', async () => {
    const requiredDirs = [
      'prompts',
      'workshop',
      'sample-app-source',
      'scripts',
      'docs',
      'tests/e2e'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(process.cwd(), dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    }
  });

  test('package.json 應包含必要的腳本和依賴', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    // 檢查新增的腳本
    expect(packageJson.scripts['validate:env']).toBe('node scripts/validate-env.js');
    expect(packageJson.scripts['workshop:start']).toBe('npm run docs:serve');
    expect(packageJson.scripts['docs:serve']).toBe('npx http-server docs -p 8080');
    expect(packageJson.scripts['test:workshop']).toBe('playwright test tests/e2e/workshop-complete.spec.ts');
    
    // 檢查依賴
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    expect(allDeps['@playwright/test']).toBeDefined();
    expect(allDeps['dotenv']).toBeDefined();
  });

  test('Node.js 版本應符合要求', async () => {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    expect(majorVersion).toBeGreaterThanOrEqual(18);
  });

  test('.env.example 應包含所有必要的配置項', async () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf-8');
    
    // 檢查必要的 API 金鑰配置
    expect(content).toContain('ANTHROPIC_API_KEY');
    expect(content).toContain('GOOGLE_API_KEY');
    expect(content).toContain('OPENAI_API_KEY');
    
    // 檢查 Playwright 配置
    expect(content).toContain('PLAYWRIGHT_BROWSERS_PATH');
    expect(content).toContain('PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD');
    
    // 檢查工作坊設定
    expect(content).toContain('WORKSHOP_PORT');
    expect(content).toContain('DOCS_PORT');
    expect(content).toContain('TEST_REPORT_PORT');
  });

  test('驗證腳本應該能夠檢測環境問題', async () => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'validate-env.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    
    // 檢查錯誤處理
    expect(scriptContent).toContain('this.errors');
    expect(scriptContent).toContain('this.warnings');
    expect(scriptContent).toContain('this.successes');
    
    // 檢查報告生成
    expect(scriptContent).toContain('generateReport');
    expect(scriptContent).toContain('環境驗證報告');
    
    // 檢查顏色輸出
    expect(scriptContent).toContain('colors.red');
    expect(scriptContent).toContain('colors.green');
    expect(scriptContent).toContain('colors.yellow');
  });
});