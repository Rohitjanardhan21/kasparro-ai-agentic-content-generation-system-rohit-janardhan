/**
 * Template Definitions - FAQ, Product, and Comparison page templates
 * 
 * Templates use:
 * - $field:fieldName for direct data mapping
 * - $block:blockName for content block execution
 * - {{variable}} for variable interpolation
 */

export const FAQ_PAGE_TEMPLATE = {
  title: "Frequently Asked Questions - {{productName}}",
  description: "Common questions and answers about {{productName}}",
  categories: [
    "informational",
    "safety", 
    "usage",
    "purchase",
    "comparison"
  ],
  questions: "$block:generateQuestions",
  metadata: {
    generated_at: "$field:timestamp",
    product_name: "$field:productName",
    total_questions: "$block:countQuestions",
    content_quality: "$block:assessContentQuality"
  }
};

export const PRODUCT_PAGE_TEMPLATE = {
  title: "$field:productName",
  subtitle: "{{concentration}} skincare solution for {{skinType}}",
  sections: {
    overview: {
      title: "Product Overview",
      content: "$block:generateOverview"
    },
    benefits: {
      title: "Key Benefits", 
      content: "$block:generateBenefits"
    },
    ingredients: {
      title: "Active Ingredients",
      content: "$block:generateIngredients"
    },
    usage: {
      title: "How to Use",
      content: "$block:generateUsage"
    },
    safety: {
      title: "Safety Information",
      content: "$block:generateSafety"
    }
  },
  specifications: "$block:generateSpecs",
  pricing: {
    price: "$field:price",
    analysis: "$block:generatePricing"
  },
  metadata: {
    generated_at: "$field:timestamp",
    skin_type: "$field:skinType",
    concentration: "$field:concentration"
  }
};

export const COMPARISON_PAGE_TEMPLATE = {
  title: "Product Comparison - {{productName}}",
  subtitle: "Compare {{productName}} with similar products",
  comparison: {
    product_a: {
      name: "$field:productName",
      details: "$block:generateProductDetails"
    },
    product_b: {
      name: "$block:generateCompetitorName",
      details: "$block:generateCompetitorDetails"
    },
    analysis: "$block:generateComparisonAnalysis"
  },
  sections: {
    ingredients: {
      title: "Ingredient Comparison",
      content: "$block:compareIngredients"
    },
    benefits: {
      title: "Benefits Analysis", 
      content: "$block:compareBenefits"
    },
    pricing: {
      title: "Value Comparison",
      content: "$block:comparePricing"
    },
    usage: {
      title: "Usage Comparison",
      content: "$block:compareUsage"
    },
    safety: {
      title: "Safety Profile",
      content: "$block:compareSafety"
    }
  },
  recommendation: "$block:generateRecommendation",
  metadata: {
    generated_at: "$field:timestamp",
    comparison_type: "product_vs_competitor"
  }
};

/**
 * Template registry for easy access
 */
export const TEMPLATES = {
  faq: FAQ_PAGE_TEMPLATE,
  product_page: PRODUCT_PAGE_TEMPLATE,
  comparison_page: COMPARISON_PAGE_TEMPLATE
};

/**
 * Get template by name
 */
export function getTemplate(name) {
  return TEMPLATES[name];
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
  return TEMPLATES;
}