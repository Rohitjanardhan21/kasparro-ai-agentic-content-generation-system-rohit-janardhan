/**
 * Content Logic Blocks - Reusable transformation functions
 * 
 * These blocks handle specific data transformations and content generation
 * They can be used across different templates and agents
 */

/**
 * Generate FAQ questions from product data
 */
export function generateQuestions(data, context = {}) {
  const questions = [];
  const categories = ['informational', 'safety', 'usage', 'purchase', 'comparison'];
  
  for (const category of categories) {
    const categoryQuestions = generateQuestionsForCategory(data, category);
    questions.push(...categoryQuestions);
  }
  
  return questions;
}

/**
 * Generate questions for a specific category
 */
function generateQuestionsForCategory(data, category) {
  const questions = [];
  
  switch (category) {
    case 'informational':
      questions.push({
        category: category,
        question: `What is ${data.productName || 'this product'}?`,
        answer: `${data.productName || 'This product'} is a ${data.concentration || 'skincare'} product with ${data.keyIngredients || 'premium ingredients'}, designed for ${data.skinType || 'various skin types'}.`
      });
      
      if (data.keyIngredients) {
        questions.push({
          category: category,
          question: `What are the key ingredients in ${data.productName || 'this product'}?`,
          answer: `The key ingredients in ${data.productName || 'this product'} include ${data.keyIngredients}.`
        });
      }
      
      if (data.concentration) {
        questions.push({
          category: category,
          question: `What is the concentration of active ingredients in ${data.productName || 'this product'}?`,
          answer: `${data.productName || 'This product'} contains ${data.concentration} of active ingredients.`
        });
      }
      
      questions.push({
        category: category,
        question: `What skin type is ${data.productName || 'this product'} designed for?`,
        answer: `${data.productName || 'This product'} is specifically formulated for ${data.skinType || 'various skin types'}.`
      });
      break;
      
    case 'usage':
      if (data.howToUse) {
        questions.push({
          category: category,
          question: `How do I use ${data.productName || 'this product'}?`,
          answer: data.howToUse
        });
      }
      
      questions.push({
        category: category,
        question: `When should I use ${data.productName || 'this product'}?`,
        answer: `${data.productName || 'This product'} should be used ${data.howToUse ? data.howToUse.toLowerCase().includes('morning') ? 'in the morning' : 'as directed' : 'as part of your regular skincare routine'}.`
      });
      
      questions.push({
        category: category,
        question: `How often should I use ${data.productName || 'this product'}?`,
        answer: `For best results, use ${data.productName || 'this product'} consistently as part of your daily skincare routine.`
      });
      
      questions.push({
        category: category,
        question: `Can I use ${data.productName || 'this product'} with other skincare products?`,
        answer: `Yes, ${data.productName || 'this product'} can typically be incorporated into your existing skincare routine. ${data.howToUse || 'Follow the usage instructions for best results.'}`
      });
      break;
      
    case 'safety':
      if (data.sideEffects) {
        questions.push({
          category: category,
          question: `Are there any side effects with ${data.productName || 'this product'}?`,
          answer: `Some users may experience ${data.sideEffects.toLowerCase()}. Always patch test before first use.`
        });
      }
      
      questions.push({
        category: category,
        question: `Is ${data.productName || 'this product'} safe for sensitive skin?`,
        answer: `${data.productName || 'This product'} is formulated for ${data.skinType || 'various skin types'}. ${data.sideEffects ? 'Some users may experience ' + data.sideEffects.toLowerCase() + ', so' : 'We recommend to'} patch test before first use.`
      });
      
      questions.push({
        category: category,
        question: `Should I do a patch test before using ${data.productName || 'this product'}?`,
        answer: `Yes, we always recommend doing a patch test before using any new skincare product, including ${data.productName || 'this product'}.`
      });
      
      questions.push({
        category: category,
        question: `What precautions should I take when using ${data.productName || 'this product'}?`,
        answer: `When using ${data.productName || 'this product'}, ${data.howToUse && data.howToUse.includes('sunscreen') ? 'always apply sunscreen during the day' : 'follow the usage instructions carefully'}${data.sideEffects ? ' and be aware that some users may experience ' + data.sideEffects.toLowerCase() : ''}.`
      });
      break;
      
    case 'purchase':
      if (data.price) {
        questions.push({
          category: category,
          question: `What is the price of ${data.productName || 'this product'}?`,
          answer: `${data.productName || 'This product'} is available for ${data.price}.`
        });
      }
      
      questions.push({
        category: category,
        question: `What benefits does ${data.productName || 'this product'} provide?`,
        answer: `${data.productName || 'This product'} provides ${data.benefits || 'skincare benefits'}.`
      });
      
      questions.push({
        category: category,
        question: `Is ${data.productName || 'this product'} worth the investment?`,
        answer: `${data.productName || 'This product'} offers ${data.benefits || 'valuable benefits'} with ${data.keyIngredients || 'quality ingredients'} at ${data.price || 'a competitive price point'}, making it a worthwhile investment for your skincare routine.`
      });
      
      questions.push({
        category: category,
        question: `Who should consider buying ${data.productName || 'this product'}?`,
        answer: `${data.productName || 'This product'} is ideal for individuals with ${data.skinType || 'various skin types'} who are looking for ${data.benefits || 'effective skincare solutions'}.`
      });
      break;
      
    case 'comparison':
      questions.push({
        category: category,
        question: `How does ${data.productName || 'this product'} compare to other similar products?`,
        answer: `${data.productName || 'This product'} offers ${data.benefits || 'unique benefits'} with ${data.keyIngredients || 'carefully selected ingredients'} at ${data.price || 'a competitive price point'}.`
      });
      
      questions.push({
        category: category,
        question: `What makes ${data.productName || 'this product'} different from competitors?`,
        answer: `${data.productName || 'This product'} stands out with its ${data.concentration || 'effective formulation'} and ${data.keyIngredients || 'quality ingredients'}, specifically designed for ${data.skinType || 'your skin type'}.`
      });
      
      questions.push({
        category: category,
        question: `Why should I choose ${data.productName || 'this product'} over alternatives?`,
        answer: `Choose ${data.productName || 'this product'} for its proven ${data.benefits || 'benefits'}, ${data.keyIngredients || 'quality ingredients'}, and value at ${data.price || 'its price point'}.`
      });
      break;
  }
  
  return questions;
}

