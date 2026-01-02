import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * Autonomous Data Generator Agent
 * Generates synthetic data (like competitor products) when requested by other agents
 */
export class DataGeneratorAgent extends AutonomousAgent {
  constructor() {
    super('data-generator', []);
    
    this.capabilities.add('synthetic-data-generation');
    this.capabilities.add('competitor-analysis');
    
    this.generatedData = new Map();
    this.pendingRequests = [];
  }

  async perceive() {
    await super.perceive();
    
    // Check for data generation requests
    // This agent is reactive - it responds to requests from other agents
  }

  async deliberate() {
    // Clear old intentions
    this.intentions = [];

    // Process pending requests
    for (const request of this.pendingRequests) {
      if (!request.processed) {
        const goal = {
          id: `generate-data-${request.id}`,
          description: `Generate ${request.type} data`,
          requiredCapability: 'synthetic-data-generation',
          priority: 8,
          request
        };
        
        const plan = await this.planForGoal(goal);
        if (plan) {
          this.intentions.push({ goal, plan });
          request.processed = true;
        }
      }
    }
  }

  async planForGoal(goal) {
    const request = goal.request;
    
    if (request.type === 'competitor-data') {
      return {
        actions: [
          { type: 'analyze-original-product', status: 'pending' },
          { type: 'generate-competitor', status: 'pending' },
          { type: 'validate-competitor', status: 'pending' },
          { type: 'send-competitor-data', status: 'pending' }
        ],
        currentIndex: 0,
        nextAction() {
          return this.actions.find(a => a.status === 'pending');
        },
        markActionComplete(action) {
          action.status = 'completed';
        },
        isComplete() {
          return this.actions.every(a => a.status === 'completed');
        }
      };
    }
    
    return null;
  }

