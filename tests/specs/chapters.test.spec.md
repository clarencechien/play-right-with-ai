# Individual Chapter Testing Requirements Specification

## Overview
This specification defines detailed testing requirements for each of the 8 chapters in the "Play right with AI" workshop, ensuring each chapter effectively teaches its designated concepts.

## Chapter 1: AI Conductor (心態轉變與環境設置)

### Learning Objectives Tests
```typescript
describe('Chapter 1: AI Conductor', () => {
  describe('Mindset Shift Validation', () => {
    test('should clearly explain traditional vs AI-driven development', () => {
      // Assert comparison table exists
      // Verify key differences highlighted
      // Check paradigm shift explanation clarity
    });

    test('should introduce conductor metaphor effectively', () => {
      // Assert metaphor explanation present
      // Verify role clarity (conductor vs coder)
      // Check conceptual understanding exercises
    });
  });

  describe('Environment Setup Tests', () => {
    test('should successfully install required tools', async () => {
      // Test Node.js installation validation
      // Test Playwright installation
      // Test AI CLI tools setup (Claude, Gemini)
      // Test MCP browser automation setup
    });

    test('should verify environment readiness', async () => {
      // Run diagnostic script
      // Assert all dependencies met
      // Verify tool versions compatibility
    });
  });

  describe('Exercises', () => {
    test('should complete hello world with AI', async () => {
      // Test first AI prompt execution
      // Verify response handling
      // Assert successful completion
    });
  });
});
```

## Chapter 2: First Movement (AI 應用程式生成)

### Application Generation Tests
```typescript
describe('Chapter 2: First Movement', () => {
  describe('Natural Language Requirements', () => {
    test('should convert requirements to working app', async () => {
      // Input: "建立一個待辦事項應用程式"
      // Assert: Functional TODO app generated
      // Verify: Core features implemented
    });

    test('should handle requirement variations', async () => {
      // Test different phrasings
      // Test complexity levels
      // Assert consistent quality
    });
  });

  describe('Code Quality Validation', () => {
    test('generated app should meet quality standards', () => {
      // Assert clean code structure
      // Verify best practices followed
      // Check accessibility compliance
      // Validate responsive design
    });

    test('should include proper error handling', () => {
      // Assert try-catch blocks present
      // Verify user-friendly error messages
      // Check graceful degradation
    });
  });

  describe('Multi-Model Testing', () => {
    test('should work with Claude', async () => {
      // Generate app with Claude
      // Assert functionality complete
    });

    test('should work with GPT', async () => {
      // Generate app with GPT
      // Assert functionality complete
    });

    test('should work with Gemini', async () => {
      // Generate app with Gemini
      // Assert functionality complete
    });
  });
});
```

## Chapter 3: Second Movement (AI 測試策略分析)

### Test Strategy Generation Tests
```typescript
describe('Chapter 3: Second Movement', () => {
  describe('Code Analysis Capabilities', () => {
    test('should identify all testable components', async () => {
      // Input: Generated TODO app
      // Assert: All functions identified
      // Verify: User interactions mapped
      // Check: Edge cases discovered
    });

    test('should create comprehensive test plan', async () => {
      // Assert test categories defined
      // Verify priority levels assigned
      // Check coverage metrics planned
    });
  });

  describe('Test Case Design', () => {
    test('should generate meaningful test cases', () => {
      // Assert positive test cases
      // Verify negative test cases
      // Check boundary conditions
      // Validate data-driven scenarios
    });

    test('should follow testing best practices', () => {
      // Assert GIVEN-WHEN-THEN format
      // Verify single responsibility
      // Check test independence
    });
  });

  describe('Strategic Thinking Validation', () => {
    test('should prioritize critical paths', () => {
      // Assert business-critical tests first
      // Verify risk-based prioritization
      // Check resource optimization
    });
  });
});
```

## Chapter 4: Third Movement (Playwright 腳本生成)

