import { Agent } from '../core/Agent.js';

/**
 * SeoOptimizationAgent - optimizes content for search engines
 */
export class SeoOptimizationAgent extends Agent {
  constructor() {
    super('SeoOptimizationAgent', ['DataParserAgent', 'QuestionGeneratorAgent']);
  }

  async process(input) {
    const productData = input.DataParserAgent.product;
    const questions = input.QuestionGeneratorAgent.questions;

    const seoOptimization = {
      meta_data: this.generateMetaData(productData),
      keywords: this.extractKeywords(productData, questions),
      content_structure: this.optimizeContentStructure(productData, questions),
      schema_markup: this.generateSchemaMarkup(productData),
      url_suggestions: this.generateUrlSuggestions(productData),
      title_variations: this.generateTitleVariations(productData),
      description_variations: this.generateDescriptionVariations(productData),
      seo_score: this.calculateSeoScore(productData, questions)
    };

    return {
      seo_optimization: seoOptimization,
      generated_at: new Date().toISOString()
    };
  }

  generateMetaData(product) {
    return {
      title: `${product.name} - ${product.concentration} for ${product.skinType} Skin | ${product.price}`,
      description: `${product.name} with ${product.keyIngredients}. ${product.benefits}. Perfect for ${product.skinType.toLowerCase()} skin. ${product.price}`,
      keywords: this.extractPrimaryKeywords(product),
      og_title: `${product.name} - Premium Skincare Solution`,
      og_description: `Transform your skin with ${product.name}. ${product.benefits} for ${product.skinType.toLowerCase()} skin types.`,
      twitter_title: `${product.name} - ${product.concentration}`,
      twitter_description: `${product.benefits} • ${product.keyIngredients} • ${product.price}`
    };
  }

  extractKeywords(product, questions) {
    const primaryKeywords = this.extractPrimaryKeywords(product);
    const longTailKeywords = this.extractLongTailKeywords(product, questions);
    const semanticKeywords = this.generateSemanticKeywords(product);
    const competitorKeywords = this.generateCompetitorKeywords(product);

    return {
      primary_keywords: primaryKeywords,
      long_tail_keywords: longTailKeywords,
      semantic_keywords: semanticKeywords,
      competitor_keywords: competitorKeywords,
      keyword_density: this.calculateKeywordDensity(product, primaryKeywords),
      search_volume_estimates: this.estimateSearchVolumes(primaryKeywords)
    };
  }

  optimizeContentStructure(product, questions) {
    return {
      h1_suggestions: [
        `${product.name} - ${product.concentration} Serum`,
        `Best ${product.concentration} Serum for ${product.skinType} Skin`,
        `${product.name} Review: ${product.benefits}`
      ],
      h2_suggestions: [
        'Key Benefits and Results',
        'How to Use This Serum',
        'Ingredients and Formula',
        'Frequently Asked Questions',
        'Price and Where to Buy'
      ],
      content_hierarchy: this.generateContentHierarchy(product, questions),
      internal_linking_opportunities: this.identifyLinkingOpportunities(product),
      content_length_recommendations: this.recommendContentLength(questions)
    };
  }

  generateSchemaMarkup(product) {
    return {
      product_schema: {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "description": `${product.benefits} serum with ${product.keyIngredients}`,
        "brand": {
          "@type": "Brand",
          "name": product.name.split(' ')[0]
        },
        "offers": {
          "@type": "Offer",
          "price": product.price.replace(/[^\d]/g, ''),
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": "127"
        }
      },
      faq_schema: this.generateFaqSchema(product),
      howto_schema: this.generateHowToSchema(product)
    };
  }

  generateUrlSuggestions(product) {
    const baseSlug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    return {
      product_page: `/${baseSlug}`,
      faq_page: `/${baseSlug}/faq`,
      comparison_page: `/${baseSlug}/vs-competitors`,
      review_page: `/${baseSlug}/review`,
      how_to_use: `/${baseSlug}/how-to-use`,
      ingredients: `/${baseSlug}/ingredients`
    };
  }

  generateTitleVariations(product) {
    return [
      `${product.name} - ${product.concentration} for ${product.skinType} Skin`,
      `Best ${product.concentration} Serum - ${product.name} Review`,
      `${product.name}: ${product.benefits} Serum for ${product.skinType} Skin`,
      `${product.concentration} Serum with ${product.keyIngredients} - ${product.name}`,
      `${product.name} - Premium Skincare for ${product.skinType} Skin Types`
    ];
  }

