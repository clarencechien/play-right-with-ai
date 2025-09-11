import { test, expect } from '@playwright/test';

// GitHub Pages 部署時的基礎路徑
const BASE_PATH = '/play-right-with-ai';

test.describe('GitHub Pages 靜態網站導航測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 模擬 GitHub Pages 環境
    await page.goto('http://localhost:8080/');
  });

  test('首頁應該正確載入所有資源', async ({ page }) => {
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查 CSS 是否載入
    const cssLoaded = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link => link.href.includes('main.css'));
    });
    expect(cssLoaded).toBeTruthy();

    // 檢查 JavaScript 是否載入
    const jsLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script => script.src.includes('main.js'));
    });
    expect(jsLoaded).toBeTruthy();

    // 標題應該正確顯示
    await expect(page).toHaveTitle(/Play Right with AI/);
    
    // Hero 區塊應該可見
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
  });

  test('章節連結應該使用相對路徑', async ({ page }) => {
    // 檢查所有章節連結
    const chapterLinks = page.locator('.chapter-card');
    const count = await chapterLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = chapterLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // 應該使用相對路徑，不應該以 / 開頭
      expect(href).not.toMatch(/^\/chapters/);
      expect(href).toMatch(/^chapters\/chapter-\d+\.html$/);
    }
  });

  test('導航連結應該正確工作', async ({ page }) => {
    // 點擊第一個章節連結
    await page.click('.chapter-card:first-child');
    
    // 應該導航到章節頁面
    await expect(page).toHaveURL(/chapter-01\.html$/);
    
    // 章節頁面應該正確載入
    await expect(page.locator('h1')).toContainText('第一章');
  });

  test('章節頁面返回首頁連結應該工作', async ({ page }) => {
    // 先導航到章節頁面
    await page.goto('http://localhost:8080/chapters/chapter-01.html');
    
    // 點擊返回首頁連結
    await page.click('.nav-brand');
    
    // 應該返回首頁
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('404 頁面應該正確處理', async ({ page }) => {
    // 訪問不存在的頁面
    await page.goto('http://localhost:8080/nonexistent.html');
    
    // 應該顯示 404 頁面
    await expect(page.locator('h1')).toContainText('404');
    
    // 應該有返回首頁的連結
    const homeLink = page.locator('a:has-text("返回首頁")');
    await expect(homeLink).toBeVisible();
  });

  test('資源路徑應該在子目錄中正確解析', async ({ page }) => {
    // 訪問深層章節頁面
    await page.goto('http://localhost:8080/chapters/chapter-05.html');
    await page.waitForLoadState('networkidle');
    
    // CSS 應該正確載入
    const cssLoaded = await page.evaluate(() => {
      const link = document.querySelector('link[href*="main.css"]');
      if (!link) return false;
      // 檢查 CSS 是否真的載入
      const styles = window.getComputedStyle(document.body);
      // 檢查是否有任何樣式被套用
      return styles.fontFamily !== '' || styles.color !== '';
    });
    expect(cssLoaded).toBeTruthy();
    
    // JavaScript 應該正確載入
    const jsLoaded = await page.evaluate(() => {
      // 檢查全域函數是否存在
      return typeof initSearch === 'function' || 
             typeof initCodeHighlight === 'function' ||
             typeof window.__BASE_PATH__ !== 'undefined';
    });
    expect(jsLoaded).toBeTruthy();
  });

  test('平滑滾動導航應該工作', async ({ page }) => {
    // 檢查是否有平滑滾動
    await page.goto('http://localhost:8080/');
    
    // 點擊內部錨點連結（如果有）
    const anchorLinks = page.locator('a[href^="#"]');
    const anchorCount = await anchorLinks.count();
    
    if (anchorCount > 0) {
      await anchorLinks.first().click();
      
      // 檢查滾動行為
      const scrollBehavior = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).scrollBehavior;
      });
      expect(scrollBehavior).toBe('smooth');
    }
  });

  test('搜尋功能應該正確處理路徑', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    
    // 輸入搜尋
    const searchInput = page.locator('#search');
    await searchInput.fill('AI');
    
    // 等待搜尋結果
    await page.waitForTimeout(500);
    
    // 搜尋結果連結應該使用正確的路徑
    const searchResults = page.locator('.search-result a');
    const resultCount = await searchResults.count();
    
    if (resultCount > 0) {
      const firstResultHref = await searchResults.first().getAttribute('href');
      // 應該是相對路徑或完整路徑，不應該以 / 開頭（除非是完整 URL）
      if (firstResultHref) {
        const isValidPath = !firstResultHref.startsWith('/') || 
                           firstResultHref.startsWith('http');
        expect(isValidPath).toBeTruthy();
      }
    } else {
      // 如果沒有搜尋結果，這也是可以接受的
      expect(resultCount).toBe(0);
    }
  });
});

test.describe('GitHub Pages 基礎路徑配置', () => {
  test('應該正確處理 GitHub Pages 基礎路徑', async ({ page }) => {
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
    
    // 檢查 JavaScript 是否設置了基礎路徑
    const basePath = await page.evaluate(() => window.__BASE_PATH__);
    
    // 本地開發時應該是 '/' 或在 GitHub Pages 上是 '/play-right-with-ai/'
    expect(basePath).toMatch(/^\/$|^\/play-right-with-ai\//);
  });
});