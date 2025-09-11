# Test Runner Configuration Specification

## Overview
This document specifies the test runner configuration for executing all workshop tests using Playwright and supporting test frameworks.

## Playwright Configuration

### Base Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.e2e.ts'
  ],
  
  // Test execution settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Parallel execution
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  
  // Retry strategy
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['line'],
    ['allure-playwright']
  ],
  
  // Shared settings
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser options
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Locale for Traditional Chinese testing
    locale: 'zh-TW',
    timezoneId: 'Asia/Taipei',
  },
  
  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

## Test Organization

### Directory Structure
```
/tests/
├── unit/                 # Unit tests
│   ├── prompts/         # Prompt validation tests
│   ├── utils/           # Utility function tests
│   └── validators/      # Validation logic tests
├── integration/         # Integration tests
│   ├── ai-models/      # AI model integration
│   ├── tools/          # Tool chain integration
│   └── memory-bank/    # Memory system tests
├── e2e/                # End-to-end tests
│   ├── workshop/       # Workshop journey tests
│   ├── chapters/       # Individual chapter tests
│   └── apps/           # Sample application tests
├── performance/        # Performance tests
│   ├── load/          # Load testing
│   ├── stress/        # Stress testing
│   └── benchmarks/    # Performance benchmarks
├── fixtures/          # Test fixtures
│   ├── prompts/       # Sample prompts
│   ├── responses/     # Mock AI responses
│   └── data/          # Test data
└── helpers/           # Test utilities
    ├── ai-mock.ts     # AI response mocking
    ├── page-utils.ts  # Page helper functions
    └── assertions.ts  # Custom assertions
```

## Test Execution Profiles

### Development Profile
```bash
# Quick feedback during development
npm run test:dev
```
```json
{
  "scripts": {
    "test:dev": "playwright test --project=chromium --workers=4 --reporter=line"
  }
}
```

### CI/CD Profile
```bash
# Comprehensive testing for CI
npm run test:ci
```
```json
{
  "scripts": {
    "test:ci": "playwright test --reporter=github --workers=2 --retries=2"
  }
}
```

### Full Regression Profile
```bash
# Complete test suite execution
npm run test:full
```
```json
{
  "scripts": {
    "test:full": "playwright test --reporter=html,json,junit"
  }
}
```

### Debug Profile
```bash
# Interactive debugging
npm run test:debug
```
```json
{
  "scripts": {
    "test:debug": "playwright test --debug --headed --workers=1"
  }
}
```

## AI Model Testing Configuration

### Model Endpoints
```typescript
export const AI_MODELS = {
  claude: {
    endpoint: process.env.CLAUDE_API_URL || 'https://api.anthropic.com',
    apiKey: process.env.CLAUDE_API_KEY,
    model: 'claude-3-opus-20240229',
    maxTokens: 4096,
    temperature: 0.7
  },
  gpt: {
    endpoint: process.env.OPENAI_API_URL || 'https://api.openai.com',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7
  },
  gemini: {
    endpoint: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com',
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro',
    maxTokens: 4096,
    temperature: 0.7
  }
};
```

### Rate Limiting Configuration
```typescript
export const RATE_LIMITS = {
  claude: {
    requestsPerMinute: 50,
    tokensPerMinute: 40000,
    retryDelay: 1000,
    maxRetries: 3
  },
  gpt: {
    requestsPerMinute: 60,
    tokensPerMinute: 90000,
    retryDelay: 1000,
    maxRetries: 3
  },
  gemini: {
    requestsPerMinute: 60,
    tokensPerMinute: 60000,
    retryDelay: 1000,
    maxRetries: 3
  }
};
```

## Test Data Management

### Environment Variables
```bash
# .env.test
BASE_URL=http://localhost:3000
TEST_TIMEOUT=30000

# AI Model Keys
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Feature Flags
ENABLE_AI_TESTS=true
ENABLE_PERFORMANCE_TESTS=false
ENABLE_SECURITY_TESTS=true

# Test Data
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPass123!
```

### Mock Data Configuration
```typescript
export const MOCK_CONFIG = {
  enableMocking: process.env.NODE_ENV === 'test',
  mockAIResponses: true,
  mockNetworkRequests: false,
  recordMode: process.env.RECORD_MODE === 'true',
  playbackMode: process.env.PLAYBACK_MODE === 'true'
};
```

## Parallel Execution Strategy

### Test Sharding
```typescript
// Shard tests across multiple machines
export const SHARD_CONFIG = {
  total: parseInt(process.env.SHARD_TOTAL || '1'),
  current: parseInt(process.env.SHARD_INDEX || '1')
};

// Run specific shard
// SHARD_TOTAL=4 SHARD_INDEX=1 npm test
```

### Worker Distribution
```typescript
export const WORKER_CONFIG = {
  development: {
    workers: '50%',        // Use 50% of available CPUs
    maxWorkers: 4
  },
  ci: {
    workers: 2,           // Fixed number for consistency
    maxWorkers: 2
  },
  local: {
    workers: undefined,   // Playwright decides
    maxWorkers: 8
  }
};
```

## Test Reporting

