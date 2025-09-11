# 練習 3：自動修復選擇器系統

## 學習目標
- 實作選擇器自動修復機制
- 學習多策略 fallback 系統設計
- 掌握選擇器相似度匹配演算法
- 整合 AI 輔助的選擇器生成與修復

## 背景說明

Web 應用的 UI 經常變更，導致測試選擇器失效是自動化測試維護的主要痛點。自動修復選擇器系統能夠：

1. **自動適應 UI 變化**
   - 檢測選擇器失效
   - 嘗試多種替代策略
   - 自動更新測試程式碼

2. **減少維護成本**
   - 降低手動修復工作
   - 提供修復建議
   - 記錄變更歷史

## 實作步驟

### 步驟 1：建立選擇器健康監控系統

```javascript
/**
 * 選擇器健康監控系統
 */
class SelectorHealthMonitor {
  constructor(page) {
    this.page = page;
    this.selectorHistory = new Map();
    this.healthMetrics = new Map();
  }
  
  // 記錄選擇器使用情況
  async trackSelector(selector, success, responseTime) {
    if (!this.selectorHistory.has(selector)) {
      this.selectorHistory.set(selector, {
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        successCount: 0,
        failureCount: 0,
        avgResponseTime: 0,
        history: []
      });
    }
    
    const record = this.selectorHistory.get(selector);
    record.lastSeen = Date.now();
    
    if (success) {
      record.successCount++;
    } else {
      record.failureCount++;
    }
    
    // 更新平均回應時間
    record.avgResponseTime = 
      (record.avgResponseTime * record.history.length + responseTime) / 
      (record.history.length + 1);
    
    // 記錄歷史
    record.history.push({
      timestamp: Date.now(),
      success,
      responseTime
    });
    
    // 保留最近 100 筆記錄
    if (record.history.length > 100) {
      record.history.shift();
    }
    
    // 計算健康分數
    this.calculateHealthScore(selector);
  }
  
  // 計算選擇器健康分數
  calculateHealthScore(selector) {
    const record = this.selectorHistory.get(selector);
    if (!record) return 0;
    
    const totalAttempts = record.successCount + record.failureCount;
    if (totalAttempts === 0) return 100;
    
    // 成功率權重：60%
    const successRate = record.successCount / totalAttempts;
    const successScore = successRate * 60;
    
    // 穩定性權重：25%（最近10次的成功率）
    const recentHistory = record.history.slice(-10);
    const recentSuccessRate = recentHistory.filter(h => h.success).length / recentHistory.length;
    const stabilityScore = recentSuccessRate * 25;
    
    // 效能權重：15%
    const performanceScore = record.avgResponseTime < 1000 ? 15 : 
                            record.avgResponseTime < 3000 ? 10 : 5;
    
    const healthScore = Math.round(successScore + stabilityScore + performanceScore);
    
    this.healthMetrics.set(selector, {
      score: healthScore,
      status: this.getHealthStatus(healthScore),
      recommendation: this.getRecommendation(healthScore, record)
    });
    
    return healthScore;
  }
  
  // 獲取健康狀態
  getHealthStatus(score) {
    if (score >= 90) return '健康';
    if (score >= 70) return '警告';
    if (score >= 50) return '不穩定';
    return '失效';
  }
  
  // 生成建議
  getRecommendation(score, record) {
    if (score >= 90) return '選擇器運作正常';
    if (score >= 70) return '建議優化選擇器以提高穩定性';
    if (score >= 50) return '選擇器不穩定，建議實作 fallback 策略';
    return '選擇器已失效，需要立即修復或替換';
  }
  
  // 生成健康報告
  generateHealthReport() {
    console.log('\n=== 選擇器健康報告 ===');
    
    this.healthMetrics.forEach((metrics, selector) => {
      console.log(`\n選擇器: ${selector}`);
      console.log(`健康分數: ${metrics.score}/100`);
      console.log(`狀態: ${metrics.status}`);
      console.log(`建議: ${metrics.recommendation}`);
    });
    
    // 找出需要關注的選擇器
    const problematicSelectors = Array.from(this.healthMetrics.entries())
      .filter(([_, metrics]) => metrics.score < 70)
      .sort((a, b) => a[1].score - b[1].score);
    
    if (problematicSelectors.length > 0) {
      console.log('\n⚠️ 需要關注的選擇器:');
      problematicSelectors.forEach(([selector, metrics]) => {
        console.log(`  - ${selector} (分數: ${metrics.score})`);
      });
    }
  }
}
```

