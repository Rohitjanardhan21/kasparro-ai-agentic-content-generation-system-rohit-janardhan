import { Agent } from '../core/Agent.js';

/**
 * PerformanceMonitorAgent - monitors system performance and execution metrics
 */
export class PerformanceMonitorAgent extends Agent {
  constructor() {
    super('PerformanceMonitorAgent', ['AnalyticsAgent', 'SeoOptimizationAgent']);
    this.startTime = Date.now();
  }

  async process(input) {
    const endTime = Date.now();
    const executionTime = endTime - this.startTime;
    
    const analytics = input.AnalyticsAgent.analytics;
    const seo = input.SeoOptimizationAgent.seo_optimization;
    
    const performance = {
      execution_metrics: {
        total_execution_time_ms: executionTime,
        total_execution_time_seconds: Math.round(executionTime / 1000 * 100) / 100,
        agents_executed: Object.keys(input).length,
        average_agent_time_ms: Math.round(executionTime / Object.keys(input).length),
        performance_grade: this.calculatePerformanceGrade(executionTime)
      },
      system_efficiency: {
        content_generation_rate: this.calculateContentGenerationRate(analytics, executionTime),
        question_generation_speed: this.calculateQuestionGenerationSpeed(analytics, executionTime),
        template_processing_efficiency: this.calculateTemplateEfficiency(input, executionTime),
        memory_efficiency_score: this.estimateMemoryEfficiency(input)
      },
      quality_metrics: {
        content_quality_score: this.calculateContentQualityScore(analytics, seo),
        seo_effectiveness: seo.seo_score.total_score,
        user_engagement_potential: analytics.engagement_predictions.engagement_score,
        content_completeness: this.assessContentCompleteness(analytics)
      },
      scalability_analysis: {
        estimated_capacity: this.estimateSystemCapacity(executionTime),
        bottleneck_analysis: this.identifyBottlenecks(input, executionTime),
        optimization_opportunities: this.identifyOptimizationOpportunities(analytics, seo, executionTime)
      },
      recommendations: this.generatePerformanceRecommendations(analytics, seo, executionTime)
    };

    return {
      performance: performance,
      generated_at: new Date().toISOString(),
      system_snapshot: this.captureSystemSnapshot(input)
    };
  }

  calculatePerformanceGrade(executionTime) {
    if (executionTime < 1000) return 'A+';
    if (executionTime < 2000) return 'A';
    if (executionTime < 5000) return 'B';
    if (executionTime < 10000) return 'C';
    return 'D';
  }

  calculateContentGenerationRate(analytics, executionTime) {
    const totalContent = analytics.content_metrics.total_questions_generated + 
                        analytics.content_metrics.faq_questions_used;
    const contentPerSecond = totalContent / (executionTime / 1000);
    
    return {
      content_items_per_second: Math.round(contentPerSecond * 100) / 100,
      total_content_items: totalContent,
      efficiency_rating: contentPerSecond > 10 ? 'high' : contentPerSecond > 5 ? 'medium' : 'low'
    };
  }

  calculateQuestionGenerationSpeed(analytics, executionTime) {
    const questionsGenerated = analytics.content_metrics.total_questions_generated;
    const questionsPerSecond = questionsGenerated / (executionTime / 1000);
    
    return {
      questions_per_second: Math.round(questionsPerSecond * 100) / 100,
      generation_efficiency: questionsPerSecond > 5 ? 'excellent' : questionsPerSecond > 2 ? 'good' : 'needs_improvement'
    };
  }

  calculateTemplateEfficiency(input, executionTime) {
    const templatesProcessed = 3; // FAQ, Product, Comparison
    const templateProcessingTime = executionTime / templatesProcessed;
    
    return {
      average_template_processing_time_ms: Math.round(templateProcessingTime),
      templates_processed: templatesProcessed,
      processing_efficiency: templateProcessingTime < 500 ? 'high' : templateProcessingTime < 1000 ? 'medium' : 'low'
    };
  }

  estimateMemoryEfficiency(input) {
    // Estimate based on data size
    const dataSize = JSON.stringify(input).length;
    const memoryScore = dataSize < 50000 ? 90 : dataSize < 100000 ? 70 : dataSize < 200000 ? 50 : 30;
    
    return {
      estimated_memory_usage_kb: Math.round(dataSize / 1024),
      memory_efficiency_score: memoryScore,
      memory_grade: memoryScore > 80 ? 'excellent' : memoryScore > 60 ? 'good' : 'needs_optimization'
    };
  }

