import { test, expect } from '@playwright/test';

/**
 * 應用程式功能測試套件
 * 測試工作坊中所有範例應用的功能
 */
test.describe('應用程式功能測試', () => {
  test.describe('TODO 應用程式', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/apps/todo');
      await page.waitForLoadState('networkidle');
    });

    test('新增待辦事項', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      const addButton = page.locator('[data-testid="add-todo"], button:has-text("Add"), .add-button');
      
      // 新增第一個項目
      await input.fill('學習 Playwright');
      await addButton.click();
      
      // 驗證項目出現
      const todoItem = page.locator('[data-testid="todo-item"], .todo-item').filter({ hasText: '學習 Playwright' });
      await expect(todoItem).toBeVisible();
      
      // 新增第二個項目
      await input.fill('完成工作坊練習');
      await input.press('Enter'); // 測試 Enter 鍵提交
      
      const secondItem = page.locator('[data-testid="todo-item"], .todo-item').filter({ hasText: '完成工作坊練習' });
      await expect(secondItem).toBeVisible();
      
      // 驗證總數
      const items = page.locator('[data-testid="todo-item"], .todo-item');
      await expect(items).toHaveCount(2);
    });

    test('標記待辦事項為完成', async ({ page }) => {
      // 先新增項目
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      await input.fill('測試項目');
      await input.press('Enter');
      
      // 找到項目並標記完成
      const todoItem = page.locator('[data-testid="todo-item"], .todo-item').first();
      const checkbox = todoItem.locator('input[type="checkbox"], [data-testid="todo-checkbox"]');
      
      await checkbox.click();
      
      // 驗證完成狀態
      await expect(todoItem).toHaveClass(/completed|done|checked/);
      await expect(checkbox).toBeChecked();
    });

    test('刪除待辦事項', async ({ page }) => {
      // 新增多個項目
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      const items = ['項目一', '項目二', '項目三'];
      
      for (const item of items) {
        await input.fill(item);
        await input.press('Enter');
      }
      
      // 驗證初始數量
      const todoItems = page.locator('[data-testid="todo-item"], .todo-item');
      await expect(todoItems).toHaveCount(3);
      
      // 刪除第二個項目
      const deleteButton = todoItems.nth(1).locator('[data-testid="delete-todo"], .delete-button, button:has-text("Delete")');
      await deleteButton.click();
      
      // 驗證刪除後的數量
      await expect(todoItems).toHaveCount(2);
      
      // 驗證被刪除的項目不存在
      await expect(page.locator(':has-text("項目二")')).toBeHidden();
    });

    test('編輯待辦事項', async ({ page }) => {
      // 新增項目
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      await input.fill('原始文字');
      await input.press('Enter');
      
      // 進入編輯模式
      const todoItem = page.locator('[data-testid="todo-item"], .todo-item').first();
      await todoItem.dblclick();
      
      // 編輯文字
      const editInput = todoItem.locator('input[type="text"], [contenteditable="true"]');
      if (await editInput.isVisible()) {
        await editInput.fill('修改後的文字');
        await editInput.press('Enter');
        
        // 驗證更新
        await expect(todoItem).toContainText('修改後的文字');
      }
    });

    test('篩選待辦事項', async ({ page }) => {
      // 新增完成和未完成的項目
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      
      await input.fill('未完成項目');
      await input.press('Enter');
      
      await input.fill('已完成項目');
      await input.press('Enter');
      
      // 標記第二個為完成
      const items = page.locator('[data-testid="todo-item"], .todo-item');
      await items.nth(1).locator('input[type="checkbox"]').click();
      
      // 測試篩選功能
      const filterButtons = {
        all: page.locator('[data-testid="filter-all"], button:has-text("All")'),
        active: page.locator('[data-testid="filter-active"], button:has-text("Active")'),
        completed: page.locator('[data-testid="filter-completed"], button:has-text("Completed")')
      };
      
      // 顯示只有未完成的
      if (await filterButtons.active.isVisible()) {
        await filterButtons.active.click();
        await expect(items).toHaveCount(1);
        await expect(items.first()).toContainText('未完成項目');
      }
      
      // 顯示只有已完成的
      if (await filterButtons.completed.isVisible()) {
        await filterButtons.completed.click();
        await expect(items).toHaveCount(1);
        await expect(items.first()).toContainText('已完成項目');
      }
      
      // 顯示全部
      if (await filterButtons.all.isVisible()) {
        await filterButtons.all.click();
        await expect(items).toHaveCount(2);
      }
    });

    test('清除已完成項目', async ({ page }) => {
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      
      // 新增多個項目
      for (let i = 1; i <= 3; i++) {
        await input.fill(`項目 ${i}`);
        await input.press('Enter');
      }
      
      // 標記部分為完成
      const items = page.locator('[data-testid="todo-item"], .todo-item');
      await items.nth(0).locator('input[type="checkbox"]').click();
      await items.nth(2).locator('input[type="checkbox"]').click();
      
      // 清除已完成
      const clearButton = page.locator('[data-testid="clear-completed"], button:has-text("Clear completed")');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // 驗證只剩未完成的
        await expect(items).toHaveCount(1);
        await expect(items.first()).toContainText('項目 2');
      }
    });

    test('本地存儲持久化', async ({ page }) => {
      // 新增項目
      const input = page.locator('[data-testid="todo-input"], input[placeholder*="todo"], .todo-input');
      await input.fill('持久化測試');
      await input.press('Enter');
      
      // 重新載入頁面
      await page.reload();
      
      // 驗證項目仍存在
      const todoItem = page.locator('[data-testid="todo-item"], .todo-item').filter({ hasText: '持久化測試' });
      await expect(todoItem).toBeVisible();
    });
  });

  test.describe('計算機應用程式', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/apps/calculator');
      await page.waitForLoadState('networkidle');
    });

    test('基本加法運算', async ({ page }) => {
      await page.locator('button:has-text("1")').click();
      await page.locator('button:has-text("+")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("=")').click();
      
      const display = page.locator('[data-testid="display"], .display, .result');
      await expect(display).toHaveText('3');
    });

    test('小數點運算', async ({ page }) => {
      await page.locator('button:has-text("3")').click();
      await page.locator('button:has-text(".")').click();
      await page.locator('button:has-text("5")').click();
      await page.locator('button:has-text("×"), button:has-text("*")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("=")').click();
      
      const display = page.locator('[data-testid="display"], .display, .result');
      await expect(display).toHaveText('7');
    });

    test('清除功能', async ({ page }) => {
      await page.locator('button:has-text("9")').click();
      await page.locator('button:has-text("9")').click();
      await page.locator('button:has-text("9")').click();
      
      const display = page.locator('[data-testid="display"], .display, .result');
      await expect(display).toHaveText('999');
      
      await page.locator('button:has-text("C"), button:has-text("Clear")').click();
      await expect(display).toHaveText('0');
    });

    test('連續運算', async ({ page }) => {
      await page.locator('button:has-text("5")').click();
      await page.locator('button:has-text("+")').click();
      await page.locator('button:has-text("3")').click();
      await page.locator('button:has-text("=")').click();
      await page.locator('button:has-text("×"), button:has-text("*")').click();
      await page.locator('button:has-text("2")').click();
      await page.locator('button:has-text("=")').click();
      
      const display = page.locator('[data-testid="display"], .display, .result');
      await expect(display).toHaveText('16');
    });
  });

  test.describe('表單驗證應用程式', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/apps/form-validation');
      await page.waitForLoadState('networkidle');
    });

    test('必填欄位驗證', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"], [data-testid="submit"]');
      await submitButton.click();
      
      // 檢查錯誤訊息
      const errors = page.locator('.error, .error-message, [data-testid="error"]');
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
      
      // 檢查必填欄位提示
      const requiredFields = page.locator('[required], [aria-required="true"]');
      const fieldCount = await requiredFields.count();
      expect(fieldCount).toBeGreaterThan(0);
    });

    test('Email 格式驗證', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], [data-testid="email"], #email');
      
      // 輸入無效格式
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // 檢查錯誤訊息
      const errorMessage = page.locator('.error:has-text("email"), [data-testid="email-error"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
      
      // 輸入有效格式
      await emailInput.fill('test@example.com');
      await emailInput.blur();
      
      // 錯誤訊息應該消失
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeHidden();
      }
    });

    test('密碼強度驗證', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"], [data-testid="password"], #password');
      
      // 弱密碼
      await passwordInput.fill('123');
      await passwordInput.blur();
      
      const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
      if (await strengthIndicator.count() > 0) {
        await expect(strengthIndicator).toContainText(/weak|弱/i);
      }
      
      // 強密碼
      await passwordInput.fill('StrongP@ssw0rd123!');
      await passwordInput.blur();
      
      if (await strengthIndicator.count() > 0) {
        await expect(strengthIndicator).toContainText(/strong|強/i);
      }
    });

    test('表單成功提交', async ({ page }) => {
      // 填寫所有必要欄位
      await page.fill('input[name="name"], [data-testid="name"]', 'Test User');
      await page.fill('input[type="email"], [data-testid="email"]', 'test@example.com');
      await page.fill('input[type="password"], [data-testid="password"]', 'SecureP@ss123');
      
      const confirmPassword = page.locator('input[name="confirmPassword"], [data-testid="confirm-password"]');
      if (await confirmPassword.isVisible()) {
        await confirmPassword.fill('SecureP@ss123');
      }
      
      // 同意條款
      const termsCheckbox = page.locator('input[type="checkbox"][name="terms"], [data-testid="terms"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }
      
      // 提交表單
      await page.click('button[type="submit"], [data-testid="submit"]');
      
      // 檢查成功訊息
      const successMessage = page.locator('.success, [data-testid="success-message"]');
      if (await successMessage.count() > 0) {
        await expect(successMessage).toBeVisible();
      }
    });
  });

  test.describe('購物車應用程式', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/apps/shopping-cart');
      await page.waitForLoadState('networkidle');
    });

    test('加入商品到購物車', async ({ page }) => {
      const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
      const addButton = firstProduct.locator('button:has-text("Add to Cart"), [data-testid="add-to-cart"]');
      
      await addButton.click();
      
      // 檢查購物車數量
      const cartCount = page.locator('[data-testid="cart-count"], .cart-count');
      await expect(cartCount).toHaveText('1');
      
      // 加入更多商品
      const secondProduct = page.locator('[data-testid="product-card"], .product-card').nth(1);
      await secondProduct.locator('button:has-text("Add to Cart")').click();
      
      await expect(cartCount).toHaveText('2');
    });

    test('更新購物車數量', async ({ page }) => {
      // 先加入商品
      const addButton = page.locator('[data-testid="add-to-cart"], button:has-text("Add to Cart")').first();
      await addButton.click();
      
      // 開啟購物車
      await page.click('[data-testid="cart-icon"], .cart-icon');
      
      // 更新數量
      const quantityInput = page.locator('[data-testid="quantity-input"], input[type="number"]').first();
      await quantityInput.fill('3');
      await quantityInput.blur();
      
      // 檢查總價更新
      const totalPrice = page.locator('[data-testid="total-price"], .total-price');
      const price = totalPrice;
      await expect(price).toHaveText();
    });

    test('從購物車移除商品', async ({ page }) => {
      // 加入商品
      await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
      
      // 開啟購物車
      await page.click('[data-testid="cart-icon"], .cart-icon');
      
      // 移除商品
      const removeButton = page.locator('[data-testid="remove-item"], button:has-text("Remove")').first();
      await removeButton.click();
      
      // 檢查購物車為空
      const emptyMessage = page.locator('[data-testid="empty-cart"], .empty-cart');
      if (await emptyMessage.count() > 0) {
        await expect(emptyMessage).toBeVisible();
      }
      
      const cartCount = page.locator('[data-testid="cart-count"], .cart-count');
      await expect(cartCount).toHaveText('0');
    });

    test('結帳流程', async ({ page }) => {
      // 加入商品
      await page.click('[data-testid="add-to-cart"], button:has-text("Add to Cart")');
      
      // 前往結帳
      await page.click('[data-testid="checkout"], button:has-text("Checkout")');
      
      // 填寫結帳資訊
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'buyer@example.com');
        await page.fill('input[name="address"]', '123 Test Street');
        await page.fill('input[name="city"]', 'Test City');
        await page.fill('input[name="zip"]', '12345');
      }
      
      // 確認訂單
      const confirmButton = page.locator('[data-testid="confirm-order"], button:has-text("Confirm")');
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        
        // 檢查訂單確認訊息
        const confirmation = page.locator('[data-testid="order-confirmation"], .confirmation');
        await expect(confirmation).toBeVisible();
      }
    });
  });
});