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
  
  /**
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`📋 [${this.id}] Working on goal: ${goal.description}`);
    
    // Check if we have question bank first - try multiple sources including prefixed ones
    let questionBank = this.beliefs.get('questions') || 
                      this.beliefs.get('question_bank') ||
                      this.knowledge.get('question_bank');
    
    // Also try prefixed knowledge keys from other agents
    if (!questionBank) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('questions') || key.includes('question_bank')) {
          questionBank = value;
          break;
        }
      }
    }
    
    if (!questionBank && (goal.description.includes('faq') || goal.description.includes('create'))) {
      return { success: false, message: 'No question bank available for FAQ generation' };
    }
    
    if (goal.description.includes('faq') || goal.description.includes('create')) {
      return await this.generateFaqPage();
    }
    
    if (goal.description.includes('process_product')) {
      // Mark product processing goal as completed since we have question data
      goal.status = 'completed';
      goal.completedAt = Date.now();
      this.goalsAchieved++;
      this.goals.delete(goal);
      return { success: true, message: 'Product processing completed' };
    }
    
    return { success: false, message: 'Unknown goal type' };
  }
  
  /**
   * Generate FAQ page autonomously
   */
  async generateFaqPage() {
    // Get question bank from beliefs - try multiple sources including prefixed ones
    let questionBank = this.beliefs.get('questions') || 
                      this.beliefs.get('question_bank') ||
                      this.knowledge.get('question_bank');
    
    // Also try prefixed knowledge keys from other agents
    if (!questionBank) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('questions') || key.includes('question_bank')) {
          questionBank = value;
          break;
        }
      }
    }
    
    // If still no questions, try to find any array of questions
    if (!questionBank) {
      for (const [key, value] of this.knowledge.entries()) {
        if (Array.isArray(value) && value.length > 0 && value[0].question) {
          console.log(`📋 [${this.id}] Found questions in knowledge key: ${key}`);
          questionBank = value;
          break;
        }
      }
    }
    
    // Also check beliefs for any array of questions
    if (!questionBank) {
      for (const [key, value] of this.beliefs.entries()) {
        if (Array.isArray(value) && value.length > 0 && value[0].question) {
          console.log(`📋 [${this.id}] Found questions in beliefs key: ${key}`);
          questionBank = value;
          break;
        }
      }
    }
    
    if (!questionBank) {
      console.log(`❌ [${this.id}] No questions found. Available knowledge keys:`, Array.from(this.knowledge.keys()));
      console.log(`❌ [${this.id}] Available beliefs keys:`, Array.from(this.beliefs.keys()));
      return { success: false, message: 'No question bank available for FAQ generation' };
    }
    
    console.log(`✅ [${this.id}] Found ${questionBank.length} questions for FAQ generation`);
    
    let cleanData = this.beliefs.get('clean_data') || 
                   this.beliefs.get('initial_context') ||
                   this.knowledge.get('processed_data') || {};
    
    // Also try prefixed knowledge keys for clean data
    if (!cleanData || Object.keys(cleanData).length === 0) {
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
          cleanData = value || {};
          break;
        }
      }
    }
    
    // If still no clean data, try to find any object with productName
    if (!cleanData || Object.keys(cleanData).length === 0) {
      for (const [key, value] of this.knowledge.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`📋 [${this.id}] Found product data in knowledge key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // If still no clean data, check if we have initial_context and use it
    if (!cleanData || Object.keys(cleanData).length === 0) {
      const initialContext = this.beliefs.get('initial_context');
      if (initialContext && initialContext.productName) {
        console.log(`📋 [${this.id}] Using initial_context as clean data`);
        cleanData = initialContext;
      }
    }
    
    console.log(`📋 [${this.id}] Generating FAQ page`);
    
    try {
      this.faqContent = await this.templateEngine.processTemplate('faq_page', {
        ...cleanData,
        questions: questionBank
      });
    } catch (error) {
      // Fallback generation
      this.faqContent = {
        title: `FAQ - ${cleanData.productName || 'Product'}`,
        questions: questionBank,
        generatedBy: this.id,
        timestamp: new Date().toISOString()
      };
    }
    
    // Store in beliefs and knowledge
    this.beliefs.set('faq_content', this.faqContent);
    this.knowledge.set('faq_page', this.faqContent);
    
    // Save to file
    await this.saveFaqContent();
    
    console.log(`✅ [${this.id}] FAQ page generated successfully`);
    
    // Share FAQ content with other agents immediately
    await this.broadcastMessage('faq_content_available', {
      content: this.faqContent,
      provider: this.id,
      timestamp: Date.now()
    });
    
    // Mark all FAQ-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('faq') || goal.description.includes('create')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return { 
      success: true, 
      message: 'FAQ page generated',
      data: this.faqContent
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
    console.log(`📋 [${this.id}] FAQ Page Agent initialized`);
  }
  
  /**
   * Perform task-specific work for FAQ page generation
   */
  async performTaskWork(task) {
    console.log(`📋 [${this.id}] Starting FAQ page generation task: ${task.id}`);
    
    // Get question bank from shared data
    let questionBank = this.sharedData.get('question_bank') || this.sharedData.get('generate_questions');
    
    if (!questionBank) {
      console.log(`📨 [${this.id}] Requesting question bank from QuestionGeneratorAgent`);
      await this.requestDataFromPeers(['question_bank']);
      questionBank = this.sharedData.get('question_bank') || this.sharedData.get('generate_questions');
    }
    
    if (!questionBank) {
      throw new Error('No question bank available for FAQ generation');
    }
    
    // Generate FAQ page using template engine
    console.log(`📋 [${this.id}] Generating FAQ page`);
    const faqData = {
      questions: questionBank,
      productName: 'Vitamin C Brightening Serum' // This should come from clean data
    };
    
    this.faqContent = this.templateEngine.processTemplate('faq_page', faqData);
    
    // Store in shared data
    this.sharedData.set('faq_content', this.faqContent);
    this.sharedData.set('generate_faq_page', this.faqContent);
    
    console.log(`✅ [${this.id}] FAQ page generated successfully`);
    
    // Save to file
    await this.saveFaqContent();
    
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'faq_content',
      content: this.faqContent,
      timestamp: Date.now()
    };
    
    return result;
  }
  
  decideAction(situation) {
    // Priority 1: Work on goals if we have questions
    const activeGoals = situation.goals.filter(goal => goal.status === 'active');
    if (activeGoals.length > 0 && this.beliefs.has('questions')) {
      const highestPriorityGoal = activeGoals.sort((a, b) => b.priority - a.priority)[0];
      
      return {
        action: 'work_on_goal',
        goal: highestPriorityGoal,
        reasoning: `Working on highest priority goal: ${highestPriorityGoal.description}`
      };
    }
    
    // Priority 2: Request questions if we don't have them and have active goals
    if (activeGoals.length > 0 && !this.beliefs.has('questions')) {
      return { 
        action: 'request_data', 
        dataType: 'questions',
        reasoning: 'Requesting questions from QuestionGeneratorAgent' 
      };
    }
    
    // Priority 3: Save FAQ content if we have it
    if (this.faqContent) {
      return { 
        action: 'save_faq_content', 
        reasoning: 'Saving FAQ content to file' 
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
        case 'generate_faq_page':
          return await this.generateFaqPage();
        case 'save_faq_content':
          return await this.saveFaqContent();
        default:
          return await super.executeDecision(decision);
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
    
    const questionBank = this.beliefs.get('questions') || this.beliefs.get('question_bank');
    const cleanData = this.beliefs.get('clean_data') || {};
    
    if (!questionBank) {
      return { success: false, message: 'No question bank available' };
    }
    
    try {
      this.faqContent = await this.templateEngine.processTemplate('faq_page', {
        ...cleanData,
        questions: Array.isArray(questionBank) ? questionBank : questionBank.questions || []
      });
      
      this.goals.delete('generate_faq_page');
      return { success: true, message: 'FAQ page generated' };
    } catch (error) {
      // Fallback generation
      this.faqContent = {
        title: `FAQ - ${cleanData.productName || 'Product'}`,
        questions: Array.isArray(questionBank) ? questionBank : questionBank.questions || [],
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
    if (message.type === 'questions_available') {
      this.beliefs.set('questions', message.content.questions);
      console.log(`📋 [${this.id}] Received questions from ${message.from || 'unknown'}`);
    }
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
      console.log(`📋 [${this.id}] Received clean data from ${message.from || 'unknown'}`);
    }
  }
}