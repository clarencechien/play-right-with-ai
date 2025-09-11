/**
 * JavaScript 常見錯誤場景集合
 * 這些錯誤是故意設計的，用於教學目的
 */

// ============================================
// 錯誤 1: Null Reference Error
// ============================================
class NullReferenceError {
    // 錯誤版本
    async buggyCode(page) {
        const element = await page.locator('.non-existent');
        const text = element.textContent(); // 忘記 await
        console.log(text.toUpperCase()); // Cannot read property of null
    }

    // AI 診斷
    aiDiagnosis = {
        error: "TypeError: Cannot read property 'toUpperCase' of null",
        rootCause: "缺少 await 關鍵字，textContent() 返回 Promise 而非字串",
        fix: `
            const element = await page.locator('.non-existent');
            const text = await element.textContent(); // 加上 await
            if (text) { // 加上 null 檢查
                console.log(text.toUpperCase());
            }
        `,
        prevention: "使用 TypeScript 和 ESLint 規則檢查缺少的 await"
    };
}

// ============================================
// 錯誤 2: Selector Typo Error
// ============================================
class SelectorTypoError {
    // 錯誤版本
    async buggyCode(page) {
        // 選擇器拼寫錯誤
        await page.click('[data-testid="sumbit-btn"]'); // 應該是 submit-btn
    }

    // AI 診斷
    aiDiagnosis = {
        error: "TimeoutError: waiting for selector '[data-testid=\"sumbit-btn\"]'",
        rootCause: "選擇器中的 'sumbit' 應該是 'submit'",
        debugSteps: [
            "1. 檢查頁面實際 DOM 結構",
            "2. 使用 page.locator().count() 驗證選擇器",
            "3. 使用瀏覽器開發者工具確認正確選擇器"
        ],
        fix: `await page.click('[data-testid="submit-btn"]');`,
        prevention: "將選擇器定義為常數，避免重複輸入"
    };
}

// ============================================
// 錯誤 3: Array Index Out of Bounds
// ============================================
class ArrayIndexError {
    // 錯誤版本
    async buggyCode(page) {
        const items = await page.locator('.item').all();
        const lastItem = items[items.length]; // 應該是 length - 1
        await lastItem.click();
    }

    // AI 診斷
    aiDiagnosis = {
        error: "TypeError: Cannot read property 'click' of undefined",
        rootCause: "陣列索引錯誤，items[items.length] 返回 undefined",
        fix: `
            const items = await page.locator('.item').all();
            if (items.length > 0) {
                const lastItem = items[items.length - 1];
                await lastItem.click();
            }
        `,
        bestPractice: "使用 .last() 方法直接獲取最後一個元素"
    };
}

// ============================================
// 錯誤 4: Scope Error
// ============================================
class ScopeError {
    // 錯誤版本
    async buggyCode(page) {
        if (await page.locator('#special').isVisible()) {
            const data = await page.textContent('#special-data');
        }
        console.log(data); // ReferenceError: data is not defined
    }

    // AI 診斷
    aiDiagnosis = {
        error: "ReferenceError: data is not defined",
        rootCause: "變數 'data' 在 if 區塊內定義，外部無法訪問",
        fix: `
            let data = null;
            if (await page.locator('#special').isVisible()) {
                data = await page.textContent('#special-data');
            }
            if (data) {
                console.log(data);
            }
        `,
        principle: "注意 JavaScript 的區塊作用域規則"
    };
}

// ============================================
// 錯誤 5: Type Coercion Error
// ============================================
class TypeCoercionError {
    // 錯誤版本
    async buggyCode(page) {
        const count = await page.textContent('.count'); // 返回 "5"
        const total = count + 10; // "510" 而非 15
        expect(total).toBe(15); // 測試失敗
    }

    // AI 診斷
    aiDiagnosis = {
        error: "AssertionError: expected '510' to be 15",
        rootCause: "字串與數字相加導致字串連接而非數學運算",
        fix: `
            const count = await page.textContent('.count');
            const total = parseInt(count) + 10; // 轉換為數字
            expect(total).toBe(15);
        `,
        safeFix: `
            const count = await page.textContent('.count');
            const numCount = Number(count);
            if (!isNaN(numCount)) {
                const total = numCount + 10;
                expect(total).toBe(15);
            }
        `
    };
}

// ============================================
// 錯誤 6: Promise Chain Error
// ============================================
class PromiseChainError {
    // 錯誤版本
    async buggyCode(page) {
        page.goto('/page1')
            .then(() => page.click('#button'))
            .then(() => page.goto('/page2')); // 沒有等待
        
        const title = await page.title(); // 可能還在 page1
    }

    // AI 診斷
    aiDiagnosis = {
        error: "頁面狀態不確定，title 可能來自錯誤頁面",
        rootCause: "Promise 鏈沒有正確等待完成",
        fix: `
            await page.goto('/page1');
            await page.click('#button');
            await page.goto('/page2');
            const title = await page.title();
        `,
        modernApproach: "統一使用 async/await，避免混用 Promise 鏈"
    };
}

