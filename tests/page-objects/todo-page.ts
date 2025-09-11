import { Page } from '@playwright/test';
import { BasePage } from '../utils/base-page';

/**
 * TODO 應用程式頁面物件
 */
export class TodoPage extends BasePage {
  // 定位器 - 更新為實際 HTML 結構的選擇器
  readonly todoInput = this.page.locator('#taskTitle');
  readonly addButton = this.page.locator('.add-btn');
  readonly todoList = this.page.locator('#taskList');
  readonly todoItems = this.page.locator('.task-item');
  readonly toggleButtons = this.page.locator('.checkbox');
  readonly deleteButtons = this.page.locator('.delete-btn');
  readonly editButtons = this.page.locator('.edit-btn');
  readonly filterAll = this.page.locator('[data-filter="all"]');
  readonly filterActive = this.page.locator('[data-filter="pending"]');
  readonly filterCompleted = this.page.locator('[data-filter="completed"]');
  readonly clearCompletedButton = this.page.locator('#clearCompletedBtn');
  readonly todoCount = this.page.locator('#totalCount');
  readonly searchInput = this.page.locator('#searchInput');

  /**
   * 新增待辦事項
   * @param {*} text - text 參數
   */
  async addTodo(text: string) {
    await this.todoInput.fill(text);
    await this.addButton.click();
    
    // 等待新項目出現
    await this.page.waitForTimeout(300);
  }

  /**
   * 批次新增待辦事項
   * @param {*} todos - todos 參數
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
      const text = await this.todoItems.nth(i).locator('.task-title').textContent();
      if (text) texts.push(text.trim());
    }
    
    return texts;
  }

  /**
   * 標記待辦事項為完成
   * @param {*} index - index 參數
   */
  async toggleTodo(index: number) {
    await this.toggleButtons.nth(index).click();
  }

  /**
   * 刪除待辦事項
   * @param {*} index - index 參數
   */
  async deleteTodo(index: number) {
    await this.deleteButtons.nth(index).click();
  }

  /**
   * 編輯待辦事項
   * @param {*} index - index 參數
   * @param {*} newText - newText 參數
   */
  async editTodo(index: number, newText: string) {
    await this.editButtons.nth(index).click();
    
    const editInput = this.todoItems.nth(index).locator('input.edit-input');
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  /**
   * 檢查待辦事項是否完成
   * @param {*} index - index 參數
   */
  async isTodoCompleted(index: number): Promise<boolean> {
    const todoItem = this.todoItems.nth(index);
    const className = await todoItem.getAttribute('class');
    return className?.includes('completed') || false;
  }

  /**
   * 套用篩選器
   * @param {*} filter - filter 參數
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
   * @param {*} query - query 參數
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
   * @param {*} fromIndex - fromIndex 參數
   * @param {*} toIndex - toIndex 參數
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
    const toggleAllButton = this.page.locator('#selectAllBtn');
    await toggleAllButton.click();
  }

  /**
   * 檢查是否有錯誤訊息
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorMessage = this.page.locator('.error-message');
    return await errorMessage.isVisible();
  }

  /**
   * 取得錯誤訊息
   */
  async getErrorMessage(): Promise<string> {
    const errorMessage = this.page.locator('.error-message');
    return await errorMessage.textContent() || '';
  }

  /**
   * 匯出待辦事項
   */
  async exportTodos() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click('#exportBtn');
    const download = await downloadPromise;
    return download;
  }

  /**
   * 匯入待辦事項
   * @param {*} filePath - filePath 參數
   */
  async importTodos(filePath: string) {
    const fileInput = this.page.locator('#importFile');
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
    const emptyState = this.page.locator('#emptyState');
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