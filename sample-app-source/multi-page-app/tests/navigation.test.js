/**
 * Multi-Page App Test Suite
 * TDD approach - Testing routing, navigation, and functionality
 */

describe('Multi-Page Application', () => {
    let app;
    let router;
    
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="app"></div>
        `;
        
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Mock window.location
        delete window.location;
        window.location = { 
            pathname: '/',
            hash: '',
            search: '',
            href: 'http://localhost/',
            origin: 'http://localhost'
        };
        
        // Initialize router and app
        router = new Router();
        app = new MultiPageApp(router);
    });
    
    afterEach(() => {
        // Clean up event listeners
        router.destroy();
    });
    
    describe('Router', () => {
        test('should initialize with default route', () => {
            expect(router.currentRoute).toBe('/');
            expect(router.routes).toBeDefined();
        });
        
        test('should register routes', () => {
            const handler = jest.fn();
            router.addRoute('/test', handler);
            
            expect(router.routes['/test']).toBe(handler);
        });
        
        test('should navigate to route', () => {
            const handler = jest.fn();
            router.addRoute('/products', handler);
            
            router.navigate('/products');
            
            expect(handler).toHaveBeenCalled();
            expect(router.currentRoute).toBe('/products');
        });
        
        test('should handle route parameters', () => {
            const handler = jest.fn();
            router.addRoute('/product/:id', handler);
            
            router.navigate('/product/123');
            
            expect(handler).toHaveBeenCalledWith({ id: '123' });
        });
        
        test('should handle 404 routes', () => {
            const notFoundHandler = jest.fn();
            router.setNotFoundHandler(notFoundHandler);
            
            router.navigate('/non-existent');
            
            expect(notFoundHandler).toHaveBeenCalled();
        });
        
        test('should handle browser back/forward', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();
            router.addRoute('/page1', handler1);
            router.addRoute('/page2', handler2);
            
            router.navigate('/page1');
            router.navigate('/page2');
            
            window.dispatchEvent(new PopStateEvent('popstate'));
            
            expect(router.currentRoute).toBe('/page1');
        });
        
        test('should prevent navigation when guard returns false', () => {
            const guard = jest.fn().mockReturnValue(false);
            router.setNavigationGuard(guard);
            
            router.navigate('/products');
            
            expect(router.currentRoute).toBe('/');
        });
    });
    
    describe('Product Catalog', () => {
        beforeEach(() => {
            app.loadProducts();
        });
        
        test('should load products', () => {
            expect(app.products.length).toBeGreaterThan(0);
            expect(app.products[0]).toHaveProperty('id');
            expect(app.products[0]).toHaveProperty('name');
            expect(app.products[0]).toHaveProperty('price');
            expect(app.products[0]).toHaveProperty('category');
        });
        
        test('should filter products by category', () => {
            const electronics = app.filterProducts({ category: '電子產品' });
            
            expect(electronics.every(p => p.category === '電子產品')).toBe(true);
        });
        
        test('should filter products by price range', () => {
            const filtered = app.filterProducts({ minPrice: 100, maxPrice: 500 });
            
            expect(filtered.every(p => p.price >= 100 && p.price <= 500)).toBe(true);
        });
        
        test('should search products by name', () => {
            app.products = [
                { id: 1, name: '筆記型電腦', category: '電子產品', price: 30000 },
                { id: 2, name: '滑鼠', category: '電子產品', price: 500 }
            ];
            
            const results = app.searchProducts('筆記');
            
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('筆記型電腦');
        });
        
        test('should sort products by price', () => {
            const sorted = app.sortProducts('price_asc');
            
            for (let i = 1; i < sorted.length; i++) {
                expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i-1].price);
            }
        });
        
        test('should paginate products', () => {
            app.products = Array.from({ length: 25 }, (_, i) => ({
                id: i + 1,
                name: `Product ${i + 1}`,
                price: (i + 1) * 100
            }));
            
            const page1 = app.getProductsPage(1, 10);
            const page2 = app.getProductsPage(2, 10);
            
            expect(page1.length).toBe(10);
            expect(page2.length).toBe(10);
            expect(page1[0].id).toBe(1);
            expect(page2[0].id).toBe(11);
        });
    });
    
    describe('Shopping Cart', () => {
        test('should add item to cart', () => {
            const product = { id: 1, name: '測試商品', price: 100 };
            
            app.addToCart(product);
            
            expect(app.cart.items.length).toBe(1);
            expect(app.cart.items[0].product).toEqual(product);
            expect(app.cart.items[0].quantity).toBe(1);
        });
        
        test('should increase quantity for existing item', () => {
            const product = { id: 1, name: '測試商品', price: 100 };
            
            app.addToCart(product);
            app.addToCart(product);
            
            expect(app.cart.items.length).toBe(1);
            expect(app.cart.items[0].quantity).toBe(2);
        });
        
        test('should remove item from cart', () => {
            const product = { id: 1, name: '測試商品', price: 100 };
            app.addToCart(product);
            
            app.removeFromCart(1);
            
            expect(app.cart.items.length).toBe(0);
        });
        
        test('should update item quantity', () => {
            const product = { id: 1, name: '測試商品', price: 100 };
            app.addToCart(product);
            
            app.updateCartQuantity(1, 5);
            
            expect(app.cart.items[0].quantity).toBe(5);
        });
        
        test('should calculate cart total', () => {
            app.addToCart({ id: 1, name: '商品1', price: 100 });
            app.addToCart({ id: 2, name: '商品2', price: 200 });
            app.updateCartQuantity(1, 2);
            
            const total = app.getCartTotal();
            
            expect(total).toBe(400); // (100 * 2) + (200 * 1)
        });
        
        test('should clear cart', () => {
            app.addToCart({ id: 1, name: '商品1', price: 100 });
            app.addToCart({ id: 2, name: '商品2', price: 200 });
            
            app.clearCart();
            
            expect(app.cart.items.length).toBe(0);
        });
        
        test('should persist cart to localStorage', () => {
            app.addToCart({ id: 1, name: '商品1', price: 100 });
            
            const saved = JSON.parse(localStorage.getItem('cart'));
            
            expect(saved).toBeDefined();
            expect(saved.items.length).toBe(1);
        });
        
        test('should load cart from localStorage', () => {
            const cartData = {
                items: [
                    { product: { id: 1, name: '商品1', price: 100 }, quantity: 2 }
                ]
            };
            localStorage.setItem('cart', JSON.stringify(cartData));
            
            app.loadCart();
            
            expect(app.cart.items.length).toBe(1);
            expect(app.cart.items[0].quantity).toBe(2);
        });
    });
    
    describe('User Authentication', () => {
        test('should login user', () => {
            const result = app.login('user@example.com', 'password123');
            
            expect(result.success).toBe(true);
            expect(app.currentUser).toBeDefined();
            expect(app.currentUser.email).toBe('user@example.com');
        });
        
        test('should reject invalid credentials', () => {
            const result = app.login('wrong@example.com', 'wrongpass');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('無效的');
            expect(app.currentUser).toBeNull();
        });
        
        test('should logout user', () => {
            app.login('user@example.com', 'password123');
            
            app.logout();
            
            expect(app.currentUser).toBeNull();
            expect(sessionStorage.getItem('user')).toBeNull();
        });
        
        test('should register new user', () => {
            const userData = {
                email: 'new@example.com',
                password: 'newpass123',
                name: '新用戶'
            };
            
            const result = app.register(userData);
            
            expect(result.success).toBe(true);
            expect(app.users).toContainEqual(expect.objectContaining({
                email: userData.email
            }));
        });
        
        test('should prevent duplicate registration', () => {
            const userData = {
                email: 'user@example.com',
                password: 'pass123',
                name: '用戶'
            };
            
            app.register(userData);
            const result = app.register(userData);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已存在');
        });
        
        test('should check authentication status', () => {
            expect(app.isAuthenticated()).toBe(false);
            
            app.login('user@example.com', 'password123');
            
            expect(app.isAuthenticated()).toBe(true);
        });
        
        test('should persist session', () => {
            app.login('user@example.com', 'password123');
            
            const newApp = new MultiPageApp(router);
            newApp.loadSession();
            
            expect(newApp.isAuthenticated()).toBe(true);
            expect(newApp.currentUser.email).toBe('user@example.com');
        });
    });
    
    describe('Contact Form', () => {
        test('should validate required fields', () => {
            const formData = {
                name: '',
                email: 'test@example.com',
                message: 'Test message'
            };
            
            const validation = app.validateContactForm(formData);
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('姓名為必填');
        });
        
        test('should validate email format', () => {
            const formData = {
                name: 'Test User',
                email: 'invalid-email',
                message: 'Test message'
            };
            
            const validation = app.validateContactForm(formData);
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('電子郵件格式無效');
        });
        
        test('should validate message length', () => {
            const formData = {
                name: 'Test User',
                email: 'test@example.com',
                message: 'Short'
            };
            
            const validation = app.validateContactForm(formData);
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('訊息至少需要10個字');
        });
        
        test('should submit valid form', () => {
            const formData = {
                name: 'Test User',
                email: 'test@example.com',
                message: 'This is a valid test message'
            };
            
            const result = app.submitContactForm(formData);
            
            expect(result.success).toBe(true);
            expect(app.contactSubmissions.length).toBe(1);
        });
        
        test('should sanitize input', () => {
            const formData = {
                name: '<script>alert("XSS")</script>',
                email: 'test@example.com',
                message: 'Test message with <script>evil()</script>'
            };
            
            app.submitContactForm(formData);
            
            const submission = app.contactSubmissions[0];
            expect(submission.name).not.toContain('<script>');
            expect(submission.message).not.toContain('<script>');
        });
    });
    
    describe('Search Functionality', () => {
        test('should search across all content', () => {
            app.products = [
                { id: 1, name: '筆記型電腦', description: '高效能筆電' },
                { id: 2, name: '滑鼠', description: '無線滑鼠' }
            ];
            
            const results = app.globalSearch('筆');
            
            expect(results.products.length).toBe(1);
            expect(results.products[0].name).toContain('筆');
        });
        
        test('should highlight search terms', () => {
            const text = '這是測試文字';
            const highlighted = app.highlightSearchTerm(text, '測試');
            
            expect(highlighted).toContain('<mark>測試</mark>');
        });
        
        test('should save search history', () => {
            app.globalSearch('筆記型電腦');
            app.globalSearch('滑鼠');
            
            expect(app.searchHistory).toContain('筆記型電腦');
            expect(app.searchHistory).toContain('滑鼠');
            expect(app.searchHistory.length).toBeLessThanOrEqual(10);
        });
        
        test('should provide search suggestions', () => {
            app.searchHistory = ['筆記型電腦', '筆電配件', '滑鼠'];
            
            const suggestions = app.getSearchSuggestions('筆');
            
            expect(suggestions.length).toBe(2);
            expect(suggestions).toContain('筆記型電腦');
            expect(suggestions).toContain('筆電配件');
        });
    });
    
    describe('Page Rendering', () => {
        test('should render home page', () => {
            app.renderHomePage();
            
            const content = document.getElementById('app').innerHTML;
            expect(content).toContain('歡迎');
            expect(content).toContain('首頁');
        });
        
        test('should render product catalog', () => {
            app.products = [
                { id: 1, name: '商品1', price: 100 }
            ];
            
            app.renderProductsPage();
            
            const content = document.getElementById('app').innerHTML;
            expect(content).toContain('商品1');
            expect(content).toContain('100');
        });
        
        test('should render cart page', () => {
            app.addToCart({ id: 1, name: '商品1', price: 100 });
            
            app.renderCartPage();
            
            const content = document.getElementById('app').innerHTML;
            expect(content).toContain('購物車');
            expect(content).toContain('商品1');
        });
        
        test('should render login page', () => {
            app.renderLoginPage();
            
            const content = document.getElementById('app').innerHTML;
            expect(content).toContain('登入');
            expect(content).toContain('電子郵件');
            expect(content).toContain('密碼');
        });
        
        test('should render contact page', () => {
            app.renderContactPage();
            
            const content = document.getElementById('app').innerHTML;
            expect(content).toContain('聯絡我們');
            expect(content).toContain('姓名');
            expect(content).toContain('訊息');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle route not found', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();
            
            router.navigate('/non-existent-route');
            
            expect(document.getElementById('app').innerHTML).toContain('404');
            spy.mockRestore();
        });
        
        test('should handle cart errors gracefully', () => {
            const invalidProduct = { id: null, name: '', price: -100 };
            
            expect(() => app.addToCart(invalidProduct)).not.toThrow();
            expect(app.getLastError()).toContain('無效的商品');
        });
        
        test('should handle storage quota exceeded', () => {
            const largeData = 'x'.repeat(5 * 1024 * 1024);
            app.cart.items = [{ product: { name: largeData }, quantity: 1 }];
            
            expect(() => app.saveCart()).not.toThrow();
            expect(app.getLastError()).toContain('儲存空間');
        });
        
        test('should recover from corrupted localStorage', () => {
            localStorage.setItem('cart', 'invalid json {');
            
            expect(() => app.loadCart()).not.toThrow();
            expect(app.cart.items.length).toBe(0);
        });
    });
});