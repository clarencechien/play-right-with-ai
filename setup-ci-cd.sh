#!/bin/bash

# ===================================================
# Play right with AI - CI/CD 環境設定腳本
# ===================================================

set -e

echo "=========================================="
echo "   Play right with AI - CI/CD Setup"
echo "=========================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查函式
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 已安裝"
        return 0
    else
        echo -e "${RED}✗${NC} $1 未安裝"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} 找到: $1"
        return 0
    else
        echo -e "${YELLOW}!${NC} 缺少: $1"
        return 1
    fi
}

check_env() {
    if [ -n "${!1}" ]; then
        echo -e "${GREEN}✓${NC} $1 已設定"
        return 0
    else
        echo -e "${YELLOW}!${NC} $1 未設定"
        return 1
    fi
}

# ===================================================
# 步驟 1: 檢查必要工具
# ===================================================
echo -e "${BLUE}步驟 1: 檢查必要工具${NC}"
echo "------------------------"

MISSING_TOOLS=0

check_command "node" || MISSING_TOOLS=1
check_command "npm" || MISSING_TOOLS=1
check_command "git" || MISSING_TOOLS=1

# 檢查 Python (for Gemini)
if ! check_command "python3"; then
    if ! check_command "python"; then
        MISSING_TOOLS=1
    fi
fi

if [ $MISSING_TOOLS -eq 1 ]; then
    echo -e "${RED}請先安裝缺少的工具${NC}"
    exit 1
fi

echo ""

# ===================================================
# 步驟 2: 檢查 API 金鑰
# ===================================================
echo -e "${BLUE}步驟 2: 檢查 API 金鑰${NC}"
echo "------------------------"

MISSING_KEYS=0

check_env "ANTHROPIC_API_KEY" || MISSING_KEYS=1
check_env "GOOGLE_API_KEY" || MISSING_KEYS=1
check_env "OPENAI_API_KEY" || MISSING_KEYS=1

if [ $MISSING_KEYS -eq 1 ]; then
    echo -e "${YELLOW}提示: 設定 API 金鑰以啟用完整功能${NC}"
    echo ""
    echo "export ANTHROPIC_API_KEY='your-key-here'"
    echo "export GOOGLE_API_KEY='your-key-here'"
    echo "export OPENAI_API_KEY='your-key-here'"
fi

echo ""

# ===================================================
# 步驟 3: 安裝相依套件
# ===================================================
echo -e "${BLUE}步驟 3: 安裝相依套件${NC}"
echo "------------------------"

# 檢查 package.json
if [ ! -f "package.json" ]; then
    echo "建立 package.json..."
    cat > package.json <<'EOF'
{
  "name": "play-right-with-ai",
  "version": "1.0.0",
  "description": "AI-driven development and testing workshop",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "mcp:start": "node integrations/mcp/playwright-mcp.js",
    "analytics": "node monitoring/analytics.js",
    "validate": "npm run validate:markdown && npm run validate:links",
    "validate:markdown": "markdownlint '**/*.md' --ignore node_modules",
    "validate:links": "markdown-link-check **/*.md"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@playwright/test": "^1.42.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "uuid": "^9.0.0",
    "openai": "^4.28.0",
    "google-generativeai": "^0.3.0"
  },
  "devDependencies": {
    "markdownlint-cli": "^0.39.0",
    "markdown-link-check": "^3.11.2",
    "eslint": "^8.57.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "typescript": "^5.3.0",
    "html-validate": "^8.9.0"
  }
}
EOF
fi

# 安裝 Node.js 套件
echo "安裝 Node.js 套件..."
npm install

# 安裝 Playwright 瀏覽器
echo "安裝 Playwright 瀏覽器..."
npx playwright install

# 安裝 Python 套件
echo "安裝 Python 套件..."
if command -v pip3 &> /dev/null; then
    pip3 install google-generativeai pillow --user
elif command -v pip &> /dev/null; then
    pip install google-generativeai pillow --user
fi

echo ""

# ===================================================
# 步驟 4: 設定 Git Hooks
# ===================================================
echo -e "${BLUE}步驟 4: 設定 Git Hooks${NC}"
echo "------------------------"

# 建立 pre-commit hook
if [ -d ".git" ]; then
    cat > .git/hooks/pre-commit <<'EOF'
#!/bin/bash
# Pre-commit hook for Play right with AI

echo "執行 pre-commit 檢查..."

# 檢查 Markdown
if command -v markdownlint &> /dev/null; then
    echo "檢查 Markdown 格式..."
    markdownlint $(git diff --cached --name-only --diff-filter=ACM | grep '\.md$') || exit 1
fi

