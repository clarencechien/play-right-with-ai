#!/usr/bin/env node

/**
 * Learning Objectives Validation Script
 * Validates that workshop materials meet stated learning objectives
 */

const fs = require('fs').promises;
const path = require('path');

// Define learning objectives per chapter
const learningObjectives = {
  'chapter-01': {
    name: 'AI Conductor',
    objectives: [
      { id: 'mindset', description: '理解從「編碼者」到「AI 指揮家」的思維轉變', required: true },
      { id: 'environment', description: '完成完整的開發環境設置', required: true },
      { id: 'ai-setup', description: '設置並測試 AI 服務', required: true },
      { id: 'bilingual', description: '掌握雙語提示策略', required: true },
      { id: 'first-task', description: '執行第一個 AI 驅動的開發任務', required: true }
    ]
  },
  'chapter-02': {
    name: 'First Movement - AI Application Generation',
    objectives: [
      { id: 'requirements', description: '使用自然語言精確描述應用程式需求', required: true },
      { id: 'prompt-eng', description: '掌握有效的提示詞工程技巧', required: true },
      { id: 'bilingual-impact', description: '理解雙語提示策略對程式碼品質的影響', required: true },
      { id: 'evaluate', description: '評估和優化 AI 生成的程式碼', required: true },
      { id: 'iterate', description: '運用迭代式改進流程', required: true }
    ]
  },
  'chapter-03': {
    name: 'Second Movement - AI Test Strategy',
    objectives: [
      { id: 'analyze-code', description: 'AI 分析應用程式碼結構', required: true },
      { id: 'test-plan', description: '設計完整的測試策略', required: true },
      { id: 'edge-cases', description: '識別邊界案例和潛在問題', required: true },
      { id: 'test-coverage', description: '評估測試覆蓋率需求', required: true }
    ]
  },
  'chapter-04': {
    name: 'Third Movement - Playwright Script Generation',
    objectives: [
      { id: 'mcp-usage', description: '使用 MCP 進行瀏覽器自動化', required: true },
      { id: 'generate-tests', description: 'AI 生成 Playwright 測試腳本', required: true },
      { id: 'test-quality', description: '評估測試腳本品質', required: true },
      { id: 'test-execution', description: '執行和調整測試腳本', required: true }
    ]
  },
  'chapter-05': {
    name: 'Fourth Movement - Test Analysis & Debugging',
    objectives: [
      { id: 'failure-analysis', description: '分析測試失敗原因', required: true },
      { id: 'trace-analysis', description: '解讀 Playwright trace 文件', required: true },
      { id: 'root-cause', description: '識別 bug 根本原因', required: true },
      { id: 'debug-strategy', description: '制定除錯策略', required: true }
    ]
  },
  'chapter-06': {
    name: 'Final Movement - Self-Repair',
    objectives: [
      { id: 'fix-bugs', description: 'AI 自動修復識別的 bug', required: true },
      { id: 'verify-fix', description: '驗證修復效果', required: true },
      { id: 'regression', description: '防止迴歸問題', required: true },
      { id: 'close-loop', description: '完成自循環流程', required: true }
    ]
  },
  'chapter-07': {
    name: 'Variations - Advanced Scenarios',
    objectives: [
      { id: 'complex-apps', description: '處理複雜多頁應用', required: false },
      { id: 'optimization', description: '優化提示詞策略', required: false },
      { id: 'scale', description: '擴展到大型專案', required: false },
      { id: 'integration', description: '整合多個 AI 工具', required: false }
    ]
  },
  'chapter-08': {
    name: 'Capstone Project',
    objectives: [
      { id: 'independent', description: '獨立完成端到端專案', required: true },
      { id: 'orchestrate', description: '協調 AI 工具完成複雜任務', required: true },
      { id: 'demonstrate', description: '展示 AI Conductor 技能', required: true },
      { id: 'portfolio', description: '建立作品集項目', required: false }
    ]
  }
};

// Validation results
const results = {
  chapters: {},
  summary: {
    totalObjectives: 0,
    metObjectives: 0,
    requiredObjectives: 0,
    metRequiredObjectives: 0
  }
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return '';
  }
}

