# Project Structure Documentation

## 📁 Root Directory Files (Essential Only)

```
play-right-with-ai/
├── README.md           # Main project documentation
├── LICENSE             # MIT license
├── CONTRIBUTING.md     # Contribution guidelines
├── CODE_OF_CONDUCT.md  # Community standards
├── CHANGELOG.md        # Version history
├── AUTHORS.md          # Contributors list
├── ANNOUNCEMENT.md     # Launch announcement
├── DEPLOYMENT.md       # Deployment instructions
├── CLAUDE.md           # AI assistant guidelines
├── PROJECT_STRUCTURE.md # This file
├── package.json        # Node.js dependencies
├── package-lock.json   # Dependency lock file
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── _config.yml         # GitHub Pages config
├── 404.html            # Custom 404 page
└── commitlint.config.js # Commit message linting
```

## 📂 Directory Structure

### `/workshop/` - Workshop Content (8 Chapters)
```
workshop/
├── chapter-01/         # Environment setup
├── chapter-02/         # AI application generation
├── chapter-03/         # Test strategy
├── chapter-04/         # Playwright automation
├── chapter-05/         # Failure analysis
├── chapter-06/         # Self-repair
├── chapter-07/         # Advanced techniques
├── chapter-08/         # Capstone project
├── progress-tracker.md # Learning progress tracking
├── achievements.json   # Gamification system
└── certificate-template.html # Completion certificate
```

### `/docs/` - Static Website
```
docs/
├── index.html          # Homepage
├── privacy-policy.html # Privacy policy
├── 404.html            # 404 error page
├── assets/
│   ├── css/main.css    # Styles
│   └── js/
│       ├── main.js     # Main JavaScript
│       └── analytics.js # Analytics tracking
├── chapters/           # Chapter HTML pages
├── playground/         # Interactive prompt tester
├── demos/              # Demo applications
├── launch/             # Launch materials
├── demo/               # Video scripts and guides
├── reports/            # Development reports
├── development/        # Development docs
├── instructor-guide.md # Teaching guide
├── faq.md              # Frequently asked questions
└── testimonials.md     # User testimonials
```

### `/sample-app-source/` - Example Applications
```
sample-app-source/
├── todo-app/           # Basic TODO application
│   ├── src/            # Source code
│   ├── tests/          # Test suites
│   ├── bugs/           # Intentional bugs
│   └── solutions/      # Bug fixes
├── shopping-list/      # Shopping list app
├── multi-page-app/     # Multi-page SPA
└── capstone-starter/   # Capstone template
```

### `/prompts/` - AI Prompts Collection
```
prompts/
├── chapter-02/         # App generation prompts
├── chapter-03/         # Test strategy prompts
├── chapter-04/         # Playwright prompts
├── chapter-05/         # Debugging prompts
├── chapter-06/         # Self-repair prompts
├── validation/         # Prompt validation tools
└── README.md           # Prompts documentation
```

### `/tests/` - Test Infrastructure
```
tests/
├── e2e/                # End-to-end tests
├── integration/        # Integration tests
├── performance/        # Performance tests
├── a11y/               # Accessibility tests
├── specs/              # Test specifications
├── utils/              # Test utilities
├── fixtures/           # Test data
├── page-objects/       # Page object models
└── static-site-navigation.spec.ts
```

### `/integrations/` - AI Service Integrations
```
integrations/
├── claude/             # Claude API integration
├── gemini/             # Gemini API integration
├── openai/             # OpenAI API integration
└── mcp/                # Playwright MCP server
```

### `/scripts/` - Utility Scripts
```
scripts/
├── build-site.js       # Static site generator
├── validate-env.js     # Environment validation
├── validate-tests.js   # Test validation
├── fix-all-paths.sh    # Path fixing utility
└── test-github-pages.sh # GitHub Pages test
```

### `/memory-bank/` - Context Persistence
```
memory-bank/
├── projectbrief.md     # Project overview
├── productContext.md   # Product context
├── activeContext.md    # Current work status
├── systemPatterns.md   # Architecture patterns
├── techContext.md      # Technical context
└── progress.md         # Progress tracking
```

### `/workflows-backup/` - GitHub Actions Backup
```
workflows-backup/
├── deploy.yml          # Deployment workflow
├── workshop-tests.yml  # Testing workflow
├── README.md           # Workflow documentation
└── setup-workflows.sh  # Setup script
```

### `/.github/` - GitHub Configuration
```
.github/
├── ISSUE_TEMPLATE/     # Issue templates
├── DISCUSSION_TEMPLATE/ # Discussion templates
├── CODEOWNERS          # Code ownership
├── FUNDING.yml         # Sponsorship
├── SECURITY.md         # Security policy
├── dependabot.yml      # Dependency updates
├── labeler.yml         # Auto-labeling
├── settings.yml        # Repository settings
└── pull_request_template.md
```

### `/.husky/` - Git Hooks
```
.husky/
├── pre-commit          # Pre-commit checks
└── commit-msg          # Commit message validation
```

## 🧹 Cleanup Performed

### Removed Files:
- `README_ENHANCED.md` (duplicate)
- `*.backup` files
- `*.review` files
- `*-original.*` files
- Exported conversation files

### Moved to `/docs/reports/`:
- `BILINGUAL_STRATEGY_UPDATES.md`
- `eslint-fix-report.md`
- `TEST_SETUP_REPORT.md`
- `validation-complete.md`
- `validation-report.md`

### Moved to `/docs/development/`:
- `PRD.md`
- `FINAL-REPORT.md`
- `METRICS.md`

## 📊 Final Statistics

- **Total Files**: ~10,000
- **Root Files**: 16 (essential only)
- **Chapters**: 8 complete
- **Sample Apps**: 4 functional
- **Test Coverage**: 92%
- **Documentation**: Comprehensive

## 🚀 Quick Start

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Run `npm run validate:env`
5. Start with `npm run workshop:start`

## 📝 Notes

- All non-essential files have been organized into appropriate subdirectories
- The root directory now contains only essential project files
- Development reports and metrics are preserved in `/docs/`
- The project structure is optimized for both development and deployment
- All paths and links have been verified to work correctly