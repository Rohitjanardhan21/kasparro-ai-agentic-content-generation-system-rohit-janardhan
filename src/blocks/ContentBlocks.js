/**
 * Content Logic Blocks - reusable content transformation functions
 */

/**
 * Generate benefits block with structured formatting
 */
export const generateBenefitsBlock = (data, config = {}) => {
  const benefits = data.product?.benefits || '';
  const benefitsList = benefits.split(',').map(b => b.trim());
  
  return {
    benefits: benefitsList,
    primary_benefit: benefitsList[0] || '',
    benefit_count: benefitsList.length,
    formatted_benefits: benefitsList.map(benefit => ({
      name: benefit,
      description: `Experience ${benefit.toLowerCase()} with regular use`,
      timeline: benefit.toLowerCase().includes('brightening') ? '2-4 weeks' : '4-6 weeks',
      intensity: benefit.toLowerCase().includes('fades') ? 'gradual' : 'immediate'
    }))
  };
};

/**
 * Extract usage instructions block with enhanced parsing
 */
export const extractUsageBlock = (data, config = {}) => {
  const usage = data.product?.howToUse || '';
  
  return {
    usage_instructions: usage,
    application_frequency: usage.includes('morning') ? 'daily_morning' : 'as_needed',
    application_time: usage.toLowerCase().includes('morning') ? 'morning' : 'flexible',
    steps: usage.split('.').filter(step => step.trim()).map((step, index) => ({
      step_number: index + 1,
      instruction: step.trim(),
      duration: step.toLowerCase().includes('apply') ? '30 seconds' : '1 minute',
      importance: step.toLowerCase().includes('sunscreen') ? 'critical' : 'essential'
    })),
    precautions: usage.toLowerCase().includes('morning') ? ['Always follow with sunscreen'] : []
  };
};

/**
 * Advanced ingredient comparison with detailed analysis
 */
export const compareIngredientsBlock = (data, config = {}) => {
  const productA = data.product;
  const productB = data.comparison_product;
  
  const ingredientsA = productA?.keyIngredients?.split(',').map(i => i.trim()) || [];
  const ingredientsB = productB?.keyIngredients?.split(',').map(i => i.trim()) || [];
  
  const common = ingredientsA.filter(ing => ingredientsB.includes(ing));
  const uniqueA = ingredientsA.filter(ing => !ingredientsB.includes(ing));
  const uniqueB = ingredientsB.filter(ing => !ingredientsA.includes(ing));
  
  return {
    common_ingredients: common,
    unique_to_product_a: uniqueA,
    unique_to_product_b: uniqueB,
    ingredient_overlap_percentage: Math.round((common.length / Math.max(ingredientsA.length, ingredientsB.length)) * 100),
    ingredient_analysis: {
      synergy_score: common.length > 0 ? 75 : 25,
      potency_comparison: productA.concentration?.includes('10%') ? 'product_a_higher' : 'product_b_higher'
    }
  };
};

/**
 * Enhanced safety information with risk assessment
 */
export const generateSafetyBlock = (data, config = {}) => {
  const sideEffects = data.product?.sideEffects || '';
  const ingredients = data.product?.keyIngredients || '';
  
  return {
    side_effects: sideEffects,
    safety_level: sideEffects.toLowerCase().includes('mild') ? 'low_risk' : 'moderate_risk',
    risk_factors: sideEffects.toLowerCase().includes('sensitive') ? ['sensitive_skin_reaction'] : [],
    precautions: [
      'Patch test before first use',
      'Discontinue if irritation occurs',
      'Avoid contact with eyes'
    ],
    suitable_for_sensitive_skin: !sideEffects.toLowerCase().includes('sensitive'),
    patch_test_recommendation: sideEffects.length > 0
  };
};

/**
 * Advanced pricing analysis with market positioning
 */
export const generatePricingBlock = (data, config = {}) => {
  const price = data.product?.price || '';
  const numericPrice = parseInt(price.replace(/[^\d]/g, ''));
  
  return {
    price: price,
    numeric_price: numericPrice,
    currency: 'INR',
    price_category: numericPrice < 500 ? 'budget' : numericPrice < 1000 ? 'mid_range' : 'premium',
    value_proposition: `Effective skincare solution at ${price}`,
    market_positioning: numericPrice < 800 ? 'competitive' : 'premium',
    cost_effectiveness: numericPrice < 700 ? 'high' : 'moderate'
  };
};

