import { Page } from '@playwright/test';
import { BasePage } from '../utils/base-page';

/**
 * TODO 應用程式頁面物件
 */
export class TodoPage extends BasePage {
  // 定位器
  readonly todoInput = this.page.locator('[data-testid="todo-input"]');
  readonly addButton = this.page.locator('[data-testid="add-button"]');
  readonly todoList = this.page.locator('[data-testid="todo-list"]');
  readonly todoItems = this.page.locator('[data-testid="todo-item"]');
  readonly toggleButtons = this.page.locator('[data-testid="toggle-complete"]');
  readonly deleteButtons = this.page.locator('[data-testid="delete-button"]');
  readonly editButtons = this.page.locator('[data-testid="edit-button"]');
  readonly filterAll = this.page.locator('[data-testid="filter-all"]');
  readonly filterActive = this.page.locator('[data-testid="filter-active"]');
  readonly filterCompleted = this.page.locator('[data-testid="filter-completed"]');
  readonly clearCompletedButton = this.page.locator('[data-testid="clear-completed"]');
  readonly todoCount = this.page.locator('[data-testid="todo-count"]');
  readonly searchInput = this.page.locator('[data-testid="search-input"]');

  /**
   * 新增待辦事項
   */
  async addTodo(text: string) {
    await this.todoInput.fill(text);
    await this.addButton.click();
    
    // 等待新項目出現
    await this.page.waitForTimeout(300);
  }

  /**
   * 批次新增待辦事項
   */
  async addMultipleTodos(todos: string[]) {
    for (const todo of todos) {
      await this.addTodo(todo);
    }
  }

  /**
   * 取得待辦事項數量
   */
  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  /**
   * 取得所有待辦事項文字
   */
  async getAllTodoTexts(): Promise<string[]> {
    const count = await this.todoItems.count();
    const texts: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await this.todoItems.nth(i).locator('.todo-text').textContent();
      if (text) texts.push(text);
    }
    
    return texts;
  }

  /**
   * 標記待辦事項為完成
   */
  async toggleTodo(index: number) {
    await this.toggleButtons.nth(index).click();
  }

  /**
   * 刪除待辦事項
   */
  async deleteTodo(index: number) {
    await this.deleteButtons.nth(index).click();
  }

  /**
   * 編輯待辦事項
   */
  async editTodo(index: number, newText: string) {
    await this.editButtons.nth(index).click();
    
    const editInput = this.todoItems.nth(index).locator('[data-testid="edit-input"]');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  /**
   * 檢查待辦事項是否完成
   */
  async isTodoCompleted(index: number): Promise<boolean> {
    const todoItem = this.todoItems.nth(index);
    const className = await todoItem.getAttribute('class');
    return className?.includes('completed') || false;
  }

  /**
   * 套用篩選器
   */
  async applyFilter(filter: 'all' | 'active' | 'completed') {
    switch (filter) {
      case 'all':
        await this.filterAll.click();
        break;
      case 'active':
        await this.filterActive.click();
        break;
      case 'completed':
        await this.filterCompleted.click();
        break;
    }
    
    await this.page.waitForTimeout(300);
  }

  /**
   * 清除所有已完成項目
   */
  async clearCompleted() {
    await this.clearCompletedButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * 取得未完成項目數量
   */
  async getActiveCount(): Promise<number> {
    const countText = await this.todoCount.textContent();
    const match = countText?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * 搜尋待辦事項
   */
  async searchTodos(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300);
  }

  /**
   * 取得可見的待辦事項數量
   */
  async getVisibleTodoCount(): Promise<number> {
    const visibleItems = this.todoItems.filter({ hasNot: this.page.locator('.hidden') });
    return await visibleItems.count();
  }

  /**
   * 拖放排序待辦事項
   */
  async dragAndDropTodo(fromIndex: number, toIndex: number) {
    const fromItem = this.todoItems.nth(fromIndex);
    const toItem = this.todoItems.nth(toIndex);
    
    await fromItem.dragTo(toItem);
    await this.page.waitForTimeout(300);
  }

  /**
   * 全選/取消全選
   */
  async toggleAllTodos() {
    const toggleAllButton = this.page.locator('[data-testid="toggle-all"]');
    await toggleAllButton.click();
  }

  /**
   * 檢查是否有錯誤訊息
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    return await errorMessage.isVisible();
  }

  /**
   * 取得錯誤訊息
   */
  async getErrorMessage(): Promise<string> {
    const errorMessage = this.page.locator('[data-testid="error-message"]');
    return await errorMessage.textContent() || '';
  }

  /**
   * 匯出待辦事項
   */
  async exportTodos() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click('[data-testid="export-todos"]');
    const download = await downloadPromise;
    return download;
  }

  /**
   * 匯入待辦事項
   */
  async importTodos(filePath: string) {
    const fileInput = this.page.locator('[data-testid="import-input"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * 復原最後動作
   */
  async undo() {
    await this.page.keyboard.press('Control+Z');
    await this.page.waitForTimeout(300);
  }

  /**
   * 重做最後動作
   */
  async redo() {
    await this.page.keyboard.press('Control+Y');
    await this.page.waitForTimeout(300);
  }

  /**
   * 檢查是否顯示空狀態
   */
  async isEmptyStateVisible(): Promise<boolean> {
    const emptyState = this.page.locator('[data-testid="empty-state"]');
    return await emptyState.isVisible();
  }

  /**
   * 取得統計資訊
   */
  async getStats(): Promise<{total: number, active: number, completed: number}> {
    const total = await this.getTodoCount();
    const active = await this.getActiveCount();
    const completed = total - active;
    
    return { total, active, completed };
  }
}