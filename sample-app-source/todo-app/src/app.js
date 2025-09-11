/**
 * TODO 應用程式主要邏輯
 * 實現 CRUD 操作與本地儲存
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

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

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

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;

        document.getElementById('totalCount').textContent = `總計: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化應用
const todoApp = new TodoApp();