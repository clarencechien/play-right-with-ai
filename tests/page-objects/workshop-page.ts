import { Page } from '@playwright/test';
import { BasePage } from '../utils/base-page';

/**
 * 工作坊頁面物件
 */
export class WorkshopPage extends BasePage {
  // 定位器
  readonly navigationMenu = this.page.locator('[data-testid="nav-menu"]');
  readonly chapterList = this.page.locator('[data-testid="chapter-list"]');
  readonly chapterItems = this.page.locator('[data-testid="chapter-item"]');
  readonly progressBar = this.page.locator('[data-testid="progress-bar"]');
  readonly currentChapter = this.page.locator('[data-testid="current-chapter"]');
  readonly exerciseContainer = this.page.locator('[data-testid="exercise-container"]');
  readonly promptInput = this.page.locator('[data-testid="prompt-input"]');
  readonly executeButton = this.page.locator('[data-testid="execute-prompt"]');
  readonly outputDisplay = this.page.locator('[data-testid="output-display"]');
  readonly nextChapterButton = this.page.locator('[data-testid="next-chapter"]');
  readonly previousChapterButton = this.page.locator('[data-testid="previous-chapter"]');
  readonly completeButton = this.page.locator('[data-testid="complete-exercise"]');

  /**
   * 導航到特定章節
   */
  async navigateToChapter(chapterNumber: number) {
    await this.chapterItems.nth(chapterNumber - 1).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 取得當前章節標題
   */
  async getCurrentChapterTitle(): Promise<string> {
    return await this.currentChapter.textContent() || '';
  }

  /**
   * 取得進度百分比
   */
  async getProgressPercentage(): Promise<number> {
    const progressText = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(progressText || '0');
  }

  /**
   * 執行提示詞
   */
  async executePrompt(prompt: string) {
    await this.promptInput.fill(prompt);
    await this.executeButton.click();
    
    // 等待輸出出現
    await this.outputDisplay.waitFor({ state: 'visible' });
  }

  /**
   * 取得輸出內容
   */
  async getOutput(): Promise<string> {
    return await this.outputDisplay.textContent() || '';
  }

  /**
   * 完成當前練習
   */
  async completeExercise() {
    await this.completeButton.click();
    
    // 等待下一章節解鎖動畫
    await this.page.waitForTimeout(1000);
  }

  /**
   * 檢查章節是否已解鎖
   */
  async isChapterUnlocked(chapterNumber: number): Promise<boolean> {
    const chapter = this.chapterItems.nth(chapterNumber - 1);
    const isLocked = await chapter.getAttribute('data-locked');
    return isLocked !== 'true';
  }

  /**
   * 取得所有章節狀態
   */
  async getAllChapterStatuses(): Promise<Array<{title: string, status: string}>> {
    const count = await this.chapterItems.count();
    const statuses = [];
    
    for (let i = 0; i < count; i++) {
      const item = this.chapterItems.nth(i);
      const title = await item.locator('.chapter-title').textContent() || '';
      const status = await item.getAttribute('data-status') || 'locked';
      statuses.push({ title, status });
    }
    
    return statuses;
  }

  /**
   * 導航到下一章
   */
  async goToNextChapter() {
    await this.nextChapterButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 導航到上一章
   */
  async goToPreviousChapter() {
    await this.previousChapterButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 檢查是否有練習可用
   */
  async hasExercise(): Promise<boolean> {
    return await this.exerciseContainer.isVisible();
  }

  /**
   * 取得練習說明
   */
  async getExerciseInstructions(): Promise<string> {
    const instructions = this.page.locator('[data-testid="exercise-instructions"]');
    return await instructions.textContent() || '';
  }

  /**
   * 上傳檔案到練習
   */
  async uploadFile(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  /**
   * 執行程式碼編輯器中的程式碼
   */
  async runCode() {
    const runButton = this.page.locator('[data-testid="run-code"]');
    await runButton.click();
    
    // 等待執行結果
    await this.page.waitForSelector('[data-testid="code-output"]');
  }

  /**
   * 取得程式碼執行結果
   */
  async getCodeOutput(): Promise<string> {
    const output = this.page.locator('[data-testid="code-output"]');
    return await output.textContent() || '';
  }

  /**
   * 重置練習
   */
  async resetExercise() {
    const resetButton = this.page.locator('[data-testid="reset-exercise"]');
    await resetButton.click();
    
    // 確認重置
    const confirmButton = this.page.locator('[data-testid="confirm-reset"]');
    await confirmButton.click();
  }

  /**
   * 取得提示
   */
  async getHint(): Promise<string> {
    const hintButton = this.page.locator('[data-testid="show-hint"]');
    await hintButton.click();
    
    const hintContent = this.page.locator('[data-testid="hint-content"]');
    return await hintContent.textContent() || '';
  }

  /**
   * 檢查是否完成所有章節
   */
  async isWorkshopComplete(): Promise<boolean> {
    const completionBadge = this.page.locator('[data-testid="completion-badge"]');
    return await completionBadge.isVisible();
  }

  /**
   * 下載完成證書
   */
  async downloadCertificate() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click('[data-testid="download-certificate"]');
    const download = await downloadPromise;
    return download;
  }
}