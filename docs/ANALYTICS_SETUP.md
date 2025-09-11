# Google Analytics 設置指南

## 概述

本工作坊網站已整合 Google Analytics 4 (GA4) 追蹤功能，採用隱私優先的實作方式，符合 GDPR 規範。

## 設置步驟

### 1. 取得 Google Analytics 測量 ID

1. 前往 [Google Analytics](https://analytics.google.com/)
2. 創建新的 GA4 資源或使用現有資源
3. 在「管理」>「資料串流」中找到您的測量 ID（格式：G-XXXXXXXXXX）

### 2. 替換測量 ID

在以下檔案中，將 `GA_MEASUREMENT_ID` 替換為您的實際測量 ID：

- `/docs/index.html`
- `/docs/privacy-policy.html`
- `/docs/chapters/chapter-*.html`（所有章節檔案）
- `/docs/assets/js/analytics.js`

使用以下指令批次替換：

```bash
# 在 docs 目錄下執行
find . -type f -name "*.html" -o -name "*.js" | xargs sed -i 's/GA_MEASUREMENT_ID/G-YOUR-ACTUAL-ID/g'
```

### 3. 配置 GA4 設定

在 Google Analytics 中進行以下設定：

1. **資料保留期限**：設定為 2 個月（最短期限）
2. **停用廣告個人化**：
   - 管理 > 資料設定 > 資料收集
   - 關閉「Google 信號資料收集」
3. **停用資料共享**：
   - 管理 > 帳戶設定
   - 取消勾選所有資料共享選項

## 功能特點

### 隱私保護措施

- ✅ IP 匿名化
- ✅ Cookie 同意機制（opt-in）
- ✅ 30 天 Cookie 過期時間
- ✅ 本地儲存同意狀態
- ✅ 用戶可隨時撤銷同意

### 追蹤事件

系統會追蹤以下事件（僅在用戶同意後）：

1. **頁面瀏覽**
   - 頁面路徑
   - 頁面標題
   - 章節資訊

2. **互動事件**
   - 章節導航
   - 滾動深度（25%, 50%, 75%, 90%, 100%）
   - 程式碼複製
   - 外部連結點擊
   - 檔案下載

3. **學習追蹤**
   - Playground 使用
   - 練習完成
   - 搜尋查詢
   - 頁面停留時間

4. **技術指標**
   - 瀏覽器類型
   - 裝置類型
   - 螢幕解析度
   - 作業系統

## Cookie 管理

### Cookie 類型

| Cookie 名稱 | 用途 | 過期時間 |
|------------|------|---------|
| `_ga` | 區分使用者 | 30 天 |
| `_gid` | 區分使用者 | 24 小時 |
| `cookieConsent` | 儲存同意狀態 | 1 年 |

### 用戶控制

用戶可通過以下方式管理 Cookie：

1. **初次訪問**：顯示 Cookie 同意橫幅
2. **Cookie 設定**：頁腳的「Cookie 設定」連結
3. **隱私政策頁面**：提供停用分析的按鈕
4. **瀏覽器設定**：用戶可隨時清除 Cookie

## 合規性

### GDPR 合規

- 明確的同意機制
- 資料最小化原則
- 用戶權利保障（存取、刪除、可攜）
- 透明的隱私政策

### 兒童隱私

- 不針對 13 歲以下兒童
- 不收集兒童個人資料

## 測試分析

### 驗證安裝

1. 開啟瀏覽器開發者工具
2. 切換到 Network 標籤
3. 篩選 `google-analytics` 或 `gtag`
4. 重新載入頁面
5. 確認有請求發送到 GA

### 即時報告

1. 登入 Google Analytics
2. 前往「報告」>「即時」
3. 瀏覽網站並確認資料顯示

### 調試模式

在瀏覽器控制台執行：

```javascript
// 啟用調試模式
gtag('config', 'G-YOUR-ID', { 'debug_mode': true });

// 查看事件
window.dataLayer.forEach(item => console.log(item));
```

## 常見問題

### Q: 為什麼看不到分析資料？

A: 檢查以下項目：
- 是否已接受 Cookie 同意
- 測量 ID 是否正確
- 是否有廣告攔截器
- GA4 資料可能有 24-48 小時延遲

### Q: 如何完全停用分析？

A: 用戶可以：
1. 點擊「拒絕」Cookie
2. 使用隱私政策頁面的「停用分析追蹤」按鈕
3. 清除瀏覽器 Cookie
4. 使用瀏覽器的「請勿追蹤」功能

### Q: 資料儲存在哪裡？

A: 
- 分析資料：Google Analytics 伺服器
- 同意狀態：用戶瀏覽器的 localStorage
- Cookie：用戶瀏覽器

## 維護建議

1. **定期審查**：每季度審查隱私政策和資料收集實踐
2. **更新通知**：重大變更時通知用戶
3. **資料清理**：定期清理不必要的資料
4. **合規檢查**：關注法規變化並相應調整

## 聯絡資訊

如有任何關於分析或隱私的問題，請聯繫：

- GitHub Issues: [提交問題](https://github.com/your-repo/play-right-with-ai/issues)
- Email: privacy@playrightwithAI.example.com

---

最後更新：2024 年 12 月