### 步驟 2：實作多策略選擇器修復

```javascript
/**
 * 自動修復選擇器系統
 */
class SelfHealingSelector {
  constructor(page) {
    this.page = page;
    this.healingStrategies = [
      this.tryOriginalSelector.bind(this),
      this.tryTextContent.bind(this),
      this.tryAriaLabel.bind(this),
      this.tryDataAttributes.bind(this),
      this.trySimilarityMatch.bind(this),
      this.tryAIGenerated.bind(this)
    ];
    this.healingHistory = [];
  }
  
  // 策略 1：嘗試原始選擇器
  async tryOriginalSelector(originalSelector, context) {
    try {
      const element = await this.page.$(originalSelector);
      if (element) {
        console.log('✅ 原始選擇器仍然有效');
        return { element, selector: originalSelector, strategy: 'original' };
      }
    } catch (e) {
      // 選擇器失效
    }
    return null;
  }
  
  // 策略 2：使用文字內容
  async tryTextContent(originalSelector, context) {
    if (!context.text) return null;
    
    const strategies = [
      `text="${context.text}"`,
      `text~="${context.text}"`,
      `:has-text("${context.text}")`,
      `*:text-is("${context.text}")`
    ];
    
    for (const strategy of strategies) {
      try {
        const element = await this.page.$(strategy);
        if (element) {
          console.log(`✅ 使用文字內容修復: ${strategy}`);
          return { element, selector: strategy, strategy: 'text' };
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }
  
  // 策略 3：使用 ARIA 屬性
  async tryAriaLabel(originalSelector, context) {
    if (!context.ariaLabel && !context.text) return null;
    
    const label = context.ariaLabel || context.text;
    const strategies = [
      `[aria-label="${label}"]`,
      `[aria-label*="${label}"]`,
      `[aria-labelledby*="${label}"]`,
      `[aria-describedby*="${label}"]`
    ];
    
    for (const strategy of strategies) {
      try {
        const element = await this.page.$(strategy);
        if (element) {
          console.log(`✅ 使用 ARIA 屬性修復: ${strategy}`);
          return { element, selector: strategy, strategy: 'aria' };
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }
  
  // 策略 4：使用 data 屬性
  async tryDataAttributes(originalSelector, context) {
    if (!context.dataAttributes) return null;
    
    for (const [key, value] of Object.entries(context.dataAttributes)) {
      const strategies = [
        `[data-${key}="${value}"]`,
        `[data-${key}*="${value}"]`
      ];
      
      for (const strategy of strategies) {
        try {
          const element = await this.page.$(strategy);
          if (element) {
            console.log(`✅ 使用 data 屬性修復: ${strategy}`);
            return { element, selector: strategy, strategy: 'data' };
          }
        } catch (e) {
          continue;
        }
      }
    }
    return null;
  }
  
  // 策略 5：相似度匹配
  async trySimilarityMatch(originalSelector, context) {
    const result = await this.page.evaluate((original, ctx) => {
      // 解析原始選擇器
      const parseSelector = (selector) => {
        const attributes = {};
        
        // 提取標籤
        const tagMatch = selector.match(/^([a-z]+)/i);
        if (tagMatch) attributes.tag = tagMatch[1];
        
        // 提取 ID
        const idMatch = selector.match(/#([^.\[\s]+)/);
        if (idMatch) attributes.id = idMatch[1];
        
        // 提取 classes
        const classMatches = selector.matchAll(/\.([^.\[\s]+)/g);
        attributes.classes = Array.from(classMatches).map(m => m[1]);
        
        // 提取屬性
        const attrMatches = selector.matchAll(/\[([^=\]]+)(?:="?([^"\]]+)"?)?\]/g);
        attributes.attrs = Array.from(attrMatches).map(m => ({
          name: m[1],
          value: m[2]
        }));
        
        return attributes;
      };
      
      const targetAttrs = parseSelector(original);
      const allElements = document.querySelectorAll('*');
      
      let bestMatch = null;
      let bestScore = 0;
      
      // 計算每個元素的相似度分數
      allElements.forEach(element => {
        let score = 0;
        
        // 標籤匹配：10分
        if (targetAttrs.tag && 
            element.tagName.toLowerCase() === targetAttrs.tag.toLowerCase()) {
          score += 10;
        }
        
        // ID 部分匹配：8分
        if (targetAttrs.id && element.id) {
          if (element.id === targetAttrs.id) {
            score += 8;
          } else if (element.id.includes(targetAttrs.id) || 
                     targetAttrs.id.includes(element.id)) {
            score += 4;
          }
        }
        
        // Class 匹配：每個5分
        if (targetAttrs.classes) {
          targetAttrs.classes.forEach(cls => {
            if (element.classList.contains(cls)) {
              score += 5;
            }
          });
        }
        
        // 屬性匹配：每個3分
        if (targetAttrs.attrs) {
          targetAttrs.attrs.forEach(attr => {
            const elemValue = element.getAttribute(attr.name);
            if (elemValue) {
              if (elemValue === attr.value) {
                score += 3;
              } else if (attr.value && elemValue.includes(attr.value)) {
                score += 1;
              }
            }
          });
        }
        
        // 位置相似度（如果有上下文）
        if (ctx.position) {
          const rect = element.getBoundingClientRect();
          const distance = Math.sqrt(
            Math.pow(rect.x - ctx.position.x, 2) + 
            Math.pow(rect.y - ctx.position.y, 2)
          );
          
          if (distance < 100) {
            score += 5;
          } else if (distance < 200) {
            score += 2;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = element;
        }
      });
      
      if (bestMatch && bestScore > 10) {
        // 生成新選擇器
        let newSelector = bestMatch.tagName.toLowerCase();
        
        if (bestMatch.id) {
          newSelector = `#${bestMatch.id}`;
        } else if (bestMatch.className) {
          const classes = bestMatch.className.split(' ').slice(0, 2);
          newSelector += `.${classes.join('.')}`;
        }
        
        // 添加唯一屬性
        ['data-testid', 'data-id', 'name', 'type'].forEach(attr => {
          const value = bestMatch.getAttribute(attr);
          if (value && !newSelector.includes(attr)) {
            newSelector += `[${attr}="${value}"]`;
          }
        });
        
        return {
          found: true,
          selector: newSelector,
          score: bestScore
        };
      }
      
      return { found: false };
    }, originalSelector, context);
    
    if (result.found) {
      console.log(`✅ 相似度匹配成功 (分數: ${result.score}): ${result.selector}`);
      const element = await this.page.$(result.selector);
      return { element, selector: result.selector, strategy: 'similarity' };
    }
    
    return null;
  }
  
  // 策略 6：AI 生成選擇器
  async tryAIGenerated(originalSelector, context) {
    // 這裡模擬 AI 生成過程
    // 實際應用中會呼叫 AI API
    
    const prompt = `
原始選擇器: ${originalSelector}
上下文資訊: ${JSON.stringify(context)}

請生成3個替代選擇器，優先使用：
1. data-testid
2. aria-label
3. 唯一的組合屬性
    `;
    
    // 模擬 AI 生成的選擇器
    const aiGeneratedSelectors = [
      `[data-testid="${context.expectedTestId || 'generated'}"]`,
      `button:has-text("${context.text}")`,
      `${context.tag || 'div'}[role="${context.role}"]`
    ];
    
    for (const selector of aiGeneratedSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          console.log(`✅ AI 生成選擇器成功: ${selector}`);
          return { element, selector, strategy: 'ai' };
        }
      } catch (e) {
        continue;
      }
    }
    
    return null;
  }
  
  // 執行自動修復
  async healSelector(originalSelector, context = {}) {
    console.log(`\n🔧 嘗試修復選擇器: ${originalSelector}`);
    
    const startTime = Date.now();
    
    // 依序嘗試各種策略
    for (const strategy of this.healingStrategies) {
      const result = await strategy(originalSelector, context);
      
      if (result) {
        const healingTime = Date.now() - startTime;
        
        // 記錄修復歷史
        this.healingHistory.push({
          timestamp: Date.now(),
          original: originalSelector,
          healed: result.selector,
          strategy: result.strategy,
          healingTime,
          context
        });
        
        console.log(`✨ 修復成功！耗時: ${healingTime}ms`);
        
        // 生成修復建議
        this.generateHealingSuggestion(originalSelector, result);
        
        return result;
      }
    }
    
    console.log('❌ 所有修復策略都失敗了');
    throw new Error(`無法修復選擇器: ${originalSelector}`);
  }
  
  // 生成修復建議
  generateHealingSuggestion(originalSelector, result) {
    console.log('\n📝 修復建議:');
    console.log(`原始選擇器: ${originalSelector}`);
    console.log(`新選擇器: ${result.selector}`);
    console.log(`修復策略: ${result.strategy}`);
    
    // 生成程式碼更新建議
    console.log('\n建議的程式碼更新:');
    console.log(`// 替換`);
    console.log(`- await page.click('${originalSelector}');`);
    console.log(`// 為`);
    console.log(`+ await page.click('${result.selector}');`);
    
    // 提供預防建議
    if (result.strategy !== 'original') {
      console.log('\n預防建議:');
      switch (result.strategy) {
        case 'text':
          console.log('- 考慮添加 data-testid 屬性以提高穩定性');
          break;
        case 'similarity':
          console.log('- UI 結構可能已變更，建議與開發團隊溝通');
          break;
        case 'ai':
          console.log('- 建議審查 AI 生成的選擇器並添加到測試中');
          break;
      }
    }
  }
  
  // 批量修復選擇器
  async healMultipleSelectors(selectors) {
    const results = {
      success: [],
      failed: []
    };
    
    for (const { selector, context } of selectors) {
      try {
        const result = await this.healSelector(selector, context);
        results.success.push({
          original: selector,
          healed: result.selector,
          strategy: result.strategy
        });
      } catch (error) {
        results.failed.push({
          selector,
          error: error.message
        });
      }
    }
    
    // 生成批量修復報告
    this.generateBatchReport(results);
    
    return results;
  }
  
  // 生成批量修復報告
  generateBatchReport(results) {
    console.log('\n=== 批量修復報告 ===');
    console.log(`成功修復: ${results.success.length}`);
    console.log(`修復失敗: ${results.failed.length}`);
    
    if (results.success.length > 0) {
      console.log('\n✅ 成功修復的選擇器:');
      results.success.forEach(item => {
        console.log(`  ${item.original} → ${item.healed} (${item.strategy})`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ 修復失敗的選擇器:');
      results.failed.forEach(item => {
        console.log(`  ${item.selector}: ${item.error}`);
      });
    }
  }
}
```

### 步驟 3：整合自動修復到測試流程

```javascript
/**
 * 具有自動修復能力的測試包裝器
 */
class SelfHealingTest {
  constructor(page) {
    this.page = page;
    this.healer = new SelfHealingSelector(page);
    this.monitor = new SelectorHealthMonitor(page);
  }
  
  // 包裝點擊操作
  async click(selector, context = {}) {
    const startTime = Date.now();
    
    try {
      // 先嘗試直接點擊
      await this.page.click(selector, { timeout: 3000 });
      
      // 記錄成功
      await this.monitor.trackSelector(selector, true, Date.now() - startTime);
      
    } catch (error) {
      // 記錄失敗
      await this.monitor.trackSelector(selector, false, Date.now() - startTime);
      
      // 嘗試自動修復
      console.log(`選擇器失效，啟動自動修復: ${selector}`);
      
      const healed = await this.healer.healSelector(selector, context);
      
      if (healed && healed.element) {
        // 使用修復後的選擇器
        await healed.element.click();
        
        // 更新選擇器映射
        this.updateSelectorMapping(selector, healed.selector);
      } else {
        throw error;
      }
    }
  }
  
  // 包裝填寫操作
  async fill(selector, value, context = {}) {
    const startTime = Date.now();
    
    try {
      await this.page.fill(selector, value, { timeout: 3000 });
      await this.monitor.trackSelector(selector, true, Date.now() - startTime);
      
    } catch (error) {
      await this.monitor.trackSelector(selector, false, Date.now() - startTime);
      
      const healed = await this.healer.healSelector(selector, context);
      
      if (healed && healed.element) {
        await healed.element.fill(value);
        this.updateSelectorMapping(selector, healed.selector);
      } else {
        throw error;
      }
    }
  }
  
  // 更新選擇器映射
  updateSelectorMapping(original, healed) {
    // 這裡可以寫入檔案或資料庫
    console.log(`\n📌 選擇器映射更新:`);
    console.log(`  原始: ${original}`);
    console.log(`  新的: ${healed}`);
    
    // 可選：自動更新測試檔案
    // this.updateTestFile(original, healed);
  }
  
  // 生成測試執行報告
  async generateExecutionReport() {
    console.log('\n=== 測試執行報告 ===');
    
    // 健康報告
    this.monitor.generateHealthReport();
    
    // 修復歷史
    if (this.healer.healingHistory.length > 0) {
      console.log('\n🔧 自動修復記錄:');
      this.healer.healingHistory.forEach(record => {
        console.log(`  ${record.original} → ${record.healed}`);
        console.log(`    策略: ${record.strategy}, 耗時: ${record.healingTime}ms`);
      });
    }
  }
}

// 使用範例
test('使用自動修復系統的測試', async ({ page }) => {
  const selfHealingTest = new SelfHealingTest(page);
  
  await page.goto('http://localhost:3000/changing-ui');
  
  // 這些選擇器可能會因 UI 變更而失效
  // 但自動修復系統會嘗試修復它們
  
  await selfHealingTest.click('#old-login-button', {
    text: '登入',
    ariaLabel: 'User login',
    expectedTestId: 'login-button'
  });
  
  await selfHealingTest.fill('.username-field', 'testuser', {
    text: '使用者名稱',
    dataAttributes: { field: 'username' }
  });
  
  await selfHealingTest.fill('.password-field', 'password123', {
    text: '密碼',
    dataAttributes: { field: 'password' }
  });
  
  await selfHealingTest.click('.submit-btn', {
    text: '提交',
    position: { x: 500, y: 400 }
  });
  
  // 生成執行報告
  await selfHealingTest.generateExecutionReport();
});
```

## 預期結果

完成本練習後，你應該能夠：

1. **實作自動修復機制**
   - 多策略 fallback 系統
   - 相似度匹配演算法
   - AI 輔助選擇器生成

2. **監控選擇器健康**
   - 追蹤成功率
   - 識別不穩定選擇器
   - 生成健康報告

3. **整合到測試流程**
   - 透明的自動修復
   - 自動更新選擇器
   - 減少維護工作

## 思考與挑戰

### 進階挑戰 1：視覺定位
基於視覺識別的元素定位：

```javascript
class VisualLocator {
  async findByVisualSimilarity(screenshot, template) {
    // 使用圖像識別找到元素
    // 計算視覺相似度
    // 返回座標位置
  }
}
```

### 進階挑戰 2：學習型修復系統
從成功的修復中學習模式：

```javascript
class LearningHealer {
  async learnFromHistory() {
    // 分析修復歷史
    // 識別常見模式
    // 優化修復策略順序
  }
}
```

### 進階挑戰 3：預測性維護
預測選擇器可能失效的時機：

```javascript
class PredictiveMaintenance {
  async predictSelectorFailure(selector) {
    // 分析選擇器複雜度
    // 檢查 UI 變更頻率
    // 預測失效機率
  }
}
```

## 實用提示

1. **選擇器策略優先級**
   - data-testid > aria-label > role > text > class
   - 避免使用索引和深層嵌套
   - 優先使用語義化屬性

2. **修復策略選擇**
   - 簡單變更：使用相似度匹配
   - 結構變更：使用文字或 ARIA
   - 完全重構：使用 AI 生成

3. **效能優化**
   - 快取成功的選擇器
   - 並行嘗試多個策略
   - 設定合理的超時時間

## 相關資源

- [Playwright 選擇器文檔](https://playwright.dev/docs/selectors)
- [自我修復測試模式](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)
- [AI 在測試自動化中的應用](https://testautomationu.applitools.com/self-healing-tests/)

---

💡 **提示**：自動修復選擇器是實現真正自主測試的關鍵技術。結合 AI 和機器學習，可以讓測試系統具備自我進化的能力。