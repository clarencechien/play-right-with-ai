# 安全政策 | Security Policy

## 支援的版本 | Supported Versions

本專案目前支援以下版本的安全更新：

Use this section to tell people about which versions of your project are currently being supported with security updates.

| 版本 Version | 支援狀態 Supported |
| ------- | ------------------ |
| 最新版 Latest | ✅ |
| < 1.0   | ❌ |

## 回報漏洞 | Reporting a Vulnerability

我們非常重視「Play right with AI」工作坊的安全性。如果你發現任何安全漏洞，請按照以下步驟回報：

We take the security of the "Play right with AI" workshop seriously. If you discover a security vulnerability, please follow these steps:

### 回報流程 | Reporting Process

1. **請勿公開披露** | **Do Not Disclose Publicly**
   - 請不要在公開的 issue、討論區或社群媒體上披露安全漏洞
   - Do not disclose the vulnerability publicly in issues, discussions, or social media

2. **私密聯繫** | **Contact Privately**
   - 發送電子郵件至：[SECURITY_EMAIL]
   - Email us at: [SECURITY_EMAIL]
   - 或使用 GitHub 的私密安全回報功能（如果已啟用）
   - Or use GitHub's private security reporting feature (if enabled)

3. **提供詳細資訊** | **Provide Details**
   請包含以下資訊 | Please include:
   - 漏洞的詳細描述 | Detailed description of the vulnerability
   - 重現步驟 | Steps to reproduce
   - 潛在影響 | Potential impact
   - 建議的修復方案（如果有）| Suggested fix (if any)
   - 你的聯繫資訊 | Your contact information

### 回應時間 | Response Timeline

- **24 小時內** | **Within 24 hours**: 確認收到你的回報 | Acknowledge receipt of your report
- **48 小時內** | **Within 48 hours**: 初步評估和回應 | Initial assessment and response
- **7 天內** | **Within 7 days**: 提供修復時程或更多資訊 | Provide fix timeline or more information
- **30 天內** | **Within 30 days**: 發布修復（如果適用）| Release fix (if applicable)

### 安全更新 | Security Updates

安全更新將透過以下管道發布：
Security updates will be announced through:

- GitHub Security Advisories
- Release Notes
- README 更新 | README updates

### 負責任的披露 | Responsible Disclosure

我們相信負責任的披露原則。我們承諾：
We believe in responsible disclosure. We commit to:

- 快速回應和修復已確認的漏洞 | Quickly respond to and fix confirmed vulnerabilities
- 在修復發布後公開致謝（除非你希望保持匿名）| Publicly acknowledge reporters after fix (unless you prefer anonymity)
- 不對善意的安全研究採取法律行動 | Not take legal action against good-faith security research

### 範圍 | Scope

以下在安全政策範圍內：
The following are in scope:

- 工作坊程式碼和範例 | Workshop code and examples
- 文件中的安全最佳實踐 | Security best practices in documentation
- 依賴套件的已知漏洞 | Known vulnerabilities in dependencies
- 設定和部署指南 | Configuration and deployment guides

以下不在範圍內：
The following are out of scope:

- 第三方 AI 服務（Claude, Gemini 等）的安全問題 | Security issues in third-party AI services (Claude, Gemini, etc.)
- 社群成員提交的內容 | Community-submitted content
- 已在其他地方公開披露的問題 | Issues already publicly disclosed elsewhere

### 安全最佳實踐 | Security Best Practices

使用本工作坊時，請遵循以下安全建議：
When using this workshop, please follow these security recommendations:

1. **API 金鑰管理** | **API Key Management**
   - 永遠不要將 API 金鑰提交到版本控制 | Never commit API keys to version control
   - 使用環境變數儲存敏感資訊 | Use environment variables for sensitive data

2. **程式碼審查** | **Code Review**
   - 總是審查 AI 生成的程式碼 | Always review AI-generated code
   - 檢查潛在的安全問題 | Check for potential security issues

3. **測試環境** | **Testing Environment**
   - 在隔離環境中運行未知程式碼 | Run unknown code in isolated environments
   - 使用測試資料而非生產資料 | Use test data, not production data

4. **依賴管理** | **Dependency Management**
   - 定期更新依賴套件 | Regularly update dependencies
   - 檢查已知漏洞 | Check for known vulnerabilities

## 致謝 | Acknowledgments

我們感謝所有負責任地披露安全問題的研究者和使用者。
We thank all researchers and users who responsibly disclose security issues.

### 安全研究者名人堂 | Security Researchers Hall of Fame

（當有貢獻者時將在此列出）
(Contributors will be listed here when applicable)