import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * DataAnalystAgent - Autonomously analyzes product data and decides what insights to extract
 */
export class DataAnalystAgent extends AutonomousAgent {
  constructor() {
    super('data_analyst', ['data_analysis', 'validation', 'insights']);
  }

  initialize() {
    this.subscriptions = ['system_start'];
    this.goals = [
      { 
        name: 'analyze_product_data', 
        priority: 1,
        requires: ['initial_data']
      }
    ];
  }

  async onSystemStart(data) {
    console.log(`DataAnalyst: Received product data for analysis`);
    // Agent decides to start analysis immediately
    this.state = 'working';
  }

  async canAchieveGoal(goal) {
    if (goal.name === 'analyze_product_data') {
      const data = this.getSharedData('initial_data');
      return data && typeof data === 'object';
    }
    return false;
  }

  async startWork(goal) {
    if (goal.name === 'analyze_product_data') {
      const rawData = this.getSharedData('initial_data');
      console.log(`DataAnalyst: Starting analysis of ${rawData.productName}`);
    }
  }

  async workOnGoal(goal) {
    if (goal.name === 'analyze_product_data') {
      const rawData = this.getSharedData('initial_data');
      
      // Agent autonomously decides what analysis to perform
      const analysis = await this.performAnalysis(rawData);
      
      // Store results and notify other agents
      this.setSharedData('product_analysis', analysis);
      this.broadcast('analysis_complete', { 
        agent: this.id, 
        analysis: analysis 
      });
      
      this.results = analysis;
      return true; // Goal completed
    }
    return false;
  }

  async performAnalysis(data) {
    // Agent makes autonomous decisions about analysis depth
    const analysis = {
      product: {
        name: this.cleanString(data.productName),
        concentration: this.cleanString(data.concentration),
        skinType: this.parseList(data.skinType),
        keyIngredients: this.parseList(data.keyIngredients),
        benefits: this.parseList(data.benefits),
        howToUse: this.cleanString(data.howToUse),
        sideEffects: this.cleanString(data.sideEffects),
        price: this.parsePrice(data.price)
      },
      insights: {
        target_demographic: this.inferDemographic(data),
        complexity_score: this.calculateComplexity(data),
        safety_level: this.assessSafety(data),
        price_category: this.categorizePricing(data.price)
      },
      metadata: {
        analyzed_at: new Date().toISOString(),
        analyzer: this.id,
        confidence: 0.95
      }
    };

    console.log(`DataAnalyst: Analysis complete with ${analysis.insights.complexity_score} complexity score`);
    return analysis;
  }

  cleanString(str) {
    return typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : '';
  }

  parseList(str) {
    return typeof str === 'string' ? str.split(',').map(item => item.trim()) : [];
  }

  parsePrice(priceStr) {
    const numeric = parseInt(priceStr.replace(/[^\d]/g, ''));
    return {
      original: priceStr,
      numeric: numeric,
      currency: 'INR'
    };
  }

  inferDemographic(data) {
    const skinTypes = data.skinType.toLowerCase();
    if (skinTypes.includes('oily')) return 'young_adults';
    if (skinTypes.includes('dry')) return 'mature_adults';
    return 'general';
  }

  calculateComplexity(data) {
    let score = 0;
    score += data.keyIngredients.split(',').length * 2;
    score += data.benefits.split(',').length;
    score += data.sideEffects ? 3 : 0;
    return Math.min(score, 10);
  }

  assessSafety(data) {
    const sideEffects = data.sideEffects.toLowerCase();
    if (sideEffects.includes('mild')) return 'low_risk';
    if (sideEffects.includes('moderate')) return 'medium_risk';
    return 'minimal_risk';
  }

  categorizePricing(priceStr) {
    const price = parseInt(priceStr.replace(/[^\d]/g, ''));
    if (price < 500) return 'budget';
    if (price < 1000) return 'mid_range';
    return 'premium';
  }
}