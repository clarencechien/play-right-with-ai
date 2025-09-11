/**
 * Chapter 5: 時序問題除錯 - 完整解決方案
 * 
 * 這個檔案展示了如何解決常見的時序和非同步問題
 */

const { test, expect } = require('@playwright/test');

/**
 * 問題案例：直接檢查非同步載入的內容
 */
test.describe('時序問題 - 問題與解決方案', () => {
  
  // ❌ 錯誤示範：沒有等待非同步操作完成
  test.skip('問題：立即檢查非同步結果', async ({ page }) => {
    await page.goto('http://localhost:3000/async-demo');
    await page.click('#load-data');
    
    // 錯誤：資料還在載入中就檢查結果
    const result = await page.textContent('.result');
    expect(result).toBe('資料載入完成'); // 失敗：得到 "載入中..."
  });
  
  // ✅ 解決方案 1：使用 waitForSelector 等待特定文字
  test('解決方案 1：等待元素包含特定文字', async ({ page }) => {
    await page.goto('http://localhost:3000/async-demo');
    await page.click('#load-data');
    
    // 等待元素出現並包含預期文字
    await page.waitForSelector('.result:has-text("資料載入完成")', {
      timeout: 10000
    });
    
    const result = await page.textContent('.result');
    expect(result).toBe('資料載入完成');
  });
  
  // ✅ 解決方案 2：使用 waitForFunction 等待自定義條件
  test('解決方案 2：等待自定義條件', async ({ page }) => {
    await page.goto('http://localhost:3000/async-demo');
    await page.click('#load-data');
    
    // 等待自定義條件滿足
    await page.waitForFunction(() => {
      const element = document.querySelector('.result');
      return element && 
             element.textContent !== '載入中...' && 
             element.textContent.includes('完成');
    }, { timeout: 10000 });
    
    const result = await page.textContent('.result');
    expect(result).toContain('完成');
  });
  
  // ✅ 解決方案 3：等待網路請求完成
  test('解決方案 3：等待 API 回應', async ({ page }) => {
    await page.goto('http://localhost:3000/async-demo');
    
    // 同時等待點擊和 API 回應
    const [response] = await Promise.all([
      page.waitForResponse(resp => 
        resp.url().includes('/api/data') && 
        resp.status() === 200
      ),
      page.click('#load-data')
    ]);
    
    // 確認 API 回應成功
    const responseData = await response.json();
    expect(responseData).toHaveProperty('status', 'success');
    
    // 等待 UI 更新
    await page.waitForSelector('.result:not(:has-text("載入中..."))');
    
    const result = await page.textContent('.result');
    expect(result).toBe('資料載入完成');
  });
  
  // ✅ 解決方案 4：智能重試機制
  test('解決方案 4：實作智能重試', async ({ page }) => {
    await page.goto('http://localhost:3000/async-demo');
    
    // 智能重試函數
    async function waitForDataWithRetry(maxRetries = 3, delay = 1000) {
      for (let i = 0; i < maxRetries; i++) {
        try {
          await page.click('#load-data');
          
          // 嘗試等待結果
          await page.waitForSelector('.result:has-text("資料載入完成")', {
            timeout: 5000
          });
          
          return true;
        } catch (error) {
          if (i === maxRetries - 1) {
            throw new Error(`載入失敗，已重試 ${maxRetries} 次`);
          }
          
          console.log(`第 ${i + 1} 次嘗試失敗，${delay}ms 後重試...`);
          await page.reload();
          await page.waitForTimeout(delay);
        }
      }
    }
    
    await waitForDataWithRetry();
    
    const result = await page.textContent('.result');
    expect(result).toBe('資料載入完成');
  });
});

/**
 * 進階時序處理技巧
 */
