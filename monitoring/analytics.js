/**
 * 學習分析與監控系統
 * 追蹤工作坊學習進度和成效
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class WorkshopAnalytics {
  constructor(dataDir = './monitoring/data') {
    this.dataDir = dataDir;
    this.sessionId = uuidv4();
    this.startTime = new Date();
    this.events = [];
    this.metrics = {
      chaptersCompleted: new Set(),
      testsRun: 0,
      testsPass: 0,
      testsFail: 0,
      aiCallsCount: {},
      errorsEncountered: [],
      timeSpentPerChapter: {},
      promptsUsed: []
    };
    
    this.initialize();
  }

  async initialize() {
    // 確保資料目錄存在
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('無法建立資料目錄:', error);
    }
  }

  /**
   * 記錄事件
   */
  trackEvent(eventName, data = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      eventName,
      data
    };
    
    this.events.push(event);
    this.processEvent(event);
    
    // 異步儲存
    this.saveEvent(event).catch(console.error);
    
    return event;
  }

  /**
   * 處理事件以更新指標
   */
  processEvent(event) {
    switch (event.eventName) {
      case 'chapter_started':
        this.metrics.timeSpentPerChapter[event.data.chapter] = {
          startTime: new Date(),
          endTime: null,
          duration: 0
        };
        break;
      
      case 'chapter_completed':
        this.metrics.chaptersCompleted.add(event.data.chapter);
        if (this.metrics.timeSpentPerChapter[event.data.chapter]) {
          const chapterTime = this.metrics.timeSpentPerChapter[event.data.chapter];
          chapterTime.endTime = new Date();
          chapterTime.duration = chapterTime.endTime - chapterTime.startTime;
        }
        break;
      
      case 'test_executed':
        this.metrics.testsRun++;
        if (event.data.passed) {
          this.metrics.testsPass++;
        } else {
          this.metrics.testsFail++;
        }
        break;
      
      case 'ai_call':
        const model = event.data.model || 'unknown';
        this.metrics.aiCallsCount[model] = (this.metrics.aiCallsCount[model] || 0) + 1;
        break;
      
      case 'prompt_used':
        this.metrics.promptsUsed.push({
          prompt: event.data.prompt,
          model: event.data.model,
          timestamp: event.timestamp
        });
        break;
      
      case 'error':
        this.metrics.errorsEncountered.push({
          error: event.data.error,
          context: event.data.context,
          timestamp: event.timestamp
        });
        break;
    }
  }

  /**
   * 儲存事件到檔案
   */
  async saveEvent(event) {
    const fileName = `events_${this.sessionId}_${new Date().toISOString().split('T')[0]}.jsonl`;
    const filePath = path.join(this.dataDir, fileName);
    
    const line = JSON.stringify(event) + '\n';
    await fs.appendFile(filePath, line);
  }

  /**
   * 取得當前指標
   */
  getMetrics() {
    const sessionDuration = new Date() - this.startTime;
    
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: sessionDuration,
      chaptersCompleted: Array.from(this.metrics.chaptersCompleted),
      completionRate: (this.metrics.chaptersCompleted.size / 8) * 100,
      tests: {
        total: this.metrics.testsRun,
        passed: this.metrics.testsPass,
        failed: this.metrics.testsFail,
        passRate: this.metrics.testsRun > 0 
          ? (this.metrics.testsPass / this.metrics.testsRun) * 100 
          : 0
      },
      aiUsage: this.metrics.aiCallsCount,
      timePerChapter: this.metrics.timeSpentPerChapter,
      errorsCount: this.metrics.errorsEncountered.length,
      promptsCount: this.metrics.promptsUsed.length
    };
  }

  /**
   * 生成報告
   */
  async generateReport() {
    const metrics = this.getMetrics();
    
    const report = {
      ...metrics,
      summary: this.generateSummary(metrics),
      recommendations: this.generateRecommendations(metrics),
      timestamp: new Date().toISOString()
    };
    
    // 儲存報告
    const reportPath = path.join(
      this.dataDir,
      `report_${this.sessionId}_${Date.now()}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * 生成摘要
   */
  generateSummary(metrics) {
    const summaryPoints = [];
    
    // 完成進度
    if (metrics.completionRate === 100) {
      summaryPoints.push('🎉 恭喜！您已完成所有章節');
    } else if (metrics.completionRate >= 50) {
      summaryPoints.push(`📚 您已完成 ${metrics.completionRate.toFixed(0)}% 的課程`);
    } else {
      summaryPoints.push(`🚀 您已開始學習，完成了 ${metrics.completionRate.toFixed(0)}% 的課程`);
    }
    
    // 測試成效
    if (metrics.tests.passRate >= 90) {
      summaryPoints.push('✨ 測試表現優異');
    } else if (metrics.tests.passRate >= 70) {
      summaryPoints.push('✓ 測試表現良好');
    } else if (metrics.tests.total > 0) {
      summaryPoints.push('💪 持續練習將提升測試成功率');
    }
    
    // AI 使用
    const totalAICalls = Object.values(metrics.aiUsage).reduce((a, b) => a + b, 0);
    if (totalAICalls > 0) {
      const mostUsedAI = Object.entries(metrics.aiUsage)
        .sort((a, b) => b[1] - a[1])[0];
      summaryPoints.push(`🤖 最常使用的 AI: ${mostUsedAI[0]} (${mostUsedAI[1]} 次)`);
    }
    
    // 學習時間
    const hours = Math.floor(metrics.duration / (1000 * 60 * 60));
    const minutes = Math.floor((metrics.duration % (1000 * 60 * 60)) / (1000 * 60));
    summaryPoints.push(`⏱️ 總學習時間: ${hours} 小時 ${minutes} 分鐘`);
    
    return summaryPoints;
  }

  /**
   * 生成建議
   */
  generateRecommendations(metrics) {
    const recommendations = [];
    
    // 基於完成率
    if (metrics.completionRate < 50) {
      recommendations.push({
        type: 'progress',
        priority: 'high',
        message: '建議繼續完成剩餘章節，每章都有重要的學習內容'
      });
    }
    
    // 基於測試結果
    if (metrics.tests.passRate < 70 && metrics.tests.total > 0) {
      recommendations.push({
        type: 'testing',
        priority: 'medium',
        message: '建議複習測試失敗的案例，了解失敗原因'
      });
    }
    
    // 基於錯誤
    if (metrics.errorsCount > 5) {
      recommendations.push({
        type: 'debugging',
        priority: 'medium',
        message: '遇到較多錯誤，建議查看錯誤日誌並尋求協助'
      });
    }
    
    // 基於 AI 使用
    if (Object.keys(metrics.aiUsage).length === 1) {
      recommendations.push({
        type: 'ai_diversity',
        priority: 'low',
        message: '建議嘗試使用不同的 AI 工具，體驗各自的優勢'
      });
    }
    
    // 下一步建議
    if (metrics.completionRate === 100) {
      recommendations.push({
        type: 'next_steps',
        priority: 'info',
        message: '恭喜完成！建議嘗試總整專案，將所學應用於實際專案'
      });
    }
    
    return recommendations;
  }

  /**
   * 追蹤章節進度
   */
  trackChapterProgress(chapter, progress) {
    this.trackEvent('chapter_progress', {
      chapter,
      progress,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 追蹤 AI 互動
   */
  trackAIInteraction(model, prompt, response, tokens = null) {
    this.trackEvent('ai_interaction', {
      model,
      promptLength: prompt.length,
      responseLength: response.length,
      tokens,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 追蹤測試執行
   */
  trackTestExecution(testName, passed, duration, details = {}) {
    this.trackEvent('test_executed', {
      testName,
      passed,
      duration,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 匯出資料
   */
  async exportData(format = 'json') {
    const metrics = this.getMetrics();
    const exportPath = path.join(
      this.dataDir,
      `export_${this.sessionId}_${Date.now()}.${format}`
    );
    
    if (format === 'json') {
      await fs.writeFile(exportPath, JSON.stringify({
        metrics,
        events: this.events
      }, null, 2));
    } else if (format === 'csv') {
      // 簡單的 CSV 匯出
      const csv = this.events.map(e => 
        `"${e.timestamp}","${e.eventName}","${JSON.stringify(e.data).replace(/"/g, '""')}"`
      ).join('\n');
      
      await fs.writeFile(exportPath, `timestamp,event,data\n${csv}`);
    }
    
    return exportPath;
  }
}

