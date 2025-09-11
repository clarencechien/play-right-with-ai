/**
 * Shopping List App Test Suite
 * TDD approach - Write tests first, then implement
 */

describe('Shopping List App', () => {
    let app;
    
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = `
            <div id="app"></div>
        `;
        
        // Clear localStorage
        localStorage.clear();
        
        // Initialize app
        app = new ShoppingListApp();
    });
    
    describe('Item Management', () => {
        test('should add item to list', () => {
            const item = {
                name: '牛奶',
                category: '食品',
                quantity: 2,
                price: 85
            };
            
            app.addItem(item);
            
            expect(app.items.length).toBe(1);
            expect(app.items[0]).toMatchObject(item);
            expect(app.items[0].id).toBeDefined();
            expect(app.items[0].priority).toBe(false);
            expect(app.items[0].purchased).toBe(false);
        });
        
        test('should validate required fields', () => {
            const item = { name: '' };
            
            expect(() => app.addItem(item)).toThrow('品項名稱為必填');
        });
        
        test('should delete item from list', () => {
            const item = { name: '麵包', category: '食品' };
            app.addItem(item);
            const itemId = app.items[0].id;
            
            app.deleteItem(itemId);
            
            expect(app.items.length).toBe(0);
        });
        
        test('should update item quantity', () => {
            const item = { name: '衛生紙', category: '日用品', quantity: 1 };
            app.addItem(item);
            const itemId = app.items[0].id;
            
            app.updateQuantity(itemId, 5);
            
            expect(app.items[0].quantity).toBe(5);
        });
        
        test('should mark item as purchased', () => {
            const item = { name: '洗髮精', category: '日用品' };
            app.addItem(item);
            const itemId = app.items[0].id;
            
            app.togglePurchased(itemId);
            
            expect(app.items[0].purchased).toBe(true);
        });
        
        test('should toggle item priority', () => {
            const item = { name: '藥品', category: '其他' };
            app.addItem(item);
            const itemId = app.items[0].id;
            
            app.togglePriority(itemId);
            
            expect(app.items[0].priority).toBe(true);
        });
    });
    
    describe('Budget Management', () => {
        test('should calculate total budget', () => {
            app.addItem({ name: '蘋果', category: '食品', price: 50, quantity: 2 });
            app.addItem({ name: '香蕉', category: '食品', price: 30, quantity: 3 });
            
            const total = app.calculateTotal();
            
            expect(total).toBe(190); // (50*2) + (30*3)
        });
        
        test('should set budget limit', () => {
            app.setBudgetLimit(1000);
            
            expect(app.budgetLimit).toBe(1000);
        });
        
        test('should warn when exceeding budget', () => {
            app.setBudgetLimit(100);
            app.addItem({ name: '昂貴商品', category: '其他', price: 150, quantity: 1 });
            
            expect(app.isBudgetExceeded()).toBe(true);
            expect(app.getBudgetStatus()).toContain('超出預算');
        });
        
        test('should calculate remaining budget', () => {
            app.setBudgetLimit(500);
            app.addItem({ name: '商品1', category: '其他', price: 100, quantity: 2 });
            
            expect(app.getRemainingBudget()).toBe(300);
        });
    });
    
    describe('Search and Filter', () => {
        beforeEach(() => {
            app.addItem({ name: '牛奶', category: '食品', price: 85 });
            app.addItem({ name: '麵包', category: '食品', price: 45 });
            app.addItem({ name: '洗髮精', category: '日用品', price: 120 });
            app.addItem({ name: '牙膏', category: '日用品', price: 60 });
        });
        
        test('should filter by category', () => {
            const filtered = app.filterByCategory('食品');
            
            expect(filtered.length).toBe(2);
            expect(filtered.every(item => item.category === '食品')).toBe(true);
        });
        
        test('should search by name', () => {
            const results = app.searchItems('牛');
            
            expect(results.length).toBe(1);
            expect(results[0].name).toBe('牛奶');
        });
        
        test('should filter priority items', () => {
            app.togglePriority(app.items[0].id);
            app.togglePriority(app.items[2].id);
            
            const priorityItems = app.getPriorityItems();
            
            expect(priorityItems.length).toBe(2);
        });
        
        test('should filter unpurchased items', () => {
            app.togglePurchased(app.items[0].id);
            app.togglePurchased(app.items[1].id);
            
            const unpurchased = app.getUnpurchasedItems();
            
            expect(unpurchased.length).toBe(2);
        });
    });
    
    describe('Data Persistence', () => {
        test('should save items to localStorage', () => {
            app.addItem({ name: '測試商品', category: '其他' });
            
            app.saveToStorage();
            const saved = JSON.parse(localStorage.getItem('shoppingList'));
            
            expect(saved).toBeDefined();
            expect(saved.items.length).toBe(1);
        });
        
        test('should load items from localStorage', () => {
            const data = {
                items: [
                    { id: 1, name: '商品1', category: '食品' },
                    { id: 2, name: '商品2', category: '日用品' }
                ],
                budgetLimit: 1500
            };
            localStorage.setItem('shoppingList', JSON.stringify(data));
            
            app.loadFromStorage();
            
            expect(app.items.length).toBe(2);
            expect(app.budgetLimit).toBe(1500);
        });
        
        test('should auto-save on changes', () => {
            const spy = jest.spyOn(app, 'saveToStorage');
            
            app.addItem({ name: '自動儲存測試', category: '其他' });
            
            expect(spy).toHaveBeenCalled();
        });
    });
    
    describe('Export Functionality', () => {
        beforeEach(() => {
            app.addItem({ name: '商品1', category: '食品', price: 100, quantity: 2 });
            app.addItem({ name: '商品2', category: '日用品', price: 50, quantity: 1 });
        });
        
        test('should export to CSV format', () => {
            const csv = app.exportToCSV();
            
            expect(csv).toContain('名稱,類別,數量,單價,總價');
            expect(csv).toContain('商品1,食品,2,100,200');
            expect(csv).toContain('商品2,日用品,1,50,50');
        });
        
        test('should export to JSON format', () => {
            const json = app.exportToJSON();
            const data = JSON.parse(json);
            
            expect(data.items.length).toBe(2);
            expect(data.exportDate).toBeDefined();
            expect(data.totalBudget).toBe(250);
        });
        
        test('should generate shareable URL', () => {
            const url = app.generateShareURL();
            
            expect(url).toContain('data=');
            expect(url).toContain(window.location.origin);
        });
        
        test('should import from URL', () => {
            const shareData = btoa(JSON.stringify({
                items: [{ name: '導入商品', category: '其他' }]
            }));
            
            app.importFromURL(`?data=${shareData}`);
            
            expect(app.items.length).toBe(3); // 2 existing + 1 imported
        });
    });
    
    describe('UI Interactions', () => {
        test('should render item list', () => {
            app.addItem({ name: 'UI測試商品', category: '食品' });
            
            app.render();
            
            const listElement = document.querySelector('.shopping-list');
            expect(listElement).toBeDefined();
            expect(listElement.children.length).toBeGreaterThan(0);
        });
        
        test('should display budget warning', () => {
            app.setBudgetLimit(100);
            app.addItem({ name: '昂貴', category: '其他', price: 200 });
            
            app.render();
            
            const warning = document.querySelector('.budget-warning');
            expect(warning).toBeDefined();
            expect(warning.classList.contains('active')).toBe(true);
        });
        
        test('should show category statistics', () => {
            app.addItem({ name: '食品1', category: '食品', price: 100 });
            app.addItem({ name: '食品2', category: '食品', price: 50 });
            app.addItem({ name: '日用品1', category: '日用品', price: 75 });
            
            const stats = app.getCategoryStats();
            
            expect(stats['食品'].count).toBe(2);
            expect(stats['食品'].total).toBe(150);
            expect(stats['日用品'].count).toBe(1);
            expect(stats['日用品'].total).toBe(75);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle invalid quantity', () => {
            expect(() => {
                app.addItem({ name: '測試', category: '其他', quantity: -1 });
            }).toThrow('數量必須大於0');
        });
        
        test('should handle invalid price', () => {
            expect(() => {
                app.addItem({ name: '測試', category: '其他', price: -50 });
            }).toThrow('價格不能為負數');
        });
        
        test('should handle duplicate items gracefully', () => {
            app.addItem({ name: '重複商品', category: '食品' });
            app.addItem({ name: '重複商品', category: '食品' });
            
            const duplicates = app.items.filter(item => item.name === '重複商品');
            expect(duplicates.length).toBe(2);
            expect(duplicates[0].id).not.toBe(duplicates[1].id);
        });
        
        test('should handle storage quota exceeded', () => {
            const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB string
            
            expect(() => {
                app.addItem({ name: largeData, category: '其他' });
                app.saveToStorage();
            }).not.toThrow();
            
            expect(app.getLastError()).toContain('儲存空間');
        });
    });
});