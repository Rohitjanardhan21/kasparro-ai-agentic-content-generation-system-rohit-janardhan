import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * QuestionMasterAgent - Autonomously generates questions based on available data
 * Makes decisions about question types, difficulty, and categories
 */
export class QuestionMasterAgent extends AutonomousAgent {
  constructor() {
    super('question_master', ['question_generation', 'categorization', 'content_strategy']);
  }

  initialize() {
    this.subscriptions = ['analysis_complete', 'content_request'];
    this.goals = [
      { 
        name: 'generate_question_bank', 
        priority: 2,
        requires: ['product_analysis']
      }
    ];
    this.questionBank = [];
  }

  async onCustomEvent(event) {
    if (event.type === 'analysis_complete') {
      console.log(`QuestionMaster: Analysis available, evaluating question generation needs`);
      // Agent decides whether to start generating questions
      if (this.shouldGenerateQuestions(event.detail.analysis)) {
        this.state = 'idle'; // Ready to work on goals
      }
    } else if (event.type === 'content_request') {
      // Another agent is requesting questions
      await this.handleContentRequest(event.detail);
    }
  }

  shouldGenerateQuestions(analysis) {
    // Agent makes autonomous decision based on analysis quality
    return analysis && analysis.metadata.confidence > 0.8;
  }

  async canAchieveGoal(goal) {
    if (goal.name === 'generate_question_bank') {
      const analysis = this.getSharedData('product_analysis');
      return analysis && analysis.product;
    }
    return false;
  }

  async startWork(goal) {
    if (goal.name === 'generate_question_bank') {
      console.log(`QuestionMaster: Starting intelligent question generation`);
    }
  }

  async workOnGoal(goal) {
    if (goal.name === 'generate_question_bank') {
      const analysis = this.getSharedData('product_analysis');
      
      // Agent autonomously decides question strategy
      const strategy = this.planQuestionStrategy(analysis);
      const questions = await this.generateQuestions(analysis, strategy);
      
      this.questionBank = questions;
      this.setSharedData('question_bank', questions);
      
      // Notify other agents that questions are available
      this.broadcast('questions_ready', {
        agent: this.id,
        count: questions.length,
        categories: [...new Set(questions.map(q => q.category))]
      });
      
      this.results = { questions, strategy };
      return true;
    }
    return false;
  }

  planQuestionStrategy(analysis) {
    // Agent makes strategic decisions about question generation
    const complexity = analysis.insights.complexity_score;
    const safetyLevel = analysis.insights.safety_level;
    
    return {
      total_questions: Math.max(15, complexity * 2),
      categories: this.selectCategories(analysis),
      difficulty_distribution: this.planDifficulty(complexity),
      safety_focus: safetyLevel !== 'minimal_risk'
    };
  }

  selectCategories(analysis) {
    const categories = ['informational', 'usage'];
    
    // Agent decides which categories to include based on analysis
    if (analysis.insights.safety_level !== 'minimal_risk') {
      categories.push('safety');
    }
    
    if (analysis.product.price.numeric > 0) {
      categories.push('purchase');
    }
    
    categories.push('comparison');
    
    return categories;
  }

  planDifficulty(complexity) {
    if (complexity > 7) {
      return { basic: 0.4, intermediate: 0.4, advanced: 0.2 };
    } else if (complexity > 4) {
      return { basic: 0.5, intermediate: 0.4, advanced: 0.1 };
    } else {
      return { basic: 0.7, intermediate: 0.3, advanced: 0 };
    }
  }

  async generateQuestions(analysis, strategy) {
    const questions = [];
    const product = analysis.product;
    
    // Generate questions for each category
    for (const category of strategy.categories) {
      const categoryQuestions = await this.generateCategoryQuestions(category, product, analysis);
      questions.push(...categoryQuestions);
    }
    
    // Agent decides if more questions are needed
    while (questions.length < strategy.total_questions) {
      const additionalQ = await this.generateAdditionalQuestion(product, analysis, questions);
      if (additionalQ) {
        questions.push(additionalQ);
      } else {
        break;
      }
    }
    
    console.log(`QuestionMaster: Generated ${questions.length} questions across ${strategy.categories.length} categories`);
    return questions;
  }

