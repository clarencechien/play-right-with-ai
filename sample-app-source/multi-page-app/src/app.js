/**
 * Multi-Page Application
 * Complete implementation with routing, cart, auth, and more
 */

/**
 * MultiPageApp 類別
 */
class MultiPageApp {
    /**
     *
     * @param {*} router - router 參數
     */
    constructor(router) {
        this.router = router;
        this.products = [];
        this.cart = { items: [] };
        this.currentUser = null;
        this.users = [
            { id: 1, email: 'user@example.com', password: 'password123', name: '測試用戶' }
        ];
        this.contactSubmissions = [];
        this.searchHistory = [];
        this.lastError = null;
        this.init();
    }

    /**
     * init 方法
     */
    init() {
        this.setupRoutes();
        this.loadProducts();
        this.loadCart();
        this.loadSession();
        this.router.navigate(window.location.pathname || '/');
    }

    /**
     * setupRoutes 方法
     */
    setupRoutes() {
        // Define all application routes
        this.router.addRoute('/', () => this.renderHomePage());
        this.router.addRoute('/products', () => this.renderProductsPage());
        this.router.addRoute('/product/:id', (params) => this.renderProductDetail(params.id));
        this.router.addRoute('/cart', () => this.renderCartPage());
        this.router.addRoute('/login', () => this.renderLoginPage());
        this.router.addRoute('/register', () => this.renderRegisterPage());
        this.router.addRoute('/contact', () => this.renderContactPage());
        this.router.addRoute('/search', () => this.renderSearchPage());
        this.router.addRoute('/account', () => this.renderAccountPage());
        
        // Set 404 handler
        this.router.setNotFoundHandler(() => this.render404());
        
        // Set navigation guard for protected routes
        this.router.setNavigationGuard((to, from) => {
            const protectedRoutes = ['/account', '/checkout'];
            if (protectedRoutes.includes(to) && !this.isAuthenticated()) {
                this.router.navigate('/login');
                return false;
            }
            return true;
        });
    }

    // Product Management
    /**
     * loadProducts 方法
     */
    loadProducts() {
        this.products = [
            { id: 1, name: '筆記型電腦', category: '電子產品', price: 30000, image: '/img/laptop.jpg', description: '高效能筆電，適合工作和娛樂' },
            { id: 2, name: '無線滑鼠', category: '電子產品', price: 500, image: '/img/mouse.jpg', description: '人體工學設計，舒適操作' },
            { id: 3, name: '機械鍵盤', category: '電子產品', price: 2500, image: '/img/keyboard.jpg', description: '青軸機械鍵盤，打字體驗極佳' },
            { id: 4, name: '辦公椅', category: '家具', price: 5000, image: '/img/chair.jpg', description: '符合人體工學的辦公椅' },
            { id: 5, name: '書桌', category: '家具', price: 3000, image: '/img/desk.jpg', description: '寬敞的工作空間' },
            { id: 6, name: '檯燈', category: '家具', price: 800, image: '/img/lamp.jpg', description: 'LED護眼檯燈' },
            { id: 7, name: '筆記本', category: '文具', price: 50, image: '/img/notebook.jpg', description: 'A5尺寸精裝筆記本' },
            { id: 8, name: '原子筆', category: '文具', price: 20, image: '/img/pen.jpg', description: '順滑書寫原子筆' },
            { id: 9, name: '便利貼', category: '文具', price: 30, image: '/img/sticky.jpg', description: '彩色便利貼組合' },
            { id: 10, name: '資料夾', category: '文具', price: 45, image: '/img/folder.jpg', description: 'A4文件資料夾' }
        ];
    }

