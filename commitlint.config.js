module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修復
        'docs',     // 文檔
        'style',    // 格式（不影響程式碼運行的變動）
        'refactor', // 重構
        'perf',     // 性能優化
        'test',     // 測試
        'build',    // 構建過程或輔助工具的變動
        'ci',       // CI 配置
        'chore',    // 其他改變
        'revert',   // 回退
        'workshop', // 工作坊內容相關
        'chapter',  // 章節相關更新
        'exercise', // 練習相關
        'prompt'    // 提示詞相關
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always']
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\(([^)]+)\))?:\s+(.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  },
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  prompt: {
    settings: {},
    messages: {
      skip: '(按 Enter 跳過)',
      max: '最多 %d 個字元',
      min: '至少 %d 個字元',
      emptyWarning: '不能為空',
      upperLimitWarning: '超過限制',
      lowerLimitWarning: '低於限制'
    },
    questions: {
      type: {
        description: '選擇提交類型',
        enum: {
          feat: {
            description: '新功能',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: '修復錯誤',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: '文檔變更',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: '程式碼格式（不影響功能）',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: '重構（既不修復錯誤也不添加功能）',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: '性能優化',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: '添加測試',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: '影響構建系統或外部依賴的更改',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'CI 配置文件和腳本的更改',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: '其他不修改 src 或測試文件的更改',
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: '回退先前的提交',
            title: 'Reverts',
            emoji: '🗑'
          },
          workshop: {
            description: '工作坊內容相關',
            title: 'Workshop Content',
            emoji: '🎓'
          },
          chapter: {
            description: '章節相關更新',
            title: 'Chapter Updates',
            emoji: '📖'
          },
          exercise: {
            description: '練習相關',
            title: 'Exercises',
            emoji: '✏️'
          },
          prompt: {
            description: '提示詞相關',
            title: 'Prompts',
            emoji: '💬'
          }
        }
      }
    }
  }
};