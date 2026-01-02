import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * Autonomous Content Generator Agent
 * Responds to content requirements and generates specific content types
 */
export class ContentGeneratorAgent extends AutonomousAgent {
  constructor(specialization) {
    super(`content-generator-${specialization}`, []);
    
    this.specialization = specialization; // 'faq', 'product', 'comparison'
    this.capabilities.add(`generate-${specialization}`);
    this.capabilities.add('content-creation');
    
    this.assignedTasks = [];
    this.generatedContent = new Map();
    this.isWaitingForRequirements = true;
  }

  async perceive() {
    await super.perceive();
    
    // Check for content requirements
    const results = this.runtime.getSharedData('results') || {};
    const dataAnalyst = results['data-analyst'];
    
    if (dataAnalyst && dataAnalyst.requirements) {
      this.processContentRequirements(dataAnalyst.requirements);
    }
  }

  processContentRequirements(requirements) {
    if (this.isWaitingForRequirements) {
      // Find requirements that match our specialization
      const relevantReqs = requirements.filter(req => 
        req.type === this.specialization || 
        (this.specialization === 'product' && req.type === 'product-description')
      );

      for (const req of relevantReqs) {
        if (!req.assignedAgent) {
          // Claim this requirement
          this.claimRequirement(req);
        }
      }
      
      this.isWaitingForRequirements = false;
    }
  }

  claimRequirement(requirement) {
    // Add goal dynamically based on requirement
    const goal = {
      id: `generate-${requirement.type}-${Date.now()}`,
      description: `Generate ${requirement.type} content`,
      requiredCapability: `generate-${this.specialization}`,
      priority: requirement.priority === 'high' ? 10 : 5,
      requirement
    };
    
    this.goals.push(goal);
    console.log(`🎯 Agent ${this.id} claimed requirement: ${requirement.type}`);
    
    // Notify data analyst
    this.sendMessage('data-analyst', 'agent-capability-response', {
      agentId: this.id,
      capabilities: Array.from(this.capabilities),
      canHandle: [requirement.type]
    });
  }

