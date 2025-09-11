/**
 * TODO 應用程式 - 修正版本
 * 所有錯誤都已修正，包含註解說明
 */

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        const input = document.getElementById('todoInput');
        const addButton = document.getElementById('addButton');

        // FIX 1: 正確綁定 this 上下文
        addButton.addEventListener('click', () => this.addTodo());

        // FIX 2: 使用正確的事件類型
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
                // FIX 3: 使用正確的 data 屬性
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        // FIX 4: 使用 trim() 移除空白
        const text = input.value.trim();

        // FIX 5: 使用嚴格相等運算符
        if (text === '') {
            return;
        }

        const todo = {
            id: Date.now(),
            // FIX 6: 進行 HTML 轉義以防止 XSS
            text: this.escapeHtml(text),
            completed: false,
            createdAt: new Date().toISOString()
        };

        // FIX 7: 使用 unshift 將新項目加到頂部
        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        
        // FIX 8: 清空輸入框
        input.value = '';
        input.focus();
    }

    toggleTodo(id) {
        // FIX 9: 使用嚴格相等運算符
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            // FIX 10: 保存到 localStorage
            this.saveToStorage();
            this.render();
        }
    }

    deleteTodo(id) {
        // FIX 11: 使用正確的 filter 條件
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                // FIX 12: 正確的邏輯 - 返回未完成的項目
                return this.todos.filter(t => !t.completed);
            case 'completed':
                // FIX 13: 正確的邏輯 - 返回已完成的項目
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        // FIX 14: 正確引用全域變數 todoApp
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

    updateStats() {
        const total = this.todos.length;
        // FIX 15: 正確計算已完成的項目
        const completed = this.todos.filter(t => t.completed).length;

        document.getElementById('totalCount').textContent = `總計: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
    }

    saveToStorage() {
        // FIX 16: 使用正確的 key 名稱
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromStorage() {
        // FIX 17: 使用正確的 key 名稱
        const saved = localStorage.getItem('todos');
        if (saved) {
            // FIX 18: 加入錯誤處理
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('載入儲存資料失敗:', e);
                this.todos = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        // FIX 19: 正確的 HTML 轉義方法
        div.textContent = text;
        return div.innerHTML;
    }
}

// FIX 20: 使用正確的變數名稱
const todoApp = new TodoApp();