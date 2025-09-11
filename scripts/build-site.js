#!/usr/bin/env node

/**
 * Static Site Generator for Play Right with AI Workshop
 * 將 Markdown 內容轉換為互動式 HTML 網站
 */

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

// 配置 marked 使用 highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
});

class SiteBuilder {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.outputDir = path.join(this.sourceDir, 'docs');
    this.chapters = [];
    this.searchIndex = [];
  }

  async build() {
    console.log('🚀 開始建構靜態網站...');
    
    // 清理並創建輸出目錄
    await this.cleanOutputDir();
    await this.createDirectoryStructure();
    
    // 複製靜態資源
    await this.copyStaticAssets();
    
    // 處理章節內容
    await this.processChapters();
    
    // 生成首頁
    await this.generateHomepage();
    
    // 生成搜尋索引
    await this.generateSearchIndex();
    
    // 生成互動式 playground
    await this.generatePlayground();
    
    // 生成示範應用
    await this.generateDemos();
    
    console.log('✅ 網站建構完成！');
  }

  async cleanOutputDir() {
    try {
      await fs.rm(this.outputDir, { recursive: true, force: true });
    } catch (error) {
      // 目錄不存在，忽略錯誤
    }
  }

  async createDirectoryStructure() {
    const dirs = [
      'docs',
      'docs/assets',
      'docs/assets/css',
      'docs/assets/js',
      'docs/assets/images',
      'docs/chapters',
      'docs/playground',
      'docs/demos',
      'docs/exercises',
      'docs/prompts'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.sourceDir, dir), { recursive: true });
    }
  }

  async copyStaticAssets() {
    // 創建基礎 CSS
    const cssContent = `
/* Play Right with AI - 主樣式表 */
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, var(--bg-color) 0%, #1a1f3a 100%);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 導航列 */
.navbar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(30, 41, 59, 0.95);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary-color);
}

/* 英雄區塊 */
.hero {
  padding: 4rem 0;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
}

/* 章節卡片 */
.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.chapter-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: transform 0.3s, border-color 0.3s;
  text-decoration: none;
  color: inherit;
}

.chapter-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary-color);
}

.chapter-number {
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.chapter-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.chapter-description {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* 程式碼區塊 */
pre {
  background: #0d1117;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid var(--border-color);
}

code {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
}

.inline-code {
  background: rgba(99, 102, 241, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: var(--primary-color);
}

/* 互動元素 */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.3s, box-shadow 0.3s;
  border: none;
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

/* Playground 樣式 */
.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.playground-input, .playground-output {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.playground-textarea {
  width: 100%;
  min-height: 300px;
  background: #0d1117;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  resize: vertical;
}

/* 搜尋功能 */
.search-container {
  position: relative;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .playground-container {
    grid-template-columns: 1fr;
  }
  
  .nav-links {
    display: none;
  }
}

/* 動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Highlight.js 主題 */
.hljs {
  background: #0d1117;
  color: #c9d1d9;
}

.hljs-keyword {
  color: #ff7b72;
}

.hljs-string {
  color: #a5d6ff;
}

.hljs-function {
  color: #d2a8ff;
}

.hljs-comment {
  color: #8b949e;
  font-style: italic;
}
    `;

    await fs.writeFile(
      path.join(this.outputDir, 'assets', 'css', 'main.css'),
      cssContent
    );

    // 創建基礎 JavaScript
    const jsContent = `
// Play Right with AI - 主要 JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Play Right with AI Workshop 已載入');
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化程式碼高亮
  initCodeHighlight();
  
  // 初始化互動元素
  initInteractive();
});

function initSearch() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', debounce(function(e) {
    performSearch(e.target.value);
  }, 300));
}

function performSearch(query) {
  if (!query) {
    clearSearchResults();
    return;
  }
  
  fetch('/docs/search-index.json')
    .then(res => res.json())
    .then(index => {
      const results = searchInIndex(index, query);
      displaySearchResults(results);
    });
}

function searchInIndex(index, query) {
  const lowerQuery = query.toLowerCase();
  return index.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.content.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

function displaySearchResults(results) {
  const container = document.getElementById('search-results');
  if (!container) return;
  
  if (results.length === 0) {
    container.innerHTML = '<p>找不到相關結果</p>';
    return;
  }
  
  const html = results.map(result => \`
    <div class="search-result">
      <a href="\${result.url}">
        <h4>\${result.title}</h4>
        <p>\${result.excerpt}</p>
      </a>
    </div>
  \`).join('');
  
  container.innerHTML = html;
}

function clearSearchResults() {
  const container = document.getElementById('search-results');
  if (container) container.innerHTML = '';
}

function initCodeHighlight() {
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }
}

function initInteractive() {
  // 初始化 Playground
  const runButton = document.getElementById('run-prompt');
  if (runButton) {
    runButton.addEventListener('click', runPrompt);
  }
  
  // 初始化複製按鈕
  document.querySelectorAll('pre').forEach(block => {
    addCopyButton(block);
  });
}

function runPrompt() {
  const input = document.getElementById('prompt-input');
  const output = document.getElementById('prompt-output');
  
  if (!input || !output) return;
  
  const prompt = input.value;
  if (!prompt) {
    output.innerHTML = '<p style="color: var(--warning-color)">請輸入提示詞</p>';
    return;
  }
  
  // 模擬 AI 回應
  output.innerHTML = '<p style="color: var(--text-secondary)">處理中...</p>';
  
  setTimeout(() => {
    output.innerHTML = \`
      <h4>AI 回應範例：</h4>
      <p>這是一個模擬的 AI 回應。在實際使用中，這裡會顯示來自 Claude、Gemini 或其他 AI 模型的回應。</p>
      <p>您的提示詞：<span class="inline-code">\${escapeHtml(prompt)}</span></p>
      <p>建議：嘗試使用雙語提示策略以獲得更好的結果！</p>
    \`;
  }, 1500);
}

function addCopyButton(block) {
  const button = document.createElement('button');
  button.className = 'copy-btn';
  button.textContent = '複製';
  button.onclick = () => {
    const code = block.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      button.textContent = '已複製！';
      setTimeout(() => {
        button.textContent = '複製';
      }, 2000);
    });
  };
  block.style.position = 'relative';
  block.appendChild(button);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
    `;

    await fs.writeFile(
      path.join(this.outputDir, 'assets', 'js', 'main.js'),
      jsContent
    );
  }

  async processChapters() {
    const workshopDir = path.join(this.sourceDir, 'workshop');
    const chapters = await fs.readdir(workshopDir);
    
    for (const chapter of chapters.sort()) {
      if (chapter.startsWith('chapter-')) {
        await this.processChapter(chapter);
      }
    }
  }

  async processChapter(chapterDir) {
    const chapterPath = path.join(this.sourceDir, 'workshop', chapterDir);
    const readmePath = path.join(chapterPath, 'README.md');
    
    try {
      const content = await fs.readFile(readmePath, 'utf-8');
      const html = await this.convertMarkdownToHtml(content, chapterDir);
      
      const outputPath = path.join(this.outputDir, 'chapters', `${chapterDir}.html`);
      await fs.writeFile(outputPath, html);
      
      // 添加到章節列表
      this.chapters.push({
        id: chapterDir,
        title: this.extractTitle(content),
        description: this.extractDescription(content),
        url: `/chapters/${chapterDir}.html`
      });
      
      // 添加到搜尋索引
      this.searchIndex.push({
        title: this.extractTitle(content),
        content: content.substring(0, 500),
        excerpt: this.extractDescription(content),
        url: `/chapters/${chapterDir}.html`
      });
    } catch (error) {
      console.warn(`無法處理章節 ${chapterDir}:`, error.message);
    }
  }

  extractTitle(markdown) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1] : '未命名章節';
  }

  extractDescription(markdown) {
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('*')) {
        return line.trim().substring(0, 150);
      }
    }
    return '章節描述';
  }

  async convertMarkdownToHtml(markdown, chapterDir) {
    const content = marked.parse(markdown);
    
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.extractTitle(markdown)} - Play Right with AI</title>
  <link rel="stylesheet" href="/docs/assets/css/main.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/docs/" class="nav-brand">Play Right with AI</a>
      <ul class="nav-links">
        <li><a href="/docs/" class="nav-link">首頁</a></li>
        <li><a href="/docs/chapters/" class="nav-link">章節</a></li>
        <li><a href="/docs/playground/" class="nav-link">Playground</a></li>
        <li><a href="/docs/demos/" class="nav-link">示範</a></li>
      </ul>
    </div>
  </nav>
  
  <div class="container">
    <article class="chapter-content fade-in">
      ${content}
    </article>
    
    <nav class="chapter-nav">
      ${this.generateChapterNavigation(chapterDir)}
    </nav>
  </div>
  
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="/docs/assets/js/main.js"></script>
</body>
</html>
    `;
  }

  generateChapterNavigation(currentChapter) {
    const currentIndex = this.chapters.findIndex(ch => ch.id === currentChapter);
    let nav = '<div class="chapter-nav-links">';
    
    if (currentIndex > 0) {
      const prev = this.chapters[currentIndex - 1];
      nav += `<a href="${prev.url}" class="btn btn-secondary">← 上一章</a>`;
    }
    
    if (currentIndex < this.chapters.length - 1) {
      const next = this.chapters[currentIndex + 1];
      nav += `<a href="${next.url}" class="btn">下一章 →</a>`;
    }
    
    nav += '</div>';
    return nav;
  }

  async generateHomepage() {
    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play Right with AI - AI 驅動的開發測試工作坊</title>
  <meta name="description" content="學習如何成為 AI 指揮家，協調多個 AI 工具創建自循環的開發測試流程">
  <link rel="stylesheet" href="/docs/assets/css/main.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/docs/" class="nav-brand">Play Right with AI</a>
      <ul class="nav-links">
        <li><a href="/docs/chapters/" class="nav-link">章節</a></li>
        <li><a href="/docs/playground/" class="nav-link">Playground</a></li>
        <li><a href="/docs/demos/" class="nav-link">示範</a></li>
        <li><a href="https://github.com/your-repo/play-right-with-ai" class="nav-link">GitHub</a></li>
      </ul>
    </div>
  </nav>
  
  <main>
    <section class="hero">
      <div class="container">
        <h1>Play Right with AI</h1>
        <p>成為 AI 指揮家，協調多個 AI 工具創建自循環的開發測試流程</p>
        <div class="hero-actions">
          <a href="/docs/chapters/chapter-01.html" class="btn">開始學習</a>
          <a href="/docs/playground/" class="btn btn-secondary">試用 Playground</a>
        </div>
      </div>
    </section>
    
    <section class="features">
      <div class="container">
        <h2>工作坊特色</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>🎭 AI 驅動開發</h3>
            <p>學習使用 Claude、Gemini 等 AI 工具自動生成應用程式碼</p>
          </div>
          <div class="feature-card">
            <h3>🔄 自循環測試</h3>
            <p>建立 AI 驅動的測試、分析、修復循環</p>
          </div>
          <div class="feature-card">
            <h3>🎯 Playwright 整合</h3>
            <p>使用 MCP 協議實現 AI 與瀏覽器自動化的無縫整合</p>
          </div>
          <div class="feature-card">
            <h3>🌐 雙語提示策略</h3>
            <p>掌握中英文混合提示技巧，獲得最佳 AI 輸出</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="chapters">
      <div class="container">
        <h2>學習章節</h2>
        <div class="chapters-grid">
          ${this.chapters.map((chapter, index) => `
            <a href="${chapter.url}" class="chapter-card">
              <span class="chapter-number">第 ${index + 1} 章</span>
              <h3 class="chapter-title">${chapter.title}</h3>
              <p class="chapter-description">${chapter.description}</p>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    
    <section class="search-section">
      <div class="container">
        <h2>搜尋內容</h2>
        <div class="search-container">
          <input type="text" id="search" class="search-input" placeholder="搜尋章節、提示詞、程式碼...">
          <span class="search-icon">🔍</span>
        </div>
        <div id="search-results"></div>
      </div>
    </section>
    
    <section class="quick-start">
      <div class="container">
        <h2>快速開始</h2>
        <div class="steps">
          <div class="step">
            <h3>1. 設定環境</h3>
            <pre><code class="language-bash"># 安裝必要工具
