# Sample Application Testing Specification

## Overview
This specification defines comprehensive testing requirements for all sample applications used in the workshop, ensuring they serve as effective learning tools and demonstrate best practices.

## Sample Applications Inventory

### 1. Core Applications

#### 1.1 TODO Application (待辦事項應用程式)
```typescript
describe('TODO Application', () => {
  const appPath = '/sample-app-source/todo-app/';
  
  describe('Functional Requirements', () => {
    test('should perform CRUD operations', async ({ page }) => {
      await page.goto(appPath);
      
      // Create
      await page.fill('[data-testid="new-todo"]', 'Buy groceries');
      await page.press('[data-testid="new-todo"]', 'Enter');
      await expect(page.locator('.todo-item')).toContainText('Buy groceries');
      
      // Read
      const todos = await page.locator('.todo-item').count();
      expect(todos).toBeGreaterThan(0);
      
      // Update
      await page.click('[data-testid="todo-checkbox-0"]');
      await expect(page.locator('.todo-item').first()).toHaveClass(/completed/);
      
      // Delete
      await page.click('[data-testid="delete-todo-0"]');
      await expect(page.locator('.todo-item')).toHaveCount(todos - 1);
    });

    test('should filter tasks correctly', async ({ page }) => {
      // Setup: Add mixed tasks
      await addTodo(page, 'Active task');
      await addTodo(page, 'Completed task');
      await toggleTodo(page, 'Completed task');
      
      // Test All filter
      await page.click('[data-testid="filter-all"]');
      await expect(page.locator('.todo-item')).toHaveCount(2);
      
      // Test Active filter
      await page.click('[data-testid="filter-active"]');
      await expect(page.locator('.todo-item')).toHaveCount(1);
      await expect(page.locator('.todo-item')).toContainText('Active task');
      
      // Test Completed filter
      await page.click('[data-testid="filter-completed"]');
      await expect(page.locator('.todo-item')).toHaveCount(1);
      await expect(page.locator('.todo-item')).toContainText('Completed task');
    });

    test('should persist data in localStorage', async ({ page, context }) => {
      // Add todos
      await page.goto(appPath);
      await addTodo(page, 'Persistent task');
      
      // Verify localStorage
      const storage = await context.storageState();
      expect(storage.origins[0].localStorage).toContainEqual(
        expect.objectContaining({
          name: 'todos',
          value: expect.stringContaining('Persistent task')
        })
      );
      
      // Reload and verify persistence
      await page.reload();
      await expect(page.locator('.todo-item')).toContainText('Persistent task');
    });
  });

  describe('UI/UX Requirements', () => {
    test('should be responsive', async ({ page }) => {
      // Desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(appPath);
      await expect(page.locator('.todo-container')).toBeVisible();
      
      // Tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('.todo-container')).toBeVisible();
      
      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('.todo-container')).toBeVisible();
      await expect(page.locator('.todo-container')).toHaveCSS('width', '100%');
    });

    test('should be accessible', async ({ page }) => {
      await page.goto(appPath);
      
      // Keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="new-todo"]')).toBeFocused();
      
      // ARIA labels
      await expect(page.locator('[data-testid="new-todo"]')).toHaveAttribute('aria-label');
      await expect(page.locator('.todo-list')).toHaveAttribute('role', 'list');
      
      // Color contrast
      const contrast = await page.evaluate(() => {
        // Check contrast ratio
        return window.getComputedStyle(document.body).color;
      });
      expect(contrast).toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(appPath);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(2000); // Under 2 seconds
    });

    test('should handle large datasets', async ({ page }) => {
      await page.goto(appPath);
      
      // Add 100 todos
      for (let i = 0; i < 100; i++) {
        await addTodo(page, `Task ${i}`);
      }
      
      // Measure interaction responsiveness
      const startTime = Date.now();
      await page.click('[data-testid="filter-active"]');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100); // Under 100ms
    });
  });
});
```

