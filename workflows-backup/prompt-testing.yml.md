# Prompt Testing 工作流程範本文件

## 概述

`prompt-testing.yml` 是建議的提示詞測試工作流程，用於驗證工作坊中的 AI 提示詞是否能產生預期結果。這個工作流程測試各種 AI 模型的相容性和輸出品質。

## 建議的工作流程結構

```yaml
name: Prompt Testing

on:
  schedule:
    # 每週日 UTC 時間 02:00 執行
    - cron: '0 2 * * 0'
  workflow_dispatch:
    inputs:
      test_model:
        description: '要測試的 AI 模型'
        required: false
        default: 'all'
        type: choice
        options:
          - all
          - claude
          - gemini
          - gpt4
      test_chapter:
        description: '要測試的章節'
        required: false
        default: 'all'

jobs:
  test-claude-prompts:
    if: ${{ github.event.inputs.test_model == 'all' || github.event.inputs.test_model == 'claude' }}
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
    
    - name: 安裝 Anthropic SDK
      run: |
        npm install @anthropic-ai/sdk
    
    - name: 測試 Claude 提示詞
      env:
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      run: |
        node scripts/test-prompts-claude.js \
          --chapter ${{ github.event.inputs.test_chapter || 'all' }}
    
    - name: 上傳測試結果
      uses: actions/upload-artifact@v4
      with:
        name: claude-prompt-results
        path: test-results/claude/

  test-gemini-prompts:
    if: ${{ github.event.inputs.test_model == 'all' || github.event.inputs.test_model == 'gemini' }}
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    
    - name: 安裝 Google AI SDK
      run: |
        pip install google-generativeai
    
    - name: 測試 Gemini 提示詞
      env:
        GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
      run: |
        python scripts/test-prompts-gemini.py \
          --chapter ${{ github.event.inputs.test_chapter || 'all' }}
    
    - name: 上傳測試結果
      uses: actions/upload-artifact@v4
      with:
        name: gemini-prompt-results
        path: test-results/gemini/

  test-gpt4-prompts:
    if: ${{ github.event.inputs.test_model == 'all' || github.event.inputs.test_model == 'gpt4' }}
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 設定 Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
    
    - name: 安裝 OpenAI SDK
      run: |
        npm install openai
    
    - name: 測試 GPT-4 提示詞
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        node scripts/test-prompts-gpt4.js \
          --chapter ${{ github.event.inputs.test_chapter || 'all' }}
    
    - name: 上傳測試結果
      uses: actions/upload-artifact@v4
      with:
        name: gpt4-prompt-results
        path: test-results/gpt4/

  analyze-results:
    needs: [test-claude-prompts, test-gemini-prompts, test-gpt4-prompts]
    if: always()
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: 下載所有測試結果
      uses: actions/download-artifact@v4
      with:
        path: test-results/
    
    - name: 分析測試結果
      run: |
        python scripts/analyze-prompt-results.py
    
    - name: 產生比較報告
      run: |
        python scripts/generate-comparison-report.py > comparison-report.md
    
    - name: 上傳比較報告
      uses: actions/upload-artifact@v4
      with:
        name: prompt-comparison-report
        path: comparison-report.md
    
    - name: 發送通知
      if: failure()
      run: |
        echo "⚠️ 提示詞測試發現問題，請查看報告"
```

## 測試腳本範例

### scripts/test-prompts-claude.js
```javascript
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testPrompt(promptFile, expectedOutput) {
  const prompt = await fs.readFile(promptFile, 'utf8');
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    
    return {
      success: true,
      output: message.content[0].text,
      matches_expected: compareOutputs(message.content[0].text, expectedOutput),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function compareOutputs(actual, expected) {
  // 實作輸出比較邏輯
  // 可以是結構檢查、關鍵字檢查等
  const actualLower = actual.toLowerCase();
  const expectedKeywords = extractKeywords(expected);
  
  return expectedKeywords.every(keyword => 
    actualLower.includes(keyword.toLowerCase())
  );
}

async function testChapter(chapterNum) {
  const chapterDir = path.join('prompts', `chapter-${chapterNum}`);
  const prompts = await fs.readdir(chapterDir);
  
  const results = [];
  for (const promptFile of prompts) {
    if (promptFile.endsWith('.md')) {
      const expectedFile = promptFile.replace('.md', '-expected.md');
      const expected = await fs.readFile(
        path.join(chapterDir, expectedFile), 
        'utf8'
      ).catch(() => '');
      
      const result = await testPrompt(
        path.join(chapterDir, promptFile),
        expected
      );
      
      results.push({
        prompt: promptFile,
        ...result,
      });
      
      // 避免 API 速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const chapterArg = args.find(arg => arg.startsWith('--chapter='));
  const chapter = chapterArg ? chapterArg.split('=')[1] : 'all';
  
  let allResults = {};
  
  if (chapter === 'all') {
    for (let i = 1; i <= 8; i++) {
      console.log(`測試第 ${i} 章提示詞...`);
      allResults[`chapter-${i}`] = await testChapter(i);
    }
  } else {
    console.log(`測試第 ${chapter} 章提示詞...`);
    allResults[`chapter-${chapter}`] = await testChapter(chapter);
  }
  
  // 儲存結果
  await fs.mkdir('test-results/claude', { recursive: true });
  await fs.writeFile(
    'test-results/claude/results.json',
    JSON.stringify(allResults, null, 2)
  );
  
  // 檢查是否有失敗
  const hasFailures = Object.values(allResults).some(chapterResults =>
    chapterResults.some(result => !result.success || !result.matches_expected)
  );
  
  if (hasFailures) {
    console.error('❌ 部分提示詞測試失敗');
    process.exit(1);
  }
  
  console.log('✅ 所有提示詞測試通過');
}

main().catch(console.error);
```

