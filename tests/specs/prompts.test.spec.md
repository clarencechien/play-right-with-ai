# Prompt Validation Criteria Specification

## Overview
This specification defines comprehensive testing criteria for validating all golden prompts used throughout the workshop, ensuring they produce consistent, high-quality outputs across different AI models.

## Prompt Categories

### 1. Foundation Prompts (基礎提示詞)

#### 1.1 Role Definition Prompts
```typescript
describe('Role Definition Prompts', () => {
  test('should establish clear AI role', () => {
    const prompt = "You are an expert software engineer...";
    // Assert role clarity score > 90%
    // Verify specific expertise mentioned
    // Check behavioral constraints defined
    // Validate output format specified
  });

  test('should set appropriate context', () => {
    // Assert domain knowledge specified
    // Verify task boundaries clear
    // Check success criteria defined
  });
});
```

#### 1.2 Task Instruction Prompts
```typescript
describe('Task Instruction Prompts', () => {
  test('should provide clear, actionable instructions', () => {
    // Assert single, focused objective
    // Verify step-by-step guidance when needed
    // Check examples provided
    // Validate expected output format
  });

  test('should handle edge cases gracefully', () => {
    // Test with minimal input
    // Test with ambiguous requirements
    // Test with conflicting constraints
    // Assert helpful clarification requests
  });
});
```

## 2. Application Generation Prompts (應用程式生成提示詞)

### 2.1 TODO App Generation
```typescript
describe('TODO App Generation Prompts', () => {
  const basePrompt = `
    Create a TODO application with the following features:
    - Add new tasks
    - Mark tasks as complete
    - Delete tasks
    - Filter tasks (all/active/completed)
    - Persist data in localStorage
  `;

  test('should generate functional TODO app', async () => {
    // Test with Claude
    const claudeResponse = await testWithClaude(basePrompt);
    assertTodoAppFunctionality(claudeResponse);
    
    // Test with GPT
    const gptResponse = await testWithGPT(basePrompt);
    assertTodoAppFunctionality(gptResponse);
    
    // Test with Gemini
    const geminiResponse = await testWithGemini(basePrompt);
    assertTodoAppFunctionality(geminiResponse);
  });

  test('should include proper HTML structure', () => {
    // Assert semantic HTML used
    // Verify accessibility attributes
    // Check responsive design
    // Validate form elements
  });

  test('should implement requested features', () => {
    // Assert CRUD operations work
    // Verify filtering logic correct
    // Check localStorage integration
    // Validate state management
  });
});
```

### 2.2 Variation Handling
```typescript
describe('Prompt Variations', () => {
  test('should handle different phrasings', async () => {
    const variations = [
      "Build a task management app",
      "Create a to-do list application",
      "Develop a task tracker",
      "Make a todo app"
    ];
    
    for (const variant of variations) {
      const result = await testPrompt(variant);
      assertCoreFeatures(result);
    }
  });

  test('should adapt to complexity levels', () => {
    // Test simple version
    // Test intermediate version
    // Test advanced version
    // Assert appropriate complexity
  });
});
```

## 3. Test Generation Prompts (測試生成提示詞)

### 3.1 Test Strategy Prompts
```typescript
describe('Test Strategy Generation', () => {
  const strategyPrompt = `
    Analyze the following code and create a comprehensive test strategy:
    [CODE]
    
    Include:
    1. Critical user paths
    2. Edge cases
    3. Error scenarios
    4. Performance considerations
  `;

  test('should identify all testable components', async () => {
    // Input sample code
    // Assert all functions identified
    // Verify UI interactions mapped
    // Check API calls covered
  });

  test('should prioritize test cases', () => {
    // Assert business-critical paths first
    // Verify risk-based ordering
    // Check coverage goals defined
  });

  test('should suggest appropriate test types', () => {
    // Unit tests for logic
    // Integration tests for APIs
    // E2E tests for workflows
    // Performance tests for bottlenecks
  });
});
```

