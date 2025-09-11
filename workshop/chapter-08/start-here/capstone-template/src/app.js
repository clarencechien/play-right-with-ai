// Capstone 專案 - 應用程式主要邏輯
// 學員需要基於這個模板開發完整的應用程式

/**
 * 應用程式主類別
 * 學員應該擴展這個類別來實現自己的應用邏輯
 */
class CapstoneApp {
  constructor() {
    this.data = [];
    this.currentUser = null;
    this.config = {
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      appName: 'Capstone Project',
      version: '1.0.0'
    };
  }

  /**
   * 初始化應用程式
   * TODO: 實作應用程式初始化邏輯
   */
  async initialize() {
    console.log(`初始化 ${this.config.appName} v${this.config.version}...`);
    
    // TODO: 載入配置
    // TODO: 建立資料連接
    // TODO: 初始化 UI 元件
    // TODO: 設置事件監聽器
    
    this.setupEventListeners();
    this.loadInitialData();
    
    console.log('應用程式初始化完成');
  }

  /**
   * 設置事件監聽器
   * TODO: 添加應用程式所需的事件監聽器
   */
  setupEventListeners() {
    // 範例：表單提交事件
    const form = document.getElementById('main-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(e);
      });
    }

    // TODO: 添加其他事件監聽器
    // - 按鈕點擊
    // - 輸入變更
    // - 鍵盤事件
    // - 滑鼠事件
  }

  /**
   * 載入初始資料
   * TODO: 實作資料載入邏輯
   */
  async loadInitialData() {
    try {
      // TODO: 從 API 或本地存儲載入資料
      const response = await fetch(`${this.config.apiUrl}/api/data`);
      if (response.ok) {
        this.data = await response.json();
        this.renderData();
      }
    } catch (error) {
      console.error('載入資料失敗:', error);
      this.handleError(error);
    }
  }

  /**
   * 處理表單提交
   * TODO: 實作表單處理邏輯
   */
  async handleFormSubmit(event) {
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    console.log('表單資料:', data);
    
    // TODO: 驗證資料
    if (!this.validateInput(data)) {
      this.showError('輸入資料無效');
      return;
    }
    
    // TODO: 處理資料
    try {
      const result = await this.processData(data);
      this.showSuccess('操作成功');
      this.updateUI(result);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 驗證輸入資料
   * TODO: 實作輸入驗證邏輯
   */
  validateInput(data) {
    // TODO: 添加驗證規則
    // - 必填欄位檢查
    // - 格式驗證
    // - 長度限制
    // - 業務規則驗證
    
    if (!data.name || data.name.trim() === '') {
      return false;
    }
    
    // 更多驗證...
    
    return true;
  }

  /**
   * 處理資料
   * TODO: 實作資料處理邏輯
   */
  async processData(data) {
    // TODO: 實作資料處理
    // - 資料轉換
    // - API 調用
    // - 資料儲存
    // - 狀態更新
    
    const processed = {
      ...data,
      timestamp: new Date().toISOString(),
      id: this.generateId()
    };
    
    // 儲存到本地資料
    this.data.push(processed);
    
    // TODO: 同步到後端
    // await this.syncToBackend(processed);
    
    return processed;
  }

  /**
   * 渲染資料到 UI
   * TODO: 實作 UI 渲染邏輯
   */
  renderData() {
    const container = document.getElementById('data-container');
    if (!container) return;
    
    // TODO: 清空容器
    container.innerHTML = '';
    
    // TODO: 渲染資料項目
    this.data.forEach(item => {
      const element = this.createDataElement(item);
      container.appendChild(element);
    });
  }

  /**
   * 創建資料元素
   * TODO: 實作元素創建邏輯
   */
  createDataElement(item) {
    const div = document.createElement('div');
    div.className = 'data-item';
    div.setAttribute('data-id', item.id);
    
    // TODO: 添加內容
    div.innerHTML = `
      <h3>${item.name || '未命名'}</h3>
      <p>${item.description || '無描述'}</p>
      <span class="timestamp">${this.formatDate(item.timestamp)}</span>
      <button onclick="app.deleteItem('${item.id}')">刪除</button>
    `;
    
    return div;
  }

  /**
   * 刪除項目
   * TODO: 實作刪除功能
   */
  async deleteItem(itemId) {
    // TODO: 確認刪除
    if (!confirm('確定要刪除這個項目嗎？')) {
      return;
    }
    
    // TODO: 從資料陣列中移除
    this.data = this.data.filter(item => item.id !== itemId);
    
    // TODO: 更新 UI
    this.renderData();
    
    // TODO: 同步到後端
    // await this.syncDelete(itemId);
    
    this.showSuccess('項目已刪除');
  }

  /**
   * 更新 UI
   * TODO: 實作 UI 更新邏輯
   */
  updateUI(data) {
    // TODO: 更新相關的 UI 元件
    this.renderData();
    this.updateStatistics();
    this.clearForm();
  }

  /**
   * 更新統計資訊
   * TODO: 實作統計更新
   */
  updateStatistics() {
    const statsElement = document.getElementById('statistics');
    if (statsElement) {
      statsElement.innerHTML = `
        <p>總項目數: ${this.data.length}</p>
        <p>最後更新: ${new Date().toLocaleString('zh-TW')}</p>
      `;
    }
  }

  /**
   * 清空表單
   */
  clearForm() {
    const form = document.getElementById('main-form');
    if (form) {
      form.reset();
    }
  }

  /**
   * 顯示成功訊息
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * 顯示錯誤訊息
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * 顯示訊息
   */
  showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.className = `message ${type}`;
      messageElement.textContent = message;
      messageElement.style.display = 'block';
      
      // 3 秒後自動隱藏
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 3000);
    }
  }

  /**
   * 處理錯誤
   */
  handleError(error) {
    console.error('應用程式錯誤:', error);
    this.showError(error.message || '發生未知錯誤');
  }

  /**
   * 生成唯一 ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化日期
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW');
  }

  /**
   * 搜尋功能
   * TODO: 實作搜尋邏輯
   */
  search(query) {
    if (!query) {
      this.renderData();
      return;
    }
    
    const filtered = this.data.filter(item => {
      return item.name?.toLowerCase().includes(query.toLowerCase()) ||
             item.description?.toLowerCase().includes(query.toLowerCase());
    });
    
    // TODO: 渲染搜尋結果
    this.renderSearchResults(filtered);
  }

  /**
   * 渲染搜尋結果
   */
  renderSearchResults(results) {
    const container = document.getElementById('data-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = '<p>沒有找到符合的結果</p>';
      return;
    }
    
    results.forEach(item => {
      const element = this.createDataElement(item);
      container.appendChild(element);
    });
  }

  /**
   * 排序功能
   * TODO: 實作排序邏輯
   */
  sortData(field, order = 'asc') {
    this.data.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.renderData();
  }

  /**
   * 匯出資料
   * TODO: 實作資料匯出功能
   */
  exportData(format = 'json') {
    let content;
    let filename;
    let mimeType;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(this.data, null, 2);
        filename = 'data.json';
        mimeType = 'application/json';
        break;
      case 'csv':
        content = this.convertToCSV(this.data);
        filename = 'data.csv';
        mimeType = 'text/csv';
        break;
      default:
        console.error('不支援的匯出格式');
        return;
    }
    
    // 創建下載連結
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // 清理
    URL.revokeObjectURL(url);
  }

  /**
   * 轉換為 CSV 格式
   */
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  /**
   * 匯入資料
   * TODO: 實作資料匯入功能
   */
  async importData(file) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (Array.isArray(imported)) {
        this.data = [...this.data, ...imported];
        this.renderData();
        this.showSuccess(`成功匯入 ${imported.length} 筆資料`);
      } else {
        throw new Error('無效的資料格式');
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 全域應用程式實例
let app;

// DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  app = new CapstoneApp();
  app.initialize();
  
  // 將應用程式實例暴露給全域（方便測試）
  window.app = app;
});

// 導出供測試使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CapstoneApp;
}