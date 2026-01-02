import { BaseAgent } from './BaseAgent.js';
import { TemplateEngine } from '../templates/TemplateEngine.js';
import { PRODUCT_PAGE_TEMPLATE } from '../templates/Templates.js';
import * as ContentBlocks from '../blocks/ContentBlocks.js';

/**
 * ProductPageAgent - Generates product pages using template engine
 * 
 * Responsibilities:
 * - Process product page template
 * - Generate comprehensive product information
 * - Create detailed specifications
 * - Ensure content completeness
 */
export class ProductPageAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'product_page_001',
      name: 'ProductPageAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.1
    });

    this.templateEngine = new TemplateEngine();
    this.setupTemplateEngine();
    
    this.addGoal('generate_product_page');
    this.addGoal('ensure_comprehensive_content');
  }

  /**
   * Setup template engine with content blocks
   */
  setupTemplateEngine() {
    // Register product page template
    this.templateEngine.registerTemplate('product_page', PRODUCT_PAGE_TEMPLATE);
    
    // Register content blocks
    this.templateEngine.registerContentBlock('generateOverview', ContentBlocks.generateOverview);
    this.templateEngine.registerContentBlock('generateBenefits', ContentBlocks.generateBenefits);
    this.templateEngine.registerContentBlock('generateIngredients', ContentBlocks.generateIngredients);
    this.templateEngine.registerContentBlock('generateUsage', ContentBlocks.generateUsage);
    this.templateEngine.registerContentBlock('generateSafety', ContentBlocks.generateSafety);
    this.templateEngine.registerContentBlock('generateSpecs', ContentBlocks.generateSpecs);
    this.templateEngine.registerContentBlock('generatePricing', ContentBlocks.generatePricing);
    
    // Register field processors
    this.templateEngine.registerFieldProcessor('timestamp', () => new Date().toISOString());
    
    console.log(`🔧 [${this.name}] Template engine configured`);
  }

  /**
   * Generate product page content
   */
  async generateProductPage(productData) {
    console.log(`📄 [${this.name}] Generating product page...`);
    
    try {
      // Prepare context
      const context = {
        agent: this.name,
        generated_at: new Date().toISOString(),
        page_type: 'product_specification'
      };

      // Process template
      const productContent = await this.templateEngine.processTemplate('product_page', productData, context);
      
      // Enhance with additional features
      this.enhanceProductContent(productContent, productData);
      
      // Add generation metadata
      productContent.generation_info = {
        agent: this.name,
        template_used: 'PRODUCT_PAGE_TEMPLATE',
        processing_time: Date.now(),
        autonomy_level: this.autonomyLevel
      };

      // Validate content quality
      const validation = this.validateProductContent(productContent);
      productContent.validation = validation;

      console.log(`✅ [${this.name}] Product page generated with ${Object.keys(productContent.sections || {}).length} sections`);
      
      return productContent;
      
    } catch (error) {
      console.error(`❌ [${this.name}] Product page generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enhance product content with additional features
   */
  enhanceProductContent(productContent, productData) {
    // Add benefit timelines
    if (productContent.sections?.benefits?.content?.detailed_analysis) {
      productContent.sections.benefits.content.detailed_analysis = 
        productContent.sections.benefits.content.detailed_analysis.map(benefit => ({
          ...benefit,
          timeline: this.generateBenefitTimeline(benefit.benefit),
          evidence_level: this.assessEvidenceLevel(benefit.benefit),
          user_rating: this.generateUserRating()
        }));
    }

    // Add usage importance levels
    if (productContent.sections?.usage?.content?.application_tips) {
      productContent.sections.usage.content.application_tips = 
        productContent.sections.usage.content.application_tips.map(tip => ({
          instruction: tip,
          importance: this.assessInstructionImportance(tip),
          difficulty: this.assessInstructionDifficulty(tip)
        }));
    }

    // Add ingredient synergy analysis
    if (productContent.sections?.ingredients?.content?.ingredient_profiles) {
      productContent.sections.ingredients.content.synergy_analysis = 
        this.analyzeSynergy(productContent.sections.ingredients.content.ingredient_profiles);
    }

    // Add storage requirements
    if (productContent.specifications) {
      productContent.specifications.storage_requirements = this.generateStorageRequirements(productData);
      productContent.specifications.shelf_life = this.estimateShelfLife(productData);
      productContent.specifications.packaging_info = this.generatePackagingInfo(productData);
    }

    return productContent;
  }

  /**
   * Generate benefit timeline
   */
  generateBenefitTimeline(benefit) {
    const timelines = {
      'brightening': '2-4 weeks for visible improvement',
      'hydration': 'Immediate to 1 week',
      'anti-aging': '4-8 weeks for noticeable results',
      'firming': '6-12 weeks for visible firming',
      'texture improvement': '2-6 weeks',
      'pore refinement': '3-6 weeks'
    };

    const benefitLower = benefit.toLowerCase();
    for (const [key, timeline] of Object.entries(timelines)) {
      if (benefitLower.includes(key)) {
        return timeline;
      }
    }

    return '2-4 weeks with consistent use';
  }

  /**
   * Assess evidence level for benefit claims
   */
  assessEvidenceLevel(benefit) {
    const evidenceLevels = {
      'brightening': 'clinical studies',
      'hydration': 'proven ingredients',
      'anti-aging': 'research backed',
      'firming': 'user studies',
      'texture improvement': 'dermatologist tested'
    };

    const benefitLower = benefit.toLowerCase();
    for (const [key, evidence] of Object.entries(evidenceLevels)) {
      if (benefitLower.includes(key)) {
        return evidence;
      }
    }

    return 'ingredient research';
  }

  /**
   * Generate user rating
   */
  generateUserRating() {
    return {
      score: (4.0 + Math.random() * 1.0).toFixed(1),
      total_reviews: Math.floor(Math.random() * 500) + 100,
      satisfaction_rate: Math.floor(85 + Math.random() * 10) + '%'
    };
  }

  /**
   * Assess instruction importance
   */
  assessInstructionImportance(instruction) {
    const instructionLower = instruction.toLowerCase();
    
    if (instructionLower.includes('cleanse') || instructionLower.includes('clean')) {
      return 'critical';
    }
    
    if (instructionLower.includes('sunscreen') || instructionLower.includes('patch test')) {
      return 'essential';
    }
    
    if (instructionLower.includes('apply') || instructionLower.includes('use')) {
      return 'important';
    }
    
    return 'recommended';
  }

  /**
   * Assess instruction difficulty
   */
  assessInstructionDifficulty(instruction) {
    const instructionLower = instruction.toLowerCase();
    
    if (instructionLower.includes('patch test') || instructionLower.includes('consult')) {
      return 'moderate';
    }
    
    if (instructionLower.includes('apply') || instructionLower.includes('cleanse')) {
      return 'easy';
    }
    
    return 'easy';
  }

  /**
   * Analyze ingredient synergy
   */
  analyzeSynergy(ingredientProfiles) {
    const synergies = [];
    
    // Check for known synergistic combinations
    const ingredients = ingredientProfiles.map(p => p.name.toLowerCase());
    
    if (ingredients.includes('vitamin c') && ingredients.includes('hyaluronic acid')) {
      synergies.push({
        combination: 'Vitamin C + Hyaluronic Acid',
        effect: 'Enhanced absorption and hydration',
        synergy_score: 85
      });
    }
    
    if (ingredients.includes('niacinamide') && ingredients.includes('hyaluronic acid')) {
      synergies.push({
        combination: 'Niacinamide + Hyaluronic Acid',
        effect: 'Improved barrier function and moisture retention',
        synergy_score: 80
      });
    }
    
    return {
      identified_synergies: synergies,
      overall_compatibility: synergies.length > 0 ? 'excellent' : 'good',
      formulation_stability: 'stable under normal conditions'
    };
  }

  /**
   * Generate storage requirements
   */
  generateStorageRequirements(productData) {
    const requirements = [
      'Store in a cool, dry place',
      'Keep away from direct sunlight',
      'Temperature: 15-25°C (59-77°F)',
      'Avoid extreme temperatures'
    ];

    // Add specific requirements based on ingredients
    if (productData.keyIngredients?.toLowerCase().includes('vitamin c')) {
      requirements.push('Protect from light to maintain potency');
      requirements.push('Refrigeration may extend shelf life');
    }

    if (productData.keyIngredients?.toLowerCase().includes('retinol')) {
      requirements.push('Store in original packaging');
      requirements.push('Keep tightly sealed when not in use');
    }

    return requirements;
  }

  /**
   * Estimate shelf life
   */
  estimateShelfLife(productData) {
    let shelfLife = '24 months unopened, 12 months after opening';
    
    if (productData.keyIngredients?.toLowerCase().includes('vitamin c')) {
      shelfLife = '18 months unopened, 6-9 months after opening';
    }
    
    if (productData.keyIngredients?.toLowerCase().includes('retinol')) {
      shelfLife = '24 months unopened, 6 months after opening';
    }
    
    return {
      unopened: shelfLife.split(',')[0],
      opened: shelfLife.split(',')[1]?.trim() || '12 months after opening',
      factors: [
        'Storage conditions affect longevity',
        'Check for changes in color, texture, or smell',
        'Use within recommended timeframe for best results'
      ]
    };
  }

  /**
   * Generate packaging information
   */
  generatePackagingInfo(productData) {
    return {
      container_type: 'Dark glass bottle with dropper',
      size_options: ['15ml', '30ml', '50ml'],
      packaging_features: [
        'UV-protective glass',
        'Precision dropper for accurate dosing',
        'Tamper-evident seal',
        'Recyclable materials'
      ],
      sustainability: {
        recyclable: true,
        eco_friendly_materials: 'Glass and minimal plastic components',
        carbon_footprint: 'Optimized packaging design'
      }
    };
  }

  /**
   * Validate product content quality
   */
  validateProductContent(content) {
    const validation = {
      valid: true,
      issues: [],
      quality_score: 100,
      completeness: {}
    };

    // Check required sections
    const requiredSections = ['overview', 'benefits', 'ingredients', 'usage', 'safety'];
    const missingSections = requiredSections.filter(section => 
      !content.sections || !content.sections[section]
    );

    if (missingSections.length > 0) {
      validation.issues.push(`Missing sections: ${missingSections.join(', ')}`);
      validation.quality_score -= missingSections.length * 15;
    }

    // Check specifications
    if (!content.specifications) {
      validation.issues.push('Missing product specifications');
      validation.quality_score -= 20;
    }

    // Check pricing information
    if (!content.pricing) {
      validation.issues.push('Missing pricing information');
      validation.quality_score -= 10;
    }

    // Validate content depth
    validation.completeness = this.assessContentDepth(content);
    
    if (validation.completeness.average_depth < 70) {
      validation.issues.push('Content lacks sufficient detail');
      validation.quality_score -= 15;
    }

    validation.valid = validation.quality_score >= 70;
    return validation;
  }

  /**
   * Assess content depth
   */
  assessContentDepth(content) {
    const sectionDepths = {};
    let totalDepth = 0;
    let sectionCount = 0;

    if (content.sections) {
      for (const [sectionName, section] of Object.entries(content.sections)) {
        const depth = this.calculateSectionDepth(section);
        sectionDepths[sectionName] = depth;
        totalDepth += depth;
        sectionCount++;
      }
    }

    return {
      section_depths: sectionDepths,
      average_depth: sectionCount > 0 ? Math.round(totalDepth / sectionCount) : 0,
      total_sections: sectionCount
    };
  }

  /**
   * Calculate section depth score
   */
  calculateSectionDepth(section) {
    let depth = 0;

    if (section.title) depth += 10;
    if (section.content) {
      if (typeof section.content === 'string') {
        depth += Math.min(30, section.content.length / 10);
      } else if (typeof section.content === 'object') {
        const contentStr = JSON.stringify(section.content);
        depth += Math.min(50, contentStr.length / 20);
        
        // Bonus for structured content
        if (Array.isArray(section.content) || Object.keys(section.content).length > 2) {
          depth += 20;
        }
      }
    }

    return Math.min(100, depth);
  }

  /**
   * Get product page generation statistics
   */
  getProductPageStats() {
    return {
      agent: this.name,
      template_engine: this.templateEngine.getInfo(),
      generation_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel,
      required_sections: ['overview', 'benefits', 'ingredients', 'usage', 'safety']
    };
  }
}