#!/bin/bash

# Script to add Google Analytics to all chapter HTML files

ANALYTICS_CODE='  <!-- Google Analytics 4 - 請替換 GA_MEASUREMENT_ID -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (cookieConsent === "accepted") {
      gtag("js", new Date());
      gtag("config", "GA_MEASUREMENT_ID", {
        "anonymize_ip": true,
        "cookie_flags": "SameSite=None;Secure",
        "cookie_expires": 30 * 24 * 60 * 60
      });
    }
  </script>'

ANALYTICS_JS='  <script src="../assets/js/analytics.js"></script>'

COOKIE_BANNER='  <!-- Cookie 同意橫幅 -->
  <div id="cookie-banner" class="cookie-banner" style="display: none;">
    <div class="cookie-content">
      <p>我們使用 Cookie 來改善您的瀏覽體驗並分析網站流量。您的資料將以匿名方式處理。</p>
      <div class="cookie-actions">
        <button id="accept-cookies" class="btn btn-primary">接受</button>
        <button id="reject-cookies" class="btn btn-secondary">拒絕</button>
        <a href="../privacy-policy.html" class="cookie-link">隱私政策</a>
      </div>
    </div>
  </div>
  
  <style>
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #2c3e50;
      color: white;
      padding: 20px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    }
    
    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .cookie-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    
    .cookie-link {
      color: #3498db;
      text-decoration: underline;
      margin-left: 10px;
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @media (max-width: 768px) {
      .cookie-content {
        flex-direction: column;
        text-align: center;
      }
    }
  </style>'

# Process each chapter file
for file in /workspace/play-right-with-ai/docs/chapters/chapter-*.html; do
  echo "Processing $file..."
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Add GA script before </head>
  sed -i "/<\/head>/i\\
$ANALYTICS_CODE" "$file"
  
  # Add analytics.js script before </body>
  sed -i "/<\/body>/i\\
$ANALYTICS_JS" "$file"
  
  # Add cookie banner before </body>
  sed -i "/<\/body>/i\\
$COOKIE_BANNER" "$file"
  
  echo "Updated $file"
done

echo "All chapter files have been updated with Google Analytics!"