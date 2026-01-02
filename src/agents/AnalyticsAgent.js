import { BaseAgent } from './BaseAgent.js';

/**
 * AnalyticsAgent - Autonomous agent for content analytics and performance monitoring
 * 
 * This agent:
 * 1. Autonomously analyzes generated content quality
 * 2. Makes independent decisions about metrics to track
 * 3. Provides performance insights and recommendations
 * 4. Shares analytics data with other agents
 */
export class AnalyticsAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'analytics',
      name: 'AnalyticsAgent',
      capabilities: ['content_analysis', 'performance_monitoring', 'quality_assessment'],
      initialGoals: ['wait_for_content', 'analyze_content_quality', 'generate_insights', 'save_analytics']
    });

    this.analyticsData = null;
    this.contentMetrics = new Map();
    this.qualityBenchmarks = {
      faq_questions: { min: 15, optimal: 20 },
      content_depth: { min: 70, optimal: 85 },
      readability: { min: 60, optimal: 80 }
    };
  }

  async initialize() {
    console.log(`📊 [${this.id}] Analytics Agent initialized`);
  }
  
  decideAction(situation) {
    // Check if we have any generated content to analyze
    const hasContent = situation.beliefs.faq_content || 
                      situation.beliefs.product_content || 
                      situation.beliefs.comparison_content;
    
    if (!hasContent && this.goals.has('wait_for_content')) {
      return { action: 'wait_for_content', reasoning: 'Waiting for generated content to analyze' };
    }
    
    if (hasContent && this.goals.has('analyze_content_quality')) {
      return { action: 'analyze_content_quality', reasoning: 'Analyzing content quality and performance' };
    }
    
    if (this.contentMetrics.size > 0 && this.goals.has('generate_insights')) {
      return { action: 'generate_insights', reasoning: 'Generating performance insights' };
    }
    
    if (this.analyticsData && this.goals.has('save_analytics')) {
      return { action: 'save_analytics', reasoning: 'Saving analytics data' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_content':
          return await this.waitForContent();
        case 'analyze_content_quality':
          return await this.analyzeContentQuality();
        case 'generate_insights':
          return await this.generateInsights();
        case 'save_analytics':
          return await this.saveAnalytics();
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async waitForContent() {
    const hasContent = this.beliefs.has('faq_content') || 
                      this.beliefs.has('product_content') || 
                      this.beliefs.has('comparison_content');
    
    if (hasContent) {
      this.goals.delete('wait_for_content');
      return { success: true, message: 'Content received for analysis' };
    }
    return { success: false, message: 'Still waiting for content' };
  }
  
  async analyzeContentQuality() {
    console.log(`📊 [${this.id}] Analyzing content quality`);
    
    const contentTypes = ['faq_content', 'product_content', 'comparison_content'];
    let totalScore = 0;
    let analyzedCount = 0;
    
    for (const contentType of contentTypes) {
      if (this.beliefs.has(contentType)) {
        const content = this.beliefs.get(contentType);
        const metrics = this.analyzeContent(content, contentType);
        this.contentMetrics.set(contentType, metrics);
        totalScore += metrics.quality_score;
        analyzedCount++;
      }
    }
    
    const overallScore = analyzedCount > 0 ? Math.round(totalScore / analyzedCount) : 0;
    
    console.log(`📈 [${this.id}] Content analysis complete - Overall Score: ${overallScore}/100`);
    
    this.goals.delete('analyze_content_quality');
    return { success: true, message: `Analyzed ${analyzedCount} content types`, overallScore };
  }
  
  analyzeContent(content, contentType) {
    const metrics = {
      content_type: contentType,
      quality_score: 0,
      metrics: {},
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
    
    switch (contentType) {
      case 'faq_content':
        metrics.metrics = this.analyzeFaqContent(content);
        break;
      case 'product_content':
        metrics.metrics = this.analyzeProductContent(content);
        break;
      case 'comparison_content':
        metrics.metrics = this.analyzeComparisonContent(content);
        break;
      default:
        metrics.metrics = { content_size: JSON.stringify(content).length };
    }
    
    metrics.quality_score = this.calculateQualityScore(metrics.metrics, contentType);
    this.identifyStrengthsAndWeaknesses(metrics);
    metrics.recommendations = this.generateRecommendations(metrics);
    
    return metrics;
  }
  
  analyzeFaqContent(content) {
    const questions = content.questions || [];
    const categories = new Set(questions.map(q => q.category)).size;
    const avgAnswerLength = questions.length > 0 ? 
      questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0) / questions.length : 0;
    
    return {
      question_count: questions.length,
      category_count: categories,
      avg_answer_length: Math.round(avgAnswerLength),
      content_coverage: this.assessContentCoverage(questions),
      readability_score: this.calculateReadabilityScore(questions)
    };
  }
  
  analyzeProductContent(content) {
    const sections = Object.keys(content.sections || {});
    const specifications = Object.keys(content.specifications || {});
    
    return {
      section_count: sections.length,
      specification_count: specifications.length,
      content_depth: this.calculateContentDepth(content.sections || {}),
      information_completeness: this.assessInformationCompleteness(content)
    };
  }
  
  analyzeComparisonContent(content) {
    const comparison = content.comparison || {};
    const analysis = content.analysis || {};
    
    return {
      has_primary_product: !!comparison.primary_product,
      competitor_count: (comparison.competitors || []).length,
      analysis_depth: Object.keys(analysis).length,
      has_recommendation: !!content.recommendation
    };
  }
  
  calculateQualityScore(metrics, contentType) {
    let score = 50; // Base score
    
    switch (contentType) {
      case 'faq_content':
        if (metrics.question_count >= this.qualityBenchmarks.faq_questions.optimal) score += 25;
        else if (metrics.question_count >= this.qualityBenchmarks.faq_questions.min) score += 15;
        
        if (metrics.category_count >= 5) score += 15;
        if (metrics.readability_score >= this.qualityBenchmarks.readability.optimal) score += 10;
        break;
        
      case 'product_content':
        if (metrics.section_count >= 5) score += 20;
        if (metrics.content_depth >= this.qualityBenchmarks.content_depth.optimal) score += 20;
        if (metrics.information_completeness >= 80) score += 10;
        break;
        
      case 'comparison_content':
        if (metrics.has_primary_product) score += 15;
        if (metrics.competitor_count >= 2) score += 15;
        if (metrics.analysis_depth >= 3) score += 15;
        if (metrics.has_recommendation) score += 5;
        break;
    }
    
    return Math.min(100, score);
  }
  
  async generateInsights() {
    console.log(`💡 [${this.id}] Generating performance insights`);
    
    const insights = {
      overall_performance: this.calculateOverallPerformance(),
      content_analysis: Object.fromEntries(this.contentMetrics.entries()),
      key_insights: this.extractKeyInsights(),
      optimization_opportunities: this.identifyOptimizationOpportunities(),
      performance_trends: this.analyzePerformanceTrends(),
      recommendations: this.generateSystemRecommendations()
    };
    
    this.analyticsData = {
      ...insights,
      generated_by: this.id,
      timestamp: new Date().toISOString(),
      analysis_version: '1.0'
    };
    
    this.goals.delete('generate_insights');
    return { success: true, message: 'Performance insights generated' };
  }
  
  calculateOverallPerformance() {
    const scores = Array.from(this.contentMetrics.values()).map(m => m.quality_score);
    const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    return {
      overall_score: Math.round(avgScore),
      content_pieces_analyzed: this.contentMetrics.size,
      performance_grade: this.getPerformanceGrade(avgScore),
      meets_quality_standards: avgScore >= 70
    };
  }
  
  extractKeyInsights() {
    const insights = [];
    
    for (const [contentType, metrics] of this.contentMetrics.entries()) {
      if (metrics.quality_score >= 80) {
        insights.push(`${contentType} shows excellent quality (${metrics.quality_score}/100)`);
      } else if (metrics.quality_score < 60) {
        insights.push(`${contentType} needs improvement (${metrics.quality_score}/100)`);
      }
      
      if (metrics.strengths.length > 0) {
        insights.push(`${contentType} strengths: ${metrics.strengths.join(', ')}`);
      }
    }
    
    return insights;
  }
  
  identifyOptimizationOpportunities() {
    const opportunities = [];
    
    for (const [contentType, metrics] of this.contentMetrics.entries()) {
      if (contentType === 'faq_content' && metrics.metrics.question_count < this.qualityBenchmarks.faq_questions.optimal) {
        opportunities.push({
          content_type: contentType,
          opportunity: 'Increase question count',
          current: metrics.metrics.question_count,
          target: this.qualityBenchmarks.faq_questions.optimal,
          impact: 'high'
        });
      }
      
      if (metrics.metrics.content_depth < this.qualityBenchmarks.content_depth.optimal) {
        opportunities.push({
          content_type: contentType,
          opportunity: 'Improve content depth',
          current: metrics.metrics.content_depth,
          target: this.qualityBenchmarks.content_depth.optimal,
          impact: 'medium'
        });
      }
    }
    
    return opportunities;
  }
  
  analyzePerformanceTrends() {
    // Simple trend analysis based on current metrics
    const scores = Array.from(this.contentMetrics.values()).map(m => m.quality_score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      trend_direction: avgScore >= 75 ? 'positive' : avgScore >= 60 ? 'stable' : 'needs_attention',
      consistency: this.calculateConsistency(scores),
      improvement_potential: 100 - avgScore
    };
  }
  
  generateSystemRecommendations() {
    const recommendations = [];
    
    const overallScore = this.calculateOverallPerformance().overall_score;
    
    if (overallScore < 70) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Focus on improving content quality across all content types',
        expected_impact: 'Significant improvement in user engagement'
      });
    }
    
    if (this.contentMetrics.size < 3) {
      recommendations.push({
        priority: 'medium',
        recommendation: 'Ensure all content types are being generated',
        expected_impact: 'Complete content coverage'
      });
    }
    
    recommendations.push({
      priority: 'low',
      recommendation: 'Continue monitoring content quality metrics',
      expected_impact: 'Sustained quality improvement'
    });
    
    return recommendations;
  }
  
  async saveAnalytics() {
    console.log(`💾 [${this.id}] Saving analytics data`);
    
    try {
      const fs = await import('fs');
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      
      fs.writeFileSync('output/analytics.json', JSON.stringify(this.analyticsData, null, 2));
      
      // Broadcast analytics completion
      await this.broadcastMessage('analytics_completed', {
        analytics: this.analyticsData,
        generator: this.id
      });
      
      this.goals.delete('save_analytics');
      return { success: true, message: 'Analytics data saved' };
    } catch (error) {
      throw new Error(`Failed to save analytics: ${error.message}`);
    }
  }
  
  async handleMessage(message) {
    if (message.type === 'content_generated') {
      const contentType = message.content.contentType + '_content';
      this.beliefs.set(contentType, message.content.data);
      console.log(`📊 [${this.id}] Received ${message.content.contentType} content for analysis`);
    }
  }
  
  // Helper methods
  assessContentCoverage(questions) {
    return Math.min(100, questions.length * 5); // Simple coverage metric
  }
  
  calculateReadabilityScore(questions) {
    if (questions.length === 0) return 0;
    
    let totalScore = 0;
    questions.forEach(q => {
      const words = (q.answer || '').split(' ').length;
      const sentences = (q.answer || '').split(/[.!?]+/).length;
      const avgWordsPerSentence = words / Math.max(sentences, 1);
      
      // Simple readability (lower words per sentence = higher score)
      const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2));
      totalScore += readabilityScore;
    });
    
    return Math.round(totalScore / questions.length);
  }
  
  calculateContentDepth(sections) {
    if (Object.keys(sections).length === 0) return 0;
    
    let totalDepth = 0;
    for (const section of Object.values(sections)) {
      let depth = 0;
      if (section.title) depth += 10;
      if (section.content) {
        const contentStr = JSON.stringify(section.content);
        depth += Math.min(50, contentStr.length / 20);
      }
      totalDepth += Math.min(100, depth);
    }
    
    return Math.round(totalDepth / Object.keys(sections).length);
  }
  
  assessInformationCompleteness(content) {
    const requiredSections = ['overview', 'benefits', 'ingredients', 'usage', 'safety'];
    const presentSections = Object.keys(content.sections || {});
    return Math.round((presentSections.length / requiredSections.length) * 100);
  }
  
  identifyStrengthsAndWeaknesses(metrics) {
    Object.entries(metrics.metrics).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        if (value >= 80) {
          metrics.strengths.push(`Strong ${metric.replace('_', ' ')}`);
        } else if (value < 60) {
          metrics.weaknesses.push(`Weak ${metric.replace('_', ' ')}`);
        }
      }
    });
  }
  
  generateRecommendations(metrics) {
    const recommendations = [];
    
    metrics.weaknesses.forEach(weakness => {
      recommendations.push({
        type: 'improvement',
        recommendation: `Improve ${weakness.toLowerCase()}`,
        priority: 'medium'
      });
    });
    
    return recommendations;
  }
  
  getPerformanceGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }
  
  calculateConsistency(scores) {
    if (scores.length <= 1) return 100;
    
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to consistency score (lower std dev = higher consistency)
    return Math.max(0, 100 - (stdDev * 2));
  }
}