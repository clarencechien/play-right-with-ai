/**
 * DOM 操作問題場景集合
 * 展示與 DOM 元素互動時的常見錯誤
 */

// ============================================
// DOM 錯誤 1: Stale Element Reference
// ============================================
class StaleElementError {
    // 錯誤版本
    async buggyCode(page) {
        const button = await page.locator('#dynamic-button');
        
        // 頁面更新，按鈕被重新渲染
        await page.click('#refresh-section');
        
        // 嘗試使用舊的元素參考
        await button.click(); // Element is not attached to the DOM
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "Stale element reference - 元素已從 DOM 中移除",
        cause: "DOM 更新後繼續使用舊的元素參考",
        symptoms: "Element is not attached to the DOM",
        fix: `
            // 每次使用前重新查詢元素
            await page.click('#refresh-section');
            
            // 重新獲取元素
            const button = page.locator('#dynamic-button');
            await button.click();
        `,
        bestPractice: `
            // 使用 locator 而非 element handle
            // Locator 會在每次使用時重新查詢
            const getButton = () => page.locator('#dynamic-button');
            
            await page.click('#refresh-section');
            await getButton().click(); // 自動重新查詢
        `,
        prevention: "避免儲存元素參考，使用動態查詢"
    };
}

// ============================================
// DOM 錯誤 2: Hidden Element Interaction
// ============================================
class HiddenElementError {
    // 錯誤版本
    async buggyCode(page) {
        // 元素存在但被 CSS 隱藏
        await page.click('.hidden-button'); // 無法點擊不可見元素
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "嘗試與隱藏元素互動",
        symptoms: "Element is not visible",
        diagnosis: "元素存在於 DOM 但不可見（display: none 或 visibility: hidden）",
        fix: `
            // 方法 1: 等待元素可見
            await page.waitForSelector('.hidden-button', {
                state: 'visible'
            });
            await page.click('.hidden-button');
        `,
        forceFix: `
            // 方法 2: 強制點擊（不推薦用於真實測試）
            await page.locator('.hidden-button').click({
                force: true
            });
        `,
        properFix: `
            // 方法 3: 觸發顯示元素的操作
            await page.click('#show-button'); // 先顯示按鈕
            await page.click('.hidden-button');
        `,
        debugTip: `
            // 檢查元素可見性
            const isVisible = await page.locator('.hidden-button').isVisible();
            const isHidden = await page.locator('.hidden-button').isHidden();
            console.log('Visible:', isVisible, 'Hidden:', isHidden);
        `
    };
}

// ============================================
// DOM 錯誤 3: Dynamic Content Loading
// ============================================
class DynamicContentError {
    // 錯誤版本
    async buggyCode(page) {
        await page.click('#load-more');
        
        // 新內容還在載入中
        const items = await page.locator('.item').all();
        expect(items.length).toBe(20); // 可能只有 10 個
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "動態內容尚未完全載入",
        cause: "沒有等待 AJAX 內容載入完成",
        fix: `
            const initialCount = await page.locator('.item').count();
            await page.click('#load-more');
            
            // 等待項目數量增加
            await page.waitForFunction(
                ({ selector, initialCount }) => {
                    return document.querySelectorAll(selector).length > initialCount;
                },
                { selector: '.item', initialCount }
            );
            
            const items = await page.locator('.item').all();
            expect(items.length).toBe(20);
        `,
        alternativeFix: `
            // 等待特定數量的元素
            await page.click('#load-more');
            await page.waitForSelector('.item:nth-child(20)');
            
            const items = await page.locator('.item').all();
            expect(items.length).toBe(20);
        `
    };
}

