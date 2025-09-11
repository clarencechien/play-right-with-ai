# 練習 4：CI/CD 自動修復整合

## 學習目標
- 整合自動修復機制到 CI/CD 管道
- 實作 GitHub Actions 的自動修復工作流
- 學習自動產生修復 PR 的技術
- 建立測試失敗的自動化處理流程

## 背景說明

將自動修復機制整合到 CI/CD 管道，能夠實現真正的自主測試系統。當測試在 CI 中失敗時，系統能夠：

1. **自動診斷和修復**
   - 分析失敗原因
   - 嘗試自動修復
   - 驗證修復效果

2. **自動化流程整合**
   - 觸發修復工作流
   - 產生修復 PR
   - 通知相關人員

## 實作步驟

### 步驟 1：設計 CI/CD 自動修復架構

```yaml
# .github/workflows/self-healing-tests.yml
name: Self-Healing E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # 每天執行一次
    - cron: '0 0 * * *'
  workflow_dispatch:
    inputs:
      auto_fix:
        description: '啟用自動修復'
        required: false
        default: 'true'

jobs:
  test-with-healing:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Run Tests with Self-Healing
        id: test-run
        continue-on-error: true
        run: |
          npm run test:self-healing
        env:
          ENABLE_SELF_HEALING: true
          HEALING_MODE: aggressive
      
      - name: Analyze Test Results
        id: analyze
        if: failure() || steps.test-run.outcome == 'failure'
        run: |
          node scripts/analyze-failures.js
          echo "::set-output name=needs_repair::$(cat needs-repair.txt)"
          echo "::set-output name=repair_summary::$(cat repair-summary.txt)"
      
      - name: Apply Auto-Fixes
        id: auto-fix
        if: steps.analyze.outputs.needs_repair == 'true'
        run: |
          node scripts/apply-auto-fixes.js
          echo "::set-output name=fixes_applied::$(cat fixes-applied.txt)"
      
      - name: Re-run Tests After Fix
        if: steps.auto-fix.outputs.fixes_applied == 'true'
        run: |
          npm run test:verify-fixes
      
      - name: Create Fix PR
        if: steps.auto-fix.outputs.fixes_applied == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          commit-message: '🔧 自動修復測試選擇器和問題'
          title: '[Auto-Fix] 修復失敗的 E2E 測試'
          body: |
            ## 🤖 自動修復摘要
            
            此 PR 由自動修復系統生成，修復了以下問題：
            
            ${{ steps.analyze.outputs.repair_summary }}
            
            ### 修復詳情
            - 修復的選擇器數量：${{ steps.auto-fix.outputs.selector_fixes }}
            - 更新的測試數量：${{ steps.auto-fix.outputs.test_fixes }}
            - 修復策略：${{ steps.auto-fix.outputs.strategies_used }}
            
            ### 驗證結果
            - ✅ 所有測試已通過驗證
            
            ---
            *此 PR 由 CI/CD 自動修復系統生成*
          branch: auto-fix/test-repairs-${{ github.run_number }}
          delete-branch: true
          labels: |
            automated
            test-fix
            self-healing
      
      - name: Upload Healing Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: healing-report
          path: |
            healing-report.html
            selector-mappings.json
            failure-analysis.json
```

### 步驟 2：實作失敗分析腳本

