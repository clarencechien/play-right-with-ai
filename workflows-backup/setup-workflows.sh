#!/bin/bash

# Play right with AI - GitHub Actions 工作流程設定腳本
# 此腳本協助您設定 GitHub Actions 工作流程

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 輸出函數
print_info() {
    echo -e "${BLUE}ℹ ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️ ${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header() {
    echo ""
    echo "================================================"
    echo "$1"
    echo "================================================"
    echo ""
}

# 檢查是否在 git repository 中
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "此腳本必須在 git repository 根目錄執行"
        exit 1
    fi
}

# 檢查是否在正確的目錄
check_directory() {
    if [ ! -f "package.json" ]; then
        print_error "請在專案根目錄執行此腳本"
        exit 1
    fi
}

# 建立 workflows 目錄
create_workflows_dir() {
    print_header "步驟 1: 建立 GitHub Actions 目錄"
    
    if [ -d ".github/workflows" ]; then
        print_info "目錄 .github/workflows 已存在"
    else
        mkdir -p .github/workflows
        print_success "已建立目錄 .github/workflows"
    fi
}

# 複製工作流程檔案
copy_workflow_files() {
    print_header "步驟 2: 複製工作流程檔案"
    
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local copied=0
    
    for workflow in deploy.yml workshop-tests.yml; do
        if [ -f "$script_dir/$workflow" ]; then
            if [ -f ".github/workflows/$workflow" ]; then
                print_warning "$workflow 已存在，是否要覆蓋？ (y/n)"
                read -r response
                if [[ "$response" =~ ^[Yy]$ ]]; then
                    cp "$script_dir/$workflow" .github/workflows/
                    print_success "已覆蓋 $workflow"
                    ((copied++))
                else
                    print_info "跳過 $workflow"
                fi
            else
                cp "$script_dir/$workflow" .github/workflows/
                print_success "已複製 $workflow"
                ((copied++))
            fi
        else
            print_warning "找不到 $workflow，跳過"
        fi
    done
    
    if [ $copied -gt 0 ]; then
        print_success "已複製 $copied 個工作流程檔案"
    fi
}

