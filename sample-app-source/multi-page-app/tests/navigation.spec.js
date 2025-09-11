/**
 * 多頁面應用程式導航測試
 * 測試頁面路由、狀態管理和使用者流程
 */

const { test, expect } = require('@playwright/test');

test.describe('多頁面應用程式導航', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + __dirname + '/../src/index.html');
  });

  test.describe('基本導航', () => {
    test('應該顯示首頁', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('歡迎來到多頁面應用');
      await expect(page.locator('[data-page="home"]')).toBeVisible();
    });

    test('應該有導航選單', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      const links = await nav.locator('a').allTextContents();
      expect(links).toContain('首頁');
      expect(links).toContain('關於');
      expect(links).toContain('產品');
      expect(links).toContain('聯絡');
    });

    test('應該能導航到關於頁面', async ({ page }) => {
      await page.click('[data-nav="about"]');
      await expect(page.locator('[data-page="about"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('關於我們');
    });

    test('應該能導航到產品頁面', async ({ page }) => {
      await page.click('[data-nav="products"]');
      await expect(page.locator('[data-page="products"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('產品列表');
    });

    test('應該能導航到聯絡頁面', async ({ page }) => {
      await page.click('[data-nav="contact"]');
      await expect(page.locator('[data-page="contact"]')).toBeVisible();
      await expect(page.locator('h2')).toContainText('聯絡我們');
    });
  });

  test.describe('URL 路由', () => {
    test('應該更新 URL hash', async ({ page }) => {
      await page.click('[data-nav="about"]');
      expect(page.url()).toContain('#about');
      
      await page.click('[data-nav="products"]');
      expect(page.url()).toContain('#products');
    });

    test('應該支援瀏覽器返回按鈕', async ({ page }) => {
      await page.click('[data-nav="about"]');
      await page.click('[data-nav="products"]');
      
      await page.goBack();
      await expect(page.locator('[data-page="about"]')).toBeVisible();
      
      await page.goBack();
      await expect(page.locator('[data-page="home"]')).toBeVisible();
    });

    test('應該支援瀏覽器前進按鈕', async ({ page }) => {
      await page.click('[data-nav="about"]');
      await page.goBack();
      await page.goForward();
      
      await expect(page.locator('[data-page="about"]')).toBeVisible();
    });

    test('應該支援直接 URL 訪問', async ({ page }) => {
      await page.goto('file://' + __dirname + '/../src/index.html#products');
      await expect(page.locator('[data-page="products"]')).toBeVisible();
    });
  });

  test.describe('導航狀態', () => {
    test('應該高亮當前頁面連結', async ({ page }) => {
      await page.click('[data-nav="about"]');
      const aboutLink = page.locator('[data-nav="about"]');
      await expect(aboutLink).toHaveClass(/active/);
      
      const homeLink = page.locator('[data-nav="home"]');
      await expect(homeLink).not.toHaveClass(/active/);
    });

    test('應該顯示麵包屑導航', async ({ page }) => {
      await page.click('[data-nav="products"]');
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      await expect(breadcrumb).toContainText('首頁');
      await expect(breadcrumb).toContainText('產品');
    });

    test('應該更新頁面標題', async ({ page }) => {
      await page.click('[data-nav="about"]');
      await expect(page).toHaveTitle(/關於我們/);
      
      await page.click('[data-nav="products"]');
      await expect(page).toHaveTitle(/產品列表/);
    });
  });

  test.describe('產品頁面功能', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-nav="products"]');
    });

    test('應該顯示產品列表', async ({ page }) => {
      const products = page.locator('[data-testid="product-item"]');
      await expect(products).toHaveCount(6); // 預設6個產品
    });

    test('應該能搜尋產品', async ({ page }) => {
      const searchInput = page.locator('[data-testid="product-search"]');
      await searchInput.fill('筆記型電腦');
      
      const products = page.locator('[data-testid="product-item"]:visible');
      await expect(products).toHaveCount(1);
    });

    test('應該能按類別篩選', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.selectOption('電子產品');
      
      const products = page.locator('[data-testid="product-item"]:visible');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    test('應該能查看產品詳情', async ({ page }) => {
      await page.click('[data-testid="product-item"]:first-child [data-testid="view-details"]');
      await expect(page.locator('[data-testid="product-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    });

    test('應該能關閉產品詳情', async ({ page }) => {
      await page.click('[data-testid="product-item"]:first-child [data-testid="view-details"]');
      await page.click('[data-testid="close-modal"]');
      await expect(page.locator('[data-testid="product-modal"]')).toBeHidden();
    });
  });

  test.describe('聯絡表單', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-nav="contact"]');
    });

    test('應該顯示聯絡表單', async ({ page }) => {
      await expect(page.locator('[data-testid="contact-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    });

    test('應該驗證必填欄位', async ({ page }) => {
      await page.click('[data-testid="submit-button"]');
      
      const nameError = page.locator('[data-testid="name-error"]');
      const emailError = page.locator('[data-testid="email-error"]');
      const messageError = page.locator('[data-testid="message-error"]');
      
      await expect(nameError).toBeVisible();
      await expect(emailError).toBeVisible();
      await expect(messageError).toBeVisible();
    });

    test('應該驗證 email 格式', async ({ page }) => {
      await page.fill('[data-testid="name-input"]', '測試使用者');
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="message-input"]', '測試訊息');
      
      await page.click('[data-testid="submit-button"]');
      
      const emailError = page.locator('[data-testid="email-error"]');
      await expect(emailError).toContainText('請輸入有效的 email');
    });

    test('應該能成功提交表單', async ({ page }) => {
      await page.fill('[data-testid="name-input"]', '測試使用者');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="message-input"]', '這是測試訊息');
      
      await page.click('[data-testid="submit-button"]');
      
      const successMessage = page.locator('[data-testid="success-message"]');
      await expect(successMessage).toBeVisible();
      await expect(successMessage).toContainText('感謝您的訊息');
    });

    test('提交後應該清空表單', async ({ page }) => {
      await page.fill('[data-testid="name-input"]', '測試使用者');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="message-input"]', '測試訊息');
      
      await page.click('[data-testid="submit-button"]');
      
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('');
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue('');
      await expect(page.locator('[data-testid="message-input"]')).toHaveValue('');
    });
  });

  test.describe('狀態管理', () => {
    test('應該保持表單資料在頁面切換時', async ({ page }) => {
      await page.click('[data-nav="contact"]');
      await page.fill('[data-testid="name-input"]', '測試使用者');
      
      await page.click('[data-nav="about"]');
      await page.click('[data-nav="contact"]');
      
      await expect(page.locator('[data-testid="name-input"]')).toHaveValue('測試使用者');
    });

    test('應該記住產品篩選狀態', async ({ page }) => {
      await page.click('[data-nav="products"]');
      await page.locator('[data-testid="category-filter"]').selectOption('電子產品');
      
      await page.click('[data-nav="home"]');
      await page.click('[data-nav="products"]');
      
      const filter = page.locator('[data-testid="category-filter"]');
      await expect(filter).toHaveValue('電子產品');
    });
  });

  test.describe('響應式設計', () => {
    test('應該在行動裝置顯示漢堡選單', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const hamburger = page.locator('[data-testid="hamburger-menu"]');
      await expect(hamburger).toBeVisible();
      
      const nav = page.locator('nav');
      await expect(nav).toBeHidden();
    });

    test('應該能開啟行動版選單', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="hamburger-menu"]');
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('點擊連結後應該關閉行動版選單', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="hamburger-menu"]');
      await page.click('[data-nav="about"]');
      
      const nav = page.locator('nav');
      await expect(nav).toBeHidden();
    });
  });

  test.describe('無障礙功能', () => {
    test('應該支援鍵盤導航', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      await expect(page.locator('[data-page="about"]')).toBeVisible();
    });

    test('應該有適當的 ARIA 標籤', async ({ page }) => {
      const nav = page.locator('nav');
      await expect(nav).toHaveAttribute('role', 'navigation');
      
      const main = page.locator('main');
      await expect(main).toHaveAttribute('role', 'main');
    });

    test('應該有跳至主要內容連結', async ({ page }) => {
      const skipLink = page.locator('[data-testid="skip-to-content"]');
      await expect(skipLink).toBeAttached();
      
      await skipLink.focus();
      await expect(skipLink).toBeVisible();
    });
  });
});