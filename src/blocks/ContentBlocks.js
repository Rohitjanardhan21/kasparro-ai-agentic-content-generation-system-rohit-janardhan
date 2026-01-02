/**
 * ContentBlocks - Reusable content transformation functions
 * 
 * These blocks provide specialized content generation logic that can be
 * used across different templates and agents for consistent output.
 */

/**
 * Generate FAQ questions across multiple categories
 */
export async function generateFaqQuestions(data, params = {}) {
  const { minQuestions = 15, categories = ['informational', 'usage', 'safety'] } = params;
  const questions = [];
  
  console.log(`❓ [ContentBlocks] Generating FAQ questions for ${data.productName || 'product'}`);
  
  // Generate questions for each category
  for (const category of categories) {
    const categoryQuestions = generateQuestionsForCategory(data, category);
    questions.push(...categoryQuestions);
  }
  
  // Ensure minimum number of questions
  while (questions.length < minQuestions) {
    const additionalQuestion = generateGenericQuestion(data, questions.length);
    questions.push(additionalQuestion);
  }
  
  return questions;
}

/**
 * Generate questions for specific category
 */
function generateQuestionsForCategory(data, category) {
  const questions = [];
  
  switch (category) {
    case 'informational':
      questions.push(
        {
          category: category,
          question: `What is ${data.productName || 'this product'}?`,
          answer: `${data.productName || 'This product'} is a ${data.concentration || 'skincare'} product with ${data.keyIngredients || 'premium ingredients'}, designed for ${data.skinType || 'various skin types'}.`,
          importance: 'high'
        },
        {
          category: category,
          question: `What are the key ingredients in ${data.productName || 'this product'}?`,
          answer: `The key ingredients include ${data.keyIngredients || 'carefully selected components'}.`,
          importance: 'high'
        },
        {
          category: category,
          question: `What skin type is ${data.productName || 'this product'} designed for?`,
          answer: `${data.productName || 'This product'} is specifically formulated for ${data.skinType || 'various skin types'}.`,
          importance: 'medium'
        }
      );
      break;
      
    case 'usage':
      questions.push(
        {
          category: category,
          question: `How do I use ${data.productName || 'this product'}?`,
          answer: data.howToUse || 'Follow the product instructions for best results.',
          importance: 'high'
        },
        {
          category: category,
          question: `When should I use ${data.productName || 'this product'}?`,
          answer: `Use ${data.productName || 'this product'} ${data.howToUse && data.howToUse.includes('morning') ? 'in the morning' : 'as part of your skincare routine'}.`,
          importance: 'medium'
        },
        {
          category: category,
          question: `How often should I use ${data.productName || 'this product'}?`,
          answer: `For best results, use ${data.productName || 'this product'} consistently as directed.`,
          importance: 'medium'
        }
      );
      break;
      
    case 'safety':
      questions.push(
        {
          category: category,
          question: `Are there any side effects with ${data.productName || 'this product'}?`,
          answer: data.sideEffects ? `Some users may experience ${data.sideEffects.toLowerCase()}. Always patch test before first use.` : 'Always patch test before first use.',
          importance: 'high'
        },
        {
          category: category,
          question: `Is ${data.productName || 'this product'} safe for sensitive skin?`,
          answer: `${data.productName || 'This product'} is formulated for ${data.skinType || 'various skin types'}. We recommend patch testing before first use.`,
          importance: 'high'
        },
        {
          category: category,
          question: `What precautions should I take?`,
          answer: `When using ${data.productName || 'this product'}, ${data.howToUse && data.howToUse.includes('sunscreen') ? 'always apply sunscreen during the day' : 'follow usage instructions carefully'}.`,
          importance: 'medium'
        }
      );
      break;
      
    case 'purchase':
      questions.push(
        {
          category: category,
          question: `What is the price of ${data.productName || 'this product'}?`,
          answer: `${data.productName || 'This product'} is available for ${data.price || 'competitive pricing'}.`,
          importance: 'high'
        },
        {
          category: category,
          question: `What benefits does ${data.productName || 'this product'} provide?`,
          answer: `${data.productName || 'This product'} provides ${data.benefits || 'skincare benefits'}.`,
          importance: 'high'
        },
        {
          category: category,
          question: `Is ${data.productName || 'this product'} worth the investment?`,
          answer: `${data.productName || 'This product'} offers ${data.benefits || 'valuable benefits'} with ${data.keyIngredients || 'quality ingredients'} at ${data.price || 'a competitive price'}.`,
          importance: 'medium'
        }
      );
      break;
      
    case 'comparison':
      questions.push(
        {
          category: category,
          question: `How does ${data.productName || 'this product'} compare to other products?`,
          answer: `${data.productName || 'This product'} offers ${data.benefits || 'unique benefits'} with ${data.keyIngredients || 'quality ingredients'} at ${data.price || 'a competitive price'}.`,
          importance: 'medium'
        },
        {
          category: category,
          question: `What makes ${data.productName || 'this product'} different?`,
          answer: `${data.productName || 'This product'} stands out with its ${data.concentration || 'effective formulation'} and ${data.keyIngredients || 'quality ingredients'}.`,
          importance: 'medium'
        }
      );
      break;
  }
  
  return questions;
}

