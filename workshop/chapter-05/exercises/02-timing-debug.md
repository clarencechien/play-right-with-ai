# 練習 2：非同步與時序問題除錯

## 學習目標
- 掌握 JavaScript 非同步操作的除錯技巧
- 學習識別和解決時序相關的測試失敗
- 運用 AI 分析 Promise、async/await 和事件循環問題
- 實作智能等待策略和重試機制

## 背景說明

在現代 Web 應用中，非同步操作無處不在。從 API 呼叫到動畫效果，從延遲載入到即時更新，這些非同步行為經常導致測試的不穩定性。本練習將教你如何：

1. **識別時序問題的症狀**
   - 間歇性失敗的測試
   - "Element not found" 錯誤
   - 狀態不一致的問題

2. **使用 AI 進行根本原因分析**
   - 分析執行時間軸
   - 識別競態條件
   - 定位非同步瓶頸

## 實作步驟

### 步驟 1：分析失敗的測試案例

```javascript
// 失敗的測試案例
test('應該正確處理非同步資料載入', async ({ page }) => {
  await page.goto('http://localhost:3000/async-demo');
  
  // 點擊載入按鈕
  await page.click('#load-data');
  
  // 立即檢查結果 - 這裡會失敗！
  const result = await page.textContent('.result');
  expect(result).toBe('資料載入完成');
});
```

### 步驟 2：使用 AI 分析問題

向 AI 提供以下提示詞：

```markdown
我有一個 Playwright 測試在處理非同步資料載入時失敗。錯誤訊息顯示：
"Expected: '資料載入完成', Received: '載入中...'"

測試程式碼：
[貼上上面的測試程式碼]

請幫我：
1. 分析為什麼測試會失敗
2. 解釋時序問題的根本原因
3. 提供修復方案
4. 建議預防類似問題的最佳實踐

Think through the async timing issues step by step, then provide solution in Traditional Chinese.
```

### 步驟 3：實作智能等待策略

基於 AI 的分析，實作以下改進：

```javascript
// 改進版本 1：使用 waitForSelector
test('改進版：等待元素狀態變化', async ({ page }) => {
  await page.goto('http://localhost:3000/async-demo');
  await page.click('#load-data');
  
  // 等待結果元素包含特定文字
  await page.waitForSelector('.result:has-text("資料載入完成")', {
    timeout: 10000
  });
  
  const result = await page.textContent('.result');
  expect(result).toBe('資料載入完成');
});

// 改進版本 2：使用 waitForResponse
test('進階版：等待 API 回應', async ({ page }) => {
  await page.goto('http://localhost:3000/async-demo');
  
  // 同時等待 API 回應和點擊動作
  const [response] = await Promise.all([
    page.waitForResponse('**/api/data'),
    page.click('#load-data')
  ]);
  
  // 確認 API 回應成功
  expect(response.status()).toBe(200);
  
  // 等待 UI 更新
  await page.waitForSelector('.result:has-text("資料載入完成")');
});
```

### 步驟 4：處理複雜的時序情境

```javascript
// 處理多個非同步操作
test('複雜情境：多重非同步操作', async ({ page }) => {
  await page.goto('http://localhost:3000/complex-async');
  
  // 使用 AI 建議的策略處理複雜時序
  await page.click('#start-process');
  
  // 等待多個條件
  await Promise.all([
    page.waitForSelector('.step-1-complete', { state: 'visible' }),
    page.waitForSelector('.step-2-complete', { state: 'visible' }),
    page.waitForSelector('.step-3-complete', { state: 'visible' })
  ]);
  
  // 驗證最終狀態
  const finalStatus = await page.textContent('.final-status');
  expect(finalStatus).toBe('所有步驟完成');
});
```

## 預期結果

完成本練習後，你應該能夠：

1. **準確識別時序問題**
   - 區分真正的 bug 和時序問題
   - 理解非同步操作的執行順序
   - 預測可能的競態條件

2. **實作穩定的等待策略**
   - 選擇合適的等待方法
   - 設定合理的超時時間
   - 處理動態內容載入

3. **使用 AI 輔助除錯**
   - 提供清晰的問題描述
   - 獲得針對性的解決方案
   - 學習最佳實踐模式

## 思考與挑戰

### 進階挑戰 1：自訂等待函數
創建一個可重用的等待函數，處理複雜的條件：

```javascript
async function waitForCondition(page, condition, options = {}) {
  // 實作你的解決方案
}
```

### 進階挑戰 2：智能重試機制
設計一個重試策略，自動處理暫時性的時序問題：

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  // 實作指數退避重試
}
```

### 進階挑戰 3：效能優化
如何在確保穩定性的同時，最小化等待時間？考慮：
- 並行等待 vs 序列等待
- 動態超時調整
- 預測性等待策略

## 實用提示

1. **使用 Playwright 的內建等待機制**
   - `waitForLoadState()` - 等待頁面載入狀態
   - `waitForFunction()` - 等待自訂條件
   - `waitForTimeout()` - 僅在必要時使用固定延遲

2. **除錯工具**
   - 使用 `--debug` 模式逐步執行
   - 啟用 `--headed` 觀察實際行為
   - 記錄時間戳記追蹤執行順序

3. **AI 協作技巧**
   - 提供完整的錯誤堆疊
   - 包含相關的應用程式碼
   - 說明預期行為與實際行為的差異

## 相關資源

- [Playwright 等待機制文檔](https://playwright.dev/docs/actionability)
- [JavaScript 事件循環解析](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/EventLoop)
- [非同步程式設計最佳實踐](https://javascript.info/async)

---

💡 **提示**：時序問題是自動化測試中最常見的挑戰之一。掌握這些技能將大幅提升你的測試穩定性和可維護性。