async function validateChapterObjectives(chapterName, objectives) {
  const chapterPath = path.join(__dirname, 'workshop', chapterName);
  const chapterResult = {
    name: objectives.name,
    objectives: [],
    score: 0
  };

  // Read chapter README
  const readmePath = path.join(chapterPath, 'README.md');
  const readmeContent = await readFileContent(readmePath);

  // Check exercises
  const exercisesPath = path.join(chapterPath, 'exercises');
  const hasExercises = await fileExists(exercisesPath);
  let exerciseFiles = [];
  if (hasExercises) {
    try {
      exerciseFiles = await fs.readdir(exercisesPath);
    } catch {}
  }

  // Check examples
  const examplesPath = path.join(chapterPath, 'example-output');
  const hasExamples = await fileExists(examplesPath);

  // Validate each objective
  for (const objective of objectives.objectives) {
    const objectiveResult = {
      id: objective.id,
      description: objective.description,
      required: objective.required,
      met: false,
      evidence: []
    };

    results.summary.totalObjectives++;
    if (objective.required) {
      results.summary.requiredObjectives++;
    }

    // Check if objective is addressed in README
    if (readmeContent.toLowerCase().includes(objective.description.slice(0, 20).toLowerCase())) {
      objectiveResult.evidence.push('Mentioned in README');
    }

    // Check for related exercises
    const relatedExercise = exerciseFiles.find(f => f.includes(objective.id));
    if (relatedExercise) {
      objectiveResult.evidence.push(`Exercise file: ${relatedExercise}`);
    }

    // Check for specific content based on objective ID
    switch (objective.id) {
      case 'mindset':
        if (readmeContent.includes('思維轉變') || readmeContent.includes('AI 指揮家')) {
          objectiveResult.evidence.push('Mindset transformation content found');
        }
        break;
      case 'environment':
        if (readmeContent.includes('VS Code') && readmeContent.includes('Node.js')) {
          objectiveResult.evidence.push('Environment setup instructions found');
        }
        break;
      case 'bilingual':
        if (readmeContent.includes('English') && readmeContent.includes('Chinese')) {
          objectiveResult.evidence.push('Bilingual strategy explained');
        }
        break;
      case 'prompt-eng':
        if (readmeContent.includes('提示詞') || readmeContent.includes('prompt')) {
          objectiveResult.evidence.push('Prompt engineering content found');
        }
        break;
      case 'test-plan':
        if (readmeContent.includes('測試策略') || readmeContent.includes('test strategy')) {
          objectiveResult.evidence.push('Test strategy content found');
        }
        break;
    }

    // Determine if objective is met
    objectiveResult.met = objectiveResult.evidence.length > 0;
    if (objectiveResult.met) {
      results.summary.metObjectives++;
      if (objective.required) {
        results.summary.metRequiredObjectives++;
      }
    }

    chapterResult.objectives.push(objectiveResult);
  }

  // Calculate chapter score
  const metCount = chapterResult.objectives.filter(o => o.met).length;
  chapterResult.score = (metCount / objectives.objectives.length * 100).toFixed(1);

  return chapterResult;
}

async function generateReport() {
  console.log('\n' + '='.repeat(70));
  console.log('LEARNING OBJECTIVES VALIDATION REPORT');
  console.log('='.repeat(70));

  // Overall metrics
  const overallScore = (results.summary.metObjectives / results.summary.totalObjectives * 100).toFixed(1);
  const requiredScore = (results.summary.metRequiredObjectives / results.summary.requiredObjectives * 100).toFixed(1);

  console.log('\n📊 Overall Metrics:');
  console.log(`  Total Objectives: ${results.summary.totalObjectives}`);
  console.log(`  Met Objectives: ${results.summary.metObjectives} (${overallScore}%)`);
  console.log(`  Required Objectives: ${results.summary.requiredObjectives}`);
  console.log(`  Met Required: ${results.summary.metRequiredObjectives} (${requiredScore}%)`);

  // Chapter by chapter breakdown
  console.log('\n📚 Chapter Breakdown:\n');
  
  for (const [chapterName, chapterResult] of Object.entries(results.chapters)) {
    console.log(`${chapterName}: ${chapterResult.name}`);
    console.log(`  Score: ${chapterResult.score}%`);
    console.log('  Objectives:');
    
    for (const obj of chapterResult.objectives) {
      const status = obj.met ? '✅' : '❌';
      const required = obj.required ? '[REQUIRED]' : '[OPTIONAL]';
      console.log(`    ${status} ${required} ${obj.description}`);
      if (!obj.met && obj.required) {
        console.log(`       ⚠️  Missing evidence for required objective`);
      }
      if (obj.evidence.length > 0) {
        obj.evidence.forEach(e => {
          console.log(`       - ${e}`);
        });
      }
    }
    console.log();
  }

  // Critical gaps
  console.log('⚠️  Critical Gaps:\n');
  for (const [chapterName, chapterResult] of Object.entries(results.chapters)) {
    const unmetRequired = chapterResult.objectives.filter(o => o.required && !o.met);
    if (unmetRequired.length > 0) {
      console.log(`  ${chapterName}:`);
      unmetRequired.forEach(obj => {
        console.log(`    - ${obj.description}`);
      });
    }
  }

  // Recommendations
  console.log('\n📋 Recommendations:\n');
  if (requiredScore < 100) {
    console.log('  1. Priority: Address all unmet required objectives');
  }
  if (overallScore < 80) {
    console.log('  2. Add more exercises for each learning objective');
    console.log('  3. Include practical examples for complex concepts');
  }
  console.log('  4. Create assessment rubrics for each objective');
  console.log('  5. Add self-check questions at chapter end');

  // Final assessment
  console.log('\n' + '='.repeat(70));
  if (requiredScore >= 90) {
    console.log('✅ Workshop meets core learning objectives');
  } else if (requiredScore >= 70) {
    console.log('⚠️  Workshop partially meets learning objectives');
  } else {
    console.log('❌ Workshop needs significant work on learning objectives');
  }
  console.log('='.repeat(70));
}

// Main execution
async function main() {
  console.log('🎯 Validating Learning Objectives...\n');

  for (const [chapterName, objectives] of Object.entries(learningObjectives)) {
    console.log(`Validating ${chapterName}...`);
    results.chapters[chapterName] = await validateChapterObjectives(chapterName, objectives);
  }

  await generateReport();

  // Save detailed results
  const reportPath = path.join(__dirname, 'learning-objectives-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

// Run validation
main().catch(console.error);