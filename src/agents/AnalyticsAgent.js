import { Agent } from '../core/Agent.js';

/**
 * AnalyticsAgent - analyzes generated content for insights and metrics
 */
export class AnalyticsAgent extends Agent {
  constructor() {
    super('AnalyticsAgent', ['QuestionGeneratorAgent', 'FaqPageAgent', 'ProductPageAgent', 'ComparisonPageAgent']);
  }

  async process(input) {
    const questions = input.QuestionGeneratorAgent.questions;
    const faqPage = input.FaqPageAgent.content;
    const productPage = input.ProductPageAgent.content;
    const comparisonPage = input.ComparisonPageAgent.content;

    // Analyze content metrics
    const analytics = {
      content_metrics: this.analyzeContentMetrics(questions, faqPage, productPage, comparisonPage),
      question_analysis: this.analyzeQuestions(questions),
      readability_scores: this.calculateReadabilityScores(faqPage, productPage),
      engagement_predictions: this.predictEngagement(questions),
      content_gaps: this.identifyContentGaps(questions),
      optimization_suggestions: this.generateOptimizationSuggestions(questions, faqPage, productPage)
    };

    return {
      analytics: analytics,
      generated_at: new Date().toISOString(),
      analysis_version: '1.0'
    };
  }

  analyzeContentMetrics(questions, faqPage, productPage, comparisonPage) {
    return {
      total_questions_generated: questions.length,
      faq_questions_used: faqPage.faqs?.length || 0,
      content_utilization_rate: Math.round(((faqPage.faqs?.length || 0) / questions.length) * 100),
      average_answer_length: this.calculateAverageAnswerLength(questions),
      content_density_score: this.calculateContentDensity(productPage),
      comparison_completeness: this.assessComparisonCompleteness(comparisonPage)
    };
  }

  analyzeQuestions(questions) {
    const categoryDistribution = {};
    const complexityScores = [];
    
    questions.forEach(q => {
      categoryDistribution[q.category] = (categoryDistribution[q.category] || 0) + 1;
      complexityScores.push(this.calculateQuestionComplexity(q.question));
    });

    return {
      category_distribution: categoryDistribution,
      most_common_category: Object.keys(categoryDistribution).reduce((a, b) => 
        categoryDistribution[a] > categoryDistribution[b] ? a : b),
      average_complexity_score: Math.round(complexityScores.reduce((a, b) => a + b, 0) / complexityScores.length),
      question_types: this.categorizeQuestionTypes(questions)
    };
  }

