import { Agent } from '../core/Agent.js';

/**
 * FaqPageAgent - generates FAQ page using templates and content blocks
 */
export class FaqPageAgent extends Agent {
  constructor(templateEngine) {
    super('FaqPageAgent', ['DataParserAgent', 'QuestionGeneratorAgent']);
    this.templateEngine = templateEngine;
  }

  async process(input) {
    const productData = input.DataParserAgent;
    const questionsData = input.QuestionGeneratorAgent;
    
    // Prepare data for template rendering
    const templateData = {
      product: productData.product,
      questions: questionsData.questions,
      metadata: {
        page_type: 'faq',
        generated_at: new Date().toISOString(),
        total_questions: questionsData.total_count
      }
    };

    // Render FAQ page using template
    const faqPage = this.templateEngine.render('faq_page', templateData);
    
    return {
      page_type: 'faq',
      content: faqPage,
      metadata: {
        questions_included: faqPage.faqs?.length || 0,
        categories_covered: [...new Set(faqPage.faqs?.map(q => q.category) || [])],
        generated_at: new Date().toISOString()
      }
    };
  }
}