/**
 * Count total questions
 */
export function countQuestions(data, context = {}) {
  const questions = generateQuestions(data, context);
  return questions.length;
}

/**
 * Assess content quality
 */
export function assessContentQuality(data, context = {}) {
  const questions = generateQuestions(data, context);
  const categories = new Set(questions.map(q => q.category));
  
  return {
    total_questions: questions.length,
    categories_covered: categories.size,
    quality_score: Math.min(100, (questions.length / 15) * 100),
    completeness: categories.size >= 5 ? 'complete' : 'partial'
  };
}

/**
 * Generate product overview
 */
export function generateOverview(data, context = {}) {
  return {
    description: `${data.productName || 'This product'} is a ${data.concentration || 'premium'} skincare solution specifically formulated for ${data.skinType || 'various skin types'}.`,
    key_features: [
      data.concentration || 'Active formulation',
      data.keyIngredients || 'Quality ingredients',
      `Designed for ${data.skinType || 'all skin types'}`,
      data.benefits || 'Effective results'
    ].filter(Boolean),
    target_audience: `Individuals with ${data.skinType || 'various skin types'} seeking ${data.benefits || 'skincare benefits'}`
  };
}

/**
 * Generate benefits analysis
 */
export function generateBenefits(data, context = {}) {
  const benefits = (data.benefits || 'skincare benefits').split(',').map(b => b.trim());
  
  return {
    primary_benefits: benefits,
    detailed_analysis: benefits.map(benefit => ({
      benefit: benefit,
      description: `${data.productName || 'This product'} delivers ${benefit.toLowerCase()} through its ${data.keyIngredients || 'active ingredients'}.`,
      timeline: 'Results may vary, typically visible within 2-4 weeks of consistent use'
    })),
    synergy: `The combination of ${data.keyIngredients || 'active ingredients'} works synergistically to enhance ${data.benefits || 'overall effectiveness'}.`
  };
}

