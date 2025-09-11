/**
 * Playwright MCP (Model Context Protocol) 伺服器
 * 用於 AI 與瀏覽器自動化的橋接
 */

const { chromium, firefox, webkit } = require('playwright');
const express = require('express');
const cors = require('cors');

/**
 * Playwright MCP 伺服器類別
 * 提供 AI 與瀏覽器自動化之間的橋接功能
 */
class PlaywrightMCPServer {
  /**
   * 初始化 MCP 伺服器
   * @param {number} port - 伺服器監聽埠號
   */
  constructor(port = 3001) {
    this.port = port;
    this.app = express();
    this.browsers = {};
    this.contexts = {};
    this.pages = {};
    this.sessions = new Map();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 設定 Express 中介軟體
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    
    // 請求日誌
    this.app.use((req, res, next) => {
      console.log(`[MCP] ${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * 設定 API 路由
   */
  setupRoutes() {
    // 健康檢查
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        sessions: this.sessions.size,
        uptime: process.uptime()
      });
    });

    // 建立新會話
    this.app.post('/session/create', async (req, res) => {
      try {
        const { browserType = 'chromium', headless = false, options = {} } = req.body;
        const sessionId = this.generateSessionId();
        
        // 啟動瀏覽器
        const browserOptions = {
          headless,
          ...options
        };
        
        let browser;
        switch (browserType) {
          case 'firefox':
            browser = await firefox.launch(browserOptions);
            break;
          case 'webkit':
            browser = await webkit.launch(browserOptions);
            break;
          default:
            browser = await chromium.launch(browserOptions);
        }
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // 儲存會話
        this.sessions.set(sessionId, {
          browser,
          context,
          page,
          browserType,
          createdAt: new Date(),
          actions: []
        });
        
        res.json({ 
          success: true,
          sessionId,
          message: `瀏覽器會話已建立 (${browserType})`
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 執行 AI 指令
    this.app.post('/session/:sessionId/execute', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { command, parameters = {} } = req.body;
        
        const session = this.sessions.get(sessionId);
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const result = await this.executeCommand(session, command, parameters);
        
        // 記錄動作
        session.actions.push({
          command,
          parameters,
          result,
          timestamp: new Date()
        });
        
        res.json({ 
          success: true,
          result 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 解析自然語言指令
    this.app.post('/session/:sessionId/interpret', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { instruction } = req.body;
        
        const session = this.sessions.get(sessionId);
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        // 解析自然語言為 Playwright 命令
        const commands = this.interpretInstruction(instruction);
        const results = [];
        
        for (const cmd of commands) {
          const result = await this.executeCommand(session, cmd.action, cmd.params);
          results.push(result);
          
          session.actions.push({
            instruction,
            command: cmd,
            result,
            timestamp: new Date()
          });
        }
        
        res.json({ 
          success: true,
          commands,
          results 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 取得頁面狀態
    this.app.get('/session/:sessionId/state', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = this.sessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const { page } = session;
        
        const state = {
          url: page.url(),
          title: await page.title(),
          viewport: page.viewportSize(),
          cookies: await page.context().cookies(),
          localStorage: await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              items[key] = localStorage.getItem(key);
            }
            return items;
          }),
          sessionStorage: await page.evaluate(() => {
            const items = {};
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              items[key] = sessionStorage.getItem(key);
            }
            return items;
          })
        };
        
        res.json({ 
          success: true,
          state 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 擷取螢幕截圖
    this.app.get('/session/:sessionId/screenshot', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { fullPage = false } = req.query;
        
        const session = this.sessions.get(sessionId);
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const screenshot = await session.page.screenshot({
          fullPage: fullPage === 'true',
          type: 'png'
        });
        
        res.set('Content-Type', 'image/png');
        res.send(screenshot);
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 取得頁面內容
    this.app.get('/session/:sessionId/content', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = this.sessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const content = await session.page.content();
        res.json({ 
          success: true,
          content 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 執行自訂 JavaScript
    this.app.post('/session/:sessionId/evaluate', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { script } = req.body;
        
        const session = this.sessions.get(sessionId);
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const result = await session.page.evaluate(script);
        res.json({ 
          success: true,
          result 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 關閉會話
    this.app.delete('/session/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = this.sessions.get(sessionId);
        
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        await session.browser.close();
        this.sessions.delete(sessionId);
        
        res.json({ 
          success: true,
          message: '會話已關閉' 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });

    // 列出所有會話
    this.app.get('/sessions', (req, res) => {
      const sessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        browserType: session.browserType,
        createdAt: session.createdAt,
        actionsCount: session.actions.length
      }));
      
      res.json({ 
        success: true,
        sessions 
      });
    });

    // 批次執行命令
    this.app.post('/session/:sessionId/batch', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { commands } = req.body;
        
        const session = this.sessions.get(sessionId);
        if (!session) {
          return res.status(404).json({ 
            success: false,
            error: '會話不存在' 
          });
        }
        
        const results = [];
        for (const cmd of commands) {
          try {
            const result = await this.executeCommand(session, cmd.action, cmd.params);
            results.push({ success: true, result });
          } catch (error) {
            results.push({ success: false, error: error.message });
          }
        }
        
        res.json({ 
          success: true,
          results 
        });
      } catch (error) {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    });
  }

  /**
   * 執行 Playwright 命令
   * @param {*} session - session 參數
   * @param {*} command - command 參數
   * @param {*} parameters - parameters 參數
   */
  async executeCommand(session, command, parameters) {
    const { page } = session;
    
    switch (command) {
      case 'navigate':
      case 'goto':
        return await page.goto(parameters.url, parameters.options);
      
      case 'click':
        return await page.click(parameters.selector, parameters.options);
      
      case 'fill':
      case 'type':
        return await page.fill(parameters.selector, parameters.text, parameters.options);
      
      case 'press':
        return await page.press(parameters.selector, parameters.key, parameters.options);
      
      case 'select':
        return await page.selectOption(parameters.selector, parameters.values, parameters.options);
      
      case 'check':
        return await page.check(parameters.selector, parameters.options);
      
      case 'uncheck':
        return await page.uncheck(parameters.selector, parameters.options);
      
      case 'hover':
        return await page.hover(parameters.selector, parameters.options);
      
      case 'focus':
        return await page.focus(parameters.selector, parameters.options);
      
      case 'waitForSelector':
        return await page.waitForSelector(parameters.selector, parameters.options);
      
      case 'waitForTimeout':
        return await page.waitForTimeout(parameters.timeout);
      
      case 'reload':
        return await page.reload(parameters.options);
      
      case 'goBack':
        return await page.goBack(parameters.options);
      
      case 'goForward':
        return await page.goForward(parameters.options);
      
      case 'setViewportSize':
        return await page.setViewportSize(parameters.viewport);
      
      case 'evaluate':
        return await page.evaluate(parameters.script);
      
      case 'screenshot':
        return await page.screenshot(parameters.options);
      
      case 'pdf':
        return await page.pdf(parameters.options);
      
      default:
        throw new Error(`未知的命令: ${command}`);
    }
  }

  /**
   * 解析自然語言指令
   * @param {*} instruction - instruction 參數
   */
  interpretInstruction(instruction) {
    const commands = [];
    const lowerInstruction = instruction.toLowerCase();
    
    // 導航相關
    if (lowerInstruction.includes('開啟') || lowerInstruction.includes('前往') || lowerInstruction.includes('navigate')) {
      const urlMatch = instruction.match(/(?:http[s]?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/);
      if (urlMatch) {
        commands.push({
          action: 'navigate',
          params: { url: urlMatch[0] }
        });
      }
    }
    
    // 點擊相關
    if (lowerInstruction.includes('點擊') || lowerInstruction.includes('click')) {
      const textMatch = instruction.match(/["']([^"']+)["']/);
      if (textMatch) {
        commands.push({
          action: 'click',
          params: { selector: `text="${textMatch[1]}"` }
        });
      }
    }
    
    // 輸入相關
    if (lowerInstruction.includes('輸入') || lowerInstruction.includes('填寫') || lowerInstruction.includes('type')) {
      const inputMatch = instruction.match(/輸入\s*["']([^"']+)["']/);
      const fieldMatch = instruction.match(/在\s*["']([^"']+)["']/);
      
      if (inputMatch && fieldMatch) {
        commands.push({
          action: 'fill',
          params: {
            selector: `[placeholder*="${fieldMatch[1]}"], [name*="${fieldMatch[1]}"], label:has-text("${fieldMatch[1]}")`,
            text: inputMatch[1]
          }
        });
      }
    }
    
    // 等待相關
    if (lowerInstruction.includes('等待')) {
      const timeMatch = instruction.match(/(\d+)\s*(?:秒|毫秒|ms|s)/);
      if (timeMatch) {
        const time = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        const timeout = unit.includes('秒') || unit === 's' ? time * 1000 : time;
        
        commands.push({
          action: 'waitForTimeout',
          params: { timeout }
        });
      }
    }
    
    // 截圖相關
    if (lowerInstruction.includes('截圖') || lowerInstruction.includes('screenshot')) {
      commands.push({
        action: 'screenshot',
        params: { options: { fullPage: lowerInstruction.includes('全頁') || lowerInstruction.includes('full') } }
      });
    }
    
    return commands;
  }

  /**
   * 生成會話 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 啟動伺服器
   */
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`[MCP] Playwright MCP 伺服器運行於 http://localhost:${this.port}`);
      console.log(`[MCP] 健康檢查: http://localhost:${this.port}/health`);
    });
    
    // 優雅關閉
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * 關閉伺服器
   */
  async shutdown() {
    console.log('[MCP] 正在關閉伺服器...');
    
    // 關閉所有瀏覽器會話
    for (const [sessionId, session] of this.sessions) {
      try {
        await session.browser.close();
        console.log(`[MCP] 已關閉會話: ${sessionId}`);
      } catch (error) {
        console.error(`[MCP] 關閉會話失敗: ${sessionId}`, error);
      }
    }
    
    // 關閉伺服器
    if (this.server) {
      this.server.close(() => {
        console.log('[MCP] 伺服器已關閉');
        process.exit(0);
      });
    }
  }
}

// 匯出模組
module.exports = PlaywrightMCPServer;

// 直接執行時啟動伺服器
if (require.main === module) {
  const port = process.env.MCP_PORT || 3001;
  const server = new PlaywrightMCPServer(port);
  server.start();
}