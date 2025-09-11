#!/usr/bin/env node

/**
 * Prompt Validation Script
 * 測試 Golden Prompts 在不同 AI 模型上的效果
 * 
 * 使用方式:
 * node prompt-tester.js --chapter 2 --model claude --iterations 3
 */

const fs = require('fs').promises;
const path = require('path');

// 測試配置
const CONFIG = {
  models: {
    claude: {
      name: 'Claude 3.5 Sonnet',
      endpoint: 'https://api.anthropic.com/v1/messages',
      apiKeyEnv: 'CLAUDE_API_KEY'
    },
    gpt: {
      name: 'GPT',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKeyEnv: 'OPENAI_API_KEY'
    },
    gemini: {
      name: 'Gemini Pro',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      apiKeyEnv: 'GEMINI_API_KEY'
    }
  },
  chapters: {
    2: 'app-generation',
    3: 'test-strategy',
    4: 'playwright-scripts',
    5: 'failure-analysis',
    6: 'self-repair'
  }
};

/**
 * 測試結果類
 */
class TestResult {
  /**
   *
   * @param {*} model - model 參數
   * @param {*} chapter - chapter 參數
   * @param {*} iteration - iteration 參數
   */
  constructor(model, chapter, iteration) {
    this.model = model;
    this.chapter = chapter;
    this.iteration = iteration;
    this.timestamp = new Date().toISOString();
    this.metrics = {
      consistency: 0,
      completeness: 0,
      functionality: 0,
      codeQuality: 0,
      bilingualQuality: 0
    };
    this.issues = [];
    this.output = '';
    this.executionTime = 0;
  }

  /**
   * 計算總分
   */
  getScore() {
    const weights = {
      consistency: 0.2,
      completeness: 0.25,
      functionality: 0.25,
      codeQuality: 0.15,
      bilingualQuality: 0.15
    };

    return Object.entries(this.metrics).reduce((total, [key, value]) => {
      return total + (value * weights[key]);
    }, 0);
  }

  /**
   * 生成報告
   */
  generateReport() {
    return `
## Test Result Report
**Model**: ${this.model}
**Chapter**: ${this.chapter}
**Iteration**: ${this.iteration}
**Timestamp**: ${this.timestamp}
**Execution Time**: ${this.executionTime}ms

### Metrics
- Consistency: ${this.metrics.consistency}/10
- Completeness: ${this.metrics.completeness}/10
- Functionality: ${this.metrics.functionality}/10
- Code Quality: ${this.metrics.codeQuality}/10
- Bilingual Quality: ${this.metrics.bilingualQuality}/10

### Overall Score: ${this.getScore().toFixed(2)}/10

### Issues Found
${this.issues.length > 0 ? this.issues.map(i => `- ${i}`).join('\n') : 'No issues found'}

### Output Preview
\`\`\`
${this.output.substring(0, 500)}...
\`\`\`
`;
  }
}

/**
 * Prompt 測試器
 */
class PromptTester {
  /**
     * 初始化建構函式
     */
    constructor() {
    this.results = [];
  }

  /**
   * 載入 prompt
   * @param {*} chapter - chapter 參數
   */
  async loadPrompt(chapter) {
    const chapterName = CONFIG.chapters[chapter];
    const promptPath = path.join(__dirname, `../chapter-0${chapter}/${chapterName}.md`);
    
    try {
      const content = await fs.readFile(promptPath, 'utf-8');
      // 提取 markdown 中的 prompt 內容
      const promptMatch = content.match(/```markdown\n([\s\S]*?)\n```/);
      return promptMatch ? promptMatch[1] : content;
    } catch (error) {
      throw new Error(`Failed to load prompt for chapter ${chapter}: ${error.message}`);
    }
  }

  /**
   * 載入測試條件
   * @param {*} chapter - chapter 參數
   */
  async loadTestCriteria(chapter) {
    const chapterName = CONFIG.chapters[chapter];
    const testPath = path.join(__dirname, `../chapter-0${chapter}/${chapterName}.test.md`);
    
    try {
      const content = await fs.readFile(testPath, 'utf-8');
      return this.parseTestCriteria(content);
    } catch (error) {
      throw new Error(`Failed to load test criteria for chapter ${chapter}: ${error.message}`);
    }
  }