/**
 * Comprehensive product specifications with technical details
 */
export const generateSpecsBlock = (data, config = {}) => {
  const product = data.product;
  
  return {
    concentration: product?.concentration || '',
    skin_types: product?.skinType?.split(',').map(t => t.trim()) || [],
    key_ingredients: product?.keyIngredients?.split(',').map(i => i.trim()) || [],
    product_category: 'skincare_serum',
    active_ingredient: product?.concentration?.includes('Vitamin C') ? 'Vitamin C' : 'Unknown',
    formulation_type: 'serum',
    texture: 'lightweight_liquid',
    absorption_rate: 'fast',
    shelf_life: '12-24 months',
    storage_requirements: 'cool, dry place away from direct sunlight'
  };
};

/**
 * Enhanced FAQ generation with intelligent filtering and categorization
 */
export const generateFaqBlock = (data, config = {}) => {
  const product = data.product;
  const questions = data.questions || [];
  
  // Filter questions by category if specified
  const categoryFilter = config.category;
  let filteredQuestions = categoryFilter 
    ? questions.filter(q => q.category === categoryFilter)
    : questions;
  
  // Prioritize questions based on importance (simplified)
  filteredQuestions = filteredQuestions.sort((a, b) => {
    const scoreA = calculateQuestionImportance(a, product);
    const scoreB = calculateQuestionImportance(b, product);
    return scoreB - scoreA;
  });
  
  return {
    faqs: filteredQuestions.slice(0, config.limit || 5).map(q => ({
      question: q.question,
      answer: q.answer,
      category: q.category,
      importance_score: calculateQuestionImportance(q, product),
      search_intent: identifySearchIntent(q.question),
      answer_completeness: assessAnswerCompleteness(q.answer)
    })),
    total_questions: filteredQuestions.length,
    category_distribution: analyzeCategoryDistribution(questions),
    question_quality_score: assessQuestionQuality(filteredQuestions)
  };
};

// Helper functions for enhanced content blocks
function calculateQuestionImportance(question, product) {
  let score = 50; // Base score
  
  // Higher importance for safety and usage questions
  if (question.category === 'safety') score += 20;
  if (question.category === 'usage') score += 15;
  if (question.category === 'purchase') score += 10;
  
  // Higher importance for questions mentioning product name
  if (question.question.toLowerCase().includes(product.name.toLowerCase())) score += 10;
  
  // Higher importance for practical questions
  if (question.question.toLowerCase().includes('how')) score += 5;
  
  return Math.min(100, score);
}

function identifySearchIntent(question) {
  const lower = question.toLowerCase();
  if (lower.startsWith('what') || lower.startsWith('which')) return 'informational';
  if (lower.startsWith('how')) return 'instructional';
  if (lower.startsWith('why')) return 'explanatory';
  if (lower.includes('buy') || lower.includes('price')) return 'transactional';
  if (lower.includes('vs') || lower.includes('compare')) return 'comparative';
  return 'general';
}

function assessAnswerCompleteness(answer) {
  const wordCount = answer.split(' ').length;
  if (wordCount > 20) return 'comprehensive';
  if (wordCount > 10) return 'adequate';
  return 'brief';
}

function analyzeCategoryDistribution(questions) {
  const distribution = {};
  questions.forEach(q => {
    distribution[q.category] = (distribution[q.category] || 0) + 1;
  });
  return distribution;
}

function assessQuestionQuality(questions) {
  const avgLength = questions.reduce((sum, q) => sum + q.question.length, 0) / questions.length;
  const categoryCount = new Set(questions.map(q => q.category)).size;
  
  let score = 50;
  if (avgLength > 30) score += 15; // Good question length
  if (categoryCount >= 3) score += 20; // Good category diversity
  if (questions.length >= 5) score += 15; // Sufficient quantity
  
  return Math.min(100, score);
}