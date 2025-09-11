/**
 * 非同步與時序問題場景集合
 * 展示常見的競態條件和時序相關錯誤
 */

// ============================================
// 時序錯誤 1: Race Condition
// ============================================
/**
 * RaceConditionError 類別
 */
class RaceConditionError {
    // 錯誤版本
    /**
     *
     * @param {*} page - page 參數
     */
    async buggyCode(page) {
        // 同時觸發兩個非同步操作
        page.click('#load-data-1'); // 不等待
        page.click('#load-data-2'); // 不等待
        
        // 立即檢查結果，但資料可能還未載入
        const result = await page.textContent('.result');
        expect(result).toContain('Complete');
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "競態條件：多個非同步操作的完成順序不確定",
        symptoms: "間歇性測試失敗，本地通過但 CI 失敗",
        rootCause: "沒有正確等待非同步操作完成",
        fix: `
            // 方法 1: 依序等待
            await page.click('#load-data-1');
            await page.waitForSelector('.data-1-loaded');
            await page.click('#load-data-2');
            await page.waitForSelector('.data-2-loaded');
            
            const result = await page.textContent('.result');
            expect(result).toContain('Complete');
        `,
        parallelFix: `
            // 方法 2: 並行等待
            await Promise.all([
                page.click('#load-data-1'),
                page.click('#load-data-2')
            ]);
            
            await page.waitForSelector('.all-data-loaded');
            const result = await page.textContent('.result');
        `,
        prevention: "明確定義操作順序和等待條件"
    };
}

// ============================================
// 時序錯誤 2: Premature Assertion
// ============================================
/**
 * PrematureAssertionError 類別
 */
class PrematureAssertionError {
    // 錯誤版本
    /**
     *
     * @param {*} page - page 參數
     */
    async buggyCode(page) {
        await page.fill('#search', 'playwright');
        await page.click('#search-button');
        
        // 立即檢查結果數量（AJAX 還未返回）
        const count = await page.locator('.search-result').count();
        expect(count).toBeGreaterThan(0); // 可能失敗
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "過早進行斷言，資料還未載入完成",
        detection: "檢查網路請求是否完成",
        fix: `
            await page.fill('#search', 'playwright');
            await page.click('#search-button');
            
            // 等待 API 響應
            await page.waitForResponse(response => 
                response.url().includes('/api/search') && 
                response.status() === 200
            );
            
            // 或等待結果出現
            await page.waitForSelector('.search-result', {
                state: 'visible',
                timeout: 10000
            });
            
            const count = await page.locator('.search-result').count();
            expect(count).toBeGreaterThan(0);
        `,
        smartWait: `
            // 智能等待策略
            await page.waitForFunction(() => {
                const results = document.querySelectorAll('.search-result');
                return results.length > 0 && 
                       !document.querySelector('.loading');
            });
        `
    };
}

// ============================================
// 時序錯誤 3: Animation Interference
// ============================================
/**
 * AnimationInterferenceError 類別
 */
class AnimationInterferenceError {
    // 錯誤版本
    /**
     *
     * @param {*} page - page 參數
     */
    async buggyCode(page) {
        await page.click('#show-modal');
        // 模態框有淡入動畫，但立即嘗試點擊
        await page.click('.modal-confirm'); // 可能點擊失敗
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "動畫進行中導致元素不可交互",
        symptom: "Element is not stable",
        fix: `
            await page.click('#show-modal');
            
            // 方法 1: 等待動畫完成
            await page.waitForTimeout(500); // 簡單但不理想
            
            // 方法 2: 等待元素穩定
            await page.waitForSelector('.modal-confirm', {
                state: 'visible'
            });
            await page.locator('.modal-confirm').waitFor({
                state: 'stable'
            });
            await page.click('.modal-confirm');
        `,
        bestPractice: `
            // 方法 3: 禁用動畫（測試環境）
            await page.addStyleTag({
                content: \`
                    *, *::before, *::after {
                        animation-duration: 0s !important;
                        transition-duration: 0s !important;
                    }
                \`
            });
        `
    };
}

