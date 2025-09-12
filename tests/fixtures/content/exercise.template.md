# 練習：{{exercise_title}}

## 目標

{{exercise_objective}}

## 說明

{{exercise_description}}

## 步驟

{{#each steps}}
{{@index_1}}. {{this}}
{{/each}}

## 預期結果

{{expected_outcome}}

## 提示

{{#if hints}}
<details>
<summary>需要幫助嗎？點擊查看提示</summary>

{{#each hints}}
- {{this}}
{{/each}}

</details>
{{/if}}

## 解答

<details>
<summary>查看解答</summary>

```{{solution_language}}
{{solution_code}}
```

{{solution_explanation}}

</details>

## 延伸練習

{{#if extensions}}
{{#each extensions}}
- {{this}}
{{/each}}
{{/if}}

---
<!-- Exercise ID: {{exercise_id}} -->
<!-- Chapter: {{chapter_id}} -->
<!-- Difficulty: {{difficulty}} -->
<!-- Estimated Time: {{estimated_time}} -->