  /**
   * 解析測試條件
   * @param {*} content - content 參數
   */
  parseTestCriteria(content) {
    const criteria = {
      consistency: [],
      completeness: [],
      functionality: [],
      codeQuality: [],
      bilingualQuality: []
    };

    // 簡化的解析邏輯 - 實際應用中需要更複雜的解析
    const sections = content.split('###');
    sections.forEach(section => {
      if (section.includes('Consistency')) {
        criteria.consistency = this.extractChecklist(section);
      } else if (section.includes('Completeness')) {
        criteria.completeness = this.extractChecklist(section);
      } else if (section.includes('Functionality')) {
        criteria.functionality = this.extractChecklist(section);
      } else if (section.includes('Code Quality')) {
        criteria.codeQuality = this.extractChecklist(section);
      } else if (section.includes('Bilingual')) {
        criteria.bilingualQuality = this.extractChecklist(section);
      }
    });

    return criteria;
  }

  /**
   * 提取檢查清單
   * @param {*} section - section 參數
   */
  extractChecklist(section) {
    const checklistItems = [];
    const lines = section.split('\n');
    lines.forEach(line => {
      if (line.includes('- [ ]')) {
        checklistItems.push(line.replace('- [ ]', '').trim());
      }
    });
    return checklistItems;
  }

  /**
   * 模擬 AI 模型調用
   * @param {*} model - model 參數
   * @param {*} prompt - prompt 參數
   */
  async callModel(model, prompt) {
    // 注意：這是模擬實現
    // 實際使用時需要真實的 API 調用
    console.log(`Simulating ${model} API call...`);
    
    // 模擬延遲
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模擬回應
    const simulatedResponses = {
      claude: this.generateSimulatedResponse('claude', prompt),
      gpt: this.generateSimulatedResponse('gpt', prompt),
      gemini: this.generateSimulatedResponse('gemini', prompt)
    };

    return simulatedResponses[model];
  }

  /**
   * 生成模擬回應
   * @param {*} model - model 參數
   * @param {*} prompt - prompt 參數
   */
  generateSimulatedResponse(model, prompt) {
    // 基於 prompt 類型生成模擬回應
    if (prompt.includes('TODO')) {
      return this.generateTodoAppResponse(model);
    } else if (prompt.includes('test strategy')) {
      return this.generateTestStrategyResponse(model);
    } else if (prompt.includes('Playwright')) {
      return this.generatePlaywrightResponse(model);
    }
    
    return `Simulated response from ${model}`;
  }

