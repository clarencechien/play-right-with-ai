# 練習 3：DOM 操作問題分析

## 學習目標
- 掌握 DOM 結構變化的除錯技巧
- 學習動態元素和選擇器失效的處理方法
- 使用 AI 分析複雜的 DOM 操作問題
- 實作健壯的元素定位策略

## 背景說明

現代 Web 應用大量使用動態 DOM 操作，從 React/Vue 的虛擬 DOM 到原生 JavaScript 的動態更新。這些操作常常導致測試中的元素定位問題。本練習將幫助你：

1. **識別 DOM 相關問題**
   - 選擇器失效
   - 元素狀態不一致
   - Shadow DOM 和 iframe 挑戰

2. **運用 AI 進行 DOM 分析**
   - 生成穩定的選擇器
   - 分析 DOM 結構變化
   - 優化元素定位策略

## 實作步驟

### 步驟 1：分析不穩定的選擇器問題

```javascript
// 問題案例：脆弱的選擇器
test('使用不穩定選擇器的測試', async ({ page }) => {
  await page.goto('http://localhost:3000/dynamic-content');
  
  // 問題 1：使用索引的選擇器
  await page.click('.item:nth-child(3)'); // 當順序改變時會失敗
  
  // 問題 2：過度依賴 class 名稱
  await page.click('.btn-primary-large-blue'); // class 名稱可能改變
  
  // 問題 3：深層嵌套選擇器
  await page.click('div > div > div > span > button'); // 結構改變就失效
});
```

### 步驟 2：使用 AI 改進選擇器策略

向 AI 提供以下提示詞：

```markdown
我的 Playwright 測試因為 DOM 結構改變而經常失敗。以下是頁面的 HTML 結構：

[HTML 結構]
<div class="product-list">
  <div class="product-item" data-product-id="123">
    <h3>產品名稱</h3>
    <button class="btn-primary-large-blue">加入購物車</button>
  </div>
  <!-- 更多產品項目 -->
</div>

請幫我：
1. 分析當前選擇器的問題
2. 提供更穩定的選擇器策略
3. 建議使用 data attributes 和 ARIA 標籤
4. 生成可重用的選擇器函數

Analyze the DOM structure and provide robust selector strategies in Traditional Chinese.
```

### 步驟 3：實作健壯的元素定位

```javascript
// 改進版本：使用多種策略定位元素

// 策略 1：使用 data attributes
test('使用 data 屬性定位', async ({ page }) => {
  await page.goto('http://localhost:3000/dynamic-content');
  
  // 使用 data-testid（推薦）
  await page.click('[data-testid="add-to-cart-123"]');
  
  // 使用業務邏輯相關的 data 屬性
  await page.click('[data-product-id="123"] button:has-text("加入購物車")');
});

// 策略 2：使用文字內容和語義
test('使用語義化定位', async ({ page }) => {
  await page.goto('http://localhost:3000/dynamic-content');
  
  // 使用 ARIA 標籤
  await page.click('[aria-label="將產品 ABC 加入購物車"]');
  
  // 使用角色和文字組合
  await page.click('button:has-text("加入購物車"):near(h3:has-text("產品 ABC"))');
});

// 策略 3：創建自訂定位器
class RobustLocators {
  constructor(page) {
    this.page = page;
  }
  
  async findProduct(productName) {
    // 組合多個條件確保準確性
    return this.page.locator(`
      [data-testid*="product"]:has(
        h3:text-is("${productName}")
      )
    `);
  }
  
  async addToCart(productName) {
    const product = await this.findProduct(productName);
    await product.locator('button:has-text("加入購物車")').click();
  }
}
```

### 步驟 4：處理動態 DOM 變化

```javascript
// 處理 SPA 應用的 DOM 更新
test('處理動態載入的內容', async ({ page }) => {
  await page.goto('http://localhost:3000/spa-app');
  
  // 等待路由變化完成
  await page.waitForURL('**/products');
  
  // 等待內容載入（不依賴具體選擇器）
  await page.waitForLoadState('networkidle');
  
  // 使用穩定的定位策略
  const productCard = page.locator('[role="article"]')
    .filter({ hasText: '目標產品' });
  
  // 確保元素可見且可互動
  await expect(productCard).toBeVisible();
  await productCard.locator('button').click();
});

// 處理 Shadow DOM
test('處理 Shadow DOM 元素', async ({ page }) => {
  await page.goto('http://localhost:3000/web-components');
  
  // 穿透 Shadow DOM 邊界
  await page.locator('custom-button')
    .locator('internal', 'button')
    .click();
});

// 處理 iframe 內容
test('處理 iframe 中的元素', async ({ page }) => {
  await page.goto('http://localhost:3000/with-iframe');
  
  // 獲取 iframe 並操作其內容
  const frame = page.frameLocator('#payment-iframe');
  await frame.locator('[data-testid="card-number"]').fill('4111111111111111');
});
```

