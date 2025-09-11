/**
 * 智能購物清單應用程式
 * 實現分類管理、預算追蹤等進階功能
 */

class ShoppingListApp {
    constructor() {
        this.items = [];
        this.budget = 0;
        this.categories = ['食品', '日用品', '電子產品', '服飾', '其他'];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 新增商品
        document.getElementById('addButton').addEventListener('click', () => this.addItem());
        document.getElementById('itemName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });

        // 搜尋與篩選
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.render();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });

        // 預算設定
        document.getElementById('setBudget').addEventListener('click', () => this.setBudget());
        document.getElementById('budgetInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setBudget();
        });

        // 批量操作
        document.getElementById('clearPurchased').addEventListener('click', () => this.clearPurchased());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('exportList').addEventListener('click', () => this.exportList());
        document.getElementById('shareList').addEventListener('click', () => this.shareList());
    }

    addItem() {
        const nameInput = document.getElementById('itemName');
        const quantityInput = document.getElementById('itemQuantity');
        const categoryInput = document.getElementById('itemCategory');
        const priceInput = document.getElementById('itemPrice');

        const name = nameInput.value.trim();
        if (name === '') return;

        const item = {
            id: Date.now(),
            name: this.escapeHtml(name),
            quantity: parseInt(quantityInput.value) || 1,
            category: categoryInput.value,
            price: parseFloat(priceInput.value) || 0,
            purchased: false,
            createdAt: new Date().toISOString()
        };

        this.items.push(item);
        this.saveToStorage();
        this.render();

        // 清空表單
        nameInput.value = '';
        quantityInput.value = '1';
        priceInput.value = '';
        nameInput.focus();
    }

    togglePurchased(id) {
        const item = this.items.find(i => i.id === id);
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

    updateQuantity(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + delta);
            this.saveToStorage();
            this.render();
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.saveToStorage();
        this.render();
    }

    setBudget() {
        const budgetInput = document.getElementById('budgetInput');
        const budget = parseFloat(budgetInput.value);
        
        if (!isNaN(budget) && budget >= 0) {
            this.budget = budget;
            this.saveToStorage();
            this.updateBudgetDisplay();
            budgetInput.value = '';
        }
    }

    updateBudgetDisplay() {
        document.getElementById('budgetDisplay').textContent = `預算: NT$ ${this.budget}`;
    }

    getFilteredItems() {
        let filtered = this.items;

        // 搜尋篩選
        if (this.searchTerm) {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // 分類篩選
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.category === this.currentFilter);
        }

        return filtered;
    }

    groupByCategory(items) {
        return items.reduce((groups, item) => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
            return groups;
        }, {});
    }

    render() {
        const listContainer = document.getElementById('shoppingList');
        const filteredItems = this.getFilteredItems();

        if (filteredItems.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">購物清單是空的</div>';
        } else {
            const grouped = this.groupByCategory(filteredItems);
            
            listContainer.innerHTML = Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => `
                    <div class="category-section" data-testid="category-section-${category}">
                        <h3>${category} (${items.length})</h3>
                        <div class="items-list">
                            ${items.map(item => this.renderItem(item)).join('')}
                        </div>
                    </div>
                `).join('');
        }

        this.updateStats();
        this.updateBudgetDisplay();
    }

    renderItem(item) {
        return `
            <div class="shopping-item ${item.purchased ? 'purchased' : ''}" data-testid="shopping-item">
                <input 
                    type="checkbox"
                    data-testid="item-checkbox"
                    ${item.purchased ? 'checked' : ''}
                    onchange="shoppingApp.togglePurchased(${item.id})"
                >
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-category">${item.category}</span>
                </div>
                <div class="quantity-control">
                    <button 
                        data-testid="decrease-quantity"
                        onclick="shoppingApp.updateQuantity(${item.id}, -1)"
                    >-</button>
                    <span data-testid="quantity-display">${item.quantity}</span>
                    <button 
                        data-testid="increase-quantity"
                        onclick="shoppingApp.updateQuantity(${item.id}, 1)"
                    >+</button>
                </div>
                ${item.price > 0 ? `
                    <span class="item-price">NT$ ${(item.price * item.quantity).toFixed(0)}</span>
                ` : ''}
                <button 
                    class="delete-btn"
                    data-testid="delete-button"
                    onclick="shoppingApp.deleteItem(${item.id})"
                >×</button>
            </div>
        `;
    }

    updateStats() {
        const total = this.items.length;
        const purchased = this.items.filter(i => i.purchased).length;
        const totalPrice = this.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        document.getElementById('totalCount').textContent = `總計: ${total}`;
        document.getElementById('purchasedCount').textContent = `已購買: ${purchased}`;
        document.getElementById('totalPrice').textContent = `總價: NT$ ${totalPrice.toFixed(0)}`;

        // 預算警告
        if (this.budget > 0 && totalPrice > this.budget) {
            document.getElementById('totalPrice').style.color = '#dc3545';
        } else {
            document.getElementById('totalPrice').style.color = '';
        }
    }

    clearPurchased() {
        this.items = this.items.filter(i => !i.purchased);
        this.saveToStorage();
        this.render();
    }

    clearAll() {
        if (confirm('確定要清空整個購物清單嗎？')) {
            this.items = [];
            this.saveToStorage();
            this.render();
        }
    }

    exportList() {
        const data = {
            exported: new Date().toISOString(),
            budget: this.budget,
            items: this.items,
            stats: {
                total: this.items.length,
                purchased: this.items.filter(i => i.purchased).length,
                totalPrice: this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopping-list-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    shareList() {
        const text = this.items.map(item => 
            `${item.purchased ? '✓' : '○'} ${item.name} x${item.quantity} (${item.category})`
        ).join('\n');

        if (navigator.share) {
            navigator.share({
                title: '我的購物清單',
                text: text
            }).catch(() => {
                this.copyToClipboard(text);
            });
        } else {
            this.copyToClipboard(text);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('清單已複製到剪貼簿！');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('清單已複製到剪貼簿！');
        }
    }

    saveToStorage() {
        localStorage.setItem('shoppingItems', JSON.stringify(this.items));
        localStorage.setItem('shoppingBudget', this.budget.toString());
    }

    loadFromStorage() {
        const savedItems = localStorage.getItem('shoppingItems');
        const savedBudget = localStorage.getItem('shoppingBudget');

        if (savedItems) {
            try {
                this.items = JSON.parse(savedItems);
            } catch (e) {
                console.error('載入購物清單失敗:', e);
                this.items = [];
            }
        }

        if (savedBudget) {
            this.budget = parseFloat(savedBudget) || 0;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化應用
const shoppingApp = new ShoppingListApp();