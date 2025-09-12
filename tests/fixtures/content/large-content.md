---
chapter: 99
title:
  zh: "大型內容測試"
  en: "Large Content Test"
objectives:
  - "Test performance with large files"
prerequisites:
  - "None"
duration: "N/A"
tags: ["test", "performance"]
---

# Large Content File

This file is used to test performance with large content.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Section 2

```javascript
// Large code block
function processLargeData(data) {
  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(data[i] * 2);
  }
  return results;
}

const testData = Array.from({ length: 1000 }, (_, i) => i);
const processed = processLargeData(testData);
console.log('Processed:', processed.length, 'items');
```

## Section 3

More content here. This section contains various formatting elements:

- **Bold text**
- *Italic text*
- `Inline code`
- [Links](https://example.com)

### Subsection 3.1

Nested content with tables:

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

### Subsection 3.2

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

## Section 4

> Blockquote: This is a quoted section with important information.

## Section 5

The end of the large content file. This pattern would be repeated many times in a real large file.