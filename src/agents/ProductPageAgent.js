import { Agent } from '../core/Agent.js';

/**
 * ProductPageAgent - generates product description page
 */
export class ProductPageAgent extends Agent {
  constructor(templateEngine) {
    super('ProductPageAgent', ['DataParserAgent']);
    this.templateEngine = templateEngine;
  }

  async process(input) {
    const productData = input.DataParserAgent;
    
    // Prepare comprehensive product data for template
    const templateData = {
      product: productData.product,
      metadata: productData.metadata
    };

    // Render product page using template
    const productPage = this.templateEngine.render('product_page', templateData);
    
    return {
      page_type: 'product',
      content: productPage,
      metadata: {
        product_name: productData.product.name,
        generated_at: new Date().toISOString(),
        includes_specifications: true,
        includes_usage_instructions: true,
        includes_safety_info: true
      }
    };
  }
}