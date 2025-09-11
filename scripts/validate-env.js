#!/usr/bin/env node

/**
 * 環境設定驗證腳本
 * 確保工作坊所需的環境設定都正確配置
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

class EnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.successes = [];
    }

    log(message, type = 'info') {
        const prefix = {
            error: `${colors.red}✖${colors.reset}`,
            warning: `${colors.yellow}⚠${colors.reset}`,
            success: `${colors.green}✓${colors.reset}`,
            info: `${colors.blue}ℹ${colors.reset}`
        };
        console.log(`${prefix[type]} ${message}`);
    }

    // 檢查 Node.js 版本
    validateNodeVersion() {
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion >= 18) {
            this.successes.push(`Node.js 版本: ${nodeVersion}`);
            this.log(`Node.js 版本: ${nodeVersion}`, 'success');
        } else {
            this.errors.push(`Node.js 版本過低: ${nodeVersion} (需要 >= 18)`);
            this.log(`Node.js 版本過低: ${nodeVersion} (需要 >= 18)`, 'error');
        }
    }

    // 檢查 .env 檔案
    validateEnvFile() {
        const envPath = path.join(process.cwd(), '.env');
        const envExamplePath = path.join(process.cwd(), '.env.example');
        
        if (!fs.existsSync(envExamplePath)) {
            this.warnings.push('.env.example 檔案不存在');
            this.log('.env.example 檔案不存在', 'warning');
        }
        
        if (fs.existsSync(envPath)) {
            this.successes.push('.env 檔案存在');
            this.log('.env 檔案存在', 'success');
            
            // 載入環境變數
            require('dotenv').config();
            this.validateApiKeys();
        } else {
            this.warnings.push('.env 檔案不存在，請從 .env.example 複製並設定');
            this.log('.env 檔案不存在，請從 .env.example 複製並設定', 'warning');
            
            // 嘗試創建 .env 檔案
            if (fs.existsSync(envExamplePath)) {
                this.log('正在從 .env.example 創建 .env 檔案...', 'info');
                fs.copyFileSync(envExamplePath, envPath);
                this.log('.env 檔案已創建，請設定 API 金鑰', 'success');
            }
        }
    }

    // 驗證 API 金鑰
    validateApiKeys() {
        const requiredKeys = [
            { key: 'ANTHROPIC_API_KEY', name: 'Claude API', optional: false },
            { key: 'GOOGLE_API_KEY', name: 'Gemini API', optional: true },
            { key: 'OPENAI_API_KEY', name: 'OpenAI API', optional: true }
        ];
        
        let hasAtLeastOneKey = false;
        
        requiredKeys.forEach(({ key, name, optional }) => {
            const value = process.env[key];
            
            if (value && value !== `your_${key.toLowerCase()}_here`) {
                this.successes.push(`${name} 金鑰已設定`);
                this.log(`${name} 金鑰已設定`, 'success');
                hasAtLeastOneKey = true;
            } else if (!optional) {
                this.errors.push(`${name} 金鑰未設定`);
                this.log(`${name} 金鑰未設定`, 'error');
            } else {
                this.warnings.push(`${name} 金鑰未設定 (選擇性)`);
                this.log(`${name} 金鑰未設定 (選擇性)`, 'warning');
            }
        });
        
        if (!hasAtLeastOneKey) {
            this.errors.push('至少需要設定一個 AI 服務的 API 金鑰');
            this.log('至少需要設定一個 AI 服務的 API 金鑰', 'error');
        }
    }

    // 檢查 Playwright 安裝
    validatePlaywright() {
        try {
            // 檢查 Playwright 是否安裝
            const playwrightVersion = execSync('npx playwright --version', { 
                encoding: 'utf8',
                stdio: 'pipe'
            }).trim();
            
            this.successes.push(`Playwright 已安裝: ${playwrightVersion}`);
            this.log(`Playwright 已安裝: ${playwrightVersion}`, 'success');
            
            // 檢查瀏覽器是否已安裝
            try {
                execSync('npx playwright install --dry-run', { 
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                this.successes.push('Playwright 瀏覽器已安裝');
                this.log('Playwright 瀏覽器已安裝', 'success');
            } catch (error) {
                this.warnings.push('Playwright 瀏覽器未安裝，請執行: npx playwright install');
                this.log('Playwright 瀏覽器未安裝，請執行: npx playwright install', 'warning');
            }
        } catch (error) {
            this.errors.push('Playwright 未安裝，請執行: npm install @playwright/test');
            this.log('Playwright 未安裝，請執行: npm install @playwright/test', 'error');
        }
    }

    // 檢查工作坊目錄結構
    validateWorkshopDirectories() {
        const requiredDirs = [
            'prompts',
            'workshop',
            'sample-app-source',
            'scripts',
            'docs',
            'tests/e2e'
        ];
        
        requiredDirs.forEach(dir => {
            const dirPath = path.join(process.cwd(), dir);
            if (fs.existsSync(dirPath)) {
                this.successes.push(`目錄存在: ${dir}/`);
                this.log(`目錄存在: ${dir}/`, 'success');
            } else {
                this.warnings.push(`目錄不存在: ${dir}/`);
                this.log(`目錄不存在: ${dir}/`, 'warning');
                
                // 創建缺失的目錄
                fs.mkdirSync(dirPath, { recursive: true });
                this.log(`已創建目錄: ${dir}/`, 'info');
            }
        });
    }

    // 檢查 package.json 依賴
    validateDependencies() {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            this.errors.push('package.json 不存在');
            this.log('package.json 不存在', 'error');
            return;
        }
        
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredDeps = {
            '@playwright/test': '^1.40.0',
            'dotenv': '^16.0.0'
        };
        
        const allDeps = {
            ...packageJson.dependencies || {},
            ...packageJson.devDependencies || {}
        };
        
        Object.entries(requiredDeps).forEach(([dep, minVersion]) => {
            if (allDeps[dep]) {
                this.successes.push(`依賴已安裝: ${dep}`);
                this.log(`依賴已安裝: ${dep}`, 'success');
            } else {
                this.warnings.push(`依賴未安裝: ${dep}`);
                this.log(`依賴未安裝: ${dep}`, 'warning');
            }
        });
    }

    // 生成總結報告
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('環境驗證報告');
        console.log('='.repeat(50));
        
        if (this.successes.length > 0) {
            console.log(`\n${colors.green}成功項目 (${this.successes.length})${colors.reset}`);
            this.successes.forEach(msg => console.log(`  ✓ ${msg}`));
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n${colors.yellow}警告項目 (${this.warnings.length})${colors.reset}`);
            this.warnings.forEach(msg => console.log(`  ⚠ ${msg}`));
        }
        
        if (this.errors.length > 0) {
            console.log(`\n${colors.red}錯誤項目 (${this.errors.length})${colors.reset}`);
            this.errors.forEach(msg => console.log(`  ✖ ${msg}`));
        }
        
        console.log('\n' + '='.repeat(50));
        
        if (this.errors.length === 0) {
            console.log(`${colors.green}✓ 環境設定驗證通過！${colors.reset}`);
            if (this.warnings.length > 0) {
                console.log(`${colors.yellow}  但有 ${this.warnings.length} 個警告需要注意${colors.reset}`);
            }
        } else {
            console.log(`${colors.red}✖ 環境設定驗證失敗！${colors.reset}`);
            console.log(`  請修正 ${this.errors.length} 個錯誤後再試`);
            process.exit(1);
        }
    }

    // 執行所有驗證
    async run() {
        console.log(`${colors.blue}開始驗證工作坊環境設定...${colors.reset}\n`);
        
        this.validateNodeVersion();
        this.validateEnvFile();
        this.validatePlaywright();
        this.validateWorkshopDirectories();
        this.validateDependencies();
        
        this.generateReport();
    }
}

// 執行驗證
const validator = new EnvironmentValidator();
validator.run().catch(error => {
    console.error(`${colors.red}驗證過程發生錯誤:${colors.reset}`, error);
    process.exit(1);
});