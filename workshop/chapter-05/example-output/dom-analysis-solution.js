/**
 * Chapter 5: DOM 分析問題 - 完整解決方案
 * 
 * 展示如何處理各種 DOM 相關的測試問題
 */

const { test, expect } = require('@playwright/test');

/**
 * DOM 選擇器策略
 */
test.describe('DOM 選擇器最佳實踐', () => {
  
  // ❌ 不良實踐：脆弱的選擇器
  test.skip('問題：使用不穩定的選擇器', async ({ page }) => {
    await page.goto('http://localhost:3000/product-list');
    
    // 問題 1：依賴元素順序
    await page.click('.product:nth-child(3) button');
    
    // 問題 2：深層嵌套選擇器
    await page.click('div.container > div.row > div.col > div.card > button');
    
    // 問題 3：依賴動態 class
    await page.click('.btn-primary-2023-style-v2');
  });
  
  // ✅ 解決方案：穩定的選擇器策略
  test('最佳實踐：使用穩定選擇器', async ({ page }) => {
    await page.goto('http://localhost:3000/product-list');
    
    // 方案 1：使用 data-testid
    await page.click('[data-testid="product-123-add-to-cart"]');
    
    // 方案 2：使用語義化選擇器
    await page.click('[aria-label="將產品 iPhone 15 加入購物車"]');
    
    // 方案 3：組合文字和角色
    const product = page.locator('article').filter({ hasText: 'iPhone 15' });
    await product.locator('button:has-text("加入購物車")').click();
    
    // 方案 4：使用相對定位
    await page.locator('text=MacBook Pro').locator('..').locator('button').click();
  });
  
  // ✅ 智能選擇器生成器
  test('使用智能選擇器生成器', async ({ page }) => {
    /**
     *
     */
    class SmartSelector {
      /**
       *
       * @param {*} page - page 參數
       */
      constructor(page) {
        this.page = page;
      }
      
      // 生成最佳選擇器
      /**
       *
       * @param {*} element - element 參數
       */
      async generateBestSelector(element) {
        return await element.evaluate(el => {
          // 優先級 1：data-testid
          if (el.dataset.testid) {
            return `[data-testid="${el.dataset.testid}"]`;
          }
          
          // 優先級 2：唯一 ID
          if (el.id && document.querySelectorAll(`#${el.id}`).length === 1) {
            return `#${el.id}`;
          }
          
          // 優先級 3：ARIA 標籤
          if (el.getAttribute('aria-label')) {
            return `[aria-label="${el.getAttribute('aria-label')}"]`;
          }
          
          // 優先級 4：角色 + 文字
          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          const text = el.textContent.trim();
          if (text && text.length < 50) {
            return `${role}:has-text("${text}")`;
          }
          
          // 優先級 5：組合屬性
          const attrs = ['name', 'type', 'placeholder'].filter(attr => el.getAttribute(attr));
          if (attrs.length > 0) {
            const selector = attrs.map(attr => 
              `[${attr}="${el.getAttribute(attr)}"]`
            ).join('');
            return el.tagName.toLowerCase() + selector;
          }
          
          // 後備方案
          return null;
        });
      }
      
      // 評估選擇器健康度
      /**
       *
       * @param {*} selector - selector 參數
       */
      evaluateSelectorHealth(selector) {
        let score = 50; // 基礎分數
        
        // 加分項
        if (selector.includes('data-testid')) score += 40;
        if (selector.includes('aria-label')) score += 30;
        if (selector.includes('role=')) score += 20;
        if (selector.includes(':has-text')) score += 15;
        
        // 扣分項
        if (selector.includes(':nth-child')) score -= 30;
        if (selector.includes(':nth-of-type')) score -= 25;
        if (selector.split('>').length > 3) score -= 20; // 深層嵌套
        if (selector.includes('.') && selector.split('.').length > 3) score -= 15; // 多個 class
        
        return Math.max(0, Math.min(100, score));
      }
    }
    
    await page.goto('http://localhost:3000/complex-form');
    
    const selector = new SmartSelector(page);
    
    // 為表單元素生成最佳選擇器
    const emailInput = page.locator('input[type="email"]').first();
    const bestSelector = await selector.generateBestSelector(emailInput);
    
    console.log('最佳選擇器:', bestSelector);
    console.log('健康度分數:', selector.evaluateSelectorHealth(bestSelector));
    
    // 使用生成的選擇器
    if (bestSelector) {
      await page.fill(bestSelector, 'test@example.com');
    }
  });
});

/**
 * 處理動態 DOM
 */
