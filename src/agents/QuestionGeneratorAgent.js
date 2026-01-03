/**
 * QuestionGeneratorAgent - Dynamic agent for generating categorized questions
 * 
 * This agent:
 * 1. Generates 15+ questions across 5 categories when assigned tasks
 * 2. Interacts with other agents to get clean data
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
      capabilities: ['question_generation', 'categorization', 'content_analysis']
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
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`❓ [${this.id}] Working on goal: ${goal.description}`);
    
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
      
      if (!cleanData && (goal.description.includes('questions') || goal.description.includes('generate') || goal.description.includes('comprehensive'))) {
        return { success: false, message: 'No clean data available for question generation' };
      }
      
      if (goal.description.includes('questions') || goal.description.includes('generate') || goal.description.includes('comprehensive')) {
        return await this.generateQuestionBank();
      }
      
      if (goal.description.includes('process_product')) {
        // Mark product processing goal as completed since we have clean data
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
        this.goals.delete(goal);
        return { success: true, message: 'Product processing completed' };
      }
      
      if (goal.description.includes('analyze_content_quality')) {
        // This goal is not for QuestionGeneratorAgent, mark as completed
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
        this.goals.delete(goal);
        return { success: true, message: 'Content quality analysis not applicable for question generator' };
      }
      
      return { success: false, message: 'Unknown goal type' };
    } catch (error) {
      console.error(`❌ [${this.id}] Error in performGoalWork: ${error.message}`);
      return { success: false, message: `Error: ${error.message}` };
    }
  }
  
  /**
   * Generate question bank autonomously
   */
  async generateQuestionBank() {
    // Get clean data from beliefs - try multiple keys including prefixed ones
    let cleanData = this.beliefs.get('clean_data') || 
                   this.beliefs.get('initial_context') ||
                   this.knowledge.get('processed_data');
    
    // If cleanData is not a valid object with productName, try other sources
    if (!cleanData || typeof cleanData !== 'object' || !cleanData.productName) {
      // Try prefixed knowledge keys from other agents
      for (const [key, value] of this.knowledge.entries()) {
        if (key.includes('clean_data') || key.includes('processed_data') || key.includes('initial_context')) {
          if (value && typeof value === 'object' && value.productName) {
            cleanData = value;
            break;
          }
        }
      }
    }
    
    // If still no valid clean data, try to extract from any available knowledge
    if (!cleanData || typeof cleanData !== 'object' || !cleanData.productName) {
      for (const [key, value] of this.knowledge.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`❓ [${this.id}] Found product data in knowledge key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // Also check beliefs for any object with productName
    if (!cleanData || typeof cleanData !== 'object' || !cleanData.productName) {
      for (const [key, value] of this.beliefs.entries()) {
        if (value && typeof value === 'object' && value.productName) {
          console.log(`❓ [${this.id}] Found product data in beliefs key: ${key}`);
          cleanData = value;
          break;
        }
      }
    }
    
    // CRITICAL FIX: If initial_context is corrupted to just a string, reconstruct it
    if (!cleanData || typeof cleanData !== 'object' || !cleanData.productName) {
      const initialContext = this.beliefs.get('initial_context');
      
      // If initial_context is corrupted to just the product name string, we need to get the full data
      if (typeof initialContext === 'string') {
        console.log(`🔍 [${this.id}] initial_context corrupted to string, reconstructing data...`);
        
        // Try to find the full product data from other sources
        const productData = this.beliefs.get('product_data') || this.beliefs.get('parse_data');
        if (productData && typeof productData === 'object' && productData.productName) {
          cleanData = productData;
        } else {
          // As a last resort, create a minimal object with the product name
          cleanData = { productName: initialContext };
        }
      }
    }
    
    if (!cleanData) {
      console.log(`❌ [${this.id}] No clean data found. Available knowledge keys:`, Array.from(this.knowledge.keys()));
      console.log(`❌ [${this.id}] Available beliefs keys:`, Array.from(this.beliefs.keys()));
      return { success: false, message: 'No clean data available for question generation' };
    }
    
    console.log(`✅ [${this.id}] Found clean data with productName: ${cleanData.productName}`);
    
    console.log(`❓ [${this.id}] Generating question bank for ${cleanData.productName || 'product'}`);
    
    const questions = [];
    
    // Generate questions for each category
    for (const category of this.questionCategories) {
      const categoryQuestions = this.generateQuestionsForCategory(cleanData, category);
      questions.push(...categoryQuestions);
    }
    
    // Ensure we have enough questions
    while (questions.length < this.targetQuestionCount) {
      const additionalQuestion = this.generateGenericQuestion(cleanData, questions.length);
      questions.push(additionalQuestion);
    }
    
    this.generatedQuestions = questions;
    
    // Store in beliefs and knowledge for other agents
    this.beliefs.set('questions', this.generatedQuestions);
    this.knowledge.set('question_bank', this.generatedQuestions);
    
    console.log(`✅ [${this.id}] Generated ${questions.length} questions across ${this.questionCategories.length} categories`);
    
    // Share questions with other agents immediately
    await this.broadcastMessage('questions_available', {
      questions: this.generatedQuestions,
      provider: this.id,
      timestamp: Date.now()
    });
    
    // Mark all question-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('questions') || goal.description.includes('generate') || goal.description.includes('comprehensive')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return { 
      success: true, 
      message: `Generated ${questions.length} questions`,
      data: this.generatedQuestions
    };
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
   * Perform task-specific work for question generation
   */
  async performTaskWork(task) {
    console.log(`❓ [${this.id}] Starting question generation task: ${task.id}`);
    
    // Get clean data from shared data or wait for it
    let cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    
    if (!cleanData) {
      console.log(`📨 [${this.id}] Requesting clean data from DataParserAgent`);
      await this.requestDataFromPeers(['clean_data']);
      cleanData = this.sharedData.get('clean_data') || this.sharedData.get('parse_data');
    }
    
    if (!cleanData) {
      throw new Error('No clean data available for question generation');
    }
    
    // Generate questions
    console.log(`❓ [${this.id}] Generating question bank for ${cleanData.productName}`);
    this.generatedQuestions = this.generateQuestions(cleanData);
    
    // Categorize questions
    console.log(`📋 [${this.id}] Categorizing ${this.generatedQuestions.length} questions`);
    this.categorizeQuestions();
    
    console.log(`✅ [${this.id}] Generated ${this.generatedQuestions.length} questions across ${this.questionCategories.length} categories`);
    
    // Store in shared data
    this.sharedData.set('question_bank', this.generatedQuestions);
    this.sharedData.set('generate_questions', this.generatedQuestions);
    
    // Return result
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'question_bank',
      questions: this.generatedQuestions,
      categories: this.questionCategories,
      totalQuestions: this.generatedQuestions.length,
      timestamp: Date.now()
    };
    
    return result;
  }
  
  /**
   * Decide what action to take based on situation
   */
  async decideAction(situation) {
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
        reasoning: 'Requesting clean product data from DataParserAgent'
      };
    }
    
    // Priority 3: Share questions with other agents if we have them
    if (this.generatedQuestions.length > 0) {
      return {
        action: 'share_knowledge',
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
        case 'work_on_goal':
          return await this.workOnGoal(decision.goal);
          
        case 'request_data':
          return await this.requestDataFromPeers([decision.dataType]);
          
        case 'generate_question_bank':
          return await this.generateQuestionBank();
          
        case 'share_questions':
          return await this.shareQuestions();
          
        default:
          return await super.executeDecision(decision);
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
    if (message.type === 'questions_available') {
      this.beliefs.set('questions', message.content.questions);
      console.log(`❓ [${this.id}] Received questions from ${message.from || 'unknown'}`);
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