  /**
   * 生成 TODO 應用回應
   * @param {*} _model - model 參數
   */
  generateTodoAppResponse(_model) {
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>待辦事項應用程式</title>
    <style>
        /* CSS 樣式 */
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>待辦事項</h1>
        <input type="text" id="todoInput" placeholder="新增待辦事項">
        <button onclick="addTodo()">新增</button>
        <ul id="todoList"></ul>
    </div>
    <script>
        // JavaScript 功能
        function addTodo() {
            const input = document.getElementById('todoInput');
            const list = document.getElementById('todoList');
            if (input.value) {
                const li = document.createElement('li');
                li.textContent = input.value;
                list.appendChild(li);
                input.value = '';
                saveToLocalStorage();
            }
        }
        
        function saveToLocalStorage() {
            // localStorage 實作
        }
    </script>
</body>
</html>
    `;
  }

  /**
   * 生成測試策略回應
   * @param {*} _model - model 參數
   */
  generateTestStrategyResponse(_model) {
    return `
## 測試策略文檔

### 1. 測試範圍
- 功能測試
- 整合測試
- 效能測試

### 2. 測試案例
1. 新增待辦事項
2. 標記完成
3. 刪除項目

### 3. 風險評估
- 高風險：資料持久化
- 中風險：UI 互動
- 低風險：樣式呈現
    `;
  }

  /**
   * 生成 Playwright 回應
   * @param {*} _model - model 參數
   */
  generatePlaywrightResponse(_model) {
    return `
import { test, expect } from '@playwright/test';

test.describe('TODO App Tests', () => {
  test('should add a new todo', async ({ page }) => {
    await page.goto('/');
    await page.fill('#todoInput', 'Test item');
    await page.click('button:text("新增")');
    await expect(page.locator('#todoList li')).toHaveText('Test item');
  });
});
    `;
  }

  /**
   * 評估輸出
   * @param {*} output - output 參數
   * @param {*} criteria - criteria 參數
   * @param {*} chapter - chapter 參數
   */
  async evaluateOutput(output, criteria, chapter) {
    const result = new TestResult('', chapter, 0);

    // 一致性評估
    result.metrics.consistency = this.evaluateConsistency(output);

    // 完整性評估
    result.metrics.completeness = this.evaluateCompleteness(output, criteria.completeness);

    // 功能性評估
    if (chapter === '2') {
      result.metrics.functionality = this.evaluateFunctionality(output);
    } else {
      result.metrics.functionality = 8; // 預設分數
    }

    // 程式碼品質評估
    result.metrics.codeQuality = this.evaluateCodeQuality(output);

    // 雙語品質評估
    result.metrics.bilingualQuality = this.evaluateBilingualQuality(output);

    return result;
  }

  /**
   * 評估一致性
   * @param {*} output - output 參數
   */
  evaluateConsistency(output) {
    // 簡化的評估邏輯
    const hasStructure = output.includes('<!DOCTYPE') || output.includes('test.describe');
    const hasComments = output.includes('//') || output.includes('/*');
    const hasChineseOutput = /[\u4e00-\u9fa5]/.test(output);

    let score = 5; // 基礎分數
    if (hasStructure) score += 2;
    if (hasComments) score += 1.5;
    if (hasChineseOutput) score += 1.5;

    return Math.min(score, 10);
  }

  /**
   * 評估完整性
   * @param {*} output - output 參數
   * @param {*} criteria - criteria 參數
   */
  evaluateCompleteness(output, criteria) {
    let matchedCriteria = 0;
    
    // 檢查每個條件是否滿足
    criteria.forEach(criterion => {
      // 簡化的檢查邏輯
      if (output.toLowerCase().includes(criterion.toLowerCase().substring(0, 10))) {
        matchedCriteria++;
      }
    });

    return criteria.length > 0 ? (matchedCriteria / criteria.length) * 10 : 7;
  }

  /**
   * 評估功能性
   * @param {*} output - output 參數
   */
  evaluateFunctionality(output) {
    const functionalityChecks = {
      hasHTML: output.includes('<html') || output.includes('<!DOCTYPE'),
      hasCSS: output.includes('<style') || output.includes('css'),
      hasJS: output.includes('<script') || output.includes('function'),
      hasLocalStorage: output.includes('localStorage'),
      hasCRUD: output.includes('add') && output.includes('delete')
    };

    const score = Object.values(functionalityChecks).filter(Boolean).length * 2;
    return Math.min(score, 10);
  }

  /**
   * 評估程式碼品質
   * @param {*} output - output 參數
   */
  evaluateCodeQuality(output) {
    let score = 6; // 基礎分數

    // 檢查程式碼品質指標
    if (output.includes('const') || output.includes('let')) score += 1;
    if (output.includes('async') || output.includes('await')) score += 1;
    if (output.includes('try') && output.includes('catch')) score += 1;
    if (output.split('\n').some(line => line.trim().startsWith('//'))) score += 1;

    return Math.min(score, 10);
  }

  /**
   * 評估雙語品質
   * @param {*} output - output 參數
   */
  evaluateBilingualQuality(output) {
    const hasEnglishComments = /\/\/\s*[A-Za-z]/.test(output);
    const hasChineseContent = /[\u4e00-\u9fa5]/.test(output);
    const hasTraditionalChinese = /[繁體中文標題註解]/.test(output);

    let score = 5;
    if (hasEnglishComments) score += 2;
    if (hasChineseContent) score += 2;
    if (hasTraditionalChinese) score += 1;

    return Math.min(score, 10);
  }

  /**
   * 執行測試
   * @param {*} chapter - chapter 參數
   * @param {*} model - model 參數
   * @param {*} iterations - iterations 參數
   */
  async runTest(chapter, model, iterations) {
    console.log(`\n🧪 Testing Chapter ${chapter} with ${CONFIG.models[model].name}`);
    console.log('='.repeat(50));

    const prompt = await this.loadPrompt(chapter);
    const criteria = await this.loadTestCriteria(chapter);
    const results = [];

    for (let i = 1; i <= iterations; i++) {
      console.log(`\n📝 Iteration ${i}/${iterations}`);
      
      const startTime = Date.now();
      const output = await this.callModel(model, prompt);
      const executionTime = Date.now() - startTime;

      const result = await this.evaluateOutput(output, criteria, chapter);
      result.model = CONFIG.models[model].name;
      result.chapter = chapter;
      result.iteration = i;
      result.output = output;
      result.executionTime = executionTime;

      results.push(result);
      this.results.push(result);

      console.log(`✅ Score: ${result.getScore().toFixed(2)}/10`);
      console.log(`⏱️  Time: ${executionTime}ms`);
    }

    return results;
  }

  /**
   * 生成總結報告
   */
  async generateSummaryReport() {
    const report = [];
    report.push('# Prompt Validation Summary Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);

    // 按章節和模型分組
    const grouped = {};
    this.results.forEach(result => {
      const key = `ch${result.chapter}-${result.model}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(result);
    });

    // 生成摘要表格
    report.push('## Summary Table\n');
    report.push('| Chapter | Model | Avg Score | Consistency | Success Rate |');
    report.push('|---------|-------|-----------|-------------|--------------|');

    Object.entries(grouped).forEach(([key, results]) => {
      const avgScore = results.reduce((sum, r) => sum + r.getScore(), 0) / results.length;
      const avgConsistency = results.reduce((sum, r) => sum + r.metrics.consistency, 0) / results.length;
      const successRate = results.filter(r => r.getScore() >= 7).length / results.length * 100;

      const [chapter, ...modelParts] = key.split('-');
      const model = modelParts.join('-');

      report.push(`| ${chapter} | ${model} | ${avgScore.toFixed(2)} | ${avgConsistency.toFixed(2)} | ${successRate.toFixed(0)}% |`);
    });

    // 詳細結果
    report.push('\n## Detailed Results\n');
    Object.entries(grouped).forEach(([key, results]) => {
      report.push(`### ${key}\n`);
      results.forEach(result => {
        report.push(result.generateReport());
      });
    });

    // 建議
    report.push('\n## Recommendations\n');
    this.generateRecommendations(report, grouped);

    return report.join('\n');
  }

  /**
   * 生成建議
   * @param {*} report - report 參數
   * @param {*} grouped - grouped 參數
   */
  generateRecommendations(report, grouped) {
    const recommendations = [];

    Object.entries(grouped).forEach(([key, results]) => {
      const avgScore = results.reduce((sum, r) => sum + r.getScore(), 0) / results.length;
      
      if (avgScore < 7) {
        recommendations.push(`- ${key}: Prompt needs significant improvement (Score: ${avgScore.toFixed(2)})`);
      } else if (avgScore < 8.5) {
        recommendations.push(`- ${key}: Prompt could benefit from optimization (Score: ${avgScore.toFixed(2)})`);
      } else {
        recommendations.push(`- ${key}: Prompt performing well (Score: ${avgScore.toFixed(2)})`);
      }

      // 檢查特定問題
      const issues = new Set();
      results.forEach(r => r.issues.forEach(i => issues.add(i)));
      if (issues.size > 0) {
        recommendations.push(`  Issues found: ${Array.from(issues).join(', ')}`);
      }
    });

    report.push(...recommendations);
  }

  /**
   * 保存報告
   * @param {*} content - content 參數
   */
  async saveReport(content) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `validation-report-${timestamp}.md`;
    const filepath = path.join(__dirname, filename);

    await fs.writeFile(filepath, content);
    console.log(`\n📊 Report saved to: ${filepath}`);

    return filepath;
  }
}

