
// Play Right with AI - 主要 JavaScript

// 基礎路徑配置（支援 GitHub Pages）
const BASE_PATH = (() => {
  const path = window.location.pathname;
  if (path.includes('/play-right-with-ai/')) {
    return '/play-right-with-ai/';
  }
  return '/';
})();

// 設置全域基礎路徑
window.__BASE_PATH__ = BASE_PATH;

document.addEventListener('DOMContentLoaded', function() {
  console.log('Play Right with AI Workshop 已載入');
  console.log('基礎路徑:', BASE_PATH);
  
  // 初始化平滑滾動
  initSmoothScroll();
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化程式碼高亮
  initCodeHighlight();
  
  // 初始化互動元素
  initInteractive();
  
  // 初始化章節導航
  initChapterNavigation();
  
  // 初始化 Cookie 管理
  initCookieManagement();
});

// 平滑滾動
function initSmoothScroll() {
  // 設置 CSS 平滑滾動
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // 處理錨點連結
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// 章節導航
function initChapterNavigation() {
  const chapterNav = document.querySelector('.chapter-nav-links');
  if (!chapterNav) return;
  
  // 獲取當前章節
  const currentPath = window.location.pathname;
  const chapterMatch = currentPath.match(/chapter-(\d+)\.html/);
  
  if (chapterMatch) {
    const currentChapter = parseInt(chapterMatch[1]);
    const prevChapter = currentChapter - 1;
    const nextChapter = currentChapter + 1;
    
    let navHTML = '';
    
    if (prevChapter >= 1) {
      navHTML += `<a href="chapter-${prevChapter.toString().padStart(2, '0')}.html" class="prev-chapter">← 上一章</a>`;
    }
    
    navHTML += `<a href="../" class="back-to-home">返回首頁</a>`;
    
    if (nextChapter <= 8) {
      navHTML += `<a href="chapter-${nextChapter.toString().padStart(2, '0')}.html" class="next-chapter">下一章 →</a>`;
    }
    
    chapterNav.innerHTML = navHTML;
  }
}

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
  
  // 使用相對路徑獲取搜尋索引
  const searchIndexPath = (() => {
    const path = window.location.pathname;
    if (path.includes('/chapters/')) {
      return '../search-index.json';
    }
    return 'search-index.json';
  })();
  
  fetch(searchIndexPath)
    .then(res => {
      if (!res.ok) {
        console.warn('搜尋索引不存在');
        return null;
      }
      return res.json();
    })
    .then(index => {
      if (index) {
        const results = searchInIndex(index, query);
        displaySearchResults(results);
      }
    })
    .catch(err => {
      console.error('搜尋錯誤:', err);
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
  // 避免重複添加
  if (block.querySelector('.copy-btn')) return;
  
  const button = document.createElement('button');
  button.className = 'copy-btn';
  button.innerHTML = '<span>📋</span> 複製';
  button.title = '點擊複製程式碼';
  
  button.onclick = () => {
    const code = block.querySelector('code');
    if (!code) return;
    
    const text = code.textContent;
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // 備用複製方法
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    };
    
    copyToClipboard().then(success => {
      if (success) {
        button.innerHTML = '<span>✅</span> 已複製！';
        button.classList.add('copied');
        
        // 顯示浮動提示
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '程式碼已複製到剪貼簿';
        tooltip.style.cssText = `
          position: absolute;
          top: -35px;
          right: 0;
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          animation: fadeInOut 2s ease;
          pointer-events: none;
        `;
        button.appendChild(tooltip);
        
        setTimeout(() => {
          button.innerHTML = '<span>📋</span> 複製';
          button.classList.remove('copied');
          if (tooltip.parentNode) {
            tooltip.remove();
          }
        }, 2500);
      } else {
        button.innerHTML = '<span>❌</span> 複製失敗';
        setTimeout(() => {
          button.innerHTML = '<span>📋</span> 複製';
        }, 2000);
      }
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
    
// Cookie 管理功能
function initCookieManagement() {
  // 檢查是否已有同意記錄
  const consent = getCookie('cookieConsent') || localStorage.getItem('cookieConsent');
  
  // 如果沒有同意記錄，顯示橫幅
  if (!consent) {
    showCookieBanner();
  }
  
  // 設置 Cookie 偏好設定連結
  setupCookiePreferences();
}

function showCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.display = 'block';
  }
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function setupCookiePreferences() {
  // 添加 Cookie 設定按鈕到頁腳
  const footer = document.querySelector('footer');
  if (footer && !document.getElementById('cookie-settings')) {
    const settingsLink = document.createElement('a');
    settingsLink.id = 'cookie-settings';
    settingsLink.href = '#';
    settingsLink.textContent = 'Cookie 設定';
    settingsLink.style.cssText = 'color: #fff; text-decoration: underline; margin-left: 20px;';
    settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCookieSettings();
    });
    
    const footerP = footer.querySelector('p');
    if (footerP) {
      footerP.appendChild(settingsLink);
    }
  }
}

function showCookieSettings() {
  const modal = document.createElement('div');
  modal.className = 'cookie-settings-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Cookie 設定</h2>
      <p>管理您的 Cookie 偏好設定</p>
      
      <div class="cookie-option">
        <label>
          <input type="checkbox" id="analytics-cookies" ${localStorage.getItem('cookieConsent') === 'accepted' ? 'checked' : ''}>
          <span>分析 Cookies</span>
        </label>
        <p>幫助我們了解訪客如何使用網站，以改善使用體驗。</p>
      </div>
      
      <div class="modal-actions">
        <button id="save-cookie-settings" class="btn btn-primary">儲存設定</button>
        <button id="close-cookie-settings" class="btn btn-secondary">關閉</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 事件處理
  document.getElementById('save-cookie-settings').addEventListener('click', () => {
    const analyticsEnabled = document.getElementById('analytics-cookies').checked;
    if (analyticsEnabled) {
      acceptCookies();
    } else {
      rejectCookies();
    }
    document.body.removeChild(modal);
  });
  
  document.getElementById('close-cookie-settings').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

function acceptCookies() {
  setCookie('cookieConsent', 'accepted', 365);
  localStorage.setItem('cookieConsent', 'accepted');
  localStorage.setItem('consentDate', new Date().toISOString());
  hideCookieBanner();
  
  // 通知 Analytics Manager
  if (window.Analytics) {
    window.Analytics.updateConsent(true);
  }
}

function rejectCookies() {
  setCookie('cookieConsent', 'rejected', 365);
  localStorage.setItem('cookieConsent', 'rejected');
  localStorage.setItem('consentDate', new Date().toISOString());
  hideCookieBanner();
  
  // 通知 Analytics Manager
  if (window.Analytics) {
    window.Analytics.updateConsent(false);
  }
}

// Cookie 輔助函數
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Analytics 事件輔助函數
function trackEvent(category, action, label, value) {
  if (window.Analytics) {
    window.Analytics.track(category, action, label, value);
  }
}
