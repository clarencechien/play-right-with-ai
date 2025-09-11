/**
 * Client-side Router Implementation
 * Handles navigation without page refresh
 */

/**
 * Router 類別
 */
class Router {
    /**
     * 初始化建構函式
     */
    constructor() {
        this.routes = {};
        this.currentRoute = '/';
        this.notFoundHandler = null;
        this.navigationGuard = null;
        this.routeParams = {};
        this.history = [];
        this.init();
    }

    /**
     * init 方法
     */
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            const path = e.state?.path || '/';
            this.navigateToRoute(path, false);
        });

        // Handle link clicks
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('data-route')) {
                e.preventDefault();
                const route = e.target.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Set initial state
        window.history.replaceState({ path: '/' }, '', '/');
    }

    /**
     *
     * @param {*} path - path 參數
     * @param {*} handler - handler 參數
     */
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    /**
     *
     * @param {*} handler - handler 參數
     */
    setNotFoundHandler(handler) {
        this.notFoundHandler = handler;
    }

    /**
     *
     * @param {*} guard - guard 參數
     */
    setNavigationGuard(guard) {
        this.navigationGuard = guard;
    }

    /**
     *
     * @param {*} path - path 參數
     * @param {*} addToHistory - addToHistory 參數
     */
    navigate(path, addToHistory = true) {
        // Check navigation guard
        if (this.navigationGuard && !this.navigationGuard(path, this.currentRoute)) {
            return false;
        }

        this.navigateToRoute(path, addToHistory);
        return true;
    }

    /**
     *
     * @param {*} path - path 參數
     * @param {*} addToHistory - addToHistory 參數
     */
    navigateToRoute(path, addToHistory = true) {
        // Store previous route
        const previousRoute = this.currentRoute;
        
        // Parse route and parameters
        const { route, params } = this.parseRoute(path);
        
        // Find matching route handler
        const handler = this.findRouteHandler(route);
        
        if (handler) {
            this.currentRoute = path;
            this.routeParams = params;
            
            // Add to browser history
            if (addToHistory) {
                window.history.pushState({ path }, '', path);
                this.history.push(path);
            }
            
            // Execute route handler
            handler(params);
            
            // Emit route change event
            this.emitRouteChange(path, previousRoute);
        } else if (this.notFoundHandler) {
            this.notFoundHandler(path);
        } else {
            console.error(`Route not found: ${path}`);
            this.render404();
        }
    }

    /**
     *
     * @param {*} path - path 參數
     */
    parseRoute(path) {
        const parts = path.split('/').filter(p => p);
        const params = {};
        
        // Extract query parameters
        const [pathname, queryString] = path.split('?');
        if (queryString) {
            const urlParams = new URLSearchParams(queryString);
            urlParams.forEach((value, key) => {
                params[key] = value;
            });
        }
        
        return { route: pathname, params };
    }

    /**
     *
     * @param {*} path - path 參數
     */
    findRouteHandler(path) {
        // Direct match
        if (this.routes[path]) {
            return this.routes[path];
        }
        
        // Check for parameterized routes
        for (const routePath in this.routes) {
            const regex = this.createRouteRegex(routePath);
            const match = path.match(regex);
            
            if (match) {
                // Extract parameters
                const params = this.extractRouteParams(routePath, path);
                return (additionalParams) => {
                    this.routes[routePath]({ ...params, ...additionalParams });
                };
            }
        }
        
        return null;
    }

    /**
     *
     * @param {*} routePath - routePath 參數
     */
    createRouteRegex(routePath) {
        // Convert route pattern to regex
        // Example: /product/:id -> /product/([^/]+)
        const pattern = routePath
            .split('/')
            .map(part => {
                if (part.startsWith(':')) {
                    return '([^/]+)';
                }
                return part;
            })
            .join('/');
        
        return new RegExp(`^${pattern}$`);
    }

    /**
     *
     * @param {*} routePath - routePath 參數
     * @param {*} actualPath - actualPath 參數
     */
    extractRouteParams(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        const params = {};
        
        routeParts.forEach((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.substring(1);
                params[paramName] = actualParts[index];
            }
        });
        
        return params;
    }

    /**
     *
     * @param {*} newRoute - newRoute 參數
     * @param {*} oldRoute - oldRoute 參數
     */
    emitRouteChange(newRoute, oldRoute) {
        const event = new CustomEvent('routechange', {
            detail: { newRoute, oldRoute }
        });
        window.dispatchEvent(event);
    }

    /**
     * back 方法
     */
    back() {
        window.history.back();
    }

    /**
     * forward 方法
     */
    forward() {
        window.history.forward();
    }

    /**
     * getParams 方法
     */
    getParams() {
        return this.routeParams;
    }

    /**
     * getCurrentRoute 方法
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * render404 方法
     */
    render404() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="error-page">
                    <h1>404</h1>
                    <p>頁面不存在</p>
                    <a href="/" data-route="/">返回首頁</a>
                </div>
            `;
        }
    }

    /**
     * destroy 方法
     */
    destroy() {
        // Clean up event listeners
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}