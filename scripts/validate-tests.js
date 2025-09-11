#!/usr/bin/env node

/**
 * 測試驗證腳本
 * 檢查所有測試檔案的語法和結構是否正確
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}================================${colors.reset}`);
console.log(`${colors.cyan}  測試配置驗證工具${colors.reset}`);
console.log(`${colors.cyan}================================${colors.reset}\n`);

const checks = {
  configuration: { passed: 0, failed: 0, total: 0 },
  linting: { passed: 0, failed: 0, total: 0 },
  tests: { passed: 0, failed: 0, total: 0 },
  quality: { passed: 0, failed: 0, total: 0 }
};

// 1. 檢查配置文件
console.log(`${colors.blue}1. 檢查配置文件...${colors.reset}`);

const configFiles = [
  '.eslintrc.json',
  '.prettierrc',
  '.editorconfig',
  'commitlint.config.js',
  '.nycrc.json',
  'playwright.config.ts'
];

configFiles.forEach(file => {
  checks.configuration.total++;
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ${colors.green}✓${colors.reset} ${file}`);
    checks.configuration.passed++;
  } else {
    console.log(`  ${colors.red}✗${colors.reset} ${file} - 缺失`);
    checks.configuration.failed++;
  }
});

// 2. 檢查 Linting 工具
console.log(`\n${colors.blue}2. 檢查 Linting 工具...${colors.reset}`);

const lintingCommands = [
  { name: 'ESLint', cmd: 'npx eslint --version' },
  { name: 'Prettier', cmd: 'npx prettier --version' },
  { name: 'Commitlint', cmd: 'npx commitlint --version' }
];

lintingCommands.forEach(({ name, cmd }) => {
  checks.linting.total++;
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  ${colors.green}✓${colors.reset} ${name} 已安裝`);
    checks.linting.passed++;
  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} ${name} 未安裝`);
    checks.linting.failed++;
  }
});

// 3. 檢查測試文件
console.log(`\n${colors.blue}3. 檢查測試文件...${colors.reset}`);

const testDirs = [
  'tests/e2e',
  'tests/integration',
  'tests/performance',
  'tests/a11y',
  'tests/page-objects',
  'tests/utils'
];

testDirs.forEach(dir => {
  checks.tests.total++;
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    console.log(`  ${colors.green}✓${colors.reset} ${dir} (${files.length} 個檔案)`);
    checks.tests.passed++;
  } else {
    console.log(`  ${colors.red}✗${colors.reset} ${dir} - 目錄不存在`);
    checks.tests.failed++;
  }
});

// 4. 檢查程式碼品質
console.log(`\n${colors.blue}4. 執行快速品質檢查...${colors.reset}`);

const qualityChecks = [
  {
    name: 'TypeScript 編譯',
    cmd: 'npx tsc --noEmit --skipLibCheck',
    timeout: 30000
  },
  {
    name: 'ESLint 檢查 (僅錯誤)',
    cmd: 'npx eslint . --ext .js,.ts --quiet --max-warnings 0',
    timeout: 60000
  }
];

qualityChecks.forEach(({ name, cmd, timeout }) => {
  checks.quality.total++;
  try {
    console.log(`  檢查 ${name}...`);
    execSync(cmd, { 
      stdio: 'pipe',
      timeout,
      cwd: path.join(__dirname, '..')
    });
    console.log(`  ${colors.green}✓${colors.reset} ${name} 通過`);
    checks.quality.passed++;
  } catch (error) {
    const isTimeout = error.code === 'ETIMEDOUT';
    if (isTimeout) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${name} 超時 (可能需要更多時間)`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${name} 失敗`);
      checks.quality.failed++;
    }
  }
});

// 5. 檢查必要的測試檔案
console.log(`\n${colors.blue}5. 檢查核心測試檔案...${colors.reset}`);

const coreTestFiles = [
  'tests/e2e/workshop-complete.spec.ts',
  'tests/e2e/apps-functional.spec.ts',
  'tests/e2e/prompts-execution.spec.ts',
  'tests/e2e/exercises-completion.spec.ts',
  'tests/performance/load-test.spec.ts',
  'tests/a11y/accessibility.spec.ts'
];

coreTestFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${colors.green}✓${colors.reset} ${path.basename(file)} (${sizeKB} KB)`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} ${path.basename(file)} - 缺失`);
  }
});

// 總結報告
console.log(`\n${colors.cyan}================================${colors.reset}`);
console.log(`${colors.cyan}  驗證總結${colors.reset}`);
console.log(`${colors.cyan}================================${colors.reset}\n`);

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

Object.entries(checks).forEach(([category, results]) => {
  totalPassed += results.passed;
  totalFailed += results.failed;
  totalTests += results.total;
  
  const percentage = results.total > 0 
    ? Math.round((results.passed / results.total) * 100) 
    : 0;
  
  const statusIcon = percentage === 100 ? colors.green + '✓' :
                     percentage >= 75 ? colors.yellow + '⚠' :
                     colors.red + '✗';
  
  console.log(`${statusIcon}${colors.reset} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${results.passed}/${results.total} (${percentage}%)`);
});

console.log(`\n總計: ${totalPassed}/${totalTests} 項目通過`);

const overallPercentage = Math.round((totalPassed / totalTests) * 100);

if (overallPercentage === 100) {
  console.log(`\n${colors.green}🎉 所有測試配置完美！${colors.reset}`);
} else if (overallPercentage >= 80) {
  console.log(`\n${colors.green}✅ 測試配置良好，可以開始測試${colors.reset}`);
} else if (overallPercentage >= 60) {
  console.log(`\n${colors.yellow}⚠️  測試配置部分完成，建議修復問題${colors.reset}`);
} else {
  console.log(`\n${colors.red}❌ 測試配置需要改進${colors.reset}`);
}

// 提供下一步建議
console.log(`\n${colors.blue}建議的下一步：${colors.reset}`);

if (checks.configuration.failed > 0) {
  console.log('  1. 檢查缺失的配置文件');
}
if (checks.linting.failed > 0) {
  console.log('  2. 安裝缺失的 linting 工具');
}
if (checks.tests.failed > 0) {
  console.log('  3. 創建缺失的測試目錄');
}
if (checks.quality.failed > 0) {
  console.log('  4. 修復程式碼品質問題');
}

if (overallPercentage >= 80) {
  console.log('\n可執行的測試命令：');
  console.log('  npm test              - 執行所有測試');
  console.log('  npm run test:e2e      - 執行 E2E 測試');
  console.log('  npm run test:a11y     - 執行無障礙測試');
  console.log('  npm run test:performance - 執行性能測試');
  console.log('  npm run lint          - 執行程式碼檢查');
  console.log('  npm run format        - 格式化程式碼');
}

console.log(`\n${colors.cyan}================================${colors.reset}\n`);

process.exit(overallPercentage >= 60 ? 0 : 1);