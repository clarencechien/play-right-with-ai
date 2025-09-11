#!/usr/bin/env node

/**
 * Bilingual Prompt Structure Validator
 * 
 * Validates that all prompt files follow the "Think in English, Output in Chinese" structure
 * 
 * Required sections:
 * 1. Technical Specification (Think in English)
 * 2. 輸出要求 (Output in Chinese)
 * 3. Example / 範例
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required sections in each prompt file
const REQUIRED_SECTIONS = {
  'Technical Specification (Think in English)': {
    pattern: /##\s+Technical\s+Specification\s+\(Think\s+in\s+English\)/i,
    description: 'English technical thinking section'
  },
  '輸出要求 (Output in Chinese)': {
    pattern: /##\s+輸出要求\s+\(Output\s+in\s+Chinese\)/i,
    description: 'Chinese output requirements section'
  },
  'Example / 範例': {
    pattern: /##\s+Example\s+\/\s+範例/i,
    description: 'Bilingual example section'
  }
};

// Additional validation rules
const VALIDATION_RULES = {
  englishThinking: {
    pattern: /English\s+Thinking\s+Process:/i,
    description: 'English thinking process in examples'
  },
  chineseOutput: {
    pattern: /Chinese\s+Output\s+Result:/i,
    description: 'Chinese output result in examples'
  },
  technicalCode: {
    pattern: /```(?:javascript|typescript|json|yaml)/,
    description: 'Technical code blocks in English section'
  },
  chineseComments: {
    pattern: /\/\/\s*[\u4e00-\u9fff]/,
    description: 'Chinese comments in output code'
  }
};

/**
 * BilingualValidator 類別
 */
class BilingualValidator {
  /**
     * 初始化建構函式
     */
    constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  /**
   * Validate a single prompt file
   * @param {*} filePath - filePath 參數
   */
  validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const issues = [];
    const warnings = [];

    console.log(`\n${colors.cyan}Validating: ${fileName}${colors.reset}`);

    // Check for required sections
    for (const [sectionName, config] of Object.entries(REQUIRED_SECTIONS)) {
      if (!config.pattern.test(content)) {
        issues.push(`Missing required section: "${sectionName}"`);
      } else {
        console.log(`  ${colors.green}✓${colors.reset} Found: ${config.description}`);
      }
    }

    // Check for proper structure in Example section
    if (REQUIRED_SECTIONS['Example / 範例'].pattern.test(content)) {
      const exampleSection = content.split(/##\s+Example\s+\/\s+範例/i)[1];
      if (exampleSection) {
        if (!VALIDATION_RULES.englishThinking.pattern.test(exampleSection)) {
          warnings.push('Example section missing "English Thinking Process"');
        }
        if (!VALIDATION_RULES.chineseOutput.pattern.test(exampleSection)) {
          warnings.push('Example section missing "Chinese Output Result"');
        }
      }
    }

    // Check for technical code in English section
    const englishSection = content.match(
      /##\s+Technical\s+Specification[\s\S]*?##\s+輸出要求/i
    );
    if (englishSection && !VALIDATION_RULES.technicalCode.pattern.test(englishSection[0])) {
      warnings.push('English section should contain technical code blocks');
    }

    // Check for Chinese in output section
    const chineseSection = content.match(
      /##\s+輸出要求[\s\S]*?(?:##\s+Example|$)/i
    );
    if (chineseSection) {
      const chineseCharPattern = /[\u4e00-\u9fff]/;
      if (!chineseCharPattern.test(chineseSection[0])) {
        issues.push('Chinese output section lacks Chinese characters');
      }
    }

    // Report results for this file
    if (issues.length === 0) {
      this.results.passed.push(fileName);
      console.log(`  ${colors.green}✅ PASSED${colors.reset}`);
    } else {
      this.results.failed.push({ fileName, issues });
      console.log(`  ${colors.red}❌ FAILED${colors.reset}`);
      issues.forEach(issue => {
        console.log(`    ${colors.red}- ${issue}${colors.reset}`);
      });
    }

    if (warnings.length > 0) {
      this.results.warnings.push({ fileName, warnings });
      console.log(`  ${colors.yellow}⚠️  WARNINGS${colors.reset}`);
      warnings.forEach(warning => {
        console.log(`    ${colors.yellow}- ${warning}${colors.reset}`);
      });
    }

    return issues.length === 0;
  }

