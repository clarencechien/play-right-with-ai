# Content Validation 工作流程範本文件

## 概述

`content-validation.yml` 是建議的內容驗證工作流程，用於確保工作坊教材的品質和一致性。此工作流程檢查文件格式、連結有效性、程式碼範例正確性等。

## 建議的工作流程結構

```yaml
name: Content Validation

on:
  pull_request:
    paths:
      - 'workshop/**/*.md'
      - 'README.md'
      - 'docs/**'
  push:
    branches: [ main ]
    paths:
      - 'workshop/**/*.md'
      - 'README.md'

jobs:
  validate-markdown:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
    
    - name: 安裝驗證工具
      run: |
        npm install -g markdownlint-cli
        npm install -g markdown-link-check
    
    - name: 檢查 Markdown 格式
      run: |
        markdownlint '**/*.md' --ignore node_modules
    
    - name: 檢查連結有效性
      run: |
        find . -name "*.md" -not -path "./node_modules/*" | \
        xargs -I {} markdown-link-check {} --config .markdown-link-check.json
    
    - name: 驗證程式碼區塊
      run: |
        # 自訂腳本檢查程式碼區塊語法
        node scripts/validate-code-blocks.js

  validate-chinese-content:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    
    - name: 安裝中文檢查工具
      run: |
        pip install pangu
        pip install zhon
    
    - name: 檢查中文排版
      run: |
        python scripts/check-chinese-typography.py
    
    - name: 術語一致性檢查
      run: |
        python scripts/check-terminology.py

  validate-examples:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: 安裝相依套件
      run: npm ci
    
    - name: 驗證範例程式碼
      run: |
        # 編譯 TypeScript 範例
        npx tsc --noEmit workshop/**/*.ts
        
        # 檢查 JavaScript 語法
        npx eslint workshop/**/*.js
    
    - name: 測試範例可執行性
      run: |
        for dir in workshop/chapter-*/example-output; do
          if [ -d "$dir" ]; then
            echo "測試 $dir"
            cd "$dir"
            if [ -f "package.json" ]; then
              npm install
              npm test || true
            fi
            cd -
          fi
        done
```

## 配置檔案

### .markdownlint.json
```json
{
  "default": true,
  "MD013": false,
  "MD033": false,
  "MD041": false,
  "no-hard-tabs": true,
  "no-trailing-spaces": true
}
```

### .markdown-link-check.json
```json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    },
    {
      "pattern": "^https://github.com/.*/issues/"
    }
  ],
  "timeout": "10s",
  "retryOn429": true,
  "retryCount": 3,
  "aliveStatusCodes": [200, 206, 301, 302]
}
```

## 驗證腳本範例

### scripts/validate-code-blocks.js
```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function validateCodeBlocks() {
  const files = glob.sync('workshop/**/*.md');
  let errors = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    
    codeBlocks.forEach((block, index) => {
      // 檢查語言標記
      if (!block.match(/^```[a-z]+/)) {
        errors.push(`${file}: 程式碼區塊 ${index + 1} 缺少語言標記`);
      }
      
      // 檢查是否正確關閉
      if (!block.endsWith('```')) {
        errors.push(`${file}: 程式碼區塊 ${index + 1} 未正確關閉`);
      }
    });
  });
  
  if (errors.length > 0) {
    console.error('發現以下問題：');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  console.log('✅ 所有程式碼區塊驗證通過');
}

validateCodeBlocks();
```

### scripts/check-chinese-typography.py
```python
import os
import re
import pangu
from pathlib import Path

def check_typography():
    errors = []
    
    for md_file in Path('workshop').rglob('*.md'):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 使用 pangu 檢查中英文間距
        fixed_content = pangu.spacing_text(content)
        
        if content != fixed_content:
            errors.append(f"{md_file}: 中英文間距需要調整")
        
        # 檢查中文標點符號
        if re.search(r'[，。！？；：、][\s]+[^\s]', content):
            errors.append(f"{md_file}: 中文標點符號後不應有空格")
    
    if errors:
        print("發現排版問題：")
        for error in errors:
            print(f"  - {error}")
        exit(1)
    
    print("✅ 中文排版檢查通過")

if __name__ == "__main__":
    check_typography()
```

### scripts/check-terminology.py
```python
import json
import re
from pathlib import Path

# 術語對照表
TERMINOLOGY = {
    "AI Conductor": "AI 指揮家",
    "self-cycling": "自循環",
    "workflow": "工作流程",
    "prompt": "提示詞",
    "test strategy": "測試策略"
}

def check_terminology():
    errors = []
    
    for md_file in Path('workshop').rglob('*.md'):
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for english, chinese in TERMINOLOGY.items():
            # 檢查是否使用了錯誤的翻譯
            pattern = f"{english}.*?(指揮者|管理者|協調者)"
            if re.search(pattern, content, re.IGNORECASE):
                errors.append(f"{md_file}: '{english}' 應翻譯為 '{chinese}'")
    
    if errors:
        print("術語使用不一致：")
        for error in errors:
            print(f"  - {error}")
        exit(1)
    
    print("✅ 術語檢查通過")

if __name__ == "__main__":
    check_terminology()
```

## 實施建議

### 1. 逐步導入

開始時只啟用基本檢查：
```yaml
jobs:
  basic-validation:
    steps:
    - name: 基本 Markdown 檢查
      run: markdownlint '**/*.md'
```

逐步新增更多驗證。

### 2. 設定例外規則

某些檔案可能需要例外處理：
```yaml
- name: 檢查 Markdown
  run: |
    markdownlint '**/*.md' \
      --ignore node_modules \
      --ignore generated \
      --ignore archive
```

### 3. 提供修復建議

在錯誤訊息中包含修復建議：
```javascript
if (error) {
  console.error(`錯誤: ${error}`);
  console.log(`建議: ${suggestion}`);
}
```

## 整合其他工具

### Vale (寫作風格檢查)
```yaml
- name: 安裝 Vale
  run: |
    wget https://github.com/errata-ai/vale/releases/download/v2.29.0/vale_2.29.0_Linux_64-bit.tar.gz
    tar -xzf vale_2.29.0_Linux_64-bit.tar.gz
    
- name: 執行風格檢查
  run: ./vale workshop/
```

### Textlint (文字校對)
```yaml
- name: 安裝 textlint
  run: |
    npm install -g textlint
    npm install -g textlint-rule-zh-tw
    
- name: 執行文字校對
  run: textlint workshop/**/*.md
```

## 報告輸出

### 產生 HTML 報告
```yaml
- name: 產生驗證報告
  run: |
    markdownlint '**/*.md' --output validation-report.html
    
- name: 上傳報告
  uses: actions/upload-artifact@v4
  with:
    name: validation-report
    path: validation-report.html
```

### 註解 PR
```yaml
- name: 註解 Pull Request
  uses: actions/github-script@v7
  if: github.event_name == 'pull_request'
  with:
    script: |
      const report = // 讀取驗證結果
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `## 內容驗證報告\n${report}`
      })
```

## 效能考量

### 快取相依套件
```yaml
- name: 快取驗證工具
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-validation-tools-${{ hashFiles('**/package-lock.json') }}
```

### 並行執行
```yaml
strategy:
  matrix:
    validation-type: [markdown, chinese, examples]
```

## 維護建議

1. **定期更新工具版本**
2. **根據反饋調整規則**
3. **記錄例外情況原因**
4. **保持驗證速度在 5 分鐘內**

---

最後更新：2024年12月