// ============================================
// 時序錯誤 4: Debounce/Throttle Issues
// ============================================
/**
 * DebounceThrottleError 類別
 */
class DebounceThrottleError {
    // 錯誤版本
    /**
     *
     * @param {*} page - page 參數
     */
    async buggyCode(page) {
        // 搜尋輸入有 debounce 延遲
        await page.fill('#search-input', 'test');
        
        // 立即檢查搜尋是否觸發（可能還在 debounce 期間）
        const searching = page.locator('.searching-indicator');
        await expect(searching).toBeVisible(); // 可能失敗
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "Debounce/Throttle 機制導致操作延遲",
        explanation: "輸入後需要等待 debounce 時間才會觸發搜尋",
        fix: `
            await page.fill('#search-input', 'test');
            
            // 等待 debounce 時間（假設 300ms）
            await page.waitForTimeout(350);
            
            // 或等待特定狀態改變
            await page.waitForSelector('.searching-indicator', {
                state: 'visible',
                timeout: 1000
            });
            
            const searching = await page.locator('.searching-indicator').isVisible();
            expect(searching).toBe(true);
        `,
        alternativeFix: `
            // 觸發立即搜尋（繞過 debounce）
            await page.fill('#search-input', 'test');
            await page.keyboard.press('Enter'); // 假設 Enter 會立即觸發
        `
    };
}

// ============================================
// 時序錯誤 5: Polling Interval Mismatch
// ============================================
/**
 * PollingIntervalError 類別
 */
class PollingIntervalError {
    // 錯誤版本
    /**
     *
     * @param {*} page - page 參數
     */
    async buggyCode(page) {
        // 應用程式每 5 秒輪詢一次更新
        await page.click('#start-monitoring');
        
        // 等待 3 秒後檢查（可能還沒更新）
        await page.waitForTimeout(3000);
        const status = page;
        await expect(status).toHaveText('.status', 'Updated'); // 可能失敗
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "測試的等待時間與應用輪詢間隔不匹配",
        analysis: "應用每 5 秒更新，但測試只等待 3 秒",
        fix: `
            await page.click('#start-monitoring');
            
            // 方法 1: 等待足夠的時間
            await page.waitForTimeout(5500); // 略多於輪詢間隔
            
            // 方法 2: 使用條件等待
            await page.waitForFunction(
                () => document.querySelector('.status')?.textContent === 'Updated',
                { timeout: 10000, polling: 500 }
            );
            
            const status = await page.textContent('.status');
            expect(status).toBe('Updated');
        `,
        optimization: `
            // 在測試環境中加速輪詢
            await page.evaluate(() => {
                window.POLLING_INTERVAL = 100; // 測試時使用較短間隔
            });
        `
    };
}

// ============================================
// 時序輔助工具
// ============================================
/**
 * TimingDiagnosticTools 類別
 */
