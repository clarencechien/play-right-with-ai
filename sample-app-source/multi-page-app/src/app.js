/**
 * 多頁面應用主程式
 * 實現產品管理、表單處理和狀態管理
 */

class MultiPageApp {
    constructor() {
        this.router = new Router();
        this.products = this.generateProducts();
        this.formData = {};
        this.filterState = {
            search: '',
            category: 'all'
        };
        this.init();
    }

    init() {
        this.setupRoutes();
        this.bindEvents();
        this.loadInitialRoute();
    }

    setupRoutes() {
        this.router.register('home', {
            pageId: 'homePage',
            title: '首頁 - 多頁面應用範例',
            breadcrumb: []
        });

        this.router.register('about', {
            pageId: 'aboutPage',
            title: '關於我們 - 多頁面應用範例',
            breadcrumb: [
                { route: 'home', text: '首頁' },
                { route: 'about', text: '關於' }
            ]
        });

        this.router.register('products', {
            pageId: 'productsPage',
            title: '產品列表 - 多頁面應用範例',
            breadcrumb: [
                { route: 'home', text: '首頁' },
                { route: 'products', text: '產品' }
            ],
            onLoad: () => this.loadProducts()
        });

        this.router.register('contact', {
            pageId: 'contactPage',
            title: '聯絡我們 - 多頁面應用範例',
            breadcrumb: [
                { route: 'home', text: '首頁' },
                { route: 'contact', text: '聯絡' }
            ],
            onLoad: () => this.restoreFormData()
        });
    }

    bindEvents() {
        // 導航連結
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.dataset.nav;
                this.router.navigate(route);
            });
        });

        // 漢堡選單
        const hamburger = document.getElementById('hamburgerMenu');
        const nav = document.getElementById('navigation');
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                nav.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // 產品搜尋和篩選
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterState.search = e.target.value;
                this.filterProducts();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterState.category = e.target.value;
                this.filterProducts();
            });
        }

        // 聯絡表單
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });

            // 保存表單資料
            contactForm.querySelectorAll('input, textarea').forEach(field => {
                field.addEventListener('input', (e) => {
                    this.formData[field.id] = e.target.value;
                });
            });
        }

        // Modal 關閉
        const closeModal = document.querySelector('[data-testid="close-modal"]');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeProductModal());
        }

        // 點擊 modal 外部關閉
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }
    }

    loadInitialRoute() {
        const route = this.router.getRouteFromHash();
        this.router.loadRoute(route);
    }

    generateProducts() {
        return [
            { id: 1, name: '筆記型電腦', category: '電子產品', price: 35000, description: '高效能商務筆電，適合專業工作使用' },
            { id: 2, name: '辦公椅', category: '家具', price: 8000, description: '人體工學設計，長時間使用也舒適' },
            { id: 3, name: '智慧手錶', category: '電子產品', price: 12000, description: '健康監測與智慧提醒功能' },
            { id: 4, name: '外套', category: '服飾', price: 3500, description: '防風防水，四季皆宜' },
            { id: 5, name: '書桌', category: '家具', price: 6500, description: '簡約設計，收納方便' },
            { id: 6, name: '無線耳機', category: '電子產品', price: 4500, description: '主動降噪，音質出色' }
        ];
    }

    loadProducts() {
        const productList = document.getElementById('productList');
        if (!productList) return;

        // 恢復篩選狀態
        const searchInput = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (searchInput) searchInput.value = this.filterState.search;
        if (categoryFilter) categoryFilter.value = this.filterState.category;

        this.renderProducts();
    }

    renderProducts() {
        const productList = document.getElementById('productList');
        if (!productList) return;

        const filteredProducts = this.getFilteredProducts();

        if (filteredProducts.length === 0) {
            productList.innerHTML = '<div class="no-products">沒有找到符合的產品</div>';
            return;
        }

        productList.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-testid="product-item">
                <div class="product-image">📦</div>
                <h3>${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">NT$ ${product.price.toLocaleString()}</p>
                <button 
                    class="view-details-btn" 
                    data-testid="view-details"
                    onclick="app.showProductDetails(${product.id})"
                >
                    查看詳情
                </button>
            </div>
        `).join('');
    }

    getFilteredProducts() {
        let filtered = this.products;

        // 搜尋篩選
        if (this.filterState.search) {
            const search = this.filterState.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }

        // 分類篩選
        if (this.filterState.category !== 'all') {
            filtered = filtered.filter(p => p.category === this.filterState.category);
        }

        return filtered;
    }

    filterProducts() {
        this.renderProducts();
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        title.textContent = product.name;
        body.innerHTML = `
            <p><strong>類別：</strong>${product.category}</p>
            <p><strong>價格：</strong>NT$ ${product.price.toLocaleString()}</p>
            <p><strong>說明：</strong>${product.description}</p>
            <div class="modal-actions">
                <button onclick="app.closeProductModal()">關閉</button>
                <button class="primary">加入購物車</button>
            </div>
        `;

        modal.classList.add('active');
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
    }

    handleFormSubmit() {
        const form = document.getElementById('contactForm');
        const errors = this.validateForm(form);

        // 清除先前的錯誤訊息
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        if (Object.keys(errors).length > 0) {
            // 顯示錯誤訊息
            Object.entries(errors).forEach(([field, message]) => {
                const errorEl = document.querySelector(`[data-testid="${field}-error"]`);
                if (errorEl) {
                    errorEl.textContent = message;
                    errorEl.style.display = 'block';
                }
            });
            return;
        }

        // 模擬表單提交
        this.showSuccessMessage();
        this.clearForm();
    }

    validateForm(form) {
        const errors = {};
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name) {
            errors.name = '請輸入姓名';
        }

        if (!email) {
            errors.email = '請輸入 email';
        } else if (!this.isValidEmail(email)) {
            errors.email = '請輸入有效的 email';
        }

        if (!message) {
            errors.message = '請輸入訊息';
        }

        return errors;
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    showSuccessMessage() {
        const successEl = document.getElementById('successMessage');
        successEl.textContent = '感謝您的訊息！我們會盡快回覆您。';
        successEl.style.display = 'block';

        setTimeout(() => {
            successEl.style.display = 'none';
        }, 5000);
    }

    clearForm() {
        const form = document.getElementById('contactForm');
        form.reset();
        this.formData = {};
    }

    restoreFormData() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        Object.entries(this.formData).forEach(([fieldId, value]) => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                field.value = value;
            }
        });
    }

    navigate(route) {
        this.router.navigate(route);
    }
}

// 初始化應用
const app = new MultiPageApp();