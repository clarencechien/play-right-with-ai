#!/usr/bin/env node

/**
 * Workshop Validation Script
 * Comprehensive validation of the "Play right with AI" workshop
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Validation results
const results = {
  chapters: [],
  sampleApps: [],
  prompts: [],
  tests: [],
  documentation: [],
  errors: [],
  warnings: [],
  metrics: {
    totalChapters: 0,
    completedChapters: 0,
    totalTests: 0,
    passedTests: 0,
    totalPrompts: 0,
    validPrompts: 0,
    totalApps: 0,
    workingApps: 0
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 *
 * @param {*} message - message 參數
 * @param {*} color - color 參數
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 *
 * @param {*} filePath - filePath 參數
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 *
 */
async function validateChapterStructure() {
  log('\n=== Validating Chapter Structure ===', 'cyan');
  
  const workshopDir = path.join(__dirname, 'workshop');
  const expectedChapters = [
    'chapter-01', 'chapter-02', 'chapter-03', 'chapter-04',
    'chapter-05', 'chapter-06', 'chapter-07', 'chapter-08'
  ];
  
  for (const chapter of expectedChapters) {
    const chapterPath = path.join(workshopDir, chapter);
    const chapterResult = {
      name: chapter,
      exists: false,
      hasReadme: false,
      hasExercises: false,
      hasExamples: false,
      hasStartHere: false,
      issues: []
    };
    
    results.metrics.totalChapters++;
    
    if (await fileExists(chapterPath)) {
      chapterResult.exists = true;
      
      // Check for README.md
      if (await fileExists(path.join(chapterPath, 'README.md'))) {
        chapterResult.hasReadme = true;
        
        // Validate README content
        const readmeContent = await fs.readFile(path.join(chapterPath, 'README.md'), 'utf-8');
        if (!readmeContent.includes('學習目標')) {
          chapterResult.issues.push('README missing learning objectives');
        }
        if (!readmeContent.includes('前置需求')) {
          chapterResult.issues.push('README missing prerequisites');
        }
      } else {
        chapterResult.issues.push('Missing README.md');
      }
      
      // Check for exercises directory
      if (await fileExists(path.join(chapterPath, 'exercises'))) {
        chapterResult.hasExercises = true;
      } else {
        chapterResult.issues.push('Missing exercises directory');
      }
      
      // Check for example-output directory
      if (await fileExists(path.join(chapterPath, 'example-output'))) {
        chapterResult.hasExamples = true;
      } else {
        chapterResult.issues.push('Missing example-output directory');
      }
      
      // Check for start-here directory
      if (await fileExists(path.join(chapterPath, 'start-here'))) {
        chapterResult.hasStartHere = true;
      } else {
        chapterResult.issues.push('Missing start-here directory');
      }
      
      if (chapterResult.hasReadme && chapterResult.hasExercises && 
          chapterResult.hasExamples && chapterResult.hasStartHere && 
          chapterResult.issues.length === 0) {
        results.metrics.completedChapters++;
        log(`✓ ${chapter} - Complete`, 'green');
      } else {
        log(`✗ ${chapter} - Incomplete (${chapterResult.issues.length} issues)`, 'yellow');
        chapterResult.issues.forEach(issue => {
          log(`  - ${issue}`, 'yellow');
        });
      }
    } else {
      chapterResult.issues.push('Chapter directory does not exist');
      log(`✗ ${chapter} - Not found`, 'red');
    }
    
    results.chapters.push(chapterResult);
  }
}

/**
 *
 */
async function validateSampleApplications() {
  log('\n=== Validating Sample Applications ===', 'cyan');
  
  const sampleAppsDir = path.join(__dirname, 'sample-app-source');
  const expectedApps = ['todo-app', 'shopping-list', 'multi-page-app', 'capstone-starter'];
  
  for (const app of expectedApps) {
    const appPath = path.join(sampleAppsDir, app);
    const appResult = {
      name: app,
      exists: false,
      hasIndex: false,
      hasStyles: false,
      hasScript: false,
      hasBugs: false,
      hasSolution: false,
      issues: []
    };
    
    results.metrics.totalApps++;
    
    if (await fileExists(appPath)) {
      appResult.exists = true;
      
      // Check for required files
      if (await fileExists(path.join(appPath, 'index.html'))) {
        appResult.hasIndex = true;
      } else {
        appResult.issues.push('Missing index.html');
      }
      
      if (await fileExists(path.join(appPath, 'styles.css')) || 
          await fileExists(path.join(appPath, 'style.css'))) {
        appResult.hasStyles = true;
      } else {
        appResult.issues.push('Missing CSS file');
      }
      
      if (await fileExists(path.join(appPath, 'script.js')) || 
          await fileExists(path.join(appPath, 'app.js'))) {
        appResult.hasScript = true;
      } else {
        appResult.issues.push('Missing JavaScript file');
      }
      
      // Check for intentional bugs version
      if (await fileExists(path.join(appPath, 'with-bugs'))) {
        appResult.hasBugs = true;
      }
      
      // Check for solution version
      if (await fileExists(path.join(appPath, 'solution'))) {
        appResult.hasSolution = true;
      }
      
      if (appResult.hasIndex && appResult.hasStyles && appResult.hasScript) {
        results.metrics.workingApps++;
        log(`✓ ${app} - Valid`, 'green');
      } else {
        log(`✗ ${app} - Invalid (${appResult.issues.length} issues)`, 'yellow');
        appResult.issues.forEach(issue => {
          log(`  - ${issue}`, 'yellow');
        });
      }
    } else {
      appResult.issues.push('Application directory does not exist');
      log(`✗ ${app} - Not found`, 'red');
    }
    
    results.sampleApps.push(appResult);
  }
}

