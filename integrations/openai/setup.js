/**
 * OpenAI (GPT) API 整合設定
 * 用於 "Play right with AI" 工作坊
 */

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

/**
 * OpenAI API 整合類別
 * 提供與 OpenAI GPT 模型互動的功能
 */
class OpenAIIntegration {
  /**
   * 初始化 OpenAI 整合
   * @param {string} apiKey - OpenAI API 金鑰
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('需要提供 OPENAI_API_KEY');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey,
    });
    
    this.defaultModel = 'gpt-turbo-preview';
    this.fallbackModel = 'gpt-3.5-turbo';
  }

  /**
   * 生成應用程式碼
   * @param {string} requirements - 需求描述
   * @param {object} options - 生成選項
   * @returns {Promise<string>} - 生成的程式碼
   */
  async generateApplication(requirements, options = {}) {
    const {
      framework = 'vanilla',
      style = 'modern',
      features = []
    } = options;

    const systemPrompt = `You are an expert full-stack developer specializing in creating clean, maintainable web applications.`;
    
    const userPrompt = `Create a complete web application based on these requirements:

Requirements: ${requirements}

Specifications:
- Framework: ${framework}
- Style: ${style}
- Additional features: ${features.join(', ')}
- Include comprehensive error handling
- Add Traditional Chinese (繁體中文) comments
- Ensure responsive design
- Follow accessibility best practices

Output a complete, working application as a single HTML file.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('GPT 生成失敗，嘗試使用 GPT-3.5:', error.message);
      
      // 降級到 GPT-3.5
      try {
        const fallbackResponse = await this.client.chat.completions.create({
          model: this.fallbackModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        });
        
        return fallbackResponse.choices[0].message.content;
      } catch (fallbackError) {
        throw new Error(`應用生成失敗: ${fallbackError.message}`);
      }
    }
  }

  /**
   * 程式碼審查
   * @param {string} code - 要審查的程式碼
   * @returns {Promise<object>} - 審查結果
   */
  async reviewCode(code) {
    const prompt = `As a senior code reviewer, perform a comprehensive review of this code.

Code to review:
\`\`\`
${code.substring(0, 3000)}
\`\`\`

Provide a detailed review including:
1. Code quality score (1-10)
2. Security vulnerabilities
3. Performance bottlenecks
4. Maintainability issues
5. Best practice violations
6. Specific improvement recommendations

Format your response as JSON with Traditional Chinese descriptions.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a meticulous code reviewer with expertise in web development.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('程式碼審查失敗:', error);
      return {
        error: error.message,
        score: 0,
        issues: []
      };
    }
  }

  /**
   * 生成測試計畫
   * @param {string} appDescription - 應用描述或程式碼
   * @returns {Promise<string>} - 測試計畫
   */
  async generateTestPlan(appDescription) {
    const prompt = `As a QA architect, create a comprehensive E2E test plan for this application.

Application:
${appDescription}

Create a detailed test plan including:
1. Test objectives and scope
2. Critical user journeys
3. Test scenarios with priorities (P0, P1, P2)
4. Edge cases and negative tests
5. Performance benchmarks
6. Accessibility requirements
7. Test data requirements
8. Success criteria

Format in Traditional Chinese as a structured document.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an experienced QA architect.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 3000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('測試計畫生成失敗:', error);
      throw error;
    }
  }

  /**
   * 生成 Playwright 測試套件
   * @param {string} testPlan - 測試計畫
   * @param {object} config - 測試配置
   * @returns {Promise<object>} - 測試檔案內容
   */
  async generatePlaywrightSuite(testPlan, config = {}) {
    const {
      baseURL = 'http://localhost:3000',
      browsers = ['chromium', 'firefox', 'webkit'],
      headless = true
    } = config;

    const prompt = `You are a Playwright expert. Generate a complete test suite based on this test plan.

Test Plan:
${testPlan}

Configuration:
- Base URL: ${baseURL}
- Browsers: ${browsers.join(', ')}
- Headless: ${headless}

Generate:
1. Complete test.spec.ts with TypeScript
2. Page Object Models for maintainability
3. Test fixtures and helpers
4. Configuration file (playwright.config.ts)
5. Test data management
6. Comments in Traditional Chinese

Follow Playwright best practices and ensure tests are reliable and maintainable.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a Playwright testing expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = response.choices[0].message.content;
      
      // 解析不同檔案區塊
      const files = {};
      const fileMatches = content.matchAll(/```(?:typescript|ts|javascript|js)\n\/\/ ([\w.-]+)\n([\s\S]*?)```/g);
      
      for (const match of fileMatches) {
        files[match[1]] = match[2];
      }
      
      // 如果沒有分離的檔案，返回整個內容
      if (Object.keys(files).length === 0) {
        files['test.spec.ts'] = content;
      }
      
      return files;
    } catch (error) {
      console.error('Playwright 測試生成失敗:', error);
      throw error;
    }
  }

  /**
   * 分析測試結果
   * @param {string} testResults - 測試結果日誌
   * @param {string} testCode - 測試程式碼
   * @returns {Promise<object>} - 分析結果
   */
  async analyzeTestResults(testResults, testCode) {
    const prompt = `Analyze these test results and provide actionable insights.

Test Results:
\`\`\`
${testResults}
\`\`\`

Test Code (relevant parts):
\`\`\`
${testCode.substring(0, 2000)}
\`\`\`

Provide:
1. Success rate and statistics
2. Failure patterns
3. Root cause analysis for failures
4. Flaky test detection
5. Performance insights
6. Improvement recommendations

Format as JSON with Traditional Chinese explanations.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a test analysis expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('測試結果分析失敗:', error);
      return {
        error: error.message,
        analysis: null
      };
    }
  }

  /**
   * 生成修復建議
   * @param {object} failureAnalysis - 失敗分析
   * @param {string} originalCode - 原始程式碼
   * @returns {Promise<object>} - 修復建議
   */
  async generateFixSuggestions(failureAnalysis, originalCode) {
    const prompt = `Based on this failure analysis, provide specific code fixes.

Failure Analysis:
${JSON.stringify(failureAnalysis, null, 2)}

Original Code:
\`\`\`
${originalCode}
\`\`\`

Generate:
1. Specific code changes needed
2. Step-by-step fix instructions
3. Preventive measures
4. Testing recommendations
5. Code snippets for each fix

Format as actionable items with code examples.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a debugging expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const content = response.choices[0].message.content;
      
      // 解析修復建議
      const fixes = [];
      const fixMatches = content.matchAll(/###\s*(.*?)\n([\s\S]*?)(?=###|$)/g);
      
      for (const match of fixMatches) {
        fixes.push({
          title: match[1].trim(),
          description: match[2].trim()
        });
      }
      
      return {
        fixes: fixes.length > 0 ? fixes : [{ title: '修復建議', description: content }],
        rawContent: content
      };
    } catch (error) {
      console.error('修復建議生成失敗:', error);
      throw error;
    }
  }

  /**
   * 自動修復程式碼
   * @param {string} brokenCode - 有問題的程式碼
   * @param {object} fixes - 修復建議
   * @returns {Promise<string>} - 修復後的程式碼
   */
  async autoRepair(brokenCode, fixes) {
    const prompt = `Apply these fixes to the code automatically.

Current Code:
\`\`\`
${brokenCode}
\`\`\`

Required Fixes:
${JSON.stringify(fixes, null, 2)}

Requirements:
1. Apply all fixes correctly
2. Maintain existing functionality
3. Add error prevention
4. Include fix comments in Traditional Chinese
5. Ensure code still works after fixes

Output the complete, repaired code.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are a code repair specialist.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('自動修復失敗:', error);
      throw error;
    }
  }

  /**
   * 對話式除錯助手
   * @param {string} context - 除錯上下文
   * @param {string} question - 使用者問題
   * @returns {Promise<string>} - 助手回應
   */
  async debugAssistant(context, question) {
    const systemPrompt = `You are a helpful debugging assistant. You help developers identify and fix issues in their code. 
    Provide clear, actionable advice in Traditional Chinese.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('除錯助手錯誤:', error);
      throw error;
    }
  }

  /**
   * 成本估算
   * @param {number} inputTokens - 輸入 token 數
   * @param {number} outputTokens - 輸出 token 數
   * @param {string} model - 使用的模型
   * @returns {object} - 成本資訊
   */
  calculateCost(inputTokens, outputTokens, model = this.defaultModel) {
    const pricing = {
      'gpt-turbo-preview': { input: 0.01, output: 0.03 },
      'gpt': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;
    const totalCost = inputCost + outputCost;

    return {
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: inputCost.toFixed(4),
      outputCost: outputCost.toFixed(4),
      totalCost: totalCost.toFixed(4),
      currency: 'USD'
    };
  }
}

// 匯出模組
module.exports = OpenAIIntegration;

// CLI 使用範例
if (require.main === module) {
  const openai = new OpenAIIntegration(process.env.OPENAI_API_KEY);
  
  (async () => {
    try {
      console.log('測試 OpenAI 整合...');
      
      // 生成應用
      const app = await openai.generateApplication('建立一個計算機應用程式');
      console.log('✓ 應用程式生成成功');
      
      // 儲存結果
      await fs.writeFile(
        path.join(__dirname, 'generated-calculator.html'),
        app
      );
      console.log('✓ 已儲存到 generated-calculator.html');
      
      // 估算成本
      const cost = openai.calculateCost(500, 2000);
      console.log('成本估算:', cost);
      
    } catch (error) {
      console.error('錯誤:', error);
      process.exit(1);
    }
  })();
}