### Playwright Script Generation Tests
```typescript
describe('Chapter 4: Third Movement', () => {
  describe('MCP Browser Automation', () => {
    test('should successfully use MCP for browser control', async () => {
      // Test MCP connection
      // Verify browser launch
      // Assert page navigation
      // Check element interaction
    });

    test('should generate valid Playwright scripts', async () => {
      // Assert syntax correctness
      // Verify selector strategies
      // Check assertion methods
      // Validate async/await usage
    });
  });

  describe('Script Quality Tests', () => {
    test('should include proper waits and timeouts', () => {
      // Assert no hard-coded sleeps
      // Verify intelligent waits
      // Check timeout configurations
    });

    test('should handle dynamic content', () => {
      // Test AJAX handling
      // Verify SPA navigation
      // Check lazy loading support
    });
  });

  describe('Script Execution', () => {
    test('generated scripts should run successfully', async () => {
      // Execute each generated script
      // Assert no runtime errors
      // Verify expected outcomes
      // Check report generation
    });

    test('should produce meaningful test results', () => {
      // Assert clear pass/fail status
      // Verify detailed error messages
      // Check screenshot capture
      // Validate trace files
    });
  });
});
```

## Chapter 5: Fourth Movement (測試分析與調試)

### Test Analysis Tests
```typescript
describe('Chapter 5: Fourth Movement', () => {
  describe('Failure Analysis', () => {
    test('should correctly identify failure root causes', async () => {
      // Input: Failed test results
      // Assert: Accurate diagnosis
      // Verify: Root cause identified
      // Check: Fix recommendations
    });

    test('should analyze test reports effectively', () => {
      // Parse HTML reports
      // Extract failure patterns
      // Identify flaky tests
      // Suggest improvements
    });
  });

  describe('Debugging Capabilities', () => {
    test('should use trace files for debugging', async () => {
      // Load trace file
      // Navigate to failure point
      // Extract relevant information
      // Propose solutions
    });

    test('should handle various error types', () => {
      // Test element not found errors
      // Test timeout errors
      // Test assertion failures
      // Test network errors
    });
  });

  describe('Intentional Bug Introduction', () => {
    test('should detect introduced bugs', async () => {
      // Introduce known bug
      // Run detection process
      // Assert bug identified
      // Verify accurate description
    });
  });
});
```

## Chapter 6: Final Movement (自我修復循環)

### Self-Repair Loop Tests
```typescript
describe('Chapter 6: Final Movement', () => {
  describe('Bug Fixing Automation', () => {
    test('should automatically fix identified bugs', async () => {
      // Input: Bug diagnosis
      // Process: Generate fix
      // Assert: Bug resolved
      // Verify: No new bugs introduced
    });

    test('should validate fixes before applying', () => {
      // Generate fix proposal
      // Run validation tests
      // Assert fix effectiveness
      // Check side effects
    });
  });

  describe('Loop Completion', () => {
    test('should complete full self-repair cycle', async () => {
      // Bug introduction
      // Automated detection
      // Root cause analysis
      // Fix generation
      // Validation
      // Assert cycle complete
    });

    test('should handle multiple iterations', () => {
      // Test iterative refinement
      // Verify convergence
      // Check termination conditions
    });
  });

  describe('Quality Assurance', () => {
    test('should maintain code quality after repairs', () => {
      // Assert code standards maintained
      // Verify no regression
      // Check performance impact
    });
  });
});
```

## Chapter 7: Variations (進階場景)

### Advanced Scenarios Tests
```typescript
describe('Chapter 7: Variations', () => {
  describe('Complex Application Testing', () => {
    test('should handle multi-page applications', async () => {
      // Test navigation flows
      // Verify state management
      // Check data persistence
    });

    test('should test authentication flows', async () => {
      // Login scenarios
      // Session management
      // Authorization checks
      // Logout verification
    });
  });

  describe('Performance Testing', () => {
    test('should generate performance tests', () => {
      // Load time measurements
      // Resource utilization
      // Concurrent user simulation
      // Stress testing scenarios
    });
  });

  describe('API Testing Integration', () => {
    test('should combine UI and API tests', () => {
      // API endpoint validation
      // Data consistency checks
      // Error response handling
      // Integration verification
    });
  });

  describe('Prompt Optimization', () => {
    test('should demonstrate prompt engineering', () => {
      // Test prompt variations
      // Measure output quality
      // Verify optimization techniques
      // Check consistency improvements
    });
  });
});
```

