/**
 * Claude API 整合設定
 * 用於 "Play right with AI" 工作坊
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

class ClaudeIntegration {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('需要提供 ANTHROPIC_API_KEY');
    }
    
    this.client = new Anthropic({
      apiKey: apiKey,
    });
    
    this.defaultModel = 'claude-3-sonnet-20240229';
    this.maxTokens = 4096;
  }

  /**
   * 生成應用程式碼
   * @param {string} requirements - 自然語言需求描述
   * @returns {Promise<string>} - 生成的程式碼
   */
  async generateApplication(requirements) {
    const prompt = `You are an expert web developer. Based on the following requirements, generate a complete, working application.

Requirements: ${requirements}

Please provide:
1. Complete HTML structure with semantic elements
2. Modern CSS styling with responsive design
3. Clean JavaScript with proper error handling
4. Comments in Traditional Chinese (繁體中文)

Output the complete code that can be saved as a single HTML file.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Claude API 錯誤:', error);
      throw new Error(`生成應用程式失敗: ${error.message}`);
    }
  }

  /**
   * 分析程式碼品質
   * @param {string} code - 要分析的程式碼
   * @returns {Promise<Object>} - 分析結果
   */
  async analyzeCode(code) {
    const prompt = `As a senior code reviewer, analyze the following code and provide:

1. Code quality score (1-10)
2. Security issues
3. Performance concerns
4. Best practice violations
5. Improvement suggestions

Code to analyze:
\`\`\`
${code}
\`\`\`

Provide response in JSON format with Traditional Chinese explanations.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // 解析 JSON 回應
      const jsonMatch = response.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      return {
        score: 0,
        issues: [],
        suggestions: [],
        rawResponse: response.content[0].text
      };
    } catch (error) {
      console.error('程式碼分析失敗:', error);
      throw error;
    }
  }

  /**
   * 生成測試策略
   * @param {string} code - 應用程式碼
   * @returns {Promise<string>} - 測試策略文件
   */
  async generateTestStrategy(code) {
    const prompt = `As a QA architect, analyze this application and create a comprehensive E2E testing strategy.

Application code:
\`\`\`
${code.substring(0, 3000)}...
\`\`\`

Generate:
1. Critical user journeys to test
2. Test scenarios with priorities
3. Edge cases and error conditions
4. Performance testing requirements
5. Accessibility testing points

Output in Traditional Chinese as a structured test plan.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('測試策略生成失敗:', error);
      throw error;
    }
  }

  /**
   * 生成 Playwright 測試腳本
   * @param {string} testStrategy - 測試策略
   * @param {string} appUrl - 應用程式 URL
   * @returns {Promise<string>} - Playwright 測試程式碼
   */
  async generatePlaywrightTests(testStrategy, appUrl = 'http://localhost:3000') {
    const prompt = `You are a Playwright testing expert. Based on this test strategy, generate complete Playwright test scripts.

Test Strategy:
${testStrategy}

Application URL: ${appUrl}

Generate:
1. Complete test.spec.ts file
2. Page Object Models if needed
3. Test data fixtures
4. Comments in Traditional Chinese
5. Proper assertions and waits

Use modern Playwright best practices and TypeScript.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Playwright 測試生成失敗:', error);
      throw error;
    }
  }

  /**
   * 分析測試失敗
   * @param {string} testOutput - 測試輸出日誌
   * @param {string} code - 應用程式碼
   * @returns {Promise<Object>} - 失敗分析結果
   */
  async analyzeTestFailure(testOutput, code) {
    const prompt = `As a debugging expert, analyze this test failure and identify root causes.

Test Output:
\`\`\`
${testOutput}
\`\`\`

Application Code (relevant parts):
\`\`\`
${code.substring(0, 2000)}
\`\`\`

Provide:
1. Root cause analysis
2. Specific code locations causing issues
3. Fix recommendations with code snippets
4. Prevention strategies

Format as JSON with Traditional Chinese explanations.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const jsonMatch = response.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      return {
        rootCause: '未知',
        fixes: [],
        rawResponse: response.content[0].text
      };
    } catch (error) {
      console.error('測試失敗分析失敗:', error);
      throw error;
    }
  }

  /**
   * 自動修復程式碼
   * @param {string} code - 原始程式碼
   * @param {Object} failureAnalysis - 失敗分析結果
   * @returns {Promise<string>} - 修復後的程式碼
   */
  async autoFixCode(code, failureAnalysis) {
    const prompt = `You are a code repair specialist. Fix the following code based on the failure analysis.

Original Code:
\`\`\`
${code}
\`\`\`

Failure Analysis:
${JSON.stringify(failureAnalysis, null, 2)}

Generate:
1. Complete fixed code
2. Highlight changes with comments
3. Ensure all issues are resolved
4. Maintain original functionality

Output the complete, working code.`;

    try {
      const response = await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: this.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].text;
    } catch (error) {
      console.error('自動修復失敗:', error);
      throw error;
    }
  }

  /**
   * 批次處理多個提示
   * @param {Array} prompts - 提示陣列
   * @returns {Promise<Array>} - 回應陣列
   */
  async batchProcess(prompts) {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const response = await this.client.messages.create({
          model: this.defaultModel,
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        results.push({
          success: true,
          response: response.content[0].text
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
      
      // 避免速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
}

// 匯出模組
module.exports = ClaudeIntegration;

// CLI 使用範例
if (require.main === module) {
  const claude = new ClaudeIntegration(process.env.ANTHROPIC_API_KEY);
  
  // 示範用法
  (async () => {
    try {
      console.log('測試 Claude 整合...');
      
      // 生成簡單應用
      const app = await claude.generateApplication('建立一個待辦事項應用程式');
      console.log('✓ 應用程式生成成功');
      
      // 儲存到檔案
      await fs.writeFile(
        path.join(__dirname, 'generated-app.html'),
        app
      );
      console.log('✓ 已儲存到 generated-app.html');
      
    } catch (error) {
      console.error('錯誤:', error);
      process.exit(1);
    }
  })();
}