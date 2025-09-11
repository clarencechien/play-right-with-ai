import { test, expect } from '@playwright/test';
import { TodoPage } from '../page-objects/todo-page';
import { waitForPageLoad, typeWithDelay, simulateNetworkError } from '../utils/test-helpers';

/**
 * TODO 應用程式 E2E 測試
 * 測試 TODO 應用的完整功能
 */
test.describe('TODO 應用程式測試', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.navigate('/todo-app');
    await waitForPageLoad(page);
  });

  test.afterEach(async ({ page }) => {
    // 清理測試資料
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('基本 CRUD 操作', () => {
    test('新增單一待辦事項', async () => {
      const todoText = '學習 Playwright';
      await todoPage.addTodo(todoText);
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(1);
      
      const texts = await todoPage.getAllTodoTexts();
      expect(texts).toContain(todoText);
    });

    test('新增多個待辦事項', async () => {
      const todos = [
        '寫測試案例',
        '執行測試',
        '修復錯誤',
        '部署應用'
      ];
      
      await todoPage.addMultipleTodos(todos);
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(todos.length);
      
      const texts = await todoPage.getAllTodoTexts();
      todos.forEach(todo => {
        expect(texts).toContain(todo);
      });
    });

    test('編輯待辦事項', async () => {
      await todoPage.addTodo('原始文字');
      await todoPage.editTodo(0, '更新後的文字');
      
      const texts = await todoPage.getAllTodoTexts();
      expect(texts).toContain('更新後的文字');
      expect(texts).not.toContain('原始文字');
    });

    test('刪除待辦事項', async () => {
      await todoPage.addMultipleTodos(['項目1', '項目2', '項目3']);
      
      await todoPage.deleteTodo(1); // 刪除第二個項目
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(2);
      
      const texts = await todoPage.getAllTodoTexts();
      expect(texts).not.toContain('項目2');
    });

    test('不允許新增空白待辦事項', async () => {
      await todoPage.addTodo('');
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(0);
      
      const hasError = await todoPage.hasErrorMessage();
      expect(hasError).toBeTruthy();
    });
  });

  test.describe('完成狀態管理', () => {
    test('標記待辦事項為完成', async () => {
      await todoPage.addTodo('待完成項目');
      
      await todoPage.toggleTodo(0);
      
      const isCompleted = await todoPage.isTodoCompleted(0);
      expect(isCompleted).toBeTruthy();
    });

    test('取消完成狀態', async () => {
      await todoPage.addTodo('測試項目');
      
      await todoPage.toggleTodo(0);
      const firstToggle = await todoPage.isTodoCompleted(0);
      expect(firstToggle).toBeTruthy();
      
      await todoPage.toggleTodo(0);
      const secondToggle = await todoPage.isTodoCompleted(0);
      expect(secondToggle).toBeFalsy();
    });

    test('全選/取消全選功能', async () => {
      await todoPage.addMultipleTodos(['項目1', '項目2', '項目3']);
      
      await todoPage.toggleAllTodos();
      
      for (let i = 0; i < 3; i++) {
        const isCompleted = await todoPage.isTodoCompleted(i);
        expect(isCompleted).toBeTruthy();
      }
      
      await todoPage.toggleAllTodos();
      
      for (let i = 0; i < 3; i++) {
        const isCompleted = await todoPage.isTodoCompleted(i);
        expect(isCompleted).toBeFalsy();
      }
    });

    test('清除所有已完成項目', async () => {
      await todoPage.addMultipleTodos(['項目1', '項目2', '項目3']);
      
      // 標記前兩個為完成
      await todoPage.toggleTodo(0);
      await todoPage.toggleTodo(1);
      
      await todoPage.clearCompleted();
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(1);
      
      const texts = await todoPage.getAllTodoTexts();
      expect(texts).toContain('項目3');
    });
  });

  test.describe('篩選功能', () => {
    test.beforeEach(async () => {
      await todoPage.addMultipleTodos(['未完成1', '未完成2', '已完成']);
      await todoPage.toggleTodo(2); // 標記第三個為完成
    });

    test('顯示所有項目', async () => {
      await todoPage.applyFilter('all');
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(3);
    });

    test('只顯示未完成項目', async () => {
      await todoPage.applyFilter('active');
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(2);
    });

    test('只顯示已完成項目', async () => {
      await todoPage.applyFilter('completed');
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(1);
    });
  });

  test.describe('搜尋功能', () => {
    test.beforeEach(async () => {
      await todoPage.addMultipleTodos([
        '買牛奶',
        '買麵包',
        '寫報告',
        '開會'
      ]);
    });

    test('搜尋包含特定文字的項目', async () => {
      await todoPage.searchTodos('買');
      
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(2);
    });

    test('搜尋不存在的文字', async () => {
      await todoPage.searchTodos('不存在');
      
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(0);
      
      const isEmpty = await todoPage.isEmptyStateVisible();
      expect(isEmpty).toBeTruthy();
    });

    test('清空搜尋顯示所有項目', async () => {
      await todoPage.searchTodos('買');
      await todoPage.searchTodos('');
      
      const count = await todoPage.getVisibleTodoCount();
      expect(count).toBe(4);
    });
  });

  test.describe('拖放排序', () => {
    test('可以拖放重新排序項目', async () => {
      await todoPage.addMultipleTodos(['第一', '第二', '第三']);
      
      const beforeTexts = await todoPage.getAllTodoTexts();
      expect(beforeTexts[0]).toBe('第一');
      
      await todoPage.dragAndDropTodo(0, 2);
      
      const afterTexts = await todoPage.getAllTodoTexts();
      expect(afterTexts[0]).toBe('第二');
      expect(afterTexts[2]).toBe('第一');
    });
  });

  test.describe('資料持久化', () => {
    test('重新載入後保留待辦事項', async ({ page }) => {
      await todoPage.addMultipleTodos(['項目1', '項目2']);
      await todoPage.toggleTodo(0);
      
      await page.reload();
      await waitForPageLoad(page);
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(2);
      
      const isCompleted = await todoPage.isTodoCompleted(0);
      expect(isCompleted).toBeTruthy();
    });

    test('匯出和匯入功能', async ({ page }) => {
      await todoPage.addMultipleTodos(['匯出項目1', '匯出項目2']);
      
      const download = await todoPage.exportTodos();
      expect(download).toBeTruthy();
      
      // 清空並重新匯入
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      
      // 模擬匯入
      // await todoPage.importTodos(download.path());
      
      // 驗證匯入的資料
      // const count = await todoPage.getTodoCount();
      // expect(count).toBe(2);
    });
  });

  test.describe('復原/重做功能', () => {
    test('可以復原最後的動作', async () => {
      await todoPage.addTodo('測試復原');
      const countBefore = await todoPage.getTodoCount();
      expect(countBefore).toBe(1);
      
      await todoPage.undo();
      
      const countAfter = await todoPage.getTodoCount();
      expect(countAfter).toBe(0);
    });

    test('可以重做復原的動作', async () => {
      await todoPage.addTodo('測試重做');
      await todoPage.undo();
      await todoPage.redo();
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(1);
    });
  });

  test.describe('統計資訊', () => {
    test('顯示正確的統計數據', async () => {
      await todoPage.addMultipleTodos(['未完成1', '未完成2', '已完成1', '已完成2']);
      await todoPage.toggleTodo(2);
      await todoPage.toggleTodo(3);
      
      const stats = await todoPage.getStats();
      
      expect(stats.total).toBe(4);
      expect(stats.active).toBe(2);
      expect(stats.completed).toBe(2);
    });

    test('動態更新統計資訊', async () => {
      await todoPage.addTodo('新項目');
      
      const statsBefore = await todoPage.getStats();
      expect(statsBefore.total).toBe(1);
      expect(statsBefore.active).toBe(1);
      
      await todoPage.toggleTodo(0);
      
      const statsAfter = await todoPage.getStats();
      expect(statsAfter.active).toBe(0);
      expect(statsAfter.completed).toBe(1);
    });
  });

  test.describe('錯誤處理', () => {
    test('網路錯誤時顯示錯誤訊息', async ({ page }) => {
      await simulateNetworkError(page, '**/api/todos');
      
      await todoPage.addTodo('測試項目');
      
      const hasError = await todoPage.hasErrorMessage();
      expect(hasError).toBeTruthy();
      
      const errorMessage = await todoPage.getErrorMessage();
      expect(errorMessage).toContain('錯誤');
    });

    test('重複項目警告', async () => {
      await todoPage.addTodo('重複項目');
      await todoPage.addTodo('重複項目');
      
      const hasError = await todoPage.hasErrorMessage();
      expect(hasError).toBeTruthy();
      
      const errorMessage = await todoPage.getErrorMessage();
      expect(errorMessage).toContain('已存在');
    });
  });

  test.describe('鍵盤快捷鍵', () => {
    test('Enter 鍵新增待辦事項', async ({ page }) => {
      await todoPage.todoInput.fill('使用 Enter 鍵');
      await page.keyboard.press('Enter');
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(1);
    });

    test('Escape 鍵取消編輯', async ({ page }) => {
      await todoPage.addTodo('原始文字');
      await todoPage.editButtons.first().click();
      
      const editInput = page.locator('[data-testid="edit-input"]');
      await editInput.fill('新文字');
      await page.keyboard.press('Escape');
      
      const texts = await todoPage.getAllTodoTexts();
      expect(texts).toContain('原始文字');
    });
  });

  test.describe('效能測試', () => {
    test('大量資料處理', async () => {
      const todos = Array.from({ length: 100 }, (_, i) => `項目 ${i + 1}`);
      
      const startTime = Date.now();
      await todoPage.addMultipleTodos(todos);
      const endTime = Date.now();
      
      const timeTaken = endTime - startTime;
      expect(timeTaken).toBeLessThan(10000); // 應該在 10 秒內完成
      
      const count = await todoPage.getTodoCount();
      expect(count).toBe(100);
    });

    test('搜尋效能', async () => {
      const todos = Array.from({ length: 50 }, (_, i) => `測試項目 ${i + 1}`);
      await todoPage.addMultipleTodos(todos);
      
      const startTime = Date.now();
      await todoPage.searchTodos('測試');
      const endTime = Date.now();
      
      const searchTime = endTime - startTime;
      expect(searchTime).toBeLessThan(500); // 搜尋應該在 500ms 內完成
    });
  });
});