  generateDescriptionVariations(product) {
    return [
      `${product.name} delivers ${product.benefits.toLowerCase()} with ${product.keyIngredients}. Perfect for ${product.skinType.toLowerCase()} skin. ${product.price}`,
      `Transform your skin with ${product.name}. This ${product.concentration} serum provides ${product.benefits.toLowerCase()} for ${product.skinType.toLowerCase()} skin types.`,
      `Discover ${product.name} - a powerful ${product.concentration} serum featuring ${product.keyIngredients}. Ideal for ${product.skinType.toLowerCase()} skin. Shop now for ${product.price}`,
      `${product.benefits} made easy with ${product.name}. Contains ${product.keyIngredients} in a ${product.concentration} formula designed for ${product.skinType.toLowerCase()} skin.`
    ];
  }

  calculateSeoScore(product, questions) {
    let score = 0;
    const maxScore = 100;

    // Title optimization (20 points)
    if (product.name.length >= 10 && product.name.length <= 60) score += 20;
    else if (product.name.length >= 5) score += 10;

    // Keyword presence (25 points)
    const keywords = this.extractPrimaryKeywords(product);
    if (keywords.length >= 5) score += 25;
    else score += keywords.length * 5;

    // Content depth (20 points)
    if (questions.length >= 15) score += 20;
    else score += questions.length;

    // Category coverage (15 points)
    const categories = [...new Set(questions.map(q => q.category))];
    if (categories.length >= 5) score += 15;
    else score += categories.length * 3;

    // Product information completeness (20 points)
    const requiredFields = ['name', 'concentration', 'skinType', 'keyIngredients', 'benefits', 'price'];
    const presentFields = requiredFields.filter(field => product[field] && product[field].trim());
    score += (presentFields.length / requiredFields.length) * 20;

    return {
      total_score: Math.min(score, maxScore),
      grade: this.getScoreGrade(score),
      recommendations: this.generateSeoRecommendations(score, product, questions)
    };
  }

  // Helper methods
  extractPrimaryKeywords(product) {
    const keywords = [];
    
    // Product name keywords
    keywords.push(...product.name.toLowerCase().split(' '));
    
    // Concentration keywords
    if (product.concentration) {
      keywords.push(...product.concentration.toLowerCase().split(' '));
    }
    
    // Skin type keywords
    if (product.skinType) {
      keywords.push(...product.skinType.toLowerCase().split(/[,\s]+/));
    }
    
    // Ingredient keywords
    if (product.keyIngredients) {
      keywords.push(...product.keyIngredients.toLowerCase().split(/[,\s]+/));
    }
    
    // Benefit keywords
    if (product.benefits) {
      keywords.push(...product.benefits.toLowerCase().split(/[,\s]+/));
    }

    // Clean and deduplicate
    return [...new Set(keywords.filter(k => k.length > 2 && !['the', 'and', 'for', 'with'].includes(k)))];
  }

  extractLongTailKeywords(product, questions) {
    const longTail = [];
    
    // From questions
    questions.forEach(q => {
      if (q.question.split(' ').length >= 4) {
        longTail.push(q.question.toLowerCase());
      }
    });
    
    // Product-specific long tail
    longTail.push(`${product.name.toLowerCase()} for ${product.skinType.toLowerCase()} skin`);
    longTail.push(`${product.concentration.toLowerCase()} serum benefits`);
    longTail.push(`how to use ${product.name.toLowerCase()}`);
    longTail.push(`${product.name.toLowerCase()} side effects`);
    longTail.push(`${product.name.toLowerCase()} price ${product.price}`);
    
    return longTail.slice(0, 10); // Top 10 long tail keywords
  }

  generateSemanticKeywords(product) {
    const semantic = [];
    
    // Related skincare terms
    if (product.concentration.includes('Vitamin C')) {
      semantic.push('ascorbic acid', 'antioxidant serum', 'brightening serum', 'anti-aging');
    }
    
    if (product.keyIngredients.includes('Hyaluronic Acid')) {
      semantic.push('hydrating serum', 'moisture retention', 'plumping serum');
    }
    
    // Skin type related
    if (product.skinType.includes('Oily')) {
      semantic.push('oil control', 'non-comedogenic', 'pore minimizing');
    }
    
    if (product.skinType.includes('Combination')) {
      semantic.push('balanced skincare', 'multi-zone treatment');
    }
    
    // Benefit related
    if (product.benefits.includes('Brightening')) {
      semantic.push('radiance', 'glow', 'luminous skin', 'even skin tone');
    }
    
    if (product.benefits.includes('dark spots')) {
      semantic.push('hyperpigmentation', 'age spots', 'melasma', 'discoloration');
    }
    
    return semantic;
  }

