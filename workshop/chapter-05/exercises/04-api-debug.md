# 練習 4：API 整合失敗分析

## 學習目標
- 掌握 API 相關測試失敗的除錯技巧
- 學習網路請求的攔截和分析方法
- 使用 AI 診斷 API 整合問題
- 實作 Mock 和 Stub 策略確保測試穩定性

## 背景說明

現代 Web 應用高度依賴 API 進行資料交換。API 的不穩定性、變更或錯誤都可能導致測試失敗。本練習將教你如何：

1. **診斷 API 問題**
   - 請求/回應分析
   - 狀態碼和錯誤處理
   - 時序和競態條件

2. **使用 AI 進行 API 除錯**
   - 分析網路日誌
   - 識別 API 合約問題
   - 生成測試隔離策略

## 實作步驟

### 步驟 1：捕獲和分析 API 失敗

```javascript
// 基本的 API 測試（可能失敗）
test('測試使用者登入流程', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');
  
  // 這裡可能因為 API 問題而失敗
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.welcome')).toContainText('歡迎回來');
});
```

### 步驟 2：使用 Playwright 的網路功能除錯

```javascript
// 增強版：監控網路請求
test('監控 API 請求和回應', async ({ page }) => {
  // 設定請求監聽器
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  await page.goto('http://localhost:3000/login');
  
  // 執行登入
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  
  // 等待特定 API 回應
  const [response] = await Promise.all([
    page.waitForResponse(resp => 
      resp.url().includes('/api/auth/login') && 
      resp.status() === 200
    ),
    page.click('[type="submit"]')
  ]);
  
  // 分析 API 回應
  const responseBody = await response.json();
  console.log('API 回應：', responseBody);
  
  // 輸出所有 API 互動記錄
  console.log('API 請求記錄：', requests);
  console.log('API 回應記錄：', responses);
});
```

### 步驟 3：使用 AI 分析 API 問題

向 AI 提供以下提示詞：

```markdown
我的 Playwright 測試在 API 整合時失敗。以下是網路日誌：

請求：
POST /api/auth/login
Headers: { "Content-Type": "application/json" }
Body: { "email": "test@example.com", "password": "password123" }

回應：
Status: 401 Unauthorized
Body: { "error": "Invalid credentials" }

測試程式碼：
[貼上測試程式碼]

請幫我：
1. 分析 API 失敗的根本原因
2. 提供除錯策略
3. 建議如何使測試更穩定
4. 生成 Mock API 的範例程式碼

Analyze the API integration issue and provide debugging strategies in Traditional Chinese.
```

### 步驟 4：實作 API Mock 和攔截

```javascript
// 策略 1：完全 Mock API 回應
test('使用 Mock API 確保測試穩定', async ({ page }) => {
  // 攔截並模擬 API 回應
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token',
        user: {
          id: 1,
          name: '測試使用者',
          email: 'test@example.com'
        }
      })
    });
  });
  
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'any-password');
  await page.click('[type="submit"]');
  
  // 測試應該成功，因為 API 被 Mock 了
  await expect(page).toHaveURL('/dashboard');
});

// 策略 2：條件式 Mock（混合模式）
test('智能 API Mock 策略', async ({ page }) => {
  // 只在真實 API 失敗時使用 Mock
  await page.route('**/api/**', async (route, request) => {
    try {
      // 嘗試真實請求
      const response = await route.fetch();
      
      if (response.status() >= 500) {
        // 伺服器錯誤時使用 Mock
        console.log(`API 錯誤 ${response.status()}，使用 Mock 資料`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(getMockData(request.url()))
        });
      } else {
        // 使用真實回應
        await route.continue();
      }
    } catch (error) {
      // 網路錯誤時使用 Mock
      console.log('網路錯誤，使用 Mock 資料');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(getMockData(request.url()))
      });
    }
  });
  
  // 執行測試...
});

// Mock 資料生成器
function getMockData(url) {
  const mockResponses = {
    '/api/auth/login': {
      token: 'mock-token',
      user: { id: 1, name: '測試使用者' }
    },
    '/api/users/profile': {
      id: 1,
      name: '測試使用者',
      email: 'test@example.com',
      avatar: '/default-avatar.png'
    },
    '/api/products': [
      { id: 1, name: '產品 A', price: 100 },
      { id: 2, name: '產品 B', price: 200 }
    ]
  };
  
  const endpoint = Object.keys(mockResponses)
    .find(key => url.includes(key));
  
  return mockResponses[endpoint] || { message: 'Mock response' };
}
```