// ============================================
// 錯誤 7: Event Listener Memory Leak
// ============================================
class EventListenerLeak {
    // 錯誤版本
    async buggyCode(page) {
        // 重複添加事件監聽器
        for (let i = 0; i < 100; i++) {
            await page.evaluate(() => {
                document.addEventListener('click', () => {
                    console.log('clicked');
                });
            });
        }
    }

    // AI 診斷
    aiDiagnosis = {
        error: "記憶體洩漏：重複添加事件監聽器",
        impact: "頁面性能下降，可能導致瀏覽器崩潰",
        fix: `
            // 使用具名函數並在添加前移除
            await page.evaluate(() => {
                const handler = () => console.log('clicked');
                document.removeEventListener('click', handler);
                document.addEventListener('click', handler);
            });
        `,
        bestPractice: "使用 page.on() 方法管理 Playwright 事件"
    };
}

// ============================================
// 錯誤 8: Incorrect Comparison
// ============================================
class ComparisonError {
    // 錯誤版本
    async buggyCode(page) {
        const value = await page.inputValue('#age');
        if (value === 18) { // value 是字串 "18"
            await page.click('#adult-content');
        }
    }

    // AI 診斷
    aiDiagnosis = {
        error: "邏輯錯誤：字串 '18' !== 數字 18",
        symptom: "條件永遠不會為真",
        fix: `
            const value = await page.inputValue('#age');
            if (parseInt(value) === 18) {
                await page.click('#adult-content');
            }
        `,
        alternativeFix: `
            // 或使用寬鬆相等
            if (value == 18) { // 注意：使用 == 而非 ===
                await page.click('#adult-content');
            }
        `,
        recommendation: "明確進行類型轉換，避免隱式轉換"
    };
}

// ============================================
// 錯誤 9: Mutation During Iteration
// ============================================
class MutationError {
    // 錯誤版本
    async buggyCode(page) {
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
            await button.click();
            // 點擊可能會移除按鈕，導致後續迭代失敗
        }
    }

    // AI 診斷
    aiDiagnosis = {
        error: "Element is not attached to the DOM",
        rootCause: "在迭代過程中 DOM 被修改",
        fix: `
            // 方法 1: 反向迭代
            const buttons = await page.locator('button').all();
            for (let i = buttons.length - 1; i >= 0; i--) {
                await buttons[i].click();
            }
        `,
        alternativeFix: `
            // 方法 2: 每次重新查詢
            while (await page.locator('button').count() > 0) {
                await page.locator('button').first().click();
            }
        `
    };
}

// ============================================
// 錯誤 10: Context Loss Error
// ============================================
class ContextLossError {
    // 錯誤版本
    async buggyCode(page) {
        const frame = page.frame('iframe-name');
        await page.reload(); // 重新載入會使 frame 參考失效
        await frame.click('#button'); // frame 已失效
    }

    // AI 診斷
    aiDiagnosis = {
        error: "Execution context was destroyed",
        rootCause: "頁面重新載入後，之前的 frame 參考已失效",
        fix: `
            await page.reload();
            const frame = page.frame('iframe-name'); // 重新獲取 frame
            await frame.click('#button');
        `,
        principle: "頁面導航後需要重新獲取所有 DOM 參考"
    };
}

// ============================================
// 診斷輔助函數
// ============================================
class DiagnosticHelper {
    static async diagnoseError(error, context) {
        const diagnosis = {
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                type: error.constructor.name
            },
            context: context,
            suggestedActions: []
        };

        // 根據錯誤類型提供建議
        if (error.message.includes('TimeoutError')) {
            diagnosis.suggestedActions.push(
                '增加超時時間',
                '檢查選擇器正確性',
                '確認元素是否真的存在'
            );
        }

        if (error.message.includes('not defined')) {
            diagnosis.suggestedActions.push(
                '檢查變數作用域',
                '確認變數已初始化',
                '檢查拼寫錯誤'
            );
        }

        return diagnosis;
    }

    static generateAIPrompt(diagnosis) {
        return `
        請分析以下 JavaScript 錯誤：
        
        錯誤類型：${diagnosis.error.type}
        錯誤訊息：${diagnosis.error.message}
        
        執行上下文：
        ${JSON.stringify(diagnosis.context, null, 2)}
        
        請提供：
        1. 錯誤的根本原因
        2. 具體的修復代碼
        3. 如何避免此類錯誤
        4. 相關的最佳實踐
        `;
    }
}

module.exports = {
    NullReferenceError,
    SelectorTypoError,
    ArrayIndexError,
    ScopeError,
    TypeCoercionError,
    PromiseChainError,
    EventListenerLeak,
    ComparisonError,
    MutationError,
    ContextLossError,
    DiagnosticHelper
};