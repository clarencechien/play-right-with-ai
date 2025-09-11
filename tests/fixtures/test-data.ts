/**
 * 測試資料固定檔
 * 提供一致的測試資料給所有測試使用
 */

export const workshopTestData = {
  chapters: [
    {
      id: 1,
      title: 'AI Conductor：成為 AI 指揮家',
      description: '理解 AI 驅動開發的核心概念，設定環境',
      prompts: [
        '建立一個簡單的 TODO 應用程式',
        '加入本地存儲功能',
        '實作拖放排序'
      ]
    },
    {
      id: 2,
      title: 'First Movement：AI 生成應用',
      description: 'AI 根據自然語言需求生成應用程式碼',
      prompts: [
        '分析程式碼並生成測試策略',
        '識別關鍵測試點',
        '建議測試優先級'
      ]
    },
    {
      id: 3,
      title: 'Second Movement：AI 測試策略',
      description: 'AI 分析程式碼並建立測試計畫',
      prompts: [
        '為 TODO 應用撰寫 Playwright 測試',
        '建立 Page Object Model',
        '實作資料驅動測試'
      ]
    },
    {
      id: 4,
      title: 'Third Movement：Playwright 測試',
      description: '使用 Playwright MCP 撰寫測試腳本',
      prompts: [
        '使用 MCP 協議控制 Playwright',
        '實作智能定位器',
        '建立自適應測試'
      ]
    },
    {
      id: 5,
      title: 'Fourth Movement：失敗分析',
      description: 'AI 分析測試失敗並提供洞察',
      prompts: [
        '分析測試失敗原因',
        '提供修復建議',
        '識別根本原因'
      ]
    },
    {
      id: 6,
      title: 'Final Movement：自我修復',
      description: 'AI 完成自我修復循環',
      prompts: [
        '根據分析結果生成修復程式碼',
        '驗證修復效果',
        '優化程式碼品質'
      ]
    },
    {
      id: 7,
      title: 'Variations：進階變奏',
      description: '擴展到複雜場景',
      prompts: [
        '處理非同步操作',
        '實作效能測試',
        '建立視覺回歸測試'
      ]
    },
    {
      id: 8,
      title: 'Capstone Project：總整專案',
      description: '獨立完成端到端 AI 協調挑戰',
      prompts: [
        '建立完整的測試框架',
        '實作 CI/CD 整合',
        '建立測試報告系統'
      ]
    }
  ],
  
  sampleTodos: [
    { id: 1, text: '學習 Playwright', completed: false, priority: 'high' },
    { id: 2, text: '練習 AI 整合', completed: false, priority: 'medium' },
    { id: 3, text: '完成工作坊', completed: false, priority: 'high' },
    { id: 4, text: '撰寫測試案例', completed: true, priority: 'low' },
    { id: 5, text: '部署應用程式', completed: false, priority: 'medium' }
  ],
  
  testUsers: [
    {
      name: '測試學員 A',
      email: 'student-a@example.com',
      progress: 25,
      completedChapters: [1, 2]
    },
    {
      name: '測試學員 B',
      email: 'student-b@example.com',
      progress: 50,
      completedChapters: [1, 2, 3, 4]
    },
    {
      name: '測試學員 C',
      email: 'student-c@example.com',
      progress: 100,
      completedChapters: [1, 2, 3, 4, 5, 6, 7, 8]
    }
  ],
  
  mcpCommands: {
    basic: [
      { action: 'navigate', value: '/todo-app' },
      { action: 'click', target: '[data-testid="add-button"]' },
      { action: 'type', target: 'input', value: '測試項目' },
      { action: 'wait', value: '1000' },
      { action: 'assert', target: 'body', value: '測試項目' }
    ],
    
    advanced: [
      { action: 'navigate', value: '/todo-app' },
      { action: 'type', target: '[data-testid="todo-input"]', value: '複雜測試' },
      { action: 'click', target: '[data-testid="priority-high"]' },
      { action: 'click', target: '[data-testid="add-button"]' },
      { action: 'wait', value: '500' },
      { action: 'click', target: '[data-testid="toggle-complete"]' },
      { action: 'click', target: '[data-testid="filter-completed"]' },
      { action: 'assert', target: '[data-testid="todo-item"]', value: '複雜測試' },
      { action: 'screenshot', options: { fullPage: true } }
    ]
  },
  
  errorScenarios: [
    {
      name: '網路錯誤',
      trigger: 'network-error',
      expectedMessage: '網路連線失敗'
    },
    {
      name: '驗證錯誤',
      trigger: 'validation-error',
      expectedMessage: '請輸入有效的資料'
    },
    {
      name: '權限錯誤',
      trigger: 'permission-error',
      expectedMessage: '您沒有權限執行此操作'
    }
  ],
  
  performanceTargets: {
    pageLoad: 3000, // ms
    firstContentfulPaint: 1500, // ms
    timeToInteractive: 5000, // ms
    apiResponse: 1000, // ms
    searchLatency: 200 // ms
  }
};

/**
 * 生成隨機測試資料
 */
export function generateRandomTodos(count: number) {
  const actions = ['完成', '撰寫', '測試', '部署', '檢查', '更新', '修復', '優化'];
  const targets = ['程式碼', '文件', '測試', '功能', '錯誤', 'API', '介面', '效能'];
  const todos = [];
  
  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    todos.push({
      id: i + 1,
      text: `${action}${target}`,
      completed: Math.random() > 0.7,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    });
  }
  
  return todos;
}

/**
 * 生成測試提示詞
 */
export function generateTestPrompt(chapter: number): string {
  const prompts = workshopTestData.chapters[chapter - 1]?.prompts || [];
  return prompts[Math.floor(Math.random() * prompts.length)] || '預設測試提示';
}

/**
 * 模擬 API 回應
 */
export function mockApiResponse(endpoint: string, delay = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses: Record<string, any> = {
        '/api/todos': {
          success: true,
          data: workshopTestData.sampleTodos
        },
        '/api/chapters': {
          success: true,
          data: workshopTestData.chapters
        },
        '/api/user': {
          success: true,
          data: workshopTestData.testUsers[0]
        }
      };
      
      resolve(responses[endpoint] || { success: false, error: 'Not found' });
    }, delay);
  });
}

/**
 * 驗證測試結果
 */
export function validateTestResult(expected: any, actual: any): boolean {
  if (typeof expected !== typeof actual) return false;
  
  if (typeof expected === 'object') {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);
    
    if (expectedKeys.length !== actualKeys.length) return false;
    
    return expectedKeys.every(key => 
      validateTestResult(expected[key], actual[key])
    );
  }
  
  return expected === actual;
}