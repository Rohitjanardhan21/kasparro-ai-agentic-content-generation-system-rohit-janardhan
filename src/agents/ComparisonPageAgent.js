import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { getAllTemplates } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

/**
 * ComparisonPageAgent - Autonomous agent for comparison page generation
 * 
 * This agent:
 * 1. Autonomously generates product comparison pages
 * 2. Makes independent decisions about comparison structure
 * 3. Uses template engine with content blocks
 * 4. Shares comparison content with other agents
 */
export class ComparisonPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'comparison_page',
      name: 'ComparisonPageAgent',
      capabilities: ['comparison_generation', 'template_processing', 'competitive_analysis'],
      initialGoals: ['wait_for_clean_data', 'wait_for_competitor_data', 'generate_comparison_page', 'save_comparison_content']
    });

    this.templateEngine = new TemplateEngine();
    this.comparisonContent = null;
    this.setupTemplateEngine();
  }

  /**
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`⚖️ [${this.id}] Working on goal: ${goal.description}`);
    
    // Check if we have required data first - try multiple sources including prefixed ones
    let cleanData = this.beliefs.get('clean_data') || 
                   this.beliefs.get('initial_context') ||
                   this.knowledge.get('processed_data');
    
    let competitorData = this.beliefs.get('competitor_data') ||
                        this.beliefs.get('comparison_data') ||
                        this.knowledge.get('comparison_data');
    
    // Also try prefixed knowledge keys from other agents
    if (!cleanData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
          cleanData = value;
          break;
        }
      }
    }
    
    if (!competitorData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('competitor_data') || key.includes('comparison_data')) {
          competitorData = value;
          break;
        }
      }
    }
    
    if (!cleanData || !competitorData) {
      if (goal.description.includes('comparison') || goal.description.includes('analyze')) {
        return { success: false, message: 'Missing required data for comparison page generation' };
      }
    }
    
    if (goal.description.includes('comparison') || goal.description.includes('analyze')) {
      return await this.generateComparisonPage();
    }
    
    if (goal.description.includes('process_product')) {
      // Mark product processing goal as completed since we have required data
      goal.status = 'completed';
      goal.completedAt = Date.now();
      this.goalsAchieved++;
      this.goals.delete(goal);
      return { success: true, message: 'Product processing completed' };
    }
    
    return { success: false, message: 'Unknown goal type' };
  }
  
  /**
   * Generate comparison page autonomously
   */
  async generateComparisonPage() {
    // Get required data from beliefs - try multiple sources including prefixed ones
    let cleanData = this.beliefs.get('clean_data') || 
                   this.beliefs.get('initial_context') ||
                   this.knowledge.get('processed_data');
    
    let competitorData = this.beliefs.get('competitor_data') ||
                        this.beliefs.get('comparison_data') ||
                        this.knowledge.get('comparison_data');
    
    // Also try prefixed knowledge keys from other agents
    if (!cleanData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
          cleanData = value;
          break;
        }
      }
    }
    
    if (!competitorData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('competitor_data') || key.includes('comparison_data')) {
          competitorData = value;
          break;
        }
      }
    }
    
    // If still no clean data, try to find any object with productName
    if (!cleanData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`⚖️ [${this.id}] Found product data in knowledge key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // If still no competitor data, try to find any array of competitors
    if (!competitorData) {
      for (const [key, value] of this.knowledge.entries()) {
        if (Array.isArray(value) && value.length > 0 && value[0].productName) {
          console.log(`⚖️ [${this.id}] Found competitor data in knowledge key: ${key}`);
          competitorData = value;
          break;
        }
      }
    }
    
    // Also check beliefs
    if (!cleanData) {
      for (const [key, value] of this.beliefs.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`⚖️ [${this.id}] Found product data in beliefs key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    if (!competitorData) {
      for (const [key, value] of this.beliefs.entries()) {
        if (Array.isArray(value) && value.length > 0 && value[0].productName) {
          console.log(`⚖️ [${this.id}] Found competitor data in beliefs key: ${key}`);
          competitorData = value;
          break;
        }
      }
    }
    
    // If still no clean data, check if we have initial_context and use it
    if (!cleanData) {
      const initialContext = this.beliefs.get('initial_context');
      if (initialContext && initialContext.productName) {
        console.log(`⚖️ [${this.id}] Using initial_context as clean data`);
        cleanData = initialContext;
      }
    }
    
    if (!cleanData || !competitorData) {
      console.log(`❌ [${this.id}] Missing data. Clean data: ${!!cleanData}, Competitor data: ${!!competitorData}`);
      console.log(`❌ [${this.id}] Available knowledge keys:`, Array.from(this.knowledge.keys()));
      console.log(`❌ [${this.id}] Available beliefs keys:`, Array.from(this.beliefs.keys()));
      return { success: false, message: 'Missing required data for comparison page generation' };
    }
    
    console.log(`✅ [${this.id}] Found clean data: ${cleanData.productName}, competitors: ${competitorData.length}`);
    
    console.log(`⚖️ [${this.id}] Generating comparison page`);
    
    try {
      // Combine data for template processing
      const templateData = {
        ...cleanData,
        competitors: competitorData
      };
      
      this.comparisonContent = await this.templateEngine.processTemplate('comparison_page', templateData);
    } catch (error) {
      // Fallback generation
      this.comparisonContent = {
        title: `${cleanData.productName || 'Product'} vs Competitors`,
        comparison: {
          primary_product: {
            name: cleanData.productName,
            price: cleanData.price,
            ingredients: cleanData.keyIngredients,
            benefits: cleanData.benefits,
            skinType: cleanData.skinType
          },
          competitors: competitorData
        },
        analysis: {
          price_comparison: this.generatePriceComparison(cleanData, competitorData),
          ingredient_comparison: this.generateIngredientComparison(cleanData, competitorData),
          benefit_comparison: this.generateBenefitComparison(cleanData, competitorData)
        },
        recommendation: this.generateRecommendation(cleanData, competitorData),
        generatedBy: this.id,
        timestamp: new Date().toISOString()
      };
    }
    
    // Store in beliefs and knowledge
    this.beliefs.set('comparison_content', this.comparisonContent);
    this.knowledge.set('comparison_page', this.comparisonContent);
    
    // Save to file
    await this.saveComparisonContent();
    
    console.log(`✅ [${this.id}] Comparison page generated successfully`);
    
    // Share comparison content with other agents immediately
    await this.broadcastMessage('comparison_content_available', {
      content: this.comparisonContent,
      provider: this.id,
      timestamp: Date.now()
    });
    
    // Mark all comparison-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('comparison') || goal.description.includes('analyze')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return { 
      success: true, 
      message: 'Comparison page generated',
      data: this.comparisonContent
    };
  }

  setupTemplateEngine() {
    const templates = getAllTemplates();
    Object.entries(templates).forEach(([name, template]) => {
      this.templateEngine.registerTemplate(name, template);
    });
    
    const contentBlockMethods = Object.getOwnPropertyNames(ContentBlocks)
      .filter(name => typeof ContentBlocks[name] === 'function');
    
    contentBlockMethods.forEach(methodName => {
      this.templateEngine.registerContentBlock(methodName, ContentBlocks[methodName]);
    });
  }
  
  async initialize() {
    console.log(`⚖️ [${this.id}] Comparison Page Agent initialized`);
  }
  
  /**
   * Perform task-specific work for comparison page generation
   */
  async performTaskWork(task) {
    console.log(`⚖️ [${this.id}] Starting comparison page generation task: ${task.id}`);
    
    // Get required data
    let cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    let comparisonData = this.sharedData.get('comparison_data') || this.sharedData.get('create_comparison_data');
    
    if (!cleanData || !comparisonData) {
      await this.requestDataFromPeers(['clean_data', 'comparison_data']);
      cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
      comparisonData = this.sharedData.get('comparison_data') || this.sharedData.get('create_comparison_data');
    }
    
    if (!cleanData || !comparisonData) {
      throw new Error('Missing required data for comparison page generation');
    }
    
    // Generate comparison page
    console.log(`⚖️ [${this.id}] Generating comparison page`);
    const comparisonPageData = { ...cleanData, competitors: comparisonData };
    this.comparisonContent = this.templateEngine.processTemplate('comparison_page', comparisonPageData);
    
    // Store in shared data
    this.sharedData.set('comparison_content', this.comparisonContent);
    this.sharedData.set('generate_comparison_page', this.comparisonContent);
    
    // Save to file
    await this.saveComparisonContent();
    
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'comparison_content',
      content: this.comparisonContent,
      timestamp: Date.now()
    };
    
    return result;
  }
  
  decideAction(situation) {
    // Priority 1: Work on goals if we have required data
    const activeGoals = situation.goals.filter(goal => goal.status === 'active');
    if (activeGoals.length > 0 && this.beliefs.has('clean_data') && this.beliefs.has('competitor_data')) {
      const highestPriorityGoal = activeGoals.sort((a, b) => b.priority - a.priority)[0];
      
      return {
        action: 'work_on_goal',
        goal: highestPriorityGoal,
        reasoning: `Working on highest priority goal: ${highestPriorityGoal.description}`
      };
    }
    
    // Priority 2: Request missing data if we have active goals
    if (activeGoals.length > 0) {
      if (!this.beliefs.has('clean_data')) {
        return { 
          action: 'request_data', 
          dataType: 'clean_data',
          reasoning: 'Requesting clean data from DataParserAgent' 
        };
      }
      
      if (!this.beliefs.has('competitor_data')) {
        return { 
          action: 'request_data', 
          dataType: 'competitor_data',
          reasoning: 'Requesting competitor data from ComparisonDataAgent' 
        };
      }
    }
    
    // Priority 3: Save comparison content if we have it
    if (this.comparisonContent) {
      return { 
        action: 'save_comparison_content', 
        reasoning: 'Saving comparison content to file' 
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
        case 'generate_comparison_page':
          return await this.generateComparisonPage();
        case 'save_comparison_content':
          return await this.saveComparisonContent();
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
  
  async waitForCompetitorData() {
    if (this.beliefs.has('comparison_data')) {
      this.goals.delete('wait_for_competitor_data');
      return { success: true, message: 'Competitor data received' };
    }
    return { success: false, message: 'Still waiting for competitor data' };
  }
  
  
  generatePriceComparison(primaryProduct, competitors) {
    const primaryPrice = parseFloat((primaryProduct.price || '₹699').replace(/[^\d]/g, ''));
    const competitorPrices = competitors.map(comp => parseFloat((comp.price || '₹699').replace(/[^\d]/g, '')));
    
    const avgCompetitorPrice = competitorPrices.length > 0 ? 
      competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length : primaryPrice;
    
    return {
      primary_price: primaryProduct.price,
      competitor_avg: `₹${Math.round(avgCompetitorPrice)}`,
      price_advantage: primaryPrice < avgCompetitorPrice ? 'lower' : 'higher',
      value_assessment: primaryPrice < avgCompetitorPrice ? 'Better value' : 'Premium pricing'
    };
  }
  
  generateIngredientComparison(primaryProduct, competitors) {
    const primaryIngredients = (primaryProduct.keyIngredients || '').split(',').map(ing => ing.trim());
    const competitorIngredients = competitors.flatMap(comp => 
      (comp.keyIngredients || '').split(',').map(ing => ing.trim())
    );
    
    const uniqueToPrimary = primaryIngredients.filter(ing => 
      !competitorIngredients.some(compIng => compIng.toLowerCase().includes(ing.toLowerCase()))
    );
    
    return {
      primary_ingredients: primaryIngredients,
      unique_to_primary: uniqueToPrimary,
      common_ingredients: primaryIngredients.filter(ing => 
        competitorIngredients.some(compIng => compIng.toLowerCase().includes(ing.toLowerCase()))
      )
    };
  }
  
  generateBenefitComparison(primaryProduct, competitors) {
    const primaryBenefits = (primaryProduct.benefits || '').split(',').map(ben => ben.trim());
    const competitorBenefits = competitors.flatMap(comp => 
      (comp.benefits || '').split(',').map(ben => ben.trim())
    );
    
    return {
      primary_benefits: primaryBenefits,
      competitor_benefits: competitorBenefits,
      unique_advantages: primaryBenefits.filter(ben => 
        !competitorBenefits.some(compBen => compBen.toLowerCase().includes(ben.toLowerCase()))
      )
    };
  }
  
  generateRecommendation(primaryProduct, competitors) {
    const priceComparison = this.generatePriceComparison(primaryProduct, competitors);
    const ingredientComparison = this.generateIngredientComparison(primaryProduct, competitors);
    
    let recommendation = `${primaryProduct.productName || 'This product'}`;
    
    if (priceComparison.price_advantage === 'lower') {
      recommendation += ' offers excellent value with competitive pricing';
    } else {
      recommendation += ' provides premium quality';
    }
    
    if (ingredientComparison.unique_to_primary.length > 0) {
      recommendation += ` and unique ingredients like ${ingredientComparison.unique_to_primary.slice(0, 2).join(', ')}`;
    }
    
    recommendation += `. Best for ${primaryProduct.skinType || 'various skin types'}.`;
    
    return {
      summary: recommendation,
      best_for: primaryProduct.skinType || 'Various skin types',
      key_advantages: [
        priceComparison.value_assessment,
        ...ingredientComparison.unique_to_primary.slice(0, 2)
      ].filter(Boolean)
    };
  }
  
  async saveComparisonContent() {
    console.log(`💾 [${this.id}] Saving comparison content`);
    
    try {
      const fs = await import('fs');
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      
      fs.writeFileSync('output/comparison_page.json', JSON.stringify(this.comparisonContent, null, 2));
      
      // Broadcast completion
      await this.broadcastMessage('content_generated', {
        contentType: 'comparison_page',
        data: this.comparisonContent,
        generator: this.id
      });
      
      this.goals.delete('save_comparison_content');
      return { success: true, message: 'Comparison content saved' };
    } catch (error) {
      throw new Error(`Failed to save comparison page: ${error.message}`);
    }
  }
  
  async handleMessage(message) {
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
      console.log(`⚖️ [${this.id}] Received clean data from ${message.from || 'unknown'}`);
    }
    if (message.type === 'competitor_data_available') {
      this.beliefs.set('competitor_data', message.content.competitors);
      console.log(`⚖️ [${this.id}] Received competitor data from ${message.from || 'unknown'}`);
    }
  }
}