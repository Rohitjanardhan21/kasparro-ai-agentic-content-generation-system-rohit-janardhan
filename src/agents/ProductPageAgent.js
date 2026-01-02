import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { getAllTemplates } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

/**
 * ProductPageAgent - Autonomous agent for product page generation
 * 
 * This agent:
 * 1. Autonomously generates comprehensive product pages
 * 2. Makes independent decisions about content structure
 * 3. Uses template engine with content blocks
 * 4. Shares product page content with other agents
 */
export class ProductPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'product_page',
      name: 'ProductPageAgent',
      capabilities: ['product_page_generation', 'template_processing', 'content_structuring'],
      initialGoals: ['wait_for_clean_data', 'generate_product_page', 'save_product_content']
    });

    this.templateEngine = new TemplateEngine();
    this.productContent = null;
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
    console.log(`📄 [${this.id}] Product Page Agent initialized`);
  }
  
  decideAction(situation) {
    if (!situation.beliefs.clean_data && this.goals.has('wait_for_clean_data')) {
      return { action: 'wait_for_clean_data', reasoning: 'Waiting for clean product data' };
    }
    
    if (situation.beliefs.clean_data && this.goals.has('generate_product_page')) {
      return { action: 'generate_product_page', reasoning: 'Generating product page' };
    }
    
    if (this.productContent && this.goals.has('save_product_content')) {
      return { action: 'save_product_content', reasoning: 'Saving product content' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_clean_data':
          return await this.waitForCleanData();
        case 'generate_product_page':
          return await this.generateProductPage();
        case 'save_product_content':
          return await this.saveProductContent();
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
  
  async generateProductPage() {
    console.log(`📄 [${this.id}] Generating product page`);
    
    const cleanData = this.beliefs.get('clean_data') || {};
    
    try {
      this.productContent = await this.templateEngine.processTemplate('product_page', cleanData);
      
      this.goals.delete('generate_product_page');
      return { success: true, message: 'Product page generated' };
    } catch (error) {
      // Fallback generation
      this.productContent = {
        title: `${cleanData.productName || 'Product'} - Complete Guide`,
        sections: {
          overview: {
            title: 'Product Overview',
            content: `${cleanData.productName || 'This product'} is a ${cleanData.concentration || 'skincare'} solution with ${cleanData.keyIngredients || 'premium ingredients'}.`
          },
          benefits: {
            title: 'Key Benefits',
            content: cleanData.benefits || 'Provides skincare benefits'
          },
          ingredients: {
            title: 'Ingredients',
            content: cleanData.keyIngredients || 'Quality ingredients'
          },
          usage: {
            title: 'How to Use',
            content: cleanData.howToUse || 'Follow product instructions'
          },
          safety: {
            title: 'Safety Information',
            content: cleanData.sideEffects ? `May cause ${cleanData.sideEffects}. Patch test recommended.` : 'Patch test before first use'
          }
        },
        specifications: {
          productName: cleanData.productName,
          concentration: cleanData.concentration,
          skinType: cleanData.skinType,
          price: cleanData.price
        },
        generatedBy: this.id,
        timestamp: new Date().toISOString()
      };
      
      this.goals.delete('generate_product_page');
      return { success: true, message: 'Product page generated (fallback)' };
    }
  }
  
  async saveProductContent() {
    console.log(`💾 [${this.id}] Saving product content`);
    
    try {
      const fs = await import('fs');
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      
      fs.writeFileSync('output/product_page.json', JSON.stringify(this.productContent, null, 2));
      
      // Broadcast completion
      await this.broadcastMessage('content_generated', {
        contentType: 'product_page',
        data: this.productContent,
        generator: this.id
      });
      
      this.goals.delete('save_product_content');
      return { success: true, message: 'Product content saved' };
    } catch (error) {
      throw new Error(`Failed to save product page: ${error.message}`);
    }
  }
  
  async handleMessage(message) {
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
    }
  }
}