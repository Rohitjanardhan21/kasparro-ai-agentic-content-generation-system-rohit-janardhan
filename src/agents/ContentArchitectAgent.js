import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * ContentArchitectAgent - Autonomously decides what content to create and coordinates with other agents
 */
export class ContentArchitectAgent extends AutonomousAgent {
  constructor() {
    super('content_architect', ['content_planning', 'coordination', 'template_management']);
  }

  initialize() {
    this.subscriptions = ['questions_ready', 'content_request'];
    this.goals = [
      { 
        name: 'plan_content_strategy', 
        priority: 3,
        requires: ['product_analysis', 'question_bank']
      },
      {
        name: 'coordinate_content_creation',
        priority: 4,
        requires: ['content_strategy']
      }
    ];
    this.contentPlan = null;
    this.activeRequests = new Map();
  }

  async onCustomEvent(event) {
    if (event.type === 'questions_ready') {
      console.log(`ContentArchitect: Questions available, planning content strategy`);
      this.state = 'idle'; // Ready to work on planning
    }
  }

  async canAchieveGoal(goal) {
    if (goal.name === 'plan_content_strategy') {
      const analysis = this.getSharedData('product_analysis');
      const questions = this.getSharedData('question_bank');
      return analysis && questions && questions.length >= 15;
    } else if (goal.name === 'coordinate_content_creation') {
      return this.contentPlan !== null;
    }
    return false;
  }

  async startWork(goal) {
    if (goal.name === 'plan_content_strategy') {
      console.log(`ContentArchitect: Analyzing requirements and planning content strategy`);
    } else if (goal.name === 'coordinate_content_creation') {
      console.log(`ContentArchitect: Beginning content creation coordination`);
    }
  }

  async workOnGoal(goal) {
    if (goal.name === 'plan_content_strategy') {
      const analysis = this.getSharedData('product_analysis');
      const questions = this.getSharedData('question_bank');
      
      // Agent autonomously decides content strategy
      this.contentPlan = await this.createContentStrategy(analysis, questions);
      this.setSharedData('content_strategy', this.contentPlan);
      
      console.log(`ContentArchitect: Strategy complete - planning ${this.contentPlan.pages.length} pages`);
      this.results = this.contentPlan;
      return true;
      
    } else if (goal.name === 'coordinate_content_creation') {
      // Agent coordinates with specialist agents to create content
      await this.coordinateContentCreation();
      return true;
    }
    
    return false;
  }

  async createContentStrategy(analysis, questions) {
    // Agent makes strategic decisions about content creation
    const strategy = {
      pages: [
        {
          type: 'faq',
          priority: 1,
          requirements: {
            questions: 5,
            categories: ['informational', 'safety', 'usage'],
            difficulty: 'basic'
          }
        },
        {
          type: 'product',
          priority: 2,
          requirements: {
            sections: ['overview', 'benefits', 'usage', 'safety', 'pricing'],
            detail_level: 'comprehensive'
          }
        },
        {
          type: 'comparison',
          priority: 3,
          requirements: {
            comparison_product: 'generate_fictional',
            focus_areas: ['ingredients', 'benefits', 'pricing']
          }
        }
      ],
      coordination: {
        parallel_creation: true,
        quality_checks: true,
        cross_references: true
      },
      timeline: {
        estimated_duration: '30_seconds',
        dependencies_mapped: true
      }
    };

    // Agent decides if additional pages are needed based on analysis
    if (analysis.insights.complexity_score > 7) {
      strategy.pages.push({
        type: 'detailed_guide',
        priority: 4,
        requirements: {
          sections: ['advanced_usage', 'ingredient_science', 'troubleshooting']
        }
      });
    }

    return strategy;
  }

  async coordinateContentCreation() {
    // Agent coordinates with specialist content creators
    const creationPromises = [];
    
    for (const page of this.contentPlan.pages) {
      if (page.type === 'faq') {
        creationPromises.push(this.requestFAQCreation(page));
      } else if (page.type === 'product') {
        creationPromises.push(this.requestProductPageCreation(page));
      } else if (page.type === 'comparison') {
        creationPromises.push(this.requestComparisonCreation(page));
      }
    }

    // Wait for all content creation to complete
    const results = await Promise.all(creationPromises);
    
    // Agent compiles final results
    const finalContent = {};
    results.forEach((result, index) => {
      const pageType = this.contentPlan.pages[index].type;
      finalContent[pageType] = result;
    });

    this.setSharedData('final_content', finalContent);
    this.broadcast('content_creation_complete', {
      agent: this.id,
      pages_created: Object.keys(finalContent).length
    });

    console.log(`ContentArchitect: Content creation coordination complete`);
  }

  async requestFAQCreation(pageSpec) {
    return new Promise((resolve) => {
      const requestId = `faq_${Date.now()}`;
      this.activeRequests.set(requestId, { resolve, type: 'faq' });
      
      // Request questions from QuestionMaster
      this.broadcast('content_request', {
        type: 'faq_questions',
        requester: this.id,
        requestId: requestId,
        criteria: pageSpec.requirements
      });
      
      // Simulate FAQ creation (in real system, would coordinate with FAQ specialist)
      setTimeout(() => {
        const analysis = this.getSharedData('product_analysis');
        const questions = this.getSharedData('question_bank');
        
        const faqContent = this.createFAQContent(analysis, questions, pageSpec.requirements);
        resolve(faqContent);
      }, 1000);
    });
  }