### 步驟 5：DOM 變化追蹤與除錯

```javascript
// 使用 AI 輔助的 DOM 分析工具
class DOMAnalyzer {
  constructor(page) {
    this.page = page;
    this.mutations = [];
  }
  
  async trackMutations() {
    await this.page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        window.__mutations = window.__mutations || [];
        mutations.forEach(mutation => {
          window.__mutations.push({
            type: mutation.type,
            target: mutation.target.tagName,
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    });
  }
  
  async getMutationReport() {
    return await this.page.evaluate(() => window.__mutations || []);
  }
}

// 使用 DOM 分析器除錯
test('分析 DOM 變化', async ({ page }) => {
  const analyzer = new DOMAnalyzer(page);
  await analyzer.trackMutations();
  
  await page.goto('http://localhost:3000/dynamic-page');
  await page.click('#trigger-changes');
  
  const mutations = await analyzer.getMutationReport();
  console.log('DOM 變化報告：', mutations);
});
```

## 預期結果

完成本練習後，你應該能夠：

1. **建立穩定的選擇器策略**
   - 優先使用語義化選擇器
   - 實作 fallback 機制
   - 避免脆弱的定位方式

2. **處理各種 DOM 情境**
   - Shadow DOM 和 Web Components
   - iframe 內容
   - 動態載入的元素

3. **運用 AI 優化定位**
   - 生成最佳選擇器
   - 分析 DOM 結構問題
   - 預測潛在的失敗點

## 思考與挑戰

### 進階挑戰 1：智能選擇器生成器
創建一個工具，自動為頁面元素生成最穩定的選擇器：

```javascript
class SmartSelectorGenerator {
  async generateSelector(element) {
    // 實作你的智能選擇器生成邏輯
    // 考慮：唯一性、穩定性、可讀性
  }
}
```

### 進階挑戰 2：選擇器健康度評分
設計一個系統，評估選擇器的穩定性分數：

```javascript
function evaluateSelectorHealth(selector) {
  // 評分標準：
  // - 使用 data-testid: +30 分
  // - 使用 ARIA 屬性: +20 分
  // - 使用 class: -10 分
  // - 使用索引: -20 分
  // 返回 0-100 的分數
}
```

### 進階挑戰 3：自動修復失效的選擇器
當選擇器失效時，自動嘗試修復：

```javascript
async function selfHealingSelector(page, originalSelector, context) {
  // 嘗試多種策略找到目標元素
  // 記錄新的工作選擇器
  // 更新測試程式碼
}
```

## 實用提示

1. **選擇器優先級**
   ```
   1. data-testid（最穩定）
   2. ARIA 屬性（語義化）
   3. 角色 + 文字（直觀）
   4. 唯一的 ID（謹慎使用）
   5. CSS class（最後選擇）
   ```

2. **除錯技巧**
   - 使用 `page.locator().count()` 檢查匹配數量
   - 使用 `page.locator().evaluateAll()` 獲取所有匹配元素
   - 啟用 Playwright Inspector 視覺化定位

3. **最佳實踐**
   - 與開發團隊協作添加 data-testid
   - 建立選擇器常數檔案集中管理
   - 定期審查和更新選擇器策略

## 相關資源

- [Playwright 選擇器引擎](https://playwright.dev/docs/selectors)
- [Web 無障礙 ARIA 指南](https://developer.mozilla.org/zh-TW/docs/Web/Accessibility/ARIA)
- [CSS 選擇器參考](https://developer.mozilla.org/zh-TW/docs/Web/CSS/CSS_Selectors)

---

💡 **提示**：穩定的元素定位是自動化測試成功的關鍵。投資時間建立良好的選擇器策略，將大幅減少維護成本。