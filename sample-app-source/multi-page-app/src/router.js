/**
 * 客戶端路由系統
 * 管理單頁應用的頁面切換和歷史記錄
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // 監聽瀏覽器前進/返回
        window.addEventListener('popstate', (e) => {
            const route = this.getRouteFromHash();
            this.loadRoute(route, false);
        });

        // 監聽 hash 變化
        window.addEventListener('hashchange', (e) => {
            const route = this.getRouteFromHash();
            this.loadRoute(route, false);
        });
    }

    register(route, config) {
        this.routes[route] = config;
    }

    navigate(route, pushState = true) {
        if (!this.routes[route]) {
            console.error(`Route "${route}" not found`);
            return;
        }

        if (pushState) {
            window.location.hash = route;
        }

        this.loadRoute(route, false);
    }

    loadRoute(route, pushState = true) {
        if (!this.routes[route]) {
            route = 'home'; // 預設路由
        }

        const config = this.routes[route];
        
        // 隱藏所有頁面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 顯示當前頁面
        const page = document.getElementById(config.pageId);
        if (page) {
            page.classList.add('active');
        }

        // 更新導航連結狀態
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.nav === route) {
                link.classList.add('active');
            }
        });

        // 更新頁面標題
        document.title = config.title || '多頁面應用範例';

        // 更新麵包屑
        this.updateBreadcrumb(route, config);

        // 執行頁面初始化
        if (config.onLoad && typeof config.onLoad === 'function') {
            config.onLoad();
        }

        // 關閉行動版選單
        this.closeMobileMenu();

        this.currentRoute = route;
    }

    updateBreadcrumb(route, config) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const path = config.breadcrumb || [];
        
        if (path.length === 0) {
            breadcrumb.style.display = 'none';
            return;
        }

        breadcrumb.style.display = 'block';
        breadcrumb.innerHTML = path.map((item, index) => {
            if (index === path.length - 1) {
                return `<span class="breadcrumb-current">${item.text}</span>`;
            }
            return `<a href="#${item.route}" class="breadcrumb-link">${item.text}</a>`;
        }).join(' <span class="breadcrumb-separator">›</span> ');
    }

    getRouteFromHash() {
        const hash = window.location.hash.slice(1);
        return hash || 'home';
    }

    closeMobileMenu() {
        const nav = document.getElementById('navigation');
        const hamburger = document.getElementById('hamburgerMenu');
        if (nav && hamburger) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}