### scripts/test-prompts-gemini.py
```python
import os
import json
import time
import argparse
from pathlib import Path
import google.generativeai as genai

genai.configure(api_key=os.environ['GOOGLE_API_KEY'])

def test_prompt(prompt_file, expected_output):
    """測試單一提示詞"""
    with open(prompt_file, 'r', encoding='utf-8') as f:
        prompt = f.read()
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'output': response.text,
            'matches_expected': compare_outputs(response.text, expected_output)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def compare_outputs(actual, expected):
    """比較實際輸出與預期輸出"""
    if not expected:
        return True  # 沒有預期輸出時預設通過
    
    # 實作比較邏輯
    actual_lower = actual.lower()
    expected_keywords = extract_keywords(expected)
    
    return all(keyword.lower() in actual_lower for keyword in expected_keywords)

def extract_keywords(text):
    """提取關鍵字"""
    # 簡單實作，可以根據需求擴展
    keywords = []
    lines = text.split('\n')
    for line in lines:
        if line.startswith('#'):  # 標題
            keywords.append(line.strip('#').strip())
    return keywords

def test_chapter(chapter_num):
    """測試特定章節的所有提示詞"""
    chapter_dir = Path(f'prompts/chapter-{chapter_num}')
    if not chapter_dir.exists():
        return []
    
    results = []
    for prompt_file in chapter_dir.glob('*.md'):
        if '-expected' not in prompt_file.name:
            expected_file = prompt_file.with_suffix('').with_suffix('-expected.md')
            expected = ''
            if expected_file.exists():
                with open(expected_file, 'r', encoding='utf-8') as f:
                    expected = f.read()
            
            result = test_prompt(prompt_file, expected)
            result['prompt'] = prompt_file.name
            results.append(result)
            
            # 避免 API 速率限制
            time.sleep(1)
    
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--chapter', default='all')
    args = parser.parse_args()
    
    all_results = {}
    
    if args.chapter == 'all':
        for i in range(1, 9):
            print(f'測試第 {i} 章提示詞...')
            all_results[f'chapter-{i}'] = test_chapter(i)
    else:
        print(f'測試第 {args.chapter} 章提示詞...')
        all_results[f'chapter-{args.chapter}'] = test_chapter(args.chapter)
    
    # 儲存結果
    output_dir = Path('test-results/gemini')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_dir / 'results.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    
    # 檢查是否有失敗
    has_failures = any(
        not result['success'] or not result.get('matches_expected', True)
        for chapter_results in all_results.values()
        for result in chapter_results
    )
    
    if has_failures:
        print('❌ 部分提示詞測試失敗')
        exit(1)
    
    print('✅ 所有提示詞測試通過')

if __name__ == '__main__':
    main()
```

