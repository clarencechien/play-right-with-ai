# AI Prompt: {{prompt_title}}

## 類型
{{prompt_type}}

## 目的
{{prompt_purpose}}

## 前置條件
{{#each prerequisites}}
- {{this}}
{{/each}}

## Prompt 內容

```
{{prompt_content}}
```

## 使用說明

1. **準備階段**：
   {{preparation_steps}}

2. **執行階段**：
   {{execution_steps}}

3. **驗證階段**：
   {{validation_steps}}

## 參數說明

{{#if parameters}}
| 參數名稱 | 說明 | 範例值 |
|---------|------|-------|
{{#each parameters}}
| {{name}} | {{description}} | {{example}} |
{{/each}}
{{/if}}

## 預期輸出

```{{output_format}}
{{expected_output_example}}
```

## 常見問題

{{#if common_issues}}
{{#each common_issues}}
### {{issue}}
{{solution}}

{{/each}}
{{/if}}

## 變化版本

{{#if variations}}
{{#each variations}}
### {{name}}
{{description}}

```
{{prompt}}
```

{{/each}}
{{/if}}

## 最佳實踐

{{#each best_practices}}
- {{this}}
{{/each}}

## 相關資源

{{#each resources}}
- [{{name}}]({{url}})
{{/each}}

---
<!-- Prompt ID: {{prompt_id}} -->
<!-- Category: {{category}} -->
<!-- AI Models: {{supported_models}} -->
<!-- Last Updated: {{last_updated}} -->