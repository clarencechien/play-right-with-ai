/**
 * Google Analytics 4 整合
 * 隱私優先的分析追蹤實作
 */

// 設定 GA 測量 ID（請替換為實際的 ID）
const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID';

// Analytics 管理器
class AnalyticsManager {
  constructor() {
    this.isEnabled = false;
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
    this.scrollDepthMax = 0;
    this.init();
  }

  init() {
    // 檢查用戶同意狀態
    this.checkConsent();
    
    // 設置事件監聽器
    if (this.isEnabled) {
      this.setupEventListeners();
      this.trackPageView();
    }
    
    // 設置 Cookie 同意橫幅
    this.setupCookieBanner();
  }

  checkConsent() {
    const consent = localStorage.getItem('cookieConsent');
    this.isEnabled = consent === 'accepted';
    
    if (this.isEnabled && typeof gtag === 'undefined') {
      // 動態載入 GA 如果尚未載入
      this.loadGoogleAnalytics();
    }
  }

  loadGoogleAnalytics() {
    // 動態載入 GA 腳本
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 初始化 gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=None;Secure',
      'cookie_expires': 30 * 24 * 60 * 60, // 30 天
      'send_page_view': false // 我們手動發送頁面瀏覽
    });
  }

  setupCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    
    // 檢查是否需要顯示橫幅
    const consent = localStorage.getItem('cookieConsent');
    if (!consent && banner) {
      banner.style.display = 'block';
    }
    
    // 接受 Cookies
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        localStorage.setItem('consentDate', new Date().toISOString());
        this.isEnabled = true;
        this.loadGoogleAnalytics();
        this.setupEventListeners();
        this.trackPageView();
        this.trackEvent('Cookie Consent', 'Accept', window.location.pathname);
        if (banner) banner.style.display = 'none';
      });
    }
    
    // 拒絕 Cookies
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        localStorage.setItem('consentDate', new Date().toISOString());
        this.isEnabled = false;
        this.disableAnalytics();
        if (banner) banner.style.display = 'none';
      });
    }
  }

  disableAnalytics() {
    // 停用 GA 追蹤
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // 清除 GA cookies
    document.cookie.split(";").forEach(function(c) { 
      if (c.indexOf('_ga') === 0 || c.indexOf('_gid') === 0) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
  }

  setupEventListeners() {
    // 頁面滾動深度追蹤
    this.setupScrollTracking();
    
    // 章節導航追蹤
    this.setupChapterTracking();
    
    // 外部連結追蹤
    this.setupExternalLinkTracking();
    
    // 程式碼複製追蹤
    this.setupCodeCopyTracking();
    
    // 下載追蹤
    this.setupDownloadTracking();
    
    // Playground 使用追蹤
    this.setupPlaygroundTracking();
    
    // 搜尋追蹤
    this.setupSearchTracking();
    
    // 頁面停留時間追蹤
    this.setupTimeTracking();
    
    // 練習完成追蹤
    this.setupExerciseTracking();
  }

  trackPageView() {
    if (!this.isEnabled || typeof gtag === 'undefined') return;
    
    const pageData = {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      chapter: this.getCurrentChapter(),
      user_type: this.getUserType()
    };
    
    gtag('event', 'page_view', pageData);
  }

  trackEvent(category, action, label = null, value = null) {
    if (!this.isEnabled || typeof gtag === 'undefined') return;
    
    const eventData = {
      event_category: category,
      event_label: label,
      value: value
    };
    
    gtag('event', action, eventData);
  }

  setupScrollTracking() {
    let scrollTimeout;
    const depths = [25, 50, 75, 90, 100];
    const trackedDepths = new Set();
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = this.getScrollPercentage();
        
        depths.forEach(depth => {
          if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
            trackedDepths.add(depth);
            this.trackEvent('Engagement', 'scroll_depth', `${depth}%`, depth);
          }
        });
        
        this.scrollDepthMax = Math.max(this.scrollDepthMax, scrollPercentage);
      }, 100);
    });
  }

  setupChapterTracking() {
    // 追蹤章節導航
    document.querySelectorAll('a[href*="chapter-"]').forEach(link => {
      link.addEventListener('click', () => {
        const chapterMatch = link.href.match(/chapter-(\d+)/);
        if (chapterMatch) {
          this.trackEvent('Navigation', 'chapter_click', `Chapter ${chapterMatch[1]}`);
        }
      });
    });
    
    // 追蹤上一章/下一章導航
    document.querySelectorAll('.prev-chapter, .next-chapter').forEach(link => {
      link.addEventListener('click', () => {
        const direction = link.classList.contains('prev-chapter') ? 'previous' : 'next';
        this.trackEvent('Navigation', 'chapter_navigation', direction);
      });
    });
  }

  setupExternalLinkTracking() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.hostname.includes(window.location.hostname)) {
        link.addEventListener('click', () => {
          this.trackEvent('Outbound', 'external_link_click', link.href);
        });
      }
    });
  }

  setupCodeCopyTracking() {
    // 追蹤程式碼複製按鈕
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeBlock = btn.parentElement.querySelector('code');
        const language = codeBlock?.className.match(/language-(\w+)/)?.[1] || 'unknown';
        this.trackEvent('Engagement', 'code_copy', language);
      });
    });
    
    // 追蹤選擇複製
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection().toString();
      if (selection.length > 10) {
        const isCode = e.target.closest('pre') !== null;
        this.trackEvent('Engagement', 'content_copy', isCode ? 'code' : 'text');
      }
    });
  }

  setupDownloadTracking() {
    document.querySelectorAll('a[download], a[href$=".pdf"], a[href$=".zip"]').forEach(link => {
      link.addEventListener('click', () => {
        const fileName = link.getAttribute('download') || link.href.split('/').pop();
        this.trackEvent('Download', 'file_download', fileName);
      });
    });
  }

  setupPlaygroundTracking() {
    const runButton = document.getElementById('run-prompt');
    if (runButton) {
      runButton.addEventListener('click', () => {
        const promptInput = document.getElementById('prompt-input');
        const promptLength = promptInput?.value.length || 0;
        this.trackEvent('Playground', 'run_prompt', 'prompt_execution', promptLength);
      });
    }
    
    // 追蹤 Playground 範例使用
    document.querySelectorAll('.example-prompt').forEach(example => {
      example.addEventListener('click', () => {
        const exampleType = example.dataset.type || 'unknown';
        this.trackEvent('Playground', 'use_example', exampleType);
      });
    });
  }

  setupSearchTracking() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          if (e.target.value.length > 2) {
            this.trackEvent('Search', 'search_query', e.target.value);
          }
        }, 1000);
      });
    }
  }

  setupTimeTracking() {
    // 追蹤頁面停留時間
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
      const sessionTime = Math.round((Date.now() - this.sessionStartTime) / 1000);
      
      this.trackEvent('Engagement', 'time_on_page', window.location.pathname, timeOnPage);
      
      // 儲存會話時間
      if (sessionTime > 30) { // 只追蹤超過 30 秒的會話
        this.trackEvent('Engagement', 'session_duration', null, sessionTime);
      }
    });
    
    // 追蹤頁面可見性變化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const timeVisible = Math.round((Date.now() - this.pageStartTime) / 1000);
        this.trackEvent('Engagement', 'page_visibility', 'hidden', timeVisible);
      } else {
        this.pageStartTime = Date.now();
        this.trackEvent('Engagement', 'page_visibility', 'visible');
      }
    });
  }

  setupExerciseTracking() {
    // 追蹤練習完成
    document.querySelectorAll('.exercise-complete').forEach(btn => {
      btn.addEventListener('click', () => {
        const exerciseId = btn.dataset.exerciseId || 'unknown';
        const chapter = this.getCurrentChapter();
        this.trackEvent('Learning', 'exercise_complete', `${chapter}:${exerciseId}`);
      });
    });
    
    // 追蹤測驗結果
    document.querySelectorAll('.quiz-submit').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = btn.dataset.quizId || 'unknown';
        const score = this.calculateQuizScore(btn);
        this.trackEvent('Learning', 'quiz_submit', quizId, score);
      });
    });
  }

  // 輔助函數
  getScrollPercentage() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    
    if (documentHeight === 0) return 100;
    return Math.min(100, Math.round((scrolled / documentHeight) * 100));
  }

  getCurrentChapter() {
    const path = window.location.pathname;
    const match = path.match(/chapter-(\d+)/);
    return match ? `chapter_${match[1]}` : 'home';
  }

  getUserType() {
    const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
    localStorage.setItem('visitCount', visitCount.toString());
    
    if (visitCount === 1) return 'new_user';
    if (visitCount < 5) return 'returning_user';
    return 'frequent_user';
  }

  calculateQuizScore(submitBtn) {
    const quiz = submitBtn.closest('.quiz-container');
    if (!quiz) return 0;
    
    const correct = quiz.querySelectorAll('.answer.correct:checked').length;
    const total = quiz.querySelectorAll('.answer').length;
    
    return Math.round((correct / total) * 100);
  }

  // 公開 API 方法
  static trackCustomEvent(category, action, label, value) {
    if (window.analyticsManager) {
      window.analyticsManager.trackEvent(category, action, label, value);
    }
  }

  static updateConsent(accepted) {
    if (window.analyticsManager) {
      if (accepted) {
        localStorage.setItem('cookieConsent', 'accepted');
        window.analyticsManager.isEnabled = true;
        window.analyticsManager.loadGoogleAnalytics();
        window.analyticsManager.setupEventListeners();
      } else {
        localStorage.setItem('cookieConsent', 'rejected');
        window.analyticsManager.isEnabled = false;
        window.analyticsManager.disableAnalytics();
      }
    }
  }
}

// 初始化 Analytics Manager
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsManager = new AnalyticsManager();
});

// 匯出給全域使用
window.Analytics = {
  track: AnalyticsManager.trackCustomEvent,
  updateConsent: AnalyticsManager.updateConsent
};