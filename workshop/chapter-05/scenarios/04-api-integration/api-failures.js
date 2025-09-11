/**
 * API 整合失敗場景集合
 * 展示網路請求和 API 互動的常見問題
 */

// ============================================
// API 錯誤 1: Network Timeout
// ============================================
class NetworkTimeoutError {
    // 錯誤版本
    async buggyCode(page) {
        // API 響應緩慢，但沒有適當的超時處理
        await page.click('#fetch-data');
        
        // 預設超時可能太短
        const data = await page.textContent('.api-result'); // 可能超時
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "API 請求超時",
        symptoms: "TimeoutError: waiting for selector '.api-result'",
        causes: [
            "網路延遲",
            "伺服器響應緩慢",
            "大量資料處理"
        ],
        fix: `
            // 方法 1: 增加超時時間
            await page.click('#fetch-data');
            await page.waitForSelector('.api-result', {
                timeout: 60000 // 60 秒
            });
            const data = await page.textContent('.api-result');
        `,
        networkWaitFix: `
            // 方法 2: 等待特定的網路請求完成
            await page.click('#fetch-data');
            
            const response = await page.waitForResponse(
                response => response.url().includes('/api/data') && 
                           response.status() === 200,
                { timeout: 60000 }
            );
            
            // 確認資料已渲染
            await page.waitForSelector('.api-result');
            const data = await page.textContent('.api-result');
        `,
        retryFix: `
            // 方法 3: 實施重試機制
            async function fetchWithRetry(page, maxRetries = 3) {
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        await page.click('#fetch-data');
                        await page.waitForSelector('.api-result', {
                            timeout: 20000
                        });
                        return await page.textContent('.api-result');
                    } catch (error) {
                        if (i === maxRetries - 1) throw error;
                        await page.reload();
                    }
                }
            }
        `
    };
}

// ============================================
// API 錯誤 2: Authentication Failure
// ============================================
class AuthenticationError {
    // 錯誤版本
    async buggyCode(page) {
        // 嘗試訪問需要認證的 API
        await page.goto('/protected-page');
        
        // 401 錯誤導致頁面顯示錯誤訊息
        const content = await page.textContent('.content');
        expect(content).toContain('Data'); // 失敗：顯示 "Unauthorized"
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "API 認證失敗",
        httpStatus: 401,
        symptoms: "頁面顯示未授權錯誤",
        fix: `
            // 方法 1: 設置認證 token
            await page.evaluate((token) => {
                localStorage.setItem('authToken', token);
            }, 'your-auth-token');
            
            await page.goto('/protected-page');
            const content = await page.textContent('.content');
        `,
        cookieFix: `
            // 方法 2: 設置認證 cookie
            await page.context().addCookies([{
                name: 'session',
                value: 'session-token',
                domain: 'localhost',
                path: '/'
            }]);
            
            await page.goto('/protected-page');
        `,
        headerFix: `
            // 方法 3: 攔截請求並添加認證標頭
            await page.route('**/api/**', async route => {
                const headers = {
                    ...route.request().headers(),
                    'Authorization': 'Bearer your-token'
                };
                await route.continue({ headers });
            });
            
            await page.goto('/protected-page');
        `,
        loginFlowFix: `
            // 方法 4: 完整的登入流程
            async function loginAndNavigate(page) {
                await page.goto('/login');
                await page.fill('#username', 'testuser');
                await page.fill('#password', 'testpass');
                await page.click('#login-button');
                
                // 等待登入完成
                await page.waitForURL('/dashboard');
                
                // 現在可以訪問受保護頁面
                await page.goto('/protected-page');
            }
        `
    };
}

// ============================================
// API 錯誤 3: CORS Issues
// ============================================
class CORSError {
    // 錯誤版本
    async buggyCode(page) {
        // 跨域請求被阻擋
        await page.evaluate(() => {
            fetch('https://external-api.com/data')
                .then(res => res.json())
                .then(data => {
                    document.querySelector('#result').textContent = data.value;
                });
        });
        
        // 資料永遠不會顯示
        const result = await page.textContent('#result');
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "CORS (跨域資源共享) 錯誤",
        browserError: "Access to fetch at 'https://external-api.com/data' from origin 'http://localhost' has been blocked by CORS policy",
        explanation: "瀏覽器安全策略阻止跨域請求",
        testFix: `
            // 測試環境解決方案 1: 禁用 CORS 檢查
            const context = await browser.newContext({
                bypassCSP: true,
                extraHTTPHeaders: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
            const page = await context.newPage();
        `,
        proxyFix: `
            // 解決方案 2: 使用代理伺服器
            await page.route('**/external-api.com/**', async route => {
                const response = await fetch(route.request().url());
                const body = await response.text();
                await route.fulfill({
                    status: response.status,
                    headers: {
                        ...response.headers,
                        'Access-Control-Allow-Origin': '*'
                    },
                    body
                });
            });
        `,
        mockFix: `
            // 解決方案 3: 模擬 API 響應
            await page.route('**/external-api.com/data', async route => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ value: 'mocked data' })
                });
            });
        `
    };
}

