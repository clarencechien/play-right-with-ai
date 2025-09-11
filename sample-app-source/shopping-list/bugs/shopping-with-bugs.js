/**
 * Shopping List App - Version with Intentional Bugs
 * Contains 10 intentional bugs for testing and debugging practice
 */

/**
 * ShoppingListApp 類別
 */
class ShoppingListApp {
    /**
     * 初始化建構函式
     */
    constructor() {
        this.items = [];
        this.budgetLimit = 0;
        this.categories = ['食品', '日用品', '其他'];
        this.lastError = null;
        this.init();
    }

    /**
     * init 方法
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.checkURLImport();
        this.render();
    }

    // BUG 1: Missing validation for empty string after trim
    /**
     *
     * @param {*} item - item 參數
     */
    addItem(item) {
        // Validation
        if (!item.name) { // Should check item.name.trim() === ''
            throw new Error('品項名稱為必填');
        }
        
        if (item.quantity !== undefined && item.quantity <= 0) {
            throw new Error('數量必須大於0');
        }
        
        if (item.price !== undefined && item.price < 0) {
            throw new Error('價格不能為負數');
        }

        const newItem = {
            // BUG 2: Using Date.now() alone causes duplicate IDs when adding items quickly
            id: Date.now(), // Should be Date.now() + Math.random()
            name: item.name.trim(),
            category: item.category || '其他',
            quantity: item.quantity || 1,
            price: item.price || 0,
            priority: item.priority || false,
            purchased: item.purchased || false,
            createdAt: new Date().toISOString()
        };

        this.items.push(newItem);
        // BUG 3: Not saving to storage after adding item
        // Missing: this.saveToStorage();
        this.render();
        
        if (this.isBudgetExceeded()) {
            this.showBudgetWarning();
        }
        
        return newItem;
    }

    /**
     *
     * @param {*} itemId - itemId 參數
     */
    deleteItem(itemId) {
        // BUG 4: Using filter instead of findIndex causes wrong item deletion
        this.items = this.items.filter(item => item.id != itemId); // Should use !== for strict comparison
        this.saveToStorage();
        this.render();
    }

