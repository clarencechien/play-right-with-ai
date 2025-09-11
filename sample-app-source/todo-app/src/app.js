/**
 * TODO 應用程式主要邏輯
 * 實現 CRUD 操作與本地儲存
 */

/**
 * TODO 應用程式類別
 * 管理待辦事項的 CRUD 操作
 */
class TodoApp {
    /**
     * 初始化 TodoApp
     */
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    /**
     * 初始化應用程式
     */
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        const input = document.getElementById('todoInput');
        const addButton = document.getElementById('addButton');

        // 新增按鈕點擊
        addButton.addEventListener('click', () => this.addTodo());

        // Enter 鍵新增
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 篩選按鈕
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    /**
     * 新增待辦事項
     */
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') {
            return;
        }

        const todo = {
            id: Date.now(),
            text: this.escapeHtml(text),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        
        // 清空輸入框
        input.value = '';
        input.focus();
    }

    /**
     * 切換待辦事項完成狀態
     * @param {number} id - 待辦事項 ID
     */
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * 刪除待辦事項
     * @param {number} id - 待辦事項 ID
     */
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    /**
     * 取得篩選後的待辦事項
     * @returns {Array} 篩選後的待辦事項陣列
     */
    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    /**
     * 渲染待辦事項列表
     */
    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-testid="todo-item">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="todoApp.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${todo.text}</span>
                <button 
                    class="delete-btn" 
                    data-testid="delete-button"
                    onclick="todoApp.deleteTodo(${todo.id})"
                >
                    刪除
                </button>
            </li>
        `).join('');

        this.updateStats();
    }

    /**
     * 更新統計資訊
     */
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;

        document.getElementById('totalCount').textContent = `總計: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
    }

    /**
     * 儲存到本地儲存
     */
    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    /**
     * 從本地儲存載入資料
     */
    loadFromStorage() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('載入儲存資料失敗:', e);
                this.todos = [];
            }
        }
    }

    /**
     * 逸出 HTML 特殊字元
     * @param {string} text - 要逸出的文字
     * @returns {string} 逸出後的文字
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化應用
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const todoApp = new TodoApp();