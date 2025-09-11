/**
 * Chapter 5 Exercise Tests
 * 測試第五章練習的完整性和正確性
 */

const fs = require('fs');
const path = require('path');

describe('Chapter 5 Exercises', () => {
  const exercisesDir = path.join(__dirname, '../exercises');
  const startHereDir = path.join(__dirname, '../start-here');
  const exampleOutputDir = path.join(__dirname, '../example-output');

  describe('Exercise Files Existence', () => {
    const requiredExercises = [
      '02-timing-debug.md',
      '03-dom-analysis.md',
      '04-api-debug.md'
    ];

    requiredExercises.forEach(file => {
      test(`應該存在練習檔案: ${file}`, () => {
        const filePath = path.join(exercisesDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Start-Here Templates', () => {
    test('應該存在 debug-template.js', () => {
      const templatePath = path.join(startHereDir, 'debug-template.js');
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    test('debug-template.js 應包含必要的除錯結構', () => {
      const templatePath = path.join(startHereDir, 'debug-template.js');
      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf-8');
        expect(content).toContain('debugAnalysis');
        expect(content).toContain('rootCause');
        expect(content).toContain('solution');
      }
    });
  });

  describe('Example Output', () => {
    test('應該存在 example-output 目錄', () => {
      expect(fs.existsSync(exampleOutputDir)).toBe(true);
    });

    const requiredExamples = [
      'timing-debug-solution.js',
      'dom-analysis-solution.js',
      'api-debug-solution.js'
    ];

    requiredExamples.forEach(file => {
      test(`應該存在範例輸出: ${file}`, () => {
        const filePath = path.join(exampleOutputDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('Exercise Content Validation', () => {
    test('02-timing-debug.md 應包含必要章節', () => {
      const filePath = path.join(exercisesDir, '02-timing-debug.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('## 學習目標');
        expect(content).toContain('## 背景說明');
        expect(content).toContain('## 實作步驟');
        expect(content).toContain('## 預期結果');
        expect(content).toContain('## 思考與挑戰');
      }
    });

    test('練習應包含實際的除錯案例', () => {
      const filePath = path.join(exercisesDir, '03-dom-analysis.md');
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).toContain('DOM');
        expect(content).toContain('選擇器');
        expect(content).toContain('元素');
      }
    });
  });
});