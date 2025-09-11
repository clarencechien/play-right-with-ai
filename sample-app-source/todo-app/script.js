/**
 * TODO 應用程式主要邏輯
 * 使用 ES6+ 功能實現的待辦事項管理系統
 */

// 應用程式狀態管理
const TodoApp = {
    tasks: [],
    currentFilter: 'all',
    currentPriorityFilter: 'all',
    searchTerm: '',
    selectedTasks: new Set(),
    
    // 初始化應用程式
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
        this.updateStats();
        this.checkTheme();
    },
    
    // 生成唯一 ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 載入任務資料
    loadTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            this.tasks = JSON.parse(stored);
        }
    },
    
    // 儲存任務資料
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },
    
    // 綁定事件處理器
    bindEvents() {
        // 表單提交
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // 篩選器
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
                this.updateFilterButtons();
                this.render();
            });
        });
        
        // 優先級篩選
        document.querySelectorAll('.filter-btn[data-priority]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPriorityFilter = btn.dataset.priority;
                this.render();
            });
        });
        
        // 搜尋
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
        
        // 批次操作
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAll();
        });
        
        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.bulkDelete();
        });
        
        document.getElementById('bulkCompleteBtn').addEventListener('click', () => {
            this.bulkComplete();
        });
        
        document.getElementById('clearCompletedBtn').addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // 匯入匯出
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportTasks();
        });
        
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importTasks(e.target.files[0]);
        });
        
        // 主題切換
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // 對話框事件
        document.querySelector('.dialog-cancel').addEventListener('click', () => {
            this.hideDialog();
        });
    },
    
    // 新增任務
    addTask() {
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const priorityInput = document.getElementById('taskPriority');
        const dueDateInput = document.getElementById('taskDueDate');
        
        const title = titleInput.value.trim();
        if (!title) {
            this.showToast('請輸入任務名稱', 'error');
            return;
        }
        
        const task = {
            id: this.generateId(),
            title: title,
            description: descriptionInput.value.trim(),
            priority: priorityInput.value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: dueDateInput.value || null
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateStats();
        
        // 清空表單
        titleInput.value = '';
        descriptionInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'medium';
        
        this.showToast('任務已成功新增', 'success');
    },
    
    // 刪除任務
    deleteTask(id) {
        this.showConfirmDialog('確定要刪除此任務嗎？此操作無法復原。', () => {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showToast('任務已刪除', 'success');
        });
    },
    
    // 切換任務狀態
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'completed' ? 'pending' : 'completed';
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    },
    
    // 編輯任務
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        const titleElement = taskElement.querySelector('.task-title');
        
        // 創建編輯輸入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.title;
        input.className = 'task-title editing';
        input.maxLength = 100;
        
        titleElement.replaceWith(input);
        input.focus();
        input.select();
        
        // 保存編輯
        const saveEdit = () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== task.title) {
                task.title = newTitle;
                task.updatedAt = new Date().toISOString();
                this.saveTasks();
                this.showToast('任務已更新', 'success');
            }
            this.render();
        };
        
        // 取消編輯
        const cancelEdit = () => {
            this.render();
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    },
    
    // 設定篩選器
    setFilter(filter) {
        this.currentFilter = filter;
    },
    
    // 更新篩選器按鈕狀態
    updateFilterButtons() {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    },
    
    // 取得篩選後的任務
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // 狀態篩選
        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(task => task.status === 'pending');
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.status === 'completed');
        }
        
        // 優先級篩選
        if (this.currentPriorityFilter !== 'all') {
            filtered = filtered.filter(task => task.priority === this.currentPriorityFilter);
        }
        
        // 搜尋篩選
        if (this.searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                task.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        return filtered;
    },
    
    // 渲染任務列表
    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            document.getElementById('bulkActions').style.display = 'none';
            return;
        }
        
        taskList.style.display = 'flex';
        emptyState.style.display = 'none';
        
        taskList.innerHTML = filteredTasks.map(task => this.renderTask(task)).join('');
        
        // 顯示或隱藏批次操作
        document.getElementById('bulkActions').style.display = 
            this.selectedTasks.size > 0 ? 'flex' : 'none';
    },
    
    // 渲染單個任務
    renderTask(task) {
        const priorityText = {
            high: '高優先',
            medium: '中優先',
            low: '低優先'
        };
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleString('zh-TW') : '';
        
        return `
            <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${task.status === 'completed' ? 'checked' : ''}
                           onchange="TodoApp.toggleTask('${task.id}')">
                    <span class="task-title">${this.escapeHtml(task.title)}</span>
                    <span class="priority-badge ${task.priority}">${priorityText[task.priority]}</span>
                    <div class="task-actions">
                        <button class="action-btn" onclick="TodoApp.editTask('${task.id}')" title="編輯">
                            ✏️
                        </button>
                        <button class="action-btn" onclick="TodoApp.deleteTask('${task.id}')" title="刪除">
                            🗑️
                        </button>
                    </div>
                </div>
                ${task.description ? `
                    <div class="task-description-text">${this.escapeHtml(task.description)}</div>
                ` : ''}
                <div class="task-meta">
                    <span>建立於: ${new Date(task.createdAt).toLocaleDateString('zh-TW')}</span>
                    ${dueDate ? `
                        <span class="due-date ${isOverdue ? 'overdue' : ''}">
                            📅 到期: ${dueDate}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    // 更新統計資料
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('completionRate').textContent = `${rate}%`;
    },
    
    // 全選
    selectAll() {
        const filtered = this.getFilteredTasks();
        if (this.selectedTasks.size === filtered.length) {
            this.selectedTasks.clear();
        } else {
            filtered.forEach(task => this.selectedTasks.add(task.id));
        }
        this.render();
    },
    
    // 批次刪除
    bulkDelete() {
        if (this.selectedTasks.size === 0) return;
        
        this.showConfirmDialog(`確定要刪除 ${this.selectedTasks.size} 個任務嗎？`, () => {
            this.tasks = this.tasks.filter(task => !this.selectedTasks.has(task.id));
            this.selectedTasks.clear();
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showToast('任務已批次刪除', 'success');
        });
    },
    
    // 批次完成
    bulkComplete() {
        if (this.selectedTasks.size === 0) return;
        
        this.tasks.forEach(task => {
            if (this.selectedTasks.has(task.id)) {
                task.status = 'completed';
                task.updatedAt = new Date().toISOString();
            }
        });
        
        this.selectedTasks.clear();
        this.saveTasks();
        this.render();
        this.updateStats();
        this.showToast('任務已批次完成', 'success');
    },
    
    // 清除已完成
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.status === 'completed').length;
        if (completedCount === 0) {
            this.showToast('沒有已完成的任務', 'warning');
            return;
        }
        
        this.showConfirmDialog(`確定要清除 ${completedCount} 個已完成的任務嗎？`, () => {
            this.tasks = this.tasks.filter(task => task.status !== 'completed');
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showToast('已清除所有完成的任務', 'success');
        });
    },
    
    // 匯出任務
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `tasks_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('任務已匯出', 'success');
    },
    
    // 匯入任務
    importTasks(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.showConfirmDialog('匯入將會覆蓋現有任務，確定要繼續嗎？', () => {
                        this.tasks = imported;
                        this.saveTasks();
                        this.render();
                        this.updateStats();
                        this.showToast(`成功匯入 ${imported.length} 個任務`, 'success');
                    });
                } else {
                    this.showToast('匯入檔案格式錯誤', 'error');
                }
            } catch (error) {
                this.showToast('無法讀取檔案內容', 'error');
            }
        };
        reader.readAsText(file);
    },
    
    // 主題切換
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.dataset.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = newTheme === 'dark' ? '☀️ 切換主題' : '🌙 切換主題';
        
        this.showToast(`已切換至${newTheme === 'dark' ? '深色' : '淺色'}主題`, 'success');
    },
    
    // 檢查主題
    checkTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
        
        const themeBtn = document.getElementById('themeToggle');
        themeBtn.textContent = savedTheme === 'dark' ? '☀️ 切換主題' : '🌙 切換主題';
    },
    
    // 顯示確認對話框
    showConfirmDialog(message, onConfirm) {
        const dialog = document.getElementById('confirmDialog');
        const messageElement = dialog.querySelector('.dialog-message');
        const confirmBtn = dialog.querySelector('.dialog-confirm');
        
        messageElement.textContent = message;
        dialog.classList.add('show');
        
        // 移除舊的事件監聽器
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.hideDialog();
        });
    },
    
    // 隱藏對話框
    hideDialog() {
        document.getElementById('confirmDialog').classList.remove('show');
    },
    
    // 顯示提示訊息
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },
    
    // HTML 轉義
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    TodoApp.init();
});