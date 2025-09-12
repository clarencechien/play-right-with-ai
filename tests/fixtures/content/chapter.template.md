---
chapter: {{chapter_number}}
title:
  zh: "{{title_zh}}"
  en: "{{title_en}}"
objectives:
  {{#each objectives}}
  - "{{this}}"
  {{/each}}
prerequisites:
  {{#each prerequisites}}
  - "{{this}}"
  {{/each}}
duration: "{{duration}}"
tags: {{tags}}
---

# {{title_zh}}

## 學習目標

在本章節中，您將學習：

{{#each objectives}}
{{@index_1}}. {{this}}
{{/each}}

## 前置需求

{{#each prerequisites}}
- {{this}}
{{/each}}

## 核心概念

{{content}}

## 實作練習

{{exercises}}

## 程式碼範例

```javascript
{{code_examples}}
```

## 總結

{{summary}}

## 下一步

{{next_steps}}

---
<!-- Source: content/chapters/{{chapter_id}}/index.md -->
<!-- Generated: {{timestamp}} -->
<!-- Version: {{version}} -->