// ============================================
// API 錯誤 4: Rate Limiting
// ============================================
class RateLimitError {
    // 錯誤版本
    async buggyCode(page) {
        // 快速發送多個請求
        for (let i = 0; i < 10; i++) {
            await page.click('#fetch-data');
        }
        
        // 後面的請求可能被限流（429 錯誤）
        const results = await page.locator('.result-item').count();
        expect(results).toBe(10); // 可能少於 10
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "API 速率限制",
        httpStatus: 429,
        symptoms: "Too Many Requests",
        fix: `
            // 方法 1: 添加延遲
            for (let i = 0; i < 10; i++) {
                await page.click('#fetch-data');
                await page.waitForTimeout(1000); // 每次請求間隔 1 秒
            }
        `,
        batchFix: `
            // 方法 2: 批次請求
            await page.evaluate(() => {
                // 收集所有請求
                const requests = Array.from({length: 10}, (_, i) => i);
                
                // 批次處理
                return fetch('/api/batch', {
                    method: 'POST',
                    body: JSON.stringify({ requests })
                });
            });
        `,
        queueFix: `
            // 方法 3: 實施請求佇列
            class RequestQueue {
                constructor(maxConcurrent = 2, delay = 1000) {
                    this.maxConcurrent = maxConcurrent;
                    this.delay = delay;
                    this.running = 0;
                    this.queue = [];
                }
                
                async add(requestFn) {
                    if (this.running >= this.maxConcurrent) {
                        await new Promise(resolve => this.queue.push(resolve));
                    }
                    
                    this.running++;
                    try {
                        const result = await requestFn();
                        await new Promise(resolve => setTimeout(resolve, this.delay));
                        return result;
                    } finally {
                        this.running--;
                        const next = this.queue.shift();
                        if (next) next();
                    }
                }
            }
            
            const queue = new RequestQueue(2, 1000);
            for (let i = 0; i < 10; i++) {
                await queue.add(() => page.click('#fetch-data'));
            }
        `,
        retryWithBackoff: `
            // 方法 4: 指數退避重試
            async function retryWithExponentialBackoff(fn, maxRetries = 5) {
                let delay = 1000;
                
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        return await fn();
                    } catch (error) {
                        if (error.message.includes('429') && i < maxRetries - 1) {
                            await page.waitForTimeout(delay);
                            delay *= 2; // 指數增長
                        } else {
                            throw error;
                        }
                    }
                }
            }
        `
    };
}

// ============================================
// API 錯誤 5: Data Inconsistency
// ============================================
class DataInconsistencyError {
    // 錯誤版本
    async buggyCode(page) {
        // 創建資料
        await page.click('#create-item');
        
        // 立即查詢（可能還未同步）
        await page.reload();
        const items = await page.locator('.item').count();
        expect(items).toBe(1); // 可能為 0（資料庫尚未同步）
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "資料不一致性",
        cause: "資料庫複寫延遲或快取問題",
        symptoms: "新創建的資料無法立即查詢到",
        fix: `
            // 方法 1: 等待資料同步
            await page.click('#create-item');
            
            // 等待成功訊息
            await page.waitForSelector('.success-message');
            
            // 額外等待確保資料庫同步
            await page.waitForTimeout(2000);
            
            await page.reload();
            const items = await page.locator('.item').count();
        `,
        pollingFix: `
            // 方法 2: 輪詢直到資料出現
            await page.click('#create-item');
            
            await page.waitForFunction(
                async () => {
                    await page.reload();
                    const count = await page.locator('.item').count();
                    return count > 0;
                },
                { timeout: 10000, polling: 1000 }
            );
        `,
        eventualConsistencyFix: `
            // 方法 3: 處理最終一致性
            async function waitForEventualConsistency(page, checkFn, options = {}) {
                const maxWait = options.maxWait || 30000;
                const interval = options.interval || 1000;
                const startTime = Date.now();
                
                while (Date.now() - startTime < maxWait) {
                    const result = await checkFn();
                    if (result) return result;
                    
                    await page.waitForTimeout(interval);
                    await page.reload();
                }
                
                throw new Error('Data consistency timeout');
            }
            
            await page.click('#create-item');
            await waitForEventualConsistency(page, async () => {
                const count = await page.locator('.item').count();
                return count > 0;
            });
        `
    };
}

