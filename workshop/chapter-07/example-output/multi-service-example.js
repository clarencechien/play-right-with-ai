// 多服務整合測試完整實作範例
// Multi-Service Integration Testing Complete Implementation

const { test, expect } = require('@playwright/test');
const axios = require('axios');
const { Pool } = require('pg');
const Redis = require('ioredis');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

test.describe('多服務整合測試套件', () => {
  // 服務連接配置
  const config = {
    frontend: 'http://localhost:3000',
    api: 'http://localhost:3001',
    authService: 'http://localhost:3002',
    paymentService: 'http://localhost:3003',
    notificationService: 'http://localhost:3004',
    postgres: {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      user: 'testuser',
      password: 'testpass'
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    rabbitmq: {
      url: 'amqp://localhost:5672'
    },
    mongodb: {
      url: 'mongodb://localhost:27017',
      database: 'testdb'
    }
  };

  let pgPool;
  let redisClient;
  let rabbitConnection;
  let rabbitChannel;
  let mongoClient;
  let mongodb;

  test.beforeAll(async () => {
    // 初始化資料庫連接
    pgPool = new Pool(config.postgres);
    redisClient = new Redis(config.redis);
    
    // 初始化 RabbitMQ
    rabbitConnection = await amqp.connect(config.rabbitmq.url);
    rabbitChannel = await rabbitConnection.createChannel();
    
    // 初始化 MongoDB
    mongoClient = new MongoClient(config.mongodb.url);
    await mongoClient.connect();
    mongodb = mongoClient.db(config.mongodb.database);
    
    console.log('所有服務連接已建立');
  });

  test.afterAll(async () => {
    // 清理連接
    await pgPool?.end();
    await redisClient?.quit();
    await rabbitChannel?.close();
    await rabbitConnection?.close();
    await mongoClient?.close();
    
    console.log('所有服務連接已關閉');
  });

  test('端到端購物流程測試', async ({ page, request }) => {
    const testData = {
      user: {
        email: `test_${Date.now()}@example.com`,
        password: 'Test123!',
        name: 'Test User'
      },
      product: {
        id: 'PROD-001',
        name: '測試商品',
        price: 999.99
      }
    };

    // Step 1: 用戶註冊（前端 + 認證服務）
    console.log('Step 1: 用戶註冊');
    await page.goto(`${config.frontend}/register`);
    
    await page.fill('[name="email"]', testData.user.email);
    await page.fill('[name="password"]', testData.user.password);
    await page.fill('[name="name"]', testData.user.name);
    await page.click('[type="submit"]');
    
    // 驗證認證服務回應
    const authResponse = await request.post(`${config.authService}/api/register`, {
      data: testData.user
    });
    expect(authResponse.status()).toBe(201);
    
    const { userId, token } = await authResponse.json();
    expect(userId).toBeTruthy();
    expect(token).toBeTruthy();
    
    // 驗證資料庫中的用戶記錄
    const userResult = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [testData.user.email]
    );
    expect(userResult.rows).toHaveLength(1);
    expect(userResult.rows[0].email).toBe(testData.user.email);
    
    // Step 2: 用戶登入並獲取會話
    console.log('Step 2: 用戶登入');
    await page.goto(`${config.frontend}/login`);
    
    await page.fill('[name="email"]', testData.user.email);
    await page.fill('[name="password"]', testData.user.password);
    await page.click('[type="submit"]');
    
    // 驗證會話存儲在 Redis
    const sessionKey = `session:${userId}`;
    const sessionData = await redisClient.get(sessionKey);
    expect(sessionData).toBeTruthy();
    
    const session = JSON.parse(sessionData);
    expect(session.userId).toBe(userId);
    expect(session.token).toBe(token);
    
    // Step 3: 瀏覽商品（前端 + API 服務）
    console.log('Step 3: 瀏覽商品');
    await page.goto(`${config.frontend}/products`);
    
    // API 應該返回商品列表
    const productsResponse = await request.get(`${config.api}/api/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(productsResponse.status()).toBe(200);
    
    const products = await productsResponse.json();
    expect(products.length).toBeGreaterThan(0);
    
    // 驗證商品資料來自 MongoDB
    const productDoc = await mongodb.collection('products').findOne({
      productId: testData.product.id
    });
    expect(productDoc).toBeTruthy();
    expect(productDoc.name).toBe(testData.product.name);
    
    // Step 4: 添加商品到購物車
    console.log('Step 4: 添加到購物車');
    await page.click(`[data-product-id="${testData.product.id}"] .add-to-cart`);
    
    // 驗證購物車更新（存儲在 Redis）
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);
    expect(cartData).toBeTruthy();
    
    const cart = JSON.parse(cartData);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe(testData.product.id);
    
    // Step 5: 結帳流程（支付服務整合）
    console.log('Step 5: 結帳流程');
    await page.goto(`${config.frontend}/checkout`);
    
    // 填寫支付資訊
    await page.fill('[name="cardNumber"]', '4111111111111111');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvv"]', '123');
    await page.click('[type="submit"]');
    
    // 驗證支付服務處理
    const paymentResponse = await request.post(`${config.paymentService}/api/process`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        userId,
        amount: testData.product.price,
        currency: 'TWD'
      }
    });
    expect(paymentResponse.status()).toBe(200);
    
    const payment = await paymentResponse.json();
    expect(payment.status).toBe('success');
    expect(payment.transactionId).toBeTruthy();
    
    // Step 6: 訂單創建（寫入多個資料庫）
    console.log('Step 6: 訂單創建');
    
    // PostgreSQL - 訂單主記錄
    const orderResult = await pgPool.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, testData.product.price, 'paid']
    );
    const order = orderResult.rows[0];
    expect(order.order_id).toBeTruthy();
    
    // MongoDB - 訂單詳情
    const orderDetails = {
      orderId: order.order_id,
      userId,
      items: cart.items,
      payment: {
        transactionId: payment.transactionId,
        amount: testData.product.price,
        status: 'completed'
      },
      createdAt: new Date()
    };
    
    const mongoResult = await mongodb.collection('order_details').insertOne(orderDetails);
    expect(mongoResult.acknowledged).toBe(true);
    
    // Step 7: 發送通知（消息隊列）
    console.log('Step 7: 發送通知');
    
    // 發送訂單確認消息到 RabbitMQ
    const notificationMessage = {
      type: 'order_confirmation',
      userId,
      orderId: order.order_id,
      email: testData.user.email,
      orderDetails
    };
    
    await rabbitChannel.assertQueue('notifications');
    await rabbitChannel.sendToQueue(
      'notifications',
      Buffer.from(JSON.stringify(notificationMessage))
    );
    
    // 驗證通知服務處理消息
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待處理
    
    const notificationStatus = await request.get(
      `${config.notificationService}/api/status/${order.order_id}`
    );
    expect(notificationStatus.status()).toBe(200);
    
    const notification = await notificationStatus.json();
    expect(notification.sent).toBe(true);
    expect(notification.type).toBe('email');
    
    // Step 8: 驗證前端顯示
    console.log('Step 8: 驗證前端顯示');
    
    // 等待頁面跳轉到訂單確認頁
    await page.waitForURL('**/order-confirmation/**');
    
    // 驗證訂單資訊顯示
    await expect(page.locator('[data-testid="order-number"]')).toContainText(order.order_id.toString());
    await expect(page.locator('[data-testid="order-total"]')).toContainText(testData.product.price.toString());
    await expect(page.locator('[data-testid="order-status"]')).toContainText('已支付');
    
    // 清理購物車
    await redisClient.del(cartKey);
    const clearedCart = await redisClient.get(cartKey);
    expect(clearedCart).toBeNull();
    
    console.log('✅ 端到端購物流程測試完成');
  });

  test('微服務間通訊測試', async ({ request }) => {
    const testUserId = 'TEST-USER-001';
    
    // 測試服務發現
    console.log('測試服務發現...');
    const services = ['auth', 'api', 'payment', 'notification'];
    
    for (const service of services) {
      const healthResponse = await request.get(`${config[service + 'Service']}/health`);
      expect(healthResponse.status()).toBe(200);
      
      const health = await healthResponse.json();
      expect(health.status).toBe('healthy');
    }
    
    // 測試服務間認證
    console.log('測試服務間認證...');
    
    // 認證服務生成 token
    const authResponse = await request.post(`${config.authService}/api/service-token`, {
      data: {
        service: 'api',
        secret: process.env.SERVICE_SECRET
      }
    });
    
    const { serviceToken } = await authResponse.json();
    expect(serviceToken).toBeTruthy();
    
    // API 服務驗證 token
    const apiResponse = await request.get(`${config.api}/api/protected`, {
      headers: {
        'X-Service-Token': serviceToken
      }
    });
    expect(apiResponse.status()).toBe(200);
    
    // 測試服務間資料同步
    console.log('測試資料同步...');
    
    // 在認證服務更新用戶資料
    await request.put(`${config.authService}/api/users/${testUserId}`, {
      headers: {
        'X-Service-Token': serviceToken
      },
      data: {
        name: 'Updated Name',
        updatedAt: new Date().toISOString()
      }
    });
    
    // 發送同步消息
    const syncMessage = {
      event: 'user.updated',
      userId: testUserId,
      timestamp: Date.now()
    };
    
    await rabbitChannel.assertExchange('sync', 'fanout');
    await rabbitChannel.publish('sync', '', Buffer.from(JSON.stringify(syncMessage)));
    
    // 等待同步完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 驗證 API 服務已同步資料
    const userResponse = await request.get(`${config.api}/api/users/${testUserId}`, {
      headers: {
        'X-Service-Token': serviceToken
      }
    });
    
    const user = await userResponse.json();
    expect(user.name).toBe('Updated Name');
    
    console.log('✅ 微服務間通訊測試完成');
  });

  test('資料一致性測試', async ({ page, request }) => {
    const testOrderId = `ORDER-${Date.now()}`;
    
    console.log('測試分散式事務...');
    
    // 開始事務
    const pgClient = await pgPool.connect();
    
    try {
      await pgClient.query('BEGIN');
      
      // Step 1: 在 PostgreSQL 創建訂單
      await pgClient.query(
        'INSERT INTO orders (order_id, status) VALUES ($1, $2)',
        [testOrderId, 'pending']
      );
      
      // Step 2: 在 MongoDB 創建訂單詳情
      const mongoSession = mongoClient.startSession();
      await mongoSession.startTransaction();
      
      await mongodb.collection('order_details').insertOne(
        {
          orderId: testOrderId,
          items: [{ productId: 'PROD-001', quantity: 1 }]
        },
        { session: mongoSession }
      );
      
      // Step 3: 更新 Redis 快取
      await redisClient.set(`order:${testOrderId}`, JSON.stringify({
        orderId: testOrderId,
        status: 'pending',
        cached: true
      }));
      
      // 模擬部分失敗場景
      const shouldFail = Math.random() > 0.5;
      
      if (shouldFail) {
        throw new Error('Simulated failure');
      }
      
      // 提交所有事務
      await pgClient.query('COMMIT');
      await mongoSession.commitTransaction();
      
      console.log('事務成功提交');
      
      // 驗證資料一致性
      const pgResult = await pgPool.query('SELECT * FROM orders WHERE order_id = $1', [testOrderId]);
      const mongoResult = await mongodb.collection('order_details').findOne({ orderId: testOrderId });
      const redisResult = await redisClient.get(`order:${testOrderId}`);
      
      expect(pgResult.rows).toHaveLength(1);
      expect(mongoResult).toBeTruthy();
      expect(redisResult).toBeTruthy();
      
    } catch (error) {
      // 回滾所有事務
      console.log('事務失敗，執行回滾...');
      
      await pgClient.query('ROLLBACK');
      await mongoSession.abortTransaction();
      await redisClient.del(`order:${testOrderId}`);
      
      // 驗證資料已回滾
      const pgResult = await pgPool.query('SELECT * FROM orders WHERE order_id = $1', [testOrderId]);
      const mongoResult = await mongodb.collection('order_details').findOne({ orderId: testOrderId });
      const redisResult = await redisClient.get(`order:${testOrderId}`);
      
      expect(pgResult.rows).toHaveLength(0);
      expect(mongoResult).toBeNull();
      expect(redisResult).toBeNull();
      
      console.log('回滾成功，資料一致性維持');
      
    } finally {
      pgClient.release();
      await mongoSession.endSession();
    }
    
    // 測試最終一致性
    console.log('測試最終一致性...');
    
    // 創建訂單（主資料庫）
    const masterOrder = {
      orderId: `MASTER-${Date.now()}`,
      status: 'created',
      timestamp: Date.now()
    };
    
    await pgPool.query(
      'INSERT INTO orders (order_id, status) VALUES ($1, $2)',
      [masterOrder.orderId, masterOrder.status]
    );
    
    // 發送複製消息
    await rabbitChannel.assertQueue('replication');
    await rabbitChannel.sendToQueue(
      'replication',
      Buffer.from(JSON.stringify(masterOrder))
    );
    
    // 等待複製完成（模擬延遲）
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 驗證從資料庫已同步
    const replicaResult = await mongodb.collection('orders_replica').findOne({
      orderId: masterOrder.orderId
    });
    
    expect(replicaResult).toBeTruthy();
    expect(replicaResult.status).toBe(masterOrder.status);
    
    console.log('✅ 資料一致性測試完成');
  });

  test('快取策略測試', async ({ page, request }) => {
    const testKey = `cache-test-${Date.now()}`;
    const testData = { value: 'test-data', timestamp: Date.now() };
    
    console.log('測試快取寫入策略...');
    
    // Write-through 策略
    // 同時寫入快取和資料庫
    await Promise.all([
      redisClient.set(testKey, JSON.stringify(testData), 'EX', 3600),
      pgPool.query(
        'INSERT INTO cache_data (key, value) VALUES ($1, $2)',
        [testKey, JSON.stringify(testData)]
      )
    ]);
    
    // 驗證快取和資料庫都有資料
    const cacheResult = await redisClient.get(testKey);
    const dbResult = await pgPool.query('SELECT * FROM cache_data WHERE key = $1', [testKey]);
    
    expect(cacheResult).toBeTruthy();
    expect(dbResult.rows).toHaveLength(1);
    expect(JSON.parse(cacheResult)).toEqual(testData);
    expect(JSON.parse(dbResult.rows[0].value)).toEqual(testData);
    
    console.log('測試快取失效策略...');
    
    // 測試 TTL
    const ttlKey = `ttl-test-${Date.now()}`;
    await redisClient.set(ttlKey, 'temp-data', 'EX', 2);
    
    // 立即檢查
    let ttlResult = await redisClient.get(ttlKey);
    expect(ttlResult).toBe('temp-data');
    
    // 等待過期
    await new Promise(resolve => setTimeout(resolve, 2100));
    ttlResult = await redisClient.get(ttlKey);
    expect(ttlResult).toBeNull();
    
    console.log('測試快取穿透防護...');
    
    // 布隆過濾器模擬
    const bloomKey = 'bloom:products';
    const existingProducts = ['PROD-001', 'PROD-002', 'PROD-003'];
    
    // 添加到布隆過濾器
    for (const product of existingProducts) {
      await redisClient.setbit(bloomKey, hashCode(product) % 1000, 1);
    }
    
    // 測試存在的產品
    const exists = await redisClient.getbit(bloomKey, hashCode('PROD-001') % 1000);
    expect(exists).toBe(1);
    
    // 測試不存在的產品（避免查詢資料庫）
    const notExists = await redisClient.getbit(bloomKey, hashCode('PROD-999') % 1000);
    if (notExists === 0) {
      console.log('產品不存在，避免資料庫查詢');
    }
    
    console.log('測試快取雪崩防護...');
    
    // 使用隨機過期時間避免同時失效
    const baseExpiry = 3600;
    const keys = [];
    
    for (let i = 0; i < 10; i++) {
      const key = `avalanche-test-${i}`;
      const randomExpiry = baseExpiry + Math.floor(Math.random() * 600);
      
      await redisClient.set(key, `data-${i}`, 'EX', randomExpiry);
      keys.push(key);
    }
    
    // 檢查過期時間分散
    const ttls = await Promise.all(
      keys.map(key => redisClient.ttl(key))
    );
    
    const uniqueTtls = new Set(ttls);
    expect(uniqueTtls.size).toBeGreaterThan(5); // 確保過期時間有足夠分散
    
    console.log('✅ 快取策略測試完成');
  });

  test('服務降級和熔斷測試', async ({ page, request }) => {
    console.log('測試熔斷器...');
    
    // 模擬服務熔斷器
    /**
     *
     */
    class CircuitBreaker {
      /**
       *
       * @param {*} threshold - threshold 參數
       * @param {*} timeout - timeout 參數
       */
      constructor(threshold = 5, timeout = 60000) {
        this.failureCount = 0;
        this.threshold = threshold;
        this.timeout = timeout;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.nextAttempt = Date.now();
      }
      
      /**
       *
       * @param {*} fn - fn 參數
       */
      async call(fn) {
        if (this.state === 'OPEN') {
          if (Date.now() < this.nextAttempt) {
            throw new Error('Circuit breaker is OPEN');
          }
          this.state = 'HALF_OPEN';
        }
        
        try {
          const result = await fn();
          this.onSuccess();
          return result;
        } catch (error) {
          this.onFailure();
          throw error;
        }
      }
      
      /**
     * onSuccess 方法
     */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
          this.state = 'CLOSED';
        }
      }
      
      /**
     * onFailure 方法
     */
    onFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
          this.state = 'OPEN';
          this.nextAttempt = Date.now() + this.timeout;
          console.log(`熔斷器開啟，將在 ${this.timeout}ms 後重試`);
        }
      }
    }
    
    const paymentBreaker = new CircuitBreaker(3, 5000);
    
    // 模擬服務失敗
    let attemptCount = 0;
    const unreliableService = async () => {
      attemptCount++;
      if (attemptCount <= 4) {
        throw new Error('Service unavailable');
      }
      return { status: 'success' };
    };
    
    // 測試熔斷器行為
    const results = [];
    
    for (let i = 0; i < 10; i++) {
      try {
        const result = await paymentBreaker.call(unreliableService);
        results.push({ attempt: i + 1, status: 'success', result });
      } catch (error) {
        results.push({ attempt: i + 1, status: 'failed', error: error.message });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 驗證熔斷器行為
    const failures = results.filter(r => r.status === 'failed');
    const circuitOpenErrors = failures.filter(f => f.error === 'Circuit breaker is OPEN');
    
    expect(failures.length).toBeGreaterThan(0);
    expect(circuitOpenErrors.length).toBeGreaterThan(0);
    
    console.log('熔斷器測試結果:', results);
    
    console.log('測試服務降級...');
    
    // 降級策略
    const getProductWithFallback = async (productId) => {
      try {
        // 嘗試從主服務獲取
        const response = await request.get(`${config.api}/api/products/${productId}`);
        if (response.status() !== 200) {
          throw new Error('Primary service failed');
        }
        return await response.json();
      } catch (error) {
        console.log('主服務失敗，使用降級策略');
        
        // 降級策略 1: 從快取獲取
        const cached = await redisClient.get(`product:${productId}`);
        if (cached) {
          console.log('使用快取資料');
          return JSON.parse(cached);
        }
        
        // 降級策略 2: 返回預設值
        console.log('返回預設值');
        return {
          id: productId,
          name: '商品暫時無法載入',
          price: 0,
          available: false,
          degraded: true
        };
      }
    };
    
    // 測試降級
    const product = await getProductWithFallback('PROD-999');
    expect(product).toBeTruthy();
    if (product.degraded) {
      console.log('服務已降級，返回預設資料');
    }
    
    console.log('✅ 服務降級和熔斷測試完成');
  });

  test('分散式追蹤測試', async ({ page, request }) => {
    console.log('測試分散式追蹤...');
    
    // 生成追蹤 ID
    const traceId = generateTraceId();
    const spanId = generateSpanId();
    
    // 追蹤請求流程
    const trace = {
      traceId,
      spans: []
    };
    
    // Step 1: 前端請求
    const frontendSpan = {
      spanId: generateSpanId(),
      parentSpanId: null,
      service: 'frontend',
      operation: 'checkout',
      startTime: Date.now(),
      tags: { userId: 'USER-001' }
    };
    
    trace.spans.push(frontendSpan);
    
    // Step 2: API 網關
    const apiSpan = {
      spanId: generateSpanId(),
      parentSpanId: frontendSpan.spanId,
      service: 'api-gateway',
      operation: 'route_request',
      startTime: Date.now()
    };
    
    trace.spans.push(apiSpan);
    
    // Step 3: 認證服務
    const authResponse = await request.post(`${config.authService}/api/validate`, {
      headers: {
        'X-Trace-Id': traceId,
        'X-Parent-Span-Id': apiSpan.spanId
      },
      data: { token: 'test-token' }
    });
    
    const authSpan = {
      spanId: generateSpanId(),
      parentSpanId: apiSpan.spanId,
      service: 'auth-service',
      operation: 'validate_token',
      startTime: Date.now(),
      duration: 50
    };
    
    trace.spans.push(authSpan);
    
    // Step 4: 支付服務
    const paymentSpan = {
      spanId: generateSpanId(),
      parentSpanId: apiSpan.spanId,
      service: 'payment-service',
      operation: 'process_payment',
      startTime: Date.now(),
      duration: 200,
      tags: { amount: 999.99, currency: 'TWD' }
    };
    
    trace.spans.push(paymentSpan);
    
    // Step 5: 通知服務
    const notificationSpan = {
      spanId: generateSpanId(),
      parentSpanId: apiSpan.spanId,
      service: 'notification-service',
      operation: 'send_email',
      startTime: Date.now(),
      duration: 100,
      tags: { type: 'order_confirmation' }
    };
    
    trace.spans.push(notificationSpan);
    
    // 計算總時間
    frontendSpan.endTime = Date.now();
    frontendSpan.duration = frontendSpan.endTime - frontendSpan.startTime;
    
    apiSpan.endTime = Date.now();
    apiSpan.duration = apiSpan.endTime - apiSpan.startTime;
    
    // 分析追蹤資料
    console.log(`追蹤 ID: ${traceId}`);
    console.log(`總 Spans: ${trace.spans.length}`);
    console.log(`總耗時: ${frontendSpan.duration}ms`);
    
    // 找出最慢的操作
    const slowestSpan = trace.spans.reduce((prev, current) => 
      (current.duration > prev.duration) ? current : prev
    );
    
    console.log(`最慢操作: ${slowestSpan.service}/${slowestSpan.operation} (${slowestSpan.duration}ms)`);
    
    // 生成追蹤圖
    console.log('\n追蹤流程圖:');
    trace.spans.forEach(span => {
      const indent = span.parentSpanId ? '  ' : '';
      console.log(`${indent}${span.service}/${span.operation} [${span.duration || 0}ms]`);
    });
    
    // 存儲追蹤資料
    await mongodb.collection('traces').insertOne(trace);
    
    console.log('✅ 分散式追蹤測試完成');
  });
});

// 輔助函數
/**
 *
 */
function generateTraceId() {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 *
 */
function generateSpanId() {
  return Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 *
 * @param {*} str - str 參數
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}