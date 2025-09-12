#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

class NavigationTester {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'docs');
    this.errors = [];
    this.warnings = [];
    this.tested = new Set();
  }

  async test() {
    console.log('🔍 Testing navigation links...\n');
    
    // Test main navigation pages
    await this.testFile('index.html', '/');
    await this.testFile('chapters.html', '/');
    await this.testFile('playground.html', '/');
    
    // Test all chapter pages
    const chaptersDir = path.join(this.docsDir, 'chapters');
    const chapterFiles = await fs.readdir(chaptersDir);
    for (const file of chapterFiles) {
      if (file.endsWith('.html')) {
        await this.testFile(path.join('chapters', file), '/chapters/');
      }
    }
    
    // Test redirects
    await this.testRedirect('chapters/index.html', '../chapters.html');
    await this.testRedirect('playground/index.html', '../playground.html');
    
    // Report results
    this.report();
  }

  async testFile(filePath, context) {
    const fullPath = path.join(this.docsDir, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const $ = cheerio.load(content);
      
      console.log(`Testing: ${filePath}`);
      
      // Check all links
      $('a[href]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (!href.startsWith('http') && !href.startsWith('#')) {
          this.checkLink(filePath, href, context);
        }
      });
      
      // Check all stylesheets
      $('link[rel="stylesheet"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (!href.startsWith('http')) {
          this.checkResource(filePath, href, context);
        }
      });
      
      // Check all scripts
      $('script[src]').each((i, elem) => {
        const src = $(elem).attr('src');
        if (!src.startsWith('http')) {
          this.checkResource(filePath, src, context);
        }
      });
      
      this.tested.add(filePath);
      
    } catch (error) {
      this.errors.push(`Failed to read ${filePath}: ${error.message}`);
    }
  }

  async testRedirect(filePath, expectedTarget) {
    const fullPath = path.join(this.docsDir, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const $ = cheerio.load(content);
      
      const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
      if (metaRefresh) {
        const match = metaRefresh.match(/url=(.+)$/);
        if (match && match[1] === expectedTarget) {
          console.log(`✅ Redirect OK: ${filePath} → ${expectedTarget}`);
        } else {
          this.errors.push(`Redirect mismatch in ${filePath}: expected ${expectedTarget}, got ${match ? match[1] : 'none'}`);
        }
      } else {
        this.errors.push(`No redirect found in ${filePath}`);
      }
    } catch (error) {
      this.warnings.push(`Could not test redirect ${filePath}: ${error.message}`);
    }
  }

  checkLink(fromFile, href, _context) {
    // Resolve the link relative to the file
    const fromDir = path.dirname(fromFile);
    let targetPath;
    
    if (href.startsWith('/')) {
      // Absolute path from docs root
      targetPath = href.slice(1);
    } else if (href.startsWith('../')) {
      // Parent directory reference
      targetPath = path.join(fromDir, href);
    } else if (href.startsWith('./')) {
      // Current directory reference
      targetPath = path.join(fromDir, href.slice(2));
    } else {
      // Relative to current directory
      targetPath = path.join(fromDir, href);
    }
    
    // Normalize the path
    targetPath = path.normalize(targetPath);
    
    // Check if target exists
    const fullTargetPath = path.join(this.docsDir, targetPath);
    
    try {
      if (!fs.existsSync(fullTargetPath)) {
        // Check if it's a directory that might have index.html
        const indexPath = path.join(fullTargetPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          this.errors.push(`Broken link in ${fromFile}: ${href} (resolved to ${targetPath})`);
        }
      }
    } catch (error) {
      this.warnings.push(`Could not check link in ${fromFile}: ${href}`);
    }
  }

  checkResource(fromFile, href, _context) {
    // Similar to checkLink but for resources
    const fromDir = path.dirname(fromFile);
    let targetPath;
    
    if (href.startsWith('/')) {
      targetPath = href.slice(1);
    } else if (href.startsWith('../')) {
      targetPath = path.join(fromDir, href);
    } else if (href.startsWith('./')) {
      targetPath = path.join(fromDir, href.slice(2));
    } else {
      targetPath = path.join(fromDir, href);
    }
    
    targetPath = path.normalize(targetPath);
    const fullTargetPath = path.join(this.docsDir, targetPath);
    
    try {
      if (!fs.existsSync(fullTargetPath)) {
        this.warnings.push(`Missing resource in ${fromFile}: ${href} (resolved to ${targetPath})`);
      }
    } catch (error) {
      this.warnings.push(`Could not check resource in ${fromFile}: ${href}`);
    }
  }

  report() {
    console.log('\n' + '='.repeat(50));
    console.log('NAVIGATION TEST REPORT');
    console.log('='.repeat(50) + '\n');
    
    console.log(`Files tested: ${this.tested.size}`);
    console.log(`Errors found: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All navigation links are working correctly!');
    }
    
    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Run the test
const tester = new NavigationTester();
tester.test().catch(console.error);