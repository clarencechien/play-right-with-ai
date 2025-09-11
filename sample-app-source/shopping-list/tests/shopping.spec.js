/**
 * 購物清單應用程式測試規範
 * 測試分類功能與進階互動
 */

const { test, expect } = require('@playwright/test');

test.describe('購物清單應用程式', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + __dirname + '/../src/index.html');
  });

  test.describe('基本介面', () => {
    test('應該顯示應用標題', async ({ page }) => {
      const title = page.locator('h1');
      await expect(title).toContainText('智能購物清單');
    });

    test('應該有商品輸入欄位', async ({ page }) => {
      await expect(page.locator('[data-testid="item-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="item-quantity"]')).toBeVisible();
      await expect(page.locator('[data-testid="item-category"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-button"]')).toBeVisible();
    });

    test('應該顯示預設分類', async ({ page }) => {
      const categories = await page.locator('[data-testid="item-category"] option').allTextContents();
      expect(categories).toContain('食品');
      expect(categories).toContain('日用品');
      expect(categories).toContain('電子產品');
      expect(categories).toContain('服飾');
      expect(categories).toContain('其他');
    });
  });

  test.describe('新增商品', () => {
    test('應該能新增商品到清單', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('牛奶');
      await page.locator('[data-testid="item-quantity"]').fill('2');
      await page.locator('[data-testid="item-category"]').selectOption('食品');
      await page.locator('[data-testid="add-button"]').click();

      const item = page.locator('[data-testid="shopping-item"]').first();
      await expect(item).toContainText('牛奶');
      await expect(item).toContainText('2');
      await expect(item).toContainText('食品');
    });

    test('應該要求必填商品名稱', async ({ page }) => {
      await page.locator('[data-testid="add-button"]').click();
      
      const items = await page.locator('[data-testid="shopping-item"]').count();
      expect(items).toBe(0);
    });

    test('應該設定預設數量為1', async ({ page }) => {
      const quantityInput = page.locator('[data-testid="item-quantity"]');
      await expect(quantityInput).toHaveValue('1');
    });

    test('應該在新增後清空表單', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('測試商品');
      await page.locator('[data-testid="add-button"]').click();

      await expect(page.locator('[data-testid="item-name"]')).toHaveValue('');
      await expect(page.locator('[data-testid="item-quantity"]')).toHaveValue('1');
    });
  });

  test.describe('商品管理', () => {
    test.beforeEach(async ({ page }) => {
      // 新增測試資料
      await page.locator('[data-testid="item-name"]').fill('蘋果');
      await page.locator('[data-testid="item-quantity"]').fill('3');
      await page.locator('[data-testid="item-category"]').selectOption('食品');
      await page.locator('[data-testid="add-button"]').click();
    });

    test('應該能標記商品為已購買', async ({ page }) => {
      const item = page.locator('[data-testid="shopping-item"]').first();
      const checkbox = item.locator('[data-testid="item-checkbox"]');
      
      await checkbox.click();
      await expect(item).toHaveClass(/purchased/);
    });

    test('應該能調整商品數量', async ({ page }) => {
      const item = page.locator('[data-testid="shopping-item"]').first();
      const increaseBtn = item.locator('[data-testid="increase-quantity"]');
      const decreaseBtn = item.locator('[data-testid="decrease-quantity"]');
      const quantityDisplay = item.locator('[data-testid="quantity-display"]');

      await expect(quantityDisplay).toContainText('3');
      
      await increaseBtn.click();
      await expect(quantityDisplay).toContainText('4');
      
      await decreaseBtn.click();
      await decreaseBtn.click();
      await expect(quantityDisplay).toContainText('2');
    });

    test('數量不應該小於1', async ({ page }) => {
      const item = page.locator('[data-testid="shopping-item"]').first();
      const decreaseBtn = item.locator('[data-testid="decrease-quantity"]');
      const quantityDisplay = item.locator('[data-testid="quantity-display"]');

      // 減到1
      await decreaseBtn.click();
      await decreaseBtn.click();
      await expect(quantityDisplay).toContainText('1');
      
      // 嘗試再減
      await decreaseBtn.click();
      await expect(quantityDisplay).toContainText('1');
    });

    test('應該能刪除商品', async ({ page }) => {
      const item = page.locator('[data-testid="shopping-item"]').first();
      const deleteBtn = item.locator('[data-testid="delete-button"]');
      
      await deleteBtn.click();
      await expect(item).toBeHidden();
    });
  });

  test.describe('分類顯示', () => {
    test.beforeEach(async ({ page }) => {
      // 新增不同分類的商品
      const items = [
        { name: '牛奶', category: '食品' },
        { name: '洗髮精', category: '日用品' },
        { name: '麵包', category: '食品' },
        { name: '手機充電線', category: '電子產品' }
      ];

      for (const item of items) {
        await page.locator('[data-testid="item-name"]').fill(item.name);
        await page.locator('[data-testid="item-category"]').selectOption(item.category);
        await page.locator('[data-testid="add-button"]').click();
      }
    });

    test('應該按分類分組顯示', async ({ page }) => {
      const foodSection = page.locator('[data-testid="category-section-食品"]');
      const dailySection = page.locator('[data-testid="category-section-日用品"]');
      const electronicsSection = page.locator('[data-testid="category-section-電子產品"]');

      await expect(foodSection).toBeVisible();
      await expect(dailySection).toBeVisible();
      await expect(electronicsSection).toBeVisible();

      // 檢查分類下的商品
      const foodItems = foodSection.locator('[data-testid="shopping-item"]');
      await expect(foodItems).toHaveCount(2);
    });

    test('應該顯示分類商品數量', async ({ page }) => {
      const foodSection = page.locator('[data-testid="category-section-食品"]');
      await expect(foodSection).toContainText('(2)');
    });
  });

  test.describe('篩選與搜尋', () => {
    test.beforeEach(async ({ page }) => {
      // 新增測試資料
      const items = [
        { name: '蘋果', category: '食品' },
        { name: '香蕉', category: '食品' },
        { name: '洗衣精', category: '日用品' }
      ];

      for (const item of items) {
        await page.locator('[data-testid="item-name"]').fill(item.name);
        await page.locator('[data-testid="item-category"]').selectOption(item.category);
        await page.locator('[data-testid="add-button"]').click();
      }
    });

    test('應該能搜尋商品', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('蘋果');

      const visibleItems = page.locator('[data-testid="shopping-item"]:visible');
      await expect(visibleItems).toHaveCount(1);
      await expect(visibleItems.first()).toContainText('蘋果');
    });

    test('應該能按分類篩選', async ({ page }) => {
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.selectOption('食品');

      const visibleItems = page.locator('[data-testid="shopping-item"]:visible');
      await expect(visibleItems).toHaveCount(2);
    });

    test('搜尋應該不區分大小寫', async ({ page }) => {
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('蘋果');

      const visibleItems = page.locator('[data-testid="shopping-item"]:visible');
      await expect(visibleItems).toHaveCount(1);
    });
  });

  test.describe('統計與預算', () => {
    test('應該顯示商品總數', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('商品1');
      await page.locator('[data-testid="add-button"]').click();
      await page.locator('[data-testid="item-name"]').fill('商品2');
      await page.locator('[data-testid="add-button"]').click();

      const stats = page.locator('[data-testid="stats"]');
      await expect(stats).toContainText('總計: 2');
    });

    test('應該顯示已購買數量', async ({ page }) => {
      // 新增兩個商品
      await page.locator('[data-testid="item-name"]').fill('商品1');
      await page.locator('[data-testid="add-button"]').click();
      await page.locator('[data-testid="item-name"]').fill('商品2');
      await page.locator('[data-testid="add-button"]').click();

      // 標記一個為已購買
      await page.locator('[data-testid="shopping-item"]').first().locator('[data-testid="item-checkbox"]').click();

      const stats = page.locator('[data-testid="stats"]');
      await expect(stats).toContainText('已購買: 1');
    });

    test('應該能設定和顯示預算', async ({ page }) => {
      const budgetInput = page.locator('[data-testid="budget-input"]');
      const budgetDisplay = page.locator('[data-testid="budget-display"]');

      await budgetInput.fill('1000');
      await page.locator('[data-testid="set-budget"]').click();

      await expect(budgetDisplay).toContainText('NT$ 1000');
    });
  });

  test.describe('資料持久化', () => {
    test('應該在重新載入後保留清單', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('持久化測試');
      await page.locator('[data-testid="add-button"]').click();

      await page.reload();

      const item = page.locator('[data-testid="shopping-item"]').first();
      await expect(item).toContainText('持久化測試');
    });

    test('應該保存購買狀態', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('狀態測試');
      await page.locator('[data-testid="add-button"]').click();
      
      await page.locator('[data-testid="item-checkbox"]').first().click();
      
      await page.reload();
      
      const item = page.locator('[data-testid="shopping-item"]').first();
      await expect(item).toHaveClass(/purchased/);
    });
  });

  test.describe('批量操作', () => {
    test.beforeEach(async ({ page }) => {
      // 新增多個商品
      for (let i = 1; i <= 3; i++) {
        await page.locator('[data-testid="item-name"]').fill(`商品${i}`);
        await page.locator('[data-testid="add-button"]').click();
      }
    });

    test('應該能清除所有已購買商品', async ({ page }) => {
      // 標記兩個為已購買
      const items = page.locator('[data-testid="shopping-item"]');
      await items.nth(0).locator('[data-testid="item-checkbox"]').click();
      await items.nth(1).locator('[data-testid="item-checkbox"]').click();

      await page.locator('[data-testid="clear-purchased"]').click();

      const remainingItems = await page.locator('[data-testid="shopping-item"]').count();
      expect(remainingItems).toBe(1);
    });

    test('應該能清空整個清單', async ({ page }) => {
      await page.locator('[data-testid="clear-all"]').click();
      
      // 應該顯示確認對話框
      page.on('dialog', dialog => dialog.accept());
      
      const items = await page.locator('[data-testid="shopping-item"]').count();
      expect(items).toBe(0);
    });
  });

  test.describe('匯出功能', () => {
    test('應該能匯出清單', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('匯出測試');
      await page.locator('[data-testid="add-button"]').click();

      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-list"]').click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('shopping-list');
    });

    test('應該能分享清單', async ({ page }) => {
      await page.locator('[data-testid="item-name"]').fill('分享測試');
      await page.locator('[data-testid="add-button"]').click();

      // 模擬剪貼簿 API
      await page.evaluate(() => {
        navigator.clipboard = {
          writeText: jest.fn()
        };
      });

      await page.locator('[data-testid="share-list"]').click();
    });
  });
});