#### 1.2 E-Commerce Product Page (電商產品頁面)
```typescript
describe('E-Commerce Product Page', () => {
  const appPath = '/sample-app-source/ecommerce-product/';
  
  describe('Product Display', () => {
    test('should display product information', async ({ page }) => {
      await page.goto(appPath);
      
      await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="product-image"]')).toBeVisible();
    });

    test('should handle image gallery', async ({ page }) => {
      await page.goto(appPath);
      
      // Test thumbnail navigation
      const thumbnails = page.locator('[data-testid="thumbnail"]');
      await expect(thumbnails).toHaveCount(4);
      
      await thumbnails.nth(1).click();
      await expect(page.locator('[data-testid="main-image"]')).toHaveAttribute(
        'src',
        /product-2/
      );
    });
  });

  describe('Shopping Cart Integration', () => {
    test('should add items to cart', async ({ page }) => {
      await page.goto(appPath);
      
      // Select quantity
      await page.selectOption('[data-testid="quantity-select"]', '2');
      
      // Add to cart
      await page.click('[data-testid="add-to-cart"]');
      
      // Verify cart updated
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('2');
      
      // Verify notification
      await expect(page.locator('[data-testid="notification"]')).toContainText(
        'Added to cart'
      );
    });

    test('should handle out of stock items', async ({ page }) => {
      await page.goto(appPath + '?product=out-of-stock');
      
      await expect(page.locator('[data-testid="add-to-cart"]')).toBeDisabled();
      await expect(page.locator('[data-testid="stock-status"]')).toContainText(
        'Out of Stock'
      );
    });
  });

  describe('Reviews Section', () => {
    test('should display reviews', async ({ page }) => {
      await page.goto(appPath);
      
      await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible();
      await expect(page.locator('.review-item')).toHaveCount(5);
    });

    test('should submit new review', async ({ page }) => {
      await page.goto(appPath);
      
      // Open review form
      await page.click('[data-testid="write-review"]');
      
      // Fill review
      await page.fill('[data-testid="review-name"]', 'Test User');
      await page.click('[data-testid="rating-4"]');
      await page.fill('[data-testid="review-text"]', 'Great product!');
      
      // Submit
      await page.click('[data-testid="submit-review"]');
      
      // Verify submission
      await expect(page.locator('.review-item').last()).toContainText('Test User');
      await expect(page.locator('.review-item').last()).toContainText('Great product!');
    });
  });
});
```

#### 1.3 User Authentication Flow (使用者認證流程)
```typescript
describe('User Authentication Flow', () => {
  const appPath = '/sample-app-source/auth-flow/';
  
  describe('Login Functionality', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto(appPath + '/login');
      
      await page.fill('[data-testid="email"]', 'user@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL(appPath + '/dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText(
        'Welcome, user@example.com'
      );
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(appPath + '/login');
      
      await page.fill('[data-testid="email"]', 'wrong@example.com');
      await page.fill('[data-testid="password"]', 'wrongpass');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        'Invalid email or password'
      );
    });

    test('should handle session persistence', async ({ page, context }) => {
      // Login
      await loginUser(page, 'user@example.com', 'password123');
      
      // Get cookies
      const cookies = await context.cookies();
      expect(cookies).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'session' })
        ])
      );
      
      // Navigate directly to protected page
      await page.goto(appPath + '/dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    test('should register new user', async ({ page }) => {
      await page.goto(appPath + '/register');
      
      await page.fill('[data-testid="email"]', 'newuser@example.com');
      await page.fill('[data-testid="password"]', 'SecurePass123!');
      await page.fill('[data-testid="confirm-password"]', 'SecurePass123!');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('[data-testid="register-button"]');
      
      await expect(page).toHaveURL(appPath + '/welcome');
      await expect(page.locator('[data-testid="success-message"]')).toContainText(
        'Registration successful'
      );
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto(appPath + '/register');
      
      await page.fill('[data-testid="password"]', 'weak');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('[data-testid="password-error"]')).toContainText(
        'Password must be at least 8 characters'
      );
    });
  });

  describe('Logout Functionality', () => {
    test('should logout successfully', async ({ page }) => {
      // Login first
      await loginUser(page, 'user@example.com', 'password123');
      
      // Logout
      await page.click('[data-testid="logout-button"]');
      
      await expect(page).toHaveURL(appPath + '/login');
      
      // Try to access protected page
      await page.goto(appPath + '/dashboard');
      await expect(page).toHaveURL(appPath + '/login');
    });
  });
});
```