  async planForGoal(goal) {
    const actions = [];
    
    switch (this.specialization) {
      case 'faq':
        actions.push(
          { type: 'generate-questions', status: 'pending' },
          { type: 'create-faq-structure', status: 'pending' },
          { type: 'validate-content', status: 'pending' }
        );
        break;
        
      case 'product':
        actions.push(
          { type: 'extract-specifications', status: 'pending' },
          { type: 'format-benefits', status: 'pending' },
          { type: 'create-product-page', status: 'pending' }
        );
        break;
        
      case 'comparison':
        actions.push(
          { type: 'request-competitor-data', status: 'pending' },
          { type: 'wait-for-competitor', status: 'pending' },
          { type: 'create-comparison', status: 'pending' }
        );
        break;
    }

    return {
      actions,
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

  async executeAction(action) {
    switch (action.type) {
      case 'generate-questions':
        return await this.generateQuestions();
      
      case 'create-faq-structure':
        return await this.createFaqStructure();
      
      case 'extract-specifications':
        return await this.extractSpecifications();
      
      case 'format-benefits':
        return await this.formatBenefits();
      
      case 'create-product-page':
        return await this.createProductPage();
      
      case 'request-competitor-data':
        return await this.requestCompetitorData();
      
      case 'wait-for-competitor':
        return await this.waitForCompetitorData();
      
      case 'create-comparison':
        return await this.createComparison();
      
      case 'validate-content':
        return await this.validateContent();
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  async generateQuestions() {
    const context = this.beliefs.get('context');
    const questions = [];
    
    // Informational questions
    questions.push({
      category: 'informational',
      question: `What is ${context.productName}?`,
      answer: `${context.productName} is a skincare serum with ${context.concentration} designed for ${context.skinType.toLowerCase()} skin types.`
    });
    
    questions.push({
      category: 'informational',
      question: 'What are the key ingredients?',
      answer: `The key ingredients are ${context.keyIngredients}.`
    });
    
    // Safety questions
    questions.push({
      category: 'safety',
      question: 'Are there any side effects?',
      answer: context.sideEffects || 'No known side effects when used as directed.'
    });
    
    // Usage questions
    questions.push({
      category: 'usage',
      question: 'How do I use this product?',
      answer: context.howToUse
    });
    
    // Purchase questions
    questions.push({
      category: 'purchase',
      question: 'What is the price?',
      answer: `${context.productName} is priced at ${context.price}.`
    });

    this.generatedContent.set('questions', questions);
    console.log(`❓ Generated ${questions.length} questions`);
    return { success: true };
  }

  async createFaqStructure() {
    const questions = this.generatedContent.get('questions');
    const context = this.beliefs.get('context');
    
    const faqPage = {
      page_info: {
        title: `${context.productName} - Frequently Asked Questions`,
        type: 'faq',
        product_name: context.productName
      },
      faqs: questions.slice(0, 5), // Take first 5 questions
      product_overview: {
        name: context.productName,
        concentration: context.concentration,
        key_benefits: context.benefits
      },
      metadata: {
        generated_at: new Date().toISOString(),
        agent_id: this.id,
        total_questions_available: questions.length
      }
    };

    this.generatedContent.set('faq_page', faqPage);
    console.log(`📄 Created FAQ page structure`);
    return { success: true };
  }

  async extractSpecifications() {
    const context = this.beliefs.get('context');
    
    const specs = {
      concentration: context.concentration,
      skin_types: context.skinType.split(',').map(t => t.trim()),
      key_ingredients: context.keyIngredients.split(',').map(i => i.trim()),
      product_category: 'skincare_serum',
      active_ingredient: context.concentration.includes('Vitamin C') ? 'Vitamin C' : 'Unknown'
    };

    this.generatedContent.set('specifications', specs);
    console.log(`📋 Extracted product specifications`);
    return { success: true };
  }

  async formatBenefits() {
    const context = this.beliefs.get('context');
    const benefitsList = context.benefits.split(',').map(b => b.trim());
    
    const benefits = {
      benefits: benefitsList,
      primary_benefit: benefitsList[0] || '',
      benefit_count: benefitsList.length,
      formatted_benefits: benefitsList.map(benefit => ({
        name: benefit,
        description: `Experience ${benefit.toLowerCase()} with regular use`
      }))
    };

    this.generatedContent.set('benefits', benefits);
    console.log(`✨ Formatted ${benefitsList.length} benefits`);
    return { success: true };
  }

  async createProductPage() {
    const context = this.beliefs.get('context');
    const specs = this.generatedContent.get('specifications');
    const benefits = this.generatedContent.get('benefits');
    
    const productPage = {
      product_info: {
        title: context.productName,
        concentration: context.concentration,
        description: `Premium skincare solution for ${context.skinType} skin`
      },
      ...specs,
      ...benefits,
      usage_instructions: context.howToUse,
      safety_info: {
        side_effects: context.sideEffects,
        precautions: [
          'Patch test before first use',
          'Discontinue if irritation occurs',
          'Avoid contact with eyes'
        ]
      },
      pricing: {
        price: context.price,
        currency: 'INR'
      },
      metadata: {
        generated_at: new Date().toISOString(),
        agent_id: this.id
      }
    };

    this.generatedContent.set('product_page', productPage);
    console.log(`📦 Created product page`);
    return { success: true };
  }

  async requestCompetitorData() {
    // Request competitor data from data generation agent
    this.broadcast('competitor-data-request', {
      requestingAgent: this.id,
      productContext: this.beliefs.get('context')
    });
    
    console.log(`📡 Requested competitor data for comparison`);
    return { success: true };
  }

  async waitForCompetitorData() {
    // Check if competitor data is available
    const competitorData = this.beliefs.get('competitor_data');
    
    if (competitorData) {
      console.log(`📊 Competitor data received`);
      return { success: true };
    }
    
    // Still waiting - this action will be retried
    return { success: false, retry: true };
  }

  async createComparison() {
    const context = this.beliefs.get('context');
    const competitorData = this.beliefs.get('competitor_data');
    
    const comparison = {
      comparison_info: {
        title: `Product Comparison: ${context.productName} vs ${competitorData.productName}`,
        type: 'side_by_side_comparison'
      },
      product_a: {
        name: context.productName,
        concentration: context.concentration,
        price: context.price,
        ingredients: context.keyIngredients,
        benefits: context.benefits
      },
      product_b: {
        name: competitorData.productName,
        concentration: competitorData.concentration,
        price: competitorData.price,
        ingredients: competitorData.keyIngredients,
        benefits: competitorData.benefits
      },
      analysis: {
        price_difference: this.calculatePriceDifference(context.price, competitorData.price),
        ingredient_overlap: this.calculateIngredientOverlap(context.keyIngredients, competitorData.keyIngredients)
      },
      metadata: {
        generated_at: new Date().toISOString(),
        agent_id: this.id
      }
    };

    this.generatedContent.set('comparison_page', comparison);
    console.log(`⚖️ Created comparison page`);
    return { success: true };
  }

  async validateContent() {
    const contentKeys = Array.from(this.generatedContent.keys());
    
    for (const key of contentKeys) {
      const content = this.generatedContent.get(key);
      if (!content || Object.keys(content).length === 0) {
        return { success: false, error: `Invalid content for ${key}` };
      }
    }
    
    console.log(`✅ Content validation passed for ${contentKeys.length} items`);
    return { success: true };
  }

  calculatePriceDifference(priceA, priceB) {
    const numA = parseInt(priceA.replace(/[^\d]/g, ''));
    const numB = parseInt(priceB.replace(/[^\d]/g, ''));
    return numB - numA;
  }

  calculateIngredientOverlap(ingredientsA, ingredientsB) {
    const listA = ingredientsA.split(',').map(i => i.trim().toLowerCase());
    const listB = ingredientsB.split(',').map(i => i.trim().toLowerCase());
    const common = listA.filter(ing => listB.includes(ing));
    return Math.round((common.length / Math.max(listA.length, listB.length)) * 100);
  }

  getResults() {
    return {
      specialization: this.specialization,
      content: Object.fromEntries(this.generatedContent),
      status: 'completed'
    };
  }

  onActivate() {
    this.messageHandlers.set('content-requirements', this.handleContentRequirements.bind(this));
    this.messageHandlers.set('competitor-data', this.handleCompetitorData.bind(this));
  }

  async handleContentRequirements(message) {
    // This is handled in perceive() method
  }

  async handleCompetitorData(message) {
    this.updateBeliefs('competitor_data', message.payload);
    console.log(`📥 Received competitor data from ${message.from}`);
  }
}