/**
 * Jest Configuration for Content Pipeline Tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/content/**/*.test.js',
    '**/tests/content/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '../../coverage/content',
  collectCoverageFrom: [
    'scripts/**/*.js',
    'scripts/processors/**/*.js',
    'scripts/validators/**/*.js',
    '!scripts/**/*.test.js',
    '!scripts/**/*.spec.js'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90
    }
  },
  
  // Module paths
  moduleDirectories: ['node_modules', 'scripts'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/fixtures/',
    '/tmp/'
  ],
  
  // Mock files
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Reporters
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Content Pipeline Test Report',
      outputPath: '../../test-reports/content/index.html',
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
  
  // Watch options
  watchPathIgnorePatterns: [
    'node_modules',
    'coverage',
    'test-reports',
    'tmp'
  ]
};