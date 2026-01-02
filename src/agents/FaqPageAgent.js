/**
 * FaqPageAgent - Autonomous agent for FAQ page generation
 */

import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { getAllTemplates } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

export class FaqPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'faq_page',
      name: 'FaqPageAgent',
      capabilities: ['faq_generation', 'template_processing'],
      initialGoals: ['wait_for_questions', 'generate_faq_page', 'save_faq_content']
    });
    
    this.templateEngine = new TemplateEngine();
    this.faqContent = null;
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
    console.log(`📋 [${this.id}] FAQ Page Agent initialized`);
  }
  
  decideAction(situation) {
    if (!situation.beliefs.question_bank && this.goals.has('wait_for_questions')) {
      return { action: 'wait_for_questions', reasoning: 'Waiting for question bank' };
    }
    
    if (situation.beliefs.question_bank && this.goals.has('generate_faq_page')) {
      return { action: 'generate_faq_page', reasoning: 'Generating FAQ page' };
    }
    
    if (this.faqContent && this.goals.has('save_faq_content')) {
      return { action: 'save_faq_content', reasoning: 'Saving FAQ content' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_questions':
          return await this.waitForQuestions();
        case 'generate_faq_page':
          return await this.generateFaqPage();
        case 'save_faq_content':
          return await this.saveFaqContent();
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async waitForQuestions() {
    if (this.beliefs.has('question_bank')) {
      this.goals.delete('wait_for_questions');
      return { success: true, message: 'Question bank received' };
    }
    return { success: false, message: 'Still waiting for questions' };
  }
  
  async generateFaqPage() {
    console.log(`📋 [${this.id}] Generating FAQ page`);
    
    const questionBank = this.beliefs.get('question_bank');
    const cleanData = this.beliefs.get('clean_data') || {};
    
    try {
      this.faqContent = await this.templateEngine.processTemplate('faq_page', {
        ...cleanData,
        questions: questionBank.questions || []
      });
      
      this.goals.delete('generate_faq_page');
      return { success: true, message: 'FAQ page generated' };
    } catch (error) {
      // Fallback generation
      this.faqContent = {
        title: `FAQ - ${cleanData.productName || 'Product'}`,
        questions: questionBank.questions || [],
        generatedBy: this.id,
        timestamp: new Date().toISOString()
      };
      
      this.goals.delete('generate_faq_page');
      return { success: true, message: 'FAQ page generated (fallback)' };
    }
  }
  
  async saveFaqContent() {
    console.log(`💾 [${this.id}] Saving FAQ content`);
    
    try {
      const fs = await import('fs');
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      
      fs.writeFileSync('output/faq.json', JSON.stringify(this.faqContent, null, 2));
      
      // Broadcast completion
      await this.broadcastMessage('content_generated', {
        contentType: 'faq',
        data: this.faqContent,
        generator: this.id
      });
      
      this.goals.delete('save_faq_content');
      return { success: true, message: 'FAQ content saved' };
    } catch (error) {
      throw new Error(`Failed to save FAQ: ${error.message}`);
    }
  }
  
  async handleMessage(message) {
    if (message.type === 'question_bank_available') {
      this.beliefs.set('question_bank', message.content);
    }
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
    }
  }
}