test.describe('進階時序處理', () => {
  
  // 處理多步驟非同步流程
  test('處理多步驟非同步流程', async ({ page }) => {
    await page.goto('http://localhost:3000/multi-step-async');
    
    // 步驟 1：初始化
    await page.click('#start-process');
    await page.waitForSelector('.step-1-indicator.active');
    
    // 步驟 2：等待第一步完成
    await page.waitForSelector('.step-1-indicator.completed', {
      timeout: 15000
    });
    
    // 步驟 3：等待第二步開始並完成
    await page.waitForSelector('.step-2-indicator.active');
    await page.waitForSelector('.step-2-indicator.completed', {
      timeout: 15000
    });
    
    // 步驟 4：等待第三步完成
    await page.waitForSelector('.step-3-indicator.completed', {
      timeout: 15000
    });
    
    // 驗證所有步驟完成
    const finalStatus = await page.textContent('.process-status');
    expect(finalStatus).toBe('流程完成');
    
    // 驗證每個步驟的結果
    const step1Result = await page.getAttribute('.step-1-indicator', 'data-result');
    const step2Result = await page.getAttribute('.step-2-indicator', 'data-result');
    const step3Result = await page.getAttribute('.step-3-indicator', 'data-result');
    
    expect(step1Result).toBe('success');
    expect(step2Result).toBe('success');
    expect(step3Result).toBe('success');
  });
  
  // 處理動態內容載入
  test('處理無限滾動載入', async ({ page }) => {
    await page.goto('http://localhost:3000/infinite-scroll');
    
    // 初始載入
    await page.waitForSelector('.item');
    
    // 滾動載入更多內容
    let previousCount = 0;
    let currentCount = await page.locator('.item').count();
    
    while (currentCount < 50) { // 載入至少 50 個項目
      // 滾動到底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // 等待新內容載入
      await page.waitForFunction(
        (prevCount) => {
          const items = document.querySelectorAll('.item');
          return items.length > prevCount;
        },
        previousCount,
        { timeout: 5000 }
      );
      
      previousCount = currentCount;
      currentCount = await page.locator('.item').count();
      
      console.log(`已載入 ${currentCount} 個項目`);
    }
    
    expect(currentCount).toBeGreaterThanOrEqual(50);
  });
  
  // 處理輪詢更新
  test('處理即時資料更新', async ({ page }) => {
    await page.goto('http://localhost:3000/real-time-updates');
    
    // 開始監聽更新
    await page.click('#start-updates');
    
    // 等待特定更新出現
    await page.waitForFunction(
      () => {
        const updates = document.querySelectorAll('.update-item');
        // 檢查是否有包含特定內容的更新
        return Array.from(updates).some(item => 
          item.textContent.includes('重要更新')
        );
      },
      {},
      { timeout: 30000, polling: 500 } // 每 500ms 檢查一次
    );
    
    // 驗證更新內容
    const importantUpdate = await page.locator('.update-item:has-text("重要更新")').first();
    await expect(importantUpdate).toBeVisible();
    
    // 停止更新
    await page.click('#stop-updates');
  });
});

/**
 * 時序問題診斷工具
 */
class TimingDebugger {
  constructor(page) {
    this.page = page;
    this.timeline = [];
  }
  
  // 記錄時間點
  mark(label) {
    this.timeline.push({
      label,
      timestamp: Date.now(),
      elapsed: this.timeline.length > 0 
        ? Date.now() - this.timeline[0].timestamp 
        : 0
    });
  }
  
  // 等待並記錄
  async waitAndMark(selector, label) {
    const startTime = Date.now();
    
    try {
      await this.page.waitForSelector(selector, { timeout: 30000 });
      const duration = Date.now() - startTime;
      
      this.mark(`${label} (耗時: ${duration}ms)`);
      return true;
    } catch (error) {
      this.mark(`${label} (失敗)`);
      throw error;
    }
  }
  
  // 生成時序報告
  generateReport() {
    console.log('\n=== 時序分析報告 ===');
    
    this.timeline.forEach((entry, index) => {
      const deltaTime = index > 0 
        ? entry.elapsed - this.timeline[index - 1].elapsed
        : 0;
      
      console.log(
        `[${entry.elapsed}ms] ${entry.label}` +
        (deltaTime > 0 ? ` (+${deltaTime}ms)` : '')
      );
    });
    
    const totalTime = this.timeline[this.timeline.length - 1].elapsed;
    console.log(`\n總耗時: ${totalTime}ms`);
    
    // 找出瓶頸
    const bottlenecks = this.timeline.filter((entry, index) => {
      if (index === 0) return false;
      const deltaTime = entry.elapsed - this.timeline[index - 1].elapsed;
      return deltaTime > 1000; // 超過 1 秒的步驟
    });
    
    if (bottlenecks.length > 0) {
      console.log('\n發現潛在瓶頸:');
      bottlenecks.forEach(b => console.log(`  - ${b.label}`));
    }
  }
}

// 使用時序診斷工具的範例
test('使用時序診斷工具', async ({ page }) => {
  const debugger = new TimingDebugger(page);
  
  debugger.mark('測試開始');
  
  await page.goto('http://localhost:3000/complex-flow');
  debugger.mark('頁面載入完成');
  
  await debugger.waitAndMark('#init-button', '初始化按鈕出現');
  await page.click('#init-button');
  debugger.mark('點擊初始化按鈕');
  
  await debugger.waitAndMark('.loading-complete', '載入完成指示器');
  await debugger.waitAndMark('.data-table', '資料表格顯示');
  
  const rowCount = await page.locator('.data-table tr').count();
  debugger.mark(`資料載入完成 (${rowCount} 筆)`);
  
  // 生成診斷報告
  debugger.generateReport();
  
  expect(rowCount).toBeGreaterThan(0);
});

module.exports = {
  TimingDebugger
};