/**
 * 瀏覽器端追蹤腳本
 */
const browserTrackingScript = `
<script>
(function() {
  const analytics = {
    sessionId: localStorage.getItem('workshop_session') || generateId(),
    endpoint: '${process.env.ANALYTICS_ENDPOINT || '/api/analytics'}',
    
    track: function(eventName, data) {
      const event = {
        sessionId: this.sessionId,
        eventName: eventName,
        data: data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // 發送到伺服器
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(console.error);
      
      // 本地儲存
      const events = JSON.parse(localStorage.getItem('workshop_events') || '[]');
      events.push(event);
      localStorage.setItem('workshop_events', JSON.stringify(events.slice(-100)));
    },
    
    trackPageView: function() {
      this.track('page_view', {
        path: window.location.pathname,
        referrer: document.referrer
      });
    },
    
    trackTimeSpent: function() {
      const startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        this.track('time_spent', {
          duration: Date.now() - startTime,
          page: window.location.pathname
        });
      });
    },
    
    trackErrors: function() {
      window.addEventListener('error', (e) => {
        this.track('error', {
          message: e.message,
          source: e.filename,
          line: e.lineno,
          column: e.colno
        });
      });
    }
  };
  
  function generateId() {
    const id = 'ws_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('workshop_session', id);
    return id;
  }
  
  // 初始化追蹤
  analytics.trackPageView();
  analytics.trackTimeSpent();
  analytics.trackErrors();
  
  // 匯出到全域
  window.workshopAnalytics = analytics;
})();
</script>
`;

// 匯出模組
module.exports = {
  WorkshopAnalytics,
  browserTrackingScript
};

// CLI 使用
if (require.main === module) {
  const analytics = new WorkshopAnalytics();
  
  // 模擬一些事件
  analytics.trackEvent('chapter_started', { chapter: 1 });
  analytics.trackEvent('ai_call', { model: 'claude' });
  analytics.trackEvent('test_executed', { testName: 'todo-app', passed: true });
  analytics.trackEvent('chapter_completed', { chapter: 1 });
  
  // 顯示指標
  console.log('當前指標:', analytics.getMetrics());
  
  // 生成報告
  analytics.generateReport().then(report => {
    console.log('報告已生成:', report);
  });
}