### 步驟 5：進階 API 除錯技巧

```javascript
// HAR 檔案記錄和重播
test('使用 HAR 檔案除錯', async ({ page, context }) => {
  // 記錄所有網路活動到 HAR 檔案
  await context.routeFromHAR('./network-logs.har', {
    url: '**/api/**',
    update: true // 更新 HAR 檔案
  });
  
  await page.goto('http://localhost:3000');
  // 執行測試步驟...
  
  // HAR 檔案可以用於：
  // 1. 離線重播測試
  // 2. 分享網路問題給團隊
  // 3. 效能分析
});

// API 效能監控
test('監控 API 效能', async ({ page }) => {
  const apiMetrics = [];
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const timing = response.timing();
      apiMetrics.push({
        url: response.url(),
        status: response.status(),
        duration: timing.responseEnd - timing.requestStart,
        size: (await response.body()).length
      });
    }
  });
  
  await page.goto('http://localhost:3000');
  // 執行測試...
  
  // 分析 API 效能
  const slowAPIs = apiMetrics.filter(m => m.duration > 1000);
  if (slowAPIs.length > 0) {
    console.warn('發現緩慢的 API：', slowAPIs);
  }
});

// 錯誤注入測試
test('測試錯誤處理', async ({ page }) => {
  // 模擬各種 API 錯誤情境
  const errorScenarios = [
    { status: 400, message: '請求參數錯誤' },
    { status: 401, message: '未授權' },
    { status: 404, message: '資源不存在' },
    { status: 500, message: '伺服器內部錯誤' },
    { status: 503, message: '服務暫時不可用' }
  ];
  
  for (const scenario of errorScenarios) {
    await page.route('**/api/test', route => {
      route.fulfill({
        status: scenario.status,
        contentType: 'application/json',
        body: JSON.stringify({ error: scenario.message })
      });
    });
    
    await page.goto('http://localhost:3000/error-test');
    await page.click('#trigger-api-call');
    
    // 驗證錯誤處理
    const errorMessage = await page.textContent('.error-message');
    expect(errorMessage).toContain(scenario.message);
  }
});
```

## 預期結果

完成本練習後，你應該能夠：

1. **全面監控 API 互動**
   - 捕獲請求和回應詳情
   - 記錄網路時序資訊
   - 生成除錯報告

2. **實作穩定的測試策略**
   - 使用 Mock 隔離外部依賴
   - 實作智能 fallback 機制
   - 處理各種錯誤情境

3. **運用 AI 加速除錯**
   - 分析複雜的 API 問題
   - 生成測試隔離方案
   - 優化 API 測試策略

## 思考與挑戰

### 進階挑戰 1：智能 Mock 服務
創建一個智能 Mock 服務，根據測試需求動態生成回應：

```javascript
class SmartMockService {
  async generateResponse(request) {
    // 根據請求內容智能生成回應
    // 使用 AI 分析請求模式
    // 返回合理的測試資料
  }
}
```

### 進階挑戰 2：API 合約測試
實作 API 合約驗證，確保前後端一致性：

```javascript
async function validateAPIContract(response, schema) {
  // 驗證回應符合預定義的 schema
  // 檢測合約破壞性變更
  // 生成合約差異報告
}
```

### 進階挑戰 3：混沌工程測試
設計混沌測試，主動注入故障：

```javascript
class ChaosAPITester {
  async injectChaos(page, config) {
    // 隨機延遲回應
    // 隨機返回錯誤
    // 模擬網路中斷
    // 測試系統韌性
  }
}
```

## 實用提示

1. **API Mock 最佳實踐**
   - 保持 Mock 資料與真實資料結構一致
   - 定期更新 Mock 資料
   - 為不同測試場景準備不同的 Mock 集

2. **除錯工具推薦**
   - Chrome DevTools Network 面板
   - Postman/Insomnia API 測試
   - Playwright Trace Viewer

3. **團隊協作**
   - 與後端團隊共享 API 問題日誌
   - 建立 API 變更通知機制
   - 維護 API 文檔同步

## 相關資源

- [Playwright 網路功能](https://playwright.dev/docs/network)
- [API 測試最佳實踐](https://testautomationu.applitools.com/exploring-service-apis-through-test-automation/)
- [Mock Service Worker](https://mswjs.io/)

---

💡 **提示**：API 整合是端到端測試的關鍵環節。掌握 Mock 和除錯技巧，能讓你的測試既穩定又有價值。記住：好的測試應該測試業務邏輯，而不是外部服務的可用性。