/**
 * Test Suite for Chapter 3: AI as Test Strategist
 * These tests verify that learners can successfully complete Chapter 3 exercises
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.describe('Chapter 3: Test Strategy Learning Validation', () => {
  
  test('Exercise 1: Test case analysis produces comprehensive test matrix', async () => {
    const exercisePath = path.join(__dirname, '../exercises/01-test-case-analysis.md');
    const outputPath = path.join(__dirname, '../exercises/01-output.json');
    
    // Verify exercise file exists
    const exerciseExists = await fs.access(exercisePath).then(() => true).catch(() => false);
    expect(exerciseExists).toBeTruthy();
    
    // Check if learner has created output
    const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);
    if (outputExists) {
      const output = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
      
      // Validate test matrix structure
      expect(output).toHaveProperty('testCases');
      expect(output.testCases).toBeInstanceOf(Array);
      expect(output.testCases.length).toBeGreaterThan(5);
      
      // Each test case should have required fields
      output.testCases.forEach(testCase => {
        expect(testCase).toHaveProperty('id');
        expect(testCase).toHaveProperty('description');
        expect(testCase).toHaveProperty('priority');
        expect(testCase).toHaveProperty('type');
        expect(['high', 'medium', 'low']).toContain(testCase.priority);
        expect(['functional', 'edge-case', 'negative', 'performance']).toContain(testCase.type);
      });
    }
  });

  test('Exercise 2: Risk assessment identifies critical paths', async () => {
    const outputPath = path.join(__dirname, '../exercises/02-risk-assessment.json');
    
    const outputExists = await fs.access(outputPath).then(() => true).catch(() => false);
    if (outputExists) {
      const riskAnalysis = JSON.parse(await fs.readFile(outputPath, 'utf-8'));
      
      // Validate risk assessment structure
      expect(riskAnalysis).toHaveProperty('criticalPaths');
      expect(riskAnalysis).toHaveProperty('riskMatrix');
      expect(riskAnalysis).toHaveProperty('mitigationStrategies');
      
      // Critical paths should be prioritized
      expect(riskAnalysis.criticalPaths).toBeInstanceOf(Array);
      expect(riskAnalysis.criticalPaths.length).toBeGreaterThan(0);
      
      riskAnalysis.criticalPaths.forEach(path => {
        expect(path).toHaveProperty('name');
        expect(path).toHaveProperty('impact');
        expect(path).toHaveProperty('probability');
        expect(path).toHaveProperty('testPriority');
      });
    }
  });

  test('Exercise 3: Test plan follows industry standards', async () => {
    const planPath = path.join(__dirname, '../exercises/03-test-plan.md');
    
    const planExists = await fs.access(planPath).then(() => true).catch(() => false);
    if (planExists) {
      const planContent = await fs.readFile(planPath, 'utf-8');
      
      // Check for required sections
      expect(planContent).toContain('## Test Objectives');
      expect(planContent).toContain('## Test Scope');
      expect(planContent).toContain('## Test Strategy');
      expect(planContent).toContain('## Test Criteria');
      expect(planContent).toContain('## Resource Requirements');
      expect(planContent).toContain('## Schedule');
      expect(planContent).toContain('## Risk and Contingencies');
      
      // Verify bilingual approach is used
      expect(planContent).toMatch(/[A-Za-z]+.*[\u4e00-\u9fa5]+/);
    }
  });

  test('Exercise 4: Coverage strategy achieves minimum thresholds', async () => {
    const coveragePath = path.join(__dirname, '../exercises/04-coverage-strategy.json');
    
    const coverageExists = await fs.access(coveragePath).then(() => true).catch(() => false);
    if (coverageExists) {
      const coverage = JSON.parse(await fs.readFile(coveragePath, 'utf-8'));
      
      // Validate coverage metrics
      expect(coverage).toHaveProperty('functionalCoverage');
      expect(coverage).toHaveProperty('codeCoverage');
      expect(coverage).toHaveProperty('edgeCaseCoverage');
      
      // Minimum thresholds
      expect(coverage.functionalCoverage).toBeGreaterThanOrEqual(80);
      expect(coverage.codeCoverage).toBeGreaterThanOrEqual(70);
      expect(coverage.edgeCaseCoverage).toBeGreaterThanOrEqual(60);
      
      // Coverage should include test distribution
      expect(coverage).toHaveProperty('testDistribution');
      expect(coverage.testDistribution).toHaveProperty('unit');
      expect(coverage.testDistribution).toHaveProperty('integration');
      expect(coverage.testDistribution).toHaveProperty('e2e');
    }
  });

  test('Golden prompts produce consistent test strategies', async () => {
    const promptsPath = path.join(__dirname, '../../../prompts/chapter-03/');
    const testPrompt = path.join(promptsPath, 'test-strategy-prompt.md');
    
    const promptExists = await fs.access(testPrompt).then(() => true).catch(() => false);
    if (promptExists) {
      const promptContent = await fs.readFile(testPrompt, 'utf-8');
      
      // Verify prompt structure
      expect(promptContent).toContain('[Context]');
      expect(promptContent).toContain('[Requirements]');
      expect(promptContent).toContain('[Expected Output]');
      
      // Check for bilingual approach
      expect(promptContent).toMatch(/Think in English.*Output in Chinese/i);
    }
  });
});

test.describe('Chapter 3: Learning Outcomes Validation', () => {
  
  test('Learner can identify test types correctly', async () => {
    const quizPath = path.join(__dirname, '../exercises/quiz-results.json');
    
    const quizExists = await fs.access(quizPath).then(() => true).catch(() => false);
    if (quizExists) {
      const results = JSON.parse(await fs.readFile(quizPath, 'utf-8'));
      
      // Check understanding of test types
      expect(results.testTypeIdentification).toBeGreaterThanOrEqual(80);
      expect(results.prioritizationScore).toBeGreaterThanOrEqual(75);
      expect(results.coverageUnderstanding).toBeGreaterThanOrEqual(85);
    }
  });

  test('Example outputs demonstrate proper test strategy', async () => {
    const examplePath = path.join(__dirname, '../example-output/complete-test-strategy.md');
    
    const exampleExists = await fs.access(examplePath).then(() => true).catch(() => false);
    expect(exampleExists).toBeTruthy();
    
    if (exampleExists) {
      const example = await fs.readFile(examplePath, 'utf-8');
      
      // Validate comprehensive strategy
      expect(example).toContain('測試層級');
      expect(example).toContain('風險評估');
      expect(example).toContain('測試優先級');
      expect(example).toContain('覆蓋率目標');
      expect(example).toContain('資源分配');
    }
  });
});