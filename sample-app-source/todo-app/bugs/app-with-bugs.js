/**
 * TODO 應用程式 - 包含刻意設計的錯誤
 * 用於除錯練習
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

        // BUG 1: 事件監聽器綁定錯誤
        addButton.addEventListener('click', this.addTodo); // 缺少綁定 this

        // BUG 2: 錯誤的事件類型
        input.addEventListener('keydown', (e) => { // 應該是 keypress 或 keyup
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 篩選按鈕
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                // BUG 3: 錯誤的屬性名稱
                this.currentFilter = e.target.getAttribute('filter'); // 應該是 data-filter
                this.render();
            });
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value; // BUG 4: 沒有 trim()

        // BUG 5: 錯誤的空值檢查
        if (text == '') { // 應該使用 ===
            return;
        }

        const todo = {
            id: Date.now(),
            text: text, // BUG 6: 沒有進行 HTML 轉義
            completed: false,
            createdAt: new Date().toISOString()
        };

        // BUG 7: 使用 push 而不是 unshift（新項目應該在頂部）
        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        
        // BUG 8: 忘記清空輸入框
        // input.value = '';
        input.focus();
    }

    toggleTodo(id) {
        // BUG 9: 使用 == 而不是 ===
        const todo = this.todos.find(t => t.id == id);
        if (todo) {
            todo.completed = !todo.completed;
            // BUG 10: 忘記保存到 localStorage
            // this.saveToStorage();
            this.render();
        }
    }

    deleteTodo(id) {
        // BUG 11: filter 條件錯誤
        this.todos = this.todos.filter(t => t.id === id); // 應該是 !==
        this.saveToStorage();
        this.render();
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                // BUG 12: 邏輯反了
                return this.todos.filter(t => t.completed); // 應該是 !t.completed
            case 'completed':
                // BUG 13: 邏輯反了
                return this.todos.filter(t => !t.completed); // 應該是 t.completed
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        // BUG 14: 字串模板中的函數調用問題
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-testid="todo-item">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="toggleTodo(${todo.id})"
                >
                <span class="todo-text">${todo.text}</span>
                <button 
                    class="delete-btn" 
                    data-testid="delete-button"
                    onclick="deleteTodo(${todo.id})"
                >
                    刪除
                </button>
            </li>
        `).join('');

        this.updateStats();
    }

    updateStats() {
        const total = this.todos.length;
        // BUG 15: 計算錯誤
        const completed = this.todos.filter(t => !t.completed).length; // 應該是 t.completed

        document.getElementById('totalCount').textContent = `總計: ${total}`;
        document.getElementById('completedCount').textContent = `已完成: ${completed}`;
    }

    saveToStorage() {
        // BUG 16: 錯誤的 key 名稱
        localStorage.setItem('todo', JSON.stringify(this.todos)); // 應該是 'todos'
    }

    loadFromStorage() {
        // BUG 17: 錯誤的 key 名稱
        const saved = localStorage.getItem('todo'); // 應該是 'todos'
        if (saved) {
            // BUG 18: 沒有錯誤處理
            this.todos = JSON.parse(saved); // 缺少 try-catch
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        // BUG 19: 使用了 innerHTML 而不是 textContent
        div.innerHTML = text; // 應該是 div.textContent = text; return div.innerHTML;
        return div.textContent;
    }
}

// BUG 20: 變數名稱不一致
const app = new TodoApp(); // 在 HTML 中引用的是 todoApp