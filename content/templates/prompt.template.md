# AI 提示詞模板：[提示詞用途]

## 模板資訊

- **類別**：[生成/分析/測試/除錯/優化]
- **適用 AI**：Claude, Gemini, GPT
- **複雜度**：[基礎/中級/進階]
- **預估 Token**：~[數量]
- **版本**：1.0.0

## 使用情境

說明這個提示詞模板適用的具體情境，包括：
- 什麼時候使用
- 解決什麼問題
- 預期達成什麼目標

## 提示詞結構

### 基礎版本

```markdown
[Role Definition]
You are an expert [角色定義]...

[Context]
- Context point 1
- Context point 2
- Context point 3

[Task]
Please [具體任務描述]...

[Requirements]
1. Requirement 1
2. Requirement 2
3. Requirement 3

[Output Format]
- Format specification
- Expected structure
- Language requirements

[Constraints]
- Constraint 1
- Constraint 2
```

### 雙語策略版本

```markdown
[English Planning]
## Technical Specifications
- Technology stack: [技術棧]
- Architecture: [架構]
- Design patterns: [設計模式]

## Requirements
1. Functional requirement 1
2. Functional requirement 2
3. Non-functional requirement

## Constraints
- Performance: [效能要求]
- Security: [安全要求]
- Compatibility: [相容性]

[Chinese Delivery]
## 輸出要求
- 所有註解使用繁體中文
- 變數命名規則：[規則說明]
- 錯誤訊息：友善的繁體中文提示

## 本地化設定
- 日期格式：YYYY年MM月DD日
- 時間格式：24小時制
- 數字格式：千分位逗號

## 使用者介面
- 所有UI文字使用繁體中文
- 保持台灣用語習慣
- 避免簡體中文用詞
```

### 進階鏈式版本

```markdown
[Step 1: Analysis]
First, analyze the requirements:
- Understand the core problem
- Identify key components
- Define success criteria

[Step 2: Design]
Based on the analysis:
- Create high-level architecture
- Define interfaces
- Plan implementation approach

[Step 3: Implementation]
Implement the solution:
- Write clean, maintainable code
- Include comprehensive comments
- Follow best practices

[Step 4: Validation]
Validate the solution:
- Check all requirements
- Verify edge cases
- Ensure quality standards

[Step 5: Documentation]
Document everything:
- API documentation
- Usage examples
- Troubleshooting guide
```

## 變數說明

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `[角色定義]` | AI 扮演的專業角色 | `full-stack developer`, `QA engineer` |
| `[技術棧]` | 使用的技術框架 | `React + Node.js`, `Vue + Django` |
| `[架構]` | 系統架構模式 | `MVC`, `Microservices`, `Serverless` |
| `[設計模式]` | 採用的設計模式 | `Singleton`, `Factory`, `Observer` |
| `[效能要求]` | 效能指標 | `< 100ms response time`, `> 1000 TPS` |

## 最佳實踐

### DO - 應該做的

- ✅ **明確定義角色**：讓 AI 清楚自己的專業定位
- ✅ **提供充足上下文**：包含所有必要的背景資訊
- ✅ **結構化要求**：使用清晰的條列式說明
- ✅ **指定輸出格式**：明確說明期望的回應格式
- ✅ **設定合理約束**：加入必要的限制條件

### DON'T - 應該避免的

- ❌ **模糊的指令**：避免使用不明確的描述
- ❌ **過長的提示**：避免超過 2000 字的提示詞
- ❌ **矛盾的要求**：確保要求之間沒有衝突
- ❌ **缺少範例**：盡可能提供具體範例
- ❌ **忽略錯誤處理**：記得要求包含錯誤處理

## 使用範例

### 範例 1：生成 TODO 應用

```markdown
[English Planning]
Create a TODO application with:
- CRUD operations for tasks
- Priority levels (High/Medium/Low)
- Due date tracking
- Local storage persistence
- Responsive design

Tech stack: Vanilla JavaScript, HTML5, CSS3

[Chinese Delivery]
應用程式名稱：任務管理大師
所有介面文字、錯誤訊息、提示文字皆使用繁體中文
日期選擇器使用台灣格式
```

**預期輸出特徵**：
- 完整的 HTML/CSS/JS 程式碼
- 繁體中文介面
- 清晰的程式碼註解
- 錯誤處理機制

### 範例 2：測試策略生成

```markdown
[Role]
You are a senior QA engineer specializing in E2E testing.

[Context]
Application: E-commerce website
Key features: Product browsing, cart, checkout, payment
Technology: React + Node.js

[Task]
Design comprehensive E2E test scenarios covering:
1. Critical user journeys
2. Edge cases
3. Error scenarios
4. Performance considerations

[Output]
Provide test cases in Gherkin format with Chinese descriptions.
```

**預期輸出特徵**：
- 結構化的測試案例
- Gherkin 語法格式
- 中文場景描述
- 完整的測試覆蓋

## 效果評估

### 評估指標

1. **準確性**：輸出是否符合需求
2. **完整性**：是否涵蓋所有要求
3. **可用性**：程式碼是否可直接使用
4. **品質**：程式碼品質和最佳實踐
5. **效率**：生成速度和 Token 使用

### 優化建議

如果輸出不理想，可以嘗試：

1. **增加具體範例**
   ```markdown
   For example:
   Input: [範例輸入]
   Expected Output: [預期輸出]
   ```

2. **細化要求**
   ```markdown
   Specifically:
   - Point 1 means...
   - Point 2 should include...
   ```

3. **調整結構**
   - 將複雜提示分解為多個步驟
   - 使用更清晰的段落劃分

## 常見問題

### Q1: AI 輸出不符合預期格式怎麼辦？

**解決方案**：
1. 提供具體的輸出範例
2. 使用更明確的格式說明
3. 加入 "Format exactly as shown" 的強調

### Q2: 如何讓 AI 保持一致的程式碼風格？

**解決方案**：
```markdown
[Code Style]
- Use camelCase for variables
- Use PascalCase for classes
- Max line length: 80 characters
- Indentation: 2 spaces
```

### Q3: AI 生成的中文不自然怎麼辦？

**解決方案**：
- 提供良好的中文範例
- 指定使用「台灣繁體中文」
- 避免直譯，要求意譯

## 版本歷史

| 版本 | 日期 | 更新內容 |
|------|------|----------|
| 1.0.0 | 2025-01-15 | 初始版本 |
| 1.0.1 | - | 待更新 |

## 相關資源

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)

## 貢獻指南

歡迎改進這個提示詞模板：
1. Fork 本專案
2. 測試您的改進
3. 提交 Pull Request
4. 說明改進效果

---

*最後更新：2025-01-15*
*維護者：Workshop Team*