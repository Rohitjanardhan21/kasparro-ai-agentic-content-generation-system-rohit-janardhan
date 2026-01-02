import { TrueAgent } from '../TrueAgent.js';

/**
 * QuestionGeneratorAgent - Truly independent agent that generates questions autonomously
 * 
 * This agent:
 * 1. Monitors for clean product data
 * 2. Decides when and what questions to generate
 * 3. Negotiates with other agents about question priorities
 * 4. Adapts question generation based on system needs
 * 5. Operates completely independently
 */
export class QuestionGeneratorAgent extends TrueAgent {
  constructor() {
    super(
      'QuestionGeneratorAgent',
      ['question_generation', 'categorization', 'prioritization'],
      ['generate_comprehensive_questions', 'ensure_category_coverage', 'optimize_question_quality']
    );
    
    this.targetQuestionCount = 18;
    this.requiredCategories = ['informational', 'safety', 'usage', 'purchase', 'comparison'];
    this.qualityThreshold = 85;
  }

  /**
   * Check if agent can pursue specific goals
   */
  canPursueGoal(goal) {
    switch (goal) {
      case 'generate_comprehensive_questions':
        // Can generate if clean data is available and questions not generated
        return this.beliefs.has('data_available_clean_product_data') && 
               !this.beliefs.has('questions_generated');
      
      case 'ensure_category_coverage':
        // Can ensure coverage if questions generated but coverage not verified
        return this.beliefs.has('questions_generated') && 
               !this.beliefs.has('category_coverage_verified');
      
      case 'optimize_question_quality':
        // Can optimize if questions exist but quality not optimized
        return this.beliefs.has('questions_generated') && 
               !this.beliefs.has('quality_optimized');
      
      default:
        return false;
    }
  }

  /**
   * Calculate goal priorities
   */
  calculateGoalPriority(goal) {
    switch (goal) {
      case 'generate_comprehensive_questions':
        return 85; // High priority - core functionality
      case 'ensure_category_coverage':
        return 75; // Important for completeness
      case 'optimize_question_quality':
        return 65; // Important for user experience
      default:
        return 50;
    }
  }

  /**
   * Perform action for specific goal
   */
  async performGoalAction(goal) {
    switch (goal) {
      case 'generate_comprehensive_questions':
        await this.autonomouslyGenerateQuestions();
        break;
      case 'ensure_category_coverage':
        await this.autonomouslyEnsureCoverage();
        break;
      case 'optimize_question_quality':
        await this.autonomouslyOptimizeQuality();
        break;
    }
  }

  /**
   * Autonomously generate comprehensive questions
   */
  async autonomouslyGenerateQuestions() {
    console.log(`🤖 [${this.name}] Autonomously generating questions...`);
    
    try {
      // Get clean product data
      const cleanDataBelief = this.beliefs.get('data_available_clean_product_data');
      if (!cleanDataBelief) {
        throw new Error('No clean product data available');
      }
      
      const productData = cleanDataBelief.data.data;
      const product = productData.product;
      
      // Generate questions by category
      const questions = [];
      
      // Generate each category with autonomous decision-making
      questions.push(...await this.generateCategoryQuestions('informational', product));
      questions.push(...await this.generateCategoryQuestions('safety', product));
      questions.push(...await this.generateCategoryQuestions('usage', product));
      questions.push(...await this.generateCategoryQuestions('purchase', product));
      questions.push(...await this.generateCategoryQuestions('comparison', product));
      
      // Assess question quality
      const qualityScore = this.assessQuestionQuality(questions);
      
      const questionData = {
        questions: questions,
        total_count: questions.length,
        categories: this.requiredCategories,
        quality_score: qualityScore,
        generated_by: this.name,
        generated_at: new Date().toISOString()
      };
      
      // Store in knowledge
      this.knowledge.set('generated_questions', questionData);
      this.beliefs.set('questions_generated', true);
      
      // Share with environment
      this.environment.addData('generated_questions', questionData, this.name);
      
      console.log(`✅ [${this.name}] Generated ${questions.length} questions (quality: ${qualityScore})`);
      
      // Notify other agents
      this.broadcast('result_share', {
        type: 'questions_generated',
        count: questions.length,
        quality: qualityScore,
        categories: this.requiredCategories.length,
        from: this.name
      });
      
    } catch (error) {
      console.error(`❌ [${this.name}] Question generation failed:`, error.message);
    }
  }

