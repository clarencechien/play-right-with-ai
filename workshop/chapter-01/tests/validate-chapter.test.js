/**
 * Chapter 1 Content Validation Tests
 * 測試第一章內容的完整性和正確性
 */

const fs = require('fs');
const path = require('path');

describe('Chapter 1: AI Conductor - Content Validation', () => {
  const chapterPath = path.join(__dirname, '..');
  const readmePath = path.join(chapterPath, 'README.md');
  
  test('README.md should exist', () => {
    expect(fs.existsSync(readmePath)).toBe(true);
  });

  test('README should contain all required sections', () => {
    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for main sections
    expect(content).toMatch(/# 第一章：AI 指揮家/);
    expect(content).toMatch(/## 學習目標/);
    expect(content).toMatch(/## 環境設置/);
    expect(content).toMatch(/### VS Code 安裝與設定/);
    expect(content).toMatch(/### Node.js 與 npm/);
    expect(content).toMatch(/### Playwright 安裝/);
    expect(content).toMatch(/### AI 服務設置/);
    expect(content).toMatch(/## 心態轉變：從編碼者到指揮家/);
    expect(content).toMatch(/## 雙語提示策略/);
    expect(content).toMatch(/## 實作練習/);
    expect(content).toMatch(/## 思考與挑戰/);
  });

  test('Exercise files should exist', () => {
    const exercisePath = path.join(chapterPath, 'exercises');
    expect(fs.existsSync(exercisePath)).toBe(true);
    
    const exerciseFiles = [
      'exercise-01-environment-check.md',
      'exercise-02-first-ai-prompt.md',
      'exercise-03-bilingual-practice.md'
    ];
    
    exerciseFiles.forEach(file => {
      const filePath = path.join(exercisePath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  test('Start-here template should exist', () => {
    const startHerePath = path.join(chapterPath, 'start-here');
    expect(fs.existsSync(startHerePath)).toBe(true);
    
    const envCheckScript = path.join(startHerePath, 'check-environment.js');
    expect(fs.existsSync(envCheckScript)).toBe(true);
  });

  test('Example output should exist', () => {
    const examplePath = path.join(chapterPath, 'example-output');
    expect(fs.existsSync(examplePath)).toBe(true);
    
    const successLog = path.join(examplePath, 'environment-check-success.txt');
    expect(fs.existsSync(successLog)).toBe(true);
  });

  test('README should use Traditional Chinese consistently', () => {
    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Should not contain Simplified Chinese characters
    expect(content).not.toMatch(/环境/); // Should be 環境
    expect(content).not.toMatch(/设置/); // Should be 設置
    expect(content).not.toMatch(/学习/); // Should be 學習
    expect(content).not.toMatch(/应用/); // Should be 應用
  });

  test('README should include bilingual prompt examples', () => {
    const content = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for bilingual strategy examples
    expect(content).toMatch(/Think in English/i);
    expect(content).toMatch(/Output in Chinese/i);
    expect(content).toMatch(/\[English Planning\]/);
    expect(content).toMatch(/\[Chinese Delivery\]/);
  });
});