/**
 * Capstone 專案應用程式主檔案
 * 這是您專案的起點 - 請根據需求擴展
 */

/**
 * CapstoneApp 類別
 */
class CapstoneApp {
    /**
     * 初始化建構函式
     */
    constructor() {
        // 初始化您的應用狀態
        this.data = [];
        this.config = {
            appName: 'Capstone 專案',
            version: '1.0.0',
            features: []
        };
        
        this.init();
    }

    /**
     * init 方法
     */
    init() {
        console.log('🚀 Capstone 專案啟動中...');
        
        // 載入儲存的資料
        this.loadData();
        
        // 綁定事件
        this.bindEvents();
        
        // 初始化 UI
        this.initializeUI();
        
        // 檢查需求完成度
        this.checkRequirements();
    }

    /**
     * bindEvents 方法
     */
    bindEvents() {
        // 需求檢查清單
        document.querySelectorAll('#requirementsList input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateRequirementStatus(e.target);
            });
        });

        // 載入已儲存的檢查狀態
        this.loadRequirementStatus();
    }

    /**
     * initializeUI 方法
     */
    initializeUI() {
        // 顯示歡迎訊息
        this.showWelcomeMessage();
        
        // TODO: 初始化您的應用程式 UI
        // 範例：
        // this.renderDashboard();
        // this.loadModules();
    }

    /**
     * showWelcomeMessage 方法
     */
    showWelcomeMessage() {
        const appContent = document.getElementById('appContent');
        
        // 這裡可以替換成您的應用程式內容
        appContent.innerHTML = `
            <div class="starter-content">
                <h2>準備開始開發！</h2>
                <p>這個區域將顯示您的應用程式內容。</p>
                
                <div class="example-features">
                    <h3>範例功能建議：</h3>
                    <div class="feature-cards">
                        <div class="feature-card">
                            <h4>📝 資料管理</h4>
                            <p>新增、編輯、刪除、查詢</p>
                        </div>
                        <div class="feature-card">
                            <h4>👥 使用者系統</h4>
                            <p>登入、註冊、權限管理</p>
                        </div>
                        <div class="feature-card">
                            <h4>📊 資料視覺化</h4>
                            <p>圖表、報表、統計分析</p>
                        </div>
                        <div class="feature-card">
                            <h4>🔍 搜尋與篩選</h4>
                            <p>進階搜尋、多條件篩選</p>
                        </div>
                    </div>
                </div>
                
                <div class="api-example">
                    <h3>API 結構範例：</h3>
                    <pre><code>
// 資料模型範例
const dataModel = {
    id: 'unique-id',
    name: '項目名稱',
    category: '分類',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
};

// CRUD 操作範例
class DataService {
    create(data) { /* 實作 */ }
    read(id) { /* 實作 */ }
    update(id, data) { /* 實作 */ }
    delete(id) { /* 實作 */ }
    list(filters) { /* 實作 */ }
}
                    </code></pre>
                </div>
            </div>
        `;
    }

    // 需求管理功能
    /**
     * checkRequirements 方法
     */
    checkRequirements() {
        const requirements = [
            { id: 'features', name: '功能模組', checked: false },
            { id: 'crud', name: 'CRUD 操作', checked: false },
            { id: 'persistence', name: '資料持久化', checked: false },
            { id: 'tests', name: '測試覆蓋', checked: false },
            { id: 'responsive', name: '響應式設計', checked: false }
        ];

        // 計算完成度
        const completed = requirements.filter(r => {
            const checkbox = document.querySelector(`[data-requirement="${r.id}"] input`);
            return checkbox && checkbox.checked;
        }).length;

        const percentage = Math.round((completed / requirements.length) * 100);
        this.updateProgressIndicator(percentage);
    }

    /**
     *
     * @param {*} checkbox - checkbox 參數
     */
    updateRequirementStatus(checkbox) {
        const requirements = {};
        document.querySelectorAll('#requirementsList input[type="checkbox"]').forEach(cb => {
            requirements[cb.id] = cb.checked;
        });
        
        localStorage.setItem('capstone_requirements', JSON.stringify(requirements));
        this.checkRequirements();
    }

    /**
     * loadRequirementStatus 方法
     */
    loadRequirementStatus() {
        const saved = localStorage.getItem('capstone_requirements');
        if (saved) {
            const requirements = JSON.parse(saved);
            Object.entries(requirements).forEach(([id, checked]) => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    checkbox.checked = checked;
                }
            });
        }
    }

    /**
     *
     * @param {*} percentage - percentage 參數
     */
    updateProgressIndicator(percentage) {
        // 可以在這裡添加進度指示器的視覺更新
        console.log(`專案完成度: ${percentage}%`);
    }

    // 資料管理功能
    /**
     * saveData 方法
     */
    saveData() {
        localStorage.setItem('capstone_data', JSON.stringify(this.data));
    }

    /**
     * loadData 方法
     */
    loadData() {
        const saved = localStorage.getItem('capstone_data');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch (e) {
                console.error('載入資料失敗:', e);
                this.data = [];
            }
        }
    }

    // CRUD 操作範例
    /**
     *
     * @param {*} item - item 參數
     */
    createItem(item) {
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.push(newItem);
        this.saveData();
        return newItem;
    }

    /**
     *
     * @param {*} id - id 參數
     */
    readItem(id) {
        return this.data.find(item => item.id === id);
    }

    /**
     *
     * @param {*} id - id 參數
     * @param {*} updates - updates 參數
     */
    updateItem(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[index] = {
                ...this.data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData();
            return this.data[index];
        }
        return null;
    }

    /**
     *
     * @param {*} id - id 參數
     */
    deleteItem(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index !== -1) {
            const deleted = this.data.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     *
     * @param {*} filters - filters 參數
     */
    listItems(filters = {}) {
        let results = [...this.data];
        
        // 實作篩選邏輯
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                results = results.filter(item => {
                    if (typeof value === 'string') {
                        return item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase());
                    }
                    return item[key] === value;
                });
            }
        });
        
        return results;
    }

    // 工具函數
    /**
     * generateId 方法
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * exportData 方法
     */
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `capstone-data-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     *
     * @param {*} file - file 參數
     */
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.data = imported;
                    this.saveData();
                    console.log('資料匯入成功');
                }
            } catch (error) {
                console.error('匯入失敗:', error);
            }
        };
        reader.readAsText(file);
    }
}

// 初始化應用程式
const app = new CapstoneApp();

// 將應用程式實例暴露給全域（方便測試和除錯）
window.capstoneApp = app;