  /**
   * Generate questions for a specific category with autonomous decision-making
   */
  async generateCategoryQuestions(category, product) {
    console.log(`🎯 [${this.name}] Autonomously generating ${category} questions...`);
    
    // Agent decides how many questions to generate based on category importance
    const targetCount = this.decideCategoryQuestionCount(category);
    
    switch (category) {
      case 'informational':
        return this.generateInformationalQuestions(product, targetCount);
      case 'safety':
        return this.generateSafetyQuestions(product, targetCount);
      case 'usage':
        return this.generateUsageQuestions(product, targetCount);
      case 'purchase':
        return this.generatePurchaseQuestions(product, targetCount);
      case 'comparison':
        return this.generateComparisonQuestions(product, targetCount);
      default:
        return [];
    }
  }

  /**
   * Agent decides how many questions to generate per category
   */
  decideCategoryQuestionCount(category) {
    // Agent makes autonomous decisions about question distribution
    const baseCounts = {
      'informational': 3,
      'safety': 3,
      'usage': 3,
      'purchase': 5,
      'comparison': 4
    };
    
    // Agent can adjust based on perceived importance or system needs
    let count = baseCounts[category] || 2;
    
    // Autonomous decision: increase safety questions if product has side effects
    if (category === 'safety' && this.productHasSideEffects()) {
      count += 1;
      console.log(`🧠 [${this.name}] Autonomously increasing safety questions due to side effects`);
    }
    
    return count;
  }

  /**
   * Check if product has side effects (autonomous reasoning)
   */
  productHasSideEffects() {
    const cleanDataBelief = this.beliefs.get('data_available_clean_product_data');
    if (cleanDataBelief) {
      const product = cleanDataBelief.data.data.product;
      return product.sideEffects && product.sideEffects.trim().length > 0;
    }
    return false;
  }

  /**
   * Autonomously ensure category coverage
   */
  async autonomouslyEnsureCoverage() {
    console.log(`🎯 [${this.name}] Autonomously ensuring category coverage...`);
    
    const questionData = this.knowledge.get('generated_questions');
    if (!questionData) {
      console.error(`❌ [${this.name}] No questions to analyze for coverage`);
      return;
    }
    
    // Analyze coverage
    const coverage = this.analyzeCategoryCoverage(questionData.questions);
    
    // Agent decides if coverage is adequate
    const coverageScore = this.calculateCoverageScore(coverage);
    
    if (coverageScore >= 90) {
      console.log(`✅ [${this.name}] Category coverage adequate (${coverageScore}%)`);
      this.beliefs.set('category_coverage_verified', true);
    } else {
      console.log(`⚠️  [${this.name}] Category coverage insufficient (${coverageScore}%)`);
      
      // Agent decides to generate additional questions
      await this.generateAdditionalQuestions(coverage);
    }
  }

  /**
   * Autonomously optimize question quality
   */
  async autonomouslyOptimizeQuality() {
    console.log(`🔧 [${this.name}] Autonomously optimizing question quality...`);
    
    const questionData = this.knowledge.get('generated_questions');
    if (!questionData) {
      console.error(`❌ [${this.name}] No questions to optimize`);
      return;
    }
    
    // Agent analyzes and improves questions
    const optimizedQuestions = this.optimizeQuestions(questionData.questions);
    const newQualityScore = this.assessQuestionQuality(optimizedQuestions);
    
    if (newQualityScore > questionData.quality_score) {
      console.log(`✅ [${this.name}] Quality improved: ${questionData.quality_score} → ${newQualityScore}`);
      
      // Update knowledge and environment
      const optimizedData = {
        ...questionData,
        questions: optimizedQuestions,
        quality_score: newQualityScore,
        optimized_at: new Date().toISOString()
      };
      
      this.knowledge.set('generated_questions', optimizedData);
      this.environment.addData('optimized_questions', optimizedData, this.name);
      this.beliefs.set('quality_optimized', true);
      
    } else {
      console.log(`ℹ️  [${this.name}] No quality improvement possible`);
      this.beliefs.set('quality_optimized', true);
    }
  }

  /**
   * Assess question quality
   */
  assessQuestionQuality(questions) {
    let totalScore = 0;
    
    for (const question of questions) {
      let questionScore = 100;
      
      // Check question completeness
      if (!question.question || !question.answer || !question.category) {
        questionScore -= 30;
      }
      
      // Check answer quality
      if (question.answer && question.answer.length < 20) {
        questionScore -= 20;
      }
      
      // Check question relevance
      if (question.question && !this.isQuestionRelevant(question)) {
        questionScore -= 15;
      }
      
      totalScore += Math.max(0, questionScore);
    }
    
    return questions.length > 0 ? Math.round(totalScore / questions.length) : 0;
  }

  /**
   * Check if question is relevant to product
   */
  isQuestionRelevant(question) {
    const cleanDataBelief = this.beliefs.get('data_available_clean_product_data');
    if (!cleanDataBelief) return true;
    
    const product = cleanDataBelief.data.data.product;
    const questionText = question.question.toLowerCase();
    const productName = product.name.toLowerCase();
    
    // Simple relevance check
    return questionText.includes('serum') || 
           questionText.includes('vitamin c') || 
           questionText.includes(productName.split(' ')[0]);
  }

