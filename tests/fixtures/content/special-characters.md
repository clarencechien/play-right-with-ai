---
chapter: 100
title:
  zh: "特殊字符測試 🎉"
  en: "Special Characters Test 🚀"
objectives:
  - "Test handling of special characters"
  - "Ensure XSS protection"
prerequisites:
  - "Understanding of character encoding"
duration: "30 minutes"
tags: ["test", "security", "encoding"]
---

# 特殊字符和安全性測試 🎨

## 中文內容測試

這是包含繁體中文的內容。我們需要確保所有的中文字符都能正確顯示。

### 特殊符號

- 版權符號：©
- 商標符號：™ ®
- 數學符號：≤ ≥ ≠ ∞ ∑ ∏
- 箭頭：← → ↑ ↓ ⇐ ⇒
- 表情符號：😀 😎 🎉 🚀 💻 🔥

## XSS 防護測試

以下內容不應該被執行：

<script>alert('XSS Attack!');</script>

<img src="x" onerror="alert('XSS')">

<a href="javascript:alert('XSS')">Click me</a>

## HTML 實體測試

特殊 HTML 字符：< > & " '

```html
<!-- This should be escaped -->
<div class="test">
  <script>console.log("This should not execute");</script>
</div>
```

## 程式碼中的特殊字符

```javascript
const specialString = "String with \" quotes and \\ backslashes";
const unicode = "\u{1F600} \u{1F60E}"; // 😀 😎
const template = `Template with ${variable} and \${escaped}`;
```

## URL 編碼測試

- 空格測試：[Link with spaces](./my file.md)
- 特殊字符：[Link?with&special=chars](./test.md?param=value&other=true)
- 中文路徑：[中文連結](./測試檔案.md)

## 國際化測試

### 日文
こんにちは、世界！

### 韓文
안녕하세요, 세계!

### 阿拉伯文 (RTL)
مرحبا بالعالم!

### 俄文
Привет, мир!

## 邊界測試

Very long line without breaks: Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Zero-width 字符測試

包含零寬度字符的文字：test​test (中間有 zero-width space)

## 結論

所有特殊字符都應該被正確處理和顯示。