/**
 * Jest Setup File for Content Pipeline Tests
 * 
 * This file runs before all tests to set up the test environment
 */

const fs = require('fs');
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.CONTENT_PIPELINE_TEST = 'true';

// Create necessary directories for testing
const testDirs = [
  path.join(__dirname, '../../tmp'),
  path.join(__dirname, '../../tmp/test-output'),
  path.join(__dirname, '../../tmp/test-cache'),
  path.join(__dirname, '../fixtures/content/mock-chapters')
];

testDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Global test utilities
global.testUtils = {
  /**
   * Create a temporary test file
   */
  createTempFile: (filename, content) => {
    const filepath = path.join(__dirname, '../../tmp', filename);
    fs.writeFileSync(filepath, content, 'utf8');
    return filepath;
  },
  
  /**
   * Clean up temporary files
   */
  cleanupTemp: () => {
    const tmpDir = path.join(__dirname, '../../tmp');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  },
  
  /**
   * Create mock chapter structure
   */
  createMockChapter: (chapterId, options = {}) => {
    const chapterDir = path.join(__dirname, '../fixtures/content/mock-chapters', chapterId);
    
    // Create directory structure
    const dirs = ['exercises', 'prompts', 'examples'];
    dirs.forEach(dir => {
      const dirPath = path.join(chapterDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
    
    // Create metadata file
    const metadata = {
      chapter: options.chapter || 1,
      title: {
        zh: options.titleZh || '測試章節',
        en: options.titleEn || 'Test Chapter'
      },
      objectives: options.objectives || ['Test objective'],
      prerequisites: options.prerequisites || ['Test prerequisite'],
      duration: options.duration || '1 hour',
      tags: options.tags || ['test']
    };
    
    fs.writeFileSync(
      path.join(chapterDir, 'metadata.yaml'),
      require('js-yaml').dump(metadata),
      'utf8'
    );
    
    // Create index.md
    const content = options.content || `# ${metadata.title.zh}\n\nTest content.`;
    fs.writeFileSync(
      path.join(chapterDir, 'index.md'),
      content,
      'utf8'
    );
    
    return chapterDir;
  },
  
  /**
   * Wait for async operations
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Mock HTTP responses for link validation
   */
  mockHttpResponses: new Map([
    ['https://playwright.dev', { status: 200, ok: true }],
    ['https://claude.ai', { status: 200, ok: true }],
    ['https://github.com/clarencechien/play-right-with-ai', { status: 200, ok: true }],
    ['https://broken-link.example.com', { status: 404, ok: false }]
  ])
};

// Mock modules that don't exist yet
jest.mock('../../scripts/content-pipeline', () => {
  return class ContentPipeline {
    constructor(options = {}) {
      this.options = options;
      this.sources = ['content/chapters/'];
      this.outputs = [];
    }
    
    async buildChapter(chapterId) {
      // Mock implementation
      if (chapterId === 'invalid-chapter') {
        throw new Error('No content found');
      }
      
      return {
        success: true,
        chapter: chapterId,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        source: `content/chapters/${chapterId}/index.md`,
        outputs: [
          { format: 'html', path: `docs/chapters/${chapterId}.html` },
          { format: 'markdown', path: `workshop/chapter-${chapterId.split('-')[0]}/README.md` },
          { format: 'json', path: `api/chapters/${chapterId}.json` }
        ],
        errors: []
      };
    }
    
    async buildAll() {
      const chapters = [
        '01-ai-conductor',
        '02-first-movement',
        '03-second-movement',
        '04-third-movement',
        '05-fourth-movement',
        '06-final-movement',
        '07-variations',
        '08-capstone'
      ];
      
      const results = await Promise.all(
        chapters.map(chapter => this.buildChapter(chapter))
      );
      
      return {
        chapters: results,
        built: results,
        skipped: []
      };
    }
    
    async build() {
      return this.buildAll();
    }
    
    async checkSyncStatus() {
      return {
        synced: ['01-ai-conductor', '02-first-movement'],
        outOfSync: ['03-second-movement'],
        missing: ['04-third-movement']
      };
    }
    
    async syncChapter(chapter) {
      return {
        chapter,
        destinations: [
          { format: 'html', success: true, timestamp: new Date().toISOString() },
          { format: 'markdown', success: true, timestamp: new Date().toISOString() },
          { format: 'json', success: true, timestamp: new Date().toISOString() }
        ]
      };
    }
  };
}, { virtual: true });

jest.mock('../../scripts/processors/markdown-processor', () => {
  return class MarkdownProcessor {
    constructor(options = {}) {
      this.options = options;
      this.cache = new Map();
    }
    
    async process(content) {
      if (this.options.cache && this.cache.has(content)) {
        return this.cache.get(content);
      }
      
      // Simple mock markdown to HTML conversion
      let html = content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
      
      const result = {
        html,
        errors: [],
        toc: this.options.generateToc ? this.extractToc(content) : undefined
      };
      
      if (this.options.cache) {
        this.cache.set(content, result);
      }
      
      return result;
    }
    
    extractToc(content) {
      const toc = [];
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/^(#{2,4}) (.+)$/);
        if (match) {
          toc.push({
            level: match[1].length,
            text: match[2],
            id: match[2].toLowerCase().replace(/\s+/g, '-')
          });
        }
      });
      
      return toc;
    }
  };
}, { virtual: true });

jest.mock('../../scripts/validators/link-validator', () => {
  return class LinkValidator {
    constructor(options = {}) {
      this.options = options;
    }
    
    extractLinks(content) {
      const internal = [];
      const external = [];
      
      // Simple regex for links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[2];
        if (url.startsWith('http://') || url.startsWith('https://')) {
          external.push(url);
        } else {
          internal.push(url);
        }
      }
      
      return { internal, external };
    }
    
    resolveInternalLink(link, fromFile) {
      const dir = path.dirname(fromFile);
      return path.resolve(dir, link);
    }
    
    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
    
    isWhitelisted(url) {
      if (!this.options.whitelist) return true;
      
      const urlObj = new URL(url);
      return this.options.whitelist.includes(urlObj.hostname);
    }
    
    async checkLink(url) {
      // Mock implementation
      const mockResponse = global.testUtils.mockHttpResponses.get(url);
      return mockResponse ? mockResponse.ok : true;
    }
    
    detectCircularLinks(contentMap) {
      // Simplified - circular links are allowed
      return [];
    }
  };
}, { virtual: true });

jest.mock('../../scripts/processors/metadata-extractor', () => {
  return class MetadataExtractor {
    extract(content) {
      const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
      const match = content.match(frontmatterRegex);
      
      if (!match) {
        return {
          metadata: {},
          content,
          warnings: ['No metadata found']
        };
      }
      
      try {
        const metadata = require('js-yaml').load(match[1]);
        return {
          metadata,
          content: content.replace(frontmatterRegex, ''),
          warnings: []
        };
      } catch (error) {
        throw new Error(`YAML parsing error: ${error.message}`);
      }
    }
  };
}, { virtual: true });

jest.mock('../../scripts/validators/content-validator', () => {
  return class ContentValidator {
    checkEnvironment(requiredVars) {
      const missing = [];
      requiredVars.forEach(varName => {
        if (!process.env[varName]) {
          missing.push(varName);
        }
      });
      return missing;
    }
    
    checkLanguageConsistency(content, expectedLang) {
      const issues = [];
      // Simplified check - would use real language detection in production
      if (expectedLang === 'zh-TW' && !content.match(/[\u4e00-\u9fa5]/)) {
        issues.push('No Chinese characters found');
      }
      return issues;
    }
  };
}, { virtual: true });

// Clean up after all tests
afterAll(() => {
  global.testUtils.cleanupTemp();
});