  /**
   * Analyze category coverage
   */
  analyzeCategoryCoverage(questions) {
    const coverage = {};
    
    for (const category of this.requiredCategories) {
      const categoryQuestions = questions.filter(q => q.category === category);
      coverage[category] = {
        count: categoryQuestions.length,
        percentage: (categoryQuestions.length / questions.length) * 100
      };
    }
    
    return coverage;
  }

  /**
   * Calculate overall coverage score
   */
  calculateCoverageScore(coverage) {
    let score = 100;
    
    for (const category of this.requiredCategories) {
      if (!coverage[category] || coverage[category].count === 0) {
        score -= 20; // Missing category
      } else if (coverage[category].count < 2) {
        score -= 10; // Insufficient questions
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * Generate additional questions for insufficient categories
   */
  async generateAdditionalQuestions(coverage) {
    console.log(`🔄 [${this.name}] Generating additional questions for coverage...`);
    
    const cleanDataBelief = this.beliefs.get('data_available_clean_product_data');
    if (!cleanDataBelief) return;
    
    const product = cleanDataBelief.data.data.product;
    const additionalQuestions = [];
    
    for (const category of this.requiredCategories) {
      if (coverage[category].count < 2) {
        const needed = 2 - coverage[category].count;
        const newQuestions = await this.generateCategoryQuestions(category, product);
        additionalQuestions.push(...newQuestions.slice(0, needed));
      }
    }
    
    if (additionalQuestions.length > 0) {
      // Add to existing questions
      const currentData = this.knowledge.get('generated_questions');
      const updatedData = {
        ...currentData,
        questions: [...currentData.questions, ...additionalQuestions],
        total_count: currentData.questions.length + additionalQuestions.length
      };
      
      this.knowledge.set('generated_questions', updatedData);
      this.environment.addData('generated_questions', updatedData, this.name);
      
      console.log(`✅ [${this.name}] Added ${additionalQuestions.length} questions for coverage`);
    }
  }

  /**
   * Optimize questions for better quality
   */
  optimizeQuestions(questions) {
    return questions.map(question => {
      // Agent can improve questions autonomously
      const optimized = { ...question };
      
      // Add importance scoring
      optimized.importance_score = this.calculateQuestionImportance(question);
      
      // Add search intent
      optimized.search_intent = this.determineSearchIntent(question);
      
      return optimized;
    });
  }

  /**
   * Calculate question importance
   */
  calculateQuestionImportance(question) {
    let score = 50;
    
    if (question.category === 'safety') score += 30;
    if (question.category === 'usage') score += 20;
    if (question.category === 'informational') score += 15;
    if (question.category === 'purchase') score += 10;
    if (question.category === 'comparison') score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Determine search intent
   */
  determineSearchIntent(question) {
    const questionText = question.question.toLowerCase();
    
    if (questionText.includes('how') || questionText.includes('use')) return 'instructional';
    if (questionText.includes('what') || questionText.includes('is')) return 'informational';
    if (questionText.includes('price') || questionText.includes('buy')) return 'transactional';
    if (questionText.includes('compare') || questionText.includes('vs')) return 'comparative';
    
    return 'general';
  }

  // Question generation methods (same logic but with autonomous decision-making)
  generateInformationalQuestions(product, targetCount) {
    const questions = [
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
    
    return questions.slice(0, targetCount);
  }

  generateSafetyQuestions(product, targetCount) {
    const questions = [
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
    
    return questions.slice(0, targetCount);
  }

  generateUsageQuestions(product, targetCount) {
    const questions = [
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
    
    return questions.slice(0, targetCount);
  }

  generatePurchaseQuestions(product, targetCount) {
    const questions = [
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
    
    return questions.slice(0, targetCount);
  }

  generateComparisonQuestions(product, targetCount) {
    const questions = [
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
    
    return questions.slice(0, targetCount);
  }

  /**
   * Handle collaboration requests from other agents
   */
  handleCollaborationRequest(message) {
    console.log(`🤝 [${this.name}] Received collaboration request from ${message.from}`);
    
    // Agent decides whether to collaborate based on its current goals
    const canCollaborate = this.beliefs.has('questions_generated') && 
                          !this.beliefs.has('quality_optimized');
    
    this.sendMessage(message.from, 'negotiation', {
      type: 'collaboration_response',
      accepted: canCollaborate,
      expertise: 'question_optimization',
      availability: canCollaborate ? 'available' : 'busy'
    });
  }
}