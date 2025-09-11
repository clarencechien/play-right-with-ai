#!/usr/bin/env python3
"""
Gemini API 整合設定
用於 "Play right with AI" 工作坊
"""

import os
import json
import time
from typing import Dict, List, Optional, Any
from pathlib import Path
import google.generativeai as genai


class GeminiIntegration:
    """Google Gemini API 整合類別"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化 Gemini 整合
        
        Args:
            api_key: Google API 金鑰，如果未提供將從環境變數讀取
        """
        api_key = api_key or os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError('需要提供 GOOGLE_API_KEY')
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
    
    def generate_application(self, requirements: str) -> str:
        """
        根據需求生成應用程式碼
        
        Args:
            requirements: 自然語言需求描述
            
        Returns:
            生成的應用程式碼
        """
        prompt = f"""You are an expert web developer. Create a complete application based on these requirements:

{requirements}

Requirements:
1. Modern, clean architecture
2. Responsive design
3. Error handling
4. Comments in Traditional Chinese (繁體中文)
5. Single HTML file with embedded CSS and JavaScript

Generate complete, production-ready code."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"生成應用程式失敗: {e}")
            raise
    
    def analyze_code_quality(self, code: str) -> Dict[str, Any]:
        """
        分析程式碼品質
        
        Args:
            code: 要分析的程式碼
            
        Returns:
            包含分析結果的字典
        """
        prompt = f"""As a code quality expert, analyze this code and provide detailed feedback.

Code:
```
{code[:3000]}
```

Analyze:
1. Overall quality score (1-10)
2. Security vulnerabilities
3. Performance issues
4. Code smells
5. Best practice violations
6. Improvement suggestions

Return JSON format with Traditional Chinese descriptions."""

        try:
            response = self.model.generate_content(prompt)
            
            # 嘗試解析 JSON
            text = response.text
            if '```json' in text:
                json_str = text.split('```json')[1].split('```')[0].strip()
                return json.loads(json_str)
            
            return {
                "score": 0,
                "analysis": text,
                "issues": [],
                "suggestions": []
            }
        except Exception as e:
            print(f"程式碼分析失敗: {e}")
            return {"error": str(e)}
    
    def create_test_scenarios(self, app_description: str) -> str:
        """
        建立測試場景
        
        Args:
            app_description: 應用程式描述或程式碼
            
        Returns:
            測試場景文件
        """
        prompt = f"""As a QA strategist, create comprehensive test scenarios for this application.

Application:
{app_description[:2000]}

Create:
1. User journey tests (happy paths)
2. Edge cases and boundary conditions
3. Error handling scenarios
4. Performance test cases
5. Security test scenarios
6. Accessibility checks

Format as a structured test plan in Traditional Chinese."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"測試場景建立失敗: {e}")
            raise
    
    def generate_playwright_tests(self, test_scenarios: str, app_url: str = "http://localhost:3000") -> str:
        """
        生成 Playwright 測試腳本
        
        Args:
            test_scenarios: 測試場景描述
            app_url: 應用程式 URL
            
        Returns:
            Playwright 測試程式碼
        """
        prompt = f"""You are a Playwright expert. Generate complete test scripts based on these scenarios.

Test Scenarios:
{test_scenarios}

Target URL: {app_url}

Generate:
1. Complete test.spec.ts with TypeScript
2. Proper selectors and assertions
3. Wait strategies for dynamic content
4. Test data management
5. Comments in Traditional Chinese

Use Playwright best practices."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Playwright 測試生成失敗: {e}")
            raise
    
    def debug_test_failure(self, error_log: str, test_code: str, app_code: str) -> Dict[str, Any]:
        """
        除錯測試失敗
        
        Args:
            error_log: 錯誤日誌
            test_code: 測試程式碼
            app_code: 應用程式碼
            
        Returns:
            除錯分析結果
        """
        prompt = f"""As a debugging expert, analyze this test failure and provide solutions.

Error Log:
```
{error_log[:1500]}
```

Test Code:
```
{test_code[:1500]}
```

Application Code:
```
{app_code[:1500]}
```

Provide:
1. Root cause analysis
2. Specific fixes needed
3. Code corrections
4. Prevention strategies

