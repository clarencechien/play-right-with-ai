#!/usr/bin/env node

/**
 * Build Chapters Script
 * Main build script for generating HTML and Markdown files from content source
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');
const yaml = require('js-yaml');
const glob = require('glob-promise');
const chalk = require('chalk');

// Initialize Markdown processor with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && lang.length > 0) {
      try {
        const hljs = require('highlight.js');
        return hljs.highlight(str, { language: lang }).value;
      } catch (e) {
        console.warn(`Warning: Could not highlight language ${lang}`);
      }
    }
    return ''; // use external default escaping
  }
});

// Add plugins for enhanced markdown processing
md.use(require('markdown-it-anchor'), {
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '§'
}).use(require('markdown-it-toc-done-right'), {
  containerId: 'toc',
  containerClass: 'table-of-contents',
  listType: 'ul',
  listClass: 'toc-list',
  itemClass: 'toc-item',
  linkClass: 'toc-link'
});

/**
 * ChapterBuilder class handles the build process for workshop chapters
 */
class ChapterBuilder {
  /**
   * Initialize a new ChapterBuilder instance
   */
  constructor() {
    this.contentDir = path.join(process.cwd(), 'content', 'chapters');
    this.htmlOutputDir = path.join(process.cwd(), 'docs', 'chapters');
    this.workshopOutputDir = path.join(process.cwd(), 'workshop');
    this.templatesDir = path.join(process.cwd(), 'content', 'templates');
    this.indexPath = path.join(process.cwd(), 'docs', 'index.html');
    this.chapters = [];
    this.errors = [];
  }

  /**
   * Build all chapters from source content
   * @returns {Promise<void>}
   */
  async build() {
    console.info(chalk.blue('\n📚 Starting Chapter Build Process...\n'));

    try {
      // Ensure output directories exist
      await this.ensureDirectories();

      // Load all chapters
      await this.loadChapters();

      // Process each chapter
      for (const chapter of this.chapters) {
        await this.processChapter(chapter);
      }

      // Update main index.html
      await this.updateMainIndex();

      // Generate summary report
      this.generateReport();

      if (this.errors.length > 0) {
        console.error(chalk.red('\n❌ Build completed with errors:'));
        this.errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
        process.exit(1);
      }

      console.info(chalk.green('\n✅ Build completed successfully!\n'));
    } catch (error) {
      console.error(chalk.red(`\n❌ Build failed: ${error.message}`));
      process.exit(1);
    }
  }

