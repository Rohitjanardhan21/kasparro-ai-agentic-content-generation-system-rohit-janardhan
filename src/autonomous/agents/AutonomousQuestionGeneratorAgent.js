import { AutonomousAgent } from '../AutonomousAgent.js';

/**
 * AutonomousQuestionGeneratorAgent - Autonomously generates questions when product data is ready
 * 
 * Goals: Generate categorized questions from product data
 * Triggers: When parsed product data becomes available
 * Autonomy: Decides when to generate questions and what types to prioritize
 */
export class AutonomousQuestionGeneratorAgent extends AutonomousAgent {
  constructor() {
    super(
      'AutonomousQuestionGeneratorAgent',
      ['generate_questions', 'categorize_questions', 'prioritize_questions'],
      ['question_generation', 'categorization', 'content_analysis']
    );
    
    this.targetQuestionCount = 18;
    this.requiredCategories = ['informational', 'safety', 'usage', 'purchase', 'comparison'];
  }

  /**
   * Check if the agent can pursue its question generation goals
   */
  canPursueGoal(goal, situation) {
    switch (goal) {
      case 'generate_questions':
        // Can generate if parsed data exists and questions not generated yet
        return situation.sharedData.parsed_data && 
               !situation.sharedData.generated_questions;
      
      case 'categorize_questions':
        // Can categorize if questions exist but not categorized
        return situation.sharedData.generated_questions && 
               !situation.sharedData.questions_categorized;
      
      case 'prioritize_questions':
        // Can prioritize if questions are categorized but not prioritized
        return situation.sharedData.questions_categorized && 
               !situation.sharedData.questions_prioritized;
      
      default:
        return false;
    }
  }

  /**
   * Make autonomous decision about question generation
   */
  makeDecision(actionableGoals, situation) {
    // Follow logical sequence: generate -> categorize -> prioritize
    if (actionableGoals.includes('generate_questions')) {
      return {
        type: 'generate_questions',
        goal: 'generate_questions',
        productData: situation.sharedData.parsed_data
      };
    }
    
    if (actionableGoals.includes('categorize_questions')) {
      return {
        type: 'categorize_questions',
        goal: 'categorize_questions',
        questions: situation.sharedData.generated_questions
      };
    }
    
    if (actionableGoals.includes('prioritize_questions')) {
      return {
        type: 'prioritize_questions',
        goal: 'prioritize_questions',
        questions: situation.sharedData.generated_questions
      };
    }
    
    return null;
  }

  /**
   * Execute autonomous decision
   */
  async executeDecision(decision) {
    console.log(`🤖 [${this.name}] Autonomously executing: ${decision.type}`);
    
    switch (decision.type) {
      case 'generate_questions':
        await this.autonomouslyGenerateQuestions(decision.productData);
        break;
      case 'categorize_questions':
        await this.autonomouslyCategorizeQuestions(decision.questions);
        break;
      case 'prioritize_questions':
        await this.autonomouslyPrioritizeQuestions(decision.questions);
        break;
    }
  }

  /**
   * Autonomously generate questions from product data
   */
  async autonomouslyGenerateQuestions(parsedData) {
    console.log(`🤖 [${this.name}] Autonomously generating questions...`);
    
    const product = parsedData.product;
    const questions = [];
    
    // Generate informational questions
    questions.push(...this.generateInformationalQuestions(product));
    
    // Generate safety questions
    questions.push(...this.generateSafetyQuestions(product));
    
    // Generate usage questions
    questions.push(...this.generateUsageQuestions(product));
    
    // Generate purchase questions
    questions.push(...this.generatePurchaseQuestions(product));
    
    // Generate comparison questions
    questions.push(...this.generateComparisonQuestions(product));
    
    const questionData = {
      questions: questions,
      total_count: questions.length,
      categories: this.requiredCategories,
      generated_by: this.name,
      generated_at: new Date().toISOString()
    };
    
    // Store in shared memory
    this.shareData('generated_questions', questionData);
    
    // Notify other agents
    this.broadcastEvent('questions_generated', {
      agent: this.name,
      count: questions.length,
      categories: this.requiredCategories.length
    });
    
    console.log(`✅ [${this.name}] Generated ${questions.length} questions across ${this.requiredCategories.length} categories`);
  }

  /**
   * Autonomously categorize questions
   */
  async autonomouslyCategorizeQuestions(questionData) {
    console.log(`🤖 [${this.name}] Autonomously categorizing questions...`);
    
    const categorizedQuestions = {};
    
    for (const category of this.requiredCategories) {
      categorizedQuestions[category] = questionData.questions.filter(q => q.category === category);
    }
    
    this.shareData('questions_categorized', true);
    this.shareData('categorized_questions', categorizedQuestions);
    
    console.log(`✅ [${this.name}] Questions categorized by ${this.requiredCategories.length} categories`);
  }

