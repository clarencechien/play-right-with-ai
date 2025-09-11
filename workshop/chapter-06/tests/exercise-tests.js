/**
 * Chapter 6 Exercise Tests
 * 測試第六章練習的完整性和正確性
 */

const fs = require('fs');
const path = require('path');

describe('Chapter 6 Exercises', () => {
  const exercisesDir = path.join(__dirname, '../exercises');
  const startHereDir = path.join(__dirname, '../start-here');
  const exampleOutputDir = path.join(__dirname, '../example-output');

  describe('Exercise Files Existence', () => {
    const requiredExercises = [
      '02-retry-patterns.md',
      '03-selector-healing.md',
      '04-ci-integration.md'
    ];

    requiredExercises.forEach(file => {
      test(`應該存在練習檔案: ${file}`, () => {
        const filePath = path.join(exercisesDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Start-Here Templates', () => {
    test('應該存在 self-repair-template.js', () => {
      const templatePath = path.join(startHereDir, 'self-repair-template.js');
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    test('self-repair-template.js 應包含自我修復結構', () => {
      const templatePath = path.join(startHereDir, 'self-repair-template.js');
      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf-8');
        expect(content).toContain('SelfRepairSystem');
        expect(content).toContain('autoFix');
        expect(content).toContain('validate');
      }
    });
  });

  describe('Example Output', () => {
    test('應該存在 example-output 目錄', () => {
      expect(fs.existsSync(exampleOutputDir)).toBe(true);
    });

    const requiredExamples = [
      'retry-patterns-solution.js',
      'selector-healing-solution.js',
      'ci-integration-solution.yml'
    ];

    requiredExamples.forEach(file => {
      test(`應該存在範例輸出: ${file}`, () => {
        const filePath = path.join(exampleOutputDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Exercise Content Validation', () => {
    test('02-retry-patterns.md 應包含重試策略', () => {
      const filePath = path.join(exercisesDir, '02-retry-patterns.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('重試');
        expect(content).toContain('指數退避');
        expect(content).toContain('最大重試次數');
      }
    });

    test('03-selector-healing.md 應包含自動修復概念', () => {
      const filePath = path.join(exercisesDir, '03-selector-healing.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('選擇器');
        expect(content).toContain('自動修復');
        expect(content).toContain('fallback');
      }
    });

    test('04-ci-integration.md 應包含 CI/CD 整合', () => {
      const filePath = path.join(exercisesDir, '04-ci-integration.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('CI/CD');
        expect(content).toContain('GitHub Actions');
        expect(content).toContain('自動化');
      }
    });
  });
});