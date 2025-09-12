# Technical Context: Play right with AI Workshop

## Technologies Used

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Playwright | Latest | Browser automation & testing |
| TypeScript | 5.0+ | Type-safe JavaScript |
| JavaScript | ES6+ | Primary language |
| HTML5/CSS3 | Latest | Web applications |

### AI Services
| Service | Model | Purpose |
|---------|-------|---------|
| Anthropic | Claude 3.5 Sonnet | Primary AI assistant |
| OpenAI | GPT | Alternative AI model |
| Google | Gemini Pro | Additional AI option |
| MCP | Playwright Integration | Browser automation AI |

### Development Tools
| Tool | Purpose |
|------|---------|
| VS Code | Primary IDE |
| Cursor | AI-enhanced IDE |
| Git | Version control |
| GitHub | Repository hosting |
| npm/yarn | Package management |

## Development Setup

### Prerequisites
```bash
# Required installations
node --version  # 18.0.0 or higher
npm --version   # 9.0.0 or higher
git --version   # 2.0.0 or higher

# AI CLI tools
claude --version
gemini --version  # or python with google-generativeai
openai --version  # optional
```

### Environment Configuration
```bash
# API Keys (required)
export ANTHROPIC_API_KEY="sk-..."
export GOOGLE_API_KEY="..."
export OPENAI_API_KEY="sk-..."  # optional

# MCP Configuration
export MCP_SERVER_PATH="./mcp-server"
export PLAYWRIGHT_BROWSERS_PATH="./browsers"
```

### Project Setup
```bash
# Clone repository
git clone https://github.com/[username]/play-right-with-ai.git
cd play-right-with-ai

# Install dependencies
npm install

# Install Playwright
npx playwright install

# Verify setup
npm test
```

## Technical Constraints

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### System Requirements
- RAM: 8GB minimum, 16GB recommended
- Storage: 2GB for project + browsers
- Network: Stable internet for AI APIs
- OS: Windows 10+, macOS 11+, Ubuntu 20+

### API Limitations
| Service | Rate Limit | Token Limit | Cost Estimate |
|---------|------------|-------------|---------------|
| Claude | 50 req/min | 100k tokens | ~$0.01/request |
| GPT | 60 req/min | 8k tokens | ~$0.03/request |
| Gemini | 60 req/min | 30k tokens | ~$0.001/request |

## Dependencies

### Production Dependencies
```json
{
  "@playwright/test": "^1.40.0",
  "typescript": "^5.3.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.0.0",
  "eslint": "^8.50.0",
  "prettier": "^3.0.0",
  "jest": "^29.0.0",
  "markdown-it": "^13.0.0"
}
```

### Optional Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.6.0",
  "openai": "^4.0.0",
  "@google/generative-ai": "^0.1.0"
}
```

## Build Pipeline

### Content Generation Scripts
| Script | Purpose |
|--------|---------|
| build-chapters.js | Converts markdown to HTML with templates |
| validate-links.js | Checks all internal and external links |
| sync-content.js | Synchronizes content across directories |

### Testing Infrastructure
- 81 comprehensive TDD tests covering content pipeline
- Automated link validation
- Format compliance checking
- CI/CD integration for content validation

## Configuration Files

### playwright.config.ts
```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Security Considerations

### API Key Management
- Never commit API keys
- Use environment variables
- Implement key rotation
- Monitor usage patterns

### Code Security
- Input sanitization required
- XSS prevention in examples
- No sensitive data in prompts
- Secure storage practices

### Data Privacy
- No PII in examples
- Anonymous analytics only
- Opt-in data sharing
- GDPR compliance

## Performance Requirements

### Response Times
- AI API calls: < 10 seconds
- Page loads: < 3 seconds
- Test execution: < 30 seconds
- Build time: < 60 seconds

### Resource Usage
- Memory: < 1GB per process
- CPU: < 50% average
- Network: < 10MB per session
- Storage: < 100MB cache

## Integration Requirements

### GitHub Integration
- Markdown rendering
- Issue templates
- Discussion forums
- Action workflows

### CI/CD Pipeline
```yaml
name: Workshop Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run validate-links
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## Monitoring and Logging

### Metrics to Track
- API usage and costs
- Error rates
- Completion rates
- Performance metrics

### Logging Strategy
- Structured logging
- Error tracking
- Usage analytics
- Performance monitoring

## Maintenance Requirements

### Regular Updates
- AI model changes
- Playwright updates
- Security patches
- Content refreshes

### Backup Strategy
- Git versioning
- API key backup
- Content archives
- Configuration backup