test.describe('動態 DOM 處理', () => {
  
  // 處理 SPA 路由變化
  test('處理單頁應用路由', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 點擊導航連結
    await page.click('nav a:has-text("產品")');
    
    // 等待路由變化
    await page.waitForURL('**/products');
    
    // 等待新內容載入
    await page.waitForSelector('[data-page="products"]', {
      state: 'visible'
    });
    
    // 等待產品列表載入
    await page.waitForFunction(() => {
      const products = document.querySelectorAll('.product-card');
      return products.length > 0;
    });
    
    const productCount = await page.locator('.product-card').count();
    expect(productCount).toBeGreaterThan(0);
  });
  
  // 處理 Shadow DOM
  test('處理 Shadow DOM 元素', async ({ page }) => {
    await page.goto('http://localhost:3000/web-components');
    
    // 方法 1：使用 Playwright 的穿透能力
    await page.locator('custom-button').locator('internal:text="確認"').click();
    
    // 方法 2：使用 JavaScript 評估
    await page.evaluate(() => {
      const host = document.querySelector('custom-input');
      const shadowRoot = host.shadowRoot;
      const input = shadowRoot.querySelector('input');
      input.value = '測試輸入';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // 方法 3：自定義定位函數
    const shadowInput = await page.evaluateHandle(() => {
      const host = document.querySelector('custom-input');
      return host.shadowRoot.querySelector('input');
    });
    
    await shadowInput.fill('新的輸入值');
  });
  
  // 處理 iframe
  test('處理 iframe 內容', async ({ page }) => {
    await page.goto('http://localhost:3000/with-iframe');
    
    // 獲取 iframe
    const paymentFrame = page.frameLocator('#payment-iframe');
    
    // 在 iframe 內操作
    await paymentFrame.locator('[data-testid="card-number"]').fill('4111111111111111');
    await paymentFrame.locator('[data-testid="card-exp"]').fill('12/25');
    await paymentFrame.locator('[data-testid="card-cvv"]').fill('123');
    
    // 提交表單
    await paymentFrame.locator('button:has-text("支付")').click();
    
    // 等待支付完成（返回主頁面）
    await page.waitForSelector('.payment-success', {
      timeout: 10000
    });
  });
  
  // 處理動態生成的元素
  test('處理動態生成元素', async ({ page }) => {
    await page.goto('http://localhost:3000/dynamic-list');
    
    // 添加新項目
    await page.click('[data-testid="add-item"]');
    
    // 等待新元素出現
    await page.waitForSelector('.list-item:last-child', {
      state: 'visible'
    });
    
    // 填寫動態生成的輸入框
    const newItem = page.locator('.list-item').last();
    await newItem.locator('input[name="title"]').fill('新項目標題');
    await newItem.locator('textarea[name="description"]').fill('新項目描述');
    
    // 保存
    await newItem.locator('button:has-text("保存")').click();
    
    // 驗證保存成功
    await expect(newItem.locator('.saved-indicator')).toBeVisible();
  });
});

/**
 * DOM 變化追蹤和分析
 */
class DOMAnalyzer {
  /**
   *
   * @param {*} page - page 參數
   */
  constructor(page) {
    this.page = page;
    this.mutations = [];
    this.observing = false;
  }
  
  // 開始監控 DOM 變化
  /**
     * startObserving 方法
     */
    async startObserving() {
    await this.page.evaluate(() => {
      window.__domMutations = [];
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          const record = {
            type: mutation.type,
            timestamp: Date.now(),
            target: {
              tagName: mutation.target.tagName,
              id: mutation.target.id,
              className: mutation.target.className
            }
          };
          
          if (mutation.type === 'childList') {
            record.addedNodes = mutation.addedNodes.length;
            record.removedNodes = mutation.removedNodes.length;
          } else if (mutation.type === 'attributes') {
            record.attributeName = mutation.attributeName;
            record.oldValue = mutation.oldValue;
          }
          
          window.__domMutations.push(record);
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
      });
      
      window.__domObserver = observer;
    });
    
    this.observing = true;
  }
  
  // 停止監控
  /**
     * stopObserving 方法
     */
    async stopObserving() {
    if (!this.observing) return;
    
    const mutations = await this.page.evaluate(() => {
      if (window.__domObserver) {
        window.__domObserver.disconnect();
      }
      return window.__domMutations || [];
    });
    
    this.mutations = mutations;
    this.observing = false;
    
    return mutations;
  }
  
  // 分析 DOM 變化
  /**
     * analyzeChanges 方法
     */
    analyzeChanges() {
    const analysis = {
      totalMutations: this.mutations.length,
      byType: {},
      hotspots: [],
      timeline: []
    };
    
    // 按類型統計
    this.mutations.forEach(m => {
      analysis.byType[m.type] = (analysis.byType[m.type] || 0) + 1;
    });
    
    // 找出熱點（變化頻繁的元素）
    const targetMap = new Map();
    this.mutations.forEach(m => {
      const key = `${m.target.tagName}#${m.target.id}.${m.target.className}`;
      targetMap.set(key, (targetMap.get(key) || 0) + 1);
    });
    
    analysis.hotspots = Array.from(targetMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([element, count]) => ({ element, count }));
    
    // 生成時間線
    if (this.mutations.length > 0) {
      const startTime = this.mutations[0].timestamp;
      analysis.timeline = this.mutations.map(m => ({
        time: m.timestamp - startTime,
        type: m.type,
        target: m.target.tagName
      }));
    }
    
    return analysis;
  }
  
  // 生成報告
  /**
     * generateReport 方法
     */
    generateReport() {
    const analysis = this.analyzeChanges();
    
    console.log('\n=== DOM 變化分析報告 ===');
    console.log(`總變化數: ${analysis.totalMutations}`);
    
    console.log('\n變化類型分布:');
    Object.entries(analysis.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log('\n變化熱點 (Top 5):');
    analysis.hotspots.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.element} (${h.count} 次)`);
    });
    
    return analysis;
  }
}

// 使用 DOM 分析器的範例
test('分析複雜頁面的 DOM 變化', async ({ page }) => {
  const analyzer = new DOMAnalyzer(page);
  
  await page.goto('http://localhost:3000/dynamic-dashboard');
  
  // 開始監控
  await analyzer.startObserving();
  
  // 執行會觸發 DOM 變化的操作
  await page.click('[data-testid="refresh-data"]');
  await page.waitForSelector('.loading', { state: 'hidden' });
  
  await page.click('[data-testid="add-widget"]');
  await page.waitForSelector('.widget:last-child');
  
  await page.click('[data-testid="toggle-view"]');
  await page.waitForTimeout(1000);
  
  // 停止監控並分析
  await analyzer.stopObserving();
  const report = analyzer.generateReport();
  
  // 驗證
  expect(report.totalMutations).toBeGreaterThan(0);
  expect(report.hotspots.length).toBeGreaterThan(0);
});

/**
 * 自動修復選擇器
 */
class SelfHealingSelector {
  /**
   *
   * @param {*} page - page 參數
   */
  constructor(page) {
    this.page = page;
    this.selectorCache = new Map();
  }
  
  // 嘗試多種策略找到元素
  /**
   *
   * @param {*} originalSelector - originalSelector 參數
   * @param {*} context - context 參數
   */
  async findElement(originalSelector, context = {}) {
    // 策略 1：嘗試原始選擇器
    try {
      const element = await this.page.$(originalSelector);
      if (element) return { element, selector: originalSelector };
    } catch (e) {
      console.log('原始選擇器失效:', originalSelector);
    }
    
    // 策略 2：使用緩存的替代選擇器
    if (this.selectorCache.has(originalSelector)) {
      const cached = this.selectorCache.get(originalSelector);
      try {
        const element = await this.page.$(cached);
        if (element) return { element, selector: cached };
      } catch (e) {
        console.log('緩存選擇器也失效:', cached);
      }
    }
    
    // 策略 3：使用上下文資訊智能查找
    if (context.text) {
      const strategies = [
        `text="${context.text}"`,
        `:has-text("${context.text}")`,
        `[aria-label*="${context.text}"]`,
        `[title*="${context.text}"]`
      ];
      
      for (const strategy of strategies) {
        try {
          const element = await this.page.$(strategy);
          if (element) {
            // 緩存新的工作選擇器
            this.selectorCache.set(originalSelector, strategy);
            console.log('找到替代選擇器:', strategy);
            return { element, selector: strategy };
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // 策略 4：使用相似度匹配
    if (context.attributes) {
      const element = await this.findBySimilarity(context.attributes);
      if (element) {
        return element;
      }
    }
    
    throw new Error(`無法找到元素: ${originalSelector}`);
  }
  
  // 基於屬性相似度查找
  /**
   *
   * @param {*} targetAttributes - targetAttributes 參數
   */
  async findBySimilarity(targetAttributes) {
    return await this.page.evaluate((attrs) => {
      const allElements = document.querySelectorAll('*');
      let bestMatch = null;
      let bestScore = 0;
      
      allElements.forEach(el => {
        let score = 0;
        
        // 比較各種屬性
        if (attrs.tag && el.tagName.toLowerCase() === attrs.tag.toLowerCase()) {
          score += 10;
        }
        if (attrs.class) {
          const classMatches = attrs.class.split(' ')
            .filter(c => el.classList.contains(c)).length;
          score += classMatches * 5;
        }
        if (attrs.type && el.getAttribute('type') === attrs.type) {
          score += 8;
        }
        if (attrs.name && el.getAttribute('name') === attrs.name) {
          score += 8;
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = el;
        }
      });
      
      if (bestMatch && bestScore > 10) {
        // 生成新選擇器
        let newSelector = bestMatch.tagName.toLowerCase();
        if (bestMatch.id) {
          newSelector = `#${bestMatch.id}`;
        } else if (bestMatch.className) {
          newSelector += `.${bestMatch.className.split(' ')[0]}`;
        }
        
        return {
          found: true,
          selector: newSelector
        };
      }
      
      return { found: false };
    }, targetAttributes);
  }
}

// 使用自動修復選擇器
test('自動修復失效的選擇器', async ({ page }) => {
  const healer = new SelfHealingSelector(page);
  
  await page.goto('http://localhost:3000/changing-ui');
  
  // 嘗試使用可能會變化的選擇器
  const result = await healer.findElement('.old-class-name', {
    text: '提交',
    attributes: {
      tag: 'button',
      type: 'submit'
    }
  });
  
  if (result.element) {
    await result.element.click();
    console.log('成功使用選擇器:', result.selector);
  }
});

module.exports = {
  DOMAnalyzer,
  SelfHealingSelector
};