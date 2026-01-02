import { BaseAgent } from './BaseAgent.js';

/**
 * AnalyticsAgent - Analyzes content performance and provides insights
 * 
 * Responsibilities:
 * - Analyze content quality and engagement
 * - Generate performance metrics
 * - Provide optimization recommendations
 * - Track content effectiveness
 */
export class AnalyticsAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'analytics_001',
      name: 'AnalyticsAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.8,
      learningRate: config.learningRate || 0.12
    });

    this.metrics = new Map();
    this.benchmarks = {
      question_count: { min: 15, optimal: 20, max: 30 },
      answer_length: { min: 20, optimal: 50, max: 150 },
      category_coverage: { min: 5, optimal: 5, max: 7 },
      content_depth: { min: 70, optimal: 85, max: 100 }
    };

    this.addGoal('analyze_content_performance');
    this.addGoal('generate_optimization_insights');
  }

  /**
   * Analyze comprehensive content performance
   */
  async analyzeContentPerformance(generatedContent, productData) {
    console.log(`📊 [${this.name}] Analyzing content performance...`);
    
    const analysis = {
      overall_score: 0,
      content_analysis: {},
      performance_metrics: {},
      optimization_recommendations: [],
      engagement_prediction: {},
      quality_assessment: {},
      generated_at: new Date().toISOString()
    };

    // Analyze each content type
    for (const [contentType, content] of Object.entries(generatedContent)) {
      if (content && typeof content === 'object') {
        analysis.content_analysis[contentType] = await this.analyzeContentType(contentType, content, productData);
      }
    }

    // Generate overall performance metrics
    analysis.performance_metrics = this.generatePerformanceMetrics(analysis.content_analysis);
    
    // Calculate overall score
    analysis.overall_score = this.calculateOverallScore(analysis.performance_metrics);
    
    // Generate optimization recommendations
    analysis.optimization_recommendations = this.generateOptimizationRecommendations(analysis);
    
    // Predict engagement
    analysis.engagement_prediction = this.predictEngagement(analysis);
    
    // Assess quality
    analysis.quality_assessment = this.assessOverallQuality(analysis);

    console.log(`✅ [${this.name}] Content analysis completed - Overall Score: ${analysis.overall_score}/100`);
    
    return analysis;
  }

  /**
   * Analyze individual content type
   */
  async analyzeContentType(contentType, content, productData) {
    const analysis = {
      content_type: contentType,
      metrics: {},
      quality_score: 0,
      strengths: [],
      weaknesses: [],
      recommendations: []
    };

    switch (contentType) {
      case 'faq':
        analysis.metrics = this.analyzeFaqContent(content, productData);
        break;
      case 'product_page':
        analysis.metrics = this.analyzeProductPageContent(content, productData);
        break;
      case 'comparison_page':
        analysis.metrics = this.analyzeComparisonPageContent(content, productData);
        break;
      default:
        analysis.metrics = this.analyzeGenericContent(content, productData);
    }

    // Calculate quality score
    analysis.quality_score = this.calculateContentQualityScore(analysis.metrics, contentType);
    
    // Identify strengths and weaknesses
    this.identifyStrengthsAndWeaknesses(analysis, contentType);
    
    // Generate specific recommendations
    analysis.recommendations = this.generateContentRecommendations(analysis, contentType);

    return analysis;
  }

  /**
   * Analyze FAQ content
   */
  analyzeFaqContent(content, productData) {
    const metrics = {
      question_count: content.questions?.length || 0,
      category_count: new Set(content.questions?.map(q => q.category) || []).size,
      avg_answer_length: 0,
      category_distribution: {},
      content_coverage: 0,
      readability_score: 0
    };

    if (content.questions && content.questions.length > 0) {
      // Calculate average answer length
      const totalLength = content.questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0);
      metrics.avg_answer_length = Math.round(totalLength / content.questions.length);

      // Analyze category distribution
      content.questions.forEach(q => {
        metrics.category_distribution[q.category] = (metrics.category_distribution[q.category] || 0) + 1;
      });

      // Assess content coverage
      metrics.content_coverage = this.assessContentCoverage(content.questions, productData);
      
      // Calculate readability
      metrics.readability_score = this.calculateReadabilityScore(content.questions);
    }

    return metrics;
  }

  /**
   * Analyze product page content
   */
  analyzeProductPageContent(content, productData) {
    const metrics = {
      section_count: Object.keys(content.sections || {}).length,
      content_depth: 0,
      information_completeness: 0,
      specification_coverage: 0,
      benefit_analysis_quality: 0
    };

    // Assess content depth
    if (content.sections) {
      let totalDepth = 0;
      for (const section of Object.values(content.sections)) {
        totalDepth += this.calculateSectionDepth(section);
      }
      metrics.content_depth = Math.round(totalDepth / Object.keys(content.sections).length);
    }

    // Assess information completeness
    metrics.information_completeness = this.assessInformationCompleteness(content, productData);
    
    // Assess specification coverage
    metrics.specification_coverage = this.assessSpecificationCoverage(content.specifications, productData);
    
    // Assess benefit analysis quality
    if (content.sections?.benefits) {
      metrics.benefit_analysis_quality = this.assessBenefitAnalysisQuality(content.sections.benefits);
    }

    return metrics;
  }

  /**
   * Analyze comparison page content
   */
  analyzeComparisonPageContent(content, productData) {
    const metrics = {
      comparison_categories: Object.keys(content.sections || {}).length,
      analysis_depth: 0,
      competitive_insights: 0,
      recommendation_quality: 0,
      data_completeness: 0
    };

    // Assess analysis depth
    if (content.sections) {
      let totalDepth = 0;
      for (const section of Object.values(content.sections)) {
        totalDepth += this.calculateSectionDepth(section);
      }
      metrics.analysis_depth = Math.round(totalDepth / Object.keys(content.sections).length);
    }

    // Assess competitive insights
    metrics.competitive_insights = this.assessCompetitiveInsights(content);
    
    // Assess recommendation quality
    if (content.recommendation) {
      metrics.recommendation_quality = this.assessRecommendationQuality(content.recommendation);
    }
    
    // Assess data completeness
    metrics.data_completeness = this.assessComparisonDataCompleteness(content);

    return metrics;
  }

  /**
   * Analyze generic content
   */
  analyzeGenericContent(content, productData) {
    return {
      content_size: JSON.stringify(content).length,
      structure_complexity: this.assessStructureComplexity(content),
      data_richness: this.assessDataRichness(content)
    };
  }

  /**
   * Calculate content quality score
   */
  calculateContentQualityScore(metrics, contentType) {
    let score = 0;

    switch (contentType) {
      case 'faq':
        score += this.scoreAgainstBenchmark(metrics.question_count, this.benchmarks.question_count) * 0.3;
        score += this.scoreAgainstBenchmark(metrics.avg_answer_length, this.benchmarks.answer_length) * 0.25;
        score += this.scoreAgainstBenchmark(metrics.category_count, this.benchmarks.category_coverage) * 0.2;
        score += (metrics.content_coverage / 100) * 0.15;
        score += (metrics.readability_score / 100) * 0.1;
        break;

      case 'product_page':
        score += this.scoreAgainstBenchmark(metrics.content_depth, this.benchmarks.content_depth) * 0.4;
        score += (metrics.information_completeness / 100) * 0.25;
        score += (metrics.specification_coverage / 100) * 0.2;
        score += (metrics.benefit_analysis_quality / 100) * 0.15;
        break;

      case 'comparison_page':
        score += this.scoreAgainstBenchmark(metrics.analysis_depth, this.benchmarks.content_depth) * 0.3;
        score += (metrics.competitive_insights / 100) * 0.25;
        score += (metrics.recommendation_quality / 100) * 0.25;
        score += (metrics.data_completeness / 100) * 0.2;
        break;

      default:
        score = 70; // Default score for unknown content types
    }

    return Math.round(score);
  }

  /**
   * Score against benchmark
   */
  scoreAgainstBenchmark(value, benchmark) {
    if (value >= benchmark.optimal) return 100;
    if (value >= benchmark.min) {
      return 70 + ((value - benchmark.min) / (benchmark.optimal - benchmark.min)) * 30;
    }
    return Math.max(0, (value / benchmark.min) * 70);
  }

  /**
   * Generate performance metrics
   */
  generatePerformanceMetrics(contentAnalysis) {
    const metrics = {
      total_content_pieces: Object.keys(contentAnalysis).length,
      avg_quality_score: 0,
      content_utilization: 0,
      engagement_factors: {},
      optimization_potential: 0
    };

    // Calculate average quality score
    const qualityScores = Object.values(contentAnalysis).map(analysis => analysis.quality_score);
    metrics.avg_quality_score = qualityScores.length > 0 ? 
      Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length) : 0;

    // Calculate content utilization (how much of available data was used)
    metrics.content_utilization = this.calculateContentUtilization(contentAnalysis);
    
    // Identify engagement factors
    metrics.engagement_factors = this.identifyEngagementFactors(contentAnalysis);
    
    // Calculate optimization potential
    metrics.optimization_potential = 100 - metrics.avg_quality_score;

    return metrics;
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(performanceMetrics) {
    const weights = {
      avg_quality_score: 0.5,
      content_utilization: 0.2,
      engagement_potential: 0.3
    };

    let score = 0;
    score += performanceMetrics.avg_quality_score * weights.avg_quality_score;
    score += performanceMetrics.content_utilization * weights.content_utilization;
    
    // Calculate engagement potential from engagement factors
    const engagementScore = Object.values(performanceMetrics.engagement_factors).reduce((sum, factor) => sum + factor, 0) / 
                           Object.keys(performanceMetrics.engagement_factors).length;
    score += engagementScore * weights.engagement_potential;

    return Math.round(score);
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(analysis) {
    const recommendations = [];

    // Overall recommendations
    if (analysis.overall_score < 80) {
      recommendations.push({
        type: 'overall',
        priority: 'high',
        recommendation: 'Improve content quality across all content types',
        impact: 'High impact on user engagement and satisfaction'
      });
    }

    // Content-specific recommendations
    for (const [contentType, contentAnalysis] of Object.entries(analysis.content_analysis)) {
      recommendations.push(...contentAnalysis.recommendations.map(rec => ({
        ...rec,
        content_type: contentType
      })));
    }

    // Performance-based recommendations
    if (analysis.performance_metrics.content_utilization < 50) {
      recommendations.push({
        type: 'utilization',
        priority: 'medium',
        recommendation: 'Increase utilization of available product data',
        impact: 'Better content comprehensiveness and user value'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Predict engagement
   */
  predictEngagement(analysis) {
    const factors = {
      content_quality: analysis.overall_score / 100,
      question_variety: 0,
      information_depth: 0,
      readability: 0
    };

    // Calculate question variety from FAQ analysis
    const faqAnalysis = analysis.content_analysis.faq;
    if (faqAnalysis) {
      factors.question_variety = Math.min(1, faqAnalysis.metrics.category_count / 5);
    }

    // Calculate information depth from product page
    const productAnalysis = analysis.content_analysis.product_page;
    if (productAnalysis) {
      factors.information_depth = productAnalysis.metrics.content_depth / 100;
    }

    // Calculate readability
    if (faqAnalysis) {
      factors.readability = faqAnalysis.metrics.readability_score / 100;
    }

    const engagementScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;

    return {
      engagement_score: Math.round(engagementScore * 100),
      engagement_level: engagementScore > 0.8 ? 'high' : engagementScore > 0.6 ? 'medium' : 'low',
      key_factors: factors,
      predicted_metrics: {
        time_on_page: Math.round(30 + engagementScore * 120), // seconds
        bounce_rate: Math.round((1 - engagementScore) * 60), // percentage
        conversion_potential: Math.round(engagementScore * 100) // percentage
      }
    };
  }

  /**
   * Assess overall quality
   */
  assessOverallQuality(analysis) {
    return {
      quality_grade: this.getQualityGrade(analysis.overall_score),
      strengths: this.identifyOverallStrengths(analysis),
      improvement_areas: this.identifyImprovementAreas(analysis),
      readiness_assessment: {
        production_ready: analysis.overall_score >= 80,
        requires_review: analysis.overall_score < 80 && analysis.overall_score >= 60,
        needs_improvement: analysis.overall_score < 60
      }
    };
  }

  // Helper methods for detailed analysis

  assessContentCoverage(questions, productData) {
    const productFields = Object.keys(productData);
    let coverage = 0;
    
    questions.forEach(question => {
      const text = (question.question + ' ' + question.answer).toLowerCase();
      productFields.forEach(field => {
        if (productData[field] && text.includes(productData[field].toString().toLowerCase())) {
          coverage += 1;
        }
      });
    });
    
    return Math.min(100, (coverage / productFields.length) * 20);
  }

  calculateReadabilityScore(questions) {
    let totalScore = 0;
    
    questions.forEach(question => {
      const words = question.answer.split(' ').length;
      const sentences = question.answer.split(/[.!?]+/).length;
      const avgWordsPerSentence = words / sentences;
      
      // Simple readability score (lower is better, convert to 0-100 scale)
      const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2));
      totalScore += readabilityScore;
    });
    
    return Math.round(totalScore / questions.length);
  }

  calculateSectionDepth(section) {
    let depth = 0;
    if (section.title) depth += 10;
    if (section.content) {
      const contentStr = JSON.stringify(section.content);
      depth += Math.min(50, contentStr.length / 20);
    }
    return Math.min(100, depth);
  }

  assessInformationCompleteness(content, productData) {
    const requiredSections = ['overview', 'benefits', 'ingredients', 'usage', 'safety'];
    const presentSections = Object.keys(content.sections || {});
    const completeness = (presentSections.length / requiredSections.length) * 100;
    return Math.round(completeness);
  }

  assessSpecificationCoverage(specifications, productData) {
    if (!specifications) return 0;
    
    const requiredSpecs = ['product_name', 'concentration', 'skin_type', 'key_ingredients', 'benefits'];
    const presentSpecs = Object.keys(specifications);
    const coverage = (presentSpecs.length / requiredSpecs.length) * 100;
    return Math.round(coverage);
  }

  assessBenefitAnalysisQuality(benefitsSection) {
    if (!benefitsSection.content) return 0;
    
    let quality = 50; // Base score
    
    if (benefitsSection.content.detailed_analysis) quality += 25;
    if (benefitsSection.content.synergy) quality += 15;
    if (benefitsSection.content.primary_benefits?.length > 2) quality += 10;
    
    return Math.min(100, quality);
  }

  identifyStrengthsAndWeaknesses(analysis, contentType) {
    const metrics = analysis.metrics;
    
    // Identify strengths
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof value === 'number' && value >= 80) {
        analysis.strengths.push(`Strong ${metric.replace('_', ' ')}`);
      }
    });
    
    // Identify weaknesses
    Object.entries(metrics).forEach(([metric, value]) => {
      if (typeof value === 'number' && value < 60) {
        analysis.weaknesses.push(`Weak ${metric.replace('_', ' ')}`);
      }
    });
  }

  generateContentRecommendations(analysis, contentType) {
    const recommendations = [];
    
    analysis.weaknesses.forEach(weakness => {
      recommendations.push({
        type: 'improvement',
        priority: 'medium',
        recommendation: `Improve ${weakness.toLowerCase()}`,
        impact: 'Enhanced content quality and user experience'
      });
    });
    
    return recommendations;
  }

  calculateContentUtilization(contentAnalysis) {
    // Simple utilization calculation based on content richness
    let totalUtilization = 0;
    let count = 0;
    
    Object.values(contentAnalysis).forEach(analysis => {
      if (analysis.quality_score) {
        totalUtilization += analysis.quality_score;
        count++;
      }
    });
    
    return count > 0 ? Math.round(totalUtilization / count * 0.6) : 0; // Scale down to represent utilization
  }

  identifyEngagementFactors(contentAnalysis) {
    return {
      content_variety: Object.keys(contentAnalysis).length * 20,
      information_depth: 75, // Default good score
      user_value: 80, // Default good score
      accessibility: 70 // Default good score
    };
  }

  getQualityGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  identifyOverallStrengths(analysis) {
    const strengths = [];
    
    if (analysis.overall_score >= 80) {
      strengths.push('High overall content quality');
    }
    
    if (analysis.performance_metrics.content_utilization >= 70) {
      strengths.push('Good data utilization');
    }
    
    return strengths;
  }

  identifyImprovementAreas(analysis) {
    const areas = [];
    
    if (analysis.overall_score < 80) {
      areas.push('Content quality enhancement needed');
    }
    
    if (analysis.performance_metrics.content_utilization < 50) {
      areas.push('Increase data utilization');
    }
    
    return areas;
  }

  // Additional helper methods for comprehensive analysis
  
  assessCompetitiveInsights(content) {
    let score = 50; // Base score
    
    if (content.competitive_analysis) score += 25;
    if (content.decision_matrix) score += 15;
    if (content.market_positioning) score += 10;
    
    return Math.min(100, score);
  }

  assessRecommendationQuality(recommendation) {
    if (!recommendation) return 0;
    
    let quality = 50; // Base score
    
    if (recommendation.reasoning?.length > 0) quality += 25;
    if (recommendation.best_for) quality += 15;
    if (recommendation.considerations?.length > 0) quality += 10;
    
    return Math.min(100, quality);
  }

  assessComparisonDataCompleteness(content) {
    let completeness = 0;
    
    if (content.comparison?.product_a) completeness += 25;
    if (content.comparison?.product_b) completeness += 25;
    if (content.sections && Object.keys(content.sections).length >= 4) completeness += 30;
    if (content.recommendation) completeness += 20;
    
    return completeness;
  }

  assessStructureComplexity(content) {
    const str = JSON.stringify(content);
    const depth = (str.match(/\{/g) || []).length;
    return Math.min(100, depth * 5);
  }

  assessDataRichness(content) {
    const str = JSON.stringify(content);
    return Math.min(100, str.length / 50);
  }

  /**
   * Get analytics statistics
   */
  getAnalyticsStats() {
    return {
      agent: this.name,
      metrics_tracked: Array.from(this.metrics.keys()),
      benchmarks: this.benchmarks,
      analysis_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel
    };
  }
}