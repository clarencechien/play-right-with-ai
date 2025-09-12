# Content Directory - Single Source of Truth

這是「與 AI 正確協作」工作坊的內容主目錄，所有教學材料的單一真實來源（Single Source of Truth）。

## 📁 目錄結構

```
content/
├── chapters/                 # 所有章節內容
│   ├── 01-ai-conductor/     # 第一章：AI 指揮家
│   │   ├── index.md         # 主要章節內容
│   │   ├── metadata.yaml    # 章節元資料
│   │   ├── exercises/       # 練習檔案
│   │   ├── prompts/         # AI 提示詞範例
│   │   └── examples/        # 程式碼範例
│   ├── 02-first-movement/   # 第二章：第一樂章
│   ├── 03-second-movement/  # 第三章：第二樂章
│   ├── 04-third-movement/   # 第四章：第三樂章
│   ├── 05-fourth-movement/  # 第五章：第四樂章
│   ├── 06-final-movement/   # 第六章：最終樂章
│   ├── 07-variations/       # 第七章：變奏曲
│   └── 08-capstone/         # 第八章：Capstone 專案
├── templates/                # 內容模板
│   ├── chapter.template.md  # 章節模板
│   ├── exercise.template.md # 練習模板
│   ├── prompt.template.md   # 提示詞模板
│   └── metadata.template.yaml # 元資料模板
├── shared/                   # 共享資源
│   ├── glossary.md          # 術語表
│   ├── resources.md         # 資源連結
│   └── faq.md              # 常見問題
├── config/                   # 設定檔
│   └── build.config.js      # 建構設定
└── config.yaml              # 全域設定檔
```

## 🎯 設計原則

### 1. 單一真實來源 (Single Source of Truth)
- 所有內容只在 `/content/` 目錄維護
- 其他位置的內容都是自動生成的
- 避免手動同步和內容不一致

### 2. 結構化內容 (Structured Content)
- 使用 YAML front matter 儲存元資料
- 內容與呈現分離
- 支援多種輸出格式

### 3. 模組化設計 (Modular Design)
- 每個章節獨立管理
- 練習、提示詞、範例分開存放
- 便於維護和更新

### 4. 自動化建構 (Automated Build)
- 一個命令生成所有格式
- 自動連結驗證
- 自動格式檢查

## 📝 內容格式說明

### 章節內容 (index.md)

每個章節的主要內容檔案使用 Markdown 格式，包含 YAML front matter：

```markdown
---
chapter: "01"
title: "章節標題"
objectives:
  - "學習目標 1"
  - "學習目標 2"
prerequisites:
  - "前置需求 1"
duration: "2 hours"
---

# 章節內容
...
```

### 元資料檔案 (metadata.yaml)

詳細的章節資訊和設定：

```yaml
chapter: "01"
title:
  zh: "中文標題"
  en: "English Title"
objectives:
  - "目標 1"
prerequisites:
  - "需求 1"
duration: "2 hours"
difficulty: "beginner"
tags: ["tag1", "tag2"]
```

### 練習檔案 (exercises/)

每個練習都是獨立的 Markdown 檔案：

```
exercises/
├── exercise-01-environment-check.md
├── exercise-02-first-ai-prompt.md
├── exercise-03-bilingual-practice.md
└── solutions/
    ├── solution-01.md
    ├── solution-02.md
    └── solution-03.md
```

### 提示詞範例 (prompts/)

AI 提示詞的集合：

```
prompts/
├── basic-generation.md
├── test-strategy.md
├── debugging.md
└── optimization.md
```

### 程式碼範例 (examples/)

可執行的程式碼範例：

```
examples/
├── todo-app/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── calculator/
└── timer/
```

## 🔨 建構流程

### 生成靜態網站

```bash
# 生成 HTML 檔案到 /docs/chapters/
npm run build:html

# 生成 Markdown 檔案到 /workshop/
npm run build:markdown

# 生成 JSON API 到 /api/
npm run build:json

# 一次生成所有格式
npm run build:all
```

### 開發模式

```bash
# 監視檔案變化並自動重建
npm run dev

# 啟動開發伺服器
npm run serve
```

### 驗證和測試

```bash
# 驗證所有連結
npm run validate:links

# 檢查格式
npm run format:check

# 執行內容測試
npm run test:content
```

## 📋 內容管理指南

### 新增章節

1. 複製章節模板：
```bash
cp -r templates/chapter-template chapters/09-new-chapter
```

2. 編輯 `index.md` 和 `metadata.yaml`

3. 新增練習和範例

4. 執行建構：
```bash
npm run build:all
```

### 更新現有內容

1. 直接編輯 `/content/chapters/[chapter]/` 中的檔案

2. 執行驗證：
```bash
npm run validate
```

3. 建構更新：
```bash
npm run build:all
```

### 內容審查流程

1. **編寫**：在 `/content/` 中編寫內容
2. **預覽**：使用開發模式預覽
3. **驗證**：執行自動化測試
4. **審查**：提交 Pull Request
5. **發布**：合併後自動部署

## 🌐 多語言支援

雖然主要內容是繁體中文，但系統設計支援多語言：

```yaml
# 在 metadata.yaml 中
title:
  zh: "AI 指揮家"
  en: "AI Conductor"
  ja: "AIコンダクター"
```

## 🔄 版本控制

### 內容版本

每個章節都有版本號：

```yaml
metadata:
  version: "1.0.0"
  created: "2025-01-01"
  last_updated: "2025-01-15"
```

### 變更日誌

重要更新記錄在 `CHANGELOG.md`：

```markdown
## [1.1.0] - 2025-01-20
### Added
- 新增第九章內容
### Changed
- 更新第一章練習
### Fixed
- 修正連結錯誤
```

## 🚀 部署流程

### 自動部署

推送到 `main` 分支會觸發自動部署：

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
    paths:
      - 'content/**'
```

### 手動部署

```bash
# 建構所有內容
npm run build:all

# 部署到 GitHub Pages
npm run deploy:gh-pages

# 部署到 Netlify
npm run deploy:netlify
```

## 📊 內容統計

使用以下命令查看內容統計：

```bash
# 內容統計
npm run stats

# 輸出範例：
# 總章節數：8
# 總練習數：24
# 總字數：50,000
# 程式碼範例：120
# 提示詞模板：40
```

## 🤝 貢獻指南

### 內容貢獻

1. Fork 本專案
2. 創建功能分支：`git checkout -b content/chapter-x-improvement`
3. 提交變更：`git commit -m "content: 改進第 X 章說明"`
4. 推送分支：`git push origin content/chapter-x-improvement`
5. 開啟 Pull Request

### 內容標準

- 使用繁體中文
- 遵循既定的檔案結構
- 包含完整的元資料
- 通過所有驗證測試

### 審查標準

- 技術準確性
- 語言清晰度
- 範例可執行性
- 格式一致性

## 📞 聯絡資訊

- **GitHub Issues**: 報告問題或建議
- **Discussions**: 社群討論
- **Email**: workshop@example.com

## 📄 授權

本工作坊內容採用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 授權。

---

*最後更新：2025-01-15*
*版本：1.0.0*