### scripts/analyze-prompt-results.py
```python
import json
import os
from pathlib import Path
from collections import defaultdict

def load_results(model_name):
    """載入測試結果"""
    result_file = Path(f'test-results/{model_name}/results.json')
    if result_file.exists():
        with open(result_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def analyze_model_performance(results):
    """分析單一模型的表現"""
    total = 0
    success = 0
    matched = 0
    
    for chapter_results in results.values():
        for result in chapter_results:
            total += 1
            if result.get('success'):
                success += 1
                if result.get('matches_expected'):
                    matched += 1
    
    return {
        'total': total,
        'success': success,
        'matched': matched,
        'success_rate': success / total if total > 0 else 0,
        'match_rate': matched / total if total > 0 else 0
    }

def compare_models():
    """比較不同模型的表現"""
    models = ['claude', 'gemini', 'gpt4']
    comparison = {}
    
    for model in models:
        results = load_results(model)
        if results:
            comparison[model] = analyze_model_performance(results)
    
    return comparison

def find_problematic_prompts():
    """找出有問題的提示詞"""
    models = ['claude', 'gemini', 'gpt4']
    problems = defaultdict(list)
    
    for model in models:
        results = load_results(model)
        for chapter, chapter_results in results.items():
            for result in chapter_results:
                if not result.get('success') or not result.get('matches_expected'):
                    problems[result['prompt']].append({
                        'model': model,
                        'chapter': chapter,
                        'success': result.get('success'),
                        'matched': result.get('matches_expected')
                    })
    
    return dict(problems)

def generate_summary():
    """產生摘要報告"""
    comparison = compare_models()
    problems = find_problematic_prompts()
    
    print("# 提示詞測試分析報告\n")
    
    print("## 模型表現比較\n")
    for model, stats in comparison.items():
        print(f"### {model.upper()}")
        print(f"- 測試總數: {stats['total']}")
        print(f"- 成功執行: {stats['success']} ({stats['success_rate']:.1%})")
        print(f"- 輸出匹配: {stats['matched']} ({stats['match_rate']:.1%})")
        print()
    
    if problems:
        print("## 有問題的提示詞\n")
        for prompt, issues in problems.items():
            print(f"### {prompt}")
            for issue in issues:
                status = "✅" if issue['success'] else "❌"
                match = "✅" if issue['matched'] else "❌"
                print(f"- {issue['model']}: 執行{status} 匹配{match}")
            print()
    
    # 產生建議
    print("## 建議\n")
    if len(problems) > 0:
        print("- 部分提示詞在某些模型上表現不佳，建議調整以提高相容性")
        print("- 考慮為不同模型提供特定版本的提示詞")
    else:
        print("- 所有提示詞在各模型上表現良好")

def main():
    generate_summary()
    
    # 儲存詳細分析
    analysis = {
        'comparison': compare_models(),
        'problems': find_problematic_prompts()
    }
    
    with open('test-results/analysis.json', 'w', encoding='utf-8') as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    main()
```

## 提示詞組織結構

建議的目錄結構：
```
prompts/
├── chapter-1/
│   ├── setup-environment.md
│   ├── setup-environment-expected.md
│   └── metadata.json
├── chapter-2/
│   ├── generate-todo-app.md
│   ├── generate-todo-app-expected.md
│   └── metadata.json
└── shared/
    ├── bilingual-prompt-template.md
    └── common-patterns.md
```

### metadata.json 範例
```json
{
  "chapter": 2,
  "prompts": [
    {
      "name": "generate-todo-app",
      "description": "生成 TODO 應用程式",
      "models": ["claude", "gemini", "gpt4"],
      "difficulty": "medium",
      "expected_output_type": "code",
      "validation_criteria": {
        "must_include": ["function", "class", "TODO"],
        "language": "javascript",
        "min_lines": 50
      }
    }
  ]
}
```

## 測試策略

### 1. 回歸測試
定期執行以確保提示詞持續有效：
```yaml
schedule:
  - cron: '0 0 * * 0'  # 每週日執行
```

### 2. 相容性測試
測試新模型版本：
```yaml
env:
  CLAUDE_MODEL: claude-3-opus-20240229
  GEMINI_MODEL: gemini-1.5-pro
  GPT_MODEL: gpt-4-turbo-preview
```

### 3. 效能測試
記錄執行時間和 token 使用：
```javascript
const start = Date.now();
const response = await callAPI(prompt);
const duration = Date.now() - start;

results.push({
  duration,
  tokens_used: response.usage?.total_tokens
});
```

## 成本控制

### 設定預算限制
```javascript
const DAILY_BUDGET = 10; // USD
let dailyCost = 0;

async function testWithBudget(prompt) {
  const estimatedCost = estimatePromptCost(prompt);
  
  if (dailyCost + estimatedCost > DAILY_BUDGET) {
    console.warn('超過每日預算限制，跳過測試');
    return null;
  }
  
  const result = await testPrompt(prompt);
  dailyCost += result.actualCost;
  return result;
}
```

### 使用較便宜的模型進行初步測試
```yaml
strategy:
  matrix:
    include:
      - model: claude-3-haiku  # 便宜
        test_type: smoke
      - model: claude-3-sonnet  # 中等
        test_type: full
      - model: claude-3-opus    # 昂貴
        test_type: critical
```

## 監控和警報

### Slack 通知
```yaml
- name: 發送 Slack 通知
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "提示詞測試失敗",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "工作流程: ${{ github.workflow }}\n狀態: ${{ job.status }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Email 通知
```yaml
- name: 發送 Email 通知
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: 提示詞測試失敗通知
    to: team@example.com
    from: GitHub Actions
    body: 請查看測試報告了解詳情
```

## 優化建議

1. **快取模型回應**
   - 相同提示詞不重複測試
   - 儲存歷史結果供比較

2. **並行測試**
   - 不同模型並行執行
   - 章節間並行測試

3. **智慧重試**
   - API 錯誤自動重試
   - 指數退避策略

4. **差異化測試**
   - 只測試變更的提示詞
   - 根據風險等級決定測試範圍

---

最後更新：2024年12月