import { test, expect } from '@playwright/test';

/**
 * 性能和負載測試套件
 * 測試工作坊在不同負載下的性能表現
 */
test.describe('性能負載測試', () => {
  test('單頁面載入性能', async ({ page }) => {
    const metrics = [];
    const pages = [
      '/',
      '/workshop',
      '/workshop/chapter-01',
      '/workshop/chapter-04',
      '/apps/todo'
    ];
    
    for (const url of pages) {
      await test.step(`測試 ${url} 載入性能`, async () => {
        const startTime = Date.now();
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // 收集性能指標
        const performanceMetrics = await page.evaluate(() => {
          const timing = performance.timing;
          const paint = performance.getEntriesByType('paint');
          
          return {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            responseTime: timing.responseEnd - timing.requestStart,
            domInteractive: timing.domInteractive - timing.navigationStart
          };
        });
        
        metrics.push({
          url,
          loadTime,
          ...performanceMetrics
        });
        
        // 性能斷言
        expect(loadTime).toBeLessThan(5000); // 5秒內完成載入
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000); // FCP < 2秒
        expect(performanceMetrics.domInteractive).toBeLessThan(3000); // 可互動時間 < 3秒
      });
    }
    
    // 輸出性能報告
    console.table(metrics);
    
    // 計算平均值
    const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
    const avgFCP = metrics.reduce((sum, m) => sum + m.firstContentfulPaint, 0) / metrics.length;
    
    console.log(`平均載入時間: ${avgLoadTime}ms`);
    console.log(`平均 FCP: ${avgFCP}ms`);
    
    expect(avgLoadTime).toBeLessThan(4000);
    expect(avgFCP).toBeLessThan(1500);
  });

  test('並發用戶模擬', async ({ browser }) => {
    const userCount = 5;
    const contexts = [];
    const results = [];
    
    // 創建多個用戶上下文
    for (let i = 0; i < userCount; i++) {
      const context = await browser.newContext();
      contexts.push(context);
    }
    
    // 並發訪問
    const promises = contexts.map(async (context, index) => {
      const page = await context.newPage();
      const startTime = Date.now();
      
      try {
        await page.goto('/workshop/chapter-04');
        await page.waitForLoadState('networkidle');
        
        // 模擬用戶操作
        await page.click('text=/test|測試/i').catch(() => {});
        await page.waitForTimeout(500);
        
        const endTime = Date.now();
        results.push({
          user: index + 1,
          loadTime: endTime - startTime,
          success: true
        });
      } catch (error) {
        results.push({
          user: index + 1,
          loadTime: Date.now() - startTime,
          success: false,
          error: error.message
        });
      } finally {
        await page.close();
      }
    });
    
    await Promise.all(promises);
    
    // 清理
    for (const context of contexts) {
      await context.close();
    }
    
    // 分析結果
    const successCount = results.filter(r => r.success).length;
    const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
    
    console.table(results);
    console.log(`成功率: ${(successCount / userCount) * 100}%`);
    console.log(`平均響應時間: ${avgLoadTime}ms`);
    
    expect(successCount).toBe(userCount); // 所有用戶都應該成功
    expect(avgLoadTime).toBeLessThan(6000); // 平均響應時間 < 6秒
  });

  test('資源載入優化檢查', async ({ page }) => {
    await page.goto('/workshop');
    
    // 收集所有資源
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        type: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize || 0,
        cached: resource.transferSize === 0 && resource.decodedBodySize > 0
      }));
    });
    
    // 分析資源
    const largeResources = resources.filter(r => r.size > 500000); // > 500KB
    const slowResources = resources.filter(r => r.duration > 1000); // > 1秒
    
    console.log(`大型資源 (>500KB): ${largeResources.length}`);
    console.log(`慢速資源 (>1s): ${slowResources.length}`);
    
    if (largeResources.length > 0) {
      console.table(largeResources);
    }
    
    if (slowResources.length > 0) {
      console.table(slowResources);
    }
    
    // 檢查是否有優化
    const cachedResources = resources.filter(r => r.cached);
    const cacheRate = (cachedResources.length / resources.length) * 100;
    
    console.log(`快取命中率: ${cacheRate.toFixed(2)}%`);
    
    // 性能建議
    expect(largeResources.length).toBeLessThanOrEqual(5); // 限制大文件數量
    expect(slowResources.length).toBeLessThanOrEqual(3); // 限制慢速資源
  });

  test('記憶體使用監控', async ({ page }) => {
    const memorySnapshots = [];
    
    // 導航到不同頁面並收集記憶體使用
    const pages = [
      '/workshop/chapter-01',
      '/workshop/chapter-02',
      '/workshop/chapter-03',
      '/workshop/chapter-04'
    ];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // 收集記憶體使用情況
      const memory = await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memory) {
        memorySnapshots.push({
          url,
          usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
          usage: ((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100).toFixed(2) + '%'
        });
      }
    }
    
    if (memorySnapshots.length > 0) {
      console.table(memorySnapshots);
      
      // 檢查記憶體洩漏
      const firstUsage = parseFloat(memorySnapshots[0].usedMB);
      const lastUsage = parseFloat(memorySnapshots[memorySnapshots.length - 1].usedMB);
      const increase = lastUsage - firstUsage;
      
      console.log(`記憶體增長: ${increase.toFixed(2)}MB`);
      
      // 合理的記憶體增長應該小於 50MB
      expect(increase).toBeLessThan(50);
    }
  });

  test('網路請求優化', async ({ page }) => {
    const requests = [];
    
    // 監聽所有請求
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });
    
    await page.goto('/workshop/chapter-04');
    await page.waitForLoadState('networkidle');
    
    // 分析請求
    const apiRequests = requests.filter(r => r.url.includes('/api/'));
    const imageRequests = requests.filter(r => r.resourceType === 'image');
    const scriptRequests = requests.filter(r => r.resourceType === 'script');
    const styleRequests = requests.filter(r => r.resourceType === 'stylesheet');
    
    console.log(`總請求數: ${requests.length}`);
    console.log(`API 請求: ${apiRequests.length}`);
    console.log(`圖片請求: ${imageRequests.length}`);
    console.log(`腳本請求: ${scriptRequests.length}`);
    console.log(`樣式請求: ${styleRequests.length}`);
    
    // 檢查是否有過多請求
    expect(requests.length).toBeLessThan(100); // 總請求數應該合理
    expect(apiRequests.length).toBeLessThan(20); // API 請求不應過多
    
    // 檢查是否有重複請求
    const uniqueUrls = new Set(requests.map(r => r.url));
    const duplicates = requests.length - uniqueUrls.size;
    
    console.log(`重複請求: ${duplicates}`);
    expect(duplicates).toBeLessThan(10); // 重複請求應該最少
  });

  test('CPU 使用率監控', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 開始性能追蹤
    await page.evaluate(() => {
      performance.mark('test-start');
    });
    
    // 執行一些互動操作
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      await buttons.nth(i).click().catch(() => {});
      await page.waitForTimeout(100);
    }
    
    // 結束性能追蹤
    await page.evaluate(() => {
      performance.mark('test-end');
      performance.measure('test-duration', 'test-start', 'test-end');
    });
    
    // 獲取測量結果
    const measurements = await page.evaluate(() => {
      const measure = performance.getEntriesByType('measure')[0];
      return {
        duration: measure.duration,
        entryType: measure.entryType,
        name: measure.name
      };
    });
    
    console.log(`測試持續時間: ${measurements.duration}ms`);
    
    // 檢查是否有長時間任務
    const longTasks = await page.evaluate(() => {
      return performance.getEntriesByType('longtask' as any).length;
    });
    
    console.log(`長時間任務數: ${longTasks}`);
    expect(longTasks).toBeLessThanOrEqual(2); // 長時間任務應該很少
  });

  test('漸進式網頁應用 (PWA) 檢查', async ({ page }) => {
    await page.goto('/');
    
    // 檢查 Service Worker
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    // 檢查 manifest
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });
    
    // 檢查 HTTPS
    const isSecure = await page.evaluate(() => {
      return location.protocol === 'https:' || location.hostname === 'localhost';
    });
    
    console.log(`Service Worker 支援: ${hasServiceWorker}`);
    console.log(`Manifest 文件: ${manifest}`);
    console.log(`安全連接: ${isSecure}`);
    
    // 檢查離線功能
    if (hasServiceWorker) {
      await page.context().setOffline(true);
      
      try {
        await page.reload();
        const title = await page.title();
        console.log(`離線模式標題: ${title}`);
        // 如果能載入，說明有離線支援
      } catch (error) {
        console.log('離線模式不支援');
      }
      
      await page.context().setOffline(false);
    }
  });

  test('滾動性能測試', async ({ page }) => {
    await page.goto('/workshop/chapter-04');
    
    // 測量滾動性能
    const scrollMetrics = await page.evaluate(async () => {
      const metrics = {
        scrolls: 0,
        totalTime: 0,
        jank: 0
      };
      
      const startTime = performance.now();
      
      // 模擬滾動
      for (let i = 0; i < 10; i++) {
        const scrollStart = performance.now();
        window.scrollBy(0, 300);
        await new Promise(resolve => requestAnimationFrame(resolve));
        const scrollEnd = performance.now();
        
        const scrollTime = scrollEnd - scrollStart;
        metrics.scrolls++;
        metrics.totalTime += scrollTime;
        
        // 檢測卡頓 (>50ms 視為卡頓)
        if (scrollTime > 50) {
          metrics.jank++;
        }
      }
      
      // 滾動回頂部
      window.scrollTo(0, 0);
      
      return {
        ...metrics,
        avgTime: metrics.totalTime / metrics.scrolls,
        jankRate: (metrics.jank / metrics.scrolls) * 100
      };
    });
    
    console.log(`平均滾動時間: ${scrollMetrics.avgTime.toFixed(2)}ms`);
    console.log(`卡頓率: ${scrollMetrics.jankRate.toFixed(2)}%`);
    
    expect(scrollMetrics.avgTime).toBeLessThan(30); // 平均滾動時間 < 30ms
    expect(scrollMetrics.jankRate).toBeLessThan(20); // 卡頓率 < 20%
  });
});