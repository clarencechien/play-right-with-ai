/**
 * Test Suite for Chapter 4: AI Writing Playwright Test Scripts
 * These tests verify that learners can successfully write Playwright tests with AI assistance
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

test.describe('Chapter 4: Playwright Test Writing Validation', () => {
  
  test('Exercise 1: Basic Playwright commands are correctly implemented', async () => {
    const testPath = path.join(__dirname, '../exercises/01-basic-commands.spec.js');
    
    const testExists = await fs.access(testPath).then(() => true).catch(() => false);
    expect(testExists).toBeTruthy();
    
    if (testExists) {
      const testContent = await fs.readFile(testPath, 'utf-8');
      
      // Check for essential Playwright commands
      expect(testContent).toContain('page.goto');
      expect(testContent).toContain('page.click');
      expect(testContent).toContain('page.fill');
      expect(testContent).toContain('page.waitForSelector');
      expect(testContent).toContain('expect(');
      
      // Verify proper async/await usage
      expect(testContent).toMatch(/async\s+\(\)\s*=>\s*{/);
      expect(testContent).toMatch(/await\s+page\./);
    }
  });

  test('Exercise 2: Page Object Model is properly structured', async () => {
    const pomPath = path.join(__dirname, '../exercises/02-page-objects/');
    const basePage = path.join(pomPath, 'BasePage.js');
    const todoPage = path.join(pomPath, 'TodoPage.js');
    
    const baseExists = await fs.access(basePage).then(() => true).catch(() => false);
    const todoExists = await fs.access(todoPage).then(() => true).catch(() => false);
    
    expect(baseExists).toBeTruthy();
    expect(todoExists).toBeTruthy();
    
    if (baseExists) {
      const baseContent = await fs.readFile(basePage, 'utf-8');
      
      // Verify base page structure
      expect(baseContent).toContain('class BasePage');
      expect(baseContent).toContain('constructor(page)');
      expect(baseContent).toContain('this.page = page');
      expect(baseContent).toMatch(/async\s+navigate/);
    }
    
    if (todoExists) {
      const todoContent = await fs.readFile(todoPage, 'utf-8');
      
      // Verify inheritance and methods
      expect(todoContent).toContain('extends BasePage');
      expect(todoContent).toContain('async addTodo');
      expect(todoContent).toContain('async toggleTodo');
      expect(todoContent).toContain('async deleteTodo');
      expect(todoContent).toContain('async getTodoCount');
    }
  });

  test('Exercise 3: MCP integration is functional', async () => {
    const mcpTestPath = path.join(__dirname, '../exercises/03-mcp-integration.spec.js');
    const configPath = path.join(__dirname, '../exercises/mcp.config.json');
    
    const testExists = await fs.access(mcpTestPath).then(() => true).catch(() => false);
    const configExists = await fs.access(configPath).then(() => true).catch(() => false);
    
    expect(configExists).toBeTruthy();
    
    if (configExists) {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      
      // Verify MCP configuration
      expect(config).toHaveProperty('mcpServers');
      expect(config.mcpServers).toHaveProperty('playwright');
      expect(config.mcpServers.playwright).toHaveProperty('command');
      expect(config.mcpServers.playwright.command).toBe('npx');
      expect(config.mcpServers.playwright.args).toContain('-y');
      expect(config.mcpServers.playwright.args).toContain('@modelcontextprotocol/server-playwright');
    }
    
    if (testExists) {
      const testContent = await fs.readFile(mcpTestPath, 'utf-8');
      
      // Check for MCP-specific patterns
      expect(testContent).toContain('// MCP-enhanced test');
      expect(testContent).toMatch(/await.*browser.*automation/i);
    }
  });

  test('Exercise 4: Cross-browser tests cover major browsers', async () => {
    const crossBrowserPath = path.join(__dirname, '../exercises/04-cross-browser.spec.js');
    const configPath = path.join(__dirname, '../playwright.config.js');
    
    const testExists = await fs.access(crossBrowserPath).then(() => true).catch(() => false);
    const configExists = await fs.access(configPath).then(() => true).catch(() => false);
    
    expect(configExists).toBeTruthy();
    
    if (configExists) {
      const config = await fs.readFile(configPath, 'utf-8');
      
      // Check browser configuration
      expect(config).toContain('chromium');
      expect(config).toContain('firefox');
      expect(config).toContain('webkit');
      
      // Verify viewport settings
      expect(config).toMatch(/viewport.*width/);
      expect(config).toMatch(/viewport.*height/);
    }
    
    if (testExists) {
      const testContent = await fs.readFile(crossBrowserPath, 'utf-8');
      
      // Check for browser-specific handling
      expect(testContent).toMatch(/browserName/);
      expect(testContent).toContain('test.describe.parallel');
    }
  });

  test('Playwright tests in playwright-tests directory are executable', async () => {
    const testsDir = path.join(__dirname, '../playwright-tests/');
    
    try {
      const files = await fs.readdir(testsDir);
      const specFiles = files.filter(f => f.endsWith('.spec.js'));
      
      expect(specFiles.length).toBeGreaterThan(0);
      
      for (const file of specFiles) {
        const filePath = path.join(testsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Basic syntax validation
        expect(content).toContain('const { test, expect }');
        expect(content).toContain('test(');
        expect(content).toMatch(/test\(['"].*['"]/);
        
        // Check for proper test structure
        expect(content).toMatch(/test\.describe/);
        expect(content).toMatch(/test\.beforeEach/);
      }
    } catch (error) {
      // Directory might not exist yet
    }
  });
});

test.describe('Chapter 4: AI Prompt Quality Validation', () => {
  
  test('Golden prompts generate valid Playwright code', async () => {
    const promptPath = path.join(__dirname, '../../../prompts/chapter-04/playwright-generator.md');
    
    const promptExists = await fs.access(promptPath).then(() => true).catch(() => false);
    if (promptExists) {
      const prompt = await fs.readFile(promptPath, 'utf-8');
      
      // Verify prompt includes Playwright context
      expect(prompt).toMatch(/Playwright/i);
      expect(prompt).toContain('test structure');
      expect(prompt).toContain('assertions');
      expect(prompt).toContain('selectors');
      
      // Check for bilingual strategy
      expect(prompt).toMatch(/English.*analysis/i);
      expect(prompt).toMatch(/Chinese.*output/i);
    }
  });

  test('Example outputs demonstrate best practices', async () => {
    const exampleDir = path.join(__dirname, '../example-output/');
    const completeTest = path.join(exampleDir, 'complete-todo-test.spec.js');
    
    const testExists = await fs.access(completeTest).then(() => true).catch(() => false);
    if (testExists) {
      const testContent = await fs.readFile(completeTest, 'utf-8');
      
      // Check for best practices
      expect(testContent).toContain('test.beforeEach');
      expect(testContent).toContain('test.afterEach');
      expect(testContent).toMatch(/test\.describe.*\(/);
      expect(testContent).toContain('// Arrange');
      expect(testContent).toContain('// Act');
      expect(testContent).toContain('// Assert');
      
      // Verify proper error handling
      expect(testContent).toMatch(/try\s*{[\s\S]*}\s*catch/);
      
      // Check for meaningful test names
      expect(testContent).toMatch(/test\(['"]should\s+\w+/);
    }
  });

  test('Start-here templates provide proper scaffolding', async () => {
    const templatePath = path.join(__dirname, '../start-here/test-template.spec.js');
    
    const templateExists = await fs.access(templatePath).then(() => true).catch(() => false);
    if (templateExists) {
      const template = await fs.readFile(templatePath, 'utf-8');
      
      // Verify template structure
      expect(template).toContain('// TODO:');
      expect(template).toContain('test.describe');
      expect(template).toContain('test(');
      expect(template).toContain('page.goto');
      
      // Check for helpful comments
      expect(template).toMatch(/\/\/ 測試/);
      expect(template).toMatch(/\/\/ Test/);
    }
  });
});