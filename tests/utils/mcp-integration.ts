import { Page, BrowserContext } from '@playwright/test';

/**
 * MCP (Model Context Protocol) 整合
 * 允許 AI 模型控制 Playwright 測試
 */

export interface MCPCommand {
  action: 'click' | 'type' | 'navigate' | 'wait' | 'assert' | 'screenshot' | 'extract';
  target?: string;
  value?: string;
  options?: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  screenshot?: string;
}

/**
 * MCP Playwright 控制器
 */
export class PlaywrightMCP {
  private page: Page;
  private context: BrowserContext;
  private history: MCPCommand[] = [];

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  /**
   * 執行 MCP 指令
   */
  async execute(command: MCPCommand): Promise<MCPResponse> {
    this.history.push(command);
    
    try {
      switch (command.action) {
        case 'click':
          return await this.handleClick(command);
        
        case 'type':
          return await this.handleType(command);
        
        case 'navigate':
          return await this.handleNavigate(command);
        
        case 'wait':
          return await this.handleWait(command);
        
        case 'assert':
          return await this.handleAssert(command);
        
        case 'screenshot':
          return await this.handleScreenshot(command);
        
        case 'extract':
          return await this.handleExtract(command);
        
        default:
          throw new Error(`未知的 MCP 動作: ${command.action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 批次執行指令
   */
  async executeBatch(commands: MCPCommand[]): Promise<MCPResponse[]> {
    const results: MCPResponse[] = [];
    
    for (const command of commands) {
      const result = await this.execute(command);
      results.push(result);
      
      // 如果有錯誤，停止執行
      if (!result.success) {
        break;
      }
    }
    
    return results;
  }

  /**
   * 處理點擊動作
   */
  private async handleClick(command: MCPCommand): Promise<MCPResponse> {
    if (!command.target) {
      throw new Error('點擊動作需要目標選擇器');
    }
    
    await this.page.click(command.target, command.options);
    
    return {
      success: true,
      data: { clicked: command.target }
    };
  }

  /**
   * 處理輸入動作
   */
  private async handleType(command: MCPCommand): Promise<MCPResponse> {
    if (!command.target || !command.value) {
      throw new Error('輸入動作需要目標選擇器和值');
    }
    
    await this.page.fill(command.target, command.value);
    
    return {
      success: true,
      data: { typed: command.value, target: command.target }
    };
  }

  /**
   * 處理導航動作
   */
  private async handleNavigate(command: MCPCommand): Promise<MCPResponse> {
    if (!command.value) {
      throw new Error('導航動作需要 URL');
    }
    
    await this.page.goto(command.value, command.options);
    await this.page.waitForLoadState('networkidle');
    
    return {
      success: true,
      data: { navigatedTo: command.value }
    };
  }

  /**
   * 處理等待動作
   */
  private async handleWait(command: MCPCommand): Promise<MCPResponse> {
    if (command.target) {
      await this.page.waitForSelector(command.target, command.options);
    } else if (command.value) {
      await this.page.waitForTimeout(parseInt(command.value));
    }
    
    return {
      success: true,
      data: { waited: command.target || command.value }
    };
  }

  /**
   * 處理斷言動作
   */
  private async handleAssert(command: MCPCommand): Promise<MCPResponse> {
    if (!command.target) {
      throw new Error('斷言動作需要目標選擇器');
    }
    
    const element = this.page.locator(command.target);
    const exists = await element.count() > 0;
    
    if (command.value) {
      const text = await element.textContent();
      const matches = text?.includes(command.value);
      
      return {
        success: exists && (matches ?? false),
        data: { 
          exists, 
          text,
          expectedText: command.value,
          matches 
        }
      };
    }
    
    return {
      success: exists,
      data: { exists }
    };
  }

  /**
   * 處理截圖動作
   */
  private async handleScreenshot(command: MCPCommand): Promise<MCPResponse> {
    const screenshot = await this.page.screenshot({
      fullPage: command.options?.fullPage ?? true,
      type: 'png'
    });
    
    const base64 = screenshot.toString('base64');
    
    return {
      success: true,
      screenshot: `data:image/png;base64,${base64}`,
      data: { timestamp: Date.now() }
    };
  }

  /**
   * 處理資料擷取動作
   */
  private async handleExtract(command: MCPCommand): Promise<MCPResponse> {
    const data = await this.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText,
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent,
          href: a.href
        })),
        images: Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt
        }))
      };
    });
    
    return {
      success: true,
      data
    };
  }

  /**
   * 取得頁面狀態
   */
  async getPageState() {
    return await this.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        readyState: document.readyState,
        elementCount: document.querySelectorAll('*').length,
        formCount: document.querySelectorAll('form').length,
        inputCount: document.querySelectorAll('input, textarea, select').length,
        buttonCount: document.querySelectorAll('button').length,
        linkCount: document.querySelectorAll('a').length
      };
    });
  }

  /**
   * 取得執行歷史
   */
  getHistory(): MCPCommand[] {
    return this.history;
  }

  /**
   * 清除歷史記錄
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * AI 輔助定位器
   * 根據自然語言描述找到元素
   */
  async aiLocate(description: string): Promise<string | null> {
    // 這裡可以整合 AI 模型來解析描述並返回選擇器
    // 目前使用簡單的映射
    const mappings: Record<string, string> = {
      '新增按鈕': '[data-testid="add-button"]',
      '輸入框': 'input[type="text"]',
      '提交按鈕': 'button[type="submit"]',
      '待辦事項': '[data-testid="todo-item"]',
      '刪除按鈕': '[data-testid="delete-button"]',
      '完成核取方塊': 'input[type="checkbox"]'
    };
    
    return mappings[description] || null;
  }

  /**
   * 智能等待
   * AI 判斷頁面是否準備好
   */
  async smartWait() {
    await this.page.waitForLoadState('networkidle');
    
    // 等待主要內容載入
    await this.page.waitForFunction(() => {
      const mainContent = document.querySelector('main, [role="main"], #app, #root');
      return mainContent && mainContent.children.length > 0;
    });
  }
}

/**
 * AI 測試指令生成器
 */
export class AITestGenerator {
  /**
   * 從自然語言生成測試指令
   */
  static generateCommands(instruction: string): MCPCommand[] {
    const commands: MCPCommand[] = [];
    
    // 簡單的指令解析邏輯
    // 實際應用中會使用 AI 模型
    
    if (instruction.includes('導航到') || instruction.includes('前往')) {
      const urlMatch = instruction.match(/["']([^"']+)["']/);
      if (urlMatch) {
        commands.push({
          action: 'navigate',
          value: urlMatch[1]
        });
      }
    }
    
    if (instruction.includes('點擊')) {
      const targetMatch = instruction.match(/點擊[「"]([^」"]+)[」"]/);
      if (targetMatch) {
        commands.push({
          action: 'click',
          target: targetMatch[1]
        });
      }
    }
    
    if (instruction.includes('輸入') || instruction.includes('填寫')) {
      const inputMatch = instruction.match(/輸入[「"]([^」"]+)[」"]/);
      if (inputMatch) {
        commands.push({
          action: 'type',
          target: 'input',
          value: inputMatch[1]
        });
      }
    }
    
    if (instruction.includes('等待')) {
      const waitMatch = instruction.match(/等待(\d+)/);
      if (waitMatch) {
        commands.push({
          action: 'wait',
          value: waitMatch[1]
        });
      }
    }
    
    if (instruction.includes('截圖')) {
      commands.push({
        action: 'screenshot'
      });
    }
    
    return commands;
  }
  
  /**
   * 生成斷言指令
   */
  static generateAssertion(expectation: string): MCPCommand {
    // 解析期望值並生成斷言
    return {
      action: 'assert',
      target: 'body',
      value: expectation
    };
  }
}