npm install -g @playwright/test
npm install -g @anthropic-ai/claude-cli

# 配置 API 金鑰
export ANTHROPIC_API_KEY="your-key"
export GOOGLE_API_KEY="your-key"</code></pre>
          </div>
          <div class="step">
            <h3>2. 克隆專案</h3>
            <pre><code class="language-bash">git clone https://github.com/your-repo/play-right-with-ai
cd play-right-with-ai
npm install</code></pre>
          </div>
          <div class="step">
            <h3>3. 開始學習</h3>
            <pre><code class="language-bash"># 進入第一章
cd workshop/chapter-01
cat README.md

# 執行範例
npm run demo</code></pre>
          </div>
        </div>
      </div>
    </section>
  </main>
  
  <footer>
    <div class="container">
      <p>© 2024 Play Right with AI Workshop. 開源教學專案。</p>
    </div>
  </footer>
  
  <script src="/docs/assets/js/main.js"></script>
</body>
</html>
    `;
    
    await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
  }

  async generateSearchIndex() {
    const indexPath = path.join(this.outputDir, 'search-index.json');
    await fs.writeFile(indexPath, JSON.stringify(this.searchIndex, null, 2));
  }

  async generatePlayground() {
    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Playground - Play Right with AI</title>
  <link rel="stylesheet" href="/docs/assets/css/main.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/docs/" class="nav-brand">Play Right with AI</a>
      <ul class="nav-links">
        <li><a href="/docs/" class="nav-link">首頁</a></li>
        <li><a href="/docs/chapters/" class="nav-link">章節</a></li>
        <li><a href="/docs/playground/" class="nav-link">Playground</a></li>
        <li><a href="/docs/demos/" class="nav-link">示範</a></li>
      </ul>
    </div>
  </nav>
  
  <div class="container">
    <h1>AI Prompt Playground</h1>
    <p>在這裡測試您的 AI 提示詞，體驗雙語提示策略的效果</p>
    
    <div class="playground-container">
      <div class="playground-input">
        <h3>輸入提示詞</h3>
        <textarea id="prompt-input" class="playground-textarea" placeholder="輸入您的提示詞...

範例：
You are a senior developer. Create a TODO application with:
- Modern design
- Local storage
請用繁體中文註解"></textarea>
        <button id="run-prompt" class="btn">執行提示</button>
      </div>
      
      <div class="playground-output">
        <h3>AI 回應</h3>
        <div id="prompt-output">
          <p style="color: var(--text-secondary)">等待輸入...</p>
        </div>
      </div>
    </div>
    
    <div class="prompt-examples">
      <h2>範例提示詞</h2>
      <div class="examples-grid">
        <div class="example-card">
          <h4>應用生成</h4>
          <pre><code>You are a senior developer. Create a calculator app with:
- Basic operations (+, -, *, /)
- Clean UI design
- Error handling
請用繁體中文註解所有功能</code></pre>
        </div>
        <div class="example-card">
          <h4>測試策略</h4>
          <pre><code>分析這個應用程式並設計測試策略：
[應用程式碼]
Please focus on:
- Critical user paths
- Edge cases
- Performance testing</code></pre>
        </div>
        <div class="example-card">
          <h4>除錯分析</h4>
          <pre><code>Debug this test failure:
[錯誤訊息]
請分析可能原因並提供修復建議
Consider browser compatibility issues</code></pre>
        </div>
      </div>
    </div>
  </div>
  
  <script src="/docs/assets/js/main.js"></script>
</body>
</html>
    `;
    
    await fs.writeFile(path.join(this.outputDir, 'playground', 'index.html'), html);
  }

  async generateDemos() {
    // 生成示範應用頁面
    const demosHtml = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示範應用 - Play Right with AI</title>
  <link rel="stylesheet" href="/docs/assets/css/main.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/docs/" class="nav-brand">Play Right with AI</a>
      <ul class="nav-links">
        <li><a href="/docs/" class="nav-link">首頁</a></li>
        <li><a href="/docs/chapters/" class="nav-link">章節</a></li>
        <li><a href="/docs/playground/" class="nav-link">Playground</a></li>
        <li><a href="/docs/demos/" class="nav-link">示範</a></li>
      </ul>
    </div>
  </nav>
  
  <div class="container">
    <h1>示範應用程式</h1>
    <p>這些是工作坊中 AI 生成的應用範例</p>
    
    <div class="demos-grid">
      <div class="demo-card">
        <h3>待辦事項應用</h3>
        <p>由 Claude 生成的完整 TODO 應用，包含本地儲存功能</p>
        <a href="/docs/demos/todo-app.html" class="btn">查看示範</a>
      </div>
      
      <div class="demo-card">
        <h3>計算機應用</h3>
        <p>由 Gemini 生成的計算機，支援基本運算功能</p>
        <a href="/docs/demos/calculator.html" class="btn">查看示範</a>
      </div>
      
      <div class="demo-card">
        <h3>倒數計時器</h3>
        <p>由 GPT 生成的倒數計時器，具有暫停和重置功能</p>
        <a href="/docs/demos/timer.html" class="btn">查看示範</a>
      </div>
    </div>
  </div>
  
  <script src="/docs/assets/js/main.js"></script>
</body>
</html>
    `;
    
    await fs.writeFile(path.join(this.outputDir, 'demos', 'index.html'), demosHtml);
    
    // 複製示範應用（如果存在）
    const sampleAppDir = path.join(this.sourceDir, 'sample-app-source');
    try {
      const apps = await fs.readdir(sampleAppDir);
      for (const app of apps) {
        const sourcePath = path.join(sampleAppDir, app);
        const destPath = path.join(this.outputDir, 'demos', app);
        await this.copyFile(sourcePath, destPath);
      }
    } catch (error) {
      console.log('示範應用目錄尚未建立');
    }
  }

  async copyFile(source, dest) {
    try {
      const content = await fs.readFile(source);
      await fs.writeFile(dest, content);
    } catch (error) {
      console.warn(`無法複製檔案 ${source}:`, error.message);
    }
  }
}

// 執行建構
if (require.main === module) {
  const builder = new SiteBuilder();
  builder.build().catch(console.error);
}

module.exports = SiteBuilder;