### 2. Progressive Complexity Applications

#### 2.1 Simple Static Page
```typescript
describe('Simple Static Page', () => {
  test('should render basic HTML', async ({ page }) => {
    await page.goto('/sample-app-source/static-page/');
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.locator('p')).toBeVisible();
  });
});
```

#### 2.2 Interactive Form
```typescript
describe('Interactive Form', () => {
  test('should validate form inputs', async ({ page }) => {
    await page.goto('/sample-app-source/contact-form/');
    
    // Test required fields
    await page.click('[data-testid="submit"]');
    await expect(page.locator('.error')).toContainText('Required');
    
    // Test email validation
    await page.fill('[data-testid="email"]', 'invalid');
    await expect(page.locator('[data-testid="email-error"]')).toContainText(
      'Invalid email'
    );
    
    // Test successful submission
    await page.fill('[data-testid="name"]', 'John Doe');
    await page.fill('[data-testid="email"]', 'john@example.com');
    await page.fill('[data-testid="message"]', 'Test message');
    await page.click('[data-testid="submit"]');
    
    await expect(page.locator('[data-testid="success"]')).toBeVisible();
  });
});
```

#### 2.3 Real-time Chat Application
```typescript
describe('Real-time Chat Application', () => {
  test('should send and receive messages', async ({ browser }) => {
    // Open two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // User 1 joins
    await page1.goto('/sample-app-source/chat-app/');
    await page1.fill('[data-testid="username"]', 'User1');
    await page1.click('[data-testid="join"]');
    
    // User 2 joins
    await page2.goto('/sample-app-source/chat-app/');
    await page2.fill('[data-testid="username"]', 'User2');
    await page2.click('[data-testid="join"]');
    
    // User 1 sends message
    await page1.fill('[data-testid="message-input"]', 'Hello User2!');
    await page1.press('[data-testid="message-input"]', 'Enter');
    
    // Both users should see the message
    await expect(page1.locator('.message').last()).toContainText('Hello User2!');
    await expect(page2.locator('.message').last()).toContainText('Hello User2!');
    
    // Cleanup
    await context1.close();
    await context2.close();
  });
});
```

### 3. Bug-Injected Versions

#### 3.1 TODO App with Bugs
```typescript
describe('TODO App - Bug Detection', () => {
  const buggyAppPath = '/sample-app-source/todo-app-buggy/';
  
  test('should detect data persistence bug', async ({ page }) => {
    await page.goto(buggyAppPath);
    
    // Add todo
    await addTodo(page, 'Test task');
    
    // Reload
    await page.reload();
    
    // Bug: localStorage not working
    await expect(page.locator('.todo-item')).toHaveCount(0);
    // This should fail, indicating the bug
  });

  test('should detect filter logic bug', async ({ page }) => {
    await page.goto(buggyAppPath);
    
    // Add mixed tasks
    await addTodo(page, 'Active task');
    await addTodo(page, 'Completed task');
    await toggleTodo(page, 'Completed task');
    
    // Bug: Active filter shows all tasks
    await page.click('[data-testid="filter-active"]');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    // This should fail if bug exists
  });

  test('should detect delete functionality bug', async ({ page }) => {
    await page.goto(buggyAppPath);
    
    // Add todos
    await addTodo(page, 'Task 1');
    await addTodo(page, 'Task 2');
    
    // Bug: Delete removes wrong item
    await page.click('[data-testid="delete-todo-0"]');
    await expect(page.locator('.todo-item').first()).toContainText('Task 2');
    // This should pass if bug exists (wrong behavior)
  });
});
```

### 4. Performance Testing Applications