class TimingDiagnosticTools {
    /**
     * 測量操作時間
     * @param {*} page - page 參數
     * @param {*} operation - operation 參數
     * @param {*} description - description 參數
     */
    static async measureTiming(page, operation, description) {
        const startTime = Date.now();
        try {
            await operation();
            const duration = Date.now() - startTime;
            return {
                success: true,
                duration,
                description,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                duration,
                description,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 智能等待策略
     * @param {*} page - page 參數
     * @param {*} conditions - conditions 參數
     */
    static async smartWait(page, conditions) {
        const waitPromises = [];

        if (conditions.selector) {
            waitPromises.push(
                page.waitForSelector(conditions.selector, {
                    state: conditions.state || 'visible',
                    timeout: conditions.timeout || 30000
                })
            );
        }

        if (conditions.response) {
            waitPromises.push(
                page.waitForResponse(conditions.response)
            );
        }

        if (conditions.loadState) {
            waitPromises.push(
                page.waitForLoadState(conditions.loadState)
            );
        }

        if (conditions.function) {
            waitPromises.push(
                page.waitForFunction(conditions.function, {
                    timeout: conditions.timeout || 30000
                })
            );
        }

        return Promise.all(waitPromises);
    }

    /**
     * 檢測潛在的時序問題
     * @param {*} page - page 參數
     * @param {*} testFn - testFn 參數
     * @param {*} iterations - iterations 參數
     */
    static async detectTimingIssues(page, testFn, iterations = 5) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = await this.measureTiming(
                page,
                testFn,
                `Iteration ${i + 1}`
            );
            results.push(result);
            
            // 重置頁面狀態
            await page.reload();
        }

        // 分析結果變異性
        const durations = results.map(r => r.duration);
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const maxDuration = Math.max(...durations);
        const minDuration = Math.min(...durations);
        const variance = maxDuration - minDuration;

        return {
            iterations,
            results,
            analysis: {
                avgDuration,
                maxDuration,
                minDuration,
                variance,
                isFlaky: variance > avgDuration * 0.5, // 變異性超過 50%
                recommendation: variance > avgDuration * 0.5 
                    ? '測試存在時序問題，建議增加明確的等待條件'
                    : '測試時序穩定'
            }
        };
    }

    /**
     * 生成 AI 分析提示
     * @param {*} issueData - issueData 參數
     */
    static generateTimingAnalysisPrompt(issueData) {
        return `
        分析以下時序問題：
        
        測試描述：${issueData.description}
        失敗率：${issueData.failureRate}%
        平均執行時間：${issueData.avgDuration}ms
        時間變異性：${issueData.variance}ms
        
        失敗時的日誌：
        ${issueData.failureLogs}
        
        網路請求序列：
        ${issueData.networkSequence}
        
        請診斷：
        1. 時序問題的根本原因
        2. 是否存在競態條件
        3. 建議的等待策略
        4. 如何提高測試穩定性
        `;
    }
}

// ============================================
// 實用等待策略集合
// ============================================
/**
 * WaitStrategies 類別
 */
class WaitStrategies {
    /**
     * 等待多個條件中的任意一個
     * @param {*} page - page 參數
     * @param {*} conditions - conditions 參數
     */
    static async waitForAny(page, conditions) {
        return Promise.race(conditions.map(condition => {
            if (typeof condition === 'string') {
                return page.waitForSelector(condition);
            }
            return condition;
        }));
    }

    /**
     * 等待元素數量變化
     * @param {*} page - page 參數
     * @param {*} selector - selector 參數
     * @param {*} initialCount - initialCount 參數
     * @param {*} options - options 參數
     */
    static async waitForCountChange(page, selector, initialCount, options = {}) {
        return page.waitForFunction(
            ({ selector, initialCount }) => {
                const elements = document.querySelectorAll(selector);
                return elements.length !== initialCount;
            },
            { selector, initialCount },
            options
        );
    }

    /**
     * 等待文本內容改變
     * @param {*} page - page 參數
     * @param {*} selector - selector 參數
     * @param {*} initialText - initialText 參數
     * @param {*} options - options 參數
     */
    static async waitForTextChange(page, selector, initialText, options = {}) {
        return page.waitForFunction(
            ({ selector, initialText }) => {
                const element = document.querySelector(selector);
                return element && element.textContent !== initialText;
            },
            { selector, initialText },
            options
        );
    }

    /**
     * 智能重試機制
     * @param {*} operation - operation 參數
     * @param {*} maxRetries - maxRetries 參數
     * @param {*} baseDelay - baseDelay 參數
     */
    static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

module.exports = {
    RaceConditionError,
    PrematureAssertionError,
    AnimationInterferenceError,
    DebounceThrottleError,
    PollingIntervalError,
    TimingDiagnosticTools,
    WaitStrategies
};