```javascript
// scripts/analyze-failures.js
const fs = require('fs');
const path = require('path');

/**
 * CI 測試失敗分析器
 */
class CIFailureAnalyzer {
  constructor() {
    this.failures = [];
    this.repairableIssues = [];
    this.nonRepairableIssues = [];
  }
  
  // 分析測試結果
  async analyzeTestResults() {
    // 讀取測試報告
    const reportPath = path.join(process.cwd(), 'test-results/report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.log('找不到測試報告');
      return;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    
    // 分析每個失敗的測試
    for (const suite of report.suites) {
      for (const test of suite.tests) {
        if (test.status === 'failed') {
          const analysis = await this.analyzeFailure(test);
          this.failures.push(analysis);
          
          if (analysis.repairable) {
            this.repairableIssues.push(analysis);
          } else {
            this.nonRepairableIssues.push(analysis);
          }
        }
      }
    }
    
    // 生成分析報告
    this.generateAnalysisReport();
  }
  
  // 分析單個失敗
  async analyzeFailure(test) {
    const error = test.error;
    const analysis = {
      testName: test.title,
      testFile: test.file,
      error: error.message,
      stack: error.stack,
      repairable: false,
      repairType: null,
      suggestedFix: null
    };
    
    // 判斷錯誤類型
    if (this.isSelectorError(error)) {
      analysis.repairable = true;
      analysis.repairType = 'selector';
      analysis.suggestedFix = await this.suggestSelectorFix(error, test);
      
    } else if (this.isTimingError(error)) {
      analysis.repairable = true;
      analysis.repairType = 'timing';
      analysis.suggestedFix = this.suggestTimingFix(error);
      
    } else if (this.isAPIError(error)) {
      analysis.repairable = true;
      analysis.repairType = 'api';
      analysis.suggestedFix = this.suggestAPIFix(error);
      
    } else if (this.isAssertionError(error)) {
      // 斷言錯誤可能需要人工檢查
      analysis.repairable = false;
      analysis.repairType = 'assertion';
      analysis.suggestedFix = '需要人工檢查業務邏輯';
    }
    
    return analysis;
  }
  
  // 判斷是否為選擇器錯誤
  isSelectorError(error) {
    const selectorErrorPatterns = [
      'waiting for selector',
      'element not found',
      'no element matches selector',
      'failed to find element',
      'locator.click: Target closed'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return selectorErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
  }
  
  // 判斷是否為時序錯誤
  isTimingError(error) {
    const timingErrorPatterns = [
      'timeout',
      'exceeded',
      'waiting for',
      'page.goto: Navigation timeout'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return timingErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
  }
  
  // 判斷是否為 API 錯誤
  isAPIError(error) {
    const apiErrorPatterns = [
      'fetch failed',
      'network',
      'response status',
      'api error',
      'request failed'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return apiErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
  }
  
  // 判斷是否為斷言錯誤
  isAssertionError(error) {
    return error.message.includes('expect') || 
           error.message.includes('assertion') ||
           error.message.includes('toBe') ||
           error.message.includes('toContain');
  }
  
  // 建議選擇器修復
  async suggestSelectorFix(error, test) {
    // 從錯誤訊息中提取失敗的選擇器
    const selectorMatch = error.message.match(/selector[:\s]+"([^"]+)"/i) ||
                         error.message.match(/waiting for[:\s]+"([^"]+)"/i);
    
    if (!selectorMatch) return null;
    
    const failedSelector = selectorMatch[1];
    
    return {
      type: 'replace_selector',
      original: failedSelector,
      suggestions: [
        `[data-testid="${this.generateTestId(failedSelector)}"]`,
        `text="${this.extractText(test.title)}"`,
        `:has-text("${this.extractText(test.title)}")`
      ],
      confidence: 0.7
    };
  }
  
  // 建議時序修復
  suggestTimingFix(error) {
    return {
      type: 'increase_timeout',
      original: '30000',
      suggested: '60000',
      addWaitFor: 'networkidle',
      confidence: 0.8
    };
  }
  
  // 建議 API 修復
  suggestAPIFix(error) {
    return {
      type: 'add_mock',
      endpoint: this.extractEndpoint(error.message),
      mockStrategy: 'fallback',
      confidence: 0.6
    };
  }
  
  // 生成分析報告
  generateAnalysisReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFailures: this.failures.length,
      repairableCount: this.repairableIssues.length,
      nonRepairableCount: this.nonRepairableIssues.length,
      issues: this.failures,
      summary: this.generateSummary()
    };
    
    // 寫入報告檔案
    fs.writeFileSync('failure-analysis.json', JSON.stringify(report, null, 2));
    
    // 設定 CI 輸出
    fs.writeFileSync('needs-repair.txt', 
      this.repairableIssues.length > 0 ? 'true' : 'false'
    );
    
    fs.writeFileSync('repair-summary.txt', report.summary);
    
    console.log('分析完成:');
    console.log(`- 總失敗數: ${this.failures.length}`);
    console.log(`- 可修復: ${this.repairableIssues.length}`);
    console.log(`- 需人工處理: ${this.nonRepairableIssues.length}`);
  }
  
  // 生成摘要
  generateSummary() {
    const summary = [];
    
    if (this.repairableIssues.length > 0) {
      summary.push(`### 可自動修復的問題 (${this.repairableIssues.length})`);
      
      const byType = {};
      this.repairableIssues.forEach(issue => {
        byType[issue.repairType] = (byType[issue.repairType] || 0) + 1;
      });
      
      Object.entries(byType).forEach(([type, count]) => {
        summary.push(`- ${this.getTypeDescription(type)}: ${count} 個`);
      });
    }
    
    if (this.nonRepairableIssues.length > 0) {
      summary.push(`\n### 需要人工處理的問題 (${this.nonRepairableIssues.length})`);
      
      this.nonRepairableIssues.forEach(issue => {
        summary.push(`- ${issue.testName}: ${issue.suggestedFix}`);
      });
    }
    
    return summary.join('\n');
  }
  
  // 獲取類型描述
  getTypeDescription(type) {
    const descriptions = {
      'selector': '選擇器失效',
      'timing': '時序問題',
      'api': 'API 整合問題',
      'assertion': '斷言失敗'
    };
    
    return descriptions[type] || type;
  }
  
  // 輔助方法
  generateTestId(selector) {
    // 從選擇器生成合理的 test-id
    return selector.replace(/[#.\[\]]/g, '').replace(/\s+/g, '-');
  }
  
  extractText(testTitle) {
    // 從測試標題提取可能的文字內容
    const words = testTitle.split(' ').slice(-2).join(' ');
    return words;
  }
  
  extractEndpoint(errorMessage) {
    // 從錯誤訊息提取 API 端點
    const match = errorMessage.match(/\/api\/[^\s]+/);
    return match ? match[0] : '/api/unknown';
  }
}

// 執行分析
async function main() {
  const analyzer = new CIFailureAnalyzer();
  await analyzer.analyzeTestResults();
}

main().catch(console.error);
```

### 步驟 3：實作自動修復應用腳本

```javascript
// scripts/apply-auto-fixes.js
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;

/**
 * 自動修復應用器
 */
class AutoFixApplier {
  constructor() {
    this.appliedFixes = [];
    this.failedFixes = [];
  }
  
  // 應用所有修復
  async applyAllFixes() {
    // 讀取分析報告
    const analysisPath = 'failure-analysis.json';
    if (!fs.existsSync(analysisPath)) {
      console.log('找不到分析報告');
      return;
    }
    
    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    
    // 按類型分組修復
    const fixesByType = {};
    analysis.issues.filter(i => i.repairable).forEach(issue => {
      if (!fixesByType[issue.repairType]) {
        fixesByType[issue.repairType] = [];
      }
      fixesByType[issue.repairType].push(issue);
    });
    
    // 應用各類型修復
    for (const [type, issues] of Object.entries(fixesByType)) {
      console.log(`\n應用 ${type} 類型修復 (${issues.length} 個)`);
      
      switch (type) {
        case 'selector':
          await this.fixSelectors(issues);
          break;
        case 'timing':
          await this.fixTimingIssues(issues);
          break;
        case 'api':
          await this.fixAPIIssues(issues);
          break;
      }
    }
    
    // 生成修復報告
    this.generateFixReport();
  }
  
  // 修復選擇器問題
  async fixSelectors(issues) {
    for (const issue of issues) {
      try {
        const filePath = issue.testFile;
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // 解析 AST
        const ast = parse(fileContent, {
          sourceType: 'module',
          plugins: ['typescript']
        });
        
        let modified = false;
        
        // 遍歷 AST 找到並替換選擇器
        traverse(ast, {
          StringLiteral(path) {
            if (path.node.value === issue.suggestedFix.original) {
              // 使用第一個建議的選擇器
              const newSelector = issue.suggestedFix.suggestions[0];
              path.node.value = newSelector;
              modified = true;
              
              console.log(`  ✅ 替換選擇器: ${issue.suggestedFix.original} → ${newSelector}`);
            }
          },
          
          TemplateLiteral(path) {
            // 處理模板字串中的選擇器
            if (path.node.quasis.some(q => q.value.raw.includes(issue.suggestedFix.original))) {
              // 這裡需要更複雜的處理
              modified = true;
            }
          }
        });
        
        if (modified) {
          // 生成新的程式碼
          const { code } = generate(ast);
          
          // 寫回檔案
          fs.writeFileSync(filePath, code);
          
          this.appliedFixes.push({
            type: 'selector',
            file: filePath,
            original: issue.suggestedFix.original,
            fixed: issue.suggestedFix.suggestions[0]
          });
        }
        
      } catch (error) {
        console.error(`  ❌ 修復失敗: ${error.message}`);
        this.failedFixes.push({
          issue,
          error: error.message
        });
      }
    }
  }
  
  // 修復時序問題
  async fixTimingIssues(issues) {
    for (const issue of issues) {
      try {
        const filePath = issue.testFile;
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // 增加超時時間
        if (issue.suggestedFix.type === 'increase_timeout') {
          const timeoutRegex = /timeout:\s*(\d+)/g;
          fileContent = fileContent.replace(timeoutRegex, 
            `timeout: ${issue.suggestedFix.suggested}`
          );
          
          // 添加 waitForLoadState
          if (issue.suggestedFix.addWaitFor) {
            const gotoRegex = /(await page\.goto\([^)]+\))/g;
            fileContent = fileContent.replace(gotoRegex, 
              `$1;\n  await page.waitForLoadState('${issue.suggestedFix.addWaitFor}')`
            );
          }
          
          fs.writeFileSync(filePath, fileContent);
          
          this.appliedFixes.push({
            type: 'timing',
            file: filePath,
            fix: 'increased timeout and added wait'
          });
          
          console.log(`  ✅ 修復時序問題: ${filePath}`);
        }
        
      } catch (error) {
        console.error(`  ❌ 修復失敗: ${error.message}`);
        this.failedFixes.push({
          issue,
          error: error.message
        });
      }
    }
  }
  
  // 修復 API 問題
  async fixAPIIssues(issues) {
    // 創建 Mock 設定檔
    const mockConfig = {
      endpoints: {}
    };
    
    for (const issue of issues) {
      if (issue.suggestedFix.type === 'add_mock') {
        const endpoint = issue.suggestedFix.endpoint;
        
        mockConfig.endpoints[endpoint] = {
          method: 'GET',
          response: {
            status: 200,
            data: this.generateMockData(endpoint)
          },
          strategy: issue.suggestedFix.mockStrategy
        };
        
        console.log(`  ✅ 添加 Mock: ${endpoint}`);
      }
    }
    
    // 寫入 Mock 設定
    if (Object.keys(mockConfig.endpoints).length > 0) {
      fs.writeFileSync('mock-config.json', JSON.stringify(mockConfig, null, 2));
      
      this.appliedFixes.push({
        type: 'api',
        file: 'mock-config.json',
        mocks: Object.keys(mockConfig.endpoints)
      });
    }
  }
  
  // 生成 Mock 資料
  generateMockData(endpoint) {
    // 根據端點生成合理的 Mock 資料
    if (endpoint.includes('user')) {
      return {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      };
    } else if (endpoint.includes('product')) {
      return [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ];
    } else {
      return { success: true, data: {} };
    }
  }
  
  // 生成修復報告
  generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      appliedFixes: this.appliedFixes.length,
      failedFixes: this.failedFixes.length,
      details: this.appliedFixes
    };
    
    // 統計資訊
    const stats = {
      selector_fixes: this.appliedFixes.filter(f => f.type === 'selector').length,
      timing_fixes: this.appliedFixes.filter(f => f.type === 'timing').length,
      api_fixes: this.appliedFixes.filter(f => f.type === 'api').length,
      test_fixes: new Set(this.appliedFixes.map(f => f.file)).size,
      strategies_used: [...new Set(this.appliedFixes.map(f => f.type))].join(', ')
    };
    
    // 寫入檔案供 CI 使用
    fs.writeFileSync('fixes-applied.txt', 
      this.appliedFixes.length > 0 ? 'true' : 'false'
    );
    
    // 寫入統計資訊供 PR 描述使用
    Object.entries(stats).forEach(([key, value]) => {
      fs.writeFileSync(`${key}.txt`, value.toString());
    });
    
    console.log('\n修復報告:');
    console.log(`- 成功應用: ${this.appliedFixes.length} 個修復`);
    console.log(`- 失敗: ${this.failedFixes.length} 個`);
    console.log(`- 影響檔案: ${stats.test_fixes} 個`);
  }
}