// ============================================
// DOM 錯誤 4: Shadow DOM Access
// ============================================
class ShadowDOMError {
    // 錯誤版本
    async buggyCode(page) {
        // 嘗試直接訪問 Shadow DOM 內的元素
        await page.click('#shadow-host button'); // 找不到元素
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "無法訪問 Shadow DOM 內的元素",
        explanation: "Shadow DOM 封裝了內部結構，需要特殊方法訪問",
        fix: `
            // 方法 1: 使用 evaluate 訪問 Shadow DOM
            await page.evaluate(() => {
                const host = document.querySelector('#shadow-host');
                const shadowRoot = host.shadowRoot;
                const button = shadowRoot.querySelector('button');
                button.click();
            });
        `,
        playwrightFix: `
            // 方法 2: Playwright 支援穿透 Shadow DOM
            await page.locator('#shadow-host').locator('button').click();
        `,
        debugShadowDOM: `
            // 檢查 Shadow DOM 結構
            const shadowContent = await page.evaluate(() => {
                const host = document.querySelector('#shadow-host');
                return host.shadowRoot ? host.shadowRoot.innerHTML : null;
            });
            console.log('Shadow DOM content:', shadowContent);
        `
    };
}

// ============================================
// DOM 錯誤 5: Overlapping Elements
// ============================================
class OverlappingElementError {
    // 錯誤版本
    async buggyCode(page) {
        // 有其他元素覆蓋在目標元素上
        await page.click('#covered-button'); // 點擊被阻擋
    }

    // AI 診斷
    aiDiagnosis = {
        issue: "元素被其他元素覆蓋",
        symptoms: "Element is not clickable at point",
        causes: [
            "彈出視窗覆蓋",
            "固定定位元素遮擋",
            "z-index 層級問題"
        ],
        fix: `
            // 方法 1: 關閉覆蓋元素
            const overlayVisible = await page.locator('.overlay').isVisible();
            if (overlayVisible) {
                await page.click('.overlay-close');
            }
            await page.click('#covered-button');
        `,
        scrollFix: `
            // 方法 2: 滾動到元素
            await page.locator('#covered-button').scrollIntoViewIfNeeded();
            await page.click('#covered-button');
        `,
        forceFix: `
            // 方法 3: 使用 JavaScript 點擊
            await page.locator('#covered-button').evaluate(el => el.click());
        `,
        debugOverlap: `
            // 檢查元素位置和大小
            const rect = await page.locator('#covered-button').boundingBox();
            console.log('Element position:', rect);
            
            // 檢查該位置的元素
            const elementAtPoint = await page.evaluate(({ x, y }) => {
                const el = document.elementFromPoint(x, y);
                return el ? el.outerHTML : null;
            }, { x: rect.x + rect.width/2, y: rect.y + rect.height/2 });
            console.log('Element at click point:', elementAtPoint);
        `
    };
}

