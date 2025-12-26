import { Agent } from '../core/Agent.js';

/**
 * DataParserAgent - converts raw product data into clean internal model
 */
export class DataParserAgent extends Agent {
  constructor() {
    super('DataParserAgent', []);
  }

  async process(input) {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input data');
    }

    // Parse and clean the product data
    const cleanedData = {
      product: {
        name: this.cleanString(input.productName),
        concentration: this.cleanString(input.concentration),
        skinType: this.cleanString(input.skinType),
        keyIngredients: this.cleanString(input.keyIngredients),
        benefits: this.cleanString(input.benefits),
        howToUse: this.cleanString(input.howToUse),
        sideEffects: this.cleanString(input.sideEffects),
        price: this.cleanString(input.price)
      },
      metadata: {
        parsed_at: new Date().toISOString(),
        data_version: '1.0',
        source: 'manual_input'
      }
    };

    // Validate required fields
    this.validateProductData(cleanedData.product);

    return cleanedData;
  }

  /**
   * Clean and normalize string data
   * @param {string} str - String to clean
   * @returns {string} - Cleaned string
   */
  cleanString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate product data completeness
   * @param {Object} product - Product data to validate
   */
  validateProductData(product) {
    const requiredFields = ['name', 'concentration', 'skinType', 'keyIngredients', 'benefits'];
    const missingFields = requiredFields.filter(field => !product[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  validateInput(input) {
    return input && typeof input === 'object' && input.productName;
  }
}