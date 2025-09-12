#!/usr/bin/env node

/**
 * Link Validation Script
 * Validates internal and external links across all content files
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob-promise');
const chalk = require('chalk');
const axios = require('axios');

class LinkValidator {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.contentPatterns = options.patterns || [
      'content/**/*.md',
      'docs/**/*.html',
      'workshop/**/*.md'
    ];
    this.whitelist = options.whitelist || [
      'github.com',
      'playwright.dev',
      'claude.ai',
      'localhost',
      '127.0.0.1'
    ];
    this.blacklist = options.blacklist || [];
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 2;
    this.links = new Map();
    this.errors = [];
    this.warnings = [];
    this.checkedUrls = new Map(); // Cache for external URL checks
  }

  async validate() {
    console.log(chalk.blue('\n🔍 Starting Link Validation...\n'));

    try {
      // Scan all files for links
      await this.scanFiles();

      // Validate all found links
      await this.validateLinks();

      // Generate report
      await this.generateReport();

      // Exit with appropriate code
      if (this.errors.length > 0) {
        console.error(chalk.red(`\n❌ Validation failed with ${this.errors.length} errors`));
        process.exit(1);
      }

      console.log(chalk.green('\n✅ All links validated successfully!\n'));
    } catch (error) {
      console.error(chalk.red(`\n❌ Validation failed: ${error.message}`));
      process.exit(1);
    }
  }

  async scanFiles() {
    console.log(chalk.cyan('Scanning files for links...'));
    
    for (const pattern of this.contentPatterns) {
      const files = await glob(pattern, { cwd: this.rootDir });
      
      for (const file of files) {
        await this.scanFile(path.join(this.rootDir, file));
      }
    }

    console.log(chalk.cyan(`Found ${this.links.size} unique links across ${this.getTotalFileCount()} files`));
  }

  async scanFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const links = this.extractLinks(content, filePath);
      
      for (const link of links) {
        if (!this.links.has(link.url)) {
          this.links.set(link.url, []);
        }
        this.links.get(link.url).push({
          file: filePath,
          line: link.line
        });
      }
    } catch (error) {
      this.warnings.push(`Could not read file ${filePath}: ${error.message}`);
    }
  }

  extractLinks(content, filePath) {
    const links = [];
    const lines = content.split('\n');
    const isMarkdown = filePath.endsWith('.md');
    const isHtml = filePath.endsWith('.html');

    lines.forEach((line, index) => {
      let matches = [];

      if (isMarkdown) {
        // Markdown link patterns
        // [text](url)
        const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = mdLinkRegex.exec(line)) !== null) {
          matches.push({ url: match[2], line: index + 1 });
        }

        // Reference-style links [text][ref]
        const refLinkRegex = /\[([^\]]*)\]\[([^\]]+)\]/g;
        while ((match = refLinkRegex.exec(line)) !== null) {
          // These need to be resolved from link definitions
          // For now, we'll skip them
        }

        // Raw URLs
        const rawUrlRegex = /https?:\/\/[^\s<>"\])}]+/g;
        while ((match = rawUrlRegex.exec(line)) !== null) {
          matches.push({ url: match[0], line: index + 1 });
        }
      }

      if (isHtml) {
        // HTML link patterns
        // href="url"
        const hrefRegex = /href=["']([^"']+)["']/g;
        let match;
        while ((match = hrefRegex.exec(line)) !== null) {
          matches.push({ url: match[1], line: index + 1 });
        }

        // src="url"
        const srcRegex = /src=["']([^"']+)["']/g;
        while ((match = srcRegex.exec(line)) !== null) {
          matches.push({ url: match[1], line: index + 1 });
        }
      }

      // Add all matches to links array
      links.push(...matches);
    });

    return links;
  }

  async validateLinks() {
    console.log(chalk.cyan('\nValidating links...'));
    
    const totalLinks = this.links.size;
    let processed = 0;
    
    for (const [url, locations] of this.links.entries()) {
      processed++;
      const progress = `[${processed}/${totalLinks}]`;
      
      if (this.shouldSkipUrl(url)) {
        continue;
      }

      if (this.isInternalLink(url)) {
        await this.validateInternalLink(url, locations, progress);
      } else if (this.isExternalLink(url)) {
        await this.validateExternalLink(url, locations, progress);
      }
    }
  }

  shouldSkipUrl(url) {
    // Skip anchors, mailto, and other special protocols
    if (url.startsWith('#') || 
        url.startsWith('mailto:') || 
        url.startsWith('javascript:') ||
        url.startsWith('data:')) {
      return true;
    }

    // Check blacklist
    for (const blacklisted of this.blacklist) {
      if (url.includes(blacklisted)) {
        return true;
      }
    }

    return false;
  }

  isInternalLink(url) {
    return url.startsWith('/') || 
           url.startsWith('./') || 
           url.startsWith('../') ||
           (!url.startsWith('http://') && !url.startsWith('https://'));
  }

  isExternalLink(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  async validateInternalLink(url, locations, progress) {
    // For each location, resolve the path relative to the file
    for (const location of locations) {
      const basePath = path.dirname(location.file);
      let resolvedPath;

      if (url.startsWith('/')) {
        // Absolute path from root
        resolvedPath = path.join(this.rootDir, url);
      } else {
        // Relative path
        resolvedPath = path.join(basePath, url);
      }

      // Remove any hash fragments
      resolvedPath = resolvedPath.split('#')[0];

      // Check if file exists
      try {
        await fs.access(resolvedPath);
        console.log(chalk.gray(`${progress} ✓ Internal: ${url}`));
      } catch (error) {
        this.errors.push({
          type: 'internal',
          url,
          file: location.file,
          line: location.line,
          error: `File not found: ${resolvedPath}`
        });
        console.log(chalk.red(`${progress} ✗ Internal: ${url} (not found)`));
      }
    }
  }

  async validateExternalLink(url, locations, progress) {
    // Check cache first
    if (this.checkedUrls.has(url)) {
      const cachedResult = this.checkedUrls.get(url);
      if (cachedResult.success) {
        console.log(chalk.gray(`${progress} ✓ External: ${url} (cached)`));
      } else {
        console.log(chalk.red(`${progress} ✗ External: ${url} (cached error)`));
        locations.forEach(location => {
          this.errors.push({
            type: 'external',
            url,
            file: location.file,
            line: location.line,
            error: cachedResult.error
          });
        });
      }
      return;
    }

    // Check if domain is whitelisted
    const isWhitelisted = this.whitelist.some(domain => url.includes(domain));
    if (!isWhitelisted) {
      console.log(chalk.yellow(`${progress} ⚠ External: ${url} (not whitelisted)`));
      this.warnings.push({
        url,
        message: 'Domain not in whitelist',
        locations
      });
      return;
    }

    // Attempt to validate the URL
    let attempts = 0;
    let lastError;

    while (attempts < this.retries) {
      attempts++;
      
      try {
        const response = await axios.head(url, {
          timeout: this.timeout,
          validateStatus: (status) => status < 500,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)'
          }
        });

        if (response.status >= 200 && response.status < 400) {
          console.log(chalk.gray(`${progress} ✓ External: ${url} (${response.status})`));
          this.checkedUrls.set(url, { success: true });
          return;
        } else {
          lastError = `HTTP ${response.status}`;
        }
      } catch (error) {
        lastError = error.code || error.message;
        
        // Try GET if HEAD fails
        if (attempts === 1 && error.code === 'ECONNREFUSED') {
          try {
            const response = await axios.get(url, {
              timeout: this.timeout,
              validateStatus: (status) => status < 500,
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)'
              }
            });

            if (response.status >= 200 && response.status < 400) {
              console.log(chalk.gray(`${progress} ✓ External: ${url} (${response.status})`));
              this.checkedUrls.set(url, { success: true });
              return;
            }
          } catch (getError) {
            lastError = getError.code || getError.message;
          }
        }
      }

      if (attempts < this.retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Failed after retries
    console.log(chalk.red(`${progress} ✗ External: ${url} (${lastError})`));
    this.checkedUrls.set(url, { success: false, error: lastError });
    
    locations.forEach(location => {
      this.errors.push({
        type: 'external',
        url,
        file: location.file,
        line: location.line,
        error: lastError
      });
    });
  }

  getTotalFileCount() {
    const files = new Set();
    for (const locations of this.links.values()) {
      locations.forEach(loc => files.add(loc.file));
    }
    return files.size;
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalLinks: this.links.size,
        filesScanned: this.getTotalFileCount(),
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings
    };

    // Save report to file
    const reportPath = path.join(this.rootDir, 'link-validation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    
    console.log(chalk.cyan(`\n📊 Validation Report saved to: ${reportPath}`));
    
    // Print summary
    console.log(chalk.cyan('\nSummary:'));
    console.log(chalk.white(`  Total links checked: ${report.summary.totalLinks}`));
    console.log(chalk.white(`  Files scanned: ${report.summary.filesScanned}`));
    
    if (report.summary.errors > 0) {
      console.log(chalk.red(`  Errors found: ${report.summary.errors}`));
      
      // Print first 10 errors
      console.log(chalk.red('\nFirst 10 errors:'));
      this.errors.slice(0, 10).forEach(error => {
        console.log(chalk.red(`  - ${error.url}`));
        console.log(chalk.gray(`    in ${path.relative(this.rootDir, error.file)}:${error.line}`));
        console.log(chalk.gray(`    ${error.error}`));
      });
      
      if (this.errors.length > 10) {
        console.log(chalk.red(`  ... and ${this.errors.length - 10} more errors`));
      }
    } else {
      console.log(chalk.green(`  Errors found: 0`));
    }
    
    if (report.summary.warnings > 0) {
      console.log(chalk.yellow(`  Warnings: ${report.summary.warnings}`));
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--whitelist':
        options.whitelist = args[++i].split(',');
        break;
      case '--blacklist':
        options.blacklist = args[++i].split(',');
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--retries':
        options.retries = parseInt(args[++i]);
        break;
      case '--patterns':
        options.patterns = args[++i].split(',');
        break;
      case '--help':
        console.log(`
Link Validator - Validate internal and external links

Usage:
  node validate-links.js [options]

Options:
  --whitelist <domains>  Comma-separated list of whitelisted domains
  --blacklist <patterns> Comma-separated list of blacklisted URL patterns
  --timeout <ms>         Timeout for external link checks (default: 5000)
  --retries <n>          Number of retries for external links (default: 2)
  --patterns <patterns>  Comma-separated glob patterns for files to scan
  --help                 Show this help message

Examples:
  node validate-links.js
  node validate-links.js --whitelist "github.com,google.com"
  node validate-links.js --timeout 10000 --retries 3
        `);
        process.exit(0);
    }
  }

  const validator = new LinkValidator(options);
  await validator.validate();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = LinkValidator;