  calculateContentQualityScore(analytics, seo) {
    const analyticsScore = analytics.engagement_predictions.engagement_score;
    const seoScore = seo.seo_score.total_score;
    const readabilityScore = analytics.readability_scores.faq_readability;
    
    const overallScore = (analyticsScore + seoScore + readabilityScore) / 3;
    
    return {
      overall_quality_score: Math.round(overallScore),
      quality_breakdown: {
        engagement_quality: analyticsScore,
        seo_quality: seoScore,
        readability_quality: readabilityScore
      },
      quality_grade: overallScore > 80 ? 'A' : overallScore > 70 ? 'B' : overallScore > 60 ? 'C' : 'D'
    };
  }

  assessContentCompleteness(analytics) {
    const categoryCount = Object.keys(analytics.question_analysis.category_distribution).length;
    const questionCount = analytics.content_metrics.total_questions_generated;
    const utilizationRate = analytics.content_metrics.content_utilization_rate;
    
    const completenessScore = (categoryCount * 10) + (questionCount * 2) + utilizationRate;
    
    return {
      completeness_score: Math.min(100, completenessScore),
      category_coverage: categoryCount,
      question_depth: questionCount,
      content_utilization: utilizationRate,
      completeness_grade: completenessScore > 80 ? 'complete' : completenessScore > 60 ? 'adequate' : 'incomplete'
    };
  }

  estimateSystemCapacity(executionTime) {
    const productsPerHour = Math.round(3600000 / executionTime); // 1 hour in ms / execution time
    const productsPerDay = productsPerHour * 24;
    
    return {
      estimated_products_per_hour: productsPerHour,
      estimated_products_per_day: productsPerDay,
      capacity_rating: productsPerHour > 1000 ? 'high_volume' : productsPerHour > 100 ? 'medium_volume' : 'low_volume'
    };
  }

  identifyBottlenecks(input, executionTime) {
    const bottlenecks = [];
    
    if (executionTime > 5000) {
      bottlenecks.push({
        type: 'execution_time',
        severity: 'high',
        description: 'Overall execution time exceeds optimal threshold'
      });
    }
    
    const dataSize = JSON.stringify(input).length;
    if (dataSize > 100000) {
      bottlenecks.push({
        type: 'data_size',
        severity: 'medium',
        description: 'Large data payload may impact performance'
      });
    }
    
    return bottlenecks;
  }

  identifyOptimizationOpportunities(analytics, seo, executionTime) {
    const opportunities = [];
    
    if (analytics.engagement_predictions.engagement_score < 70) {
      opportunities.push({
        area: 'content_engagement',
        potential_improvement: 'high',
        suggestion: 'Enhance question variety and practical focus'
      });
    }
    
    if (seo.seo_score.total_score < 80) {
      opportunities.push({
        area: 'seo_optimization',
        potential_improvement: 'medium',
        suggestion: 'Improve keyword density and content structure'
      });
    }
    
    if (executionTime > 3000) {
      opportunities.push({
        area: 'performance',
        potential_improvement: 'high',
        suggestion: 'Optimize agent execution order and data processing'
      });
    }
    
    return opportunities;
  }

  generatePerformanceRecommendations(analytics, seo, executionTime) {
    const recommendations = [];
    
    // Performance recommendations
    if (executionTime > 2000) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        recommendation: 'Consider implementing parallel agent execution for independent tasks',
        expected_improvement: '30-50% faster execution'
      });
    }
    
    // Content quality recommendations
    if (analytics.content_metrics.content_utilization_rate < 50) {
      recommendations.push({
        category: 'content_quality',
        priority: 'medium',
        recommendation: 'Increase FAQ question count to improve content utilization',
        expected_improvement: 'Better user experience and content coverage'
      });
    }
    
    // SEO recommendations
    if (seo.seo_score.total_score < 75) {
      recommendations.push({
        category: 'seo',
        priority: 'medium',
        recommendation: 'Enhance keyword optimization and content structure',
        expected_improvement: 'Better search engine visibility'
      });
    }
    
    // Scalability recommendations
    const capacity = this.estimateSystemCapacity(executionTime);
    if (capacity.estimated_products_per_hour < 100) {
      recommendations.push({
        category: 'scalability',
        priority: 'low',
        recommendation: 'Implement caching and optimize data structures for higher throughput',
        expected_improvement: 'Support for higher volume processing'
      });
    }
    
    return recommendations;
  }

  captureSystemSnapshot(input) {
    return {
      agents_executed: Object.keys(input),
      total_data_processed_kb: Math.round(JSON.stringify(input).length / 1024),
      system_timestamp: new Date().toISOString(),
      node_version: process.version,
      memory_usage: process.memoryUsage ? {
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      } : 'not_available'
    };
  }
}