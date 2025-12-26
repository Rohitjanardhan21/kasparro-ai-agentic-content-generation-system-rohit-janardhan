import { Agent } from '../core/Agent.js';

/**
 * ComparisonPageAgent - generates comparison page between products
 */
export class ComparisonPageAgent extends Agent {
  constructor(templateEngine) {
    super('ComparisonPageAgent', ['DataParserAgent', 'ComparisonDataAgent']);
    this.templateEngine = templateEngine;
  }

  async process(input) {
    const productData = input.DataParserAgent;
    const comparisonData = input.ComparisonDataAgent;
    
    // Prepare data for comparison template
    const templateData = {
      product: productData.product,
      comparison_product: comparisonData.comparison_product,
      metadata: {
        comparison_type: comparisonData.comparison_type,
        generated_at: new Date().toISOString()
      }
    };

    // Render comparison page using template
    const comparisonPage = this.templateEngine.render('comparison_page', templateData);
    
    return {
      page_type: 'comparison',
      content: comparisonPage,
      metadata: {
        products_compared: 2,
        comparison_categories: ['ingredients', 'pricing', 'benefits', 'usage'],
        generated_at: new Date().toISOString()
      }
    };
  }
}