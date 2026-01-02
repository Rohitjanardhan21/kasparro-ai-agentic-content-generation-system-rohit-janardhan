import { BaseAgent } from './BaseAgent.js';

/**
 * DataParserAgent - Validates and normalizes product data
 * 
 * Responsibilities:
 * - Parse raw product data
 * - Validate required fields
 * - Normalize data formats
 * - Clean and structure data
 */
export class DataParserAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'data_parser_001',
      name: 'DataParserAgent',
      autonomyLevel: config.autonomyLevel || 0.7,
      adaptabilityLevel: config.adaptabilityLevel || 0.6,
      learningRate: config.learningRate || 0.1
    });

    this.requiredFields = [
      'productName',
      'concentration', 
      'skinType',
      'keyIngredients',
      'benefits',
      'howToUse',
      'sideEffects',
      'price'
    ];

    this.addGoal('parse_product_data');
    this.addGoal('validate_data_quality');
  }

  /**
   * Parse and validate product data
   */
  async parseProductData(rawData) {
    console.log(`🔍 [${this.name}] Parsing product data...`);
    
    const parsedData = {
      ...rawData,
      timestamp: new Date().toISOString(),
      parsed_at: Date.now()
    };

    // Validate required fields
    const validation = this.validateData(parsedData);
    parsedData.validation = validation;

    // Normalize data
    this.normalizeData(parsedData);

    // Assess data quality
    parsedData.quality_score = this.assessDataQuality(parsedData);

    console.log(`✅ [${this.name}] Data parsed successfully - Quality: ${parsedData.quality_score}/100`);
    
    return parsedData;
  }

  /**
   * Validate data against requirements
   */
  validateData(data) {
    const validation = {
      valid: true,
      missing_fields: [],
      warnings: [],
      errors: []
    };

    // Check required fields
    for (const field of this.requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        validation.missing_fields.push(field);
        validation.valid = false;
      }
    }

    // Validate specific field formats
    if (data.price && !data.price.toString().match(/[₹$€£¥]/)) {
      validation.warnings.push('Price should include currency symbol');
    }

    if (data.concentration && !data.concentration.toString().match(/\d+%/)) {
      validation.warnings.push('Concentration should include percentage');
    }

    return validation;
  }

  /**
   * Normalize data formats
   */
  normalizeData(data) {
    // Normalize product name
    if (data.productName) {
      data.productName = data.productName.toString().trim();
    }

    // Normalize ingredients list
    if (data.keyIngredients) {
      data.keyIngredients = data.keyIngredients.toString()
        .split(',')
        .map(ingredient => ingredient.trim())
        .join(', ');
    }

    // Normalize benefits
    if (data.benefits) {
      data.benefits = data.benefits.toString()
        .split(',')
        .map(benefit => benefit.trim())
        .join(', ');
    }

    // Normalize skin type
    if (data.skinType) {
      data.skinType = data.skinType.toString()
        .split(',')
        .map(type => type.trim())
        .join(', ');
    }
  }

  /**
   * Assess overall data quality
   */
  assessDataQuality(data) {
    let score = 0;
    const maxScore = 100;

    // Required fields present (60 points)
    const presentFields = this.requiredFields.filter(field => 
      data[field] && data[field].toString().trim() !== ''
    );
    score += (presentFields.length / this.requiredFields.length) * 60;

    // Data richness (20 points)
    const avgFieldLength = presentFields.reduce((sum, field) => 
      sum + data[field].toString().length, 0
    ) / presentFields.length;
    score += Math.min(20, (avgFieldLength / 20) * 20);

    // Format compliance (20 points)
    let formatScore = 0;
    if (data.price && data.price.toString().match(/[₹$€£¥]/)) formatScore += 5;
    if (data.concentration && data.concentration.toString().match(/\d+%/)) formatScore += 5;
    if (data.keyIngredients && data.keyIngredients.toString().includes(',')) formatScore += 5;
    if (data.benefits && data.benefits.toString().includes(',')) formatScore += 5;
    score += formatScore;

    return Math.round(score);
  }

  /**
   * Get parsing statistics
   */
  getParsingStats() {
    return {
      agent: this.name,
      required_fields: this.requiredFields.length,
      parsing_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel,
      quality_threshold: 70
    };
  }
}