    /**
     *
     * @param {*} itemId - itemId 參數
     * @param {*} newQuantity - newQuantity 參數
     */
    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(i => i.id === itemId);
        // BUG 5: Allows quantity to be 0 or negative
        if (item) { // Should check: if (item && newQuantity > 0)
            item.quantity = newQuantity;
            this.saveToStorage();
            this.render();
            
            if (this.isBudgetExceeded()) {
                this.showBudgetWarning();
            }
        }
    }

    /**
     *
     * @param {*} itemId - itemId 參數
     */
    togglePurchased(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.purchased = !item.purchased;
            if (item.purchased) {
                item.purchasedAt = new Date().toISOString();
            } else {
                delete item.purchasedAt;
            }
            this.saveToStorage();
            this.render();
        }
    }

    /**
     *
     * @param {*} itemId - itemId 參數
     */
    togglePriority(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            item.priority = !item.priority;
            this.saveToStorage();
            this.render();
        }
    }

    /**
     *
     * @param {*} limit - limit 參數
     */
    setBudgetLimit(limit) {
        // BUG 6: Not preventing negative budget limits
        this.budgetLimit = limit; // Should be Math.max(0, limit)
        this.saveToStorage();
        this.render();
    }

    /**
     * calculateTotal 方法
     */
    calculateTotal() {
        return this.items.reduce((total, item) => {
            // BUG 7: Including purchased items in budget calculation
            return total + (item.price * item.quantity); // Should exclude purchased items
        }, 0);
    }

    /**
     * isBudgetExceeded 方法
     */
    isBudgetExceeded() {
        if (this.budgetLimit === 0) return false;
        return this.calculateTotal() > this.budgetLimit;
    }

    /**
     * getBudgetStatus 方法
     */
    getBudgetStatus() {
        const total = this.calculateTotal();
        const remaining = this.budgetLimit - total;
        
        if (this.budgetLimit === 0) {
            return `總計: NT$ ${total}`;
        }
        
        if (remaining < 0) {
            return `超出預算: NT$ ${Math.abs(remaining)}`;
        }
        
        return `剩餘預算: NT$ ${remaining}`;
    }

    /**
     * getRemainingBudget 方法
     */
    getRemainingBudget() {
        return Math.max(0, this.budgetLimit - this.calculateTotal());
    }

    /**
     * showBudgetWarning 方法
     */
    showBudgetWarning() {
        const warning = document.querySelector('.budget-warning');
        if (warning) {
            warning.classList.add('active');
            warning.textContent = '⚠️ 預算超支警告！';
            // BUG 8: Warning never disappears
            // Missing setTimeout to remove active class
        }
    }

    /**
     *
     * @param {*} category - category 參數
     */
    filterByCategory(category) {
        if (category === '全部') return this.items;
        return this.items.filter(item => item.category === category);
    }

    /**
     *
     * @param {*} searchTerm - searchTerm 參數
     */
    searchItems(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.items.filter(item => 
            item.name.toLowerCase().includes(term)
        );
    }

    /**
     * getPriorityItems 方法
     */
    getPriorityItems() {
        return this.items.filter(item => item.priority);
    }

    /**
     * getUnpurchasedItems 方法
     */
    getUnpurchasedItems() {
        return this.items.filter(item => !item.purchased);
    }

    /**
     * getCategoryStats 方法
     */
    getCategoryStats() {
        const stats = {};
        
        this.categories.forEach(category => {
            const categoryItems = this.filterByCategory(category);
            stats[category] = {
                count: categoryItems.length,
                total: categoryItems.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                )
            };
        });
        
        return stats;
    }

    /**
     * saveToStorage 方法
     */
    saveToStorage() {
        try {
            const data = {
                items: this.items,
                budgetLimit: this.budgetLimit,
                lastSaved: new Date().toISOString()
            };
            // BUG 9: Using wrong localStorage key
            localStorage.setItem('shoppingListData', JSON.stringify(data)); // Should be 'shoppingList'
            this.lastError = null;
        } catch (error) {
            this.lastError = '儲存空間不足，無法儲存資料';
            console.error('Storage error:', error);
        }
    }

    /**
     * loadFromStorage 方法
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('shoppingList'); // Inconsistent with saveToStorage
            if (saved) {
                const data = JSON.parse(saved);
                this.items = data.items || [];
                this.budgetLimit = data.budgetLimit || 0;
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    }

    /**
     * exportToCSV 方法
     */
    exportToCSV() {
        const headers = '名稱,類別,數量,單價,總價,優先,已購買';
        const rows = this.items.map(item => {
            return [
                item.name,
                item.category,
                item.quantity,
                item.price,
                item.price * item.quantity,
                item.priority ? '是' : '否',
                item.purchased ? '是' : '否'
            ].join(',');
        });
        
        return [headers, ...rows].join('\n');
    }

    /**
     * exportToJSON 方法
     */
    exportToJSON() {
        return JSON.stringify({
            items: this.items,
            budgetLimit: this.budgetLimit,
            totalBudget: this.calculateTotal(),
            exportDate: new Date().toISOString(),
            stats: this.getCategoryStats()
        }, null, 2);
    }

    /**
     *
     * @param {*} content - content 參數
     * @param {*} filename - filename 參數
     * @param {*} type - type 參數
     */
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * generateShareURL 方法
     */
    generateShareURL() {
        const data = {
            items: this.items,
            budgetLimit: this.budgetLimit
        };
        const encoded = btoa(JSON.stringify(data));
        return `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    }

    /**
     *
     * @param {*} url - url 參數
     */
    importFromURL(url) {
        try {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const encodedData = urlParams.get('data');
            
            if (encodedData) {
                const data = JSON.parse(atob(encodedData));
                if (data.items) {
                    data.items.forEach(item => {
                        item.id = Date.now() + Math.random();
                        this.items.push(item);
                    });
                }
                if (data.budgetLimit) {
                    this.budgetLimit = data.budgetLimit;
                }
                this.saveToStorage();
                this.render();
            }
        } catch (error) {
            console.error('Import error:', error);
            this.lastError = '導入失敗，資料格式錯誤';
        }
    }

    /**
     * checkURLImport 方法
     */
    checkURLImport() {
        if (window.location.search) {
            this.importFromURL(window.location.href);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * render 方法
     */
    render() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="shopping-app">
                <header class="app-header">
                    <h1>🛒 智能購物清單</h1>
                    <div class="budget-display">
                        ${this.getBudgetStatus()}
                    </div>
                </header>

                <div class="budget-warning"></div>

                <div class="controls">
                    <div class="add-item-form">
                        <input type="text" id="item-name" placeholder="品項名稱" />
                        <select id="item-category">
                            ${this.categories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                        <input type="number" id="item-quantity" placeholder="數量" min="1" value="1" />
                        <input type="number" id="item-price" placeholder="單價" min="0" />
                        <button id="add-btn" class="btn-primary">新增</button>
                    </div>

                    <div class="budget-control">
                        <input type="number" id="budget-limit" placeholder="設定預算上限" 
                               value="${this.budgetLimit}" min="0" />
                        <button id="set-budget-btn" class="btn-secondary">設定預算</button>
                    </div>

                    <div class="filter-controls">
                        <input type="text" id="search-input" placeholder="搜尋品項..." />
                        <select id="category-filter">
                            <option value="全部">全部類別</option>
                            ${this.categories.map(cat => 
                                `<option value="${cat}">${cat}</option>`
                            ).join('')}
                        </select>
                        <button id="priority-filter" class="btn-filter">只顯示優先</button>
                        <button id="unpurchased-filter" class="btn-filter">只顯示未購買</button>
                    </div>
                </div>

                <div class="stats-panel">
                    ${this.renderStats()}
                </div>

                <div class="shopping-list">
                    ${this.renderItems()}
                </div>

                <div class="export-controls">
                    <button id="export-csv" class="btn-export">匯出 CSV</button>
                    <button id="export-json" class="btn-export">匯出 JSON</button>
                    <button id="share-url" class="btn-export">分享連結</button>
                    <button id="clear-purchased" class="btn-danger">清除已購買</button>
                    <button id="clear-all" class="btn-danger">清除全部</button>
                </div>

                ${this.lastError ? `
                    <div class="error-message">
                        ${this.lastError}
                    </div>
                ` : ''}
            </div>
        `;

        // BUG 10: Not re-binding event listeners after render
        // Missing: this.setupEventListeners();
    }

    /**
     * renderItems 方法
     */
    renderItems() {
        if (this.items.length === 0) {
            return '<div class="empty-state">目前沒有任何品項</div>';
        }

        const searchTerm = document.getElementById('search-input')?.value || '';
        const categoryFilter = document.getElementById('category-filter')?.value || '全部';
        const showPriorityOnly = document.getElementById('priority-filter')?.classList.contains('active');
        const showUnpurchasedOnly = document.getElementById('unpurchased-filter')?.classList.contains('active');

        let filteredItems = [...this.items];

        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== '全部') {
            filteredItems = filteredItems.filter(item => item.category === categoryFilter);
        }

        if (showPriorityOnly) {
            filteredItems = filteredItems.filter(item => item.priority);
        }

        if (showUnpurchasedOnly) {
            filteredItems = filteredItems.filter(item => !item.purchased);
        }

        filteredItems.sort((a, b) => {
            if (a.priority !== b.priority) return b.priority ? 1 : -1;
            if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return filteredItems.map(item => `
            <div class="shopping-item ${item.purchased ? 'purchased' : ''} ${item.priority ? 'priority' : ''}"
                 data-id="${item.id}">
                <div class="item-checkbox">
                    <input type="checkbox" 
                           ${item.purchased ? 'checked' : ''} 
                           onchange="app.togglePurchased(${item.id})" />
                </div>
                <div class="item-content">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span class="category-tag">${item.category}</span>
                        <span class="price-tag">NT$ ${item.price}</span>
                    </div>
                </div>
                <div class="item-quantity">
                    <button onclick="app.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="app.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    NT$ ${item.price * item.quantity}
                </div>
                <div class="item-actions">
                    <button class="btn-icon ${item.priority ? 'active' : ''}" 
                            onclick="app.togglePriority(${item.id})"
                            title="優先">⭐</button>
                    <button class="btn-icon delete" 
                            onclick="app.deleteItem(${item.id})"
                            title="刪除">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * renderStats 方法
     */
    renderStats() {
        const stats = this.getCategoryStats();
        const total = this.calculateTotal();
        const itemCount = this.items.length;
        const purchasedCount = this.items.filter(i => i.purchased).length;

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">總品項</div>
                    <div class="stat-value">${itemCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">已購買</div>
                    <div class="stat-value">${purchasedCount}/${itemCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">總金額</div>
                    <div class="stat-value">NT$ ${total}</div>
                </div>
                ${Object.entries(stats).map(([category, data]) => `
                    <div class="stat-card">
                        <div class="stat-label">${category}</div>
                        <div class="stat-value">${data.count} 項 / NT$ ${data.total}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * setupEventListeners 方法
     */
    setupEventListeners() {
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const name = document.getElementById('item-name').value;
                const category = document.getElementById('item-category').value;
                const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
                const price = parseFloat(document.getElementById('item-price').value) || 0;

                try {
                    this.addItem({ name, category, quantity, price });
                    document.getElementById('item-name').value = '';
                    document.getElementById('item-quantity').value = '1';
                    document.getElementById('item-price').value = '';
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        const setBudgetBtn = document.getElementById('set-budget-btn');
        if (setBudgetBtn) {
            setBudgetBtn.addEventListener('click', () => {
                const limit = parseFloat(document.getElementById('budget-limit').value) || 0;
                this.setBudgetLimit(limit);
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.render());
        }

        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.render());
        }

        const priorityFilter = document.getElementById('priority-filter');
        if (priorityFilter) {
            priorityFilter.addEventListener('click', () => {
                priorityFilter.classList.toggle('active');
                this.render();
            });
        }

        const unpurchasedFilter = document.getElementById('unpurchased-filter');
        if (unpurchasedFilter) {
            unpurchasedFilter.addEventListener('click', () => {
                unpurchasedFilter.classList.toggle('active');
                this.render();
            });
        }

        const exportCSV = document.getElementById('export-csv');
        if (exportCSV) {
            exportCSV.addEventListener('click', () => {
                const csv = this.exportToCSV();
                this.downloadFile(csv, `shopping-list-${Date.now()}.csv`, 'text/csv');
            });
        }

        const exportJSON = document.getElementById('export-json');
        if (exportJSON) {
            exportJSON.addEventListener('click', () => {
                const json = this.exportToJSON();
                this.downloadFile(json, `shopping-list-${Date.now()}.json`, 'application/json');
            });
        }

        const shareURL = document.getElementById('share-url');
        if (shareURL) {
            shareURL.addEventListener('click', () => {
                const url = this.generateShareURL();
                navigator.clipboard.writeText(url).then(() => {
                    alert('分享連結已複製到剪貼簿！');
                });
            });
        }

        const clearPurchased = document.getElementById('clear-purchased');
        if (clearPurchased) {
            clearPurchased.addEventListener('click', () => {
                if (confirm('確定要清除所有已購買的品項嗎？')) {
                    this.items = this.items.filter(item => !item.purchased);
                    this.saveToStorage();
                    this.render();
                }
            });
        }

        const clearAll = document.getElementById('clear-all');
        if (clearAll) {
            clearAll.addEventListener('click', () => {
                if (confirm('確定要清除所有品項嗎？此操作無法復原！')) {
                    this.items = [];
                    this.saveToStorage();
                    this.render();
                }
            });
        }

        const itemName = document.getElementById('item-name');
        if (itemName) {
            itemName.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addBtn?.click();
                }
            });
        }
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
        window.app = new ShoppingListApp();
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingListApp;
}

/**
 * BUG SUMMARY:
 * 1. Missing validation for empty string after trim in addItem()
 * 2. Using Date.now() alone causes duplicate IDs when adding items quickly
 * 3. Not saving to storage after adding item
 * 4. Using != instead of !== for comparison in deleteItem()
 * 5. Allows quantity to be 0 or negative in updateQuantity()
 * 6. Not preventing negative budget limits in setBudgetLimit()
 * 7. Including purchased items in budget calculation
 * 8. Budget warning never disappears (missing setTimeout)
 * 9. Using wrong localStorage key in saveToStorage()
 * 10. Not re-binding event listeners after render()
 */