// ============================================
// API 診斷工具
// ============================================
class APIDiagnosticTools {
    /**
     * 監控網路請求
     */
    static async monitorNetworkRequests(page) {
        const requests = [];
        const responses = [];
        const failures = [];

        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: Date.now()
            });
        });

        page.on('response', response => {
            const responseData = {
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                timestamp: Date.now()
            };

            responses.push(responseData);

            if (response.status() >= 400) {
                failures.push({
                    ...responseData,
                    category: this.categorizeHttpError(response.status())
                });
            }
        });

        page.on('requestfailed', request => {
            failures.push({
                url: request.url(),
                failure: request.failure(),
                timestamp: Date.now()
            });
        });

        return {
            getRequests: () => requests,
            getResponses: () => responses,
            getFailures: () => failures,
            getSummary: () => ({
                totalRequests: requests.length,
                totalResponses: responses.length,
                failures: failures.length,
                avgResponseTime: this.calculateAvgResponseTime(requests, responses)
            })
        };
    }

    /**
     * 分類 HTTP 錯誤
     */
    static categorizeHttpError(status) {
        if (status >= 400 && status < 500) {
            const clientErrors = {
                400: 'Bad Request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                429: 'Rate Limited'
            };
            return clientErrors[status] || 'Client Error';
        }
        
        if (status >= 500) {
            const serverErrors = {
                500: 'Internal Server Error',
                502: 'Bad Gateway',
                503: 'Service Unavailable',
                504: 'Gateway Timeout'
            };
            return serverErrors[status] || 'Server Error';
        }
        
        return 'Unknown Error';
    }

    /**
     * 計算平均響應時間
     */
    static calculateAvgResponseTime(requests, responses) {
        if (requests.length === 0) return 0;
        
        let totalTime = 0;
        let count = 0;
        
        responses.forEach(response => {
            const request = requests.find(r => r.url === response.url);
            if (request) {
                totalTime += response.timestamp - request.timestamp;
                count++;
            }
        });
        
        return count > 0 ? Math.round(totalTime / count) : 0;
    }

    /**
     * 生成 API 健康報告
     */
    static async generateAPIHealthReport(page, apiEndpoint) {
        const startTime = Date.now();
        const results = {
            endpoint: apiEndpoint,
            timestamp: new Date().toISOString(),
            checks: []
        };

        // 檢查可達性
        try {
            const response = await page.request.get(apiEndpoint);
            results.checks.push({
                name: 'Reachability',
                passed: response.status() < 400,
                status: response.status(),
                responseTime: Date.now() - startTime
            });
        } catch (error) {
            results.checks.push({
                name: 'Reachability',
                passed: false,
                error: error.message
            });
        }

        // 檢查響應格式
        try {
            const response = await page.request.get(apiEndpoint);
            const contentType = response.headers()['content-type'];
            results.checks.push({
                name: 'Content Type',
                passed: contentType?.includes('application/json'),
                contentType
            });
        } catch (error) {
            results.checks.push({
                name: 'Content Type',
                passed: false,
                error: error.message
            });
        }

        // 生成總結
        results.summary = {
            healthy: results.checks.every(c => c.passed),
            totalChecks: results.checks.length,
            passedChecks: results.checks.filter(c => c.passed).length,
            recommendation: this.generateHealthRecommendation(results.checks)
        };

        return results;
    }

    static generateHealthRecommendation(checks) {
        const failed = checks.filter(c => !c.passed);
        
        if (failed.length === 0) {
            return 'API 運行正常';
        }
        
        const recommendations = [];
        
        failed.forEach(check => {
            if (check.name === 'Reachability') {
                recommendations.push('檢查網路連接和 API 服務狀態');
            }
            if (check.status >= 500) {
                recommendations.push('聯繫後端團隊檢查伺服器錯誤');
            }
            if (check.status === 429) {
                recommendations.push('實施請求限流和重試機制');
            }
        });
        
        return recommendations.join('; ');
    }
}

module.exports = {
    NetworkTimeoutError,
    AuthenticationError,
    CORSError,
    RateLimitError,
    DataInconsistencyError,
    APIDiagnosticTools
};