  /**
   * Autonomously prioritize questions for FAQ selection
   */
  async autonomouslyPrioritizeQuestions(questionData) {
    console.log(`🤖 [${this.name}] Autonomously prioritizing questions...`);
    
    // Add priority scores to questions
    const prioritizedQuestions = questionData.questions.map(q => ({
      ...q,
      priority_score: this.calculatePriorityScore(q),
      importance_level: this.determineImportanceLevel(q)
    }));
    
    // Sort by priority
    prioritizedQuestions.sort((a, b) => b.priority_score - a.priority_score);
    
    const prioritizedData = {
      ...questionData,
      questions: prioritizedQuestions,
      prioritized_by: this.name,
      prioritized_at: new Date().toISOString()
    };
    
    this.shareData('questions_prioritized', true);
    this.shareData('prioritized_questions', prioritizedData);
    
    console.log(`✅ [${this.name}] Questions prioritized with importance scores`);
  }

  /**
   * Calculate priority score for a question
   */
  calculatePriorityScore(question) {
    let score = 50; // Base score
    
    // Safety questions get highest priority
    if (question.category === 'safety') score += 30;
    
    // Usage questions are also important
    if (question.category === 'usage') score += 20;
    
    // Informational questions are moderately important
    if (question.category === 'informational') score += 15;
    
    // Purchase questions for conversion
    if (question.category === 'purchase') score += 10;
    
    // Comparison questions for differentiation
    if (question.category === 'comparison') score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Determine importance level
   */
  determineImportanceLevel(question) {
    const score = this.calculatePriorityScore(question);
    
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  // Question generation methods (same as before but autonomous)
  generateInformationalQuestions(product) {
    return [
      {
        category: 'informational',
        question: `What is ${product.name}?`,
        answer: `${product.name} is a skincare serum with ${product.concentration} designed for ${product.skinType.toLowerCase()} skin types.`
      },
      {
        category: 'informational',
        question: 'What are the key ingredients?',
        answer: `The key ingredients are ${product.keyIngredients}.`
      },
      {
        category: 'informational',
        question: 'What benefits can I expect?',
        answer: `You can expect ${product.benefits.toLowerCase()} with regular use.`
      }
    ];
  }

  generateSafetyQuestions(product) {
    return [
      {
        category: 'safety',
        question: 'Are there any side effects?',
        answer: product.sideEffects || 'No known side effects when used as directed.'
      },
      {
        category: 'safety',
        question: 'Is this suitable for sensitive skin?',
        answer: product.sideEffects.toLowerCase().includes('sensitive') 
          ? 'May cause mild reactions in sensitive skin. Patch test recommended.'
          : 'Generally suitable for most skin types including sensitive skin.'
      },
      {
        category: 'safety',
        question: 'Can I use this with other skincare products?',
        answer: 'Consider your skin sensitivity as this product may cause mild tingling for sensitive skin.'
      }
    ];
  }

  generateUsageQuestions(product) {
    return [
      {
        category: 'usage',
        question: 'How do I use this product?',
        answer: product.howToUse
      },
      {
        category: 'usage',
        question: 'When should I apply this serum?',
        answer: product.howToUse.toLowerCase().includes('morning') 
          ? 'Apply in the morning before sunscreen.'
          : 'Follow the specific instructions provided with the product.'
      },
      {
        category: 'usage',
        question: 'How long before I see results?',
        answer: 'Results typically become visible after 4-6 weeks of consistent use.'
      }
    ];
  }

  generatePurchaseQuestions(product) {
    return [
      {
        category: 'purchase',
        question: 'What is the price?',
        answer: `${product.name} is priced at ${product.price}.`
      },
      {
        category: 'purchase',
        question: 'Is this good value for money?',
        answer: `At ${product.price}, this serum offers good value with its ${product.concentration} and quality ingredients like ${product.keyIngredients}.`
      },
      {
        category: 'purchase',
        question: 'Where can I buy this product?',
        answer: 'Available through authorized retailers and online platforms.'
      },
      {
        category: 'purchase',
        question: 'Are there any discounts available?',
        answer: 'Check with authorized retailers for current promotions and bundle offers.'
      },
      {
        category: 'purchase',
        question: 'What is the shelf life?',
        answer: 'Typically 12-24 months when stored properly in a cool, dry place.'
      }
    ];
  }

  generateComparisonQuestions(product) {
    return [
      {
        category: 'comparison',
        question: 'How does this compare to other Vitamin C serums?',
        answer: `This serum stands out with its ${product.concentration} and additional ingredients like ${product.keyIngredients}.`
      },
      {
        category: 'comparison',
        question: 'Why choose this over other brands?',
        answer: `The combination of ${product.benefits.toLowerCase()} and suitability for ${product.skinType.toLowerCase()} skin makes it a targeted choice.`
      },
      {
        category: 'comparison',
        question: 'Is this more effective than lower concentration serums?',
        answer: `The ${product.concentration} provides an optimal balance of effectiveness and gentleness for daily use.`
      },
      {
        category: 'comparison',
        question: 'How does the price compare to similar products?',
        answer: `At ${product.price}, this offers competitive pricing for a ${product.concentration} serum with quality ingredients.`
      }
    ];
  }

  /**
   * Handle data parsed event
   */
  handleAgentCompleted(agentName, result) {
    super.handleAgentCompleted(agentName, result);
    
    if (agentName === 'AutonomousDataParserAgent') {
      console.log(`📨 [${this.name}] Data parser completed - will generate questions autonomously`);
    }
  }
}