# 檢查必要的 npm 腳本
check_npm_scripts() {
    print_header "步驟 3: 檢查 npm 腳本"
    
    local missing_scripts=()
    
    # 檢查 build:site 腳本
    if ! grep -q '"build:site"' package.json; then
        missing_scripts+=("build:site")
    fi
    
    # 檢查 test 腳本
    if ! grep -q '"test"' package.json; then
        missing_scripts+=("test")
    fi
    
    if [ ${#missing_scripts[@]} -eq 0 ]; then
        print_success "所有必要的 npm 腳本都已設定"
    else
        print_warning "缺少以下 npm 腳本："
        for script in "${missing_scripts[@]}"; do
            echo "  - $script"
        done
        echo ""
        print_info "請在 package.json 中新增這些腳本"
        print_info "範例："
        echo '  "scripts": {'
        echo '    "build:site": "node scripts/build-site.js",'
        echo '    "test": "playwright test"'
        echo '  }'
    fi
}

# 檢查 GitHub 設定
check_github_settings() {
    print_header "步驟 4: GitHub 設定檢查清單"
    
    echo "請手動檢查以下 GitHub 設定："
    echo ""
    echo "1. GitHub Actions 權限："
    echo "   [ ] 前往 Settings → Actions → General"
    echo "   [ ] Actions permissions 設為 'Allow all actions'"
    echo "   [ ] Workflow permissions 設為 'Read and write permissions'"
    echo ""
    echo "2. GitHub Pages 設定："
    echo "   [ ] 前往 Settings → Pages"
    echo "   [ ] Source 選擇 'GitHub Actions'"
    echo ""
    echo "3. Secrets 設定（如需要）："
    echo "   [ ] 前往 Settings → Secrets and variables → Actions"
    echo "   [ ] 新增 ANTHROPIC_API_KEY (如需要)"
    echo "   [ ] 新增 GOOGLE_API_KEY (如需要)"
    echo "   [ ] 新增 OPENAI_API_KEY (如需要)"
    echo ""
    
    print_info "按 Enter 繼續..."
    read -r
}

# 產生範例內容（如果需要）
create_sample_content() {
    print_header "步驟 5: 檢查範例內容"
    
    if [ ! -d "docs" ]; then
        print_info "建立範例 docs 目錄..."
        mkdir -p docs
        echo "<h1>Play right with AI Workshop</h1>" > docs/index.html
        print_success "已建立範例 docs/index.html"
    else
        print_info "docs 目錄已存在"
    fi
    
    if [ ! -d "workshop" ]; then
        print_info "建立範例 workshop 目錄結構..."
        for i in {1..8}; do
            mkdir -p "workshop/chapter-$i/start-here"
            mkdir -p "workshop/chapter-$i/example-output"
            touch "workshop/chapter-$i/README.md"
        done
        print_success "已建立 workshop 目錄結構"
    else
        print_info "workshop 目錄已存在"
    fi
}

# 驗證設定
validate_setup() {
    print_header "步驟 6: 驗證設定"
    
    local issues=0
    
    # 檢查工作流程檔案
    for workflow in deploy.yml workshop-tests.yml; do
        if [ -f ".github/workflows/$workflow" ]; then
            print_success "$workflow 已就位"
        else
            print_warning "$workflow 未設定"
            ((issues++))
        fi
    done
    
    # 檢查目錄結構
    if [ -d "docs" ]; then
        print_success "docs 目錄存在"
    else
        print_warning "docs 目錄不存在"
        ((issues++))
    fi
    
    if [ -d "workshop" ]; then
        print_success "workshop 目錄存在"
    else
        print_warning "workshop 目錄不存在"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        print_success "所有設定驗證通過！"
    else
        print_warning "發現 $issues 個潛在問題，請檢查並修正"
    fi
}

# 提交變更
commit_changes() {
    print_header "步驟 7: 提交變更"
    
    # 檢查是否有變更
    if git diff --quiet && git diff --staged --quiet; then
        print_info "沒有需要提交的變更"
        return
    fi
    
    print_info "以下檔案將被提交："
    git status --short
    echo ""
    
    print_info "是否要提交這些變更？ (y/n)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .github/workflows/
        git add docs/ 2>/dev/null || true
        git add workshop/ 2>/dev/null || true
        
        git commit -m "Add GitHub Actions workflows for workshop

- Added deploy.yml for GitHub Pages deployment
- Added workshop-tests.yml for automated testing
- Created necessary directory structure"
        
        print_success "變更已提交"
        
        print_info "是否要推送到遠端？ (y/n)"
        read -r push_response
        
        if [[ "$push_response" =~ ^[Yy]$ ]]; then
            git push
            print_success "變更已推送到遠端"
        else
            print_info "請記得稍後執行 'git push' 推送變更"
        fi
    else
        print_info "未提交變更"
    fi
}

# 顯示下一步指示
show_next_steps() {
    print_header "🎉 設定完成！"
    
    echo "下一步："
    echo ""
    echo "1. 如果還沒推送，請執行："
    echo "   ${GREEN}git push${NC}"
    echo ""
    echo "2. 前往 GitHub repository 的 Actions 標籤查看工作流程執行狀態"
    echo ""
    echo "3. 首次部署後，前往以下網址查看網站："
    echo "   ${BLUE}https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | cut -d'/' -f1).github.io/$(basename $(pwd))/${NC}"
    echo ""
    echo "4. 如需詳細說明，請參考："
    echo "   - workflows-backup/README.md"
    echo "   - workflows-backup/deploy.yml.md"
    echo "   - workflows-backup/workshop-tests.yml.md"
    echo ""
    print_success "祝您使用愉快！"
}

# 主函數
main() {
    clear
    echo "=========================================="
    echo "  Play right with AI - 工作流程設定精靈  "
    echo "=========================================="
    echo ""
    
    # 執行檢查
    check_git_repo
    check_directory
    
    # 執行設定步驟
    create_workflows_dir
    copy_workflow_files
    check_npm_scripts
    check_github_settings
    create_sample_content
    validate_setup
    commit_changes
    show_next_steps
}

# 錯誤處理
trap 'print_error "設定過程中發生錯誤"; exit 1' ERR

# 執行主函數
main