  async generateCategoryQuestions(category, product, analysis) {
    const questions = [];
    
    switch (category) {
      case 'informational':
        questions.push(
          {
            category: 'informational',
            question: `What is ${product.name}?`,
            answer: `${product.name} is a skincare serum with ${product.concentration} designed for ${product.skinType.join(', ').toLowerCase()} skin types.`,
            difficulty: 'basic'
          },
          {
            category: 'informational',
            question: 'What are the key ingredients?',
            answer: `The key ingredients are ${product.keyIngredients.join(', ')}.`,
            difficulty: 'basic'
          },
          {
            category: 'informational',
            question: 'What benefits can I expect?',
            answer: `You can expect ${product.benefits.join(', ').toLowerCase()} with regular use.`,
            difficulty: 'basic'
          }
        );
        break;
        
      case 'safety':
        questions.push(
          {
            category: 'safety',
            question: 'Are there any side effects?',
            answer: product.sideEffects || 'No known side effects when used as directed.',
            difficulty: 'intermediate'
          },
          {
            category: 'safety',
            question: 'Is this suitable for sensitive skin?',
            answer: product.sideEffects.toLowerCase().includes('sensitive') 
              ? 'May cause mild reactions in sensitive skin. Patch test recommended.'
              : 'Generally suitable for most skin types including sensitive skin.',
            difficulty: 'intermediate'
          }
        );
        break;
        
      case 'usage':
        questions.push(
          {
            category: 'usage',
            question: 'How do I use this product?',
            answer: product.howToUse,
            difficulty: 'basic'
          },
          {
            category: 'usage',
            question: 'When should I apply this serum?',
            answer: product.howToUse.toLowerCase().includes('morning') 
              ? 'Apply in the morning before sunscreen.'
              : 'Follow the specific instructions provided with the product.',
            difficulty: 'basic'
          }
        );
        break;
        
      case 'purchase':
        questions.push(
          {
            category: 'purchase',
            question: 'What is the price?',
            answer: `${product.name} is priced at ${product.price.original}.`,
            difficulty: 'basic'
          },
          {
            category: 'purchase',
            question: 'Is this good value for money?',
            answer: `At ${product.price.original}, this serum offers good value with its ${product.concentration} and quality ingredients.`,
            difficulty: 'intermediate'
          }
        );
        break;
        
      case 'comparison':
        questions.push(
          {
            category: 'comparison',
            question: 'How does this compare to other Vitamin C serums?',
            answer: `This serum stands out with its ${product.concentration} and additional ingredients like ${product.keyIngredients.join(', ')}.`,
            difficulty: 'advanced'
          }
        );
        break;
    }
    
    return questions;
  }

  async generateAdditionalQuestion(product, analysis, existingQuestions) {
    // Agent decides what additional questions might be valuable
    const categories = [...new Set(existingQuestions.map(q => q.category))];
    const leastRepresented = this.findLeastRepresentedCategory(categories, existingQuestions);
    
    if (leastRepresented) {
      return await this.generateCategoryQuestions(leastRepresented, product, analysis)[0];
    }
    
    return null;
  }

  findLeastRepresentedCategory(categories, questions) {
    const counts = {};
    categories.forEach(cat => counts[cat] = 0);
    questions.forEach(q => counts[q.category]++);
    
    return Object.keys(counts).reduce((min, cat) => 
      counts[cat] < counts[min] ? cat : min
    );
  }

  async handleContentRequest(request) {
    // Another agent is requesting specific questions
    if (request.type === 'faq_questions' && this.questionBank.length > 0) {
      const selectedQuestions = this.selectQuestionsForFAQ(request.criteria || {});
      this.sendMessage(request.requester, 'question_response', {
        questions: selectedQuestions,
        total_available: this.questionBank.length
      });
    }
  }

  selectQuestionsForFAQ(criteria) {
    let questions = [...this.questionBank];
    
    // Agent makes intelligent selection based on criteria
    if (criteria.categories) {
      questions = questions.filter(q => criteria.categories.includes(q.category));
    }
    
    if (criteria.difficulty) {
      questions = questions.filter(q => q.difficulty === criteria.difficulty);
    }
    
    if (criteria.limit) {
      questions = questions.slice(0, criteria.limit);
    }
    
    return questions;
  }
}