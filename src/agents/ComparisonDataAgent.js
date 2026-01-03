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
  
  /**
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`🔍 [${this.id}] Working on goal: ${goal.description}`);
    
    try {
      // Check if we have clean data first - try multiple sources including prefixed ones
      let cleanData = this.beliefs.get('clean_data') || 
                     this.beliefs.get('initial_context') ||
                     this.knowledge.get('processed_data');
      
      // Also try prefixed knowledge keys from other agents
      if (!cleanData) {
        for (const [key, value] of this.knowledge.entries()) {
          if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
            cleanData = value;
            break;
          }
        }
      }
      
      if (!cleanData && (goal.description.includes('competition') || goal.description.includes('competitor') || goal.description.includes('market'))) {
        return { success: false, message: 'No clean data available for competitor generation' };
      }
      
      if (goal.description.includes('competition') || goal.description.includes('competitor') || goal.description.includes('market')) {
        return await this.generateCompetitorData();
      }
      
      if (goal.description.includes('process_product')) {
        // Mark product processing goal as completed since we have clean data
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
        this.goals.delete(goal);
        return { success: true, message: 'Product processing completed' };
      }
      
      return { success: false, message: 'Unknown goal type' };
    } catch (error) {
      console.error(`❌ [${this.id}] Error in performGoalWork: ${error.message}`);
      return { success: false, message: `Error: ${error.message}` };
    }
  }
  
  /**
   * Generate competitor data autonomously
   */
  async generateCompetitorData() {
    // Get clean data from beliefs - try multiple sources including prefixed ones
    let cleanData = this.beliefs.get('clean_data') || 
                   this.beliefs.get('initial_context') ||
                   this.knowledge.get('processed_data');
    
    // Also try prefixed knowledge keys from other agents
    if (!cleanData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
          cleanData = value;
          break;
        }
      }
    }
    
    // If still no clean data, try to extract from any available knowledge
    if (!cleanData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`🔍 [${this.id}] Found product data in knowledge key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // Also check beliefs for any object with productName
    if (!cleanData) {
      for (const [key, value] of this.beliefs.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`🔍 [${this.id}] Found product data in beliefs key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // If still no clean data, check if we have initial_context and use it
    if (!cleanData) {
      const initialContext = this.beliefs.get('initial_context');
      if (initialContext && initialContext.productName) {
        console.log(`🔍 [${this.id}] Using initial_context as clean data`);
        cleanData = initialContext;
      } else if (typeof initialContext === 'string') {
        // CRITICAL FIX: If initial_context is corrupted to just a string, try to find full data
        console.log(`🔍 [${this.id}] DEBUG - initial_context is corrupted to string, trying to find full data...`);
        
        // Try to find the full product data from other sources
        const productData = this.beliefs.get('product_data') || this.beliefs.get('parse_data');
        if (productData && typeof productData === 'object' && productData.productName) {
          console.log(`🔍 [${this.id}] DEBUG - Found full product data, using it`);
          cleanData = productData;
        } else {
          // As a last resort, create a minimal object with the product name
          console.log(`🔍 [${this.id}] DEBUG - Creating minimal object with product name`);
          cleanData = { productName: initialContext };
        }
      }
    }
    
    if (!cleanData) {
      console.log(`❌ [${this.id}] No clean data found. Available knowledge keys:`, Array.from(this.knowledge.keys()));
      console.log(`❌ [${this.id}] Available beliefs keys:`, Array.from(this.beliefs.keys()));
      return { success: false, message: 'No clean data available for competitor generation' };
    }
    
    console.log(`✅ [${this.id}] Found clean data with productName: ${cleanData.productName}`);
    
    console.log(`🏢 [${this.id}] Generating competitor data`);
    
    const competitors = this.createFictionalCompetitors(cleanData);
    this.competitorData = competitors;
    
    // Store in beliefs and knowledge for other agents
    this.beliefs.set('competitor_data', this.competitorData);
    this.knowledge.set('comparison_data', this.competitorData);
    
    console.log(`✅ [${this.id}] Generated ${competitors.length} competitor profiles`);
    
    // Share competitor data with other agents immediately
    await this.broadcastMessage('competitor_data_available', {
      competitors: this.competitorData,
      provider: this.id,
      timestamp: Date.now()
    });
    
    // Mark all competitor-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('competition') || goal.description.includes('competitor') || goal.description.includes('market')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return { 
      success: true, 
      message: `Generated ${competitors.length} competitors`,
      data: this.competitorData
    };
  }
  
  /**
   * Create fictional competitors based on product information
   */
  createFictionalCompetitors(productData) {
    const competitors = [
      {
        name: "Competitor A Vitamin C Serum",
        price: "₹1299",
        concentration: "15% Vitamin C",
        keyIngredients: "Vitamin C, Vitamin E, Ferulic Acid",
        benefits: "Brightening, Anti-aging",
        rating: 4.2
      },
      {
        name: "Competitor B Brightening Serum",
        price: "₹699", 
        concentration: "10% Vitamin C",
        keyIngredients: "Vitamin C, Aloe Vera, Green Tea",
        benefits: "Brightening, Hydration",
        rating: 4.0
      },
      {
        name: "Competitor C Advanced Serum",
        price: "₹1599",
        concentration: "25% Vitamin C",
        keyIngredients: "Vitamin C, Retinol, Peptides",
        benefits: "Anti-aging, Brightening, Firming",
        rating: 4.5
      }
    ];
    
    return competitors;
  }

  async initialize() {
    console.log(`🔍 [${this.id}] Comparison Data Agent initialized`);
  }
  
  /**
   * Perform task-specific work for comparison data generation
   */
  async performTaskWork(task) {
    console.log(`🔍 [${this.id}] Starting comparison data generation task: ${task.id}`);
    
    // Get clean data
    let cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    
    if (!cleanData) {
      await this.requestDataFromPeers(['clean_data']);
      cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    }
    
    if (!cleanData) {
      throw new Error('No clean data available for comparison data generation');
    }
    
    // Generate competitor data
    console.log(`🏢 [${this.id}] Generating competitor data`);
    this.competitorData = this.createCompetitorData(cleanData);
    
    // Store in shared data
    this.sharedData.set('comparison_data', this.competitorData);
    this.sharedData.set('create_comparison_data', this.competitorData);
    
    console.log(`✅ [${this.id}] Generated ${this.competitorData.length} competitor profiles`);
    
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'comparison_data',
      competitors: this.competitorData,
      timestamp: Date.now()
    };
    
    return result;
  }
  
  /**
   * Create competitor data based on product information (used by legacy methods)
   */
  createCompetitorData(productData) {
    const competitors = [
      {
        name: "Competitor A Vitamin C Serum",
        price: "₹1299",
        concentration: "15% Vitamin C",
        keyIngredients: "Vitamin C, Vitamin E, Ferulic Acid",
        benefits: "Brightening, Anti-aging",
        rating: 4.2
      },
      {
        name: "Competitor B Brightening Serum",
        price: "₹699", 
        concentration: "10% Vitamin C",
        keyIngredients: "Vitamin C, Aloe Vera, Green Tea",
        benefits: "Brightening, Hydration",
        rating: 4.0
      },
      {
        name: "Competitor C Advanced Serum",
        price: "₹1599",
        concentration: "25% Vitamin C",
        keyIngredients: "Vitamin C, Retinol, Peptides",
        benefits: "Anti-aging, Brightening, Firming",
        rating: 4.5
      }
    ];
    
    return competitors;
  }
  
  decideAction(situation) {
    // Priority 1: Work on goals if we have clean data
    const activeGoals = situation.goals.filter(goal => goal.status === 'active');
    if (activeGoals.length > 0 && this.beliefs.has('clean_data')) {
      const highestPriorityGoal = activeGoals.sort((a, b) => b.priority - a.priority)[0];
      
      return {
        action: 'work_on_goal',
        goal: highestPriorityGoal,
        reasoning: `Working on highest priority goal: ${highestPriorityGoal.description}`
      };
    }
    
    // Priority 2: Request clean data if we don't have it and have active goals
    if (activeGoals.length > 0 && !this.beliefs.has('clean_data')) {
      return { 
        action: 'request_data', 
        dataType: 'clean_data',
        reasoning: 'Requesting clean data from DataParserAgent' 
      };
    }
    
    // Priority 3: Share comparison data if we have it
    if (this.competitorData.length > 0) {
      return { 
        action: 'share_comparison_data', 
        reasoning: 'Sharing competitor data with other agents' 
      };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'work_on_goal':
          return await this.workOnGoal(decision.goal);
        case 'request_data':
          return await this.requestDataFromPeers([decision.dataType]);
        case 'generate_competitors':
          return await this.generateCompetitors(decision.data);
        case 'share_comparison_data':
          return await this.shareComparisonData();
        default:
          return await super.executeDecision(decision);
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
      console.log(`🔍 [${this.id}] Received clean data from ${message.from || 'unknown'}`);
    }
    if (message.type === 'competitor_data_available') {
      this.beliefs.set('competitor_data', message.content.competitors);
      console.log(`🔍 [${this.id}] Received competitor data from ${message.from || 'unknown'}`);
    }
  }
}