/**
 * Generate generic question
 */
function generateGenericQuestion(data, index) {
  const genericQuestions = [
    {
      question: `Who should use ${data.productName || 'this product'}?`,
      answer: `${data.productName || 'This product'} is suitable for people with ${data.skinType || 'various skin types'}.`
    },
    {
      question: `How long does it take to see results?`,
      answer: `Results may vary, but many users notice improvements within a few weeks of consistent use.`
    },
    {
      question: `Can I use this with other skincare products?`,
      answer: `Yes, ${data.productName || 'this product'} can typically be incorporated into your existing routine.`
    }
  ];
  
  return {
    category: 'general',
    importance: 'low',
    ...genericQuestions[index % genericQuestions.length]
  };
}

/**
 * Generate FAQ summary
 */
export async function generateFaqSummary(data) {
  return {
    totalCategories: 5,
    coverageAreas: ['Product Information', 'Usage Instructions', 'Safety Guidelines', 'Purchase Details', 'Comparisons'],
    targetAudience: `Users interested in ${data.productName || 'skincare products'}`,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Generate product overview
 */
export async function generateProductOverview(data) {
  return {
    name: data.productName || 'Product',
    description: `${data.productName || 'This product'} is a ${data.concentration || ''} skincare solution featuring ${data.keyIngredients || 'premium ingredients'}. Designed for ${data.skinType || 'various skin types'}, it delivers ${data.benefits || 'exceptional results'}.`,
    keyFeatures: [
      data.concentration && `${data.concentration} active ingredient`,
      data.skinType && `Suitable for ${data.skinType} skin`,
      data.benefits && `Provides ${data.benefits}`,
      data.keyIngredients && `Contains ${data.keyIngredients}`
    ].filter(Boolean),
    category: 'Skincare',
    type: 'Serum'
  };
}

/**
 * Generate benefits section
 */
export async function generateBenefitsSection(data) {
  const benefits = data.benefits ? data.benefits.split(',').map(b => b.trim()) : [];
  
  return {
    title: 'Key Benefits',
    primaryBenefits: benefits,
    detailedBenefits: benefits.map(benefit => ({
      benefit: benefit,
      description: `Experience ${benefit.toLowerCase()} with regular use`,
      timeline: 'Results may be visible within 2-4 weeks',
      intensity: 'Moderate to significant improvement'
    })),
    overallValue: `${data.productName || 'This product'} provides comprehensive skincare benefits for ${data.skinType || 'your skin type'}`
  };
}

/**
 * Generate usage section
 */
export async function generateUsageSection(data) {
  const instructions = data.howToUse ? [data.howToUse] : ['Follow product instructions'];
  
  return {
    title: 'How to Use',
    instructions: instructions,
    steps: instructions.map((instruction, index) => ({
      step: index + 1,
      instruction: instruction,
      importance: 'high',
      duration: 'As directed'
    })),
    frequency: 'Daily use recommended',
    precautions: data.sideEffects ? [data.sideEffects] : ['Patch test before first use']
  };
}

/**
 * Generate ingredients section
 */
export async function generateIngredientsSection(data) {
  const ingredients = data.keyIngredients ? data.keyIngredients.split(',').map(i => i.trim()) : [];
  
  return {
    title: 'Key Ingredients',
    activeIngredients: ingredients,
    ingredientDetails: ingredients.map(ingredient => ({
      name: ingredient,
      purpose: 'Skincare benefit',
      concentration: data.concentration && ingredient.toLowerCase().includes('vitamin c') ? data.concentration : 'Effective level',
      safety: 'Generally well-tolerated'
    })),
    formulation: `Carefully balanced formula with ${ingredients.length} key ingredients`
  };
}

/**
 * Generate safety section
 */
export async function generateSafetySection(data) {
  return {
    title: 'Safety Information',
    sideEffects: data.sideEffects ? [data.sideEffects] : [],
    precautions: [
      'Patch test before first use',
      'Avoid contact with eyes',
      'Discontinue use if irritation occurs'
    ],
    suitability: {
      skinTypes: data.skinType ? [data.skinType] : ['Various skin types'],
      ageGroups: ['Adults'],
      conditions: ['Normal skin conditions']
    },
    warnings: data.sideEffects ? [`May cause ${data.sideEffects.toLowerCase()}`] : []
  };
}

/**
 * Generate pricing section
 */
export async function generatePricingSection(data) {
  const price = data.price || 'Contact for pricing';
  const numericPrice = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  
  let priceCategory = 'Standard';
  if (numericPrice < 500) priceCategory = 'Budget-friendly';
  else if (numericPrice > 1000) priceCategory = 'Premium';
  
  return {
    title: 'Pricing',
    currentPrice: price,
    priceCategory: priceCategory,
    valueProposition: `${data.productName || 'This product'} offers excellent value with ${data.benefits || 'quality benefits'} at ${price}`,
    costEffectiveness: `Competitive pricing for ${data.keyIngredients || 'quality ingredients'}`,
    budgetAnalysis: {
      category: priceCategory,
      comparison: 'Competitive with similar products',
      recommendation: 'Good value for money'
    }
  };
}

/**
 * Generate comparison overview
 */
export async function generateComparisonOverview(data) {
  return {
    title: `${data.productName || 'Product'} Comparison`,
    purpose: 'Compare key features and benefits with similar products',
    methodology: 'Side-by-side analysis of important product attributes',
    scope: 'Price, ingredients, benefits, usage, and suitability comparison'
  };
}

/**
 * Format primary product for comparison
 */
export async function formatPrimaryProduct(data) {
  return {
    name: data.productName || 'Primary Product',
    price: data.price || 'N/A',
    keyIngredients: data.keyIngredients || 'Not specified',
    benefits: data.benefits || 'Not specified',
    skinType: data.skinType || 'Not specified',
    usage: data.howToUse || 'Follow instructions',
    sideEffects: data.sideEffects || 'None reported',
    concentration: data.concentration || 'Not specified'
  };
}

/**
 * Generate competitor products
 */
export async function generateCompetitorProducts(data, params = {}) {
  const { count = 2 } = params;
  const competitors = [];
  
  const competitorNames = ['RadiantGlow Serum', 'PureBright Formula', 'VitaLux Treatment', 'GlowMax Essence'];
  const basePrice = parseFloat((data.price || '₹699').replace(/[^\d.]/g, ''));
  
  for (let i = 0; i < count; i++) {
    const competitorPrice = Math.round(basePrice * (0.7 + Math.random() * 0.6));
    
    competitors.push({
      name: competitorNames[i % competitorNames.length],
      price: `₹${competitorPrice}`,
      keyIngredients: 'Vitamin C, Niacinamide, Peptides',
      benefits: 'Anti-aging, Hydration, Brightening',
      skinType: 'All skin types',
      usage: 'Apply 2-3 drops daily',
      sideEffects: 'May cause initial dryness',
      concentration: '15% Vitamin C',
      fictional: true
    });
  }
  
  return competitors;
}

/**
 * Generate detailed comparison
 */
export async function generateDetailedComparison(data, params = {}) {
  const { comparisonPoints = ['price', 'ingredients', 'benefits'] } = params;
  const comparison = {};
  
  // Generate competitor for comparison
  const competitor = {
    name: 'Competitor Product',
    price: '₹799',
    keyIngredients: 'Vitamin C, Niacinamide',
    benefits: 'Anti-aging, Hydration'
  };
  
  for (const point of comparisonPoints) {
    comparison[point] = compareProducts(data, competitor, point);
  }
  
  return comparison;
}

/**
 * Compare products on specific point
 */
function compareProducts(product1, product2, point) {
  switch (point) {
    case 'price':
      const price1 = parseFloat((product1.price || '0').replace(/[^\d.]/g, ''));
      const price2 = parseFloat((product2.price || '0').replace(/[^\d.]/g, ''));
      return {
        [product1.productName || 'Product 1']: product1.price,
        [product2.name || 'Product 2']: product2.price,
        winner: price1 < price2 ? product1.productName : product2.name,
        analysis: price1 < price2 ? 'More affordable option' : 'Premium pricing'
      };
      
    case 'ingredients':
      return {
        [product1.productName || 'Product 1']: product1.keyIngredients,
        [product2.name || 'Product 2']: product2.keyIngredients,
        analysis: 'Both products feature vitamin C as primary ingredient'
      };
      
    case 'benefits':
      return {
        [product1.productName || 'Product 1']: product1.benefits,
        [product2.name || 'Product 2']: product2.benefits,
        analysis: 'Different focus areas for skincare benefits'
      };
      
    default:
      return {
        analysis: `Comparison for ${point} requires additional data`
      };
  }
}

/**
 * Generate comparison analysis
 */
export async function generateComparisonAnalysis(data) {
  return {
    methodology: 'Comprehensive feature-by-feature comparison',
    criteria: ['Price competitiveness', 'Ingredient quality', 'Benefit alignment', 'Usage convenience'],
    conclusion: `${data.productName || 'This product'} offers competitive advantages in key areas`,
    recommendation: 'Consider individual skin needs and preferences when choosing'
  };
}

/**
 * Extract question categories
 */
export async function extractQuestionCategories(data) {
  return ['informational', 'usage', 'safety', 'purchase', 'comparison'];
}

/**
 * Count questions
 */
export async function countQuestions(data) {
  return data.questions ? data.questions.length : 0;
}

/**
 * Generate product specifications
 */
export async function generateProductSpecs(data) {
  return {
    productType: 'Serum',
    volume: 'Standard size',
    concentration: data.concentration || 'Effective level',
    skinCompatibility: data.skinType || 'Various skin types',
    applicationMethod: 'Topical',
    storageRequirements: 'Store in cool, dry place'
  };
}

/**
 * Generate recommendations
 */
export async function generateRecommendations(data) {
  return [
    `Ideal for ${data.skinType || 'various skin types'}`,
    `Best used ${data.howToUse && data.howToUse.includes('morning') ? 'in morning routine' : 'as directed'}`,
    `Combine with ${data.howToUse && data.howToUse.includes('sunscreen') ? 'sunscreen for optimal results' : 'complementary products'}`
  ];
}

/**
 * Generate comparison summary
 */
export async function generateComparisonSummary(data) {
  return {
    overallAssessment: `${data.productName || 'This product'} provides competitive value`,
    keyStrengths: [
      data.benefits && `Effective ${data.benefits}`,
      data.keyIngredients && `Quality ingredients: ${data.keyIngredients}`,
      data.price && `Competitive pricing at ${data.price}`
    ].filter(Boolean),
    considerations: [
      'Individual skin sensitivity may vary',
      'Results depend on consistent use',
      'Patch testing recommended'
    ]
  };
}

/**
 * Generate comparison recommendations
 */
export async function generateComparisonRecommendations(data) {
  return {
    bestFor: `Users with ${data.skinType || 'specific skin needs'} seeking ${data.benefits || 'skincare benefits'}`,
    alternatives: 'Consider other products if specific ingredients are preferred',
    decisionFactors: ['Skin type compatibility', 'Budget considerations', 'Ingredient preferences', 'Usage convenience']
  };
}