  async requestProductPageCreation(pageSpec) {
    // Agent creates product page by coordinating data
    const analysis = this.getSharedData('product_analysis');
    
    return {
      page_type: 'product',
      content: {
        product_info: {
          title: analysis.product.name,
          concentration: analysis.product.concentration,
          description: `Premium skincare solution for ${analysis.product.skinType.join(', ')} skin`
        },
        specifications: {
          concentration: analysis.product.concentration,
          skin_types: analysis.product.skinType,
          key_ingredients: analysis.product.keyIngredients,
          product_category: 'skincare_serum'
        },
        benefits: {
          primary_benefits: analysis.product.benefits,
          formatted_benefits: analysis.product.benefits.map(benefit => ({
            name: benefit,
            description: `Experience ${benefit.toLowerCase()} with regular use`
          }))
        },
        usage: {
          instructions: analysis.product.howToUse,
          application_frequency: analysis.product.howToUse.toLowerCase().includes('morning') ? 'daily_morning' : 'as_needed'
        },
        safety: {
          side_effects: analysis.product.sideEffects,
          safety_level: analysis.insights.safety_level,
          precautions: ['Patch test before first use', 'Discontinue if irritation occurs']
        },
        pricing: {
          price: analysis.product.price.original,
          numeric_price: analysis.product.price.numeric,
          price_category: analysis.insights.price_category
        }
      },
      metadata: {
        generated_at: new Date().toISOString(),
        generator: this.id
      }
    };
  }

  async requestComparisonCreation(pageSpec) {
    // Agent creates comparison by generating fictional competitor
    const analysis = this.getSharedData('product_analysis');
    const originalProduct = analysis.product;
    
    // Generate fictional competitor
    const competitorProduct = {
      name: 'RadiantGlow Vitamin C Complex',
      concentration: '15% Vitamin C',
      skinType: ['All skin types', 'Dry'],
      keyIngredients: ['Vitamin C', 'Vitamin E', 'Niacinamide'],
      benefits: ['Anti-aging', 'Hydrating', 'Pore minimizing'],
      price: { original: '₹899', numeric: 899 }
    };

    return {
      page_type: 'comparison',
      content: {
        comparison_info: {
          title: `Product Comparison: ${originalProduct.name} vs ${competitorProduct.name}`,
          type: 'side_by_side_comparison'
        },
        product_a: {
          name: originalProduct.name,
          concentration: originalProduct.concentration,
          price: originalProduct.price.original,
          ingredients: originalProduct.keyIngredients.join(', '),
          benefits: originalProduct.benefits.join(', ')
        },
        product_b: {
          name: competitorProduct.name,
          concentration: competitorProduct.concentration,
          price: competitorProduct.price.original,
          ingredients: competitorProduct.keyIngredients.join(', '),
          benefits: competitorProduct.benefits.join(', ')
        },
        analysis: {
          common_ingredients: this.findCommonIngredients(originalProduct.keyIngredients, competitorProduct.keyIngredients),
          price_difference: competitorProduct.price.numeric - originalProduct.price.numeric,
          recommendation: 'Choose based on your specific skin type and ingredient preferences'
        }
      },
      metadata: {
        generated_at: new Date().toISOString(),
        generator: this.id
      }
    };
  }

  createFAQContent(analysis, questions, requirements) {
    // Agent selects best questions for FAQ
    let selectedQuestions = questions.filter(q => 
      requirements.categories.includes(q.category) &&
      q.difficulty === requirements.difficulty
    ).slice(0, requirements.questions);

    // If not enough questions, add more
    if (selectedQuestions.length < requirements.questions) {
      const additional = questions.filter(q => 
        !selectedQuestions.includes(q)
      ).slice(0, requirements.questions - selectedQuestions.length);
      selectedQuestions = [...selectedQuestions, ...additional];
    }

    return {
      page_type: 'faq',
      content: {
        page_info: {
          title: `${analysis.product.name} - Frequently Asked Questions`,
          type: 'faq'
        },
        faqs: selectedQuestions.map(q => ({
          question: q.question,
          answer: q.answer,
          category: q.category
        })),
        product_overview: {
          name: analysis.product.name,
          concentration: analysis.product.concentration,
          key_benefits: analysis.product.benefits.join(', ')
        }
      },
      metadata: {
        questions_included: selectedQuestions.length,
        categories_covered: [...new Set(selectedQuestions.map(q => q.category))],
        generated_at: new Date().toISOString(),
        generator: this.id
      }
    };
  }

  findCommonIngredients(ingredientsA, ingredientsB) {
    return ingredientsA.filter(ing => 
      ingredientsB.some(ingB => ingB.toLowerCase().includes(ing.toLowerCase()))
    );
  }

  async processMessage(message) {
    if (message.type === 'question_response') {
      // Handle response from QuestionMaster
      const request = this.activeRequests.get(message.payload.requestId);
      if (request) {
        request.resolve(message.payload.questions);
        this.activeRequests.delete(message.payload.requestId);
      }
    }
  }
}