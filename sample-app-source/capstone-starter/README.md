# Capstone 專案模板

這是「Play right with AI」工作坊的期末專案模板，提供基礎架構讓學員展示完整的 AI 驅動開發能力。

## 專案要求

### 核心功能要求
1. **應用程式開發**
   - 至少包含 5 個以上的功能模組
   - 實現 CRUD 完整操作
   - 包含使用者互動介面
   - 資料持久化機制

2. **測試覆蓋**
   - 單元測試覆蓋率 > 80%
   - 端對端測試涵蓋主要使用流程
   - 包含錯誤處理測試
   - 效能測試基準

3. **AI 整合**
   - 使用 AI 生成初始程式碼
   - AI 驅動的測試案例生成
   - AI 輔助除錯和修復
   - 文件自動生成

## 專案結構

```
capstone-starter/
├── src/                    # 應用程式原始碼
│   ├── index.html         # 主頁面
│   ├── app.js            # 應用邏輯
│   ├── styles.css        # 樣式表
│   └── modules/          # 功能模組
├── tests/                 # 測試檔案
│   ├── unit/            # 單元測試
│   ├── integration/     # 整合測試
│   └── e2e/            # 端對端測試
├── docs/                 # 文件
│   ├── architecture.md  # 架構設計
│   ├── api.md          # API 文件
│   └── testing.md      # 測試策略
├── .cursorrules         # AI 輔助規則
└── README.md           # 專案說明
```

## 建議專案主題

### 1. 任務管理系統
- 專案和任務階層管理
- 團隊協作功能
- 時程追蹤
- 報表生成

### 2. 個人財務管理
- 收支記錄
- 預算規劃
- 投資追蹤
- 視覺化報表

### 3. 學習平台
- 課程管理
- 進度追蹤
- 測驗系統
- 成績分析

### 4. 社群平台
- 貼文發布
- 評論互動
- 標籤系統
- 搜尋功能

### 5. 庫存管理系統
- 商品管理
- 進出貨記錄
- 低庫存警告
- 報表分析

## 開發流程

### 第一階段：需求分析與設計
```
提示詞範例：
"請為一個[專案類型]應用設計功能架構，包含：
1. 核心功能模組清單
2. 資料模型設計
3. 使用者介面流程
4. 技術架構建議"
```

### 第二階段：TDD 開發
```
提示詞範例：
"為[功能名稱]撰寫 Playwright 測試規範，包含：
1. 正常流程測試
2. 錯誤處理測試
3. 邊界條件測試
4. 效能基準測試"
```

### 第三階段：實作功能
```
提示詞範例：
"根據以下測試規範，實作[功能名稱]：
[貼上測試程式碼]
要求：
1. 通過所有測試
2. 遵循最佳實踐
3. 包含錯誤處理
4. 加入適當註解"
```

### 第四階段：除錯與優化
```
提示詞範例：
"分析以下測試失敗結果，提供修復方案：
[貼上錯誤訊息]
原始碼：
[貼上相關程式碼]"
```

### 第五階段：文件生成
```
提示詞範例：
"為這個應用生成完整文件，包含：
1. 使用說明
2. API 文件
3. 部署指南
4. 測試報告"
```

## 評分標準

### 功能完整性 (30%)
- 核心功能實現
- 使用者體驗
- 錯誤處理
- 效能表現

### 測試品質 (30%)
- 測試覆蓋率
- 測試案例設計
- 測試可維護性
- CI/CD 整合

### AI 應用 (25%)
- AI 工具使用效率
- 提示詞品質
- 自動化程度
- 創新應用

### 文件與展示 (15%)
- 文件完整性
- 程式碼品質
- 展示清晰度
- 問題解決能力

## 時程規劃

### Week 1: 設計與規劃
- [ ] 確定專案主題
- [ ] 完成需求分析
- [ ] 設計系統架構
- [ ] 建立專案結構

### Week 2: 核心開發
- [ ] 實作主要功能
- [ ] 撰寫單元測試
- [ ] 基本 UI 完成
- [ ] 資料模型實作

### Week 3: 測試與優化
- [ ] 完成 E2E 測試
- [ ] 效能優化
- [ ] 錯誤修復
- [ ] UI/UX 改善

### Week 4: 文件與發表
- [ ] 完成所有文件
- [ ] 準備展示簡報
- [ ] 最終測試
- [ ] 專案發表

## AI 輔助工具建議

### 程式碼生成
- Claude Code
- GitHub Copilot
- Cursor AI

### 測試生成
- Playwright Codegen
- Claude for test scenarios
- Gemini for test data

### 文件生成
- Claude for documentation
- Mintlify Doc Writer
- README AI

### 除錯輔助
- Claude Debug Assistant
- Gemini Code Review
- ChatGPT Error Analysis

## 提交要求

### 必要檔案
1. 完整原始碼
2. 測試套件
3. 專案文件
4. 展示影片/簡報

### 提交格式
```
capstone-[學員姓名]/
├── src/
├── tests/
├── docs/
├── demo/
│   ├── presentation.pdf
│   └── demo-video.mp4
├── README.md
└── REFLECTION.md  # 學習心得
```

### 評估項目清單
- [ ] 功能符合需求
- [ ] 測試全部通過
- [ ] 文件完整清晰
- [ ] AI 應用創新
- [ ] 程式碼品質良好
- [ ] 展示效果出色

## 學習資源

### 官方文件
- [Playwright Documentation](https://playwright.dev)
- [MDN Web Docs](https://developer.mozilla.org)
- [JavaScript Info](https://javascript.info)

### AI 工具教學
- [Claude 提示詞最佳實踐](https://www.anthropic.com/index/prompting-claude)
- [GitHub Copilot 指南](https://docs.github.com/en/copilot)
- [Cursor 使用教學](https://cursor.sh/docs)

### 測試資源
- [Testing Library](https://testing-library.com)
- [Test Automation University](https://testautomationu.applitools.com)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 常見問題

### Q: 可以使用框架嗎？
A: 建議先用 Vanilla JavaScript 完成核心功能，確保理解基礎概念後，可以選擇性使用框架重構。

### Q: AI 生成的程式碼算抄襲嗎？
A: 不算。但需要理解程式碼邏輯，能夠解釋和修改，並在文件中說明 AI 的使用方式。

### Q: 測試覆蓋率如何計算？
A: 使用工具如 NYC 或 Jest Coverage，目標是邏輯覆蓋而非僅行數覆蓋。

### Q: 可以組隊嗎？
A: 可以 2-3 人組隊，但專案複雜度需相應提高，且每人負責部分需明確標示。

## 成功秘訣

1. **儘早開始** - 不要等到最後一刻
2. **迭代開發** - 先完成 MVP，再逐步改善
3. **持續測試** - 每個功能都要有對應測試
4. **善用 AI** - 但要理解生成的程式碼
5. **注重文件** - 好的文件讓專案更專業
6. **準備展示** - 練習如何在 5 分鐘內展示亮點

祝專案順利！記住：完成比完美更重要。