/**
 * 命令列介面
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    chapter: null,
    model: 'claude',
    iterations: 3,
    all: false
  };

  // 解析參數
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--chapter':
      case '-c':
        options.chapter = parseInt(args[++i]);
        break;
      case '--model':
      case '-m':
        options.model = args[++i];
        break;
      case '--iterations':
      case '-i':
        options.iterations = parseInt(args[++i]);
        break;
      case '--all':
      case '-a':
        options.all = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        return;
    }
  }

  // 驗證參數
  if (!options.all && !options.chapter) {
    console.error('❌ Error: Please specify --chapter or use --all');
    showHelp();
    process.exit(1);
  }

  if (!CONFIG.models[options.model]) {
    console.error(`❌ Error: Unknown model '${options.model}'`);
    console.log(`Available models: ${Object.keys(CONFIG.models).join(', ')}`);
    process.exit(1);
  }

  // 執行測試
  const tester = new PromptTester();

  try {
    if (options.all) {
      // 測試所有章節
      for (const chapter of Object.keys(CONFIG.chapters)) {
        await tester.runTest(chapter, options.model, options.iterations);
      }
    } else {
      // 測試特定章節
      await tester.runTest(options.chapter, options.model, options.iterations);
    }

    // 生成並保存報告
    const report = await tester.generateSummaryReport();
    await tester.saveReport(report);

    console.log('\n✨ Validation completed successfully!');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 顯示幫助資訊
 */
function showHelp() {
  console.log(`
Golden Prompt Validation Tool

Usage: node prompt-tester.js [options]

Options:
  -c, --chapter <number>    Test specific chapter (2-6)
  -m, --model <name>        AI model to test (claude, gpt, gemini)
  -i, --iterations <number> Number of test iterations (default: 3)
  -a, --all                 Test all chapters
  -h, --help               Show this help message

Examples:
  node prompt-tester.js --chapter 2 --model claude
  node prompt-tester.js --all --model gpt --iterations 5
  node prompt-tester.js -c 3 -m gemini -i 10

Available Chapters:
  2 - Application Generation
  3 - Test Strategy Creation
  4 - Playwright Script Generation
  5 - Failure Analysis and Debugging
  6 - Self-Repair Implementation

Available Models:
  claude - Claude 3.5 Sonnet
  gpt   - GPT
  gemini - Gemini Pro
  `);
}

// 執行主程式
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PromptTester, TestResult };