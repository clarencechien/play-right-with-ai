#!/usr/bin/env python3
"""
Bilingual Structure Validation Script
Validates all prompt files follow the "Think in English, Output in Chinese" pattern
"""

import os
import json
from pathlib import Path
from datetime import datetime

def validate_file(file_path):
    """Validate a single file for bilingual structure compliance"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        required_sections = {
            "tech_spec": "Technical Specification (Think in English)",
            "output": "輸出要求 (Output in Chinese)",
            "example": "Example / 範例"
        }
        
        validation_result = {
            "file": str(file_path.relative_to(Path('/workspace/play-right-with-ai/prompts'))),
            "compliant": True,
            "missing_sections": [],
            "has_sections": {}
        }
        
        for key, section in required_sections.items():
            if section in content:
                validation_result["has_sections"][key] = True
            else:
                validation_result["has_sections"][key] = False
                validation_result["missing_sections"].append(section)
                validation_result["compliant"] = False
        
        # Additional quality checks
        validation_result["quality_checks"] = {
            "has_markdown_code_blocks": "```" in content,
            "has_chinese_comments": any(ord(c) > 127 for c in content),
            "file_size_bytes": len(content.encode('utf-8')),
            "line_count": content.count('\n')
        }
        
        return validation_result
        
    except Exception as e:
        return {
            "file": str(file_path),
            "compliant": False,
            "error": str(e)
        }

def generate_report(results):
    """Generate comprehensive validation report"""
    total = len(results)
    compliant = sum(1 for r in results if r.get("compliant", False))
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_files": total,
            "compliant_files": compliant,
            "non_compliant_files": total - compliant,
            "compliance_rate": f"{(compliant * 100 / total):.1f}%" if total > 0 else "0%"
        },
        "compliant": [],
        "non_compliant": [],
        "details": results
    }
    
    for result in results:
        if result.get("compliant"):
            report["compliant"].append(result["file"])
        else:
            report["non_compliant"].append({
                "file": result["file"],
                "missing": result.get("missing_sections", [])
            })
    
    return report

def main():
    """Main validation process"""
    prompts_dir = Path('/workspace/play-right-with-ai/prompts')
    
    # Find all markdown files in chapter directories
    all_files = []
    for pattern in ['chapter-*/*.md', 'chapter-*/*/*.md']:
        all_files.extend(prompts_dir.glob(pattern))
    
    # Exclude backup and review files
    all_files = [f for f in all_files if not any(x in str(f) for x in ['.backup', '.review', 'README'])]
    
    print("=== Bilingual Structure Validation ===\n")
    print(f"Validating {len(all_files)} files...\n")
    
    results = []
    for file_path in sorted(all_files):
        result = validate_file(file_path)
        results.append(result)
        
        status = "✅" if result["compliant"] else "❌"
        print(f"{status} {result['file']}")
        if not result["compliant"] and "missing_sections" in result:
            for section in result["missing_sections"]:
                print(f"   ⚠️  Missing: {section}")
    
    # Generate report
    report = generate_report(results)
    
    print(f"\n=== Summary ===")
    print(f"Total files: {report['summary']['total_files']}")
    print(f"Compliant: {report['summary']['compliant_files']}")
    print(f"Non-compliant: {report['summary']['non_compliant_files']}")
    print(f"Compliance rate: {report['summary']['compliance_rate']}")
    
    # Save detailed report
    report_path = prompts_dir / 'validation-report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\nDetailed report saved to: {report_path}")
    
    # Generate markdown report
    markdown_report = f"""# Bilingual Structure Validation Report

Generated: {report['timestamp']}

## Summary
- **Total Files**: {report['summary']['total_files']}
- **Compliant**: {report['summary']['compliant_files']}
- **Non-Compliant**: {report['summary']['non_compliant_files']}
- **Compliance Rate**: {report['summary']['compliance_rate']}

## Compliant Files ✅
"""
    
    for file in sorted(report['compliant']):
        markdown_report += f"- `{file}`\n"
    
    markdown_report += "\n## Non-Compliant Files ❌\n"
    
    for item in sorted(report['non_compliant'], key=lambda x: x['file']):
        markdown_report += f"- `{item['file']}`\n"
        for missing in item['missing']:
            markdown_report += f"  - Missing: {missing}\n"
    
    markdown_path = prompts_dir / 'validation-report.md'
    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(markdown_report)
    
    print(f"Markdown report saved to: {markdown_path}")
    
    return report['summary']['compliance_rate'] == "100.0%"

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)