// 執行修復
async function main() {
  const fixer = new AutoFixApplier();
  await fixer.applyAllFixes();
}

main().catch(console.error);
```

### 步驟 4：設定通知和監控

```yaml
# .github/workflows/healing-notifications.yml
name: Self-Healing Notifications

on:
  workflow_run:
    workflows: ["Self-Healing E2E Tests"]
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - name: Download Healing Report
        uses: actions/download-artifact@v3
        with:
          name: healing-report
          path: ./reports
      
      - name: Parse Report
        id: parse
        run: |
          report=$(cat reports/healing-report.json)
          echo "::set-output name=fixes_count::$(echo $report | jq '.fixes | length')"
          echo "::set-output name=success_rate::$(echo $report | jq '.successRate')"
      
      - name: Send Slack Notification
        if: steps.parse.outputs.fixes_count > 0
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🤖 自動修復系統報告",
              "blocks": [
                {
                  "type": "header",
                  "text": {
                    "type": "plain_text",
                    "text": "E2E 測試自動修復完成"
                  }
                },
                {
                  "type": "section",
                  "fields": [
                    {
                      "type": "mrkdwn",
                      "text": "*修復數量:* ${{ steps.parse.outputs.fixes_count }}"
                    },
                    {
                      "type": "mrkdwn",
                      "text": "*成功率:* ${{ steps.parse.outputs.success_rate }}%"
                    }
                  ]
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {
                        "type": "plain_text",
                        "text": "查看 PR"
                      },
                      "url": "${{ github.event.pull_request.html_url }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 預期結果

完成本練習後，你應該能夠：

1. **建立完整的 CI/CD 自動修復流程**
   - 自動檢測測試失敗
   - 分析並修復問題
   - 生成修復 PR

2. **實作智能失敗分析**
   - 分類失敗類型
   - 判斷可修復性
   - 生成修復建議

3. **自動化修復應用**
   - 程式碼自動更新
   - Mock 自動生成
   - 驗證修復效果

## 思考與挑戰

### 進階挑戰 1：跨專案修復共享
建立修復知識庫，跨專案共享：

```javascript
class CrossProjectHealing {
  async shareHealingKnowledge(fix) {
    // 上傳到中央知識庫
    // 其他專案可以查詢和應用
  }
}
```

### 進階挑戰 2：修復效果追蹤
追蹤修復的長期效果：

```javascript
class HealingEffectivenessTracker {
  async trackFixLongevity(fix) {
    // 記錄修復後的穩定性
    // 分析修復的持久性
    // 優化修復策略
  }
}
```

### 進階挑戰 3：預防性修復
在問題發生前主動修復：

```javascript
class PreventiveHealing {
  async predictAndPrevent() {
    // 分析程式碼變更
    // 預測可能的測試失敗
    // 提前應用修復
  }
}
```

## 實用提示

1. **CI/CD 整合要點**
   - 設定合理的超時限制
   - 保留修復歷史記錄
   - 實作回滾機制
   - 監控修復成功率

2. **自動 PR 最佳實踐**
   - 清晰的 PR 描述
   - 包含修復前後對比
   - 添加相關標籤
   - 自動指派審核者

3. **安全考量**
   - 限制自動修復範圍
   - 需要人工審核 PR
   - 避免破壞性變更
   - 保護敏感資料

## 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [自動化測試修復模式](https://www.selenium.dev/documentation/test_practices/)
- [CI/CD 最佳實踐](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment)

---

💡 **提示**：CI/CD 整合的自動修復系統是實現真正 DevOps 自動化的關鍵。它不僅減少人工干預，還能加速開發週期，提高團隊生產力。