  /**
   * Ensure all required output directories exist
   * @returns {Promise<void>}
   */
  async ensureDirectories() {
    const dirs = [
      this.htmlOutputDir,
      this.workshopOutputDir
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Load all chapters from the content directory
   * @returns {Promise<void>}
   */
  async loadChapters() {
    const chapterDirs = await glob('*/', { cwd: this.contentDir });
    
    for (const dir of chapterDirs) {
      const chapterPath = path.join(this.contentDir, dir);
      const chapterNumber = dir.match(/^(\d+)-/)?.[1];
      
      if (!chapterNumber) {
        console.warn(chalk.yellow(`Warning: Skipping directory ${dir} (no chapter number)`));
        continue;
      }

      try {
        const metadata = await this.loadMetadata(chapterPath);
        const content = await this.loadContent(chapterPath);
        
        this.chapters.push({
          number: chapterNumber,
          path: chapterPath,
          dirname: dir.replace(/\/$/, ''),
          metadata,
          content
        });
      } catch (error) {
        this.errors.push(`Failed to load chapter ${chapterNumber}: ${error.message}`);
      }
    }

    // Sort chapters by number
    this.chapters.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    console.info(chalk.cyan(`Loaded ${this.chapters.length} chapters`));
  }

  /**
   * Load metadata from a chapter directory
   * @param {string} chapterPath - Path to the chapter directory
   * @returns {Promise<object>} The metadata object
   */
  async loadMetadata(chapterPath) {
    const metadataPath = path.join(chapterPath, 'metadata.yaml');
    
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      return yaml.load(content);
    } catch (error) {
      // Return default metadata if file doesn't exist
      return {
        title: { zh: '章節標題', en: 'Chapter Title' },
        objectives: ['待定義'],
        prerequisites: [],
        duration: '2 hours'
      };
    }
  }

  /**
   * Load content from a chapter's index.md file
   * @param {string} chapterPath - Path to the chapter directory
   * @returns {Promise<object>} The parsed content with frontmatter
   */
  async loadContent(chapterPath) {
    const contentPath = path.join(chapterPath, 'index.md');
    
    try {
      const content = await fs.readFile(contentPath, 'utf-8');
      return matter(content);
    } catch (error) {
      // Return empty content if file doesn't exist
      return {
        data: {},
        content: '# 章節內容\n\n內容待新增...'
      };
    }
  }

  /**
   * Process a single chapter
   * @param {object} chapter - Chapter data object
   * @returns {Promise<void>}
   */
  async processChapter(chapter) {
    console.info(chalk.blue(`Processing Chapter ${chapter.number}: ${chapter.metadata.title?.zh || 'Untitled'}`));

    try {
      // Generate HTML
      await this.generateHTML(chapter);
      
      // Generate Workshop README
      await this.generateWorkshopReadme(chapter);
      
      // Copy exercises and examples if they exist
      await this.copyChapterAssets(chapter);
      
      console.info(chalk.green(`  ✓ Chapter ${chapter.number} processed successfully`));
    } catch (error) {
      this.errors.push(`Chapter ${chapter.number}: ${error.message}`);
      console.error(chalk.red(`  ✗ Failed to process chapter ${chapter.number}: ${error.message}`));
    }
  }

  /**
   * Generate HTML output for a chapter
   * @param {object} chapter - Chapter data object
   * @returns {Promise<void>}
   */
  async generateHTML(chapter) {
    const template = await this.loadTemplate('chapter.html');
    
    // Merge frontmatter with metadata
    const fullMetadata = {
      ...chapter.metadata,
      ...chapter.content.data
    };

    // Add table of contents placeholder
    let contentWithToc = chapter.content.content;
    if (!contentWithToc.includes('[[toc]]')) {
      contentWithToc = '[[toc]]\n\n' + contentWithToc;
    }

    // Render markdown to HTML
    const renderedContent = md.render(contentWithToc);

    // Replace template variables
    let html = template
      .replace(/{{chapter_number}}/g, chapter.number)
      .replace(/{{chapter_title}}/g, fullMetadata.title?.zh || 'Chapter ' + chapter.number)
      .replace(/{{chapter_title_en}}/g, fullMetadata.title?.en || '')
      .replace(/{{chapter_content}}/g, renderedContent)
      .replace(/{{objectives}}/g, this.renderObjectives(fullMetadata.objectives))
      .replace(/{{prerequisites}}/g, this.renderPrerequisites(fullMetadata.prerequisites))
      .replace(/{{duration}}/g, fullMetadata.duration || '2 hours')
      .replace(/{{updated_date}}/g, new Date().toISOString().split('T')[0]);

    // Save HTML file
    const outputPath = path.join(this.htmlOutputDir, `chapter-${chapter.number.padStart(2, '0')}.html`);
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Generate workshop README for a chapter
   * @param {object} chapter - Chapter data object
   * @returns {Promise<void>}
   */
  async generateWorkshopReadme(chapter) {
    const workshopDir = path.join(this.workshopOutputDir, `chapter-${chapter.number.padStart(2, '0')}`);
    await fs.mkdir(workshopDir, { recursive: true });

    // Create workshop README with full content
    const readme = this.generateWorkshopMarkdown(chapter);
    const readmePath = path.join(workshopDir, 'README.md');
    await fs.writeFile(readmePath, readme, 'utf-8');

    // Create start-here directory
    const startHereDir = path.join(workshopDir, 'start-here');
    await fs.mkdir(startHereDir, { recursive: true });
    
    // Create example-output directory
    const exampleOutputDir = path.join(workshopDir, 'example-output');
    await fs.mkdir(exampleOutputDir, { recursive: true });
  }

  /**
   * Generate markdown content for workshop
   * @param {object} chapter - Chapter data object
   * @returns {string} Markdown content
   */
  generateWorkshopMarkdown(chapter) {
    const metadata = {
      ...chapter.metadata,
      ...chapter.content.data
    };

    let markdown = `# Chapter ${chapter.number}: ${metadata.title?.zh || 'Untitled'}\n\n`;
    
    if (metadata.title?.en) {
      markdown += `*${metadata.title.en}*\n\n`;
    }

    markdown += `## 學習目標\n\n`;
    if (metadata.objectives && metadata.objectives.length > 0) {
      metadata.objectives.forEach(obj => {
        markdown += `- ${obj}\n`;
      });
    }
    markdown += '\n';

    if (metadata.prerequisites && metadata.prerequisites.length > 0) {
      markdown += `## 前置需求\n\n`;
      metadata.prerequisites.forEach(req => {
        markdown += `- ${req}\n`;
      });
      markdown += '\n';
    }

    markdown += `## 預計時間\n\n${metadata.duration || '2 hours'}\n\n`;
    
    markdown += `---\n\n`;
    markdown += chapter.content.content;

    return markdown;
  }

  /**
   * Copy chapter assets to workshop directory
   * @param {object} chapter - Chapter data object
   * @returns {Promise<void>}
   */
  async copyChapterAssets(chapter) {
    const sourceDir = chapter.path;
    const workshopDir = path.join(this.workshopOutputDir, `chapter-${chapter.number.padStart(2, '0')}`);

    // Copy exercises
    const exercisesDir = path.join(sourceDir, 'exercises');
    if (await this.exists(exercisesDir)) {
      const targetExercises = path.join(workshopDir, 'exercises');
      await this.copyDirectory(exercisesDir, targetExercises);
    }

    // Copy examples
    const examplesDir = path.join(sourceDir, 'examples');
    if (await this.exists(examplesDir)) {
      const targetExamples = path.join(workshopDir, 'examples');
      await this.copyDirectory(examplesDir, targetExamples);
    }

    // Copy prompts
    const promptsDir = path.join(sourceDir, 'prompts');
    if (await this.exists(promptsDir)) {
      const targetPrompts = path.join(workshopDir, 'prompts');
      await this.copyDirectory(promptsDir, targetPrompts);
    }
  }

  /**
   * Recursively copy a directory
   * @param {string} source - Source directory path
   * @param {string} target - Target directory path
   * @returns {Promise<void>}
   */
  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const files = await fs.readdir(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      const stat = await fs.stat(sourcePath);
      
      if (stat.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  /**
   * Update the main index.html file with chapter list
   * @returns {Promise<void>}
   */
  async updateMainIndex() {
    console.info(chalk.blue('\nUpdating main index.html...'));
    
    try {
      let indexContent = await fs.readFile(this.indexPath, 'utf-8');
      
      // Generate chapter list HTML
      const chapterListHTML = this.generateChapterListHTML();
      
      // Update the chapters section in index.html
      const chapterSectionRegex = /<!-- CHAPTERS_START -->[\s\S]*?<!-- CHAPTERS_END -->/;
      
      if (chapterSectionRegex.test(indexContent)) {
        indexContent = indexContent.replace(
          chapterSectionRegex,
          `<!-- CHAPTERS_START -->\n${chapterListHTML}\n<!-- CHAPTERS_END -->`
        );
      } else {
        // If markers don't exist, append to a suitable location
        console.warn(chalk.yellow('Warning: Chapter markers not found in index.html'));
      }

      await fs.writeFile(this.indexPath, indexContent, 'utf-8');
      console.info(chalk.green('  ✓ Main index updated'));
    } catch (error) {
      this.errors.push(`Failed to update index.html: ${error.message}`);
    }
  }

  /**
   * Generate HTML for chapter list
   * @returns {string} HTML content for chapter list
   */
  generateChapterListHTML() {
    let html = '';
    
    for (const chapter of this.chapters) {
      const metadata = {
        ...chapter.metadata,
        ...chapter.content.data
      };
      
      html += `
        <div class="chapter-card">
          <div class="chapter-number">Chapter ${chapter.number}</div>
          <h3 class="chapter-title">${metadata.title?.zh || 'Chapter ' + chapter.number}</h3>
          ${metadata.title?.en ? `<p class="chapter-subtitle">${metadata.title.en}</p>` : ''}
          <p class="chapter-description">${metadata.description || metadata.objectives?.[0] || ''}</p>
          <div class="chapter-links">
            <a href="chapters/chapter-${chapter.number.padStart(2, '0')}.html" class="btn btn-primary">開始學習</a>
            <a href="../workshop/chapter-${chapter.number.padStart(2, '0')}/" class="btn btn-secondary">練習材料</a>
          </div>
        </div>`;
    }
    
    return html;
  }

  /**
   * Render objectives as HTML list items
   * @param {Array<string>} objectives - List of objectives
   * @returns {string} HTML list items
   */
  renderObjectives(objectives) {
    if (!objectives || objectives.length === 0) return '<li>待定義</li>';
    return objectives.map(obj => `<li>${obj}</li>`).join('\n');
  }

  /**
   * Render prerequisites as HTML list items
   * @param {Array<string>} prerequisites - List of prerequisites
   * @returns {string} HTML list items
   */
  renderPrerequisites(prerequisites) {
    if (!prerequisites || prerequisites.length === 0) return '<li>無</li>';
    return prerequisites.map(req => `<li>${req}</li>`).join('\n');
  }

  /**
   * Load a template file
   * @param {string} templateName - Name of the template file
   * @returns {Promise<string>} Template content
   */
  async loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, templateName);
    
    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      // Return a default template if file doesn't exist
      return this.getDefaultTemplate();
    }
  }

  /**
   * Get the default HTML template
   * @returns {string} Default HTML template
   */
  getDefaultTemplate() {
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{chapter_title}} - Play Right with AI</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <a href="../index.html" class="nav-brand">Play Right with AI</a>
            <div class="nav-links">
                <a href="../index.html">首頁</a>
                <a href="../chapters.html">章節</a>
                <a href="../playground.html">實驗場</a>
            </div>
        </div>
    </nav>

    <main class="container">
        <article class="chapter-content">
            <header class="chapter-header">
                <h1>Chapter {{chapter_number}}: {{chapter_title}}</h1>
                {{#if chapter_title_en}}<p class="subtitle">{{chapter_title_en}}</p>{{/if}}
            </header>

            <section class="chapter-meta">
                <div class="meta-item">
                    <strong>學習目標：</strong>
                    <ul>{{objectives}}</ul>
                </div>
                <div class="meta-item">
                    <strong>前置需求：</strong>
                    <ul>{{prerequisites}}</ul>
                </div>
                <div class="meta-item">
                    <strong>預計時間：</strong> {{duration}}
                </div>
            </section>

            <section class="chapter-body">
                {{chapter_content}}
            </section>

            <footer class="chapter-footer">
                <p>最後更新: {{updated_date}}</p>
            </footer>
        </article>
    </main>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</body>
</html>`;
  }

  /**
   * Check if a file or directory exists
   * @param {string} path - Path to check
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async exists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate and display build report
   * @returns {void}
   */
  generateReport() {
    console.info(chalk.cyan('\n📊 Build Report:'));
    console.info(chalk.cyan('================'));
    console.info(chalk.white(`  Total chapters processed: ${this.chapters.length}`));
    console.info(chalk.white(`  HTML files generated: ${this.chapters.length}`));
    console.info(chalk.white(`  Workshop folders created: ${this.chapters.length}`));
    
    if (this.errors.length > 0) {
      console.error(chalk.red(`  Errors encountered: ${this.errors.length}`));
    } else {
      console.info(chalk.green(`  Errors encountered: 0`));
    }
  }
}

// Main execution
if (require.main === module) {
  const builder = new ChapterBuilder();
  builder.build().catch(error => {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = ChapterBuilder;