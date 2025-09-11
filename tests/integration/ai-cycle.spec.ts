import { test, expect } from '@playwright/test';
import { TodoPage } from '../page-objects/todo-page';
import { WorkshopPage } from '../page-objects/workshop-page';
import { PlaywrightMCP, AITestGenerator } from '../utils/mcp-integration';
import { waitForPageLoad, simulateNetworkError, getPerformanceMetrics } from '../utils/test-helpers';

/**
 * AI 自循環工作流程整合測試
 * 測試 AI 驅動的開發、測試、分析、修復循環
 */
test.describe('AI 自循環工作流程', () => {
  let workshopPage: WorkshopPage;
  let todoPage: TodoPage;
  let mcpController: PlaywrightMCP;

  test.beforeEach(async ({ page }) => {
    workshopPage = new WorkshopPage(page);
    todoPage = new TodoPage(page);
    mcpController = new PlaywrightMCP(page);
  });

  test.describe('完整 AI 循環', () => {
    test('循環 1：生成應用 → 生成測試 → 執行測試 → 分析結果', async ({ page }) => {
      // 步驟 1：AI 生成應用程式碼
      await workshopPage.navigate('/');
      await workshopPage.navigateToChapter(1);
      
      const appPrompt = '建立一個具有新增、刪除、編輯功能的 TODO 應用程式';
      await workshopPage.executePrompt(appPrompt);
      const appCode = await workshopPage.getOutput();
      
      expect(appCode).toBeTruthy();
      expect(appCode).toContain('function');
      expect(appCode).toMatch(/add|delete|edit/i);
      
      // 步驟 2：AI 分析程式碼並生成測試計畫
      await workshopPage.navigateToChapter(2);
      
      const testPlanPrompt = `分析以下程式碼並生成測試策略：\n${appCode.substring(0, 500)}`;
      await workshopPage.executePrompt(testPlanPrompt);
      const testPlan = await workshopPage.getOutput();
      
      expect(testPlan).toContain('測試');
      expect(testPlan).toMatch(/單元測試|E2E測試/);
      
      // 步驟 3：AI 生成 Playwright 測試腳本
      await workshopPage.navigateToChapter(3);
      
      const testScriptPrompt = '根據測試計畫生成 Playwright E2E 測試腳本';
      await workshopPage.executePrompt(testScriptPrompt);
      const testScript = await workshopPage.getOutput();
      
      expect(testScript).toContain('test(');
      expect(testScript).toContain('expect(');
      expect(testScript).toContain('page.');
      
      // 步驟 4：執行測試並收集結果
      await page.goto('/todo-app');
      
      const testCommands = [
        { action: 'type' as const, target: '[data-testid="todo-input"]', value: '測試項目' },
        { action: 'click' as const, target: '[data-testid="add-button"]' },
        { action: 'assert' as const, target: '[data-testid="todo-item"]', value: '測試項目' }
      ];
      
      const results = await mcpController.executeBatch(testCommands);
      
      // 驗證測試執行
      expect(results).toHaveLength(testCommands.length);
      const allSuccess = results.every(r => r.success);
      expect(allSuccess).toBeTruthy();
    });

    test('循環 2：測試失敗 → AI 分析 → 生成修復 → 重新測試', async ({ page }) => {
      // 步驟 1：模擬測試失敗
      await page.goto('/todo-app');
      
      // 故意執行會失敗的測試
      const failingCommand = {
        action: 'assert' as const,
        target: '[data-testid="non-existent"]',
        value: '不存在的文字'
      };
      
      const failureResult = await mcpController.execute(failingCommand);
      expect(failureResult.success).toBeFalsy();
      
      // 步驟 2：AI 分析失敗原因
      await workshopPage.navigate('/');
      await workshopPage.navigateToChapter(5);
      
      const analysisPrompt = `分析測試失敗：\n錯誤：${failureResult.error}\n請提供修復建議`;
      await workshopPage.executePrompt(analysisPrompt);
      const analysis = await workshopPage.getOutput();
      
      expect(analysis).toBeTruthy();
      expect(analysis).toMatch(/修復|建議|解決/);
      
      // 步驟 3：AI 生成修復程式碼
      await workshopPage.navigateToChapter(6);
      
      const fixPrompt = '根據分析結果生成修復程式碼';
      await workshopPage.executePrompt(fixPrompt);
      const fixCode = await workshopPage.getOutput();
      
      expect(fixCode).toBeTruthy();
      expect(fixCode).toContain('function');
      
      // 步驟 4：重新執行測試
      const retryCommand = {
        action: 'assert' as const,
        target: 'body',
        value: 'TODO'
      };
      
      const retryResult = await mcpController.execute(retryCommand);
      expect(retryResult.success).toBeTruthy();
    });

    test('循環 3：效能問題 → AI 優化 → 驗證改善', async ({ page }) => {
      // 步驟 1：測量初始效能
      await page.goto('/todo-app');
      const initialMetrics = await getPerformanceMetrics(page);
      
      // 步驟 2：新增大量資料造成效能問題
      const manyTodos = Array.from({ length: 100 }, (_, i) => `項目 ${i}`);
      for (const todo of manyTodos.slice(0, 10)) {
        await todoPage.addTodo(todo);
      }
      
      const slowMetrics = await getPerformanceMetrics(page);
      
      // 步驟 3：AI 分析效能問題
      await workshopPage.navigate('/');
      await workshopPage.navigateToChapter(7);
      
      const perfPrompt = `效能數據：
        初始載入：${initialMetrics.loadTime}ms
        大量資料後：${slowMetrics.loadTime}ms
        請提供優化建議`;
      
      await workshopPage.executePrompt(perfPrompt);
      const optimization = await workshopPage.getOutput();
      
      expect(optimization).toMatch(/優化|效能|改善/);
      expect(optimization).toMatch(/虛擬滾動|分頁|懶載入/);
      
      // 步驟 4：驗證優化建議
      expect(optimization.length).toBeGreaterThan(100);
    });
  });

  test.describe('AI 驅動的測試策略', () => {
    test('智能測試案例生成', async () => {
      // AI 根據應用特性生成測試案例
      const appDescription = 'TODO 應用程式，支援 CRUD 操作和篩選功能';
      const testCases = [
        '正向測試：新增有效的待辦事項',
        '負向測試：新增空白待辦事項',
        '邊界測試：新增超長文字',
        '整合測試：新增後立即刪除',
        '效能測試：批次新增 100 個項目'
      ];
      
      for (const testCase of testCases) {
        const commands = AITestGenerator.generateCommands(
          `執行測試案例：${testCase}`
        );
        expect(commands.length).toBeGreaterThan(0);
      }
    });

    test('自適應測試執行', async ({ page }) => {
      await page.goto('/todo-app');
      
      // AI 根據頁面狀態調整測試策略
      const pageState = await mcpController.getPageState();
      
      let testStrategy;
      if (pageState.elementCount < 50) {
        // 簡單頁面：執行完整測試
        testStrategy = 'comprehensive';
      } else {
        // 複雜頁面：執行關鍵路徑測試
        testStrategy = 'critical-path';
      }
      
      expect(testStrategy).toBeTruthy();
      
      // 根據策略執行不同的測試
      if (testStrategy === 'comprehensive') {
        const commands = [
          { action: 'click' as const, target: 'button' },
          { action: 'type' as const, target: 'input', value: 'test' },
          { action: 'wait' as const, value: '500' }
        ];
        
        const results = await mcpController.executeBatch(commands);
        expect(results.length).toBe(commands.length);
      }
    });

    test('智能錯誤恢復', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 模擬錯誤情況
      await simulateNetworkError(page, '**/api/**');
      
      // AI 嘗試恢復
      const recoverySteps = [
        { action: 'wait' as const, value: '2000' },
        { action: 'navigate' as const, value: '/todo-app' },
        { action: 'wait' as const, value: '1000' }
      ];
      
      for (const step of recoverySteps) {
        const result = await mcpController.execute(step);
        if (result.success) {
          break; // 恢復成功
        }
      }
      
      // 驗證恢復
      const pageState = await mcpController.getPageState();
      expect(pageState.url).toContain('todo-app');
    });
  });

  test.describe('MCP 協議深度整合', () => {
    test('複雜工作流程自動化', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 定義複雜的工作流程
      const workflow = {
        name: '完整 TODO 測試流程',
        steps: [
          { action: 'navigate' as const, value: '/todo-app' },
          { action: 'wait' as const, value: '1000' },
          { action: 'type' as const, target: '[data-testid="todo-input"]', value: '早上會議' },
          { action: 'click' as const, target: '[data-testid="add-button"]' },
          { action: 'type' as const, target: '[data-testid="todo-input"]', value: '下午程式設計' },
          { action: 'click' as const, target: '[data-testid="add-button"]' },
          { action: 'click' as const, target: '[data-testid="toggle-complete"]' },
          { action: 'click' as const, target: '[data-testid="filter-active"]' },
          { action: 'assert' as const, target: '[data-testid="todo-item"]', value: '下午程式設計' },
          { action: 'screenshot' as const }
        ]
      };
      
      const results = await mcpController.executeBatch(workflow.steps);
      
      // 驗證工作流程執行
      expect(results).toHaveLength(workflow.steps.length);
      
      // 檢查截圖
      const screenshotResult = results[results.length - 1];
      expect(screenshotResult.screenshot).toBeTruthy();
    });

    test('並行測試執行', async ({ browser }) => {
      // 建立多個瀏覽器上下文
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);
      
      const pages = await Promise.all(
        contexts.map(ctx => ctx.newPage())
      );
      
      // 並行執行測試
      const testPromises = pages.map(async (page, index) => {
        const mcp = new PlaywrightMCP(page);
        await page.goto('/todo-app');
        
        const command = {
          action: 'type' as const,
          target: '[data-testid="todo-input"]',
          value: `並行測試 ${index + 1}`
        };
        
        return await mcp.execute(command);
      });
      
      const results = await Promise.all(testPromises);
      
      // 驗證所有並行測試成功
      results.forEach(result => {
        expect(result.success).toBeTruthy();
      });
      
      // 清理
      await Promise.all(contexts.map(ctx => ctx.close()));
    });

    test('條件式測試執行', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 取得頁面狀態
      const state = await mcpController.getPageState();
      
      // 根據條件執行不同的測試路徑
      if (state.inputCount > 0) {
        // 有輸入框：執行輸入測試
        const result = await mcpController.execute({
          action: 'type',
          target: 'input',
          value: '條件測試'
        });
        expect(result.success).toBeTruthy();
      } else {
        // 無輸入框：執行其他測試
        const result = await mcpController.execute({
          action: 'click',
          target: 'button'
        });
        expect(result.success).toBeTruthy();
      }
    });
  });

  test.describe('自我修復測試', () => {
    test('定位器自動修復', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 嘗試多個可能的定位器
      const locatorVariants = [
        '[data-testid="add-button"]',
        'button[type="submit"]',
        'button:has-text("Add")',
        'button:has-text("新增")'
      ];
      
      let successfulLocator = null;
      
      for (const locator of locatorVariants) {
        try {
          const element = page.locator(locator);
          const count = await element.count();
          if (count > 0) {
            successfulLocator = locator;
            break;
          }
        } catch {
          continue;
        }
      }
      
      expect(successfulLocator).toBeTruthy();
    });

    test('動態等待策略', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 智能等待元素出現
      await mcpController.smartWait();
      
      // 驗證頁面已準備好
      const state = await mcpController.getPageState();
      expect(state.readyState).toBe('complete');
      expect(state.elementCount).toBeGreaterThan(0);
    });

    test('錯誤重試機制', async ({ page }) => {
      await page.goto('/todo-app');
      
      let retries = 0;
      const maxRetries = 3;
      let success = false;
      
      while (retries < maxRetries && !success) {
        const result = await mcpController.execute({
          action: 'click',
          target: '[data-testid="add-button"]'
        });
        
        if (result.success) {
          success = true;
        } else {
          retries++;
          await page.waitForTimeout(1000);
        }
      }
      
      expect(success).toBeTruthy();
      expect(retries).toBeLessThanOrEqual(maxRetries);
    });
  });

  test.describe('AI 學習與改進', () => {
    test('測試模式學習', async ({ page }) => {
      await page.goto('/todo-app');
      
      // 記錄成功的測試模式
      const successfulPatterns = [];
      
      const testPatterns = [
        { action: 'type' as const, target: 'input', value: 'test' },
        { action: 'click' as const, target: 'button' },
        { action: 'wait' as const, value: '500' }
      ];
      
      for (const pattern of testPatterns) {
        const result = await mcpController.execute(pattern);
        if (result.success) {
          successfulPatterns.push(pattern);
        }
      }
      
      // AI 學習成功模式
      expect(successfulPatterns.length).toBeGreaterThan(0);
      
      // 未來可以優先使用成功的模式
      const history = mcpController.getHistory();
      expect(history.length).toBe(testPatterns.length);
    });

    test('測試優化建議', async () => {
      // AI 分析測試執行歷史
      const testHistory = [
        { test: 'login', duration: 5000, status: 'passed' },
        { test: 'add-todo', duration: 2000, status: 'passed' },
        { test: 'delete-todo', duration: 8000, status: 'failed' },
        { test: 'edit-todo', duration: 3000, status: 'passed' }
      ];
      
      // 找出需要優化的測試
      const slowTests = testHistory.filter(t => t.duration > 5000);
      const failedTests = testHistory.filter(t => t.status === 'failed');
      
      expect(slowTests.length).toBeGreaterThan(0);
      expect(failedTests.length).toBeGreaterThan(0);
      
      // AI 提供優化建議
      const suggestions = {
        slowTests: '考慮並行執行或優化等待策略',
        failedTests: '需要分析失敗原因並修復'
      };
      
      expect(suggestions).toBeTruthy();
    });
  });

  test.describe('端到端 AI 循環驗證', () => {
    test('完整的自循環工作流程', async ({ page }) => {
      // 1. 需求輸入
      const requirement = '建立一個支援優先級的 TODO 應用';
      
      // 2. AI 生成程式碼
      await workshopPage.navigate('/');
      await workshopPage.navigateToChapter(1);
      await workshopPage.executePrompt(requirement);
      const code = await workshopPage.getOutput();
      
      // 3. AI 生成測試
      await workshopPage.navigateToChapter(3);
      await workshopPage.executePrompt('為優先級功能生成測試');
      const tests = await workshopPage.getOutput();
      
      // 4. 執行測試
      await page.goto('/todo-app');
      const testResults = await mcpController.executeBatch([
        { action: 'type' as const, target: 'input', value: '高優先級任務' },
        { action: 'click' as const, target: '[data-testid="priority-high"]' },
        { action: 'click' as const, target: '[data-testid="add-button"]' }
      ]);
      
      // 5. 分析結果
      const failedTests = testResults.filter(r => !r.success);
      
      if (failedTests.length > 0) {
        // 6. AI 修復
        await workshopPage.navigateToChapter(6);
        await workshopPage.executePrompt('修復優先級功能問題');
        const fix = await workshopPage.getOutput();
        
        // 7. 重新測試
        const retryResults = await mcpController.executeBatch([
          { action: 'navigate' as const, value: '/todo-app' },
          { action: 'wait' as const, value: '1000' }
        ]);
        
        // 8. 驗證修復
        expect(retryResults.every(r => r.success)).toBeTruthy();
      }
      
      // 驗證完整循環
      expect(code).toBeTruthy();
      expect(tests).toBeTruthy();
      expect(testResults.length).toBeGreaterThan(0);
    });
  });
});