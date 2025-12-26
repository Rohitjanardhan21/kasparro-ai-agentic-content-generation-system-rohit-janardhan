import { Agent } from '../core/Agent.js';

/**
 * QuestionGeneratorAgent - generates categorized user questions from product data
 */
export class QuestionGeneratorAgent extends Agent {
  constructor() {
    super('QuestionGeneratorAgent', ['DataParserAgent']);
  }

  async process(input) {
    const productData = input.DataParserAgent.product;
    
    const questions = [
      // Informational Questions
      ...this.generateInformationalQuestions(productData),
      // Safety Questions
      ...this.generateSafetyQuestions(productData),
      // Usage Questions
      ...this.generateUsageQuestions(productData),
      // Purchase Questions
      ...this.generatePurchaseQuestions(productData),
      // Comparison Questions
      ...this.generateComparisonQuestions(productData)
    ];

    return {
      questions: questions,
      categories: this.getCategories(),
      total_count: questions.length
    };
  }

  generateInformationalQuestions(product) {
    return [
      {
        category: 'informational',
        question: `What is ${product.name}?`,
        answer: `${product.name} is a skincare serum with ${product.concentration} designed for ${product.skinType.toLowerCase()} skin types.`
      },
      {
        category: 'informational',
        question: 'What are the key ingredients?',
        answer: `The key ingredients are ${product.keyIngredients}.`
      },
      {
        category: 'informational',
        question: 'What benefits can I expect?',
        answer: `You can expect ${product.benefits.toLowerCase()} with regular use.`
      }
    ];
  }

  generateSafetyQuestions(product) {
    return [
      {
        category: 'safety',
        question: 'Are there any side effects?',
        answer: product.sideEffects || 'No known side effects when used as directed.'
      },
      {
        category: 'safety',
        question: 'Is this suitable for sensitive skin?',
        answer: product.sideEffects.toLowerCase().includes('sensitive') 
          ? 'May cause mild reactions in sensitive skin. Patch test recommended.'
          : 'Generally suitable for most skin types including sensitive skin.'
      },
      {
        category: 'safety',
        question: 'Can I use this with other skincare products?',
        answer: 'Consider your skin sensitivity as this product may cause mild tingling for sensitive skin.'
      }
    ];
  }

  generateUsageQuestions(product) {
    return [
      {
        category: 'usage',
        question: 'How do I use this product?',
        answer: product.howToUse
      },
      {
        category: 'usage',
        question: 'When should I apply this serum?',
        answer: product.howToUse.toLowerCase().includes('morning') 
          ? 'Apply in the morning before sunscreen.'
          : 'Follow the specific instructions provided with the product.'
      },
      {
        category: 'usage',
        question: 'How long before I see results?',
        answer: 'Results typically become visible after 4-6 weeks of consistent use.'
      }
    ];
  }

  generatePurchaseQuestions(product) {
    return [
      {
        category: 'purchase',
        question: 'What is the price?',
        answer: `${product.name} is priced at ${product.price}.`
      },
      {
        category: 'purchase',
        question: 'Is this good value for money?',
        answer: `At ${product.price}, this serum offers good value with its ${product.concentration} and quality ingredients like ${product.keyIngredients}.`
      },
      {
        category: 'purchase',
        question: 'Where can I buy this product?',
        answer: 'Available through authorized retailers and online platforms.'
      },
      {
        category: 'purchase',
        question: 'Are there any discounts available?',
        answer: 'Check with authorized retailers for current promotions and bundle offers.'
      },
      {
        category: 'purchase',
        question: 'What is the shelf life?',
        answer: 'Typically 12-24 months when stored properly in a cool, dry place.'
      }
    ];
  }

  generateComparisonQuestions(product) {
    return [
      {
        category: 'comparison',
        question: 'How does this compare to other Vitamin C serums?',
        answer: `This serum stands out with its ${product.concentration} and additional ingredients like ${product.keyIngredients}.`
      },
      {
        category: 'comparison',
        question: 'Why choose this over other brands?',
        answer: `The combination of ${product.benefits.toLowerCase()} and suitability for ${product.skinType.toLowerCase()} skin makes it a targeted choice.`
      },
      {
        category: 'comparison',
        question: 'Is this more effective than lower concentration serums?',
        answer: `The ${product.concentration} provides an optimal balance of effectiveness and gentleness for daily use.`
      },
      {
        category: 'comparison',
        question: 'How does the price compare to similar products?',
        answer: `At ${product.price}, this offers competitive pricing for a ${product.concentration} serum with quality ingredients.`
      }
    ];
  }

  getCategories() {
    return ['informational', 'safety', 'usage', 'purchase', 'comparison'];
  }
}