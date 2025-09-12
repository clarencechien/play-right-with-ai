/**
 * Build System Test Suite
 * 
 * Tests for the content build and generation system
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

describe('Build System', () => {
  let BuildSystem;
  // ContentPipeline is defined but not used in current tests
  // let ContentPipeline;
  
  beforeAll(() => {
    // These will be the actual modules when implemented
    try {
      BuildSystem = require('../../scripts/build-system');
      // ContentPipeline = require('../../scripts/content-pipeline');
    } catch {
      // Use mocks from setup.js
      BuildSystem = jest.requireMock('../../scripts/build-system');
      // ContentPipeline = jest.requireMock('../../scripts/content-pipeline');
    }
  });
  
  describe('Build Configuration', () => {
    test('should load build configuration from YAML', () => {
      const configPath = path.join(__dirname, '../fixtures/content/test-config.yaml');
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
      
      expect(config.version).toBe('1.0.0');
      expect(config.language).toBe('zh-TW');
      expect(config.build.source).toBe('content/chapters');
      expect(config.build.outputs).toHaveLength(3);
    });
    
    test('should validate configuration schema', () => {
      const buildSystem = new BuildSystem();
      
      const validConfig = {
        version: '1.0.0',
        build: {
          source: 'content/chapters',
          outputs: [{ format: 'html', destination: 'docs' }]
        }
      };
      
      const invalidConfig = {
        version: '1.0.0'
        // Missing required 'build' field
      };
      
      expect(buildSystem.validateConfig(validConfig)).toBe(true);
      expect(() => buildSystem.validateConfig(invalidConfig)).toThrow(/Missing required field: build/);
    });
    
    test('should merge default configuration', () => {
      const buildSystem = new BuildSystem();
      
      const userConfig = {
        build: {
          source: 'custom/path'
        }
      };
      
      const merged = buildSystem.mergeWithDefaults(userConfig);
      
      expect(merged.build.source).toBe('custom/path');
      expect(merged.processing).toBeDefined(); // From defaults
      expect(merged.validation).toBeDefined(); // From defaults
    });
  });
  
  describe('Chapter Discovery', () => {
    test('should discover all chapter directories', async () => {
      const buildSystem = new BuildSystem();
      const chapters = await buildSystem.discoverChapters('content/chapters');
      
      expect(chapters).toContain('01-ai-conductor');
      expect(chapters).toContain('02-first-movement');
      expect(chapters).toContain('08-capstone');
      expect(chapters).toHaveLength(8);
    });
    
    test('should filter unpublished chapters', async () => {
      const buildSystem = new BuildSystem({
        includeUnpublished: false
      });
      
      const chapters = await buildSystem.discoverChapters('content/chapters');
      
      // Assuming all are published in the config
      expect(chapters).toHaveLength(8);
    });
    
    test('should sort chapters by order', async () => {
      const buildSystem = new BuildSystem();
      const chapters = await buildSystem.discoverChapters('content/chapters');
      
      expect(chapters[0]).toBe('01-ai-conductor');
      expect(chapters[7]).toBe('08-capstone');
    });
  });
  
  describe('Content Processing', () => {
    test('should process markdown with all features', async () => {
      const buildSystem = new BuildSystem({
        processing: {
          markdown: { breaks: true, linkify: true },
          highlighting: { enabled: true },
          toc: { enabled: true }
        }
      });
      
      const content = `---
title: Test
---

# Main Title

## Section 1

This is a paragraph with a link: https://example.com

\`\`\`javascript
const code = "highlighted";
\`\`\`

## Section 2

Another section.
`;
      
      const result = await buildSystem.processContent(content);
      
      expect(result.metadata.title).toBe('Test');
      expect(result.html).toContain('<h1>Main Title</h1>');
      expect(result.html).toContain('<a href="https://example.com">');
      expect(result.html).toContain('hljs');
      expect(result.toc).toHaveLength(2);
    });
    
    test('should handle processing errors gracefully', async () => {
      const buildSystem = new BuildSystem();
      
      const invalidContent = `---
title: "Unclosed quote
---

Content`;
      
      const result = await buildSystem.processContent(invalidContent, {
        failOnError: false
      });
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatch(/YAML parsing error/);
      expect(result.html).toBeDefined(); // Still processes content
    });
  });
  
  describe('Output Generation', () => {
    test('should generate HTML output', async () => {
      const buildSystem = new BuildSystem();
      
      const processed = {
        metadata: { title: { zh: '測試' } },
        html: '<h1>Test</h1>',
        toc: []
      };
      
      const output = await buildSystem.generateOutput(processed, {
        format: 'html',
        template: 'default'
      });
      
      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('<h1>Test</h1>');
      expect(output).toContain('測試');
    });
    
    test('should generate Markdown output', async () => {
      const buildSystem = new BuildSystem();
      
      const processed = {
        metadata: { title: { zh: '測試' } },
        markdown: '# Test',
        toc: []
      };
      
      const output = await buildSystem.generateOutput(processed, {
        format: 'markdown',
        includeMetadata: true
      });
      
      expect(output).toContain('<!-- Generated from:');
      expect(output).toContain('# Test');
    });
    
    test('should generate JSON output', async () => {
      const buildSystem = new BuildSystem();
      
      const processed = {
        metadata: { chapter: 1 },
        html: '<h1>Test</h1>',
        markdown: '# Test',
        toc: [{ level: 1, text: 'Test', id: 'test' }]
      };
      
      const output = await buildSystem.generateOutput(processed, {
        format: 'json'
      });
      
      const parsed = JSON.parse(output);
      expect(parsed.metadata.chapter).toBe(1);
      expect(parsed.content.html).toBe('<h1>Test</h1>');
      expect(parsed.toc).toHaveLength(1);
    });
    
    test('should apply minification when enabled', async () => {
      const buildSystem = new BuildSystem({
        output: {
          minify: { html: true, css: true, js: true }
        }
      });
      
      const processed = {
        html: `
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                }
              </style>
            </head>
            <body>
              <h1>Test</h1>
            </body>
          </html>
        `
      };
      
      const output = await buildSystem.generateOutput(processed, {
        format: 'html',
        minify: true
      });
      
      expect(output).not.toContain('\n');
      expect(output.length).toBeLessThan(processed.html.length);
    });
  });
  
  describe('File Writing', () => {
    test('should write files to correct destinations', async () => {
      const buildSystem = new BuildSystem();
      const outputDir = path.join(__dirname, '../../tmp/test-output');
      
      await buildSystem.writeOutput({
        content: '<h1>Test</h1>',
        destination: path.join(outputDir, 'test.html')
      });
      
      const written = fs.readFileSync(path.join(outputDir, 'test.html'), 'utf8');
      expect(written).toBe('<h1>Test</h1>');
    });
    
    test('should create directories if they do not exist', async () => {
      const buildSystem = new BuildSystem();
      const deepPath = path.join(__dirname, '../../tmp/test-output/deep/nested/path');
      
      await buildSystem.writeOutput({
        content: 'test',
        destination: path.join(deepPath, 'file.txt')
      });
      
      expect(fs.existsSync(deepPath)).toBe(true);
      expect(fs.existsSync(path.join(deepPath, 'file.txt'))).toBe(true);
    });
    
    test('should handle write permissions errors', async () => {
      const buildSystem = new BuildSystem();
      
      // Try to write to a read-only location
      await expect(buildSystem.writeOutput({
        content: 'test',
        destination: '/root/unauthorized.txt'
      })).rejects.toThrow(/Permission denied|EACCES/);
    });
  });
  
  describe('Incremental Builds', () => {
    test('should detect changed files', async () => {
      const buildSystem = new BuildSystem({ incremental: true });
      
      // First build
      await buildSystem.build();
      
      // Modify a file (simulated)
      const testFile = path.join(__dirname, '../../tmp/test-content.md');
      fs.writeFileSync(testFile, '# Modified', 'utf8');
      
      // Second build
      const result = await buildSystem.build();
      
      expect(result.rebuilt).toContain('test-content.md');
      expect(result.skipped.length).toBeGreaterThan(0);
    });
    
    test('should use cached results for unchanged files', async () => {
      const buildSystem = new BuildSystem({
        incremental: true,
        cache: { enabled: true }
      });
      
      const content = '# Unchanged Content';
      
      // First process
      const result1 = await buildSystem.processContent(content);
      
      // Second process - should use cache
      const start = Date.now();
      const result2 = await buildSystem.processContent(content);
      const duration = Date.now() - start;
      
      expect(result2).toEqual(result1);
      expect(duration).toBeLessThan(10); // Cache hit should be very fast
    });
    
    test('should invalidate cache on configuration change', async () => {
      const buildSystem = new BuildSystem({
        incremental: true,
        cache: { enabled: true }
      });
      
      const content = '# Test Content';
      
      // First build with one config
      await buildSystem.processContent(content, { toc: false });
      
      // Second build with different config
      const result = await buildSystem.processContent(content, { toc: true });
      
      expect(result.toc).toBeDefined();
    });
  });
  
  describe('Parallel Processing', () => {
    test('should process multiple chapters in parallel', async () => {
      const buildSystem = new BuildSystem({
        parallel: true,
        maxWorkers: 4
      });
      
      const chapters = [
        '01-ai-conductor',
        '02-first-movement',
        '03-second-movement',
        '04-third-movement'
      ];
      
      const start = Date.now();
      const results = await buildSystem.buildChapters(chapters);
      const duration = Date.now() - start;
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Parallel should be faster than sequential
      const sequentialEstimate = chapters.length * 200;
      expect(duration).toBeLessThan(sequentialEstimate);
    });
    
    test('should handle errors in parallel processing', async () => {
      const buildSystem = new BuildSystem({
        parallel: true,
        continueOnError: true
      });
      
      const chapters = [
        '01-ai-conductor',
        'invalid-chapter',
        '03-second-movement'
      ];
      
      const results = await buildSystem.buildChapters(chapters);
      
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
      expect(results[2].success).toBe(true);
    });
  });
  
  describe('Watch Mode', () => {
    test('should detect file changes in watch mode', async (done) => {
      const buildSystem = new BuildSystem({ watch: true });
      
      // changeDetected variable removed as it's not used
      
      buildSystem.on('change', (file) => {
        expect(file).toContain('watch-test.md');
        buildSystem.stop();
        done();
      });
      
      await buildSystem.start();
      
      // Simulate file change
      setTimeout(() => {
        const testFile = path.join(__dirname, '../../tmp/watch-test.md');
        fs.writeFileSync(testFile, '# Changed', 'utf8');
      }, 100);
    });
    
    test('should rebuild on file change', async (done) => {
      const buildSystem = new BuildSystem({ watch: true });
      
      buildSystem.on('rebuild', (result) => {
        expect(result.file).toContain('watch-rebuild.md');
        expect(result.success).toBe(true);
        buildSystem.stop();
        done();
      });
      
      await buildSystem.start();
      
      // Simulate file change
      setTimeout(() => {
        const testFile = path.join(__dirname, '../../tmp/watch-rebuild.md');
        fs.writeFileSync(testFile, '# Rebuild Test', 'utf8');
      }, 100);
    });
  });
  
  describe('Error Handling and Recovery', () => {
    test('should rollback on build failure', async () => {
      const buildSystem = new BuildSystem({ atomic: true });
      
      // backupDir is not used in the test
      // const backupDir = path.join(__dirname, '../../tmp/backup');
      const outputDir = path.join(__dirname, '../../tmp/output');
      
      // Create initial state
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, 'existing.html'), 'Original', 'utf8');
      
      // Attempt build that will fail
      await expect(
        buildSystem.build({
          chapters: ['01-ai-conductor', 'invalid-chapter']
        })
      ).rejects.toThrow();
      
      // Build failed - check rollback
      const content = fs.readFileSync(path.join(outputDir, 'existing.html'), 'utf8');
      expect(content).toBe('Original'); // Should be unchanged
    });
    
    test('should provide detailed error reporting', async () => {
      const buildSystem = new BuildSystem();
      
      await expect(
        buildSystem.processContent('---\ninvalid: yaml: content\n---')
      ).rejects.toMatchObject({
        message: expect.stringContaining('YAML'),
        file: expect.anything(),
        line: expect.anything(),
        column: expect.anything()
      });
    });
    
    test('should handle out of memory gracefully', async () => {
      const buildSystem = new BuildSystem({
        memoryLimit: 100 // MB
      });
      
      // Try to process very large content
      const hugeContent = 'x'.repeat(200 * 1024 * 1024); // 200MB
      
      await expect(buildSystem.processContent(hugeContent))
        .rejects.toThrow(/Memory limit exceeded/);
    });
  });
  
  describe('Build Metrics and Reporting', () => {
    test('should collect build metrics', async () => {
      const buildSystem = new BuildSystem({ metrics: true });
      
      const result = await buildSystem.build();
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalTime).toBeGreaterThan(0);
      expect(result.metrics.filesProcessed).toBeGreaterThan(0);
      expect(result.metrics.totalSize).toBeGreaterThan(0);
      expect(result.metrics.averageTime).toBeGreaterThan(0);
    });
    
    test('should generate build report', async () => {
      const buildSystem = new BuildSystem();
      
      const result = await buildSystem.build();
      const report = buildSystem.generateReport(result);
      
      expect(report).toContain('Build Summary');
      expect(report).toContain('Chapters Built:');
      expect(report).toContain('Total Time:');
      expect(report).toContain('Success Rate:');
    });
    
    test('should export metrics in different formats', async () => {
      const buildSystem = new BuildSystem();
      
      const metrics = {
        totalTime: 1234,
        filesProcessed: 8,
        errors: 0
      };
      
      const json = buildSystem.exportMetrics(metrics, 'json');
      expect(JSON.parse(json).totalTime).toBe(1234);
      
      const csv = buildSystem.exportMetrics(metrics, 'csv');
      expect(csv).toContain('totalTime,filesProcessed,errors');
      expect(csv).toContain('1234,8,0');
    });
  });
});