/**
 *
 */
async function validatePrompts() {
  log('\n=== Validating Prompts ===', 'cyan');
  
  const promptsDir = path.join(__dirname, 'prompts');
  const chapterDirs = await fs.readdir(promptsDir);
  
  for (const dir of chapterDirs) {
    if (dir.startsWith('chapter-')) {
      const chapterPath = path.join(promptsDir, dir);
      const stat = await fs.stat(chapterPath);
      
      if (stat.isDirectory()) {
        const promptFiles = await fs.readdir(chapterPath);
        
        for (const file of promptFiles) {
          if (file.endsWith('.md')) {
            results.metrics.totalPrompts++;
            
            const promptPath = path.join(chapterPath, file);
            const content = await fs.readFile(promptPath, 'utf-8');
            
            const promptResult = {
              chapter: dir,
              file: file,
              hasEnglishSection: false,
              hasChineseSection: false,
              hasCodeBlocks: false,
              hasExamples: false,
              tokenEstimate: 0,
              issues: []
            };
            
            // Validate prompt structure
            if (content.includes('[English') || content.includes('English Technical')) {
              promptResult.hasEnglishSection = true;
            } else {
              promptResult.issues.push('Missing English section');
            }
            
            if (content.includes('[Chinese') || content.includes('Chinese') || content.includes('中文')) {
              promptResult.hasChineseSection = true;
            } else {
              promptResult.issues.push('Missing Chinese section');
            }
            
            if (content.includes('```')) {
              promptResult.hasCodeBlocks = true;
            }
            
            // Estimate tokens (rough approximation)
            promptResult.tokenEstimate = Math.floor(content.length / 4);
            
            if (promptResult.tokenEstimate > 8000) {
              promptResult.issues.push(`Token count too high (${promptResult.tokenEstimate})`);
            }
            
            if (promptResult.hasEnglishSection && promptResult.hasChineseSection) {
              results.metrics.validPrompts++;
              log(`✓ ${dir}/${file} - Valid (${promptResult.tokenEstimate} tokens)`, 'green');
            } else {
              log(`✗ ${dir}/${file} - Invalid (${promptResult.issues.length} issues)`, 'yellow');
              promptResult.issues.forEach(issue => {
                log(`  - ${issue}`, 'yellow');
              });
            }
            
            results.prompts.push(promptResult);
          }
        }
      }
    }
  }
}

/**
 *
 */
async function validateTestInfrastructure() {
  log('\n=== Validating Test Infrastructure ===', 'cyan');
  
  const testsDir = path.join(__dirname, 'tests');
  
  // Check for test directories
  const expectedDirs = ['e2e', 'integration', 'utils', 'page-objects', 'fixtures'];
  
  for (const dir of expectedDirs) {
    const dirPath = path.join(testsDir, dir);
    if (await fileExists(dirPath)) {
      log(`✓ ${dir} directory exists`, 'green');
    } else {
      log(`✗ ${dir} directory missing`, 'red');
      results.errors.push(`Missing test directory: ${dir}`);
    }
  }
  
  // Check for playwright.config.ts
  if (await fileExists(path.join(__dirname, 'playwright.config.ts'))) {
    log('✓ Playwright configuration exists', 'green');
  } else {
    log('✗ Playwright configuration missing', 'red');
    results.errors.push('Missing playwright.config.ts');
  }
  
  // Count test files
  try {
    const e2eFiles = await fs.readdir(path.join(testsDir, 'e2e'));
    const specFiles = e2eFiles.filter(f => f.endsWith('.spec.ts'));
    results.metrics.totalTests = specFiles.length;
    log(`✓ Found ${specFiles.length} E2E test files`, 'green');
  } catch (error) {
    log('✗ Could not read E2E test files', 'red');
    results.errors.push('Could not read E2E test files');
  }
}

/**
 *
 */
