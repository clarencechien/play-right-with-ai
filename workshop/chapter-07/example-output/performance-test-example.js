// 性能測試完整實作範例
// Performance Testing Complete Implementation

const { test, expect } = require('@playwright/test');
const { performance } = require('perf_hooks');

test.describe('電商網站性能測試', () => {
  // 測試配置
  test.use({
    viewport: { width: 1920, height: 1080 },
    video: 'retain-on-failure',
    trace: 'on'
  });

  test.beforeAll(async () => {
    console.log('開始性能測試套件...');
  });

  test.beforeEach(async ({ page }) => {
    // 啟用性能監控
    await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();
    
    // 監聽控制台訊息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  test('首頁載入性能基準測試', async ({ page }) => {
    const metrics = {
      startTime: performance.now(),
      resources: [],
      navigationTiming: null,
      memoryUsage: null
    };

    // 監控資源載入
    page.on('response', response => {
      metrics.resources.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        timing: response.timing()
      });
    });

    // 導航到首頁
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });

    metrics.loadTime = performance.now() - metrics.startTime;

    // 收集導航時間指標
    metrics.navigationTiming = await page.evaluate(([performance]) => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        timeToFirstByte: perfData.responseStart - perfData.requestStart,
        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcpConnection: perfData.connectEnd - perfData.connectStart
      };
    }, [performance]);

    // 收集 Web Vitals
    const webVitals = await page.evaluate(([performance]) => {
      return new Promise((resolve) => {
        let metrics = {};
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) metrics.FCP = fcp.startTime;
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.LCP = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (模擬)
        metrics.FID = 0; // 需要實際用戶互動
        
        // Cumulative Layout Shift
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          metrics.CLS = cls;
        }).observe({ entryTypes: ['layout-shift'] });
        
        // 等待一段時間收集指標
        setTimeout(() => resolve(metrics), 2000);
      });
    }, [performance]);

    // 記憶體使用情況
    metrics.memoryUsage = await page.evaluate(([performance, performance, performance, performance]) => {
      if (performance.memory) {
        return {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        };
      }
      return null;
    }, [performance, performance, performance, performance]);

    // 性能斷言
    expect(metrics.loadTime).toBeLessThan(3000); // 頁面載入時間小於 3 秒
    expect(metrics.navigationTiming.domContentLoaded).toBeLessThan(1500); // DOM 載入小於 1.5 秒
    expect(webVitals.FCP).toBeLessThan(1800); // FCP 小於 1.8 秒
    expect(webVitals.LCP).toBeLessThan(2500); // LCP 小於 2.5 秒
    expect(webVitals.CLS).toBeLessThan(0.1); // CLS 小於 0.1

    // 輸出性能報告
    console.log('=== 性能測試結果 ===');
    console.log(`頁面載入時間: ${metrics.loadTime.toFixed(2)}ms`);
    console.log(`DOM Content Loaded: ${metrics.navigationTiming.domContentLoaded.toFixed(2)}ms`);
    console.log(`Time to First Byte: ${metrics.navigationTiming.timeToFirstByte.toFixed(2)}ms`);
    console.log('\n=== Web Vitals ===');
    console.log(`FCP: ${webVitals.FCP?.toFixed(2)}ms`);
    console.log(`LCP: ${webVitals.LCP?.toFixed(2)}ms`);
    console.log(`CLS: ${webVitals.CLS?.toFixed(4)}`);
    console.log('\n=== 記憶體使用 ===');
    console.log(metrics.memoryUsage);
  });

  test('搜尋功能性能測試', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 測量搜尋操作的執行時間
    const searchPerformance = await page.evaluate(async ([performance, performance]) => {
      const searchInput = document.querySelector('#search-input');
      const searchButton = document.querySelector('#search-button');
      
      const measurements = [];
      const searchTerms = ['產品A', '特價商品', '最新上架', '熱門推薦'];
      
      for (const term of searchTerms) {
        const startTime = performance.now();
        
        // 輸入搜尋詞
        searchInput.value = term;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 點擊搜尋
        searchButton.click();
        
        // 等待結果載入
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const endTime = performance.now();
        measurements.push({
          term,
          duration: endTime - startTime
        });
      }
      
      return measurements;
    }, [performance, performance]);

    // 驗證搜尋性能
    for (const measurement of searchPerformance) {
      expect(measurement.duration).toBeLessThan(1000); // 每次搜尋小於 1 秒
      console.log(`搜尋 "${measurement.term}": ${measurement.duration.toFixed(2)}ms`);
    }
  });

  test('購物車操作性能測試', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    
    const cartOperations = [];
    
    // 測試添加多個商品到購物車
    for (let i = 1; i <= 10; i++) {
      const startTime = performance.now();
      
      await page.click(`[data-testid="add-to-cart-${i}"]`);
      await page.waitForSelector('[data-testid="cart-count"]', {
        state: 'visible',
        timeout: 2000
      });
      
      const duration = performance.now() - startTime;
      cartOperations.push({
        operation: `添加商品 ${i}`,
        duration
      });
      
      // 驗證購物車數量更新
      const cartCount = await page.textContent('[data-testid="cart-count"]');
      expect(parseInt(cartCount)).toBe(i);
    }
    
    // 分析操作性能
    const avgDuration = cartOperations.reduce((sum, op) => sum + op.duration, 0) / cartOperations.length;
    console.log(`平均添加商品時間: ${avgDuration.toFixed(2)}ms`);
    
    // 性能斷言
    expect(avgDuration).toBeLessThan(500); // 平均操作時間小於 500ms
    
    // 測試購物車頁面載入
    const cartLoadStart = performance.now();
    await page.goto('http://localhost:3000/cart');
    await page.waitForSelector('[data-testid="cart-items"]');
    const cartLoadTime = performance.now() - cartLoadStart;
    
    console.log(`購物車頁面載入時間: ${cartLoadTime.toFixed(2)}ms`);
    expect(cartLoadTime).toBeLessThan(2000); // 購物車頁面載入小於 2 秒
  });

  test('捲動性能測試', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    
    // 測量捲動流暢度
    const scrollMetrics = await page.evaluate(async ([performance, performance, performance, performance]) => {
      const metrics = {
        totalScrollTime: 0,
        frameDrops: 0,
        smoothness: 100
      };
      
      let lastTime = performance.now();
      let frameCount = 0;
      
      // 監控 frame drops
      const measureFrames = () => {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta > 16.67) { // 60fps = 16.67ms per frame
          metrics.frameDrops++;
        }
        
        frameCount++;
        lastTime = currentTime;
        
        if (frameCount < 300) { // 監控 5 秒
          requestAnimationFrame(measureFrames);
        }
      };
      
      requestAnimationFrame(measureFrames);
      
      // 執行捲動
      const startScroll = performance.now();
      
      // 平滑捲動到底部
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 捲動回頂部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      metrics.totalScrollTime = performance.now() - startScroll;
      metrics.smoothness = 100 - (metrics.frameDrops / frameCount * 100);
      
      return metrics;
    }, [performance, performance, performance, performance]);
    
    console.log('=== 捲動性能指標 ===');
    console.log(`總捲動時間: ${scrollMetrics.totalScrollTime.toFixed(2)}ms`);
    console.log(`Frame drops: ${scrollMetrics.frameDrops}`);
    console.log(`流暢度: ${scrollMetrics.smoothness.toFixed(2)}%`);
    
    // 性能斷言
    expect(scrollMetrics.smoothness).toBeGreaterThan(90); // 流暢度大於 90%
  });

  test('網路條件下的性能測試', async ({ page, context }) => {
    // 模擬 3G 網路
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8,          // 750 Kbps
      latency: 40 // 40ms
    });
    
    const startTime = performance.now();
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });
    const loadTime3G = performance.now() - startTime;
    
    // 恢復正常網路
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
    
    const normalStart = performance.now();
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });
    const loadTimeNormal = performance.now() - normalStart;
    
    console.log('=== 網路條件比較 ===');
    console.log(`3G 網路載入時間: ${loadTime3G.toFixed(2)}ms`);
    console.log(`正常網路載入時間: ${loadTimeNormal.toFixed(2)}ms`);
    console.log(`差異: ${(loadTime3G - loadTimeNormal).toFixed(2)}ms`);
    
    // 3G 網路下仍應在合理時間內載入
    expect(loadTime3G).toBeLessThan(10000); // 10 秒內載入
  });

  test('資源優化檢查', async ({ page }) => {
    const resourceMetrics = {
      images: [],
      scripts: [],
      stylesheets: [],
      totalSize: 0
    };
    
    page.on('response', response => {
      const url = response.url();
      const headers = response.headers();
      const size = parseInt(headers['content-length'] || 0);
      const contentType = headers['content-type'] || '';
      
      resourceMetrics.totalSize += size;
      
      if (contentType.includes('image')) {
        resourceMetrics.images.push({ url, size });
      } else if (contentType.includes('javascript')) {
        resourceMetrics.scripts.push({ url, size });
      } else if (contentType.includes('css')) {
        resourceMetrics.stylesheets.push({ url, size });
      }
    });
    
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle'
    });
    
    // 分析資源
    console.log('=== 資源分析 ===');
    console.log(`總資源大小: ${(resourceMetrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`圖片數量: ${resourceMetrics.images.length}`);
    console.log(`腳本數量: ${resourceMetrics.scripts.length}`);
    console.log(`樣式表數量: ${resourceMetrics.stylesheets.length}`);
    
    // 找出最大的資源
    const allResources = [
      ...resourceMetrics.images,
      ...resourceMetrics.scripts,
      ...resourceMetrics.stylesheets
    ].sort((a, b) => b.size - a.size);
    
    console.log('\n=== 最大的 5 個資源 ===');
    allResources.slice(0, 5).forEach(resource => {
      console.log(`${(resource.size / 1024).toFixed(2)} KB - ${resource.url.split('/').pop()}`);
    });
    
    // 優化建議
    const largeImages = resourceMetrics.images.filter(img => img.size > 200 * 1024);
    if (largeImages.length > 0) {
      console.log(`\n⚠️ 發現 ${largeImages.length} 個超過 200KB 的圖片，建議優化`);
    }
    
    // 性能斷言
    expect(resourceMetrics.totalSize).toBeLessThan(5 * 1024 * 1024); // 總大小小於 5MB
    expect(resourceMetrics.images.length).toBeLessThan(50); // 圖片數量小於 50
  });

  test.afterEach(async ({ page }) => {
    // 收集覆蓋率報告
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);
    
    // 計算未使用的程式碼
    let totalBytes = 0;
    let usedBytes = 0;
    
    for (const entry of jsCoverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start;
      }
    }
    
    const jsUsage = (usedBytes / totalBytes) * 100;
    console.log(`JavaScript 使用率: ${jsUsage.toFixed(2)}%`);
  });
});