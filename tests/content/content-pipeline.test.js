/**
 * Content Pipeline Test Suite
 * Test-Driven Development for Workshop Content Architecture
 * 
 * These tests are written FIRST, before implementation.
 * They define the expected behavior of the content pipeline system.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

// Import future modules (to be implemented)
let ContentPipeline;
let MarkdownProcessor;
let LinkValidator;
let MetadataExtractor;
let ContentValidator;
let BuildSystem;

// Mock these imports until they exist
try {
  ContentPipeline = require('../../scripts/content-pipeline');
  MarkdownProcessor = require('../../scripts/processors/markdown-processor');
  LinkValidator = require('../../scripts/validators/link-validator');
  MetadataExtractor = require('../../scripts/processors/metadata-extractor');
  ContentValidator = require('../../scripts/validators/content-validator');
  BuildSystem = require('../../scripts/build-system');
} catch (e) {
  // Modules don't exist yet - this is expected in TDD
}

describe('Content Pipeline Architecture', () => {
  const CONTENT_DIR = path.join(__dirname, '../../content');
  const FIXTURES_DIR = path.join(__dirname, '../fixtures/content');
  const OUTPUT_DIR = path.join(__dirname, '../../tmp/test-output');

  beforeAll(() => {
    // Create output directory for tests
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test output
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  describe('Content Structure Validation', () => {
    test('should have required directory structure', () => {
      // Test that content directory exists with proper structure
      const requiredDirs = [
        'content/chapters',
        'content/templates',
        'content/config.yaml'
      ];

      requiredDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (dir.endsWith('.yaml')) {
          expect(() => fs.accessSync(fullPath)).not.toThrow();
        } else {
          expect(fs.existsSync(fullPath)).toBeTruthy();
        }
      });
    });

    test('all chapters should have required metadata', async () => {
      const chapterDirs = await glob('content/chapters/*/');
      
      chapterDirs.forEach(chapterDir => {
        const metadataPath = path.join(chapterDir, 'metadata.yaml');
        expect(fs.existsSync(metadataPath)).toBeTruthy();
        
        const metadata = yaml.load(fs.readFileSync(metadataPath, 'utf8'));
        
        // Required fields
        expect(metadata).toHaveProperty('chapter');
        expect(metadata).toHaveProperty('title');
        expect(metadata.title).toHaveProperty('zh');
        expect(metadata.title).toHaveProperty('en');
        expect(metadata).toHaveProperty('objectives');
        expect(Array.isArray(metadata.objectives)).toBeTruthy();
        expect(metadata.objectives.length).toBeGreaterThan(0);
        expect(metadata).toHaveProperty('prerequisites');
        expect(metadata).toHaveProperty('duration');
        expect(metadata).toHaveProperty('tags');
        expect(Array.isArray(metadata.tags)).toBeTruthy();
      });
    });

    test('each chapter should have required content files', async () => {
      const chapterDirs = await glob('content/chapters/*/');
      
      chapterDirs.forEach(chapterDir => {
        const requiredFiles = [
          'index.md',      // Main chapter content
          'metadata.yaml', // Chapter metadata
        ];
        
        const requiredDirs = [
          'exercises',     // Exercise files
          'prompts',       // AI prompts
          'examples'       // Code examples
        ];
        
        requiredFiles.forEach(file => {
          const filePath = path.join(chapterDir, file);
          expect(fs.existsSync(filePath)).toBeTruthy();
        });
        
        requiredDirs.forEach(dir => {
          const dirPath = path.join(chapterDir, dir);
          expect(fs.existsSync(dirPath)).toBeTruthy();
        });
      });
    });

    test('content templates should exist and be valid', () => {
      const templates = [
        'content/templates/chapter.template.md',
        'content/templates/exercise.template.md',
        'content/templates/prompt.template.md'
      ];
      
      templates.forEach(template => {
        const templatePath = path.join(process.cwd(), template);
        expect(fs.existsSync(templatePath)).toBeTruthy();
        
        const content = fs.readFileSync(templatePath, 'utf8');
        // Templates should have placeholders
        expect(content).toMatch(/\{\{.*\}\}/);
      });
    });
  });

  describe('No Duplicate Content', () => {
    test('should not have duplicate content across sources', async () => {
      const contentSources = [
        'docs/chapters/*.html',
        'workshop/chapter-*/README.md',
        'content/chapters/*/index.md'
      ];
      
      const contentMap = new Map();
      const duplicates = [];
      
      for (const pattern of contentSources) {
        const files = await glob(pattern);
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          // Create content hash or fingerprint
          const contentHash = createContentHash(content);
          
          if (contentMap.has(contentHash)) {
            duplicates.push({
              original: contentMap.get(contentHash),
              duplicate: file,
              hash: contentHash
            });
          } else {
            contentMap.set(contentHash, file);
          }
        });
      }
      
      expect(duplicates).toHaveLength(0);
    });

    test('content should have single source of truth', async () => {
      // All generated content should track its source
      const generatedFiles = await glob('docs/chapters/*.html');
      
      generatedFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Should have source metadata comment
        expect(content).toMatch(/<!-- Source: content\/chapters\/.*\/index.md -->/);
      });
    });

    test('workshop materials should be generated from content', async () => {
      const workshopFiles = await glob('workshop/chapter-*/README.md');
      
      workshopFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Should have generation metadata
        expect(content).toMatch(/<!-- Generated from: content\/chapters\/.* -->/);
        // Should not be manually edited
        expect(content).toMatch(/<!-- DO NOT EDIT: This file is auto-generated -->/);
      });
    });
  });

  describe('Link Validation', () => {
    test('all internal links should resolve correctly', async () => {
      const linkValidator = new LinkValidator();
      const contentFiles = await glob('content/chapters/*/index.md');
      const brokenLinks = [];
      
      for (const file of contentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const links = linkValidator.extractLinks(content);
        
        for (const link of links.internal) {
          const resolved = linkValidator.resolveInternalLink(link, file);
          if (!fs.existsSync(resolved)) {
            brokenLinks.push({
              file,
              link,
              resolved,
              type: 'internal'
            });
          }
        }
      }
      
      expect(brokenLinks).toHaveLength(0);
    });

    test('external links should be valid URLs', async () => {
      const linkValidator = new LinkValidator();
      const contentFiles = await glob('content/chapters/*/index.md');
      const invalidLinks = [];
      
      for (const file of contentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const links = linkValidator.extractLinks(content);
        
        for (const link of links.external) {
          if (!linkValidator.isValidUrl(link)) {
            invalidLinks.push({
              file,
              link,
              type: 'external'
            });
          }
        }
      }
      
      expect(invalidLinks).toHaveLength(0);
    });

    test('should validate whitelisted external domains', async () => {
      const linkValidator = new LinkValidator({
        whitelist: ['github.com', 'playwright.dev', 'claude.ai']
      });
      
      const contentFiles = await glob('content/chapters/*/index.md');
      const nonWhitelistedLinks = [];
      
      for (const file of contentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const links = linkValidator.extractLinks(content);
        
        for (const link of links.external) {
          if (!linkValidator.isWhitelisted(link)) {
            nonWhitelistedLinks.push({
              file,
              link,
              reason: 'not-whitelisted'
            });
          }
        }
      }
      
      // Report but don't fail - this is informational
      if (nonWhitelistedLinks.length > 0) {
        console.warn('Non-whitelisted external links found:', nonWhitelistedLinks);
      }
    });

    test('should check for dead links (with caching)', async () => {
      const linkValidator = new LinkValidator({
        checkExternal: true,
        timeout: 5000,
        cache: true
      });
      
      const contentFiles = await glob('content/chapters/*/index.md');
      const deadLinks = [];
      
      for (const file of contentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const links = linkValidator.extractLinks(content);
        
        for (const link of links.external) {
          const isAlive = await linkValidator.checkLink(link);
          if (!isAlive) {
            deadLinks.push({
              file,
              link,
              status: 'dead'
            });
          }
        }
      }
      
      expect(deadLinks).toHaveLength(0);
    });
  });

  describe('Build Process', () => {
    test('should generate HTML from Markdown content', async () => {
      const processor = new MarkdownProcessor();
      const testContent = `# Test Chapter

## Learning Objectives
- Objective 1
- Objective 2

## Content
This is test content with **bold** and *italic* text.

\`\`\`javascript
const test = 'code block';
\`\`\`
`;
      
      const result = await processor.process(testContent);
      
      expect(result.html).toContain('<h1>Test Chapter</h1>');
      expect(result.html).toContain('<h2>Learning Objectives</h2>');
      expect(result.html).toContain('<strong>bold</strong>');
      expect(result.html).toContain('<em>italic</em>');
      expect(result.html).toContain('<pre><code class="language-javascript">');
      expect(result.errors).toHaveLength(0);
    });

    test('should extract and process frontmatter', async () => {
      const processor = new MetadataExtractor();
      const testContent = `---
chapter: 1
title:
  zh: "測試章節"
  en: "Test Chapter"
objectives:
  - "Objective 1"
  - "Objective 2"
---

# Chapter Content
`;
      
      const result = await processor.extract(testContent);
      
      expect(result.metadata.chapter).toBe(1);
      expect(result.metadata.title.zh).toBe("測試章節");
      expect(result.metadata.title.en).toBe("Test Chapter");
      expect(result.metadata.objectives).toHaveLength(2);
      expect(result.content).not.toContain('---');
    });

    test('should generate table of contents', async () => {
      const processor = new MarkdownProcessor({ generateToc: true });
      const testContent = `# Main Title

## Section 1
### Subsection 1.1
### Subsection 1.2

## Section 2
### Subsection 2.1
`;
      
      const result = await processor.process(testContent);
      
      expect(result.toc).toBeDefined();
      expect(result.toc).toHaveLength(5);
      expect(result.toc[0]).toMatchObject({
        level: 2,
        text: 'Section 1',
        id: 'section-1'
      });
    });

    test('should apply syntax highlighting to code blocks', async () => {
      const processor = new MarkdownProcessor({ highlight: true });
      const testContent = `
\`\`\`javascript
function test() {
  return "highlighted";
}
\`\`\`
`;
      
      const result = await processor.process(testContent);
      
      expect(result.html).toContain('hljs');
      expect(result.html).toContain('language-javascript');
      expect(result.html).toContain('<span class="hljs-keyword">function</span>');
    });

    test('should sync content to all destinations', async () => {
      const pipeline = new ContentPipeline();
      const chapterId = '01-ai-conductor';
      
      await pipeline.buildChapter(chapterId);
      
      // Check all output destinations
      const outputs = [
        `docs/chapters/${chapterId}.html`,
        `workshop/chapter-01/README.md`,
        `api/chapters/${chapterId}.json`
      ];
      
      outputs.forEach(output => {
        const outputPath = path.join(process.cwd(), output);
        expect(fs.existsSync(outputPath)).toBeTruthy();
        
        const content = fs.readFileSync(outputPath, 'utf8');
        expect(content.length).toBeGreaterThan(0);
      });
    });

    test('should maintain content version tracking', async () => {
      const pipeline = new ContentPipeline();
      const chapterId = '01-ai-conductor';
      
      const result = await pipeline.buildChapter(chapterId);
      
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.source).toBe(`content/chapters/${chapterId}/index.md`);
      expect(result.outputs).toBeDefined();
      expect(Array.isArray(result.outputs)).toBeTruthy();
    });
  });

  describe('Error Cases and Edge Conditions', () => {
    test('should handle missing metadata gracefully', async () => {
      const processor = new MetadataExtractor();
      const contentWithoutMetadata = '# Chapter without frontmatter';
      
      const result = await processor.extract(contentWithoutMetadata);
      
      expect(result.metadata).toEqual({});
      expect(result.content).toBe(contentWithoutMetadata);
      expect(result.warnings).toContain('No metadata found');
    });

    test('should handle malformed YAML metadata', async () => {
      const processor = new MetadataExtractor();
      const malformedContent = `---
chapter: 1
title:
  zh: "Missing quote
  en: "Test"
---
Content`;
      
      expect(() => processor.extract(malformedContent)).toThrow(/YAML parsing error/);
    });

    test('should handle circular internal links', async () => {
      const validator = new LinkValidator();
      const content1 = '[Link to 2](./chapter-02.md)';
      const content2 = '[Link to 1](./chapter-01.md)';
      
      const circular = validator.detectCircularLinks({
        'chapter-01.md': content1,
        'chapter-02.md': content2
      });
      
      expect(circular).toHaveLength(0); // Circular links are allowed but tracked
    });

    test('should handle empty content directories', async () => {
      const pipeline = new ContentPipeline();
      const emptyDir = path.join(FIXTURES_DIR, 'empty-chapter');
      
      fs.mkdirSync(emptyDir, { recursive: true });
      
      await expect(pipeline.buildChapter('empty-chapter')).rejects.toThrow(/No content found/);
      
      fs.rmSync(emptyDir, { recursive: true });
    });

    test('should handle very large content files', async () => {
      const processor = new MarkdownProcessor();
      const largeContent = '# Large File\n\n' + 'Content line\n'.repeat(10000);
      
      const startTime = Date.now();
      const result = await processor.process(largeContent);
      const processingTime = Date.now() - startTime;
      
      expect(result.html).toBeDefined();
      expect(processingTime).toBeLessThan(5000); // Should process in under 5 seconds
    });

    test('should handle special characters in content', async () => {
      const processor = new MarkdownProcessor();
      const specialContent = `# Title with 中文 and émojis 🎉

Content with <script>alert('xss')</script> and & < > " ' characters.

\`\`\`javascript
const special = "String with \\" quotes";
\`\`\`
`;
      
      const result = await processor.process(specialContent);
      
      expect(result.html).not.toContain('<script>alert');
      expect(result.html).toContain('&lt;script&gt;');
      expect(result.html).toContain('中文');
      expect(result.html).toContain('🎉');
    });

    test('should validate required environment variables', () => {
      const validator = new ContentValidator();
      const requiredEnvVars = [
        'GITHUB_REPO',
        'GA_MEASUREMENT_ID',
        'NODE_ENV'
      ];
      
      const missing = validator.checkEnvironment(requiredEnvVars);
      
      if (missing.length > 0) {
        console.warn('Missing environment variables:', missing);
      }
    });

    test('should handle concurrent builds safely', async () => {
      const pipeline = new ContentPipeline();
      const chapters = ['01-ai-conductor', '02-first-movement', '03-second-movement'];
      
      // Build all chapters concurrently
      const results = await Promise.all(
        chapters.map(chapter => pipeline.buildChapter(chapter))
      );
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBeTruthy();
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should rollback on build failure', async () => {
      const pipeline = new ContentPipeline({ atomic: true });
      const invalidChapter = 'invalid-chapter';
      
      const beforeFiles = await glob('docs/chapters/*.html');
      
      await expect(pipeline.buildChapter(invalidChapter)).rejects.toThrow();
      
      const afterFiles = await glob('docs/chapters/*.html');
      
      expect(afterFiles).toEqual(beforeFiles); // No changes on failure
    });

    test('should validate language consistency', async () => {
      const validator = new ContentValidator();
      const contentFiles = await glob('content/chapters/*/index.md');
      const inconsistencies = [];
      
      for (const file of contentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const issues = validator.checkLanguageConsistency(content, 'zh-TW');
        
        if (issues.length > 0) {
          inconsistencies.push({ file, issues });
        }
      }
      
      expect(inconsistencies).toHaveLength(0);
    });
  });

  describe('Content Synchronization', () => {
    test('should detect out-of-sync content', async () => {
      const pipeline = new ContentPipeline();
      const syncStatus = await pipeline.checkSyncStatus();
      
      expect(syncStatus.synced).toBeDefined();
      expect(syncStatus.outOfSync).toBeDefined();
      expect(syncStatus.missing).toBeDefined();
      
      if (syncStatus.outOfSync.length > 0) {
        console.warn('Out of sync files:', syncStatus.outOfSync);
      }
    });

    test('should update all destinations atomically', async () => {
      const pipeline = new ContentPipeline();
      const chapter = '01-ai-conductor';
      
      const result = await pipeline.syncChapter(chapter);
      
      expect(result.destinations).toHaveLength(3); // HTML, Markdown, JSON
      result.destinations.forEach(dest => {
        expect(dest.success).toBeTruthy();
        expect(dest.timestamp).toBeDefined();
      });
    });

    test('should preserve custom modifications in safe zones', async () => {
      const pipeline = new ContentPipeline();
      const customContent = `<!-- CUSTOM START -->
Custom content that should be preserved
<!-- CUSTOM END -->`;
      
      // Add custom content to a generated file
      const testFile = 'workshop/chapter-01/README.md';
      const originalContent = fs.readFileSync(testFile, 'utf8');
      const modifiedContent = originalContent + '\n' + customContent;
      fs.writeFileSync(testFile, modifiedContent);
      
      // Rebuild
      await pipeline.buildChapter('01-ai-conductor');
      
      // Check if custom content is preserved
      const newContent = fs.readFileSync(testFile, 'utf8');
      expect(newContent).toContain('Custom content that should be preserved');
    });
  });

  describe('Performance and Optimization', () => {
    test('should cache processed content', async () => {
      const processor = new MarkdownProcessor({ cache: true });
      const content = '# Test Content\n\nSome content here.';
      
      const start1 = Date.now();
      const result1 = await processor.process(content);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      const result2 = await processor.process(content);
      const time2 = Date.now() - start2;
      
      expect(result1.html).toBe(result2.html);
      expect(time2).toBeLessThan(time1 * 0.1); // Cached should be much faster
    });

    test('should support incremental builds', async () => {
      const pipeline = new ContentPipeline({ incremental: true });
      
      // First build - all chapters
      const fullBuild = await pipeline.build();
      expect(fullBuild.built).toHaveLength(8);
      
      // Touch only one file
      const chapterFile = 'content/chapters/01-ai-conductor/index.md';
      const content = fs.readFileSync(chapterFile, 'utf8');
      fs.writeFileSync(chapterFile, content + '\n<!-- Updated -->');
      
      // Incremental build - only changed
      const incrementalBuild = await pipeline.build();
      expect(incrementalBuild.built).toHaveLength(1);
      expect(incrementalBuild.skipped).toHaveLength(7);
    });

    test('should parallelize independent operations', async () => {
      const pipeline = new ContentPipeline({ parallel: true });
      
      const start = Date.now();
      const result = await pipeline.buildAll();
      const duration = Date.now() - start;
      
      const sequentialEstimate = result.chapters.length * 500; // Assume 500ms per chapter
      
      expect(duration).toBeLessThan(sequentialEstimate * 0.5); // At least 2x faster
    });
  });
});

// Helper function to create content hash (mock implementation)
function createContentHash(content) {
  // Simple hash for testing - real implementation would use crypto
  return content.length + '-' + content.slice(0, 100).replace(/\s+/g, '');
}

// Export test utilities for use in other test files
module.exports = {
  createContentHash,
  FIXTURES_DIR: path.join(__dirname, '../fixtures/content'),
  OUTPUT_DIR: path.join(__dirname, '../../tmp/test-output')
};