async function validateDocumentation() {
  log('\n=== Validating Documentation ===', 'cyan');
  
  const requiredDocs = [
    'README.md',
    'PRD.md',
    'CLAUDE.md',
    '.cursorrules'
  ];
  
  for (const doc of requiredDocs) {
    const docPath = path.join(__dirname, doc);
    if (await fileExists(docPath)) {
      const content = await fs.readFile(docPath, 'utf-8');
      
      if (content.length > 100) {
        log(`✓ ${doc} - Valid (${content.length} chars)`, 'green');
        results.documentation.push({ file: doc, valid: true, size: content.length });
      } else {
        log(`✗ ${doc} - Too short (${content.length} chars)`, 'yellow');
        results.warnings.push(`${doc} seems incomplete`);
        results.documentation.push({ file: doc, valid: false, size: content.length });
      }
    } else {
      log(`✗ ${doc} - Not found`, 'red');
      results.errors.push(`Missing documentation: ${doc}`);
      results.documentation.push({ file: doc, valid: false, size: 0 });
    }
  }
}

/**
 *
 */
async function runSimpleTests() {
  log('\n=== Running Simple Validation Tests ===', 'cyan');
  
  // Check if npm packages are installed
  try {
    await fs.access(path.join(__dirname, 'node_modules'));
    log('✓ Node modules installed', 'green');
  } catch {
    log('✗ Node modules not installed', 'red');
    results.errors.push('Node modules not installed - run npm install');
  }
  
  // Check Node.js version
  try {
    const { stdout } = await execPromise('node --version');
    const version = stdout.trim();
    log(`✓ Node.js version: ${version}`, 'green');
  } catch {
    log('✗ Could not check Node.js version', 'red');
  }
  
  // Check if Playwright is installed
  try {
    const { stdout } = await execPromise('npx playwright --version');
    const version = stdout.trim();
    log(`✓ Playwright version: ${version}`, 'green');
  } catch {
    log('✗ Playwright not installed', 'red');
    results.errors.push('Playwright not installed');
  }
}

/**
 *
 */
async function generateReport() {
  log('\n' + '='.repeat(60), 'cyan');
  log('VALIDATION REPORT', 'cyan');
  log('='.repeat(60), 'cyan');
  
  // Chapter Completeness
  log('\n📚 Chapter Completeness:', 'magenta');
  log(`  Total Chapters: ${results.metrics.totalChapters}`);
  log(`  Complete Chapters: ${results.metrics.completedChapters}`);
  const chapterCompleteness = (results.metrics.completedChapters / results.metrics.totalChapters * 100).toFixed(1);
  log(`  Completeness: ${chapterCompleteness}%`);
  
  // Sample Applications
  log('\n💻 Sample Applications:', 'magenta');
  log(`  Total Apps: ${results.metrics.totalApps}`);
  log(`  Working Apps: ${results.metrics.workingApps}`);
  const appCompleteness = (results.metrics.workingApps / results.metrics.totalApps * 100).toFixed(1);
  log(`  Completeness: ${appCompleteness}%`);
  
  // Prompts
  log('\n📝 Prompts:', 'magenta');
  log(`  Total Prompts: ${results.metrics.totalPrompts}`);
  log(`  Valid Prompts: ${results.metrics.validPrompts}`);
  const promptValidity = (results.metrics.validPrompts / results.metrics.totalPrompts * 100).toFixed(1);
  log(`  Validity: ${promptValidity}%`);
  
  // Tests
  log('\n🧪 Tests:', 'magenta');
  log(`  Total Test Files: ${results.metrics.totalTests}`);
  
  // Issues Summary
  log('\n⚠️  Issues Summary:', 'magenta');
  log(`  Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
  log(`  Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');
  
  if (results.errors.length > 0) {
    log('\n❌ Errors:', 'red');
    results.errors.forEach(error => {
      log(`  - ${error}`, 'red');
    });
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    results.warnings.forEach(warning => {
      log(`  - ${warning}`, 'yellow');
    });
  }
  
  // Overall Score
  const overallScore = (
    parseFloat(chapterCompleteness) * 0.4 +
    parseFloat(appCompleteness) * 0.3 +
    parseFloat(promptValidity) * 0.3
  ).toFixed(1);
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`OVERALL WORKSHOP QUALITY SCORE: ${overallScore}%`, overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red');
  log('='.repeat(60), 'cyan');
  
  // Recommendations
  log('\n📋 Recommendations:', 'blue');
  
  if (results.metrics.completedChapters < results.metrics.totalChapters) {
    log('  1. Complete missing chapter materials', 'blue');
  }
  
  if (results.metrics.workingApps < results.metrics.totalApps) {
    log('  2. Fix or complete sample applications', 'blue');
  }
  
  if (results.metrics.validPrompts < results.metrics.totalPrompts) {
    log('  3. Review and fix invalid prompts', 'blue');
  }
  
  if (results.errors.length > 0) {
    log('  4. Address critical errors listed above', 'blue');
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, 'validation-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  log(`\n✓ Detailed report saved to: ${reportPath}`, 'green');
}

// Main execution
/**
 *
 */
async function main() {
  log('🚀 Starting Workshop Validation...', 'cyan');
  log('='.repeat(60), 'cyan');
  
  try {
    await validateChapterStructure();
    await validateSampleApplications();
    await validatePrompts();
    await validateTestInfrastructure();
    await validateDocumentation();
    await runSimpleTests();
    await generateReport();
  } catch (error) {
    log(`\n❌ Validation Error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run validation
main().catch(console.error);