/**
 * ComparisonDataAgent - Autonomous agent for generating competitor data
 */

import { BaseAgent } from './BaseAgent.js';

export class ComparisonDataAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'comparison_data',
      name: 'ComparisonDataAgent',
      capabilities: ['competitor_generation', 'market_analysis'],
      initialGoals: ['wait_for_clean_data', 'generate_competitors', 'share_comparison_data']
    });
    
    this.competitorData = [];
  }
  
  async initialize() {
    console.log(`🔍 [${this.id}] Comparison Data Agent initialized`);
  }
  
  decideAction(situation) {
    if (!situation.beliefs.clean_data && this.goals.has('wait_for_clean_data')) {
      return { action: 'wait_for_clean_data', reasoning: 'Waiting for clean data' };
    }
    
    if (situation.beliefs.clean_data && this.goals.has('generate_competitors')) {
      return { action: 'generate_competitors', data: situation.beliefs.clean_data, reasoning: 'Generating competitor data' };
    }
    
    if (this.competitorData.length > 0 && this.goals.has('share_comparison_data')) {
      return { action: 'share_comparison_data', reasoning: 'Sharing competitor data' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_clean_data':
          return await this.waitForCleanData();
        case 'generate_competitors':
          return await this.generateCompetitors(decision.data);
        case 'share_comparison_data':
          return await this.shareComparisonData();
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async waitForCleanData() {
    if (this.beliefs.has('clean_data')) {
      this.goals.delete('wait_for_clean_data');
      return { success: true, message: 'Clean data received' };
    }
    return { success: false, message: 'Still waiting for clean data' };
  }
  
  async generateCompetitors(data) {
    console.log(`🏢 [${this.id}] Generating competitor data`);
    
    const competitors = this.createFictionalCompetitors(data);
    this.competitorData = competitors;
    
    this.goals.delete('generate_competitors');
    return { success: true, message: `Generated ${competitors.length} competitors` };
  }
  
  createFictionalCompetitors(originalProduct) {
    const competitorNames = ['RadiantGlow Serum', 'PureBright Formula', 'VitaLux Treatment'];
    const competitors = [];
    
    for (let i = 0; i < 2; i++) {
      const originalPrice = parseFloat((originalProduct.price || '₹699').replace(/[^\d.]/g, ''));
      const competitorPrice = Math.round(originalPrice * (0.8 + Math.random() * 0.4));
      
      competitors.push({
        productName: competitorNames[i],
        concentration: '15% Vitamin C',
        skinType: 'All skin types',
        keyIngredients: 'Vitamin C, Niacinamide, Peptides',
        benefits: 'Anti-aging, Hydration, Pore minimizing',
        howToUse: 'Apply 3-4 drops in the evening',
        sideEffects: 'May cause initial dryness',
        price: `₹${competitorPrice}`,
        fictional: true
      });
    }
    
    return competitors;
  }
  
  async shareComparisonData() {
    console.log(`📤 [${this.id}] Sharing comparison data`);
    
    await this.broadcastMessage('comparison_data_available', {
      competitors: this.competitorData,
      provider: this.id,
      timestamp: Date.now()
    });
    
    this.goals.delete('share_comparison_data');
    return { success: true, message: 'Comparison data shared' };
  }
  
  async handleMessage(message) {
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
    }
  }
}