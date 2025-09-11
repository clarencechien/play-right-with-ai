#!/bin/bash

echo "🌐 測試 GitHub Pages 相容性"
echo "================================"

# 檢查所有 HTML 文件的路徑
echo "📝 檢查 HTML 文件路徑..."

# 檢查首頁
if grep -q 'href="/docs/' docs/index.html; then
  echo "❌ 首頁仍有絕對路徑"
  exit 1
else
  echo "✅ 首頁路徑已修正"
fi

# 檢查章節頁面
for file in docs/chapters/*.html; do
  if grep -q 'href="/docs/' "$file"; then
    echo "❌ $(basename $file) 仍有絕對路徑"
    exit 1
  fi
done
echo "✅ 所有章節頁面路徑已修正"

# 檢查 404 頁面
if [ -f "docs/404.html" ]; then
  echo "✅ 404 頁面已建立"
else
  echo "❌ 缺少 404 頁面"
  exit 1
fi

# 檢查搜尋索引
if [ -f "docs/search-index.json" ]; then
  echo "✅ 搜尋索引已建立"
else
  echo "❌ 缺少搜尋索引"
  exit 1
fi

# 檢查 JavaScript 基礎路徑處理
if grep -q "__BASE_PATH__" docs/assets/js/main.js; then
  echo "✅ JavaScript 支援基礎路徑"
else
  echo "❌ JavaScript 缺少基礎路徑支援"
  exit 1
fi

echo ""
echo "🎉 所有檢查通過！網站已準備好部署到 GitHub Pages"
echo ""
echo "📚 部署步驟："
echo "1. git add docs/"
echo "2. git commit -m 'fix: Update paths for GitHub Pages compatibility'"
echo "3. git push"
echo "4. 在 GitHub 設定中啟用 GitHub Pages，選擇 /docs 目錄"
echo "5. 訪問 https://[username].github.io/play-right-with-ai/"