    /**
     *
     * @param {*} filters - filters 參數
     */
    filterProducts(filters = {}) {
        let filtered = [...this.products];
        
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }
        
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.price >= filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.price <= filters.maxPrice);
        }
        
        return filtered;
    }

    /**
     *
     * @param {*} searchTerm - searchTerm 參數
     */
    searchProducts(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.products.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    }

    /**
     *
     * @param {*} sortBy - sortBy 參數
     */
    sortProducts(sortBy) {
        const sorted = [...this.products];
        
        switch(sortBy) {
            case 'price_asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price_desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name_asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    }

    /**
     *
     * @param {*} page - page 參數
     * @param {*} pageSize - pageSize 參數
     */
    getProductsPage(page, pageSize = 10) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return this.products.slice(start, end);
    }

    // Shopping Cart
    /**
     *
     * @param {*} product - product 參數
     */
    addToCart(product) {
        try {
            if (!product || !product.id || product.price < 0) {
                throw new Error('無效的商品資料');
            }
            
            const existingItem = this.cart.items.find(item => item.product.id === product.id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.cart.items.push({
                    product: { ...product },
                    quantity: 1
                });
            }
            
            this.saveCart();
            this.updateCartUI();
            this.showNotification(`${product.name} 已加入購物車`);
        } catch (error) {
            this.lastError = error.message;
            console.error('Add to cart error:', error);
        }
    }

    /**
     *
     * @param {*} productId - productId 參數
     */
    removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(item => item.product.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    /**
     *
     * @param {*} productId - productId 參數
     * @param {*} quantity - quantity 參數
     */
    updateCartQuantity(productId, quantity) {
        const item = this.cart.items.find(i => i.product.id === productId);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    /**
     * getCartTotal 方法
     */
    getCartTotal() {
        return this.cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    /**
     * clearCart 方法
     */
    clearCart() {
        this.cart.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    /**
     * saveCart 方法
     */
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            this.lastError = '儲存空間不足，無法儲存購物車';
            console.error('Save cart error:', error);
        }
    }

    /**
     * loadCart 方法
     */
    loadCart() {
        try {
            const saved = localStorage.getItem('cart');
            if (saved) {
                this.cart = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Load cart error:', error);
            this.cart = { items: [] };
        }
    }

    /**
     * updateCartUI 方法
     */
    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // User Authentication
    /**
     *
     * @param {*} email - email 參數
     * @param {*} password - password 參數
     */
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password;
            this.saveSession();
            return { success: true };
        }
        
        return { success: false, error: '無效的電子郵件或密碼' };
    }

    /**
     * logout 方法
     */
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('user');
        this.router.navigate('/');
    }

    /**
     *
     * @param {*} userData - userData 參數
     */
    register(userData) {
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, error: '此電子郵件已存在' };
        }
        
        const newUser = {
            id: Date.now(),
            ...userData
        };
        
        this.users.push(newUser);
        return { success: true };
    }

    /**
     * isAuthenticated 方法
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * saveSession 方法
     */
    saveSession() {
        if (this.currentUser) {
            sessionStorage.setItem('user', JSON.stringify(this.currentUser));
        }
    }

    /**
     * loadSession 方法
     */
    loadSession() {
        try {
            const saved = sessionStorage.getItem('user');
            if (saved) {
                this.currentUser = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Load session error:', error);
        }
    }

    // Contact Form
    /**
     *
     * @param {*} formData - formData 參數
     */
    validateContactForm(formData) {
        const errors = [];
        
        if (!formData.name || formData.name.trim() === '') {
            errors.push('姓名為必填');
        }
        
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('電子郵件格式無效');
        }
        
        if (!formData.message || formData.message.length < 10) {
            errors.push('訊息至少需要10個字');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     *
     * @param {*} formData - formData 參數
     */
    submitContactForm(formData) {
        const validation = this.validateContactForm(formData);
        
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }
        
        // Sanitize input
        const sanitized = {
            name: this.sanitizeHtml(formData.name),
            email: this.sanitizeHtml(formData.email),
            message: this.sanitizeHtml(formData.message),
            submittedAt: new Date().toISOString()
        };
        
        this.contactSubmissions.push(sanitized);
        return { success: true };
    }

    /**
     *
     * @param {*} str - str 參數
     */
    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Search Functionality
    /**
     *
     * @param {*} searchTerm - searchTerm 參數
     */
    globalSearch(searchTerm) {
        this.searchHistory.unshift(searchTerm);
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        return {
            products: this.searchProducts(searchTerm),
            pages: this.searchPages(searchTerm)
        };
    }

    /**
     *
     * @param {*} searchTerm - searchTerm 參數
     */
    searchPages(searchTerm) {
        const pages = [
            { title: '首頁', path: '/', content: '歡迎來到我們的網站' },
            { title: '產品', path: '/products', content: '瀏覽我們的產品目錄' },
            { title: '聯絡我們', path: '/contact', content: '與我們聯繫' }
        ];
        
        const term = searchTerm.toLowerCase();
        return pages.filter(page => 
            page.title.toLowerCase().includes(term) ||
            page.content.toLowerCase().includes(term)
        );
    }

    /**
     *
     * @param {*} text - text 參數
     * @param {*} term - term 參數
     */
    highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     *
     * @param {*} prefix - prefix 參數
     */
    getSearchSuggestions(prefix) {
        const prefixLower = prefix.toLowerCase();
        return this.searchHistory.filter(term => 
            term.toLowerCase().startsWith(prefixLower)
        );
    }

    // Page Rendering
    /**
     * renderHomePage 方法
     */
    renderHomePage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page home-page">
                ${this.renderHeader()}
                <section class="hero">
                    <h1>歡迎來到線上商店</h1>
                    <p>探索我們精選的優質產品</p>
                    <a href="/products" data-route="/products" class="btn-primary">瀏覽產品</a>
                </section>
                
                <section class="featured-products">
                    <h2>精選產品</h2>
                    <div class="product-grid">
                        ${this.products.slice(0, 4).map(product => `
                            <div class="product-card">
                                <img src="${product.image || '/img/placeholder.jpg'}" alt="${product.name}">
                                <h3>${product.name}</h3>
                                <p class="price">NT$ ${product.price}</p>
                                <button onclick="app.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                    加入購物車
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </section>
                
                <section class="categories">
                    <h2>產品類別</h2>
                    <div class="category-list">
                        <a href="/products?category=電子產品" data-route="/products?category=電子產品">電子產品</a>
                        <a href="/products?category=家具" data-route="/products?category=家具">家具</a>
                        <a href="/products?category=文具" data-route="/products?category=文具">文具</a>
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * renderProductsPage 方法
     */
    renderProductsPage() {
        const params = this.router.getParams();
        let products = this.products;
        
        if (params.category) {
            products = this.filterProducts({ category: params.category });
        }
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page products-page">
                ${this.renderHeader()}
                <div class="page-content">
                    <aside class="filters">
                        <h3>篩選</h3>
                        <div class="filter-group">
                            <label>類別</label>
                            <select id="category-filter" onchange="app.handleCategoryFilter(this.value)">
                                <option value="">全部</option>
                                <option value="電子產品" ${params.category === '電子產品' ? 'selected' : ''}>電子產品</option>
                                <option value="家具" ${params.category === '家具' ? 'selected' : ''}>家具</option>
                                <option value="文具" ${params.category === '文具' ? 'selected' : ''}>文具</option>
                            </select>
                        </div>
                        
                        <div class="filter-group">
                            <label>價格範圍</label>
                            <input type="number" id="min-price" placeholder="最低價" />
                            <input type="number" id="max-price" placeholder="最高價" />
                            <button onclick="app.handlePriceFilter()">套用</button>
                        </div>
                        
                        <div class="filter-group">
                            <label>排序</label>
                            <select onchange="app.handleSort(this.value)">
                                <option value="">預設</option>
                                <option value="price_asc">價格由低到高</option>
                                <option value="price_desc">價格由高到低</option>
                                <option value="name_asc">名稱 A-Z</option>
                                <option value="name_desc">名稱 Z-A</option>
                            </select>
                        </div>
                    </aside>
                    
                    <main class="products-grid">
                        ${products.map(product => `
                            <div class="product-card">
                                <a href="/product/${product.id}" data-route="/product/${product.id}">
                                    <img src="${product.image || '/img/placeholder.jpg'}" alt="${product.name}">
                                </a>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p class="category">${product.category}</p>
                                    <p class="description">${product.description}</p>
                                    <p class="price">NT$ ${product.price}</p>
                                    <button onclick="app.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                                            class="btn-primary">
                                        加入購物車
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </main>
                </div>
            </div>
        `;
    }

    /**
     *
     * @param {*} productId - productId 參數
     */
    renderProductDetail(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        
        if (!product) {
            this.render404();
            return;
        }
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page product-detail-page">
                ${this.renderHeader()}
                <div class="product-detail">
                    <div class="product-image">
                        <img src="${product.image || '/img/placeholder.jpg'}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h1>${product.name}</h1>
                        <p class="category">${product.category}</p>
                        <p class="price">NT$ ${product.price}</p>
                        <p class="description">${product.description}</p>
                        
                        <div class="product-actions">
                            <div class="quantity-selector">
                                <button onclick="app.decreaseQuantity()">-</button>
                                <input type="number" id="quantity" value="1" min="1">
                                <button onclick="app.increaseQuantity()">+</button>
                            </div>
                            <button onclick="app.addToCartWithQuantity(${product.id})" class="btn-primary">
                                加入購物車
                            </button>
                        </div>
                        
                        <div class="product-meta">
                            <p>商品編號: ${product.id}</p>
                            <p>庫存狀態: 有貨</p>
                        </div>
                    </div>
                </div>
                
                <section class="related-products">
                    <h2>相關產品</h2>
                    <div class="product-grid">
                        ${this.products
                            .filter(p => p.category === product.category && p.id !== product.id)
                            .slice(0, 4)
                            .map(p => `
                                <div class="product-card">
                                    <a href="/product/${p.id}" data-route="/product/${p.id}">
                                        <img src="${p.image || '/img/placeholder.jpg'}" alt="${p.name}">
                                        <h3>${p.name}</h3>
                                        <p class="price">NT$ ${p.price}</p>
                                    </a>
                                </div>
                            `).join('')}
                    </div>
                </section>
            </div>
        `;
    }

    /**
     * renderCartPage 方法
     */
    renderCartPage() {
        const app = document.getElementById('app');
        const total = this.getCartTotal();
        
        app.innerHTML = `
            <div class="page cart-page">
                ${this.renderHeader()}
                <div class="cart-content">
                    <h1>購物車</h1>
                    
                    ${this.cart.items.length === 0 ? `
                        <div class="empty-cart">
                            <p>您的購物車是空的</p>
                            <a href="/products" data-route="/products" class="btn-primary">繼續購物</a>
                        </div>
                    ` : `
                        <div class="cart-items">
                            ${this.cart.items.map(item => `
                                <div class="cart-item">
                                    <img src="${item.product.image || '/img/placeholder.jpg'}" alt="${item.product.name}">
                                    <div class="item-details">
                                        <h3>${item.product.name}</h3>
                                        <p class="category">${item.product.category}</p>
                                    </div>
                                    <div class="item-quantity">
                                        <button onclick="app.updateCartQuantity(${item.product.id}, ${item.quantity - 1})">-</button>
                                        <span>${item.quantity}</span>
                                        <button onclick="app.updateCartQuantity(${item.product.id}, ${item.quantity + 1})">+</button>
                                    </div>
                                    <div class="item-price">
                                        NT$ ${item.product.price * item.quantity}
                                    </div>
                                    <button onclick="app.removeFromCart(${item.product.id})" class="btn-remove">
                                        移除
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>小計</span>
                                <span>NT$ ${total}</span>
                            </div>
                            <div class="summary-row">
                                <span>運費</span>
                                <span>NT$ ${total > 1000 ? 0 : 100}</span>
                            </div>
                            <div class="summary-row total">
                                <span>總計</span>
                                <span>NT$ ${total + (total > 1000 ? 0 : 100)}</span>
                            </div>
                            
                            <div class="cart-actions">
                                <button onclick="app.clearCart()" class="btn-secondary">清空購物車</button>
                                <button onclick="app.checkout()" class="btn-primary">結帳</button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * renderLoginPage 方法
     */
    renderLoginPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page login-page">
                ${this.renderHeader()}
                <div class="auth-container">
                    <form class="auth-form" onsubmit="app.handleLogin(event)">
                        <h1>登入</h1>
                        
                        <div class="form-group">
                            <label for="email">電子郵件</label>
                            <input type="email" id="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">密碼</label>
                            <input type="password" id="password" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">登入</button>
                        
                        <p class="auth-link">
                            還沒有帳號？ <a href="/register" data-route="/register">立即註冊</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * renderRegisterPage 方法
     */
    renderRegisterPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page register-page">
                ${this.renderHeader()}
                <div class="auth-container">
                    <form class="auth-form" onsubmit="app.handleRegister(event)">
                        <h1>註冊</h1>
                        
                        <div class="form-group">
                            <label for="name">姓名</label>
                            <input type="text" id="name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">電子郵件</label>
                            <input type="email" id="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">密碼</label>
                            <input type="password" id="password" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label for="confirm-password">確認密碼</label>
                            <input type="password" id="confirm-password" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">註冊</button>
                        
                        <p class="auth-link">
                            已有帳號？ <a href="/login" data-route="/login">立即登入</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * renderContactPage 方法
     */
    renderContactPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page contact-page">
                ${this.renderHeader()}
                <div class="contact-container">
                    <h1>聯絡我們</h1>
                    
                    <div class="contact-content">
                        <form class="contact-form" onsubmit="app.handleContactSubmit(event)">
                            <div class="form-group">
                                <label for="name">姓名</label>
                                <input type="text" id="name" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">電子郵件</label>
                                <input type="email" id="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="subject">主旨</label>
                                <input type="text" id="subject" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="message">訊息</label>
                                <textarea id="message" rows="5" required minlength="10"></textarea>
                            </div>
                            
                            <button type="submit" class="btn-primary">送出</button>
                        </form>
                        
                        <div class="contact-info">
                            <h2>聯絡資訊</h2>
                            <p>📍 地址: 台北市信義區信義路五段7號</p>
                            <p>📞 電話: (02) 1234-5678</p>
                            <p>📧 Email: contact@example.com</p>
                            <p>🕒 營業時間: 週一至週五 9:00-18:00</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * renderSearchPage 方法
     */
    renderSearchPage() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page search-page">
                ${this.renderHeader()}
                <div class="search-container">
                    <h1>搜尋</h1>
                    
                    <div class="search-box">
                        <input type="text" id="search-input" placeholder="搜尋產品..." 
                               onkeyup="app.handleSearch(event)">
                        <button onclick="app.performSearch()">搜尋</button>
                    </div>
                    
                    <div id="search-suggestions" class="suggestions"></div>
                    
                    <div id="search-results" class="search-results"></div>
                    
                    ${this.searchHistory.length > 0 ? `
                        <div class="search-history">
                            <h3>最近搜尋</h3>
                            <ul>
                                ${this.searchHistory.map(term => `
                                    <li onclick="app.searchFromHistory('${term}')">${term}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * renderAccountPage 方法
     */
    renderAccountPage() {
        if (!this.isAuthenticated()) {
            this.router.navigate('/login');
            return;
        }
        
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page account-page">
                ${this.renderHeader()}
                <div class="account-container">
                    <h1>我的帳號</h1>
                    
                    <div class="account-info">
                        <h2>個人資料</h2>
                        <p>姓名: ${this.currentUser.name}</p>
                        <p>電子郵件: ${this.currentUser.email}</p>
                        <p>會員編號: ${this.currentUser.id}</p>
                    </div>
                    
                    <div class="account-actions">
                        <button onclick="app.logout()" class="btn-secondary">登出</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * renderHeader 方法
     */
    renderHeader() {
        const cartCount = this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return `
            <header class="site-header">
                <nav class="main-nav">
                    <a href="/" data-route="/" class="logo">線上商店</a>
                    
                    <ul class="nav-menu">
                        <li><a href="/" data-route="/">首頁</a></li>
                        <li><a href="/products" data-route="/products">產品</a></li>
                        <li><a href="/contact" data-route="/contact">聯絡我們</a></li>
                    </ul>
                    
                    <div class="nav-actions">
                        <a href="/search" data-route="/search" class="nav-icon">🔍</a>
                        <a href="/cart" data-route="/cart" class="nav-icon">
                            🛒 <span class="cart-count">${cartCount}</span>
                        </a>
                        ${this.isAuthenticated() ? `
                            <a href="/account" data-route="/account" class="nav-icon">👤 ${this.currentUser.name}</a>
                        ` : `
                            <a href="/login" data-route="/login" class="nav-icon">登入</a>
                        `}
                    </div>
                </nav>
            </header>
        `;
    }

    /**
     * render404 方法
     */
    render404() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="page error-page">
                ${this.renderHeader()}
                <div class="error-content">
                    <h1>404</h1>
                    <p>找不到您要的頁面</p>
                    <a href="/" data-route="/" class="btn-primary">返回首頁</a>
                </div>
            </div>
        `;
    }

    // Event Handlers
    /**
     *
     * @param {*} event - event 參數
     */
    handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const result = this.login(email, password);
        
        if (result.success) {
            this.router.navigate('/');
        } else {
            alert(result.error);
        }
    }

    /**
     *
     * @param {*} event - event 參數
     */
    handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('密碼不相符');
            return;
        }
        
        const result = this.register({ name, email, password });
        
        if (result.success) {
            alert('註冊成功！請登入');
            this.router.navigate('/login');
        } else {
            alert(result.error);
        }
    }

    /**
     *
     * @param {*} event - event 參數
     */
    handleContactSubmit(event) {
        event.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        const result = this.submitContactForm(formData);
        
        if (result.success) {
            alert('訊息已送出，我們會盡快回覆您！');
            event.target.reset();
        } else {
            alert(result.errors.join('\n'));
        }
    }

    /**
     *
     * @param {*} event - event 參數
     */
    handleSearch(event) {
        const searchTerm = event.target.value;
        
        if (searchTerm.length > 2) {
            const suggestions = this.getSearchSuggestions(searchTerm);
            const suggestionsEl = document.getElementById('search-suggestions');
            
            if (suggestions.length > 0) {
                suggestionsEl.innerHTML = suggestions.map(s => 
                    `<div onclick="app.searchFromHistory('${s}')">${s}</div>`
                ).join('');
            } else {
                suggestionsEl.innerHTML = '';
            }
        }
        
        if (event.key === 'Enter') {
            this.performSearch();
        }
    }

    /**
     * performSearch 方法
     */
    performSearch() {
        const searchTerm = document.getElementById('search-input').value;
        
        if (!searchTerm) return;
        
        const results = this.globalSearch(searchTerm);
        const resultsEl = document.getElementById('search-results');
        
        resultsEl.innerHTML = `
            <h2>搜尋結果</h2>
            ${results.products.length > 0 ? `
                <div class="product-results">
                    <h3>產品</h3>
                    ${results.products.map(p => `
                        <div class="result-item">
                            <a href="/product/${p.id}" data-route="/product/${p.id}">
                                ${this.highlightSearchTerm(p.name, searchTerm)}
                            </a>
                            <p>${p.category} - NT$ ${p.price}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>沒有找到相關產品</p>'}
        `;
    }

    /**
     *
     * @param {*} term - term 參數
     */
    searchFromHistory(term) {
        document.getElementById('search-input').value = term;
        this.performSearch();
    }

    /**
     *
     * @param {*} category - category 參數
     */
    handleCategoryFilter(category) {
        if (category) {
            this.router.navigate(`/products?category=${category}`);
        } else {
            this.router.navigate('/products');
        }
    }

    /**
     * handlePriceFilter 方法
     */
    handlePriceFilter() {
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        // Implementation for price filtering
    }

    /**
     *
     * @param {*} sortBy - sortBy 參數
     */
    handleSort(sortBy) {
        // Implementation for sorting
    }

    /**
     *
     * @param {*} productId - productId 參數
     */
    addToCartWithQuantity(productId) {
        const quantity = parseInt(document.getElementById('quantity').value) || 1;
        const product = this.products.find(p => p.id === productId);
        
        if (product) {
            for (let i = 0; i < quantity; i++) {
                this.addToCart(product);
            }
        }
    }

    /**
     * increaseQuantity 方法
     */
    increaseQuantity() {
        const input = document.getElementById('quantity');
        input.value = parseInt(input.value) + 1;
    }

    /**
     * decreaseQuantity 方法
     */
    decreaseQuantity() {
        const input = document.getElementById('quantity');
        const current = parseInt(input.value);
        if (current > 1) {
            input.value = current - 1;
        }
    }

    /**
     * checkout 方法
     */
    checkout() {
        if (!this.isAuthenticated()) {
            alert('請先登入');
            this.router.navigate('/login');
            return;
        }
        
        alert('結帳功能開發中...');
    }

    /**
     *
     * @param {*} message - message 參數
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * getLastError 方法
     */
    getLastError() {
        return this.lastError || '';
    }
}

// Initialize app when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const router = new Router();
        window.app = new MultiPageApp(router);
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiPageApp;
}