// ============================================
// DOM 操作輔助工具
// ============================================
class DOMDiagnosticTools {
    /**
     * 檢查元素狀態
     */
    static async checkElementState(page, selector) {
        const diagnostics = {
            selector,
            exists: false,
            visible: false,
            enabled: false,
            editable: false,
            clickable: false,
            count: 0,
            properties: {}
        };

        try {
            const locator = page.locator(selector);
            diagnostics.count = await locator.count();
            
            if (diagnostics.count > 0) {
                diagnostics.exists = true;
                diagnostics.visible = await locator.first().isVisible();
                diagnostics.enabled = await locator.first().isEnabled();
                diagnostics.editable = await locator.first().isEditable();
                
                // 獲取元素屬性
                diagnostics.properties = await locator.first().evaluate(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id,
                    innerText: el.innerText?.substring(0, 50),
                    href: el.href,
                    src: el.src,
                    style: {
                        display: getComputedStyle(el).display,
                        visibility: getComputedStyle(el).visibility,
                        position: getComputedStyle(el).position,
                        zIndex: getComputedStyle(el).zIndex
                    },
                    rect: el.getBoundingClientRect()
                }));
                
                // 檢查是否可點擊
                diagnostics.clickable = diagnostics.visible && 
                                       diagnostics.enabled && 
                                       diagnostics.properties.rect.width > 0 &&
                                       diagnostics.properties.rect.height > 0;
            }
        } catch (error) {
            diagnostics.error = error.message;
        }

        return diagnostics;
    }

    /**
     * 等待 DOM 穩定
     */
    static async waitForDOMStable(page, options = {}) {
        const timeout = options.timeout || 5000;
        const checkInterval = options.checkInterval || 500;
        const selector = options.selector || 'body';
        
        let previousHTML = '';
        let stableCount = 0;
        const requiredStableChecks = 2;
        
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const currentHTML = await page.locator(selector).innerHTML();
            
            if (currentHTML === previousHTML) {
                stableCount++;
                if (stableCount >= requiredStableChecks) {
                    return true;
                }
            } else {
                stableCount = 0;
            }
            
            previousHTML = currentHTML;
            await page.waitForTimeout(checkInterval);
        }
        
        throw new Error('DOM did not stabilize within timeout');
    }

    /**
     * 查找可互動元素
     */
    static async findInteractableElements(page, baseSelector) {
        return page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            const interactable = [];
            
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                
                const isInteractable = 
                    rect.width > 0 &&
                    rect.height > 0 &&
                    style.display !== 'none' &&
                    style.visibility !== 'hidden' &&
                    style.opacity !== '0' &&
                    !el.disabled;
                
                if (isInteractable) {
                    interactable.push({
                        index: Array.from(elements).indexOf(el),
                        selector: `${selector}:nth-of-type(${Array.from(elements).indexOf(el) + 1})`,
                        text: el.textContent?.trim().substring(0, 30),
                        attributes: {
                            id: el.id,
                            class: el.className,
                            'data-testid': el.getAttribute('data-testid')
                        }
                    });
                }
            });
            
            return interactable;
        }, baseSelector);
    }

    /**
     * 生成元素診斷報告
     */
    static async generateElementReport(page, selector) {
        const state = await this.checkElementState(page, selector);
        
        return `
元素診斷報告
============
選擇器: ${selector}
存在: ${state.exists ? '✓' : '✗'}
可見: ${state.visible ? '✓' : '✗'}
啟用: ${state.enabled ? '✓' : '✗'}
可編輯: ${state.editable ? '✓' : '✗'}
可點擊: ${state.clickable ? '✓' : '✗'}
數量: ${state.count}

元素屬性:
${JSON.stringify(state.properties, null, 2)}

診斷建議:
${this.generateSuggestions(state)}
        `;
    }

    static generateSuggestions(state) {
        const suggestions = [];
        
        if (!state.exists) {
            suggestions.push('- 元素不存在，檢查選擇器是否正確');
            suggestions.push('- 確認頁面已完全載入');
            suggestions.push('- 檢查元素是否在 iframe 或 Shadow DOM 中');
        }
        
        if (state.exists && !state.visible) {
            suggestions.push('- 元素存在但不可見');
            suggestions.push('- 檢查 CSS display, visibility, opacity 屬性');
            suggestions.push('- 確認元素不在視窗外');
            suggestions.push('- 可能需要滾動到元素位置');
        }
        
        if (state.visible && !state.enabled) {
            suggestions.push('- 元素可見但被禁用');
            suggestions.push('- 檢查 disabled 屬性');
            suggestions.push('- 確認表單驗證狀態');
        }
        
        if (state.count > 1) {
            suggestions.push(`- 找到 ${state.count} 個匹配元素`);
            suggestions.push('- 考慮使用更具體的選擇器');
            suggestions.push('- 或使用 .first(), .last(), .nth() 方法');
        }
        
        return suggestions.join('\n');
    }
}

module.exports = {
    StaleElementError,
    HiddenElementError,
    DynamicContentError,
    ShadowDOMError,
    OverlappingElementError,
    DOMDiagnosticTools
};