// Dev Dashboard - Complete Implementation
class DevDashboard {
    constructor() {
        this.currentLogDate = new Date();
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.updateDateTime();
        this.setupTheme();
        this.loadDailyLog();
        
        // Update time every second
        setInterval(() => this.updateDateTime(), 1000);
        
        // Auto-save daily log every 30 seconds
        setInterval(() => this.saveDailyLog(true), 30000);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Global search
        document.getElementById('globalSearch').addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());
        
        // Notes
        document.getElementById('addNote').addEventListener('click', () => this.addNote());
        document.getElementById('noteInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNote();
        });
        
        // Todos
        document.getElementById('addTodo').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Bookmarks
        document.getElementById('addBookmark').addEventListener('click', () => this.addBookmark());
        document.getElementById('bookmarkUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBookmark();
        });
        
        // Snippets
        document.getElementById('addSnippet').addEventListener('click', () => this.addSnippet());
        document.getElementById('snippetCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addSnippet();
        });
        
        // Daily Log
        document.getElementById('saveLog').addEventListener('click', () => this.saveDailyLog());
        document.getElementById('prevDay').addEventListener('click', () => this.navigateLog(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.navigateLog(1));
        
        // Export/Import
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('importData').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        
        // Click outside to close search
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container') && !e.target.closest('.search-results')) {
                this.hideSearchResults();
            }
        });
    }

    // Theme Management
    setupTheme() {
        const savedTheme = localStorage.getItem('devDashboard_theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('devDashboard_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // DateTime Update
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
    }

    // Data Loading
    loadData() {
        this.renderNotes();
        this.renderTodos();
        this.renderBookmarks();
        this.renderSnippets();
        this.updateStats();
    }

    // Global Search
    handleGlobalSearch(query) {
        clearTimeout(this.searchTimeout);
        const clearBtn = document.getElementById('clearSearch');
        
        if (query.length === 0) {
            this.hideSearchResults();
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'block';
        
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        const results = {
            notes: this.searchNotes(query),
            todos: this.searchTodos(query),
            bookmarks: this.searchBookmarks(query),
            snippets: this.searchSnippets(query),
            logs: this.searchDailyLogs(query)
        };
        
        this.displaySearchResults(results, query);
    }

    searchNotes(query) {
        const notes = JSON.parse(localStorage.getItem('devDashboard_notes') || '[]');
        return notes.filter(note => note.text.toLowerCase().includes(query.toLowerCase()));
    }

    searchTodos(query) {
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        return todos.filter(todo => todo.text.toLowerCase().includes(query.toLowerCase()));
    }

    searchBookmarks(query) {
        const bookmarks = JSON.parse(localStorage.getItem('devDashboard_bookmarks') || '[]');
        return bookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(query.toLowerCase())
        );
    }

    searchSnippets(query) {
        const snippets = JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]');
        return snippets.filter(snippet => 
            snippet.title.toLowerCase().includes(query.toLowerCase()) ||
            snippet.code.toLowerCase().includes(query.toLowerCase())
        );
    }

    searchDailyLogs(query) {
        const logs = JSON.parse(localStorage.getItem('devDashboard_dailyLogs') || '{}');
        const results = [];
        
        Object.entries(logs).forEach(([date, content]) => {
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({ date, content: content.substring(0, 100) + '...' });
            }
        });
        
        return results;
    }

    displaySearchResults(results, query) {
        const container = document.getElementById('searchResults');
        let html = '';

        const sections = [
            { key: 'notes', title: 'Notes', icon: 'sticky-note' },
            { key: 'todos', title: 'To-Dos', icon: 'check-square' },
            { key: 'bookmarks', title: 'Bookmarks', icon: 'bookmark' },
            { key: 'snippets', title: 'Snippets', icon: 'code' },
            { key: 'logs', title: 'Daily Logs', icon: 'calendar-day' }
        ];

        sections.forEach(section => {
            if (results[section.key].length > 0) {
                html += `<div class="search-section">
                    <h4><i class="fas fa-${section.icon}"></i> ${section.title}</h4>`;
                
                results[section.key].forEach(item => {
                    html += this.renderSearchItem(item, section.key, query);
                });
                
                html += '</div>';
            }
        });

        if (html === '') {
            html = '<div class="search-section"><p>No results found for "' + query + '"</p></div>';
        }

        container.innerHTML = html;
        container.style.display = 'block';
    }

    renderSearchItem(item, type, query) {
        const highlightText = (text) => {
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        };

        switch (type) {
            case 'notes':
                return `<div class="search-item">${highlightText(item.text)}</div>`;
            case 'todos':
                return `<div class="search-item">
                    ${item.completed ? '✓' : '○'} ${highlightText(item.text)}
                </div>`;
            case 'bookmarks':
                return `<div class="search-item">
                    <strong>${highlightText(item.title)}</strong><br>
                    <small>${highlightText(item.url)}</small>
                </div>`;
            case 'snippets':
                return `<div class="search-item">
                    <strong>${highlightText(item.title)}</strong><br>
                    <small>${highlightText(item.code.substring(0, 50))}...</small>
                </div>`;
            case 'logs':
                return `<div class="search-item">
                    <strong>${item.date}</strong><br>
                    <small>${highlightText(item.content)}</small>
                </div>`;
            default:
                return '';
        }
    }

    clearSearch() {
        document.getElementById('globalSearch').value = '';
        document.getElementById('clearSearch').style.display = 'none';
        this.hideSearchResults();
    }

    hideSearchResults() {
        document.getElementById('searchResults').style.display = 'none';
    }

    // Notes Management
    addNote() {
        const input = document.getElementById('noteInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        const notes = JSON.parse(localStorage.getItem('devDashboard_notes') || '[]');
        const newNote = {
            id: Date.now(),
            text,
            timestamp: new Date().toISOString()
        };
        
        notes.unshift(newNote);
        localStorage.setItem('devDashboard_notes', JSON.stringify(notes));
        
        input.value = '';
        this.renderNotes();
    }

    renderNotes() {
        const notes = JSON.parse(localStorage.getItem('devDashboard_notes') || '[]');
        const container = document.getElementById('notesList');
        
        container.innerHTML = notes.map(note => `
            <div class="item">
                <div class="item-content">
                    <span>${note.text}</span>
                </div>
                <div class="item-actions">
                    <button class="item-btn delete-btn" onclick="dashboard.deleteNote(${note.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    deleteNote(id) {
        const notes = JSON.parse(localStorage.getItem('devDashboard_notes') || '[]');
        const filtered = notes.filter(note => note.id !== id);
        localStorage.setItem('devDashboard_notes', JSON.stringify(filtered));
        this.renderNotes();
    }

    // Todos Management
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
            timestamp: new Date().toISOString()
        };
        
        todos.unshift(newTodo);
        localStorage.setItem('devDashboard_todos', JSON.stringify(todos));
        
        input.value = '';
        this.renderTodos();
        this.updateStats();
    }

    renderTodos() {
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        const container = document.getElementById('todosList');
        
        container.innerHTML = todos.map(todo => `
            <div class="item todo-item ${todo.completed ? 'completed' : ''}">
                <div class="item-content">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="dashboard.toggleTodo(${todo.id})">
                    <span class="todo-text">${todo.text}</span>
                </div>
                <div class="item-actions">
                    <button class="item-btn delete-btn" onclick="dashboard.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleTodo(id) {
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            localStorage.setItem('devDashboard_todos', JSON.stringify(todos));
            this.renderTodos();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        const filtered = todos.filter(todo => todo.id !== id);
        localStorage.setItem('devDashboard_todos', JSON.stringify(filtered));
        this.renderTodos();
        this.updateStats();
    }

    // Bookmarks Management
    addBookmark() {
        const titleInput = document.getElementById('bookmarkTitle');
        const urlInput = document.getElementById('bookmarkUrl');
        const title = titleInput.value.trim();
        const url = urlInput.value.trim();
        
        if (!title || !url) return;
        
        const bookmarks = JSON.parse(localStorage.getItem('devDashboard_bookmarks') || '[]');
        const newBookmark = {
            id: Date.now(),
            title,
            url: url.startsWith('http') ? url : 'https://' + url,
            timestamp: new Date().toISOString()
        };
        
        bookmarks.unshift(newBookmark);
        localStorage.setItem('devDashboard_bookmarks', JSON.stringify(bookmarks));
        
        titleInput.value = '';
        urlInput.value = '';
        this.renderBookmarks();
    }

    renderBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('devDashboard_bookmarks') || '[]');
        const container = document.getElementById('bookmarksList');
        
        container.innerHTML = bookmarks.map(bookmark => `
            <div class="item">
                <div class="item-content">
                    <a href="${bookmark.url}" target="_blank" class="bookmark-link">
                        ${bookmark.title}
                    </a>
                    <br><small style="color: var(--text-secondary);">${bookmark.url}</small>
                </div>
                <div class="item-actions">
                    <button class="item-btn" onclick="window.open('${bookmark.url}', '_blank')">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="item-btn delete-btn" onclick="dashboard.deleteBookmark(${bookmark.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    deleteBookmark(id) {
        const bookmarks = JSON.parse(localStorage.getItem('devDashboard_bookmarks') || '[]');
        const filtered = bookmarks.filter(bookmark => bookmark.id !== id);
        localStorage.setItem('devDashboard_bookmarks', JSON.stringify(filtered));
        this.renderBookmarks();
    }

    // Snippets Management
    addSnippet() {
        const titleInput = document.getElementById('snippetTitle');
        const codeInput = document.getElementById('snippetCode');
        const title = titleInput.value.trim();
        const code = codeInput.value.trim();
        
        if (!title || !code) return;
        
        const snippets = JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]');
        const newSnippet = {
            id: Date.now(),
            title,
            code,
            timestamp: new Date().toISOString()
        };
        
        snippets.unshift(newSnippet);
        localStorage.setItem('devDashboard_snippets', JSON.stringify(snippets));
        
        titleInput.value = '';
        codeInput.value = '';
        this.renderSnippets();
    }

    renderSnippets() {
        const snippets = JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]');
        const container = document.getElementById('snippetsList');
        
        container.innerHTML = snippets.map(snippet => `
            <div class="item">
                <div class="item-content" style="flex-direction: column; align-items: flex-start;">
                    <strong>${snippet.title}</strong>
                    <pre class="snippet-code">${snippet.code}</pre>
                </div>
                <div class="item-actions">
                    <button class="item-btn" onclick="dashboard.copySnippet('${snippet.id}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="item-btn delete-btn" onclick="dashboard.deleteSnippet(${snippet.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    copySnippet(id) {
        const snippets = JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]');
        const snippet = snippets.find(s => s.id == id);
        if (snippet) {
            navigator.clipboard.writeText(snippet.code).then(() => {
                // Visual feedback
                const btn = event.target.closest('.item-btn');
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.color = 'var(--success-color)';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.color = '';
                }, 1000);
            });
        }
    }

    deleteSnippet(id) {
        const snippets = JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]');
        const filtered = snippets.filter(snippet => snippet.id !== id);
        localStorage.setItem('devDashboard_snippets', JSON.stringify(filtered));
        this.renderSnippets();
    }

    // Daily Log Management
    loadDailyLog() {
        this.updateLogDate();
        const logs = JSON.parse(localStorage.getItem('devDashboard_dailyLogs') || '{}');
        const dateKey = this.currentLogDate.toISOString().split('T')[0];
        const content = logs[dateKey] || '';
        
        document.getElementById('dailyLogContent').value = content;
        this.updateNavigationButtons();
    }

    saveDailyLog(auto = false) {
        const content = document.getElementById('dailyLogContent').value;
        const logs = JSON.parse(localStorage.getItem('devDashboard_dailyLogs') || '{}');
        const dateKey = this.currentLogDate.toISOString().split('T')[0];
        
        if (content.trim()) {
            logs[dateKey] = content;
        } else {
            delete logs[dateKey];
        }
        
        localStorage.setItem('devDashboard_dailyLogs', JSON.stringify(logs));
        
        if (!auto) {
            const status = document.getElementById('saveStatus');
            status.textContent = '✓ Saved';
            setTimeout(() => status.textContent = '', 2000);
        }
    }

    navigateLog(direction) {
        this.saveDailyLog(true); // Auto-save current log
        this.currentLogDate.setDate(this.currentLogDate.getDate() + direction);
        this.loadDailyLog();
    }

    updateLogDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentLogDate').textContent = 
            this.currentLogDate.toLocaleDateString('en-US', options);
    }

    updateNavigationButtons() {
        const today = new Date();
        const nextBtn = document.getElementById('nextDay');
        
        // Disable next button if current date is today or future
        nextBtn.disabled = this.currentLogDate >= today;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }

    // Stats Update
    updateStats() {
        const todos = JSON.parse(localStorage.getItem('devDashboard_todos') || '[]');
        const completedToday = todos.filter(todo => {
            return todo.completed && 
                   new Date(todo.timestamp).toDateString() === new Date().toDateString();
        }).length;
        
        document.getElementById('todayStats').textContent = 
            `📊 Today: ${completedToday} tasks done`;
    }

    // Export/Import
    exportData() {
        const data = {
            notes: JSON.parse(localStorage.getItem('devDashboard_notes') || '[]'),
            todos: JSON.parse(localStorage.getItem('devDashboard_todos') || '[]'),
            bookmarks: JSON.parse(localStorage.getItem('devDashboard_bookmarks') || '[]'),
            snippets: JSON.parse(localStorage.getItem('devDashboard_snippets') || '[]'),
            dailyLogs: JSON.parse(localStorage.getItem('devDashboard_dailyLogs') || '{}'),
            theme: localStorage.getItem('devDashboard_theme') || 'light',
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dev-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Confirm import
                if (confirm('This will replace all current data. Continue?')) {
                    localStorage.setItem('devDashboard_notes', JSON.stringify(data.notes || []));
                    localStorage.setItem('devDashboard_todos', JSON.stringify(data.todos || []));
                    localStorage.setItem('devDashboard_bookmarks', JSON.stringify(data.bookmarks || []));
                    localStorage.setItem('devDashboard_snippets', JSON.stringify(data.snippets || []));
                    localStorage.setItem('devDashboard_dailyLogs', JSON.stringify(data.dailyLogs || {}));
                    
                    if (data.theme) {
                        localStorage.setItem('devDashboard_theme', data.theme);
                        this.setupTheme();
                    }
                    
                    this.loadData();
                    this.loadDailyLog();
                    alert('Data imported successfully!');
                }
            } catch (err) {
                alert('Invalid backup file format.');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
}

// Initialize Dashboard
const dashboard = new DevDashboard();