  /**
   * Validate all prompt files in a directory
   * @param {*} dirPath - dirPath 參數
   */
  validateDirectory(dirPath) {
    const files = this.findPromptFiles(dirPath);
    
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  Bilingual Prompt Structure Validator${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`\nFound ${files.length} prompt files to validate\n`);

    files.forEach(file => {
      this.validateFile(file);
    });

    this.printSummary();
  }

  /**
   * Recursively find all .md files in prompt directories
   * @param {*} dirPath - dirPath 參數
   */
  findPromptFiles(dirPath) {
    const files = [];
    
    /**
     *
     * @param {*} currentPath - currentPath 參數
     */
    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          traverse(fullPath);
        } else if (stat.isFile() && item.endsWith('.md')) {
          // Skip README and other non-prompt files
          if (!item.toLowerCase().includes('readme') && 
              !item.toLowerCase().includes('guide')) {
            files.push(fullPath);
          }
        }
      });
    }
    
    traverse(dirPath);
    return files;
  }

  /**
   * Print validation summary
   */
  printSummary() {
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}  Validation Summary${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    // Passed files
    if (this.results.passed.length > 0) {
      console.log(`${colors.green}✅ Passed: ${this.results.passed.length} files${colors.reset}`);
      this.results.passed.forEach(file => {
        console.log(`   ${colors.green}• ${file}${colors.reset}`);
      });
    }

    // Failed files
    if (this.results.failed.length > 0) {
      console.log(`\n${colors.red}❌ Failed: ${this.results.failed.length} files${colors.reset}`);
      this.results.failed.forEach(({ fileName, issues }) => {
        console.log(`   ${colors.red}• ${fileName}${colors.reset}`);
        issues.forEach(issue => {
          console.log(`     ${colors.red}- ${issue}${colors.reset}`);
        });
      });
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  Warnings: ${this.results.warnings.length} files${colors.reset}`);
      this.results.warnings.forEach(({ fileName, warnings }) => {
        console.log(`   ${colors.yellow}• ${fileName}${colors.reset}`);
        warnings.forEach(warning => {
          console.log(`     ${colors.yellow}- ${warning}${colors.reset}`);
        });
      });
    }

    // Final result
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    const totalFiles = this.results.passed.length + this.results.failed.length;
    const passRate = ((this.results.passed.length / totalFiles) * 100).toFixed(1);
    
    if (this.results.failed.length === 0) {
      console.log(`${colors.green}🎉 All prompts follow the bilingual structure! (${passRate}% pass rate)${colors.reset}`);
    } else {
      console.log(`${colors.red}📋 ${this.results.failed.length} prompts need to be updated (${passRate}% pass rate)${colors.reset}`);
      console.log(`\n${colors.cyan}Fix required sections:${colors.reset}`);
      console.log('1. Add "## Technical Specification (Think in English)" section');
      console.log('2. Add "## 輸出要求 (Output in Chinese)" section');
      console.log('3. Add "## Example / 範例" section with both thinking and output');
    }
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
  }

  /**
   * Generate a report file
   * @param {*} outputPath - outputPath 參數
   */
  generateReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed.length + this.results.failed.length,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length
      },
      details: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings
      },
      requiredSections: Object.keys(REQUIRED_SECTIONS),
      validationRules: Object.keys(VALIDATION_RULES)
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`${colors.cyan}Report saved to: ${outputPath}${colors.reset}`);
  }
}

// Main execution
/**
 *
 */
function main() {
  const validator = new BilingualValidator();
  
  // Get the prompts directory path
  const promptsDir = path.join(__dirname, '..');
  
  // Check if directory exists
  if (!fs.existsSync(promptsDir)) {
    console.error(`${colors.red}Error: Prompts directory not found at ${promptsDir}${colors.reset}`);
    process.exit(1);
  }

  // Run validation
  validator.validateDirectory(promptsDir);

  // Generate report if requested
  if (process.argv.includes('--report')) {
    const reportPath = path.join(__dirname, 'validation-report.json');
    validator.generateReport(reportPath);
  }

  // Check for fix mode
  if (process.argv.includes('--fix')) {
    console.log(`${colors.yellow}Auto-fix mode is not yet implemented.${colors.reset}`);
    console.log('Please manually update the files to include required sections.');
  }

  // Exit with error code if validation failed
  if (validator.results.failed.length > 0) {
    process.exit(1);
  }
}

// Run the validator
if (require.main === module) {
  main();
}

module.exports = BilingualValidator;