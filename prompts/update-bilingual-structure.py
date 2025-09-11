#!/usr/bin/env python3
"""
Bilingual Structure Update Script
Updates prompt files to follow the "Think in English, Output in Chinese" pattern
"""

import os
import re
from pathlib import Path

def extract_sections(content):
    """Extract existing sections from content"""
    sections = {}
    
    # Try to identify existing English technical content
    english_patterns = [
        r'\[.*?Request.*?\](.*?)(?=\[|$)',
        r'\[.*?Requirements.*?\](.*?)(?=\[|$)',
        r'\[.*?Technical.*?\](.*?)(?=\[|$)',
        r'\[.*?Implementation.*?\](.*?)(?=\[|$)',
    ]
    
    # Try to identify Chinese output requirements
    chinese_patterns = [
        r'\[.*?Chinese.*?\](.*?)(?=\[|$)',
        r'\[.*?中文.*?\](.*?)(?=\[|$)',
        r'新功能的中文介面：(.*?)(?=```|$)',
    ]
    
    for pattern in english_patterns:
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        if matches:
            sections['english'] = matches[0].strip()
            break
    
    for pattern in chinese_patterns:
        matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
        if matches:
            sections['chinese'] = matches[0].strip()
            break
    
    return sections

def update_test_file(file_path):
    """Update test files with bilingual structure"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract test ID and purpose
    test_id_match = re.search(r'Test ID: (.*?)$', content, re.MULTILINE)
    purpose_match = re.search(r'Purpose\n(.*?)(?=###|\n\n)', content, re.DOTALL)
    
    test_id = test_id_match.group(1) if test_id_match else "TEST-001"
    purpose = purpose_match.group(1).strip() if purpose_match else ""
    
    # Create updated content
    updated = f"""# {file_path.stem.replace('-', ' ').title()} Test Criteria

## Test ID: {test_id}

## Technical Specification (Think in English)

### Test Objectives
{purpose if purpose else "Validate that the prompt generates consistent, high-quality output."}

### Test Criteria
1. **Consistency**: Output structure remains stable across multiple runs
2. **Completeness**: All required elements are present
3. **Correctness**: Technical implementation is accurate
4. **Quality**: Code follows best practices

### Validation Process
```markdown
1. Execute prompt 5 times with same input
2. Compare outputs for structural consistency
3. Validate technical correctness
4. Check Chinese localization accuracy
5. Measure performance metrics
```

## 輸出要求 (Output in Chinese)

### 測試驗證項目
- [ ] 輸出結構一致性
- [ ] 功能完整性
- [ ] 中文本地化正確
- [ ] 程式碼品質符合標準
- [ ] 錯誤處理完善

### 評分標準
- **優秀 (90-100)**: 完全符合所有要求
- **良好 (70-89)**: 主要功能正確，細節需改進
- **及格 (60-69)**: 基本功能可用，需要優化
- **不及格 (<60)**: 需要重新設計提示詞

## Example / 範例

```javascript
// 測試執行範例
async function testPrompt(prompt, iterations = 5) {{
  const results = [];
  
  for (let i = 0; i < iterations; i++) {{
    // 執行提示詞
    const output = await executePrompt(prompt);
    
    // 驗證輸出
    const validation = {{
      hasStructure: checkStructure(output),
      hasChineseUI: checkChineseLocalization(output),
      isCorrect: checkCorrectness(output)
    }};
    
    results.push(validation);
  }}
  
  // 計算一致性分數
  return calculateConsistency(results);
}}
```

## Original Content

{content}
"""
    
    return updated

def update_feature_file(file_path):
    """Update feature files with bilingual structure"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    sections = extract_sections(content)
    
    # Preserve title
    title_match = re.search(r'^# (.*?)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else file_path.stem.replace('-', ' ').title()
    
    updated = f"""# {title}

## Technical Specification (Think in English)

```markdown
{sections.get('english', 'Add technical requirements here...')}
```

## 輸出要求 (Output in Chinese)

```markdown
{sections.get('chinese', '中文輸出要求...')}
```

## Example / 範例

```javascript
// Implementation example
// 實作範例
```

## Original Content (To Be Integrated)

{content}
"""
    
    return updated

def check_needs_update(file_path):
    """Check if file needs bilingual structure update"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    required = [
        "Technical Specification (Think in English)",
        "輸出要求 (Output in Chinese)",
        "Example / 範例"
    ]
    
    return not all(req in content for req in required)

def main():
    """Main update process"""
    prompts_dir = Path('/workspace/play-right-with-ai/prompts')
    
    files_to_update = [
        'chapter-02/add-features.md',
        'chapter-02/app-generation.test.md',
        'chapter-02/bilingual-comparison.md',
        'chapter-02/refine-ui.md',
        'chapter-02-app-generation/todo-app-bilingual.md',
        'chapter-03/test-strategy-prompt.md',
        'chapter-03/test-strategy.test.md',
        'chapter-04/playwright-generator.md',
        'chapter-04/playwright-scripts.test.md',
        'chapter-05/failure-analysis.test.md',
        'chapter-06/self-repair.test.md',
    ]
    
    print("=== Bilingual Structure Update Tool ===\n")
    
    for file_rel in files_to_update:
        file_path = prompts_dir / file_rel
        
        if not file_path.exists():
            print(f"⚠️  File not found: {file_rel}")
            continue
        
        if not check_needs_update(file_path):
            print(f"✓ Already compliant: {file_rel}")
            continue
        
        print(f"📝 Processing: {file_rel}")
        
        # Create backup
        backup_path = file_path.with_suffix('.md.backup')
        
        try:
            # Choose update strategy based on file type
            if '.test.md' in str(file_path):
                updated_content = update_test_file(file_path)
            else:
                updated_content = update_feature_file(file_path)
            
            # Save to review file first
            review_path = file_path.with_suffix('.md.review')
            with open(review_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            
            print(f"   → Created review file: {review_path}")
            
        except Exception as e:
            print(f"   ✗ Error: {e}")
    
    print("\n=== Update Complete ===")
    print("Review files have been created with .review extension")
    print("Manually review and rename to replace original files")

if __name__ == "__main__":
    main()