  calculateReadabilityScores(faqPage, productPage) {
    const faqText = faqPage.faqs?.map(q => q.answer).join(' ') || '';
    const productText = JSON.stringify(productPage).replace(/[{}",]/g, ' ');

    return {
      faq_readability: this.calculateFleschScore(faqText),
      product_readability: this.calculateFleschScore(productText),
      average_sentence_length: this.calculateAverageSentenceLength(faqText),
      vocabulary_complexity: this.assessVocabularyComplexity(faqText + productText)
    };
  }

  predictEngagement(questions) {
    const engagementFactors = {
      question_variety: questions.length > 15 ? 'high' : 'medium',
      category_balance: this.assessCategoryBalance(questions),
      practical_focus: this.assessPracticalFocus(questions),
      user_intent_coverage: this.assessUserIntentCoverage(questions)
    };

    const engagementScore = this.calculateEngagementScore(engagementFactors);

    return {
      predicted_engagement_level: engagementScore > 75 ? 'high' : engagementScore > 50 ? 'medium' : 'low',
      engagement_score: engagementScore,
      key_strengths: this.identifyEngagementStrengths(engagementFactors),
      improvement_areas: this.identifyEngagementWeaknesses(engagementFactors)
    };
  }

  identifyContentGaps(questions) {
    const expectedCategories = ['informational', 'safety', 'usage', 'purchase', 'comparison', 'technical'];
    const presentCategories = [...new Set(questions.map(q => q.category))];
    const missingCategories = expectedCategories.filter(cat => !presentCategories.includes(cat));

    return {
      missing_categories: missingCategories,
      underrepresented_topics: this.findUnderrepresentedTopics(questions),
      suggested_additions: this.suggestAdditionalQuestions(missingCategories)
    };
  }

  generateOptimizationSuggestions(questions, faqPage, productPage) {
    const suggestions = [];

    // Question optimization
    if (questions.length < 20) {
      suggestions.push({
        type: 'content_expansion',
        priority: 'medium',
        suggestion: 'Consider generating more questions to improve content coverage'
      });
    }

    // FAQ optimization
    if ((faqPage.faqs?.length || 0) < 7) {
      suggestions.push({
        type: 'faq_enhancement',
        priority: 'high',
        suggestion: 'Increase FAQ questions to improve user experience'
      });
    }

    // Product page optimization
    if (!productPage.benefits || productPage.benefits.length < 3) {
      suggestions.push({
        type: 'benefit_enhancement',
        priority: 'high',
        suggestion: 'Expand benefit descriptions for better product positioning'
      });
    }

    return suggestions;
  }

  // Helper methods
  calculateAverageAnswerLength(questions) {
    const lengths = questions.map(q => q.answer.length);
    return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }

  calculateContentDensity(productPage) {
    const fields = Object.keys(productPage).length;
    const totalContent = JSON.stringify(productPage).length;
    return Math.round(totalContent / fields);
  }

  assessComparisonCompleteness(comparisonPage) {
    const requiredFields = ['product_a', 'product_b', 'common_ingredients', 'analysis'];
    const presentFields = requiredFields.filter(field => comparisonPage[field]);
    return Math.round((presentFields.length / requiredFields.length) * 100);
  }

  calculateQuestionComplexity(question) {
    // Simple complexity based on question length and structure
    const wordCount = question.split(' ').length;
    const hasMultipleClauses = question.includes(',') || question.includes('and') || question.includes('or');
    return wordCount + (hasMultipleClauses ? 5 : 0);
  }

  categorizeQuestionTypes(questions) {
    const types = {
      what_questions: questions.filter(q => q.question.toLowerCase().startsWith('what')).length,
      how_questions: questions.filter(q => q.question.toLowerCase().startsWith('how')).length,
      why_questions: questions.filter(q => q.question.toLowerCase().startsWith('why')).length,
      can_questions: questions.filter(q => q.question.toLowerCase().startsWith('can')).length,
      is_questions: questions.filter(q => q.question.toLowerCase().startsWith('is')).length
    };
    return types;
  }

  calculateFleschScore(text) {
    // Simplified Flesch reading ease score
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const syllables = this.countSyllables(text);
    
    if (sentences === 0 || words === 0) return 0;
    
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  countSyllables(text) {
    // Simple syllable counting
    return text.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
  }

  calculateAverageSentenceLength(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).length;
    return sentences.length > 0 ? Math.round(words / sentences.length) : 0;
  }

  assessVocabularyComplexity(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const complexWords = words.filter(word => word.length > 6).length;
    
    return {
      vocabulary_diversity: Math.round((uniqueWords.size / words.length) * 100),
      complex_word_ratio: Math.round((complexWords / words.length) * 100)
    };
  }

  assessCategoryBalance(questions) {
    const categories = {};
    questions.forEach(q => categories[q.category] = (categories[q.category] || 0) + 1);
    const values = Object.values(categories);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max - min <= 2 ? 'balanced' : 'unbalanced';
  }

  assessPracticalFocus(questions) {
    const practicalKeywords = ['how', 'use', 'apply', 'when', 'where', 'price', 'buy'];
    const practicalQuestions = questions.filter(q => 
      practicalKeywords.some(keyword => q.question.toLowerCase().includes(keyword))
    );
    return practicalQuestions.length / questions.length > 0.4 ? 'high' : 'medium';
  }

  assessUserIntentCoverage(questions) {
    const intents = ['learn', 'buy', 'compare', 'use', 'safety'];
    const coveredIntents = intents.filter(intent => 
      questions.some(q => q.category.includes(intent) || q.question.toLowerCase().includes(intent))
    );
    return coveredIntents.length / intents.length > 0.6 ? 'comprehensive' : 'partial';
  }

  calculateEngagementScore(factors) {
    let score = 50; // Base score
    
    if (factors.question_variety === 'high') score += 15;
    if (factors.category_balance === 'balanced') score += 15;
    if (factors.practical_focus === 'high') score += 10;
    if (factors.user_intent_coverage === 'comprehensive') score += 10;
    
    return Math.min(100, score);
  }

  identifyEngagementStrengths(factors) {
    const strengths = [];
    if (factors.question_variety === 'high') strengths.push('Comprehensive question coverage');
    if (factors.category_balance === 'balanced') strengths.push('Well-balanced content categories');
    if (factors.practical_focus === 'high') strengths.push('Strong practical focus');
    if (factors.user_intent_coverage === 'comprehensive') strengths.push('Covers diverse user intents');
    return strengths;
  }

  identifyEngagementWeaknesses(factors) {
    const weaknesses = [];
    if (factors.question_variety !== 'high') weaknesses.push('Could benefit from more question variety');
    if (factors.category_balance === 'unbalanced') weaknesses.push('Category distribution could be more balanced');
    if (factors.practical_focus !== 'high') weaknesses.push('Could include more practical, actionable content');
    return weaknesses;
  }

  findUnderrepresentedTopics(questions) {
    const topicKeywords = {
      'ingredients': ['ingredient', 'component', 'formula'],
      'results': ['result', 'effect', 'outcome', 'benefit'],
      'application': ['apply', 'use', 'method', 'technique'],
      'storage': ['store', 'keep', 'preserve', 'shelf']
    };

    const underrepresented = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const coverage = questions.filter(q => 
        keywords.some(keyword => q.question.toLowerCase().includes(keyword) || q.answer.toLowerCase().includes(keyword))
      ).length;
      
      if (coverage < 2) {
        underrepresented.push(topic);
      }
    });

    return underrepresented;
  }

  suggestAdditionalQuestions(missingCategories) {
    const suggestions = {
      'technical': ['What is the pH level of this product?', 'What is the molecular weight of the active ingredients?'],
      'environmental': ['Is this product eco-friendly?', 'What is the packaging made of?'],
      'compatibility': ['Can this be used with retinol?', 'Is this suitable for pregnant women?']
    };

    return missingCategories.map(category => suggestions[category] || [`Consider adding ${category} related questions`]).flat();
  }
}