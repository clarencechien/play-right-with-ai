# Content Pipeline Test Suite

## Overview

This directory contains comprehensive Test-Driven Development (TDD) tests for the workshop content pipeline architecture. These tests are written BEFORE the implementation to guide development and ensure all requirements are met.

## Test Structure

```
tests/content/
├── content-pipeline.test.js    # Main pipeline tests
├── link-validation.test.js     # Link validation system tests
├── build-system.test.js        # Build and generation tests
├── jest.config.js              # Jest configuration
├── setup.js                    # Test environment setup
└── README.md                   # This file
```

## Test Categories

### 1. Content Structure Validation
- Validates required directory structure
- Ensures all chapters have required metadata
- Checks for required content files
- Validates templates exist and are valid

### 2. Duplicate Content Prevention
- Detects duplicate content across sources
- Ensures single source of truth
- Validates content synchronization

### 3. Link Validation
- Internal link resolution and validation
- External link checking with whitelist
- Dead link detection with caching
- Circular reference detection

### 4. Build Process
- Markdown to HTML conversion
- Frontmatter extraction and processing
- Table of contents generation
- Syntax highlighting for code blocks
- Content synchronization to all destinations

### 5. Error Handling
- Missing metadata handling
- Malformed YAML detection
- Empty content directory handling
- Large file processing
- Special character handling
- Concurrent build safety

## Running Tests

### Run All Content Pipeline Tests
```bash
npm test tests/content/content-pipeline.test.js
```

### Run Specific Test Suite
```bash
npm test tests/content/link-validation.test.js
npm test tests/content/build-system.test.js
```

### Run with Coverage
```bash
npm test -- --coverage tests/content/
```

### Watch Mode (TDD Development)
```bash
npm test -- --watch tests/content/
```

## Test Fixtures

Test fixtures are located in `tests/fixtures/content/`:

- `valid-chapter.md` - Valid chapter with all required elements
- `invalid-metadata.md` - Chapter with malformed YAML
- `no-metadata.md` - Chapter without frontmatter
- `large-content.md` - Large file for performance testing
- `special-characters.md` - Special characters and XSS testing
- `test-config.yaml` - Sample configuration file
- `*.template.md` - Content templates

## Mocked Modules

Since these tests are written before implementation (TDD), the following modules are mocked in `setup.js`:

- `ContentPipeline` - Main pipeline orchestrator
- `MarkdownProcessor` - Markdown processing engine
- `LinkValidator` - Link validation system
- `MetadataExtractor` - Frontmatter extraction
- `ContentValidator` - Content validation
- `BuildSystem` - Build orchestration

## Expected Implementation

Based on these tests, the implementation should provide:

### ContentPipeline Class
```javascript
class ContentPipeline {
  constructor(options)
  async buildChapter(chapterId)
  async buildAll()
  async checkSyncStatus()
  async syncChapter(chapter)
}
```

### MarkdownProcessor Class
```javascript
class MarkdownProcessor {
  constructor(options)
  async process(content)
  extractToc(content)
}
```

### LinkValidator Class
```javascript
class LinkValidator {
  constructor(options)
  extractLinks(content)
  resolveInternalLink(link, fromFile)
  isValidUrl(url)
  isWhitelisted(url)
  async checkLink(url)
  detectCircularLinks(contentMap)
}
```

## Coverage Goals

- **Statements**: 90%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 90%+

## CI/CD Integration

These tests should be run in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Content Pipeline Tests
  run: npm test tests/content/
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/content/lcov.info
```

## TDD Workflow

1. **Red Phase**: Run tests (they fail - no implementation yet)
   ```bash
   npm test tests/content/content-pipeline.test.js
   ```

2. **Green Phase**: Implement minimal code to pass tests
   ```bash
   # Create scripts/content-pipeline.js
   # Implement required methods
   ```

3. **Refactor Phase**: Improve code while keeping tests green
   ```bash
   # Optimize, clean up, enhance
   npm test tests/content/
   ```

## Contributing

When adding new features:

1. Write tests FIRST
2. Ensure tests fail initially
3. Implement feature to pass tests
4. Refactor if needed
5. Update this README

## Troubleshooting

### Tests Not Finding Modules
The tests are designed to work with mocked modules initially. Once real modules are implemented, remove or update the mocks in `setup.js`.

### Permission Errors
Some tests require write access to create temporary files. Ensure the test runner has appropriate permissions.

### Timeout Issues
Increase timeout in `jest.config.js` if tests timeout on slower systems:
```javascript
testTimeout: 60000 // 60 seconds
```

## Related Documentation

- [Content Pipeline Architecture](../../docs/next-step.md)
- [Project README](../../README.md)
- [Workshop Structure](../../workshop/README.md)