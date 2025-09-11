#!/usr/bin/env node

/**
 * 環境檢查腳本
 * 用於驗證 Play right with AI 工作坊所需的所有工具是否正確安裝
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// 輔助函數
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, versionFlag = '--version') {
  try {
    const result = execSync(`${command} ${versionFlag}`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    return null;
  }
}

function checkEnvironmentVariable(varName) {
  return process.env[varName] ? true : false;
}

function parseVersion(versionString) {
  const match = versionString.match(/(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3])
    };
  }
  return null;
}

// 主要檢查邏輯
async function main() {
  log('\n========================================', 'cyan');
  log('   Play right with AI 環境檢查工具', 'cyan');
  log('========================================\n', 'cyan');

  let allChecksPassed = true;
  const results = [];

  // 1. 檢查 Node.js
  log('檢查 Node.js...', 'blue');
  const nodeVersion = process.version;
  const nodeParsed = parseVersion(nodeVersion);
  
  if (nodeParsed && nodeParsed.major >= 20) {
    log(`✅ Node.js ${nodeVersion} - 符合要求`, 'green');
    results.push({ tool: 'Node.js', status: 'pass', version: nodeVersion });
  } else if (nodeParsed && nodeParsed.major >= 18) {
    log(`⚠️  Node.js ${nodeVersion} - 可以使用但建議升級到 v20+`, 'yellow');
    results.push({ tool: 'Node.js', status: 'warning', version: nodeVersion });
  } else {
    log(`❌ Node.js ${nodeVersion} - 版本過舊，需要 v18.0.0 以上`, 'red');
    results.push({ tool: 'Node.js', status: 'fail', version: nodeVersion });
    allChecksPassed = false;
  }

  // 2. 檢查 npm
  log('\n檢查 npm...', 'blue');
  const npmVersion = checkCommand('npm', '--version');
  
  if (npmVersion) {
    const npmParsed = parseVersion(npmVersion);
    if (npmParsed && npmParsed.major >= 9) {
      log(`✅ npm ${npmVersion} - 符合要求`, 'green');
      results.push({ tool: 'npm', status: 'pass', version: npmVersion });
    } else {
      log(`⚠️  npm ${npmVersion} - 建議升級到 v9+`, 'yellow');
      results.push({ tool: 'npm', status: 'warning', version: npmVersion });
    }
  } else {
    log('❌ npm 未安裝', 'red');
    results.push({ tool: 'npm', status: 'fail', version: 'not installed' });
    allChecksPassed = false;
  }

  // 3. 檢查 VS Code
  log('\n檢查 VS Code...', 'blue');
  const vscodeVersion = checkCommand('code', '--version');
  
  if (vscodeVersion) {
    const versionLines = vscodeVersion.split('\n');
    log(`✅ VS Code ${versionLines[0]} - 已安裝`, 'green');
    results.push({ tool: 'VS Code', status: 'pass', version: versionLines[0] });
  } else {
    log('⚠️  VS Code 未在 PATH 中（可能需要手動添加）', 'yellow');
    results.push({ tool: 'VS Code', status: 'warning', version: 'not in PATH' });
  }

  // 4. 檢查 Git
  log('\n檢查 Git...', 'blue');
  const gitVersion = checkCommand('git', '--version');
  
  if (gitVersion) {
    log(`✅ ${gitVersion} - 已安裝`, 'green');
    results.push({ tool: 'Git', status: 'pass', version: gitVersion });
  } else {
    log('❌ Git 未安裝', 'red');
    results.push({ tool: 'Git', status: 'fail', version: 'not installed' });
    allChecksPassed = false;
  }

  // 5. 檢查 Playwright
  log('\n檢查 Playwright...', 'blue');
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const playwrightVersion = 
        packageJson.devDependencies?.['@playwright/test'] || 
        packageJson.dependencies?.['@playwright/test'];
      
      if (playwrightVersion) {
        log(`✅ Playwright ${playwrightVersion} - 已在專案中安裝`, 'green');
        results.push({ tool: 'Playwright', status: 'pass', version: playwrightVersion });
      } else {
        log('⚠️  Playwright 未在當前專案中安裝', 'yellow');
        log('   執行: npm install --save-dev @playwright/test', 'yellow');
        results.push({ tool: 'Playwright', status: 'warning', version: 'not in project' });
      }
    } else {
      log('⚠️  當前目錄不是 npm 專案', 'yellow');
      log('   執行: npm init -y', 'yellow');
      results.push({ tool: 'Playwright', status: 'warning', version: 'no package.json' });
    }
  } catch (error) {
    log('⚠️  無法檢查 Playwright 安裝狀態', 'yellow');
    results.push({ tool: 'Playwright', status: 'warning', version: 'check failed' });
  }

  // 6. 檢查 AI 服務 API Keys
  log('\n檢查 AI 服務設定...', 'blue');
  const aiServices = [
    { name: 'Claude (Anthropic)', env: 'ANTHROPIC_API_KEY' },
    { name: 'Gemini (Google)', env: 'GOOGLE_API_KEY' },
    { name: 'GPT-4 (OpenAI)', env: 'OPENAI_API_KEY' }
  ];

  let hasAtLeastOneAI = false;
  aiServices.forEach(service => {
    if (checkEnvironmentVariable(service.env)) {
      log(`✅ ${service.name} - API Key 已設定`, 'green');
      results.push({ tool: service.name, status: 'pass', version: 'configured' });
      hasAtLeastOneAI = true;
    } else {
      log(`⚠️  ${service.name} - API Key 未設定 (${service.env})`, 'yellow');
      results.push({ tool: service.name, status: 'warning', version: 'not configured' });
    }
  });

  if (!hasAtLeastOneAI) {
    log('\n❌ 至少需要設定一個 AI 服務的 API Key', 'red');
    allChecksPassed = false;
  }

  // 7. 生成報告
  log('\n========================================', 'cyan');
  log('            檢查結果摘要', 'cyan');
  log('========================================\n', 'cyan');

  const passCount = results.filter(r => r.status === 'pass').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  log(`通過: ${passCount} | 警告: ${warningCount} | 失敗: ${failCount}`, 'blue');

  // 8. 生成報告檔案
  const reportPath = path.join(process.cwd(), 'environment-check-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: passCount,
      warnings: warningCount,
      failed: failCount,
      allChecksPassed
    },
    details: results,
    recommendations: []
  };

  // 添加建議
  if (failCount > 0) {
    report.recommendations.push('請先修復所有失敗的項目再繼續課程');
  }
  if (!hasAtLeastOneAI) {
    report.recommendations.push('請至少設定一個 AI 服務的 API Key');
  }
  if (warningCount > 0) {
    report.recommendations.push('建議處理警告項目以獲得最佳學習體驗');
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 詳細報告已保存至: ${reportPath}`, 'cyan');

  // 9. 最終結果
  if (allChecksPassed && failCount === 0) {
    log('\n🎉 恭喜！您的環境已準備就緒！', 'green');
    log('   可以開始 Play right with AI 的學習之旅了！\n', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  請先解決上述問題再繼續', 'red');
    log('   如需協助，請參考課程文件或在 GitHub Issues 中提問\n', 'yellow');
    process.exit(1);
  }
}

// 錯誤處理
process.on('unhandledRejection', (error) => {
  log(`\n❌ 發生錯誤: ${error.message}`, 'red');
  process.exit(1);
});

// 執行主程式
main().catch(error => {
  log(`\n❌ 執行錯誤: ${error.message}`, 'red');
  process.exit(1);
});