### 3.2 Playwright Script Generation
```typescript
describe('Playwright Script Prompts', () => {
  const scriptPrompt = `
    Generate Playwright test script for:
    - Navigate to TODO app
    - Add a new task "Buy groceries"
    - Mark task as complete
    - Verify task status changed
  `;

  test('should generate valid Playwright syntax', async () => {
    const script = await generateScript(scriptPrompt);
    // Assert imports correct
    // Verify test structure valid
    // Check async/await usage
    // Validate assertions present
  });

  test('should use best practices', () => {
    // Assert data-testid selectors when possible
    // Verify no hard-coded waits
    // Check error handling included
    // Validate meaningful test names
  });

  test('should be executable', async () => {
    // Generate script
    // Save to file
    // Run with Playwright
    // Assert successful execution
  });
});
```

## 4. Analysis and Debugging Prompts (分析與調試提示詞)

### 4.1 Failure Analysis Prompts
```typescript
describe('Test Failure Analysis', () => {
  const analysisPrompt = `
    Analyze this test failure:
    [ERROR_OUTPUT]
    [SCREENSHOT]
    [TRACE_FILE]
    
    Identify:
    1. Root cause
    2. Affected components
    3. Recommended fix
  `;

  test('should accurately diagnose failures', async () => {
    // Test with element not found error
    // Test with timeout error
    // Test with assertion failure
    // Assert correct diagnosis
  });

  test('should provide actionable fixes', () => {
    // Assert specific code changes suggested
    // Verify fix addresses root cause
    // Check no side effects introduced
  });
});
```

### 4.2 Debug Information Extraction
```typescript
describe('Debug Information Prompts', () => {
  test('should extract relevant debug info', () => {
    // From stack traces
    // From console logs
    // From network calls
    // From DOM snapshots
  });

  test('should correlate multiple data sources', () => {
    // Combine error messages
    // Cross-reference timestamps
    // Map user actions to failures
  });
});
```

## 5. Self-Repair Prompts (自我修復提示詞)

### 5.1 Bug Fix Generation
```typescript
describe('Bug Fix Prompts', () => {
  const fixPrompt = `
    Given this bug:
    [BUG_DESCRIPTION]
    [FAILING_CODE]
    
    Generate a fix that:
    1. Resolves the issue
    2. Maintains existing functionality
    3. Follows current code style
  `;

  test('should generate working fixes', async () => {
    // Test with various bug types
    // Assert fix resolves issue
    // Verify no regression
    // Check code quality maintained
  });

  test('should explain fix rationale', () => {
    // Assert explanation provided
    // Verify root cause addressed
    // Check alternative solutions mentioned
  });
});
```

### 5.2 Validation Loop Prompts
```typescript
describe('Fix Validation Prompts', () => {
  test('should verify fix effectiveness', () => {
    // Re-run failing tests
    // Check all tests pass
    // Verify performance impact
    // Assert no new issues
  });
});
```

## 6. Cross-Model Compatibility Testing

### 6.1 Model Response Consistency
```typescript
describe('Cross-Model Consistency', () => {
  const testPrompts = loadGoldenPrompts();
  
  test('should produce functionally equivalent outputs', async () => {
    for (const prompt of testPrompts) {
      const claudeOutput = await testClaude(prompt);
      const gptOutput = await testGPT(prompt);
      const geminiOutput = await testGemini(prompt);
      
      assertFunctionalEquivalence([
        claudeOutput,
        gptOutput,
        geminiOutput
      ]);
    }
  });

  test('should handle model-specific adjustments', () => {
    // Test token limit handling
    // Test response format variations
    // Test capability differences
    // Assert graceful degradation
  });
});
```

### 6.2 Prompt Optimization Per Model
```typescript
describe('Model-Specific Optimizations', () => {
  test('should optimize for Claude', () => {
    // Use XML tags for structure
    // Leverage Claude's analytical strengths
    // Optimize for conversation memory
  });

  test('should optimize for GPT', () => {
    // Use clear section headers
    // Leverage code generation capabilities
    // Optimize for creative solutions
  });

  test('should optimize for Gemini', () => {
    // Use structured formatting
    // Leverage multimodal capabilities
    // Optimize for reasoning chains
  });
});
```

## 7. Prompt Quality Metrics