  async executeAction(action) {
    switch (action.type) {
      case 'analyze-original-product':
        return await this.analyzeOriginalProduct();
      
      case 'generate-competitor':
        return await this.generateCompetitor();
      
      case 'validate-competitor':
        return await this.validateCompetitor();
      
      case 'send-competitor-data':
        return await this.sendCompetitorData();
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  async analyzeOriginalProduct() {
    const context = this.beliefs.get('context');
    
    if (!context) {
      return { success: false, error: 'No product context available' };
    }

    const analysis = {
      priceRange: this.analyzePriceRange(context.price),
      ingredientProfile: this.analyzeIngredients(context.keyIngredients),
      benefitCategories: this.analyzeBenefits(context.benefits),
      targetMarket: this.analyzeTargetMarket(context.skinType)
    };

    this.updateBeliefs('original_analysis', analysis);
    console.log(`🔍 Analyzed original product characteristics`);
    return { success: true };
  }

  async generateCompetitor() {
    const originalAnalysis = this.beliefs.get('original_analysis');
    const context = this.beliefs.get('context');
    
    // Generate a realistic competitor with different characteristics
    const competitor = {
      productName: this.generateCompetitorName(),
      concentration: this.generateAlternativeConcentration(context.concentration),
      skinType: this.generateAlternativeSkinTypes(context.skinType),
      keyIngredients: this.generateAlternativeIngredients(context.keyIngredients),
      benefits: this.generateAlternativeBenefits(context.benefits),
      howToUse: this.generateAlternativeUsage(context.howToUse),
      sideEffects: this.generateAlternativeSideEffects(context.sideEffects),
      price: this.generateCompetitivePrice(context.price)
    };

    this.generatedData.set('competitor', competitor);
    console.log(`🏭 Generated competitor product: ${competitor.productName}`);
    return { success: true };
  }

  async validateCompetitor() {
    const competitor = this.generatedData.get('competitor');
    
    // Validate that competitor is realistic and different enough
    const requiredFields = ['productName', 'concentration', 'keyIngredients', 'benefits', 'price'];
    const missingFields = requiredFields.filter(field => !competitor[field]);
    
    if (missingFields.length > 0) {
      return { success: false, error: `Competitor missing fields: ${missingFields.join(', ')}` };
    }

    console.log(`✅ Competitor validation passed`);
    return { success: true };
  }

  async sendCompetitorData() {
    const competitor = this.generatedData.get('competitor');
    
    // Send to all agents who might need it
    this.broadcast('competitor-data', competitor);
    
    console.log(`📤 Sent competitor data to all agents`);
    return { success: true };
  }

  generateCompetitorName() {
    const prefixes = ['Radiant', 'Glow', 'Pure', 'Vital', 'Clear', 'Bright'];
    const suffixes = ['Glow', 'Boost', 'Plus', 'Pro', 'Max', 'Complex'];
    const types = ['Serum', 'Treatment', 'Solution', 'Formula'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return `${prefix}${suffix} Vitamin C ${type}`;
  }

  generateAlternativeConcentration(original) {
    if (original.includes('10%')) {
      return Math.random() > 0.5 ? '15% Vitamin C' : '20% Vitamin C';
    }
    return '12% Vitamin C';
  }

  generateAlternativeSkinTypes(original) {
    const alternatives = [
      'All skin types, Sensitive',
      'Dry, Mature',
      'Normal, Combination',
      'All skin types'
    ];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  generateAlternativeIngredients(original) {
    const baseIngredients = ['Vitamin C'];
    const additionalOptions = [
      'Vitamin E', 'Niacinamide', 'Retinol', 'Peptides', 
      'Arbutin', 'Kojic Acid', 'Ferulic Acid'
    ];
    
    // Pick 2-3 additional ingredients
    const selected = additionalOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 2);
    
    return [...baseIngredients, ...selected].join(', ');
  }

  generateAlternativeBenefits(original) {
    const benefitOptions = [
      'Anti-aging', 'Hydrating', 'Pore minimizing', 'Firming',
      'Even skin tone', 'Reduces fine lines', 'Antioxidant protection'
    ];
    
    const selected = benefitOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 2);
    
    return selected.join(', ');
  }

  generateAlternativeUsage(original) {
    const alternatives = [
      'Apply 3-4 drops in the evening after cleansing',
      'Use twice daily, morning and evening',
      'Apply 2-3 drops before moisturizer',
      'Use every other day initially, then daily as tolerated'
    ];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  generateAlternativeSideEffects(original) {
    const alternatives = [
      'May cause initial dryness for some users',
      'Possible mild irritation during first week of use',
      'Generally well tolerated by most skin types',
      'Rare cases of sensitivity in very sensitive skin'
    ];
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  generateCompetitivePrice(originalPrice) {
    const basePrice = parseInt(originalPrice.replace(/[^\d]/g, ''));
    const variation = Math.floor(Math.random() * 400) - 200; // ±200 variation
    const newPrice = Math.max(basePrice + variation, 299); // Minimum price
    return `₹${newPrice}`;
  }

  analyzePriceRange(price) {
    const numPrice = parseInt(price.replace(/[^\d]/g, ''));
    if (numPrice < 500) return 'budget';
    if (numPrice < 1000) return 'mid-range';
    return 'premium';
  }

  analyzeIngredients(ingredients) {
    const list = ingredients.split(',').map(i => i.trim().toLowerCase());
    return {
      count: list.length,
      hasVitaminC: list.some(i => i.includes('vitamin c')),
      hasHyaluronic: list.some(i => i.includes('hyaluronic')),
      complexity: list.length > 3 ? 'complex' : 'simple'
    };
  }

  analyzeBenefits(benefits) {
    const list = benefits.split(',').map(b => b.trim().toLowerCase());
    return {
      count: list.length,
      categories: list.map(b => {
        if (b.includes('bright')) return 'brightening';
        if (b.includes('dark') || b.includes('spot')) return 'spot-treatment';
        if (b.includes('aging')) return 'anti-aging';
        return 'general';
      })
    };
  }

  analyzeTargetMarket(skinType) {
    const types = skinType.toLowerCase();
    if (types.includes('oily')) return 'oily-prone';
    if (types.includes('dry')) return 'dry-skin';
    if (types.includes('sensitive')) return 'sensitive-skin';
    return 'general';
  }

  getResults() {
    return {
      generatedData: Object.fromEntries(this.generatedData),
      requestsProcessed: this.pendingRequests.length,
      status: 'completed'
    };
  }

  onActivate() {
    this.messageHandlers.set('competitor-data-request', this.handleCompetitorRequest.bind(this));
  }

  async handleCompetitorRequest(message) {
    const request = {
      id: Date.now(),
      type: 'competitor-data',
      requestingAgent: message.payload.requestingAgent,
      context: message.payload.productContext,
      processed: false
    };
    
    this.pendingRequests.push(request);
    console.log(`📥 Received competitor data request from ${message.from}`);
  }
}