Return as JSON with Traditional Chinese explanations."""

        try:
            response = self.model.generate_content(prompt)
            
            text = response.text
            if '```json' in text:
                json_str = text.split('```json')[1].split('```')[0].strip()
                return json.loads(json_str)
            
            return {
                "rootCause": "未知",
                "analysis": text,
                "fixes": []
            }
        except Exception as e:
            print(f"除錯分析失敗: {e}")
            return {"error": str(e)}
    
    def auto_repair_code(self, broken_code: str, error_analysis: Dict[str, Any]) -> str:
        """
        自動修復程式碼
        
        Args:
            broken_code: 有問題的程式碼
            error_analysis: 錯誤分析結果
            
        Returns:
            修復後的程式碼
        """
        prompt = f"""You are a code repair specialist. Fix this code based on the error analysis.

Broken Code:
```
{broken_code}
```

Error Analysis:
{json.dumps(error_analysis, ensure_ascii=False, indent=2)}

Requirements:
1. Fix all identified issues
2. Maintain original functionality
3. Add error prevention
4. Include fix comments in Traditional Chinese

Output complete, working code."""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"自動修復失敗: {e}")
            raise
    
    def analyze_image(self, image_path: str, prompt: str = "分析這張圖片") -> str:
        """
        分析圖片（例如測試截圖）
        
        Args:
            image_path: 圖片路徑
            prompt: 分析提示
            
        Returns:
            分析結果
        """
        try:
            import PIL.Image
            img = PIL.Image.open(image_path)
            response = self.vision_model.generate_content([prompt, img])
            return response.text
        except Exception as e:
            print(f"圖片分析失敗: {e}")
            raise
    
    def batch_process(self, prompts: List[str], delay: float = 1.0) -> List[Dict[str, Any]]:
        """
        批次處理多個提示
        
        Args:
            prompts: 提示列表
            delay: 請求之間的延遲（秒）
            
        Returns:
            回應結果列表
        """
        results = []
        
        for i, prompt in enumerate(prompts):
            try:
                response = self.model.generate_content(prompt)
                results.append({
                    "index": i,
                    "success": True,
                    "response": response.text
                })
            except Exception as e:
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(e)
                })
            
            # 避免速率限制
            if i < len(prompts) - 1:
                time.sleep(delay)
        
        return results
    
    def create_workflow_chain(self, tasks: List[Dict[str, str]]) -> List[str]:
        """
        建立工作流程鏈
        
        Args:
            tasks: 任務列表，每個任務包含 'name' 和 'prompt'
            
        Returns:
            執行結果列表
        """
        results = []
        context = ""
        
        for task in tasks:
            full_prompt = f"{context}\n\n{task['prompt']}" if context else task['prompt']
            
            try:
                response = self.model.generate_content(full_prompt)
                result = response.text
                results.append(result)
                
                # 更新上下文
                context = f"Previous task ({task['name']}) result:\n{result[:500]}"
                
            except Exception as e:
                print(f"任務 {task['name']} 失敗: {e}")
                results.append(f"Error: {str(e)}")
        
        return results


def main():
    """CLI 主程式"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Gemini API 整合工具')
    parser.add_argument('action', choices=[
        'generate', 'analyze', 'test', 'debug', 'repair'
    ], help='執行的動作')
    parser.add_argument('--input', '-i', help='輸入檔案或文字')
    parser.add_argument('--output', '-o', help='輸出檔案')
    parser.add_argument('--url', default='http://localhost:3000', help='應用程式 URL')
    
    args = parser.parse_args()
    
    # 初始化 Gemini
    gemini = GeminiIntegration()
    
    if args.action == 'generate':
        requirements = args.input or input('請輸入應用需求: ')
        code = gemini.generate_application(requirements)
        
        if args.output:
            Path(args.output).write_text(code, encoding='utf-8')
            print(f'✓ 已儲存到 {args.output}')
        else:
            print(code)
    
    elif args.action == 'analyze':
        if args.input and Path(args.input).exists():
            code = Path(args.input).read_text(encoding='utf-8')
        else:
            code = args.input or input('請輸入程式碼: ')
        
        analysis = gemini.analyze_code_quality(code)
        print(json.dumps(analysis, ensure_ascii=False, indent=2))
    
    elif args.action == 'test':
        scenarios = args.input or input('請輸入測試場景: ')
        tests = gemini.generate_playwright_tests(scenarios, args.url)
        
        if args.output:
            Path(args.output).write_text(tests, encoding='utf-8')
            print(f'✓ 測試已儲存到 {args.output}')
        else:
            print(tests)


if __name__ == '__main__':
    main()