/**
 * Generate ingredients analysis
 */
export function generateIngredients(data, context = {}) {
  const ingredients = (data.keyIngredients || 'active ingredients').split(',').map(i => i.trim());
  
  return {
    active_ingredients: ingredients,
    concentration: data.concentration || 'Effective concentration',
    ingredient_profiles: ingredients.map(ingredient => ({
      name: ingredient,
      function: getIngredientFunction(ingredient),
      benefits: getIngredientBenefits(ingredient, data.benefits)
    })),
    formulation_notes: `This ${data.concentration || 'carefully balanced'} formulation is optimized for ${data.skinType || 'various skin types'}.`
  };
}

/**
 * Generate usage instructions
 */
export function generateUsage(data, context = {}) {
  return {
    instructions: data.howToUse || 'Apply as directed',
    frequency: data.howToUse && data.howToUse.includes('morning') ? 'Daily (morning)' : 'As needed',
    application_tips: [
      'Cleanse skin before application',
      data.howToUse || 'Apply evenly to target areas',
      data.howToUse && data.howToUse.includes('sunscreen') ? 'Always follow with sunscreen during the day' : 'Allow to absorb fully'
    ],
    precautions: data.sideEffects ? [`May cause ${data.sideEffects.toLowerCase()}`, 'Patch test recommended'] : ['Patch test recommended for sensitive skin']
  };
}

/**
 * Generate safety information
 */
export function generateSafety(data, context = {}) {
  return {
    side_effects: data.sideEffects || 'Generally well tolerated',
    precautions: [
      'Patch test before first use',
      data.howToUse && data.howToUse.includes('sunscreen') ? 'Use sunscreen during the day' : 'Follow usage instructions',
      'Discontinue if irritation occurs'
    ],
    contraindications: data.sideEffects ? [`Avoid if sensitive to ingredients that may cause ${data.sideEffects.toLowerCase()}`] : ['Consult dermatologist if you have sensitive skin'],
    storage: 'Store in a cool, dry place away from direct sunlight'
  };
}

/**
 * Generate product specifications
 */
export function generateSpecs(data, context = {}) {
  return {
    product_name: data.productName || 'Product',
    concentration: data.concentration || 'Not specified',
    skin_type: data.skinType || 'All skin types',
    key_ingredients: data.keyIngredients || 'Active ingredients',
    benefits: data.benefits || 'Skincare benefits',
    usage: data.howToUse || 'As directed',
    side_effects: data.sideEffects || 'None reported',
    price: data.price || 'Contact for pricing',
    formulation_type: 'Serum',
    texture: 'Lightweight liquid',
    absorption: 'Fast-absorbing'
  };
}

/**
 * Generate pricing analysis
 */
export function generatePricing(data, context = {}) {
  const price = data.price || '₹0';
  const numericPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
  
  return {
    current_price: price,
    value_proposition: `${data.productName || 'This product'} offers ${data.benefits || 'premium benefits'} with ${data.keyIngredients || 'quality ingredients'} at ${price}.`,
    market_position: numericPrice > 800 ? 'Premium' : numericPrice > 400 ? 'Mid-range' : 'Affordable',
    cost_per_benefit: `Approximately ${Math.round(numericPrice / ((data.benefits || 'benefit').split(',').length))} per benefit`,
    investment_justification: `The ${data.concentration || 'effective formulation'} and ${data.keyIngredients || 'quality ingredients'} justify the investment for ${data.skinType || 'your skin type'}.`
  };
}

/**
 * Generate product details for comparison
 */
