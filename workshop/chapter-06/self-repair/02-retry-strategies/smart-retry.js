/**
 * 智能重試策略
 * 實現多層次、自適應的重試機制
 */

class SmartRetryStrategy {
    constructor(options = {}) {
        this.config = {
            maxAttempts: options.maxAttempts || 3,
            baseDelay: options.baseDelay || 1000,
            maxDelay: options.maxDelay || 30000,
            backoffMultiplier: options.backoffMultiplier || 2,
            jitterFactor: options.jitterFactor || 0.1,
            timeout: options.timeout || 60000
        };

        this.retryHistory = [];
        this.successPatterns = new Map();
        this.failurePatterns = new Map();
    }

    /**
     * 執行帶智能重試的測試
     */
    async executeWithSmartRetry(testFn, context = {}) {
        const startTime = Date.now();
        const testId = this.generateTestId(testFn);
        let lastError = null;
        let healingApplied = false;

        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                // 檢查總超時
                if (Date.now() - startTime > this.config.timeout) {
                    throw new Error('Total timeout exceeded');
                }

                console.log(`\n🔄 嘗試 ${attempt}/${this.config.maxAttempts}`);

                // 應用學習到的成功模式
                if (attempt > 1) {
                    await this.applyLearnedPatterns(testId, context);
                }

                // 執行測試
                const result = await this.executeTest(testFn, context);

                // 記錄成功
                this.recordSuccess(testId, attempt, context);
                console.log(`✅ 測試成功於第 ${attempt} 次嘗試`);

                return result;

            } catch (error) {
                lastError = error;
                console.log(`❌ 嘗試 ${attempt} 失敗: ${error.message}`);

                // 記錄失敗
                this.recordFailure(testId, attempt, error, context);

                // 分析錯誤
                const analysis = await this.analyzeError(error, attempt);
                console.log(`📊 錯誤分析: ${analysis.category} - ${analysis.severity}`);

                // 決定是否繼續重試
                if (!analysis.shouldRetry || attempt === this.config.maxAttempts) {
                    console.log(`🛑 停止重試: ${analysis.reason}`);
                    throw error;
                }

                // 應用修復策略
                if (analysis.healingStrategy) {
                    console.log(`🔧 應用修復策略: ${analysis.healingStrategy}`);
                    await this.applyHealing(analysis.healingStrategy, context, error);
                    healingApplied = true;
                }

                // 計算延遲
                const delay = this.calculateDelay(attempt, analysis);
                console.log(`⏱️ 等待 ${delay}ms 後重試...`);
                await this.wait(delay);

                // 準備下次重試
                await this.prepareForRetry(context, analysis);
            }
        }

        throw lastError;
    }

    /**
     * 執行測試並收集度量
     */
    async executeTest(testFn, context) {
        const startTime = Date.now();
        
        try {
            const result = await testFn(context);
            const duration = Date.now() - startTime;
            
            // 收集性能數據
            this.collectMetrics({
                duration,
                success: true,
                context
            });
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // 收集錯誤數據
            this.collectMetrics({
                duration,
                success: false,
                error,
                context
            });
            
            throw error;
        }
    }

    /**
     * 分析錯誤並決定重試策略
     */
    async analyzeError(error, attempt) {
        const analysis = {
            category: this.categorizeError(error),
            severity: this.assessSeverity(error),
            shouldRetry: true,
            healingStrategy: null,
            reason: ''
        };

        // 根據錯誤類別決定策略
        switch (analysis.category) {
            case 'TIMEOUT':
                analysis.shouldRetry = attempt < 3;
                analysis.healingStrategy = 'INCREASE_TIMEOUT';
                analysis.reason = analysis.shouldRetry ? '超時錯誤可重試' : '超時次數過多';
                break;

            case 'NETWORK':
                analysis.shouldRetry = true;
                analysis.healingStrategy = 'WAIT_AND_RETRY';
                analysis.reason = '網路錯誤通常是暫時的';
                break;

            case 'ELEMENT_NOT_FOUND':
                analysis.shouldRetry = attempt < 2;
                analysis.healingStrategy = 'UPDATE_SELECTOR';
                analysis.reason = analysis.shouldRetry ? '嘗試更新選擇器' : '選擇器更新失敗';
                break;

            case 'STATE_ERROR':
                analysis.shouldRetry = attempt < 2;
                analysis.healingStrategy = 'RESET_STATE';
                analysis.reason = analysis.shouldRetry ? '嘗試重置狀態' : '狀態錯誤持續';
                break;

            case 'ASSERTION':
                analysis.shouldRetry = false;
                analysis.reason = '斷言失敗不應重試';
                break;

            case 'CRITICAL':
                analysis.shouldRetry = false;
                analysis.reason = '關鍵錯誤不可重試';
                break;

            default:
                analysis.shouldRetry = attempt < 2;
                analysis.reason = '未知錯誤謹慎重試';
        }

        // 使用 AI 增強分析
        if (this.isAIEnabled()) {
            const aiAnalysis = await this.aiAnalyzeError(error);
            analysis.aiSuggestion = aiAnalysis;
        }

        return analysis;
    }

    /**
     * 分類錯誤
     */
    categorizeError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('timeout')) return 'TIMEOUT';
        if (message.includes('network') || message.includes('fetch')) return 'NETWORK';
        if (message.includes('selector') || message.includes('element')) return 'ELEMENT_NOT_FOUND';
        if (message.includes('state') || message.includes('context')) return 'STATE_ERROR';
        if (message.includes('expect') || message.includes('assert')) return 'ASSERTION';
        if (message.includes('critical') || message.includes('fatal')) return 'CRITICAL';
        
        return 'UNKNOWN';
    }

    /**
     * 評估錯誤嚴重性
     */
    assessSeverity(error) {
        if (error.critical) return 'CRITICAL';
        if (error.message.includes('security')) return 'HIGH';
        if (error.message.includes('data')) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * 應用修復策略
     */
    async applyHealing(strategy, context, error) {
        switch (strategy) {
            case 'INCREASE_TIMEOUT':
                context.timeout = (context.timeout || 30000) * 1.5;
                console.log(`  ⏱️ 超時增加到 ${context.timeout}ms`);
                break;

            case 'WAIT_AND_RETRY':
                // 等待網路恢復
                await this.wait(2000);
                break;

            case 'UPDATE_SELECTOR':
                // 嘗試更新選擇器
                if (context.page) {
                    const newSelector = await this.findAlternativeSelector(
                        context.page,
                        error.selector
                    );
                    if (newSelector) {
                        context.selector = newSelector;
                        console.log(`  🔍 更新選擇器: ${newSelector}`);
                    }
                }
                break;

            case 'RESET_STATE':
                // 重置應用狀態
                if (context.page) {
                    await context.page.evaluate(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                    });
                    await context.page.reload();
                    console.log(`  🔄 狀態已重置`);
                }
                break;

            default:
                console.log(`  ⚠️ 未知修復策略: ${strategy}`);
        }
    }

    /**
     * 計算重試延遲
     */
    calculateDelay(attempt, analysis) {
        let delay = this.config.baseDelay;

        // 指數退避
        delay *= Math.pow(this.config.backoffMultiplier, attempt - 1);

        // 根據錯誤類型調整
        const categoryMultiplier = {
            'NETWORK': 2,
            'TIMEOUT': 1.5,
            'STATE_ERROR': 1,
            'ELEMENT_NOT_FOUND': 0.5
        };

        const multiplier = categoryMultiplier[analysis.category] || 1;
        delay *= multiplier;

        // 添加隨機抖動
        const jitter = delay * this.config.jitterFactor * Math.random();
        delay += jitter;

        // 確保不超過最大延遲
        return Math.min(delay, this.config.maxDelay);
    }

    /**
     * 準備下次重試
     */
    async prepareForRetry(context, analysis) {
        // 清理之前的狀態
        if (context.cleanup) {
            await context.cleanup();
        }

        // 根據分析結果調整上下文
        if (analysis.category === 'NETWORK') {
            // 可能需要重新建立連接
            context.reconnect = true;
        }

        if (analysis.category === 'STATE_ERROR') {
            // 標記需要完整重置
            context.fullReset = true;
        }
    }

    /**
     * 應用學習到的成功模式
     */
    async applyLearnedPatterns(testId, context) {
        const patterns = this.successPatterns.get(testId);
        
        if (patterns && patterns.length > 0) {
            // 應用最成功的模式
            const bestPattern = patterns[0];
            console.log(`  📚 應用學習模式: ${bestPattern.description}`);
            
            Object.assign(context, bestPattern.context);
        }
    }

    /**
     * 記錄成功
     */
    recordSuccess(testId, attempt, context) {
        this.retryHistory.push({
            testId,
            attempt,
            success: true,
            timestamp: Date.now(),
            context: { ...context }
        });

        // 學習成功模式
        if (!this.successPatterns.has(testId)) {
            this.successPatterns.set(testId, []);
        }

        this.successPatterns.get(testId).push({
            attempt,
            context: { ...context },
            description: `成功於第 ${attempt} 次嘗試`
        });

        // 保持歷史記錄大小
        if (this.retryHistory.length > 1000) {
            this.retryHistory.shift();
        }
    }

    /**
     * 記錄失敗
     */
    recordFailure(testId, attempt, error, context) {
        this.retryHistory.push({
            testId,
            attempt,
            success: false,
            error: error.message,
            timestamp: Date.now(),
            context: { ...context }
        });

        // 學習失敗模式
        const errorKey = this.categorizeError(error);
        if (!this.failurePatterns.has(errorKey)) {
            this.failurePatterns.set(errorKey, []);
        }

        this.failurePatterns.get(errorKey).push({
            testId,
            attempt,
            context: { ...context }
        });
    }

    /**
     * 收集度量數據
     */
    collectMetrics(data) {
        // 可以將數據發送到監控系統
        if (this.metricsCollector) {
            this.metricsCollector.collect(data);
        }
    }

    /**
     * 查找替代選擇器
     */
    async findAlternativeSelector(page, failedSelector) {
        // 簡單實現：嘗試不同的選擇器策略
        const alternatives = [
            failedSelector.replace('#', '[data-testid="'),
            failedSelector.replace('.', '[class*="'),
            `text="${failedSelector.replace(/[#.[\]]/g, '')}"`
        ];

        for (const alt of alternatives) {
            try {
                const count = await page.locator(alt).count();
                if (count > 0) {
                    return alt;
                }
            } catch {
                continue;
            }
        }

        return null;
    }

    /**
     * AI 錯誤分析（模擬）
     */
    async aiAnalyzeError(error) {
        // 模擬 AI 分析
        return {
            suggestion: '建議增加等待時間並使用更穩定的選擇器',
            confidence: 0.85,
            alternativeApproach: '考慮使用 data-testid 屬性'
        };
    }

    /**
     * 檢查是否啟用 AI
     */
    isAIEnabled() {
        return process.env.ENABLE_AI === 'true';
    }

    /**
     * 生成測試 ID
     */
    generateTestId(testFn) {
        return testFn.name || testFn.toString().substring(0, 50);
    }

    /**
     * 等待
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 獲取重試統計
     */
    getStatistics() {
        const stats = {
            totalAttempts: this.retryHistory.length,
            successfulTests: this.retryHistory.filter(h => h.success).length,
            failedTests: this.retryHistory.filter(h => !h.success).length,
            averageAttempts: 0,
            successRate: 0,
            commonFailures: []
        };

        // 計算平均嘗試次數
        const testGroups = {};
        this.retryHistory.forEach(h => {
            if (!testGroups[h.testId]) {
                testGroups[h.testId] = [];
            }
            testGroups[h.testId].push(h);
        });

        const attempts = Object.values(testGroups).map(group => {
            const success = group.find(h => h.success);
            return success ? success.attempt : this.config.maxAttempts;
        });

        if (attempts.length > 0) {
            stats.averageAttempts = (
                attempts.reduce((a, b) => a + b, 0) / attempts.length
            ).toFixed(2);
        }

        // 計算成功率
        if (stats.totalAttempts > 0) {
            stats.successRate = (
                (stats.successfulTests / stats.totalAttempts) * 100
            ).toFixed(2) + '%';
        }

        // 找出常見失敗
        this.failurePatterns.forEach((patterns, errorType) => {
            stats.commonFailures.push({
                type: errorType,
                count: patterns.length
            });
        });

        stats.commonFailures.sort((a, b) => b.count - a.count);

        return stats;
    }
}

/**
 * 重試策略預設集
 */
class RetryPresets {
    static get aggressive() {
        return {
            maxAttempts: 5,
            baseDelay: 500,
            maxDelay: 10000,
            backoffMultiplier: 1.5
        };
    }

    static get conservative() {
        return {
            maxAttempts: 2,
            baseDelay: 2000,
            maxDelay: 30000,
            backoffMultiplier: 3
        };
    }

    static get balanced() {
        return {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 20000,
            backoffMultiplier: 2
        };
    }

    static get fast() {
        return {
            maxAttempts: 3,
            baseDelay: 100,
            maxDelay: 5000,
            backoffMultiplier: 2
        };
    }
}

module.exports = {
    SmartRetryStrategy,
    RetryPresets
};