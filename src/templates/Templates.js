/**
 * Templates - Defines reusable templates for content generation
 * 
 * Each template includes:
 * 1. Structure definition
 * 2. Field mappings
 * 3. Content block configurations
 * 4. Variable interpolation rules
 */

export const FAQ_TEMPLATE = {
  name: 'faq_page',
  description: 'FAQ page template with categorized questions',
  structure: {
    title: 'Frequently Asked Questions - {{productName}}',
    description: 'Common questions and answers about {{productName}}',
    metadata: {
      generatedAt: new Date().toISOString(),
      templateVersion: '1.0'
    },
    questions: {
      type: 'block',
      block: 'generateFaqQuestions',
      params: {
        minQuestions: 15,
        categories: ['informational', 'safety', 'usage', 'purchase', 'comparison']
      }
    },
    summary: {
      type: 'block',
      block: 'generateFaqSummary'
    }
  },
  fieldMappings: {
    productName: 'productName',
    productPrice: 'price',
    keyIngredients: 'keyIngredients'
  },
  contentBlocks: {
    categories: 'extractQuestionCategories',
    totalQuestions: 'countQuestions'
  }
};

export const PRODUCT_PAGE_TEMPLATE = {
  name: 'product_page',
  description: 'Comprehensive product page template',
  structure: {
    title: '{{productName}} - Product Information',
    productOverview: {
      type: 'block',
      block: 'generateProductOverview'
    },
    sections: {
      benefits: {
        type: 'block',
        block: 'generateBenefitsSection'
      },
      usage: {
        type: 'block',
        block: 'generateUsageSection'
      },
      ingredients: {
        type: 'block',
        block: 'generateIngredientsSection'
      },
      safety: {
        type: 'block',
        block: 'generateSafetySection'
      },
      pricing: {
        type: 'block',
        block: 'generatePricingSection'
      }
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      templateVersion: '1.0'
    }
  },
  fieldMappings: {
    productName: 'productName',
    concentration: 'concentration',
    skinType: 'skinType',
    price: 'price'
  },
  contentBlocks: {
    specifications: 'generateProductSpecs',
    recommendations: 'generateRecommendations'
  }
};

export const COMPARISON_PAGE_TEMPLATE = {
  name: 'comparison_page',
  description: 'Product comparison template',
  structure: {
    title: 'Product Comparison - {{productName}} vs Competitors',
    comparisonOverview: {
      type: 'block',
      block: 'generateComparisonOverview'
    },
    products: {
      primary: {
        type: 'block',
        block: 'formatPrimaryProduct'
      },
      competitors: {
        type: 'block',
        block: 'generateCompetitorProducts',
        params: {
          count: 2
        }
      }
    },
    comparison: {
      type: 'block',
      block: 'generateDetailedComparison',
      params: {
        comparisonPoints: ['price', 'ingredients', 'benefits', 'usage', 'suitability']
      }
    },
    analysis: {
      type: 'block',
      block: 'generateComparisonAnalysis'
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      templateVersion: '1.0'
    }
  },
  fieldMappings: {
    productName: 'productName',
    basePrice: 'price',
    targetSkinType: 'skinType'
  },
  contentBlocks: {
    summary: 'generateComparisonSummary',
    recommendations: 'generateComparisonRecommendations'
  }
};

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return {
    faq_page: FAQ_TEMPLATE,
    product_page: PRODUCT_PAGE_TEMPLATE,
    comparison_page: COMPARISON_PAGE_TEMPLATE
  };
}

/**
 * Get template by name
 */
export function getTemplate(name) {
  const templates = getAllTemplates();
  return templates[name];
}

/**
 * Get template names
 */
export function getTemplateNames() {
  return Object.keys(getAllTemplates());
}