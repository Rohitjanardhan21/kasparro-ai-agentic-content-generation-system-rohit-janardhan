import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { COMPARISON_PAGE_TEMPLATE } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

/**
 * ComparisonPageAgent - Generates comparison pages using template engine
 * 
 * Responsibilities:
 * - Process comparison page template
 * - Generate side-by-side product comparisons
 * - Analyze competitive advantages
 * - Provide recommendations
 */
export class ComparisonPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'comparison_page_001',
      name: 'ComparisonPageAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.1
    });

    this.templateEngine = new TemplateEngine();
    this.setupTemplateEngine();
    
    this.addGoal('generate_comparison_page');
    this.addGoal('analyze_competitive_advantages');
  }

  /**
   * Setup template engine with content blocks
   */
  setupTemplateEngine() {
    // Register comparison page template
    this.templateEngine.registerTemplate('comparison_page', COMPARISON_PAGE_TEMPLATE);
    
    // Register content blocks
    this.templateEngine.registerContentBlock('generateProductDetails', ContentBlocks.generateProductDetails);
    this.templateEngine.registerContentBlock('generateCompetitorName', ContentBlocks.generateCompetitorName);
    this.templateEngine.registerContentBlock('generateCompetitorDetails', ContentBlocks.generateCompetitorDetails);
    this.templateEngine.registerContentBlock('generateComparisonAnalysis', ContentBlocks.generateComparisonAnalysis);
    this.templateEngine.registerContentBlock('compareIngredients', ContentBlocks.compareIngredients);
    this.templateEngine.registerContentBlock('compareBenefits', ContentBlocks.compareBenefits);
    this.templateEngine.registerContentBlock('comparePricing', ContentBlocks.comparePricing);
    this.templateEngine.registerContentBlock('compareUsage', ContentBlocks.compareUsage);
    this.templateEngine.registerContentBlock('compareSafety', ContentBlocks.compareSafety);
    this.templateEngine.registerContentBlock('generateRecommendation', ContentBlocks.generateRecommendation);
    
    // Register field processors
    this.templateEngine.registerFieldProcessor('timestamp', () => new Date().toISOString());
    
    console.log(`🔧 [${this.name}] Template engine configured`);
  }

  /**
   * Generate comparison page content
   */
  async generateComparisonPage(productData, competitorData = null) {
    console.log(`⚖️  [${this.name}] Generating comparison page...`);
    
    try {
      // Prepare context
      const context = {
        competitorData: competitorData,
        agent: this.name,
        generated_at: new Date().toISOString(),
        comparison_type: 'product_vs_competitor'
      };

      // Process template
      const comparisonContent = await this.templateEngine.processTemplate('comparison_page', productData, context);
      
      // Enhance with detailed analysis
      this.enhanceComparisonContent(comparisonContent, productData);
      
      // Add generation metadata
      comparisonContent.generation_info = {
        agent: this.name,
        template_used: 'COMPARISON_PAGE_TEMPLATE',
        processing_time: Date.now(),
        autonomy_level: this.autonomyLevel
      };

      // Validate content quality
      const validation = this.validateComparisonContent(comparisonContent);
      comparisonContent.validation = validation;

      console.log(`✅ [${this.name}] Comparison page generated with ${Object.keys(comparisonContent.sections || {}).length} comparison sections`);
      
      return comparisonContent;
      
    } catch (error) {
      console.error(`❌ [${this.name}] Comparison page generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhance comparison content with detailed analysis
   */
  enhanceComparisonContent(comparisonContent, productData) {
    // Add competitive scoring
    if (comparisonContent.sections) {
      comparisonContent.competitive_analysis = this.generateCompetitiveScoring(comparisonContent.sections, productData);
    }

    // Add decision matrix
    comparisonContent.decision_matrix = this.generateDecisionMatrix(comparisonContent, productData);

    // Add market positioning
    comparisonContent.market_positioning = this.analyzeMarketPositioning(comparisonContent, productData);

    // Add user personas recommendations
    comparisonContent.persona_recommendations = this.generatePersonaRecommendations(comparisonContent, productData);

    return comparisonContent;
  }

  /**
   * Generate competitive scoring across categories
   */
  generateCompetitiveScoring(sections, productData) {
    const scoring = {
      categories: {},
      overall_winner: null,
      score_breakdown: {}
    };

    const categories = ['ingredients', 'benefits', 'pricing', 'usage', 'safety'];
    
    categories.forEach(category => {
      if (sections[category]) {
        const categoryScore = this.scoreCategoryComparison(sections[category], category, productData);
        scoring.categories[category] = categoryScore;
      }
    });

    // Calculate overall scores
    const productAScore = Object.values(scoring.categories).reduce((sum, cat) => sum + cat.product_a_score, 0);
    const productBScore = Object.values(scoring.categories).reduce((sum, cat) => sum + cat.product_b_score, 0);
    
    scoring.score_breakdown = {
      product_a_total: productAScore,
      product_b_total: productBScore,
      categories_compared: Object.keys(scoring.categories).length
    };

    scoring.overall_winner = productAScore > productBScore ? 'product_a' : 
                           productBScore > productAScore ? 'product_b' : 'tie';

    return scoring;
  }

  /**
   * Score individual category comparison
   */
  scoreCategoryComparison(categoryContent, category, productData) {
    let productAScore = 50; // Base score
    let productBScore = 50;

    switch (category) {
      case 'ingredients':
        // Score based on ingredient quality and uniqueness
        if (categoryContent.content?.unique_to_a?.length > 0) productAScore += 15;
        if (categoryContent.content?.unique_to_b?.length > 0) productBScore += 15;
        if (categoryContent.content?.common_ingredients?.length > 2) {
          productAScore += 10;
          productBScore += 10;
        }
        break;

      case 'benefits':
        // Score based on benefit overlap and uniqueness
        if (categoryContent.content?.unique_advantages?.length > 0) productAScore += 20;
        if (categoryContent.content?.overlap?.length > 1) {
          productAScore += 10;
          productBScore += 10;
        }
        break;

      case 'pricing':
        // Score based on value proposition
        const priceComparison = categoryContent.content;
        if (priceComparison?.better_value === productData.productName) {
          productAScore += 25;
        } else {
          productBScore += 25;
        }
        break;

      case 'usage':
        // Score based on convenience
        if (categoryContent.content?.convenience?.includes('once daily')) {
          productAScore += 15;
        }
        break;

      case 'safety':
        // Score based on safety profile
        if (categoryContent.content?.safety_advantage?.includes(productData.productName)) {
          productAScore += 20;
        }
        break;
    }

    return {
      product_a_score: Math.min(100, productAScore),
      product_b_score: Math.min(100, productBScore),
      category_winner: productAScore > productBScore ? 'product_a' : 
                      productBScore > productAScore ? 'product_b' : 'tie'
    };
  }

  /**
   * Generate decision matrix
   */
  generateDecisionMatrix(comparisonContent, productData) {
    const criteria = [
      { name: 'Price Value', weight: 0.25 },
      { name: 'Ingredient Quality', weight: 0.20 },
      { name: 'Ease of Use', weight: 0.15 },
      { name: 'Safety Profile', weight: 0.20 },
      { name: 'Expected Results', weight: 0.20 }
    ];

    const matrix = {
      criteria: criteria,
      scores: {},
      weighted_totals: {},
      recommendation: null
    };

    // Score each product on each criterion (1-10 scale)
    criteria.forEach(criterion => {
      const scores = this.scoreCriterion(criterion.name, comparisonContent, productData);
      matrix.scores[criterion.name] = scores;
      
      // Calculate weighted scores
      matrix.weighted_totals[criterion.name] = {
        product_a: scores.product_a * criterion.weight,
        product_b: scores.product_b * criterion.weight
      };
    });

    // Calculate final totals
    const productATotal = Object.values(matrix.weighted_totals).reduce((sum, scores) => sum + scores.product_a, 0);
    const productBTotal = Object.values(matrix.weighted_totals).reduce((sum, scores) => sum + scores.product_b, 0);

    matrix.final_scores = {
      product_a: Math.round(productATotal * 10) / 10,
      product_b: Math.round(productBTotal * 10) / 10
    };

    matrix.recommendation = productATotal > productBTotal ? 'product_a' : 'product_b';

    return matrix;
  }

  /**
   * Score individual criterion
   */
  scoreCriterion(criterionName, comparisonContent, productData) {
    let productAScore = 7; // Default good score
    let productBScore = 7;

    switch (criterionName) {
      case 'Price Value':
        const pricing = comparisonContent.sections?.pricing?.content;
        if (pricing?.better_value === productData.productName) {
          productAScore = 9;
          productBScore = 6;
        } else {
          productAScore = 6;
          productBScore = 9;
        }
        break;

      case 'Ingredient Quality':
        const ingredients = comparisonContent.sections?.ingredients?.content;
        if (ingredients?.unique_to_a?.length > 0) productAScore += 1;
        if (ingredients?.unique_to_b?.length > 0) productBScore += 1;
        break;

      case 'Ease of Use':
        const usage = comparisonContent.sections?.usage?.content;
        if (usage?.convenience?.includes('once daily')) {
          productAScore = 9;
          productBScore = 6;
        }
        break;

      case 'Safety Profile':
        const safety = comparisonContent.sections?.safety?.content;
        if (safety?.safety_advantage?.includes(productData.productName)) {
          productAScore = 9;
          productBScore = 7;
        }
        break;

      case 'Expected Results':
        const benefits = comparisonContent.sections?.benefits?.content;
        if (benefits?.unique_advantages?.length > 0) {
          productAScore = 8;
          productBScore = 7;
        }
        break;
    }

    return {
      product_a: Math.min(10, Math.max(1, productAScore)),
      product_b: Math.min(10, Math.max(1, productBScore))
    };
  }

  /**
   * Analyze market positioning
   */
  analyzeMarketPositioning(comparisonContent, productData) {
    const productPrice = this.extractPrice(productData.price);
    const competitorPrice = this.extractPrice(comparisonContent.comparison?.product_b?.details?.price);

    return {
      price_segment: this.determineSegment(productPrice),
      competitive_position: productPrice < competitorPrice ? 'value_leader' : 'premium_option',
      target_market: this.identifyTargetMarket(productData),
      differentiation_strategy: this.identifyDifferentiation(comparisonContent, productData),
      market_opportunity: this.assessMarketOpportunity(comparisonContent, productData)
    };
  }

  /**
   * Generate persona-based recommendations
   */
  generatePersonaRecommendations(comparisonContent, productData) {
    return {
      budget_conscious: {
        recommendation: comparisonContent.sections?.pricing?.content?.better_value || productData.productName,
        reasoning: 'Best value for money with effective results'
      },
      ingredient_focused: {
        recommendation: productData.productName,
        reasoning: `Specifically formulated with ${productData.keyIngredients} for targeted benefits`
      },
      convenience_seeker: {
        recommendation: comparisonContent.sections?.usage?.content?.convenience?.includes('once') ? 
          productData.productName : 'Competitor',
        reasoning: 'Simpler application routine fits busy lifestyle'
      },
      safety_first: {
        recommendation: comparisonContent.sections?.safety?.content?.safety_advantage?.includes(productData.productName) ?
          productData.productName : 'Both products',
        reasoning: 'Better safety profile for sensitive users'
      }
    };
  }

  /**
   * Extract numeric price
   */
  extractPrice(priceString) {
    if (!priceString) return 500;
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 500;
  }

  /**
   * Determine price segment
   */
  determineSegment(price) {
    if (price < 300) return 'budget';
    if (price < 700) return 'mid_range';
    return 'premium';
  }

  /**
   * Identify target market
   */
  identifyTargetMarket(productData) {
    const skinType = productData.skinType?.toLowerCase() || '';
    const benefits = productData.benefits?.toLowerCase() || '';

    if (skinType.includes('oily') || skinType.includes('acne')) {
      return 'oily_acne_prone_skin';
    }
    
    if (benefits.includes('anti-aging') || benefits.includes('firming')) {
      return 'mature_skin_anti_aging';
    }
    
    if (benefits.includes('brightening') || benefits.includes('dark spots')) {
      return 'pigmentation_concerns';
    }
    
    return 'general_skincare';
  }

  /**
   * Identify differentiation strategy
   */
  identifyDifferentiation(comparisonContent, productData) {
    const uniqueIngredients = comparisonContent.sections?.ingredients?.content?.unique_to_a?.length || 0;
    const uniqueBenefits = comparisonContent.sections?.benefits?.content?.unique_advantages?.length || 0;
    
    if (uniqueIngredients > 0) return 'ingredient_innovation';
    if (uniqueBenefits > 0) return 'benefit_specialization';
    if (comparisonContent.sections?.usage?.content?.convenience) return 'convenience_factor';
    
    return 'value_proposition';
  }

  /**
   * Assess market opportunity
   */
  assessMarketOpportunity(comparisonContent, productData) {
    const advantages = [];
    const challenges = [];

    // Analyze competitive advantages
    if (comparisonContent.sections?.pricing?.content?.better_value === productData.productName) {
      advantages.push('Price competitiveness');
    }

    if (comparisonContent.sections?.ingredients?.content?.unique_to_a?.length > 0) {
      advantages.push('Unique ingredient profile');
    }

    if (comparisonContent.sections?.usage?.content?.convenience?.includes('once')) {
      advantages.push('Usage convenience');
    }

    // Identify challenges
    if (comparisonContent.sections?.benefits?.content?.product_b_benefits?.length > 
        comparisonContent.sections?.benefits?.content?.product_a_benefits?.length) {
      challenges.push('Fewer claimed benefits');
    }

    return {
      competitive_advantages: advantages,
      market_challenges: challenges,
      opportunity_score: Math.max(1, Math.min(10, advantages.length * 2 - challenges.length))
    };
  }

  /**
   * Validate comparison content quality
   */
  validateComparisonContent(content) {
    const validation = {
      valid: true,
      issues: [],
      quality_score: 100,
      completeness: {}
    };

    // Check required sections
    const requiredSections = ['ingredients', 'benefits', 'pricing', 'usage', 'safety'];
    const missingSections = requiredSections.filter(section => 
      !content.sections || !content.sections[section]
    );

    if (missingSections.length > 0) {
      validation.issues.push(`Missing comparison sections: ${missingSections.join(', ')}`);
      validation.quality_score -= missingSections.length * 15;
    }

    // Check comparison data
    if (!content.comparison) {
      validation.issues.push('Missing comparison data');
      validation.quality_score -= 25;
    }

    // Check recommendation
    if (!content.recommendation) {
      validation.issues.push('Missing recommendation');
      validation.quality_score -= 15;
    }

    validation.valid = validation.quality_score >= 70;
    return validation;
  }

  /**
   * Get comparison page generation statistics
   */
  getComparisonPageStats() {
    return {
      agent: this.name,
      template_engine: this.templateEngine.getInfo(),
      generation_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel,
      comparison_categories: ['ingredients', 'benefits', 'pricing', 'usage', 'safety']
    };
  }
}