  generateCompetitorKeywords(product) {
    return [
      'vitamin c serum comparison',
      'best vitamin c serum',
      'vitamin c serum reviews',
      'affordable vitamin c serum',
      'vitamin c serum vs retinol',
      'morning skincare routine',
      'anti-aging serum',
      'brightening skincare products'
    ];
  }

  calculateKeywordDensity(product, keywords) {
    const allText = Object.values(product).join(' ').toLowerCase();
    const wordCount = allText.split(/\s+/).length;
    
    const densities = {};
    keywords.forEach(keyword => {
      const occurrences = (allText.match(new RegExp(keyword, 'g')) || []).length;
      densities[keyword] = Math.round((occurrences / wordCount) * 100 * 100) / 100; // 2 decimal places
    });
    
    return densities;
  }

  estimateSearchVolumes(keywords) {
    // Simulated search volume estimates (in real implementation, would use SEO APIs)
    const estimates = {};
    keywords.forEach(keyword => {
      if (keyword.includes('vitamin c')) estimates[keyword] = 'High (10K-100K)';
      else if (keyword.includes('serum')) estimates[keyword] = 'Medium (1K-10K)';
      else if (keyword.includes('skin')) estimates[keyword] = 'High (10K-100K)';
      else estimates[keyword] = 'Low (100-1K)';
    });
    return estimates;
  }

  generateContentHierarchy(product, questions) {
    return {
      page_structure: [
        { level: 'H1', content: `${product.name} - Complete Guide` },
        { level: 'H2', content: 'Product Overview' },
        { level: 'H3', content: 'Key Ingredients' },
        { level: 'H3', content: 'Benefits' },
        { level: 'H2', content: 'How to Use' },
        { level: 'H2', content: 'Frequently Asked Questions' },
        { level: 'H3', content: 'Safety Information' },
        { level: 'H3', content: 'Purchase Information' },
        { level: 'H2', content: 'Product Comparison' }
      ],
      content_sections: this.mapQuestionsToSections(questions)
    };
  }

  mapQuestionsToSections(questions) {
    const sections = {};
    questions.forEach(q => {
      if (!sections[q.category]) sections[q.category] = [];
      sections[q.category].push(q.question);
    });
    return sections;
  }

  identifyLinkingOpportunities(product) {
    return [
      { anchor: 'Vitamin C benefits', target: '/vitamin-c-skincare-benefits' },
      { anchor: 'Hyaluronic Acid guide', target: '/hyaluronic-acid-complete-guide' },
      { anchor: 'Oily skin care routine', target: '/oily-skin-care-routine' },
      { anchor: 'Morning skincare steps', target: '/morning-skincare-routine' },
      { anchor: 'Skincare ingredient compatibility', target: '/skincare-ingredients-compatibility' }
    ];
  }

  recommendContentLength(questions) {
    return {
      faq_page: `${questions.length * 50}-${questions.length * 80} words`,
      product_page: '800-1200 words',
      comparison_page: '600-900 words',
      total_content: `${1400 + (questions.length * 65)} words approximately`
    };
  }

  generateFaqSchema(product) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What is ${product.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${product.name} is a ${product.concentration} serum designed for ${product.skinType.toLowerCase()} skin types.`
          }
        }
      ]
    };
  }

  generateHowToSchema(product) {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to use ${product.name}`,
      "description": product.howToUse,
      "step": [
        {
          "@type": "HowToStep",
          "text": product.howToUse
        }
      ]
    };
  }

  getScoreGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  generateSeoRecommendations(score, product, questions) {
    const recommendations = [];
    
    if (score < 70) {
      recommendations.push('Improve overall content optimization');
    }
    
    if (product.name.length > 60) {
      recommendations.push('Shorten product title for better SEO');
    }
    
    if (questions.length < 15) {
      recommendations.push('Add more FAQ questions to improve content depth');
    }
    
    const categories = [...new Set(questions.map(q => q.category))];
    if (categories.length < 5) {
      recommendations.push('Expand question categories for better topic coverage');
    }
    
    return recommendations;
  }
}