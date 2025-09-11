import { test, expect } from '@playwright/test';
import { WorkshopPage } from '../page-objects/workshop-page';
import { PlaywrightMCP, AITestGenerator } from '../utils/mcp-integration';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 提示詞驗證測試
 * 驗證工作坊中的提示詞是否能正確執行
 */
test.describe('提示詞驗證測試', () => {
  let workshopPage: WorkshopPage;
  let mcpController: PlaywrightMCP;

  test.beforeEach(async ({ page }) => {
    workshopPage = new WorkshopPage(page);
    mcpController = new PlaywrightMCP(page);
    await workshopPage.navigate('/');
  });

  test.describe('章節提示詞驗證', () => {
    test('第一章：AI Conductor 提示詞', async () => {
      await workshopPage.navigateToChapter(1);
      
      const prompts = [
        '建立一個簡單的 TODO 應用程式，包含新增、刪除、標記完成功能',
        '為 TODO 應用程式加入本地存儲功能',
        '實作 TODO 項目的拖放排序'
      ];
      
      for (const prompt of prompts) {
        await workshopPage.executePrompt(prompt);
        const output = await workshopPage.getOutput();
        
        expect(output).toBeTruthy();
        expect(output.length).toBeGreaterThan(100);
        
        // 驗證輸出包含關鍵程式碼元素
        expect(output.toLowerCase()).toMatch(/function|const|class|import/);
      }
    });

    test('第二章：First Movement 提示詞', async () => {
      await workshopPage.navigateToChapter(2);
      
      const prompt = '分析下列程式碼並生成完整的測試策略：\n' +
        'class TodoApp { addTodo(), deleteTodo(), toggleComplete() }';
      
      await workshopPage.executePrompt(prompt);
      const output = await workshopPage.getOutput();
      
      // 驗證測試策略包含必要元素
      expect(output).toContain('測試');
      expect(output).toMatch(/單元測試|整合測試|E2E測試/);
      expect(output).toMatch(/正向測試|負向測試|邊界測試/);
    });

    test('第三章：Second Movement 提示詞', async () => {
      await workshopPage.navigateToChapter(3);
      
      const prompt = '使用 Playwright 為 TODO 應用程式撰寫 E2E 測試';
      
      await workshopPage.executePrompt(prompt);
      const output = await workshopPage.getOutput();
      
      // 驗證 Playwright 測試程式碼
      expect(output).toContain('test(');
      expect(output).toContain('expect(');
      expect(output).toContain('page.');
      expect(output).toMatch(/click|fill|locator/);
    });

    test('第四章：Third Movement 提示詞', async () => {
      await workshopPage.navigateToChapter(4);
      
      const prompt = '使用 MCP 協議控制 Playwright 執行自動化測試';
      
      await workshopPage.executePrompt(prompt);
      const output = await workshopPage.getOutput();
      
      // 驗證 MCP 整合程式碼
      expect(output).toMatch(/MCP|PlaywrightMCP/);
      expect(output).toContain('execute');
      expect(output).toMatch(/command|action/);
    });
  });

  test.describe('AI 生成測試驗證', () => {
    test('從自然語言生成測試指令', async () => {
      const instructions = [
        '導航到 "/todo-app" 並點擊「新增」按鈕',
        '在輸入框輸入「測試項目」然後等待2秒',
        '點擊第一個待辦事項的刪除按鈕'
      ];
      
      for (const instruction of instructions) {
        const commands = AITestGenerator.generateCommands(instruction);
        expect(commands.length).toBeGreaterThan(0);
        
        // 驗證生成的指令結構
        commands.forEach(cmd => {
          expect(cmd).toHaveProperty('action');
          expect(['click', 'type', 'navigate', 'wait']).toContain(cmd.action);
        });
      }
    });

    test('生成斷言指令', async () => {
      const expectations = [
        '頁面應該包含「歡迎」文字',
        '待辦事項數量應該是 3',
        '按鈕應該是可點擊的'
      ];
      
      expectations.forEach(expectation => {
        const assertion = AITestGenerator.generateAssertion(expectation);
        
        expect(assertion.action).toBe('assert');
        expect(assertion.target).toBeTruthy();
      });
    });
  });

  test.describe('MCP 整合執行', () => {
    test('執行單一 MCP 指令', async ({ page }) => {
      await page.goto('/todo-app');
      
      const command = {
        action: 'click' as const,
        target: '[data-testid="add-button"]'
      };
      
      const response = await mcpController.execute(command);
      
      expect(response.success).toBeTruthy();
      expect(response.data).toHaveProperty('clicked');
    });

    test('批次執行 MCP 指令', async ({ page }) => {
      await page.goto('/todo-app');
      
      const commands = [
        { action: 'type' as const, target: 'input', value: '測試項目' },
        { action: 'click' as const, target: 'button[type="submit"]' },
        { action: 'wait' as const, value: '1000' }
      ];
      
      const responses = await mcpController.executeBatch(commands);
      
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.success).toBeTruthy();
      });
    });

    test('MCP 截圖功能', async ({ page }) => {
      await page.goto('/todo-app');
      
      const command = {
        action: 'screenshot' as const,
        options: { fullPage: true }
      };
      
      const response = await mcpController.execute(command);
      
      expect(response.success).toBeTruthy();
      expect(response.screenshot).toBeTruthy();
      expect(response.screenshot).toContain('data:image/png;base64,');
    });

    test('MCP 資料擷取', async ({ page }) => {
      await page.goto('/todo-app');
      
      const command = {
        action: 'extract' as const
      };
      
      const response = await mcpController.execute(command);
      
      expect(response.success).toBeTruthy();
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('url');
      expect(response.data).toHaveProperty('bodyText');
    });
  });

  test.describe('提示詞檔案驗證', () => {
    test('驗證提示詞檔案存在', async () => {
      const promptsDir = path.join(process.cwd(), 'prompts');
      
      // 檢查目錄是否存在
      if (fs.existsSync(promptsDir)) {
        const files = fs.readdirSync(promptsDir);
        
        // 應該包含各章節的提示詞檔案
        const expectedFiles = [
          'chapter1-ai-conductor.md',
          'chapter2-first-movement.md',
          'chapter3-second-movement.md',
          'chapter4-third-movement.md'
        ];
        
        expectedFiles.forEach(file => {
          const exists = files.some(f => f.includes(file.split('-')[0]));
          expect(exists).toBeTruthy();
        });
      }
    });

    test('驗證提示詞格式', async () => {
      const promptsDir = path.join(process.cwd(), 'prompts');
      
      if (fs.existsSync(promptsDir)) {
        const files = fs.readdirSync(promptsDir)
          .filter(f => f.endsWith('.md'));
        
        files.forEach(file => {
          const content = fs.readFileSync(
            path.join(promptsDir, file), 
            'utf-8'
          );
          
          // 驗證包含必要的結構
          expect(content).toMatch(/##?\s+/); // 包含標題
          expect(content.length).toBeGreaterThan(100); // 有實質內容
        });
      }
    });
  });

  test.describe('AI 智能定位', () => {
    test('使用自然語言定位元素', async ({ page }) => {
      await page.goto('/todo-app');
      
      const descriptions = [
        '新增按鈕',
        '輸入框',
        '待辦事項',
        '刪除按鈕'
      ];
      
      for (const description of descriptions) {
        const selector = await mcpController.aiLocate(description);
        
        if (selector) {
          const element = page.locator(selector);
          const count = await element.count();
          expect(count).toBeGreaterThan(0);
        }
      }
    });

    test('智能等待功能', async ({ page }) => {
      await page.goto('/todo-app');
      
      const startTime = Date.now();
      await mcpController.smartWait();
      const endTime = Date.now();
      
      // 智能等待應該在合理時間內完成
      expect(endTime - startTime).toBeLessThan(5000);
      
      // 頁面應該已經準備好
      const state = await mcpController.getPageState();
      expect(state.readyState).toBe('complete');
    });
  });

  test.describe('提示詞執行追蹤', () => {
    test('記錄執行歷史', async ({ page }) => {
      await page.goto('/todo-app');
      
      const commands = [
        { action: 'navigate' as const, value: '/todo-app' },
        { action: 'click' as const, target: 'button' },
        { action: 'type' as const, target: 'input', value: 'test' }
      ];
      
      for (const command of commands) {
        await mcpController.execute(command);
      }
      
      const history = mcpController.getHistory();
      expect(history).toHaveLength(commands.length);
      
      // 驗證歷史記錄順序
      history.forEach((cmd, index) => {
        expect(cmd.action).toBe(commands[index].action);
      });
    });

    test('清除執行歷史', async ({ page }) => {
      await page.goto('/todo-app');
      
      await mcpController.execute({ 
        action: 'click', 
        target: 'button' 
      });
      
      const historyBefore = mcpController.getHistory();
      expect(historyBefore.length).toBeGreaterThan(0);
      
      mcpController.clearHistory();
      
      const historyAfter = mcpController.getHistory();
      expect(historyAfter).toHaveLength(0);
    });
  });

  test.describe('錯誤處理驗證', () => {
    test('處理無效的 MCP 指令', async ({ page }) => {
      await page.goto('/todo-app');
      
      const invalidCommand = {
        action: 'invalid' as any,
        target: 'button'
      };
      
      const response = await mcpController.execute(invalidCommand);
      
      expect(response.success).toBeFalsy();
      expect(response.error).toBeTruthy();
      expect(response.error).toContain('未知');
    });

    test('處理元素不存在的情況', async ({ page }) => {
      await page.goto('/todo-app');
      
      const command = {
        action: 'click' as const,
        target: '[data-testid="non-existent"]'
      };
      
      const response = await mcpController.execute(command);
      
      expect(response.success).toBeFalsy();
      expect(response.error).toBeTruthy();
    });
  });
});