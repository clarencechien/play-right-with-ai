/**
 * Chapter 2 Content Validation Tests
 * 測試第二章內容的完整性和正確性
 */

const fs = require('fs');
const path = require('path');

describe('Chapter 2: First Movement - Content Validation', () => {
  const chapterPath = path.join(__dirname, '..');
  const readmePath = path.join(chapterPath, 'README.md');
  const promptsPath = path.join(__dirname, '../../../prompts/chapter-02');
  const sampleAppPath = path.join(__dirname, '../../../sample-app-source/todo-app');
  
  test('README.md should exist', () => {
    expect(fs.existsSync(readmePath)).toBe(true);
  });

  test('README should contain all required sections', () => {
    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for main sections
    expect(content).toMatch(/# 第二章：第一樂章 - AI 生成應用程式/);
    expect(content).toMatch(/## 學習目標/);
    expect(content).toMatch(/## 前置需求/);
    expect(content).toMatch(/## 自然語言需求規範/);
    expect(content).toMatch(/## 提示詞工程/);
    expect(content).toMatch(/## 生成 TODO 應用程式/);
    expect(content).toMatch(/## 評估 AI 生成的程式碼/);
    expect(content).toMatch(/## 迭代優化技巧/);
    expect(content).toMatch(/## 實作練習/);
    expect(content).toMatch(/## 範例輸出/);
    expect(content).toMatch(/## 思考與挑戰/);
  });

  test('Golden prompts should exist', () => {
    expect(fs.existsSync(promptsPath)).toBe(true);
    
    const promptFiles = [
      'generate-todo-app.md',
      'refine-ui.md',
      'add-features.md',
      'bilingual-comparison.md'
    ];
    
    promptFiles.forEach(file => {
      const filePath = path.join(promptsPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('Sample TODO app should exist', () => {
    expect(fs.existsSync(sampleAppPath)).toBe(true);
    
    const appFiles = [
      'index.html',
      'styles.css',
      'script.js',
      'README.md'
    ];
    
    appFiles.forEach(file => {
      const filePath = path.join(sampleAppPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('TODO app should have required functionality', () => {
    const htmlPath = path.join(sampleAppPath, 'index.html');
    const jsPath = path.join(sampleAppPath, 'script.js');
    
    if (fs.existsSync(htmlPath) && fs.existsSync(jsPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      const jsContent = fs.readFileSync(jsPath, 'utf-8');
      
      // Check for basic TODO app elements
      expect(htmlContent).toMatch(/input.*todo/i);
      expect(htmlContent).toMatch(/button/i);
      expect(htmlContent).toMatch(/list|ul|ol/i);
      
      // Check for basic functionality in JS
      expect(jsContent).toMatch(/add.*todo/i);
      expect(jsContent).toMatch(/delete|remove/i);
      expect(jsContent).toMatch(/complete|done|toggle/i);
    }
  });

  test('Exercise files should exist', () => {
    const exercisePath = path.join(chapterPath, 'exercises');
    expect(fs.existsSync(exercisePath)).toBe(true);
    
    const exerciseFiles = [
      'exercise-01-requirements-spec.md',
      'exercise-02-generate-app.md',
      'exercise-03-bilingual-prompts.md',
      'exercise-04-iterative-refinement.md'
    ];
    
    exerciseFiles.forEach(file => {
      const filePath = path.join(exercisePath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('Start-here template should exist', () => {
    const startHerePath = path.join(chapterPath, 'start-here');
    expect(fs.existsSync(startHerePath)).toBe(true);
    
    const requirementsFile = path.join(startHerePath, 'requirements.md');
    expect(fs.existsSync(requirementsFile)).toBe(true);
  });

  test('Example output should exist', () => {
    const examplePath = path.join(chapterPath, 'example-output');
    expect(fs.existsSync(examplePath)).toBe(true);
    
    const exampleFiles = [
      'generated-app-v1',
      'generated-app-final'
    ];
    
    exampleFiles.forEach(dir => {
      const dirPath = path.join(examplePath, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  test('Prompts should demonstrate bilingual strategy', () => {
    const bilingualPath = path.join(promptsPath, 'bilingual-comparison.md');
    
    if (fs.existsSync(bilingualPath)) {
      const content = fs.readFileSync(bilingualPath, 'utf-8');
      
      // Check for comparison examples
      expect(content).toMatch(/純中文提示/);
      expect(content).toMatch(/雙語策略提示/);
      expect(content).toMatch(/English.*Chinese/i);
    }
  });
});