### HTML Report Configuration
```typescript
export const HTML_REPORT_CONFIG = {
  open: process.env.CI ? 'never' : 'on-failure',
  outputFolder: 'test-results/html',
  includeTestDetails: true,
  embedScreenshots: true,
  embedVideos: true,
  embedTraces: true
};
```

### Allure Report Configuration
```typescript
export const ALLURE_CONFIG = {
  outputFolder: 'test-results/allure',
  categories: [
    {
      name: 'Product Bugs',
      matchedStatuses: ['failed'],
      messageRegex: '.*bug.*'
    },
    {
      name: 'Test Defects',
      matchedStatuses: ['broken'],
      messageRegex: '.*test.*'
    }
  ],
  environmentInfo: {
    Browser: 'Chrome',
    'Node Version': process.version,
    Platform: process.platform
  }
};
```

## Custom Test Fixtures

### Workshop Fixtures
```typescript
import { test as base } from '@playwright/test';

type WorkshopFixtures = {
  aiClient: AIClient;
  memoryBank: MemoryBank;
  workshopPage: WorkshopPage;
};

export const test = base.extend<WorkshopFixtures>({
  aiClient: async ({}, use) => {
    const client = new AIClient();
    await client.initialize();
    await use(client);
    await client.cleanup();
  },
  
  memoryBank: async ({}, use) => {
    const bank = new MemoryBank();
    await bank.load();
    await use(bank);
    await bank.save();
  },
  
  workshopPage: async ({ page }, use) => {
    const workshopPage = new WorkshopPage(page);
    await workshopPage.navigate();
    await use(workshopPage);
  }
});
```

## Test Hooks

### Global Setup
```typescript
// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Start test services
  await startMockServer();
  await initializeDatabase();
  
  // Warm up AI models
  await warmUpAIModels();
  
  // Clear previous test results
  await clearTestResults();
  
  // Set up authentication state
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(config.projects[0].use.baseURL!);
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login"]');
  await page.context().storageState({ path: 'auth.json' });
  await browser.close();
}

export default globalSetup;
```

### Global Teardown
```typescript
// global-teardown.ts
async function globalTeardown() {
  // Stop mock server
  await stopMockServer();
  
  // Clean up test data
  await cleanupDatabase();
  
  // Generate final reports
  await generateReports();
  
  // Upload results if in CI
  if (process.env.CI) {
    await uploadResults();
  }
}

export default globalTeardown;
```

## Performance Monitoring

### Metrics Collection
```typescript
export const PERFORMANCE_METRICS = {
  collect: true,
  metrics: [
    'firstContentfulPaint',
    'largestContentfulPaint',
    'timeToInteractive',
    'totalBlockingTime',
    'cumulativeLayoutShift'
  ],
  thresholds: {
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    timeToInteractive: 3500,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1
  }
};
```

## Error Handling

### Retry Strategy
```typescript
export const RETRY_STRATEGY = {
  test: {
    retries: 2,
    delay: 1000,
    backoff: 'exponential'
  },
  api: {
    retries: 3,
    delay: 2000,
    backoff: 'linear'
  },
  network: {
    retries: 5,
    delay: 500,
    backoff: 'exponential'
  }
};
```

### Error Classification
```typescript
export const ERROR_TYPES = {
  flaky: ['TimeoutError', 'NetworkError'],
  product: ['AssertionError', 'ValidationError'],
  infrastructure: ['SetupError', 'TeardownError'],
  test: ['SyntaxError', 'TypeError']
};
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Workshop Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily regression

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests (Shard ${{ matrix.shard }}/4)
        run: npm run test:ci
        env:
          SHARD_TOTAL: 4
          SHARD_INDEX: ${{ matrix.shard }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.shard }}
          path: test-results/
          retention-days: 30
      
      - name: Publish test report
        if: always()
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./test-results/html
```

## Monitoring and Alerting

### Test Metrics Dashboard
```typescript
export const DASHBOARD_CONFIG = {
  metrics: [
    'testPassRate',
    'averageExecutionTime',
    'flakyTestRate',
    'codeCoverage',
    'aiModelSuccessRate'
  ],
  alerts: [
    {
      metric: 'testPassRate',
      threshold: 0.95,
      action: 'notify-slack'
    },
    {
      metric: 'flakyTestRate',
      threshold: 0.05,
      action: 'create-issue'
    }
  ]
};
```

## Best Practices

### Test Writing Guidelines
1. Use descriptive test names
2. One assertion per test when possible
3. Use Page Object Model for complex pages
4. Implement proper cleanup in afterEach hooks
5. Use test.fixme() for known issues
6. Tag tests appropriately (@smoke, @regression, @critical)

### Performance Optimization
1. Run tests in parallel when possible
2. Use test.describe.parallel() for independent tests
3. Minimize browser contexts creation
4. Reuse authentication state
5. Use API mocking for faster execution
6. Implement smart wait strategies

### Maintenance
1. Regular dependency updates
2. Periodic test review and refactoring
3. Monitor and address flaky tests
4. Keep test data up to date
5. Document complex test scenarios
6. Maintain test coverage above 80%