# 檢查 JavaScript/TypeScript
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts)$')
if [ -n "$files" ]; then
    echo "檢查 JavaScript/TypeScript..."
    for file in $files; do
        node -c "$file" || exit 1
    done
fi

echo "Pre-commit 檢查通過！"
EOF
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✓${NC} Git hooks 已設定"
else
    echo -e "${YELLOW}!${NC} 非 Git 儲存庫，跳過 hooks 設定"
fi

echo ""

# ===================================================
# 步驟 5: 建立本地測試環境
# ===================================================
echo -e "${BLUE}步驟 5: 建立本地測試環境${NC}"
echo "------------------------"

# 建立測試配置
if [ ! -f "playwright.config.ts" ]; then
    cat > playwright.config.ts <<'EOF'
import { defineConfig, devices } from '@playwright/test';

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
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
    echo -e "${GREEN}✓${NC} Playwright 配置已建立"
fi

# 建立環境變數範本
if [ ! -f ".env.example" ]; then
    cat > .env.example <<'EOF'
# API Keys
ANTHROPIC_API_KEY=your-claude-api-key
GOOGLE_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# MCP Configuration
MCP_PORT=3001

# Analytics
ANALYTICS_ENDPOINT=/api/analytics

# Environment
NODE_ENV=development
EOF
    echo -e "${GREEN}✓${NC} 環境變數範本已建立"
fi

echo ""

# ===================================================
# 步驟 6: 驗證 CI/CD 設定
# ===================================================
echo -e "${BLUE}步驟 6: 驗證 CI/CD 設定${NC}"
echo "------------------------"

# 檢查 GitHub Actions 工作流程
WORKFLOWS=(
    ".github/workflows/workshop-tests.yml"
    ".github/workflows/content-validation.yml"
    ".github/workflows/prompt-testing.yml"
    ".github/workflows/deploy.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
    check_file "$workflow"
done

# 檢查整合目錄
INTEGRATIONS=(
    "integrations/claude/setup.js"
    "integrations/gemini/setup.py"
    "integrations/openai/setup.js"
    "integrations/mcp/playwright-mcp.js"
)

for integration in "${INTEGRATIONS[@]}"; do
    check_file "$integration"
done

echo ""

# ===================================================
# 步驟 7: 測試 AI 整合
# ===================================================
echo -e "${BLUE}步驟 7: 測試 AI 整合${NC}"
echo "------------------------"

# 測試 Claude
if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "測試 Claude API..."
    node -e "
    const claude = require('./integrations/claude/setup.js');
    const client = new claude(process.env.ANTHROPIC_API_KEY);
    console.log('Claude API 連接成功');
    " && echo -e "${GREEN}✓${NC} Claude API 正常" || echo -e "${RED}✗${NC} Claude API 錯誤"
fi

# 測試 Gemini
if [ -n "$GOOGLE_API_KEY" ]; then
    echo "測試 Gemini API..."
    python3 -c "
from integrations.gemini.setup import GeminiIntegration
client = GeminiIntegration()
print('Gemini API 連接成功')
    " 2>/dev/null && echo -e "${GREEN}✓${NC} Gemini API 正常" || echo -e "${RED}✗${NC} Gemini API 錯誤"
fi

# 測試 OpenAI
if [ -n "$OPENAI_API_KEY" ]; then
    echo "測試 OpenAI API..."
    node -e "
    const openai = require('./integrations/openai/setup.js');
    const client = new openai(process.env.OPENAI_API_KEY);
    console.log('OpenAI API 連接成功');
    " && echo -e "${GREEN}✓${NC} OpenAI API 正常" || echo -e "${RED}✗${NC} OpenAI API 錯誤"
fi

echo ""

# ===================================================
# 步驟 8: 啟動服務
# ===================================================
echo -e "${BLUE}步驟 8: 啟動服務${NC}"
echo "------------------------"

echo "可用的服務命令："
echo ""
echo "  ${GREEN}npm run mcp:start${NC}     - 啟動 Playwright MCP 伺服器"
echo "  ${GREEN}npm run test${NC}          - 執行所有測試"
echo "  ${GREEN}npm run test:ui${NC}       - 開啟測試 UI"
echo "  ${GREEN}npm run analytics${NC}     - 查看分析報告"
echo "  ${GREEN}npm run validate${NC}      - 驗證所有內容"
echo ""

# ===================================================
# 完成
# ===================================================
echo "=========================================="
echo -e "${GREEN}✓ CI/CD 環境設定完成！${NC}"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 設定缺少的 API 金鑰 (如果需要)"
echo "2. 在 GitHub 設定 Secrets"
echo "3. 推送程式碼以觸發 CI/CD 流程"
echo "4. 訪問 GitHub Actions 查看執行結果"
echo ""
echo "詳細文件請參考: .github/workflows/README.md"