### 7.1 Clarity and Specificity
```typescript
interface PromptQualityMetrics {
  clarity: number;        // 0-100
  specificity: number;    // 0-100
  completeness: number;   // 0-100
  ambiguity: number;      // 0-100 (lower is better)
}

describe('Prompt Quality Assessment', () => {
  test('should meet quality thresholds', () => {
    const metrics = analyzePromptQuality(prompt);
    expect(metrics.clarity).toBeGreaterThan(85);
    expect(metrics.specificity).toBeGreaterThan(80);
    expect(metrics.completeness).toBeGreaterThan(90);
    expect(metrics.ambiguity).toBeLessThan(15);
  });
});
```

### 7.2 Output Consistency Metrics
```typescript
describe('Output Consistency', () => {
  test('should produce consistent results', async () => {
    const iterations = 10;
    const outputs = [];
    
    for (let i = 0; i < iterations; i++) {
      outputs.push(await testPrompt(prompt));
    }
    
    const consistency = calculateConsistency(outputs);
    expect(consistency).toBeGreaterThan(0.85);
  });
});
```

## 8. Prompt Evolution Testing

### 8.1 Version Control
```typescript
describe('Prompt Versioning', () => {
  test('should track prompt changes', () => {
    // Version history maintained
    // Change rationale documented
    // Performance impact measured
    // Rollback capability verified
  });

  test('should validate improvements', () => {
    // A/B test new versions
    // Measure quality improvements
    // Verify no regression
    // Document learnings
  });
});
```

### 8.2 Community Feedback Integration
```typescript
describe('Feedback Integration', () => {
  test('should incorporate user feedback', () => {
    // Collect failure cases
    // Analyze patterns
    // Update prompts
    // Validate improvements
  });
});
```

## 9. Bilingual Prompt Testing (雙語提示詞測試)

### 9.1 Traditional Chinese Prompts
```typescript
describe('Traditional Chinese Prompts', () => {
  test('should work in Traditional Chinese', async () => {
    const prompt = "建立一個待辦事項應用程式，包含新增、刪除、標記完成等功能";
    const response = await testPrompt(prompt);
    assertFunctionality(response);
  });

  test('should maintain technical accuracy', () => {
    // Verify technical terms correct
    // Check no translation errors
    // Assert cultural appropriateness
  });
});
```

### 9.2 Code Comment Language
```typescript
describe('Code Comment Language', () => {
  test('should generate appropriate comments', () => {
    // Comments in Traditional Chinese
    // Code in English
    // Clear separation maintained
    // Technical terms consistent
  });
});
```

## 10. Performance Benchmarks

### 10.1 Response Time Targets
```typescript
const responseTimeTargets = {
  simple: 2000,    // 2 seconds
  moderate: 5000,  // 5 seconds
  complex: 10000   // 10 seconds
};
```

### 10.2 Token Efficiency
```typescript
describe('Token Optimization', () => {
  test('should minimize token usage', () => {
    // Measure input tokens
    // Measure output tokens
    // Calculate efficiency ratio
    // Assert within limits
  });
});
```

## Testing Framework

### Prompt Test Runner
```typescript
class PromptTestRunner {
  async runTests(prompt: Prompt, models: AIModel[]) {
    const results = {
      functionality: [],
      consistency: [],
      performance: [],
      quality: []
    };
    
    for (const model of models) {
      results.functionality.push(
        await this.testFunctionality(prompt, model)
      );
      results.consistency.push(
        await this.testConsistency(prompt, model)
      );
      results.performance.push(
        await this.testPerformance(prompt, model)
      );
      results.quality.push(
        await this.testQuality(prompt, model)
      );
    }
    
    return this.aggregateResults(results);
  }
}
```

## Success Criteria

### Minimum Acceptance Thresholds
```typescript
const acceptanceThresholds = {
  functionalCorrectness: 0.95,  // 95% functional
  crossModelConsistency: 0.85,  // 85% consistent
  executionSuccess: 0.90,        // 90% executable
  qualityScore: 0.85,            // 85% quality
  performanceTarget: 0.90        // 90% meet targets
};
```

## Continuous Improvement

### Prompt Refinement Pipeline
1. Collect execution data
2. Identify failure patterns
3. Generate improvement hypotheses
4. A/B test variations
5. Deploy improvements
6. Monitor metrics
7. Iterate