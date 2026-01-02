import { BaseAgent } from './BaseAgent.js';
import { generateCompetitorName, generateCompetitorDetails } from '../blocks/ContentBlocks.js';

/**
 * ComparisonDataAgent - Generates fictional competitor data for comparisons
 * 
 * Responsibilities:
 * - Create realistic competitor products
 * - Generate comparison data
 * - Ensure competitive differentiation
 * - Maintain data consistency
 */
export class ComparisonDataAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'comparison_data_001',
      name: 'ComparisonDataAgent',
      autonomyLevel: config.autonomyLevel || 0.7,
      adaptabilityLevel: config.adaptabilityLevel || 0.8,
      learningRate: config.learningRate || 0.1
    });

    this.competitorTemplates = [
      {
        name_pattern: 'VitaGlow {type} {variant}',
        price_modifier: 1.2,
        strength_modifier: 1.1
      },
      {
        name_pattern: 'BrightSkin {variant} {type}',
        price_modifier: 0.9,
        strength_modifier: 0.95
      },
      {
        name_pattern: 'RadiantCare {type}',
        price_modifier: 1.1,
        strength_modifier: 1.05
      }
    ];

    this.addGoal('generate_competitor_data');
    this.addGoal('ensure_realistic_comparison');
  }

  /**
   * Generate competitor product data
   */
  async generateCompetitorData(originalProduct) {
    console.log(`🔍 [${this.name}] Generating competitor data...`);
    
    const competitor = {
      name: generateCompetitorName(originalProduct),
      ...this.generateCompetitorSpecs(originalProduct),
      generated_at: new Date().toISOString(),
      comparison_type: 'fictional_competitor'
    };

    // Ensure differentiation
    this.ensureDifferentiation(competitor, originalProduct);
    
    // Validate realism
    const validation = this.validateRealism(competitor, originalProduct);
    competitor.validation = validation;

    console.log(`✅ [${this.name}] Generated competitor: ${competitor.name}`);
    
    return competitor;
  }

  /**
   * Generate competitor specifications
   */
  generateCompetitorSpecs(originalProduct) {
    const basePrice = this.extractNumericPrice(originalProduct.price);
    const template = this.selectCompetitorTemplate();
    
    return {
      concentration: this.generateCompetitorConcentration(originalProduct.concentration),
      keyIngredients: this.generateCompetitorIngredients(originalProduct.keyIngredients),
      benefits: this.generateCompetitorBenefits(originalProduct.benefits),
      skinType: this.generateCompetitorSkinType(originalProduct.skinType),
      price: this.generateCompetitorPrice(basePrice, template.price_modifier),
      howToUse: this.generateCompetitorUsage(originalProduct.howToUse),
      sideEffects: this.generateCompetitorSideEffects(originalProduct.sideEffects),
      template_used: template.name_pattern
    };
  }

  /**
   * Select competitor template
   */
  selectCompetitorTemplate() {
    return this.competitorTemplates[Math.floor(Math.random() * this.competitorTemplates.length)];
  }

  /**
   * Generate competitor concentration
   */
  generateCompetitorConcentration(originalConcentration) {
    if (!originalConcentration) return '12% Vitamin C';
    
    const match = originalConcentration.match(/(\d+)%/);
    if (match) {
      const originalPercent = parseInt(match[1]);
      const variations = [
        `${originalPercent + 2}% Vitamin C`,
        `${originalPercent - 1}% Vitamin C`,
        `${originalPercent + 5}% Active Complex`,
        `${Math.max(5, originalPercent - 3)}% Enhanced Formula`
      ];
      return variations[Math.floor(Math.random() * variations.length)];
    }
    
    return '15% Active Formula';
  }

  /**
   * Generate competitor ingredients
   */
  generateCompetitorIngredients(originalIngredients) {
    const baseIngredients = ['Vitamin C', 'Niacinamide', 'Peptides', 'Hyaluronic Acid', 'Retinol'];
    const originalList = originalIngredients ? originalIngredients.split(',').map(i => i.trim()) : [];
    
    // Keep some original ingredients, add some different ones
    const competitorIngredients = [];
    
    // Add 1-2 original ingredients
    if (originalList.length > 0) {
      competitorIngredients.push(originalList[0]);
      if (originalList.length > 1 && Math.random() > 0.5) {
        competitorIngredients.push(originalList[1]);
      }
    }
    
    // Add different ingredients
    const availableIngredients = baseIngredients.filter(ing => 
      !competitorIngredients.some(comp => comp.toLowerCase().includes(ing.toLowerCase()))
    );
    
    const additionalCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < additionalCount && i < availableIngredients.length; i++) {
      competitorIngredients.push(availableIngredients[i]);
    }
    
    return competitorIngredients.join(', ');
  }

  /**
   * Generate competitor benefits
   */
  generateCompetitorBenefits(originalBenefits) {
    const allBenefits = [
      'Anti-aging', 'Brightening', 'Hydration', 'Firming', 
      'Pore refinement', 'Even skin tone', 'Texture improvement',
      'Antioxidant protection', 'Collagen support'
    ];
    
    const originalList = originalBenefits ? originalBenefits.split(',').map(b => b.trim()) : [];
    const competitorBenefits = [];
    
    // Keep some overlap (30-50%)
    if (originalList.length > 0) {
      const overlapCount = Math.max(1, Math.floor(originalList.length * 0.4));
      for (let i = 0; i < overlapCount; i++) {
        if (originalList[i]) {
          competitorBenefits.push(originalList[i]);
        }
      }
    }
    
    // Add different benefits
    const availableBenefits = allBenefits.filter(benefit => 
      !competitorBenefits.some(comp => comp.toLowerCase().includes(benefit.toLowerCase()))
    );
    
    const additionalCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < additionalCount && i < availableBenefits.length; i++) {
      competitorBenefits.push(availableBenefits[i]);
    }
    
    return competitorBenefits.join(', ');
  }

  /**
   * Generate competitor skin type
   */
  generateCompetitorSkinType(originalSkinType) {
    const skinTypes = [
      'All skin types',
      'Oily, Acne-prone',
      'Dry, Mature',
      'Sensitive, Combination',
      'Normal, Combination'
    ];
    
    // 70% chance to target same skin type, 30% different
    if (originalSkinType && Math.random() > 0.3) {
      return originalSkinType;
    }
    
    return skinTypes[Math.floor(Math.random() * skinTypes.length)];
  }

  /**
   * Generate competitor price
   */
  generateCompetitorPrice(basePrice, modifier) {
    const competitorPrice = Math.round(basePrice * modifier * (0.8 + Math.random() * 0.4));
    return `₹${competitorPrice}`;
  }

  /**
   * Generate competitor usage instructions
   */
  generateCompetitorUsage(originalUsage) {
    const usageOptions = [
      'Apply 2-3 drops twice daily after cleansing',
      'Use 3-4 drops in the evening before moisturizer',
      'Apply thin layer morning and night',
      'Use 2 drops daily, can increase to twice daily',
      'Apply evenly to face and neck once daily'
    ];
    
    return usageOptions[Math.floor(Math.random() * usageOptions.length)];
  }

  /**
   * Generate competitor side effects
   */
  generateCompetitorSideEffects(originalSideEffects) {
    const sideEffectOptions = [
      'Possible mild irritation',
      'May cause initial dryness',
      'Slight tingling sensation possible',
      'Rare allergic reactions',
      'Generally well tolerated'
    ];
    
    return sideEffectOptions[Math.floor(Math.random() * sideEffectOptions.length)];
  }

  /**
   * Ensure meaningful differentiation
   */
  ensureDifferentiation(competitor, original) {
    // Ensure price difference is meaningful (at least 10%)
    const originalPrice = this.extractNumericPrice(original.price);
    const competitorPrice = this.extractNumericPrice(competitor.price);
    
    if (Math.abs(originalPrice - competitorPrice) / originalPrice < 0.1) {
      const adjustment = originalPrice * 0.15 * (Math.random() > 0.5 ? 1 : -1);
      competitor.price = `₹${Math.round(competitorPrice + adjustment)}`;
    }
    
    // Ensure ingredient differentiation
    const originalIngredients = (original.keyIngredients || '').toLowerCase();
    const competitorIngredients = (competitor.keyIngredients || '').toLowerCase();
    
    if (originalIngredients === competitorIngredients) {
      competitor.keyIngredients += ', Peptides';
    }
  }

  /**
   * Validate competitor realism
   */
  validateRealism(competitor, original) {
    const validation = {
      realistic: true,
      issues: [],
      score: 100
    };
    
    // Check price realism (should be within 50% of original)
    const originalPrice = this.extractNumericPrice(original.price);
    const competitorPrice = this.extractNumericPrice(competitor.price);
    const priceDiff = Math.abs(originalPrice - competitorPrice) / originalPrice;
    
    if (priceDiff > 0.5) {
      validation.issues.push('Price difference too extreme');
      validation.score -= 20;
    }
    
    // Check ingredient count (should have 2-4 ingredients)
    const ingredientCount = competitor.keyIngredients.split(',').length;
    if (ingredientCount < 2 || ingredientCount > 4) {
      validation.issues.push('Unrealistic ingredient count');
      validation.score -= 15;
    }
    
    // Check benefit count (should have 2-4 benefits)
    const benefitCount = competitor.benefits.split(',').length;
    if (benefitCount < 2 || benefitCount > 4) {
      validation.issues.push('Unrealistic benefit count');
      validation.score -= 10;
    }
    
    validation.realistic = validation.score >= 70;
    return validation;
  }

  /**
   * Extract numeric price from price string
   */
  extractNumericPrice(priceString) {
    if (!priceString) return 500; // Default price
    const match = priceString.match(/\d+/);
    return match ? parseInt(match[0]) : 500;
  }

  /**
   * Get comparison generation statistics
   */
  getComparisonStats() {
    return {
      agent: this.name,
      competitor_templates: this.competitorTemplates.length,
      generation_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel
    };
  }
}