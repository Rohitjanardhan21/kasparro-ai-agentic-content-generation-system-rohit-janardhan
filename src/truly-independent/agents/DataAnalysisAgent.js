import { IndependentAgent } from '../IndependentAgent.js';
import { DataProcessingCapability } from '../capabilities/DataProcessingCapability.js';
import { CommunicationCapability } from '../capabilities/CommunicationCapability.js';
import { OpportunisticReasoning } from '../reasoning/OpportunisticReasoning.js';

/**
 * DataAnalysisAgent - A truly independent agent for data analysis
 * 
 * This agent demonstrates true independence by:
 * 1. Autonomously discovering and analyzing available data
 * 2. Making decisions about analysis depth and approach
 * 3. Learning from analysis results to improve future performance
 * 4. Sharing insights with other agents when beneficial
 * 5. Adapting analysis strategies based on data characteristics
 */
export class DataAnalysisAgent extends IndependentAgent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'data_analyst',
      name: config.name || 'DataAnalysisAgent',
      autonomyLevel: config.autonomyLevel || 0.9,
      adaptabilityLevel: config.adaptabilityLevel || 0.8,
      learningRate: config.learningRate || 0.15,
      
      // Modular capabilities
      capabilities: [
        {
          name: 'data_processing',
          type: 'analysis',
          execute: DataProcessingCapability.execute,
          canExecute: DataProcessingCapability.canExecute,
          cost: DataProcessingCapability.cost,
          reliability: DataProcessingCapability.reliability,
          parameters: DataProcessingCapability.parameters
        },
        {
          name: 'communication',
          type: 'interaction',
          execute: CommunicationCapability.execute,
          canExecute: CommunicationCapability.canExecute,
          cost: CommunicationCapability.cost,
          reliability: CommunicationCapability.reliability,
          parameters: CommunicationCapability.parameters
        }
      ],
      
      // Modular behaviors
      behaviors: [],
      
      // Modular reasoning strategies
      reasoningStrategies: [
        {
          name: 'opportunistic',
          evaluate: OpportunisticReasoning.evaluate,
          decide: OpportunisticReasoning.decide,
          learn: OpportunisticReasoning.learn,
          adapt: OpportunisticReasoning.adapt
        }
      ]
    };
    
    super(agentConfig);
    
    // Analysis-specific state
    this.analysisHistory = [];
    this.insightDatabase = new Map();
    this.analysisStrategies = new Map();
    this.dataPatterns = new Map();
    
    // Add advanced capabilities after super() call
    this.addCapability('advanced_analysis', {
      name: 'advanced_analysis',
      type: 'analysis',
      execute: this.performAdvancedAnalysis.bind(this),
      canExecute: this.canPerformAdvancedAnalysis.bind(this),
      cost: 4,
      reliability: 0.9
    });
    
    this.addCapability('insight_generation', {
      name: 'insight_generation',
      type: 'synthesis',
      execute: this.generateInsights.bind(this),
      canExecute: this.canGenerateInsights.bind(this),
      cost: 3,
      reliability: 0.85
    });
    
    // Add analytical reasoning strategy
    this.addReasoningStrategy('analytical', {
      name: 'analytical',
      evaluate: this.evaluateAnalyticalOpportunities.bind(this),
      decide: this.makeAnalyticalDecision.bind(this),
      learn: this.learnFromAnalysis.bind(this),
      adapt: this.adaptAnalysisStrategy.bind(this)
    });
    
    // Initialize analysis strategies
    this.initializeAnalysisStrategies();
    
    console.log(`🔬 [${this.name}] Data analysis agent initialized`);
    console.log(`   Analysis Strategies: ${Array.from(this.analysisStrategies.keys()).join(', ')}`);
  }
  
  /**
   * Initialize analysis strategies
   */
  initializeAnalysisStrategies() {
    this.analysisStrategies.set('comprehensive', {
      depth: 'deep',
      aspects: ['structure', 'content', 'quality', 'patterns', 'insights'],
      validation: 'thorough',
      confidence_threshold: 0.8
    });
    
    this.analysisStrategies.set('focused', {
      depth: 'targeted',
      aspects: ['content', 'quality'],
      validation: 'standard',
      confidence_threshold: 0.7
    });
    
    this.analysisStrategies.set('rapid', {
      depth: 'surface',
      aspects: ['structure', 'content'],
      validation: 'basic',
      confidence_threshold: 0.6
    });
  }
  
  /**
   * Override goal completion check for analysis-specific goals
   */
  isGoalCompleted(goal, situation) {
    if (goal === 'analyze_available_data') {
      // Check if we have processed data with good confidence
      return situation.beliefs.processed_data && situation.beliefs.processed_data.confidence > 0.7;
    }
    
    if (goal === 'generate_insights') {
      return this.insightDatabase.size > 0;
    }
    
    if (goal === 'share_analysis_results') {
      return this.analysisHistory.some(analysis => analysis.shared === true);
    }
    
    return super.isGoalCompleted(goal, situation);
  }
  
  /**
   * Override goal generation for analysis-specific goals
   */
  generateNewGoals(situation) {
    const newGoals = super.generateNewGoals(situation);
    
    // Generate analysis-specific goals based on situation
    if (situation.beliefs.env_productData && !this.goals.has('analyze_available_data')) {
      newGoals.push('analyze_available_data');
    }
    
    if (this.analysisHistory.length > 0 && !this.goals.has('generate_insights')) {
      newGoals.push('generate_insights');
    }
    
    if (this.insightDatabase.size > 0 && !this.goals.has('share_analysis_results')) {
      newGoals.push('share_analysis_results');
    }
    
    // Look for collaboration opportunities
    const otherAgents = situation.beliefs.other_agents?.value || [];
    const hasContentAgent = otherAgents.some(agentName => 
      typeof agentName === 'string' && (agentName.includes('content') || agentName.includes('generation'))
    );
    if (hasContentAgent && this.analysisHistory.length > 0 && !this.goals.has('collaborate_with_generators')) {
      newGoals.push('collaborate_with_generators');
    }
    
    return newGoals;
  }
  
  /**
   * Advanced analysis capability
   */
  async performAdvancedAnalysis(params, agent) {
    const { data, strategy = 'comprehensive', focus } = params;
    
    console.log(`🔬 [${agent.name}] Performing advanced analysis with ${strategy} strategy`);
    
    if (!data) {
      throw new Error('No data provided for analysis');
    }
    
    const analysisStrategy = agent.analysisStrategies.get(strategy) || agent.analysisStrategies.get('comprehensive');
    const result = {
      strategy: strategy,
      timestamp: new Date().toISOString(),
      confidence: 0,
      insights: [],
      metadata: {}
    };
    
    try {
      // Perform multi-aspect analysis
      const analysis = {};
      
      for (const aspect of analysisStrategy.aspects) {
        analysis[aspect] = await agent.analyzeAspect(data, aspect, analysisStrategy);
      }
      
      result.analysis = analysis;
      result.confidence = agent.calculateAnalysisConfidence(analysis, analysisStrategy);
      result.insights = agent.extractInsights(analysis, data);
      result.metadata = agent.generateAnalysisMetadata(data, analysis, strategy);
      
      // Store analysis in history
      const analysisRecord = {
        ...result,
        dataSource: 'unknown',
        shared: false,
        quality: agent.assessAnalysisQuality(result)
      };
      
      agent.analysisHistory.push(analysisRecord);
      
      // Store insights in database
      for (const insight of result.insights) {
        agent.insightDatabase.set(insight.id, insight);
      }
      
      // Share analysis with environment
      if (agent.environment) {
        agent.environment.addData('analysis_result', result, agent.name, {
          type: 'analysis_result',
          confidence: result.confidence,
          strategy: strategy
        });
      }
      
      return result;
      
    } catch (error) {
      result.error = error.message;
      throw error;
    }
  }
  
  /**
   * Check if agent can perform advanced analysis
   */
  canPerformAdvancedAnalysis(params, agent) {
    return params.data && typeof params.data === 'object';
  }
  
  /**
   * Analyze specific aspect of data
   */
  async analyzeAspect(data, aspect, strategy) {
    switch (aspect) {
      case 'structure':
        return this.analyzeDataStructure(data);
      case 'content':
        return this.analyzeDataContent(data);
      case 'quality':
        return this.analyzeDataQuality(data);
      case 'patterns':
        return this.analyzeDataPatterns(data);
      case 'insights':
        return this.analyzeForInsights(data);
      default:
        return { aspect: aspect, result: 'Analysis not implemented for this aspect' };
    }
  }
  
  /**
   * Analyze data structure
   */
  analyzeDataStructure(data) {
    const structure = {
      type: Array.isArray(data) ? 'array' : typeof data,
      fields: [],
      depth: 0,
      complexity: 'simple'
    };
    
    if (typeof data === 'object' && data !== null) {
      structure.fields = Object.keys(data);
      structure.fieldCount = structure.fields.length;
      
      // Analyze field types
      structure.fieldTypes = {};
      for (const [key, value] of Object.entries(data)) {
        structure.fieldTypes[key] = typeof value;
      }
      
      // Calculate complexity
      if (structure.fieldCount > 10) {
        structure.complexity = 'complex';
      } else if (structure.fieldCount > 5) {
        structure.complexity = 'moderate';
      }
      
      // Check for nested objects
      structure.hasNestedObjects = Object.values(data).some(value => 
        typeof value === 'object' && value !== null
      );
    }
    
    return {
      aspect: 'structure',
      result: structure,
      confidence: 0.95,
      summary: `${structure.type} with ${structure.fieldCount || 0} fields, ${structure.complexity} complexity`
    };
  }
  
  /**
   * Analyze data content
   */
  analyzeDataContent(data) {
    const content = {
      completeness: 0,
      richness: 0,
      relevance: 0,
      categories: []
    };
    
    if (typeof data === 'object' && data !== null) {
      const fields = Object.entries(data);
      const nonEmptyFields = fields.filter(([key, value]) => 
        value !== null && value !== undefined && value !== ''
      );
      
      content.completeness = fields.length > 0 ? nonEmptyFields.length / fields.length : 0;
      
      // Analyze content richness
      let totalLength = 0;
      let textFields = 0;
      
      for (const [key, value] of nonEmptyFields) {
        if (typeof value === 'string') {
          totalLength += value.length;
          textFields++;
          
          // Categorize content
          if (key.toLowerCase().includes('name') || key.toLowerCase().includes('title')) {
            content.categories.push('identification');
          } else if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost')) {
            content.categories.push('pricing');
          } else if (key.toLowerCase().includes('benefit') || key.toLowerCase().includes('effect')) {
            content.categories.push('benefits');
          } else if (key.toLowerCase().includes('ingredient') || key.toLowerCase().includes('component')) {
            content.categories.push('composition');
          } else if (key.toLowerCase().includes('use') || key.toLowerCase().includes('application')) {
            content.categories.push('usage');
          }
        }
      }
      
      content.richness = textFields > 0 ? Math.min(totalLength / (textFields * 50), 1) : 0;
      content.averageFieldLength = textFields > 0 ? totalLength / textFields : 0;
      content.categories = [...new Set(content.categories)]; // Remove duplicates
      
      // Assess relevance (for product data)
      const productKeywords = ['product', 'name', 'price', 'ingredient', 'benefit', 'use', 'skin', 'effect'];
      const relevantFields = fields.filter(([key]) => 
        productKeywords.some(keyword => key.toLowerCase().includes(keyword))
      );
      content.relevance = fields.length > 0 ? relevantFields.length / fields.length : 0;
    }
    
    return {
      aspect: 'content',
      result: content,
      confidence: 0.9,
      summary: `${Math.round(content.completeness * 100)}% complete, ${Math.round(content.richness * 100)}% rich, ${content.categories.length} categories identified`
    };
  }
  
  /**
   * Analyze data quality
   */
  analyzeDataQuality(data) {
    const quality = {
      score: 0,
      issues: [],
      strengths: [],
      recommendations: []
    };
    
    if (typeof data === 'object' && data !== null) {
      let score = 100;
      
      // Check for missing values
      const fields = Object.entries(data);
      const emptyFields = fields.filter(([key, value]) => 
        value === null || value === undefined || value === ''
      );
      
      if (emptyFields.length > 0) {
        const penalty = (emptyFields.length / fields.length) * 30;
        score -= penalty;
        quality.issues.push(`${emptyFields.length} empty fields detected`);
        quality.recommendations.push('Fill in missing data fields');
      } else {
        quality.strengths.push('All fields have values');
      }
      
      // Check data consistency
      const stringFields = fields.filter(([key, value]) => typeof value === 'string');
      const inconsistentFields = stringFields.filter(([key, value]) => 
        value.trim() !== value || value.includes('  ')
      );
      
      if (inconsistentFields.length > 0) {
        score -= inconsistentFields.length * 5;
        quality.issues.push('Inconsistent string formatting detected');
        quality.recommendations.push('Normalize string formatting');
      } else if (stringFields.length > 0) {
        quality.strengths.push('Consistent string formatting');
      }
      
      // Check for appropriate data types
      const priceFields = fields.filter(([key]) => key.toLowerCase().includes('price'));
      const numericPriceFields = priceFields.filter(([key, value]) => 
        typeof value === 'number' || !isNaN(parseFloat(value))
      );
      
      if (priceFields.length > 0 && numericPriceFields.length === priceFields.length) {
        quality.strengths.push('Price fields are properly formatted');
      } else if (priceFields.length > 0) {
        score -= 10;
        quality.issues.push('Price fields may need numeric conversion');
        quality.recommendations.push('Convert price fields to numeric format');
      }
      
      quality.score = Math.max(0, score);
    }
    
    return {
      aspect: 'quality',
      result: quality,
      confidence: 0.85,
      summary: `Quality score: ${Math.round(quality.score)}/100, ${quality.issues.length} issues, ${quality.strengths.length} strengths`
    };
  }
  
  /**
   * Analyze data patterns
   */
  analyzeDataPatterns(data) {
    const patterns = {
      fieldPatterns: {},
      valuePatterns: {},
      relationships: [],
      anomalies: []
    };
    
    if (typeof data === 'object' && data !== null) {
      // Analyze field naming patterns
      const fields = Object.keys(data);
      const namingStyles = {
        camelCase: fields.filter(field => /^[a-z][a-zA-Z0-9]*$/.test(field)).length,
        snake_case: fields.filter(field => /^[a-z][a-z0-9_]*$/.test(field)).length,
        PascalCase: fields.filter(field => /^[A-Z][a-zA-Z0-9]*$/.test(field)).length,
        lowercase: fields.filter(field => /^[a-z]+$/.test(field)).length
      };
      
      patterns.fieldPatterns.namingStyle = Object.entries(namingStyles)
        .reduce((a, b) => namingStyles[a[0]] > namingStyles[b[0]] ? a : b)[0];
      
      // Analyze value patterns
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          patterns.valuePatterns[key] = {
            length: value.length,
            hasNumbers: /\d/.test(value),
            hasSpecialChars: /[^a-zA-Z0-9\s]/.test(value),
            wordCount: value.split(/\s+/).length
          };
        }
      }
      
      // Look for relationships
      const textFields = Object.entries(data).filter(([key, value]) => typeof value === 'string');
      for (let i = 0; i < textFields.length; i++) {
        for (let j = i + 1; j < textFields.length; j++) {
          const [key1, value1] = textFields[i];
          const [key2, value2] = textFields[j];
          
          // Check for shared words
          const words1 = value1.toLowerCase().split(/\s+/);
          const words2 = value2.toLowerCase().split(/\s+/);
          const sharedWords = words1.filter(word => words2.includes(word));
          
          if (sharedWords.length > 0) {
            patterns.relationships.push({
              fields: [key1, key2],
              relationship: 'shared_vocabulary',
              strength: sharedWords.length / Math.max(words1.length, words2.length),
              sharedWords: sharedWords
            });
          }
        }
      }
    }
    
    return {
      aspect: 'patterns',
      result: patterns,
      confidence: 0.75,
      summary: `${Object.keys(patterns.fieldPatterns).length} field patterns, ${patterns.relationships.length} relationships found`
    };
  }
  
  /**
   * Analyze for insights
   */
  analyzeForInsights(data) {
    const insights = [];
    
    if (typeof data === 'object' && data !== null) {
      // Product-specific insights
      if (data.productName && data.price) {
        const price = parseFloat((data.price || '0').replace(/[^\d.]/g, ''));
        let priceCategory = 'unknown';
        
        if (price < 500) priceCategory = 'budget-friendly';
        else if (price < 1000) priceCategory = 'mid-range';
        else priceCategory = 'premium';
        
        insights.push({
          type: 'pricing_insight',
          insight: `${data.productName} is positioned as a ${priceCategory} product at ${data.price}`,
          confidence: 0.9,
          category: 'market_positioning'
        });
      }
      
      if (data.skinType && data.benefits) {
        insights.push({
          type: 'target_audience_insight',
          insight: `Product targets ${data.skinType} skin types with focus on ${data.benefits}`,
          confidence: 0.85,
          category: 'target_market'
        });
      }
      
      if (data.keyIngredients && data.benefits) {
        const ingredients = data.keyIngredients.split(',').map(i => i.trim());
        insights.push({
          type: 'formulation_insight',
          insight: `Formulation uses ${ingredients.length} key ingredients to deliver ${data.benefits}`,
          confidence: 0.8,
          category: 'product_formulation'
        });
      }
      
      if (data.howToUse) {
        const usageComplexity = data.howToUse.split(' ').length > 10 ? 'detailed' : 'simple';
        insights.push({
          type: 'usage_insight',
          insight: `Product has ${usageComplexity} usage instructions, indicating ${usageComplexity === 'detailed' ? 'specialized' : 'easy-to-use'} application`,
          confidence: 0.75,
          category: 'user_experience'
        });
      }
      
      if (data.sideEffects) {
        const severity = data.sideEffects.toLowerCase().includes('mild') ? 'low' : 'moderate';
        insights.push({
          type: 'safety_insight',
          insight: `Product has ${severity} risk profile with noted side effects: ${data.sideEffects}`,
          confidence: 0.9,
          category: 'product_safety'
        });
      }
    }
    
    return {
      aspect: 'insights',
      result: { insights: insights, count: insights.length },
      confidence: 0.8,
      summary: `Generated ${insights.length} insights across ${new Set(insights.map(i => i.category)).size} categories`
    };
  }
  
  /**
   * Calculate analysis confidence
   */
  calculateAnalysisConfidence(analysis, strategy) {
    let totalConfidence = 0;
    let aspectCount = 0;
    
    for (const [aspect, result] of Object.entries(analysis)) {
      if (result.confidence) {
        totalConfidence += result.confidence;
        aspectCount++;
      }
    }
    
    const baseConfidence = aspectCount > 0 ? totalConfidence / aspectCount : 0;
    
    // Adjust based on strategy
    const strategyMultiplier = {
      'comprehensive': 1.0,
      'focused': 0.9,
      'rapid': 0.8
    };
    
    return Math.min(1.0, baseConfidence * (strategyMultiplier[strategy.depth] || 1.0));
  }
  
  /**
   * Extract insights from analysis
   */
  extractInsights(analysis, originalData) {
    const insights = [];
    
    // Combine insights from all aspects
    for (const [aspect, result] of Object.entries(analysis)) {
      if (result.result && result.result.insights) {
        insights.push(...result.result.insights);
      }
    }
    
    // Generate meta-insights from combined analysis
    if (analysis.quality && analysis.content) {
      const qualityScore = analysis.quality.result.score;
      const completeness = analysis.content.result.completeness;
      
      if (qualityScore > 80 && completeness > 0.9) {
        insights.push({
          id: `meta_${Date.now()}_1`,
          type: 'meta_insight',
          insight: 'Data is high-quality and complete, suitable for comprehensive content generation',
          confidence: 0.9,
          category: 'data_readiness',
          source: 'meta_analysis'
        });
      } else if (qualityScore < 60 || completeness < 0.7) {
        insights.push({
          id: `meta_${Date.now()}_2`,
          type: 'meta_insight',
          insight: 'Data quality or completeness issues may affect content generation quality',
          confidence: 0.85,
          category: 'data_readiness',
          source: 'meta_analysis'
        });
      }
    }
    
    // Add unique IDs to insights that don't have them
    insights.forEach((insight, index) => {
      if (!insight.id) {
        insight.id = `insight_${Date.now()}_${index}`;
      }
    });
    
    return insights;
  }
  
  /**
   * Generate analysis metadata
   */
  generateAnalysisMetadata(data, analysis, strategy) {
    return {
      dataSize: JSON.stringify(data).length,
      analysisAspects: Object.keys(analysis),
      strategy: strategy,
      processingTime: Date.now(),
      dataFingerprint: this.generateDataFingerprint(data),
      analysisVersion: '1.0'
    };
  }
  
  /**
   * Generate data fingerprint
   */
  generateDataFingerprint(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
  
  /**
   * Assess analysis quality
   */
  assessAnalysisQuality(analysisResult) {
    let score = 50; // Base score
    
    if (analysisResult.confidence > 0.8) score += 25;
    else if (analysisResult.confidence > 0.6) score += 15;
    
    if (analysisResult.insights && analysisResult.insights.length > 3) score += 20;
    else if (analysisResult.insights && analysisResult.insights.length > 0) score += 10;
    
    if (analysisResult.analysis && Object.keys(analysisResult.analysis).length > 3) score += 15;
    
    return Math.min(100, score);
  }
  
  /**
   * Insight generation capability
   */
  async generateInsights(params, agent) {
    const { analysisResults, focus, depth = 'standard' } = params;
    
    console.log(`💡 [${agent.name}] Generating insights with ${depth} depth`);
    
    if (!analysisResults || agent.analysisHistory.length === 0) {
      throw new Error('No analysis results available for insight generation');
    }
    
    const result = {
      insights: [],
      patterns: [],
      recommendations: [],
      confidence: 0,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Generate insights from analysis history
      const recentAnalyses = agent.analysisHistory.slice(-5); // Last 5 analyses
      
      for (const analysis of recentAnalyses) {
        if (analysis.insights) {
          result.insights.push(...analysis.insights);
        }
      }
      
      // Generate cross-analysis patterns
      result.patterns = agent.identifyPatterns(recentAnalyses);
      
      // Generate recommendations
      result.recommendations = agent.generateRecommendations(recentAnalyses, result.insights);
      
      // Calculate confidence
      result.confidence = agent.calculateInsightConfidence(result);
      
      // Store insights
      for (const insight of result.insights) {
        agent.insightDatabase.set(insight.id, insight);
      }
      
      // Share insights with environment
      if (agent.environment) {
        agent.environment.addData('generated_insights', result, agent.name, {
          type: 'insights',
          confidence: result.confidence,
          insightCount: result.insights.length
        });
      }
      
      return result;
      
    } catch (error) {
      result.error = error.message;
      throw error;
    }
  }
  
  /**
   * Check if agent can generate insights
   */
  canGenerateInsights(params, agent) {
    return agent.analysisHistory.length > 0;
  }
  
  /**
   * Identify patterns across analyses
   */
  identifyPatterns(analyses) {
    const patterns = [];
    
    // Pattern: Consistent data quality issues
    const qualityIssues = analyses
      .filter(a => a.analysis && a.analysis.quality)
      .map(a => a.analysis.quality.result.issues)
      .flat();
    
    if (qualityIssues.length > 0) {
      const commonIssues = this.findCommonElements(qualityIssues);
      if (commonIssues.length > 0) {
        patterns.push({
          type: 'recurring_quality_issues',
          pattern: `Common data quality issues: ${commonIssues.join(', ')}`,
          frequency: commonIssues.length,
          confidence: 0.8
        });
      }
    }
    
    // Pattern: Content completeness trends
    const completenessScores = analyses
      .filter(a => a.analysis && a.analysis.content)
      .map(a => a.analysis.content.result.completeness);
    
    if (completenessScores.length > 1) {
      const avgCompleteness = completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length;
      patterns.push({
        type: 'completeness_trend',
        pattern: `Average data completeness: ${Math.round(avgCompleteness * 100)}%`,
        trend: avgCompleteness > 0.8 ? 'high' : avgCompleteness > 0.6 ? 'moderate' : 'low',
        confidence: 0.9
      });
    }
    
    return patterns;
  }
  
  /**
   * Find common elements in arrays
   */
  findCommonElements(arrays) {
    if (arrays.length === 0) return [];
    
    const elementCounts = {};
    
    for (const array of arrays) {
      const uniqueElements = [...new Set(array)];
      for (const element of uniqueElements) {
        elementCounts[element] = (elementCounts[element] || 0) + 1;
      }
    }
    
    const threshold = Math.ceil(arrays.length / 2); // Appear in at least half
    return Object.entries(elementCounts)
      .filter(([element, count]) => count >= threshold)
      .map(([element]) => element);
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations(analyses, insights) {
    const recommendations = [];
    
    // Recommendations based on quality analysis
    const qualityAnalyses = analyses.filter(a => a.analysis && a.analysis.quality);
    if (qualityAnalyses.length > 0) {
      const avgQuality = qualityAnalyses.reduce((sum, a) => 
        sum + a.analysis.quality.result.score, 0) / qualityAnalyses.length;
      
      if (avgQuality < 70) {
        recommendations.push({
          type: 'data_quality_improvement',
          recommendation: 'Improve data quality by addressing common issues like missing values and formatting inconsistencies',
          priority: 'high',
          impact: 'content_generation_quality'
        });
      }
    }
    
    // Recommendations based on insights
    const safetyInsights = insights.filter(i => i.category === 'product_safety');
    if (safetyInsights.length > 0) {
      recommendations.push({
        type: 'safety_communication',
        recommendation: 'Ensure safety information is prominently featured in generated content',
        priority: 'high',
        impact: 'user_safety'
      });
    }
    
    const pricingInsights = insights.filter(i => i.category === 'market_positioning');
    if (pricingInsights.length > 0) {
      recommendations.push({
        type: 'pricing_strategy',
        recommendation: 'Leverage pricing position in content to highlight value proposition',
        priority: 'medium',
        impact: 'marketing_effectiveness'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Calculate insight confidence
   */
  calculateInsightConfidence(insightResult) {
    let confidence = 0.5; // Base confidence
    
    if (insightResult.insights.length > 5) confidence += 0.2;
    if (insightResult.patterns.length > 0) confidence += 0.15;
    if (insightResult.recommendations.length > 0) confidence += 0.15;
    
    return Math.min(1.0, confidence);
  }
  
  /**
   * Analytical reasoning strategy - evaluate analytical opportunities
   */
  evaluateAnalyticalOpportunities(situation, agent) {
    const opportunities = [];
    
    // Look for unanalyzed data
    for (const [key, belief] of Object.entries(situation.beliefs)) {
      if (key.includes('Data') && !agent.analysisHistory.some(a => a.dataSource === key)) {
        opportunities.push({
          type: 'data_analysis',
          dataSource: key,
          value: 40,
          confidence: belief.confidence || 0.8,
          urgency: 0.8
        });
      }
    }
    
    // Look for insight generation opportunities
    if (agent.analysisHistory.length > 0 && agent.insightDatabase.size < 5) {
      opportunities.push({
        type: 'insight_generation',
        value: 35,
        confidence: 0.9,
        urgency: 0.6
      });
    }
    
    return {
      opportunities: opportunities,
      analyticalReadiness: opportunities.length > 0 ? 0.9 : 0.3,
      dataAvailability: Object.keys(situation.beliefs).filter(k => k.includes('Data')).length
    };
  }
  
  /**
   * Make analytical decision
   */
  makeAnalyticalDecision(situation, agent) {
    const evaluation = agent.evaluateAnalyticalOpportunities(situation, agent);
    
    if (evaluation.opportunities.length === 0) {
      return null;
    }
    
    // Prioritize by value and urgency
    const bestOpportunity = evaluation.opportunities.reduce((best, current) => {
      const bestScore = best.value * best.urgency;
      const currentScore = current.value * current.urgency;
      return currentScore > bestScore ? current : best;
    });
    
    if (bestOpportunity.type === 'data_analysis') {
      return {
        type: 'analyze_data',
        action: 'advanced_analysis',
        capability: 'advanced_analysis',
        parameters: {
          data: situation.beliefs[bestOpportunity.dataSource]?.value,
          strategy: 'comprehensive'
        },
        expectedValue: bestOpportunity.value,
        reasoning: `Analyzing ${bestOpportunity.dataSource} with comprehensive strategy`
      };
    } else if (bestOpportunity.type === 'insight_generation') {
      return {
        type: 'generate_insights',
        action: 'insight_generation',
        capability: 'insight_generation',
        parameters: {
          analysisResults: agent.analysisHistory,
          depth: 'standard'
        },
        expectedValue: bestOpportunity.value,
        reasoning: 'Generating insights from available analysis results'
      };
    }
    
    return null;
  }
  
  /**
   * Learn from analysis
   */
  learnFromAnalysis(decision, result, situation, agent) {
    if (!decision || !decision.type.includes('analyz')) return;
    
    const success = result.success;
    const quality = result.data?.quality || 0;
    const confidence = result.data?.confidence || 0;
    
    // Update analysis strategy preferences
    if (decision.parameters && decision.parameters.strategy) {
      const strategy = decision.parameters.strategy;
      const strategyKey = `analysis_strategy_${strategy}`;
      
      let strategyKnowledge = agent.knowledge.get(strategyKey) || {
        attempts: 0,
        successes: 0,
        averageQuality: 0,
        averageConfidence: 0
      };
      
      strategyKnowledge.attempts++;
      if (success) {
        strategyKnowledge.successes++;
        strategyKnowledge.averageQuality = 
          (strategyKnowledge.averageQuality + quality) / 2;
        strategyKnowledge.averageConfidence = 
          (strategyKnowledge.averageConfidence + confidence) / 2;
      }
      
      agent.knowledge.set(strategyKey, strategyKnowledge);
    }
    
    console.log(`🧠 [${agent.name}] Learned from analysis: quality ${quality}/100, confidence ${Math.round(confidence * 100)}%`);
  }
  
  /**
   * Adapt analysis strategy
   */
  adaptAnalysisStrategy(agent) {
    // Adjust strategies based on performance
    for (const [strategyName, strategy] of agent.analysisStrategies.entries()) {
      const knowledgeKey = `analysis_strategy_${strategyName}`;
      const knowledge = agent.knowledge.get(knowledgeKey);
      
      if (knowledge && knowledge.attempts > 2) {
        const successRate = knowledge.successes / knowledge.attempts;
        const avgQuality = knowledge.averageQuality || 0;
        
        if (successRate < 0.7 || avgQuality < 60) {
          // Improve strategy
          if (strategy.confidence_threshold > 0.5) {
            strategy.confidence_threshold -= 0.1;
          }
          if (strategy.aspects.length < 5) {
            strategy.aspects.push('validation');
          }
          
          console.log(`📈 [${agent.name}] Adapted ${strategyName} strategy for better performance`);
        }
      }
    }
  }
  
  /**
   * Behavior: Should hunt for data
   */
  shouldHuntForData(situation, agent) {
    const availableData = Object.keys(situation.beliefs).filter(k => k.includes('Data'));
    const analyzedData = agent.analysisHistory.map(a => a.dataSource);
    return availableData.some(data => !analyzedData.includes(data));
  }
  
  /**
   * Behavior: Hunt for data
   */
  async huntForData(situation, agent) {
    if (agent.environment) {
      const availableData = agent.environment.getAvailableData();
      
      for (const [key, dataInfo] of Object.entries(availableData)) {
        if (!agent.analysisHistory.some(a => a.dataSource === key)) {
          const data = agent.environment.getData(key);
          if (data) {
            agent.beliefs.set(`env_${key}`, {
              value: data.value,
              confidence: dataInfo.confidence,
              timestamp: Date.now()
            });
            
            console.log(`🔍 [${agent.name}] Discovered new data: ${key}`);
          }
        }
      }
    }
  }
  
  /**
   * Behavior: Should share insights
   */
  shouldShareInsights(situation, agent) {
    const otherAgents = situation.beliefs.other_agents?.value || [];
    return agent.insightDatabase.size > 0 && otherAgents.length > 0;
  }
  
  /**
   * Behavior: Share insights
   */
  async shareInsights(situation, agent) {
    const otherAgents = situation.beliefs.other_agents?.value || [];
    
    for (const otherAgent of otherAgents) {
      if (typeof otherAgent === 'string' && (otherAgent.includes('content') || otherAgent.includes('generation'))) {
        if (agent.capabilities.has('communication')) {
          try {
            const insights = Array.from(agent.insightDatabase.values()).slice(0, 5); // Share top 5
            
            await agent.capabilities.get('communication').execute({
              protocol: 'direct',
              target: otherAgent,
              messageType: 'data_sharing',
              content: {
                type: 'analysis_insights',
                data: insights,
                source: 'data_analysis',
                confidence: 0.9
              }
            }, agent);
            
            console.log(`📤 [${agent.name}] Shared insights with ${otherAgent}`);
          } catch (error) {
            console.log(`⚠️  [${agent.name}] Failed to share insights with ${otherAgent}: ${error.message}`);
          }
        }
      }
    }
  }
  
  /**
   * Behavior: Should optimize analysis
   */
  shouldOptimizeAnalysis(situation, agent) {
    return agent.analysisHistory.length > 3 && 
           agent.analysisHistory.slice(-3).some(a => a.quality < 70);
  }
  
  /**
   * Behavior: Optimize analysis approach
   */
  async optimizeAnalysisApproach(situation, agent) {
    console.log(`🔧 [${agent.name}] Optimizing analysis approach based on recent performance`);
    
    const recentAnalyses = agent.analysisHistory.slice(-3);
    const avgQuality = recentAnalyses.reduce((sum, a) => sum + a.quality, 0) / recentAnalyses.length;
    
    if (avgQuality < 70) {
      // Switch to more comprehensive strategy
      for (const [name, strategy] of agent.analysisStrategies.entries()) {
        if (name === 'comprehensive') {
          strategy.aspects = ['structure', 'content', 'quality', 'patterns', 'insights', 'validation'];
          strategy.confidence_threshold = 0.9;
        }
      }
      
      console.log(`📈 [${agent.name}] Enhanced analysis strategies for better quality`);
    }
  }
  
  /**
   * Get agent-specific status
   */
  getStatus() {
    const baseStatus = super.getStatus();
    
    return {
      ...baseStatus,
      dataAnalysis: {
        analysisHistory: this.analysisHistory.length,
        insightDatabase: this.insightDatabase.size,
        analysisStrategies: Array.from(this.analysisStrategies.keys()),
        recentAnalysisQuality: this.analysisHistory.length > 0 ? 
          this.analysisHistory.slice(-3).reduce((sum, a) => sum + a.quality, 0) / Math.min(3, this.analysisHistory.length) : 0
      }
    };
  }
}