export function generateProductDetails(data, context = {}) {
  return {
    name: data.productName || 'Product A',
    concentration: data.concentration || 'Not specified',
    ingredients: data.keyIngredients || 'Active ingredients',
    benefits: data.benefits || 'Skincare benefits',
    skin_type: data.skinType || 'All skin types',
    price: data.price || 'Contact for pricing',
    usage: data.howToUse || 'As directed',
    side_effects: data.sideEffects || 'Generally well tolerated'
  };
}

/**
 * Generate competitor name
 */
export function generateCompetitorName(data, context = {}) {
  const competitors = [
    'VitaGlow Advanced Serum',
    'BrightSkin Pro Formula',
    'RadiantCare Vitamin Serum',
    'GlowMax Premium Solution',
    'SkinBoost Active Concentrate'
  ];
  
  return competitors[Math.floor(Math.random() * competitors.length)];
}

/**
 * Generate competitor details
 */
export function generateCompetitorDetails(data, context = {}) {
  const competitorName = generateCompetitorName(data, context);
  const basePrice = parseInt((data.price || '₹500').replace(/[^\d]/g, '')) || 500;
  const competitorPrice = basePrice + (Math.random() * 400 - 200); // ±₹200 variation
  
  return {
    name: competitorName,
    concentration: '12% Vitamin C',
    ingredients: 'Vitamin C, Niacinamide, Peptides',
    benefits: 'Anti-aging, Brightening, Hydration',
    skin_type: 'All skin types',
    price: `₹${Math.round(competitorPrice)}`,
    usage: 'Apply 2-3 drops twice daily',
    side_effects: 'Possible mild irritation'
  };
}

/**
 * Generate comparison analysis
 */
export function generateComparisonAnalysis(data, context = {}) {
  const productDetails = generateProductDetails(data, context);
  const competitorDetails = generateCompetitorDetails(data, context);
  
  return {
    summary: `${productDetails.name} vs ${competitorDetails.name}`,
    key_differences: [
      `Concentration: ${productDetails.concentration} vs ${competitorDetails.concentration}`,
      `Price: ${productDetails.price} vs ${competitorDetails.price}`,
      `Target: ${productDetails.skin_type} vs ${competitorDetails.skin_type}`
    ],
    advantages: [
      `${productDetails.name} is specifically formulated for ${productDetails.skin_type}`,
      `Contains ${productDetails.ingredients} for targeted benefits`,
      `Offers ${productDetails.benefits} at competitive pricing`
    ],
    recommendation: `Choose ${productDetails.name} if you have ${productDetails.skin_type} and are looking for ${productDetails.benefits}.`
  };
}

/**
 * Compare ingredients between products
 */
export function compareIngredients(data, context = {}) {
  const productIngredients = (data.keyIngredients || 'Vitamin C').split(',').map(i => i.trim());
  const competitorIngredients = ['Vitamin C', 'Niacinamide', 'Peptides'];
  
  return {
    product_a_ingredients: productIngredients,
    product_b_ingredients: competitorIngredients,
    common_ingredients: productIngredients.filter(ing => 
      competitorIngredients.some(comp => comp.toLowerCase().includes(ing.toLowerCase()))
    ),
    unique_to_a: productIngredients.filter(ing => 
      !competitorIngredients.some(comp => comp.toLowerCase().includes(ing.toLowerCase()))
    ),
    unique_to_b: competitorIngredients.filter(ing => 
      !productIngredients.some(prod => prod.toLowerCase().includes(ing.toLowerCase()))
    ),
    analysis: `Both products contain vitamin C, but ${data.productName || 'Product A'} focuses on ${data.keyIngredients || 'targeted ingredients'} while the competitor includes additional anti-aging compounds.`
  };
}

/**
 * Compare benefits
 */
