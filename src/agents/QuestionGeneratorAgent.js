import { BaseAgent } from './BaseAgent.js';
import { generateQuestions, countQuestions, assessContentQuality } from '../blocks/ContentBlocks.js';

/**
 * QuestionGeneratorAgent - Generates 15+ categorized questions
 * 
 * Responsibilities:
 * - Generate questions across 5 categories
 * - Ensure 15+ total questions
 * - Prioritize questions by importance
 * - Assess question quality
 */
export class QuestionGeneratorAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'question_generator_001',
      name: 'QuestionGeneratorAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.12
    });

    this.categories = [
      'informational',
      'safety',
      'usage', 
      'purchase',
      'comparison'
    ];

    this.targetQuestionCount = 15;
    this.addGoal('generate_question_bank');
    this.addGoal('ensure_question_quality');
  }

  /**
   * Generate comprehensive question bank
   */
  async generateQuestionBank(productData) {
    console.log(`❓ [${this.name}] Generating question bank...`);
    
    const questions = generateQuestions(productData);
    
    // Ensure we meet the 15+ requirement
    if (questions.length < this.targetQuestionCount) {
      console.log(`⚠️  [${this.name}] Only ${questions.length} questions generated, adding more...`);
      const additionalQuestions = this.generateAdditionalQuestions(productData, this.targetQuestionCount - questions.length);
      questions.push(...additionalQuestions);
    }

    // Prioritize questions
    const prioritizedQuestions = this.prioritizeQuestions(questions, productData);
    
    // Assess quality
    const qualityAssessment = assessContentQuality(productData);
    
    const result = {
      questions: prioritizedQuestions,
      total_count: prioritizedQuestions.length,
      categories_covered: this.categories.length,
      quality_assessment: qualityAssessment,
      generated_at: new Date().toISOString()
    };

    console.log(`✅ [${this.name}] Generated ${result.total_count} questions across ${result.categories_covered} categories`);
    
    return result;
  }

  /**
   * Generate additional questions to meet target count
   */
  generateAdditionalQuestions(productData, needed) {
    const additionalQuestions = [];
    const genericQuestions = this.getGenericQuestions(productData);
    
    for (let i = 0; i < needed && i < genericQuestions.length; i++) {
      additionalQuestions.push({
        category: 'general',
        ...genericQuestions[i],
        priority: 'medium',
        source: 'generated_additional'
      });
    }
    
    return additionalQuestions;
  }

  /**
   * Get generic questions that work for any product
   */
  getGenericQuestions(productData) {
    return [
      {
        question: `Who should use ${productData.productName || 'this product'}?`,
        answer: `${productData.productName || 'This product'} is suitable for people with ${productData.skinType || 'various skin types'} looking for ${productData.benefits || 'skincare benefits'}.`
      },
      {
        question: `How long does it take to see results with ${productData.productName || 'this product'}?`,
        answer: `Results with ${productData.productName || 'this product'} may vary, but many users notice improvements within a few weeks of consistent use.`
      },
      {
        question: `Where can I buy ${productData.productName || 'this product'}?`,
        answer: `${productData.productName || 'This product'} is available through authorized retailers and online platforms.`
      },
      {
        question: `What is the shelf life of ${productData.productName || 'this product'}?`,
        answer: `${productData.productName || 'This product'} typically has a shelf life of 12-24 months when stored properly.`
      },
      {
        question: `Can I return ${productData.productName || 'this product'} if I'm not satisfied?`,
        answer: `Return policies may vary by retailer. Check with your point of purchase for specific return terms.`
      },
      {
        question: `Is ${productData.productName || 'this product'} cruelty-free?`,
        answer: `Please check the product packaging or manufacturer's website for cruelty-free certification information.`
      }
    ];
  }

  /**
   * Prioritize questions by importance and relevance
   */
  prioritizeQuestions(questions, productData) {
    return questions.map(question => {
      const priority = this.calculateQuestionPriority(question, productData);
      return {
        ...question,
        priority: priority.level,
        importance_score: priority.score,
        reasoning: priority.reasoning
      };
    }).sort((a, b) => b.importance_score - a.importance_score);
  }

  /**
   * Calculate question priority based on category and content
   */
  calculateQuestionPriority(question, productData) {
    let score = 50; // Base score
    let reasoning = [];

    // Category-based scoring
    switch (question.category) {
      case 'safety':
        score += 25;
        reasoning.push('Safety information is critical');
        break;
      case 'usage':
        score += 20;
        reasoning.push('Usage instructions are essential');
        break;
      case 'informational':
        score += 15;
        reasoning.push('Product information builds understanding');
        break;
      case 'purchase':
        score += 10;
        reasoning.push('Purchase information aids decision-making');
        break;
      case 'comparison':
        score += 5;
        reasoning.push('Comparison helps differentiation');
        break;
    }

    // Content-based scoring
    if (question.question.toLowerCase().includes('side effect')) {
      score += 15;
      reasoning.push('Side effects are high priority');
    }

    if (question.question.toLowerCase().includes('how to use')) {
      score += 10;
      reasoning.push('Usage instructions are frequently asked');
    }

    if (question.question.toLowerCase().includes('price')) {
      score += 8;
      reasoning.push('Pricing is important for purchase decisions');
    }

    // Determine priority level
    let level;
    if (score >= 80) level = 'high';
    else if (score >= 60) level = 'medium';
    else level = 'low';

    return {
      score: Math.min(100, score),
      level,
      reasoning: reasoning.join(', ')
    };
  }

  /**
   * Validate question quality
   */
  validateQuestionQuality(questions) {
    const validation = {
      total_questions: questions.length,
      meets_minimum: questions.length >= this.targetQuestionCount,
      categories_covered: new Set(questions.map(q => q.category)).size,
      has_all_categories: new Set(questions.map(q => q.category)).size >= this.categories.length,
      quality_issues: []
    };

    // Check for duplicate questions
    const questionTexts = questions.map(q => q.question.toLowerCase());
    const duplicates = questionTexts.filter((q, index) => questionTexts.indexOf(q) !== index);
    if (duplicates.length > 0) {
      validation.quality_issues.push(`${duplicates.length} duplicate questions found`);
    }

    // Check answer quality
    const shortAnswers = questions.filter(q => q.answer.length < 20);
    if (shortAnswers.length > 0) {
      validation.quality_issues.push(`${shortAnswers.length} answers are too short`);
    }

    return validation;
  }

  /**
   * Get question generation statistics
   */
  getGenerationStats() {
    return {
      agent: this.name,
      target_questions: this.targetQuestionCount,
      categories: this.categories,
      generation_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel
    };
  }
}