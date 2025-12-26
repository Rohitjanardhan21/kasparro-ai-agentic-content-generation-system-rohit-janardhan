import { Agent } from '../core/Agent.js';

/**
 * ComparisonDataAgent - creates fictional Product B for comparison
 */
export class ComparisonDataAgent extends Agent {
  constructor() {
    super('ComparisonDataAgent', ['DataParserAgent']);
  }

  async process(input) {
    const originalProduct = input.DataParserAgent.product;
    
    // Generate fictional Product B with similar structure but different attributes
    const comparisonProduct = this.generateComparisonProduct(originalProduct);
    
    return {
      comparison_product: comparisonProduct,
      comparison_type: 'competitive_analysis',
      generated_at: new Date().toISOString()
    };
  }

  generateComparisonProduct(originalProduct) {
    // Create a fictional competing product with different characteristics
    return {
      name: 'RadiantGlow Vitamin C Complex',
      concentration: '15% Vitamin C',
      skinType: 'All skin types, Dry',
      keyIngredients: 'Vitamin C, Vitamin E, Niacinamide',
      benefits: 'Anti-aging, Hydrating, Pore minimizing',
      howToUse: 'Apply 3-4 drops in the evening after cleansing',
      sideEffects: 'May cause initial dryness for some users',
      price: '₹899'
    };
  }

  /**
   * Generate comparison metrics between products
   * @param {Object} productA - Original product
   * @param {Object} productB - Comparison product
   * @returns {Object} - Comparison analysis
   */
  generateComparisonMetrics(productA, productB) {
    const priceA = parseInt(productA.price.replace(/[^\d]/g, ''));
    const priceB = parseInt(productB.price.replace(/[^\d]/g, ''));
    
    return {
      price_difference: priceB - priceA,
      concentration_comparison: {
        product_a: productA.concentration,
        product_b: productB.concentration,
        higher_concentration: productB.concentration.includes('15%') ? 'product_b' : 'product_a'
      },
      target_skin_overlap: this.calculateSkinTypeOverlap(productA.skinType, productB.skinType),
      ingredient_analysis: this.analyzeIngredients(productA.keyIngredients, productB.keyIngredients)
    };
  }

  calculateSkinTypeOverlap(skinTypeA, skinTypeB) {
    const typesA = skinTypeA.split(',').map(t => t.trim().toLowerCase());
    const typesB = skinTypeB.split(',').map(t => t.trim().toLowerCase());
    const overlap = typesA.filter(type => typesB.includes(type));
    return overlap.length / Math.max(typesA.length, typesB.length);
  }

  analyzeIngredients(ingredientsA, ingredientsB) {
    const listA = ingredientsA.split(',').map(i => i.trim().toLowerCase());
    const listB = ingredientsB.split(',').map(i => i.trim().toLowerCase());
    const common = listA.filter(ing => listB.includes(ing));
    
    return {
      common_ingredients: common,
      unique_to_a: listA.filter(ing => !listB.includes(ing)),
      unique_to_b: listB.filter(ing => !listA.includes(ing)),
      similarity_score: common.length / Math.max(listA.length, listB.length)
    };
  }
}