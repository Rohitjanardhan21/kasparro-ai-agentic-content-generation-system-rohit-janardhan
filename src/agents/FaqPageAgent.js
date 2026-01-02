import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { FAQ_PAGE_TEMPLATE } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

/**
 * FaqPageAgent - Generates FAQ pages using template engine
 * 
 * Responsibilities:
 * - Process FAQ page template
 * - Generate structured FAQ content
 * - Prioritize questions by importance
 * - Ensure content quality
 */
export class FaqPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'faq_page_001',
      name: 'FaqPageAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.1
    });

    this.templateEngine = new TemplateEngine();
    this.setupTemplateEngine();
    
    this.addGoal('generate_faq_page');
    this.addGoal('ensure_content_quality');
  }

  /**
   * Setup template engine with content blocks
   */
  setupTemplateEngine() {
    // Register FAQ template
    this.templateEngine.registerTemplate('faq', FAQ_PAGE_TEMPLATE);
    
    // Register content blocks
    this.templateEngine.registerContentBlock('generateQuestions', ContentBlocks.generateQuestions);
    this.templateEngine.registerContentBlock('countQuestions', ContentBlocks.countQuestions);
    this.templateEngine.registerContentBlock('assessContentQuality', ContentBlocks.assessContentQuality);
    
    // Register field processors
    this.templateEngine.registerFieldProcessor('timestamp', () => new Date().toISOString());
    
    console.log(`🔧 [${this.name}] Template engine configured`);
  }

  /**
   * Generate FAQ page content
   */
  async generateFaqPage(productData, questionBank = null) {
    console.log(`📋 [${this.name}] Generating FAQ page...`);
    
    try {
      // Prepare context
      const context = {
        questionBank: questionBank,
        agent: this.name,
        generated_at: new Date().toISOString()
      };

      // Process template
      const faqContent = await this.templateEngine.processTemplate('faq', productData, context);
      
      // Enhance with additional metadata
      faqContent.generation_info = {
        agent: this.name,
        template_used: 'FAQ_PAGE_TEMPLATE',
        processing_time: Date.now(),
        autonomy_level: this.autonomyLevel
      };

      // Validate content quality
      const validation = this.validateFaqContent(faqContent);
      faqContent.validation = validation;

      console.log(`✅ [${this.name}] FAQ page generated with ${faqContent.questions?.length || 0} questions`);
      
      return faqContent;
      
    } catch (error) {
      console.error(`❌ [${this.name}] FAQ generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate FAQ content quality
   */
  validateFaqContent(content) {
    const validation = {
      valid: true,
      issues: [],
      quality_score: 100,
      completeness: {}
    };

    // Check required sections
    if (!content.title) {
      validation.issues.push('Missing title');
      validation.quality_score -= 20;
    }

    if (!content.questions || !Array.isArray(content.questions)) {
      validation.issues.push('Missing or invalid questions array');
      validation.quality_score -= 30;
      validation.valid = false;
    } else {
      // Validate questions
      const questionValidation = this.validateQuestions(content.questions);
      validation.completeness.questions = questionValidation;
      
      if (questionValidation.count < 15) {
        validation.issues.push(`Insufficient questions: ${questionValidation.count} < 15`);
        validation.quality_score -= 25;
      }
      
      if (questionValidation.categories < 5) {
        validation.issues.push(`Insufficient categories: ${questionValidation.categories} < 5`);
        validation.quality_score -= 15;
      }
    }

    // Check categories
    if (!content.categories || content.categories.length < 5) {
      validation.issues.push('Insufficient categories defined');
      validation.quality_score -= 10;
    }

    validation.valid = validation.quality_score >= 70;
    return validation;
  }

  /**
   * Validate individual questions
   */
  validateQuestions(questions) {
    const validation = {
      count: questions.length,
      categories: new Set(questions.map(q => q.category)).size,
      issues: []
    };

    // Check for required fields in each question
    questions.forEach((question, index) => {
      if (!question.question) {
        validation.issues.push(`Question ${index + 1}: Missing question text`);
      }
      
      if (!question.answer) {
        validation.issues.push(`Question ${index + 1}: Missing answer`);
      }
      
      if (!question.category) {
        validation.issues.push(`Question ${index + 1}: Missing category`);
      }
      
      // Check answer quality
      if (question.answer && question.answer.length < 10) {
        validation.issues.push(`Question ${index + 1}: Answer too short`);
      }
    });

    return validation;
  }

  /**
   * Enhance FAQ with additional features
   */
  enhanceFaqContent(faqContent, productData) {
    // Add search intent for each question
    if (faqContent.questions) {
      faqContent.questions = faqContent.questions.map(question => ({
        ...question,
        search_intent: this.determineSearchIntent(question),
        importance_score: this.calculateImportanceScore(question, productData),
        answer_completeness: this.assessAnswerCompleteness(question.answer)
      }));
    }

    // Add FAQ metadata
    faqContent.faq_metadata = {
      total_questions: faqContent.questions?.length || 0,
      categories_covered: new Set(faqContent.questions?.map(q => q.category) || []).size,
      avg_answer_length: this.calculateAverageAnswerLength(faqContent.questions || []),
      content_coverage: this.assessContentCoverage(faqContent.questions || [], productData)
    };

    return faqContent;
  }

  /**
   * Determine search intent for question
   */
  determineSearchIntent(question) {
    const questionText = question.question.toLowerCase();
    
    if (questionText.includes('how to') || questionText.includes('how do')) {
      return 'instructional';
    }
    
    if (questionText.includes('what is') || questionText.includes('what are')) {
      return 'informational';
    }
    
    if (questionText.includes('price') || questionText.includes('cost') || questionText.includes('buy')) {
      return 'transactional';
    }
    
    if (questionText.includes('compare') || questionText.includes('vs') || questionText.includes('better')) {
      return 'comparative';
    }
    
    if (questionText.includes('safe') || questionText.includes('side effect')) {
      return 'safety';
    }
    
    return 'general';
  }

  /**
   * Calculate question importance score
   */
  calculateImportanceScore(question, productData) {
    let score = 50; // Base score
    
    // Category importance
    const categoryScores = {
      'safety': 25,
      'usage': 20,
      'informational': 15,
      'purchase': 10,
      'comparison': 5
    };
    
    score += categoryScores[question.category] || 0;
    
    // Content relevance
    const questionText = question.question.toLowerCase();
    const productName = (productData.productName || '').toLowerCase();
    
    if (questionText.includes(productName)) {
      score += 10;
    }
    
    if (questionText.includes('side effect') || questionText.includes('safe')) {
      score += 15;
    }
    
    if (questionText.includes('how to use')) {
      score += 12;
    }
    
    return Math.min(100, score);
  }

  /**
   * Assess answer completeness
   */
  assessAnswerCompleteness(answer) {
    if (!answer) return 0;
    
    const length = answer.length;
    const wordCount = answer.split(' ').length;
    
    let score = 0;
    
    // Length scoring
    if (length >= 100) score += 40;
    else if (length >= 50) score += 25;
    else if (length >= 20) score += 10;
    
    // Word count scoring
    if (wordCount >= 15) score += 30;
    else if (wordCount >= 8) score += 20;
    else if (wordCount >= 5) score += 10;
    
    // Content quality indicators
    if (answer.includes('recommend') || answer.includes('suggest')) score += 10;
    if (answer.includes('always') || answer.includes('never')) score += 5;
    if (answer.includes('patch test')) score += 10;
    if (answer.includes('consult')) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * Calculate average answer length
   */
  calculateAverageAnswerLength(questions) {
    if (questions.length === 0) return 0;
    
    const totalLength = questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0);
    return Math.round(totalLength / questions.length);
  }

  /**
   * Assess content coverage
   */
  assessContentCoverage(questions, productData) {
    const coverage = {
      product_name_mentioned: 0,
      ingredients_covered: 0,
      benefits_covered: 0,
      usage_covered: 0,
      safety_covered: 0,
      price_covered: 0
    };

    const productName = (productData.productName || '').toLowerCase();
    const ingredients = (productData.keyIngredients || '').toLowerCase().split(',');
    const benefits = (productData.benefits || '').toLowerCase().split(',');

    questions.forEach(question => {
      const text = (question.question + ' ' + question.answer).toLowerCase();
      
      if (text.includes(productName)) coverage.product_name_mentioned++;
      if (ingredients.some(ing => text.includes(ing.trim()))) coverage.ingredients_covered++;
      if (benefits.some(ben => text.includes(ben.trim()))) coverage.benefits_covered++;
      if (text.includes('use') || text.includes('apply')) coverage.usage_covered++;
      if (text.includes('safe') || text.includes('side')) coverage.safety_covered++;
      if (text.includes('price') || text.includes('cost')) coverage.price_covered++;
    });

    return coverage;
  }

  /**
   * Get FAQ generation statistics
   */
  getFaqStats() {
    return {
      agent: this.name,
      template_engine: this.templateEngine.getInfo(),
      generation_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel
    };
  }
}