#### 4.1 Large Dataset Handler
```typescript
describe('Large Dataset Application', () => {
  test('should handle pagination efficiently', async ({ page }) => {
    await page.goto('/sample-app-source/data-table/');
    
    // Load 10,000 records
    await page.selectOption('[data-testid="dataset-size"]', '10000');
    
    // Measure initial load
    const loadTime = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);
    expect(loadTime).toBeLessThan(3000);
    
    // Test pagination
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toHaveText('2');
    
    // Test search performance
    const searchStart = Date.now();
    await page.fill('[data-testid="search"]', 'specific-item');
    await page.waitForSelector('.search-result');
    const searchTime = Date.now() - searchStart;
    expect(searchTime).toBeLessThan(500);
  });
});
```

### 5. API Integration Examples

#### 5.1 REST API Client
```typescript
describe('REST API Client', () => {
  test('should perform CRUD operations via API', async ({ page, request }) => {
    await page.goto('/sample-app-source/api-client/');
    
    // Create via UI (triggers API)
    await page.fill('[data-testid="item-name"]', 'New Item');
    await page.click('[data-testid="create"]');
    
    // Verify API call
    const response = await request.get('/api/items');
    const items = await response.json();
    expect(items).toContainEqual(
      expect.objectContaining({ name: 'New Item' })
    );
    
    // Update via UI
    await page.click('[data-testid="edit-0"]');
    await page.fill('[data-testid="edit-name"]', 'Updated Item');
    await page.click('[data-testid="save"]');
    
    // Delete via UI
    await page.click('[data-testid="delete-0"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify deletion
    const afterDelete = await request.get('/api/items');
    const remainingItems = await afterDelete.json();
    expect(remainingItems).not.toContainEqual(
      expect.objectContaining({ name: 'Updated Item' })
    );
  });
});
```

## Testing Infrastructure

### Test Helpers
```typescript
// Helper functions for common operations
async function addTodo(page: Page, text: string) {
  await page.fill('[data-testid="new-todo"]', text);
  await page.press('[data-testid="new-todo"]', 'Enter');
}

async function toggleTodo(page: Page, text: string) {
  const todo = page.locator('.todo-item').filter({ hasText: text });
  await todo.locator('[data-testid="todo-checkbox"]').click();
}

async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard');
}
```

### Test Data Management
```typescript
const testData = {
  users: [
    { email: 'user@example.com', password: 'password123' },
    { email: 'admin@example.com', password: 'admin123' }
  ],
  products: [
    { id: 1, name: 'Product 1', price: 99.99 },
    { id: 2, name: 'Product 2', price: 149.99 }
  ],
  todos: [
    'Buy groceries',
    'Complete workshop',
    'Review PR'
  ]
};
```

## Quality Assurance Checklist

### Code Quality
- [ ] Clean, readable code
- [ ] Consistent naming conventions
- [ ] Proper error handling
- [ ] No console errors
- [ ] No memory leaks

### Functionality
- [ ] All features work as specified
- [ ] Edge cases handled
- [ ] Input validation present
- [ ] Proper state management

### Performance
- [ ] Page load < 3 seconds
- [ ] Interaction response < 100ms
- [ ] Smooth animations (60 FPS)
- [ ] Optimized assets

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliant
- [ ] Proper ARIA labels

### Security
- [ ] Input sanitization
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure authentication

## Continuous Testing Pipeline

```yaml
name: Sample Apps Testing

on:
  push:
    paths:
      - 'sample-app-source/**'
  pull_request:
    paths:
      - 'sample-app-source/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
      
      - name: Generate coverage report
        run: npm run coverage
      
      - name: Check quality gates
        run: npm run quality:check
```

## Success Metrics

### Application Quality Metrics
- Test coverage > 90%
- Zero critical bugs
- Performance score > 90/100
- Accessibility score > 95/100
- Security audit passing

### Learning Effectiveness Metrics
- Clear demonstration of concepts
- Progressive complexity
- Realistic scenarios
- Bug detection capability
- Self-repair compatibility