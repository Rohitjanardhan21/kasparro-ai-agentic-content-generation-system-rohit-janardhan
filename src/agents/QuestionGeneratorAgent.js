/**
 * QuestionGeneratorAgent - Autonomous agent for generating categorized questions
 * 
 * This agent:
 * 1. Autonomously generates 15+ questions across 5 categories
 * 2. Makes independent decisions about question types and priorities
 * 3. Adapts question generation based on product data characteristics
 * 4. Shares question bank with content generation agents
 */

import { BaseAgent } from './BaseAgent.js';

export class QuestionGeneratorAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'question_generator',
      name: 'QuestionGeneratorAgent',
      capabilities: ['question_generation', 'categorization', 'content_analysis'],
      initialGoals: ['wait_for_clean_data', 'generate_question_bank', 'categorize_questions', 'share_questions']
    });
    
    // Question-specific state
    this.questionCategories = ['informational', 'safety', 'usage', 'purchase', 'comparison'];
    this.generatedQuestions = [];
    this.questionBank = new Map();
    this.targetQuestionCount = 18;
    
    this.initializeQuestionTemplates();
  }
  
  /**
   * Initialize question templates
   */
  initializeQuestionTemplates() {
    this.questionTemplates = new Map();
    
    this.questionTemplates.set('informational', [
      'What is {productName}?',
      'What are the key ingredients in {productName}?',
      'What skin type is {productName} designed for?',
      'What is the concentration of active ingredients?'
    ]);
    
    this.questionTemplates.set('usage', [
      'How do I use {productName}?',
      'When should I use {productName}?',
      'How often should I use {productName}?',
      'Can I use {productName} with other products?'
    ]);
    
    this.questionTemplates.set('safety', [
      'Are there any side effects with {productName}?',
      'Is {productName} safe for sensitive skin?',
      'Should I do a patch test before using {productName}?',
      'What precautions should I take?'
    ]);
    
    this.questionTemplates.set('purchase', [
      'What is the price of {productName}?',
      'What benefits does {productName} provide?',
      'Is {productName} worth the investment?',
      'Who should consider buying {productName}?'
    ]);
    
    this.questionTemplates.set('comparison', [
      'How does {productName} compare to other products?',
      'What makes {productName} different from competitors?',
      'Why should I choose {productName} over alternatives?'
    ]);
  }
  
  /**
   * Initialize question generator agent
   */
  async initialize() {
    console.log(`❓ [${this.id}] Question Generator Agent initialized`);
    console.log(`   Categories: ${this.questionCategories.length} categories`);
    console.log(`   Target Questions: ${this.targetQuestionCount}`);
  }
  
  /**
   * Decide what action to take based on situation
   */
  decideAction(situation) {
    // Priority 1: Wait for clean data from DataParserAgent
    if (!situation.beliefs.clean_data && this.goals.has('wait_for_clean_data')) {
      return {
        action: 'wait_for_clean_data',
        reasoning: 'Waiting for clean product data from DataParserAgent'
      };
    }
    
    // Priority 2: Generate question bank if we have clean data
    if (situation.beliefs.clean_data && this.goals.has('generate_question_bank')) {
      return {
        action: 'generate_question_bank',
        data: situation.beliefs.clean_data,
        reasoning: 'Generating comprehensive question bank from clean data'
      };
    }
    
    // Priority 3: Categorize questions
    if (this.generatedQuestions.length > 0 && this.goals.has('categorize_questions')) {
      return {
        action: 'categorize_questions',
        reasoning: 'Organizing questions into categories'
      };
    }
    
    // Priority 4: Share questions with other agents
    if (this.questionBank.size > 0 && this.goals.has('share_questions')) {
      return {
        action: 'share_questions',
        reasoning: 'Sharing question bank with content generation agents'
      };
    }
    
    return null; // No action needed
  }
  
  /**
   * Execute a decision
   */
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_clean_data':
          return await this.waitForCleanData();
          
        case 'generate_question_bank':
          return await this.generateQuestionBank(decision.data);
          
        case 'categorize_questions':
          return await this.categorizeQuestions();
          
        case 'share_questions':
          return await this.shareQuestions();
          
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Wait for clean data
   */
  async waitForCleanData() {
    // Check if we have clean data in beliefs
    if (this.beliefs.has('clean_data')) {
      console.log(`📊 [${this.id}] Clean data received, ready to generate questions`);
      this.goals.delete('wait_for_clean_data');
      return { success: true, message: 'Clean data received' };
    }
    
    return { success: false, message: 'Still waiting for clean data' };
  }
  
  /**
   * Generate question bank
   */
  async generateQuestionBank(data) {
    console.log(`❓ [${this.id}] Generating question bank for ${data.productName || 'product'}`);
    
    const questions = [];
    
    // Generate questions for each category
    for (const category of this.questionCategories) {
      const categoryQuestions = this.generateQuestionsForCategory(data, category);
      questions.push(...categoryQuestions);
    }
    
    // Ensure we have enough questions
    while (questions.length < this.targetQuestionCount) {
      const additionalQuestion = this.generateGenericQuestion(data, questions.length);
      questions.push(additionalQuestion);
    }
    
    this.generatedQuestions = questions;
    
    console.log(`✅ [${this.id}] Generated ${questions.length} questions across ${this.questionCategories.length} categories`);
    
    this.goals.delete('generate_question_bank');
    
    return { 
      success: true, 
      message: `Generated ${questions.length} questions`,
      questionCount: questions.length
    };
  }
  
  /**
   * Generate questions for specific category
   */
  generateQuestionsForCategory(data, category) {
    const templates = this.questionTemplates.get(category) || [];
    const questions = [];
    
    for (const template of templates) {
      const question = this.fillQuestionTemplate(template, data);
      const answer = this.generateAnswerForQuestion(question, data, category);
      
      questions.push({
        category: category,
        question: question,
        answer: answer,
        importance: this.assessQuestionImportance(question, category),
        generatedBy: this.id
      });
    }
    
    return questions;
  }
  
  /**
   * Fill question template with data
   */
  fillQuestionTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, field) => {
      return data[field] || match;
    });
  }
  
  /**
   * Generate answer for question
   */
  generateAnswerForQuestion(question, data, category) {
    // Simple answer generation based on category and available data
    if (category === 'informational') {
      if (question.includes('What is')) {
        return `${data.productName || 'This product'} is a ${data.concentration || 'skincare'} product with ${data.keyIngredients || 'premium ingredients'}.`;
      }
      if (question.includes('key ingredients')) {
        return `The key ingredients include ${data.keyIngredients || 'carefully selected components'}.`;
      }
    }
    
    if (category === 'usage') {
      if (question.includes('How do I use')) {
        return data.howToUse || 'Follow the product instructions for best results.';
      }
    }
    
    if (category === 'safety') {
      if (question.includes('side effects')) {
        return data.sideEffects ? `Some users may experience ${data.sideEffects.toLowerCase()}. Always patch test before first use.` : 'Always patch test before first use.';
      }
    }
    
    if (category === 'purchase') {
      if (question.includes('price')) {
        return `${data.productName || 'This product'} is available for ${data.price || 'competitive pricing'}.`;
      }
      if (question.includes('benefits')) {
        return `${data.productName || 'This product'} provides ${data.benefits || 'skincare benefits'}.`;
      }
    }
    
    // Default answer
    return `This question relates to ${data.productName || 'the product'} and its characteristics.`;
  }
  
  /**
   * Assess question importance
   */
  assessQuestionImportance(question, category) {
    const highImportanceKeywords = ['what is', 'how to use', 'side effects', 'price'];
    const mediumImportanceKeywords = ['when', 'how often', 'benefits'];
    
    const questionLower = question.toLowerCase();
    
    if (highImportanceKeywords.some(keyword => questionLower.includes(keyword))) {
      return 'high';
    } else if (mediumImportanceKeywords.some(keyword => questionLower.includes(keyword))) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  /**
   * Generate generic question
   */
  generateGenericQuestion(data, index) {
    const genericQuestions = [
      `Who should use ${data.productName || 'this product'}?`,
      `How long does it take to see results with ${data.productName || 'this product'}?`,
      `Can I use ${data.productName || 'this product'} with other skincare products?`
    ];
    
    const question = genericQuestions[index % genericQuestions.length];
    
    return {
      category: 'general',
      question: question,
      answer: `This question about ${data.productName || 'the product'} requires individual consideration.`,
      importance: 'low',
      generatedBy: this.id
    };
  }
  
  /**
   * Categorize questions
   */
  async categorizeQuestions() {
    console.log(`📋 [${this.id}] Categorizing ${this.generatedQuestions.length} questions`);
    
    // Organize questions by category
    for (const question of this.generatedQuestions) {
      const category = question.category;
      
      if (!this.questionBank.has(category)) {
        this.questionBank.set(category, []);
      }
      
      this.questionBank.get(category).push(question);
    }
    
    console.log(`✅ [${this.id}] Questions categorized into ${this.questionBank.size} categories`);
    
    this.goals.delete('categorize_questions');
    
    return { 
      success: true, 
      message: `Questions categorized into ${this.questionBank.size} categories`,
      categories: Array.from(this.questionBank.keys())
    };
  }
  
  /**
   * Share questions with other agents
   */
  async shareQuestions() {
    console.log(`📤 [${this.id}] Sharing question bank with other agents`);
    
    const questionBankData = {
      questions: this.generatedQuestions,
      categorizedQuestions: Object.fromEntries(this.questionBank.entries()),
      totalQuestions: this.generatedQuestions.length,
      categories: Array.from(this.questionBank.keys()),
      generatedBy: this.id,
      timestamp: Date.now()
    };
    
    // Broadcast question bank to all agents
    await this.broadcastMessage('question_bank_available', questionBankData);
    
    this.goals.delete('share_questions');
    
    return { 
      success: true, 
      message: `Shared ${this.generatedQuestions.length} questions with all agents`,
      questionCount: this.generatedQuestions.length
    };
  }
  
  /**
   * Handle incoming messages from other agents
   */
  async handleMessage(message) {
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
      console.log(`📊 [${this.id}] Received clean data from ${message.from || 'unknown'}`);
    }
  }
  
  /**
   * React to system events
   */
  reactToSystemEvent(event) {
    if (event.eventType === 'data_available') {
      console.log(`❓ [${this.id}] Reacting to data availability`);
    }
  }
}