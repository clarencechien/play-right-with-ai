# 貢獻指南 Contributing Guide

感謝你對 **Play right with AI** 工作坊的興趣！我們歡迎各種形式的貢獻。

## 🤝 行為準則 Code of Conduct

參與本專案即表示你同意遵守我們的[行為準則](./CODE_OF_CONDUCT.md)。請確保你的貢獻符合友善、包容和專業的社群標準。

## 🚀 如何貢獻

### 1. 回報問題 Report Issues
發現 bug 或有改進建議？請[開啟 Issue](https://github.com/yourusername/play-right-with-ai/issues/new)：

- 使用清晰的標題
- 詳細描述問題或建議
- 提供重現步驟（如果是 bug）
- 附上相關截圖或錯誤訊息

### 2. 提交程式碼 Submit Code

#### 設定開發環境
```bash
# Fork 專案到你的 GitHub 帳號
# Clone 你的 fork
git clone https://github.com/YOUR_USERNAME/play-right-with-ai.git
cd play-right-with-ai

# 新增 upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/play-right-with-ai.git

# 安裝依賴
npm install
```

#### 開發流程
```bash
# 確保你的 fork 是最新的
git fetch upstream
git checkout main
git merge upstream/main

# 建立新分支
git checkout -b feature/your-feature-name

# 進行修改...

# 執行測試
npm test

# 提交變更
git add .
git commit -m "feat: 你的修改描述"

# 推送到你的 fork
git push origin feature/your-feature-name
```

#### 提交 Pull Request
1. 前往你的 fork 頁面
2. 點擊 "New Pull Request"
3. 選擇你的分支
4. 填寫 PR 描述模板
5. 等待審查

### 3. 貢獻提示詞 Contribute Prompts

我們特別歡迎改進的 AI 提示詞：

1. 在 `/prompts/contributions/` 建立新檔案
2. 使用以下格式：

```markdown
# 提示詞名稱

## 用途
簡短描述這個提示詞的用途

## 提示詞內容
```
[English Technical Part]
...

[Chinese Output Part]
...
```

## 測試結果
- Claude: ✅ 測試通過
- GPT: ✅ 測試通過  
- Gemini: ⚠️ 需要調整

## 範例輸出
...
```

### 4. 改進文件 Improve Documentation

- 修正錯字或語法錯誤
- 改善說明的清晰度
- 新增有用的範例
- 更新過時的資訊

### 5. 新增範例 Add Examples

在 `/workshop/community-examples/` 分享你的學習成果：

```markdown
# 專案名稱
作者：你的名字

## 專案描述
...

## 使用的 AI 工具
- Claude
- Playwright
- ...

## 學習心得
...

## 程式碼連結
[GitHub Repo](...)
```

## 📝 提交訊息規範 Commit Message Convention

使用[約定式提交](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文件更新
- `style:` 格式調整（不影響程式碼運行）
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 維護性工作

範例：
```bash
feat: 新增 Chapter 9 進階 AI 整合
fix: 修復 TODO app 刪除功能
docs: 更新 README 安裝說明
```

## 🧪 測試要求

所有程式碼貢獻必須：

1. 通過現有測試
2. 新增相關測試（如果適用）
3. 維持或提升測試覆蓋率

執行測試：
```bash
# 所有測試
npm test

# 特定測試
npm run test:workshop
npm run test:prompts
npm run test:e2e
```

## 📋 Pull Request 檢查清單

提交 PR 前請確認：

- [ ] 程式碼遵循專案風格指南
- [ ] 所有測試通過
- [ ] 更新相關文件
- [ ] 提交訊息符合規範
- [ ] PR 描述清楚說明變更內容
- [ ] 沒有包含敏感資訊（API keys 等）

## 🌐 翻譯貢獻

想要翻譯工作坊到其他語言？

1. 在 `/translations/` 建立語言資料夾（例如：`/translations/en/`）
2. 保持相同的檔案結構
3. 提交 PR 時說明翻譯進度

## 💡 提案新功能

有重大功能想法？

1. 先開啟 Discussion 討論
2. 獲得社群反饋
3. 如果獲得支持，開啟正式 Issue
4. 實作並提交 PR

## 🏷️ Issue 和 PR 標籤

### Issue 標籤
- `bug` - 錯誤回報
- `enhancement` - 功能改進
- `documentation` - 文件相關
- `good first issue` - 適合新手
- `help wanted` - 需要協助

### PR 標籤
- `ready for review` - 準備審查
- `work in progress` - 進行中
- `needs update` - 需要更新

## 👥 審查流程

1. **自動檢查** - CI/CD 自動執行測試
2. **同儕審查** - 社群成員審查
3. **維護者審查** - 核心團隊最終審查
4. **合併** - 審查通過後合併

## 🎯 優先貢獻領域

當前特別需要幫助的領域：

1. **提示詞優化** - 改進現有提示詞效果
2. **錯誤場景** - 新增更多除錯練習場景
3. **影片教學** - 製作教學影片
4. **社群範例** - 分享你的專案
5. **效能優化** - 改善測試執行速度

## 📞 聯絡方式

- GitHub Discussions: [連結](https://github.com/yourusername/play-right-with-ai/discussions)
- Email: contribute@playrightwithAI.com
- Discord: [邀請連結](https://discord.gg/...)

## 🙏 致謝

所有貢獻者都會被列在 [AUTHORS.md](./AUTHORS.md) 檔案中。

感謝你讓 Play right with AI 變得更好！

---

<div align="center">

**一起打造更好的 AI 開發教育 🚀**

</div>