## Chapter 8: Capstone Project (總整專案)

### Capstone Project Tests
```typescript
describe('Chapter 8: Capstone Project', () => {
  describe('Project Requirements', () => {
    test('should provide clear project specifications', () => {
      // Assert requirements documented
      // Verify acceptance criteria
      // Check evaluation rubric
    });

    test('should be appropriately challenging', () => {
      // Verify complexity level
      // Check skill integration needs
      // Assert achievable scope
    });
  });

  describe('Independent Execution', () => {
    test('learner should complete project autonomously', async () => {
      // No step-by-step guidance
      // Apply learned concepts
      // Demonstrate mastery
      // Create working solution
    });

    test('should demonstrate all workshop concepts', () => {
      // AI-driven development
      // Test generation
      // Failure analysis
      // Self-repair implementation
    });
  });

  describe('Assessment Criteria', () => {
    test('should evaluate technical implementation', () => {
      // Code quality metrics
      // Test coverage analysis
      // Performance benchmarks
    });

    test('should assess learning outcomes', () => {
      // Concept understanding
      // Problem-solving approach
      // AI orchestration skills
      // Documentation quality
    });
  });
});
```

## Cross-Chapter Integration Tests

### Knowledge Building Tests
```typescript
describe('Chapter Integration', () => {
  test('should build knowledge progressively', () => {
    // Track concept introduction
    // Verify prerequisite coverage
    // Assert no knowledge gaps
  });

  test('should reference previous chapters appropriately', () => {
    // Check backward references
    // Verify concept reinforcement
    // Assert consistent terminology
  });

  test('should prepare for subsequent chapters', () => {
    // Check forward compatibility
    // Verify skill scaffolding
    // Assert smooth transitions
  });
});
```

## Chapter-Specific Performance Metrics

### Completion Time Targets
```typescript
const chapterTargets = {
  'chapter-1': { min: 30, max: 60, unit: 'minutes' },
  'chapter-2': { min: 45, max: 90, unit: 'minutes' },
  'chapter-3': { min: 30, max: 60, unit: 'minutes' },
  'chapter-4': { min: 60, max: 120, unit: 'minutes' },
  'chapter-5': { min: 45, max: 90, unit: 'minutes' },
  'chapter-6': { min: 45, max: 90, unit: 'minutes' },
  'chapter-7': { min: 90, max: 180, unit: 'minutes' },
  'chapter-8': { min: 240, max: 480, unit: 'minutes' }
};
```

### Success Criteria Per Chapter
```typescript
const successCriteria = {
  'chapter-1': {
    environmentSetup: 100,
    conceptUnderstanding: 90,
    exerciseCompletion: 100
  },
  'chapter-2': {
    appGeneration: 95,
    codeQuality: 85,
    multiModelSuccess: 90
  },
  'chapter-3': {
    testPlanQuality: 90,
    coverageIdentification: 95,
    strategyAlignment: 85
  },
  'chapter-4': {
    scriptGeneration: 95,
    executionSuccess: 90,
    mcpIntegration: 100
  },
  'chapter-5': {
    failureAnalysis: 90,
    debugAccuracy: 85,
    rootCauseIdentification: 90
  },
  'chapter-6': {
    bugFixSuccess: 85,
    loopCompletion: 90,
    qualityMaintenance: 95
  },
  'chapter-7': {
    advancedScenarios: 80,
    promptOptimization: 85,
    scalability: 90
  },
  'chapter-8': {
    projectCompletion: 95,
    conceptIntegration: 90,
    autonomousExecution: 85
  }
};
```

## Test Execution Priorities

### P0 - Critical (Must Pass)
- Environment setup (Chapter 1)
- Basic app generation (Chapter 2)
- Script execution (Chapter 4)
- Self-repair loop (Chapter 6)

### P1 - High Priority
- Test strategy generation (Chapter 3)
- Failure analysis (Chapter 5)
- Multi-model support
- Cross-platform compatibility

### P2 - Medium Priority
- Advanced scenarios (Chapter 7)
- Performance optimizations
- Edge case handling
- Documentation completeness

### P3 - Nice to Have
- UI polish
- Additional examples
- Extended exercises
- Community features