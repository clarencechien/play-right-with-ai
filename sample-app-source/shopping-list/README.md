# 智能購物清單應用程式

進階的購物清單管理應用，展示分類管理、預算追蹤和批量操作等功能，專為 AI 驅動測試工作坊設計。

## 目錄結構

```
shopping-list/
├── src/                # 應用程式原始碼
│   ├── index.html     # 主要 HTML 檔案
│   ├── app.js         # 應用邏輯
│   └── styles.css     # 樣式表
├── tests/             # 測試規範
│   └── shopping.spec.js # Playwright 測試
├── bugs/              # 包含錯誤的版本（待建立）
├── solutions/         # 修正後的版本（待建立）
└── README.md          # 本文件
```

## 功能特性

### 商品管理
- ✅ 新增商品（名稱、數量、分類、價格）
- ✅ 標記已購買/未購買
- ✅ 調整商品數量
- ✅ 刪除商品
- ✅ 自動分類顯示

### 分類系統
- ✅ 預設 5 個分類（食品、日用品、電子產品、服飾、其他）
- ✅ 按分類分組顯示
- ✅ 顯示各分類商品數量
- ✅ 分類篩選功能

### 搜尋與篩選
- ✅ 即時搜尋商品
- ✅ 按分類篩選
- ✅ 不區分大小寫搜尋
- ✅ 組合篩選條件

### 預算管理
- ✅ 設定購物預算
- ✅ 即時計算總價
- ✅ 超預算警告提示
- ✅ 顯示已購買統計

### 批量操作
- ✅ 清除所有已購買商品
- ✅ 清空整個清單（含確認）
- ✅ 匯出清單為 JSON
- ✅ 分享清單（複製或系統分享）

### 資料持久化
- ✅ 本地儲存自動保存
- ✅ 保存商品狀態
- ✅ 記住預算設定
- ✅ 重新載入後恢復

## 測試覆蓋範圍

### 單元測試
- 商品 CRUD 操作
- 數量調整邏輯
- 分類管理
- 搜尋篩選功能

### 整合測試
- 分類顯示與篩選
- 預算計算與警告
- 批量操作確認
- 資料持久化

### 端對端測試
- 完整購物流程
- 跨分類管理
- 匯出與分享
- 錯誤處理

## 使用方式

### 執行應用程式
```bash
# 直接開啟 HTML 檔案
open sample-app-source/shopping-list/src/index.html

# 或使用 HTTP 伺服器
python -m http.server 8000
# 訪問 http://localhost:8000/sample-app-source/shopping-list/src/
```

### 執行測試
```bash
# 安裝依賴
npm install -D @playwright/test

# 執行所有測試
npx playwright test sample-app-source/shopping-list/tests/

# UI 模式
npx playwright test --ui

# 產生報告
npx playwright test --reporter=html
```

## AI 測試提示詞範例

### 功能測試生成
```
為購物清單應用生成 Playwright 測試：
1. 測試商品新增與分類管理
2. 驗證搜尋和篩選功能
3. 測試預算追蹤和超預算警告
4. 驗證批量操作和確認對話框
5. 測試匯出和分享功能
```

### 測試策略分析
```
分析這個購物清單應用的測試策略：
1. 識別關鍵使用者流程
2. 建議效能測試重點
3. 提出安全性測試案例
4. 設計跨瀏覽器測試計劃
```

### 除錯與優化
```
檢查購物清單應用的潛在問題：
1. 分析大量商品時的效能
2. 檢查資料驗證邏輯
3. 評估 localStorage 限制處理
4. 建議 UX 改善點
```

## 進階功能擴展建議

### 資料管理
- 匯入 JSON/CSV 格式清單
- 支援多個購物清單
- 清單模板功能
- 歷史記錄追蹤

### 智能功能
- 商品價格預測
- 購買頻率分析
- 智能分類建議
- 預算優化建議

### 協作功能
- 即時同步清單
- 多人共享編輯
- 指派購買任務
- 留言評論功能

### 整合功能
- 條碼掃描新增
- 線上商店價格比較
- 地圖顯示商店位置
- 收據拍照記錄

## 測試案例設計原則

### 正向測試
- 標準使用流程
- 預期輸入處理
- 功能完整性驗證

### 負向測試
- 無效輸入處理
- 邊界值測試
- 錯誤恢復能力

### 效能測試
- 大量商品處理（100+ 項）
- 快速操作響應
- 記憶體使用優化

### 相容性測試
- 跨瀏覽器支援
- 行動裝置適配
- 離線功能測試

## 常見問題與解決方案

### Q: 如何處理大量商品的效能問題？
A: 實施虛擬滾動、分頁載入或懶載入策略

### Q: localStorage 容量限制怎麼辦？
A: 實施資料壓縮、舊資料清理或使用 IndexedDB

### Q: 如何改善行動裝置體驗？
A: 優化觸控操作、實施手勢支援、響應式設計

### Q: 如何確保資料安全？
A: 實施資料加密、定期備份、隱私模式支援

## 學習資源

- [Playwright 進階測試技巧](https://playwright.dev/docs/best-practices)
- [JavaScript 陣列方法](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [LocalStorage 最佳實踐](https://developer.mozilla.org/zh-TW/docs/Web/API/Window/localStorage)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)