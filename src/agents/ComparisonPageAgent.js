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
  
  decideAction(situation) {
    if (!situation.beliefs.clean_data && this.goals.has('wait_for_clean_data')) {
      return { action: 'wait_for_clean_data', reasoning: 'Waiting for clean product data' };
    }
    
    if (!situation.beliefs.comparison_data && this.goals.has('wait_for_competitor_data')) {
      return { action: 'wait_for_competitor_data', reasoning: 'Waiting for competitor data' };
    }
    
    if (situation.beliefs.clean_data && situation.beliefs.comparison_data && this.goals.has('generate_comparison_page')) {
      return { action: 'generate_comparison_page', reasoning: 'Generating comparison page' };
    }
    
    if (this.comparisonContent && this.goals.has('save_comparison_content')) {
      return { action: 'save_comparison_content', reasoning: 'Saving comparison content' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_clean_data':
          return await this.waitForCleanData();
        case 'wait_for_competitor_data':
          return await this.waitForCompetitorData();
        case 'generate_comparison_page':
          return await this.generateComparisonPage();
        case 'save_comparison_content':
          return await this.saveComparisonContent();
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
  
  async waitForCompetitorData() {
    if (this.beliefs.has('comparison_data')) {
      this.goals.delete('wait_for_competitor_data');
      return { success: true, message: 'Competitor data received' };
    }
    return { success: false, message: 'Still waiting for competitor data' };
  }
  
  async generateComparisonPage() {
    console.log(`⚖️ [${this.id}] Generating comparison page`);
    
    const cleanData = this.beliefs.get('clean_data') || {};
    const competitorData = this.beliefs.get('comparison_data') || {};
    
    try {
      // Combine data for template processing
      const templateData = {
        ...cleanData,
        competitors: competitorData.competitors || []
      };
      
      this.comparisonContent = await this.templateEngine.processTemplate('comparison_page', templateData);
      
      this.goals.delete('generate_comparison_page');
      return { success: true, message: 'Comparison page generated' };
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
          competitors: competitorData.competitors || []
        },
        analysis: {
          price_comparison: this.generatePriceComparison(cleanData, competitorData.competitors || []),
          ingredient_comparison: this.generateIngredientComparison(cleanData, competitorData.competitors || []),
          benefit_comparison: this.generateBenefitComparison(cleanData, competitorData.competitors || [])
        },
        recommendation: this.generateRecommendation(cleanData, competitorData.competitors || []),
        generatedBy: this.id,
        timestamp: new Date().toISOString()
      };
      
      this.goals.delete('generate_comparison_page');
      return { success: true, message: 'Comparison page generated (fallback)' };
    }
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
    }
    if (message.type === 'comparison_data_available') {
      this.beliefs.set('comparison_data', message.content);
    }
  }
}