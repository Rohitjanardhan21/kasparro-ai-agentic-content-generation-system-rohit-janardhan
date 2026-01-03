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

  /**
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`📄 [${this.id}] Working on goal: ${goal.description}`);
    
    // Check if we have clean data first
    const cleanData = this.beliefs.get('clean_data');
    if (!cleanData && (goal.description.includes('product') || goal.description.includes('page'))) {
      return { success: false, message: 'No clean data available for product page generation' };
    }
    
    if (goal.description.includes('product') || goal.description.includes('page')) {
      return await this.generateProductPage();
    }
    
    return { success: false, message: 'Unknown goal type' };
  }
  
  /**
   * Generate product page autonomously
   */
  async generateProductPage() {
    // Get clean data from beliefs
    const cleanData = this.beliefs.get('clean_data');
    if (!cleanData) {
      return { success: false, message: 'No clean data available for product page generation' };
    }
    
    console.log(`📄 [${this.id}] Generating product page`);
    
    try {
      this.productContent = await this.templateEngine.processTemplate('product_page', cleanData);
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
    }
    
    // Store in beliefs and knowledge
    this.beliefs.set('product_content', this.productContent);
    this.knowledge.set('product_page', this.productContent);
    
    // Save to file
    await this.saveProductContent();
    
    console.log(`✅ [${this.id}] Product page generated successfully`);
    
    // Share product content with other agents immediately
    await this.broadcastMessage('product_content_available', {
      content: this.productContent,
      provider: this.id,
      timestamp: Date.now()
    });
    
    // Mark all product-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('product') || goal.description.includes('page')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return { 
      success: true, 
      message: 'Product page generated',
      data: this.productContent
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
    console.log(`📄 [${this.id}] Product Page Agent initialized`);
  }
  
  /**
   * Perform task-specific work for product page generation
   */
  async performTaskWork(task) {
    console.log(`📄 [${this.id}] Starting product page generation task: ${task.id}`);
    
    // Get clean data
    let cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    
    if (!cleanData) {
      await this.requestDataFromPeers(['clean_data']);
      cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    }
    
    if (!cleanData) {
      throw new Error('No clean data available for product page generation');
    }
    
    // Generate product page using template engine
    console.log(`📄 [${this.id}] Generating product page`);
    this.productContent = this.templateEngine.processTemplate('product_page', cleanData);
    
    // Store in shared data
    this.sharedData.set('product_content', this.productContent);
    this.sharedData.set('generate_product_page', this.productContent);
    
    console.log(`✅ [${this.id}] Product page generated successfully`);
    
    // Save to file
    await this.saveProductContent();
    
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'product_content',
      content: this.productContent,
      timestamp: Date.now()
    };
    
    return result;
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
    
    // Priority 3: Save product content if we have it
    if (this.productContent) {
      return { 
        action: 'save_product_content', 
        reasoning: 'Saving product content to file' 
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
        case 'generate_product_page':
          return await this.generateProductPage();
        case 'save_product_content':
          return await this.saveProductContent();
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
      console.log(`📄 [${this.id}] Received clean data from ${message.from || 'unknown'}`);
    }
  }
}