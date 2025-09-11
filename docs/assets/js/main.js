
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
  
  const html = results.map(result => `
    <div class="search-result">
      <a href="${result.url}">
        <h4>${result.title}</h4>
        <p>${result.excerpt}</p>
      </a>
    </div>
  `).join('');
  
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
    output.innerHTML = `
      <h4>AI 回應範例：</h4>
      <p>這是一個模擬的 AI 回應。在實際使用中，這裡會顯示來自 Claude、Gemini 或其他 AI 模型的回應。</p>
      <p>您的提示詞：<span class="inline-code">${escapeHtml(prompt)}</span></p>
      <p>建議：嘗試使用雙語提示策略以獲得更好的結果！</p>
    `;
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
    