export function compareBenefits(data, context = {}) {
  const productBenefits = (data.benefits || 'skincare benefits').split(',').map(b => b.trim());
  const competitorBenefits = ['Anti-aging', 'Brightening', 'Hydration'];
  
  return {
    product_a_benefits: productBenefits,
    product_b_benefits: competitorBenefits,
    overlap: productBenefits.filter(benefit => 
      competitorBenefits.some(comp => comp.toLowerCase().includes(benefit.toLowerCase()))
    ),
    unique_advantages: productBenefits.filter(benefit => 
      !competitorBenefits.some(comp => comp.toLowerCase().includes(benefit.toLowerCase()))
    )
  };
}

/**
 * Compare pricing
 */
export function comparePricing(data, context = {}) {
  const productPrice = parseInt((data.price || '₹500').replace(/[^\d]/g, '')) || 500;
  const competitorPrice = productPrice + (Math.random() * 400 - 200);
  
  return {
    product_a_price: data.price || '₹500',
    product_b_price: `₹${Math.round(competitorPrice)}`,
    price_difference: `₹${Math.abs(productPrice - competitorPrice)}`,
    better_value: productPrice < competitorPrice ? data.productName || 'Product A' : 'Competitor',
    value_analysis: `${data.productName || 'Product A'} offers ${data.benefits || 'targeted benefits'} at ${data.price || 'competitive pricing'}, providing good value for ${data.skinType || 'your skin type'}.`
  };
}

/**
 * Compare usage instructions
 */
export function compareUsage(data, context = {}) {
  return {
    product_a_usage: data.howToUse || 'Apply as directed',
    product_b_usage: 'Apply 2-3 drops twice daily',
    convenience: data.howToUse && data.howToUse.includes('morning') ? 'Once daily (morning)' : 'As needed',
    application_difference: `${data.productName || 'Product A'} is designed for ${data.howToUse && data.howToUse.includes('morning') ? 'morning use' : 'flexible application'}, while the competitor requires twice-daily application.`
  };
}

/**
 * Compare safety profiles
 */
export function compareSafety(data, context = {}) {
  return {
    product_a_safety: data.sideEffects || 'Generally well tolerated',
    product_b_safety: 'Possible mild irritation',
    safety_advantage: data.sideEffects ? 'Similar safety profiles' : `${data.productName || 'Product A'} has better tolerability`,
    recommendations: [
      'Patch test both products before use',
      'Start with lower frequency if sensitive',
      'Discontinue if irritation occurs'
    ]
  };
}

/**
 * Generate final recommendation
 */
export function generateRecommendation(data, context = {}) {
  return {
    recommended_product: data.productName || 'Product A',
    reasoning: [
      `Specifically formulated for ${data.skinType || 'your skin type'}`,
      `Contains ${data.keyIngredients || 'targeted ingredients'} for ${data.benefits || 'effective results'}`,
      `Convenient ${data.howToUse && data.howToUse.includes('morning') ? 'once-daily' : 'flexible'} application`,
      `Good value at ${data.price || 'competitive pricing'}`
    ],
    best_for: `Individuals with ${data.skinType || 'various skin types'} looking for ${data.benefits || 'effective skincare solutions'}`,
    considerations: data.sideEffects ? [`May cause ${data.sideEffects.toLowerCase()}`, 'Patch test recommended'] : ['Patch test recommended for sensitive skin']
  };
}

// Helper functions

function getIngredientFunction(ingredient) {
  const functions = {
    'vitamin c': 'Antioxidant and brightening agent',
    'hyaluronic acid': 'Hydration and moisture retention',
    'niacinamide': 'Pore refinement and oil control',
    'retinol': 'Cell turnover and anti-aging',
    'peptides': 'Collagen support and firming'
  };
  
  const key = ingredient.toLowerCase();
  return functions[key] || 'Active skincare ingredient';
}

function getIngredientBenefits(ingredient, productBenefits) {
  const benefits = {
    'vitamin c': 'brightening, antioxidant protection',
    'hyaluronic acid': 'hydration, plumping',
    'niacinamide': 'pore refinement, oil control',
    'retinol': 'anti-aging, texture improvement',
    'peptides': 'firming, collagen support'
  };
  
  const key = ingredient.toLowerCase();
  return benefits[key] || productBenefits || 'skincare benefits';
}