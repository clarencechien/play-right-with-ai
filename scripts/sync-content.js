#!/usr/bin/env node

/**
 * Content Synchronization Script
 * Ensures consistency across all output locations and validates metadata completeness
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob-promise');
const chalk = require('chalk');
const yaml = require('js-yaml');
const crypto = require('crypto');

class ContentSynchronizer {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.fix = options.fix || false;
    this.verbose = options.verbose || false;
    
    // Define source and output paths
    this.paths = {
      source: path.join(this.rootDir, 'content', 'chapters'),
      htmlOutput: path.join(this.rootDir, 'docs', 'chapters'),
      workshopOutput: path.join(this.rootDir, 'workshop'),
      memoryBank: path.join(this.rootDir, 'memory-bank')
    };
    
    this.issues = {
      missing: [],
      orphaned: [],
      outdated: [],
      metadata: [],
      structure: []
    };
    
    this.contentMap = new Map();
    this.checksums = new Map();
  }

  async sync() {
    console.log(chalk.blue('\n🔄 Starting Content Synchronization Check...\n'));

    try {
      // Step 1: Scan source content
      await this.scanSourceContent();

      // Step 2: Check output consistency
      await this.checkOutputConsistency();

      // Step 3: Validate metadata completeness
      await this.validateMetadata();

      // Step 4: Check for orphaned files
      await this.checkOrphaned();

      // Step 5: Verify content freshness
      await this.checkFreshness();

      // Step 6: Generate report
      const hasIssues = await this.generateReport();

      // Step 7: Fix issues if requested
      if (this.fix && hasIssues) {
        await this.fixIssues();
      }

      // Exit with appropriate code
      if (hasIssues && !this.fix) {
        console.error(chalk.red('\n❌ Synchronization issues found. Run with --fix to resolve.'));
        process.exit(1);
      }

      console.log(chalk.green('\n✅ Content synchronized successfully!\n'));
    } catch (error) {
      console.error(chalk.red(`\n❌ Synchronization failed: ${error.message}`));
      process.exit(1);
    }
  }

  async scanSourceContent() {
    console.log(chalk.cyan('Scanning source content...'));
    
    const chapterDirs = await glob('*/', { cwd: this.paths.source });
    
    for (const dir of chapterDirs) {
      const chapterPath = path.join(this.paths.source, dir);
      const chapterNumber = dir.match(/^(\d+)-/)?.[1];
      
      if (!chapterNumber) {
        this.issues.structure.push({
          type: 'invalid_dirname',
          path: dir,
          message: 'Chapter directory name should start with number'
        });
        continue;
      }

      const chapterInfo = {
        number: chapterNumber,
        dirname: dir.replace(/\/$/, ''),
        sourcePath: chapterPath,
        files: {},
        metadata: null,
        content: null
      };

      // Check for required files
      const requiredFiles = ['index.md', 'metadata.yaml'];
      for (const file of requiredFiles) {
        const filePath = path.join(chapterPath, file);
        chapterInfo.files[file] = await this.fileExists(filePath);
        
        if (!chapterInfo.files[file]) {
          this.issues.missing.push({
            type: 'source_file',
            chapter: chapterNumber,
            file,
            path: filePath
          });
        } else {
          // Calculate checksum for change detection
          const content = await fs.readFile(filePath, 'utf-8');
          const checksum = this.calculateChecksum(content);
          this.checksums.set(filePath, checksum);
          
          if (file === 'metadata.yaml') {
            try {
              chapterInfo.metadata = yaml.load(content);
            } catch (error) {
              this.issues.metadata.push({
                chapter: chapterNumber,
                error: `Invalid YAML: ${error.message}`,
                path: filePath
              });
            }
          } else if (file === 'index.md') {
            chapterInfo.content = content;
          }
        }
      }

      // Check for optional directories
      const optionalDirs = ['exercises', 'examples', 'prompts'];
      for (const subdir of optionalDirs) {
        const subdirPath = path.join(chapterPath, subdir);
        chapterInfo.files[subdir] = await this.fileExists(subdirPath);
      }

      this.contentMap.set(chapterNumber, chapterInfo);
    }

    console.log(chalk.cyan(`Found ${this.contentMap.size} chapters in source`));
  }

  async checkOutputConsistency() {
    console.log(chalk.cyan('\nChecking output consistency...'));
    
    for (const [chapterNumber, chapterInfo] of this.contentMap.entries()) {
      const paddedNumber = chapterNumber.padStart(2, '0');
      
      // Check HTML output
      const htmlFile = path.join(this.paths.htmlOutput, `chapter-${paddedNumber}.html`);
      if (!await this.fileExists(htmlFile)) {
        this.issues.missing.push({
          type: 'html_output',
          chapter: chapterNumber,
          path: htmlFile
        });
      } else if (this.verbose) {
        console.log(chalk.gray(`  ✓ HTML exists for chapter ${chapterNumber}`));
      }

      // Check workshop output
      const workshopDir = path.join(this.paths.workshopOutput, `chapter-${paddedNumber}`);
      const workshopReadme = path.join(workshopDir, 'README.md');
      
      if (!await this.fileExists(workshopDir)) {
        this.issues.missing.push({
          type: 'workshop_dir',
          chapter: chapterNumber,
          path: workshopDir
        });
      } else if (!await this.fileExists(workshopReadme)) {
        this.issues.missing.push({
          type: 'workshop_readme',
          chapter: chapterNumber,
          path: workshopReadme
        });
      } else if (this.verbose) {
        console.log(chalk.gray(`  ✓ Workshop materials exist for chapter ${chapterNumber}`));
      }

      // Check required subdirectories in workshop
      const requiredWorkshopDirs = ['start-here', 'example-output'];
      for (const subdir of requiredWorkshopDirs) {
        const subdirPath = path.join(workshopDir, subdir);
        if (!await this.fileExists(subdirPath)) {
          this.issues.structure.push({
            type: 'missing_workshop_subdir',
            chapter: chapterNumber,
            subdir,
            path: subdirPath
          });
        }
      }

      // Check if optional content directories are synced
      if (chapterInfo.files.exercises) {
        const targetExercises = path.join(workshopDir, 'exercises');
        if (!await this.fileExists(targetExercises)) {
          this.issues.missing.push({
            type: 'exercises_sync',
            chapter: chapterNumber,
            source: path.join(chapterInfo.sourcePath, 'exercises'),
            target: targetExercises
          });
        }
      }
    }
  }

  async validateMetadata() {
    console.log(chalk.cyan('\nValidating metadata completeness...'));
    
    const requiredFields = ['title', 'objectives', 'prerequisites', 'duration'];
    const requiredTitleFields = ['zh'];
    
    for (const [chapterNumber, chapterInfo] of this.contentMap.entries()) {
      if (!chapterInfo.metadata) {
        continue; // Already reported as missing
      }

      const metadata = chapterInfo.metadata;
      const missingFields = [];

      // Check required top-level fields
      for (const field of requiredFields) {
        if (!metadata[field]) {
          missingFields.push(field);
        }
      }

      // Check title structure
      if (metadata.title) {
        for (const field of requiredTitleFields) {
          if (!metadata.title[field]) {
            missingFields.push(`title.${field}`);
          }
        }
      }

      // Check objectives array
      if (metadata.objectives && !Array.isArray(metadata.objectives)) {
        this.issues.metadata.push({
          chapter: chapterNumber,
          field: 'objectives',
          error: 'Should be an array'
        });
      } else if (!metadata.objectives || metadata.objectives.length === 0) {
        this.issues.metadata.push({
          chapter: chapterNumber,
          field: 'objectives',
          error: 'At least one objective required'
        });
      }

      // Check prerequisites array
      if (metadata.prerequisites && !Array.isArray(metadata.prerequisites)) {
        this.issues.metadata.push({
          chapter: chapterNumber,
          field: 'prerequisites',
          error: 'Should be an array'
        });
      }

      if (missingFields.length > 0) {
        this.issues.metadata.push({
          chapter: chapterNumber,
          missingFields,
          path: path.join(chapterInfo.sourcePath, 'metadata.yaml')
        });
      } else if (this.verbose) {
        console.log(chalk.gray(`  ✓ Metadata complete for chapter ${chapterNumber}`));
      }
    }
  }

  async checkOrphaned() {
    console.log(chalk.cyan('\nChecking for orphaned files...'));
    
    // Check HTML output directory
    const htmlFiles = await glob('*.html', { cwd: this.paths.htmlOutput });
    for (const file of htmlFiles) {
      const match = file.match(/chapter-(\d+)\.html/);
      if (match) {
        const chapterNumber = match[1].replace(/^0+/, '');
        if (!this.contentMap.has(chapterNumber)) {
          this.issues.orphaned.push({
            type: 'html',
            file: path.join(this.paths.htmlOutput, file),
            reason: `No source chapter ${chapterNumber}`
          });
        }
      }
    }

    // Check workshop directory
    const workshopDirs = await glob('chapter-*/', { cwd: this.paths.workshopOutput });
    for (const dir of workshopDirs) {
      const match = dir.match(/chapter-(\d+)/);
      if (match) {
        const chapterNumber = match[1].replace(/^0+/, '');
        if (!this.contentMap.has(chapterNumber)) {
          this.issues.orphaned.push({
            type: 'workshop',
            file: path.join(this.paths.workshopOutput, dir),
            reason: `No source chapter ${chapterNumber}`
          });
        }
      }
    }

    if (this.issues.orphaned.length === 0 && this.verbose) {
      console.log(chalk.gray('  ✓ No orphaned files found'));
    }
  }

  async checkFreshness() {
    console.log(chalk.cyan('\nChecking content freshness...'));
    
    for (const [chapterNumber, chapterInfo] of this.contentMap.entries()) {
      const paddedNumber = chapterNumber.padStart(2, '0');
      
      // Check if HTML is outdated
      const htmlFile = path.join(this.paths.htmlOutput, `chapter-${paddedNumber}.html`);
      if (await this.fileExists(htmlFile)) {
        const sourceTime = await this.getLatestModTime(chapterInfo.sourcePath);
        const htmlTime = await this.getModTime(htmlFile);
        
        if (sourceTime > htmlTime) {
          this.issues.outdated.push({
            type: 'html',
            chapter: chapterNumber,
            source: chapterInfo.sourcePath,
            output: htmlFile,
            sourceTime: new Date(sourceTime).toISOString(),
            outputTime: new Date(htmlTime).toISOString()
          });
        }
      }

      // Check if workshop README is outdated
      const workshopReadme = path.join(
        this.paths.workshopOutput,
        `chapter-${paddedNumber}`,
        'README.md'
      );
      
      if (await this.fileExists(workshopReadme)) {
        const sourceTime = await this.getLatestModTime(chapterInfo.sourcePath);
        const workshopTime = await this.getModTime(workshopReadme);
        
        if (sourceTime > workshopTime) {
          this.issues.outdated.push({
            type: 'workshop',
            chapter: chapterNumber,
            source: chapterInfo.sourcePath,
            output: workshopReadme,
            sourceTime: new Date(sourceTime).toISOString(),
            outputTime: new Date(workshopTime).toISOString()
          });
        }
      }
    }

    if (this.issues.outdated.length === 0 && this.verbose) {
      console.log(chalk.gray('  ✓ All content is up to date'));
    }
  }

  async generateReport() {
    const totalIssues = Object.values(this.issues).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalIssues === 0) {
      console.log(chalk.green('\n✅ No synchronization issues found!'));
      return false;
    }

    console.log(chalk.yellow(`\n⚠️  Found ${totalIssues} synchronization issues:\n`));

    // Report missing files
    if (this.issues.missing.length > 0) {
      console.log(chalk.red(`Missing files/directories (${this.issues.missing.length}):`));
      this.issues.missing.forEach(issue => {
        console.log(chalk.red(`  - ${issue.type} for chapter ${issue.chapter || 'N/A'}`));
        if (this.verbose) {
          console.log(chalk.gray(`    Path: ${issue.path || issue.target}`));
        }
      });
    }

    // Report orphaned files
    if (this.issues.orphaned.length > 0) {
      console.log(chalk.yellow(`\nOrphaned files (${this.issues.orphaned.length}):`));
      this.issues.orphaned.forEach(issue => {
        console.log(chalk.yellow(`  - ${issue.type}: ${path.basename(issue.file)}`));
        console.log(chalk.gray(`    Reason: ${issue.reason}`));
      });
    }

    // Report outdated content
    if (this.issues.outdated.length > 0) {
      console.log(chalk.yellow(`\nOutdated content (${this.issues.outdated.length}):`));
      this.issues.outdated.forEach(issue => {
        console.log(chalk.yellow(`  - Chapter ${issue.chapter} ${issue.type} is outdated`));
        if (this.verbose) {
          console.log(chalk.gray(`    Source: ${issue.sourceTime}`));
          console.log(chalk.gray(`    Output: ${issue.outputTime}`));
        }
      });
    }

    // Report metadata issues
    if (this.issues.metadata.length > 0) {
      console.log(chalk.red(`\nMetadata issues (${this.issues.metadata.length}):`));
      this.issues.metadata.forEach(issue => {
        if (issue.missingFields) {
          console.log(chalk.red(`  - Chapter ${issue.chapter}: missing fields: ${issue.missingFields.join(', ')}`));
        } else {
          console.log(chalk.red(`  - Chapter ${issue.chapter}: ${issue.field} - ${issue.error}`));
        }
      });
    }

    // Report structure issues
    if (this.issues.structure.length > 0) {
      console.log(chalk.yellow(`\nStructure issues (${this.issues.structure.length}):`));
      this.issues.structure.forEach(issue => {
        console.log(chalk.yellow(`  - ${issue.type}: ${issue.message || issue.path}`));
      });
    }

    // Save detailed report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues,
        missing: this.issues.missing.length,
        orphaned: this.issues.orphaned.length,
        outdated: this.issues.outdated.length,
        metadata: this.issues.metadata.length,
        structure: this.issues.structure.length
      },
      issues: this.issues
    };

    const reportPath = path.join(this.rootDir, 'sync-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(chalk.cyan(`\nDetailed report saved to: ${reportPath}`));

    return true;
  }

  async fixIssues() {
    console.log(chalk.blue('\n🔧 Attempting to fix issues...\n'));

    let fixed = 0;
    let failed = 0;

    // Fix missing output files by rebuilding
    if (this.issues.missing.length > 0 || this.issues.outdated.length > 0) {
      console.log(chalk.blue('Rebuilding missing/outdated content...'));
      
      try {
        // Run the build script
        const { execSync } = require('child_process');
        execSync('node scripts/build-chapters.js', { 
          stdio: 'inherit',
          cwd: this.rootDir 
        });
        
        fixed += this.issues.missing.length + this.issues.outdated.length;
        console.log(chalk.green('✓ Content rebuilt successfully'));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to rebuild: ${error.message}`));
        failed += this.issues.missing.length + this.issues.outdated.length;
      }
    }

    // Fix orphaned files
    for (const orphan of this.issues.orphaned) {
      try {
        if (orphan.type === 'html') {
          await fs.unlink(orphan.file);
          console.log(chalk.green(`✓ Removed orphaned HTML: ${path.basename(orphan.file)}`));
        } else if (orphan.type === 'workshop') {
          await this.removeDirectory(orphan.file);
          console.log(chalk.green(`✓ Removed orphaned workshop directory: ${path.basename(orphan.file)}`));
        }
        fixed++;
      } catch (error) {
        console.error(chalk.red(`✗ Failed to remove ${orphan.file}: ${error.message}`));
        failed++;
      }
    }

    // Fix metadata issues (create template)
    for (const metaIssue of this.issues.metadata) {
      if (metaIssue.missingFields && metaIssue.path) {
        try {
          const metadata = await this.loadOrCreateMetadata(metaIssue.path);
          
          // Add missing fields with defaults
          for (const field of metaIssue.missingFields) {
            if (field === 'title.zh') {
              metadata.title = metadata.title || {};
              metadata.title.zh = metadata.title.zh || `第 ${metaIssue.chapter} 章`;
            } else if (field === 'objectives') {
              metadata.objectives = ['待定義'];
            } else if (field === 'prerequisites') {
              metadata.prerequisites = [];
            } else if (field === 'duration') {
              metadata.duration = '2 hours';
            }
          }

          await fs.writeFile(metaIssue.path, yaml.dump(metadata), 'utf-8');
          console.log(chalk.green(`✓ Fixed metadata for chapter ${metaIssue.chapter}`));
          fixed++;
        } catch (error) {
          console.error(chalk.red(`✗ Failed to fix metadata: ${error.message}`));
          failed++;
        }
      }
    }

    // Fix structure issues
    for (const structIssue of this.issues.structure) {
      if (structIssue.type === 'missing_workshop_subdir') {
        try {
          await fs.mkdir(structIssue.path, { recursive: true });
          console.log(chalk.green(`✓ Created missing directory: ${structIssue.subdir}`));
          fixed++;
        } catch (error) {
          console.error(chalk.red(`✗ Failed to create directory: ${error.message}`));
          failed++;
        }
      }
    }

    console.log(chalk.cyan(`\n📊 Fix Summary:`));
    console.log(chalk.green(`  Fixed: ${fixed} issues`));
    if (failed > 0) {
      console.log(chalk.red(`  Failed: ${failed} issues`));
    }
  }

  async loadOrCreateMetadata(path) {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return yaml.load(content);
    } catch {
      return {};
    }
  }

  async removeDirectory(dirPath) {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.removeDirectory(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
    
    await fs.rmdir(dirPath);
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getModTime(filePath) {
    const stat = await fs.stat(filePath);
    return stat.mtime.getTime();
  }

  async getLatestModTime(dirPath) {
    let latest = 0;
    const files = await glob('**/*', { cwd: dirPath, nodir: true });
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const modTime = await this.getModTime(filePath);
      if (modTime > latest) {
        latest = modTime;
      }
    }
    
    return latest;
  }

  calculateChecksum(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--fix':
        options.fix = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Content Synchronizer - Ensure consistency across all output locations

Usage:
  node sync-content.js [options]

Options:
  --fix          Attempt to fix issues automatically
  --verbose, -v  Show detailed output
  --help         Show this help message

Examples:
  node sync-content.js                # Check for issues
  node sync-content.js --fix          # Fix issues automatically
  node sync-content.js --verbose      # Show detailed progress
        `);
        process.exit(0);
    }
  }

  const synchronizer = new ContentSynchronizer(options);
  await synchronizer.sync();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ContentSynchronizer;