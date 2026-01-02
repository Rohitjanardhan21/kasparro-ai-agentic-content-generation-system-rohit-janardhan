import { BaseAgent } from './BaseAgent.js';

/**
 * SeoOptimizationAgent - Optimizes content for search engines
 * 
 * Responsibilities:
 * - Extract and analyze keywords
 * - Generate SEO metadata
 * - Optimize content structure
 * - Provide SEO recommendations
 */
export class SeoOptimizationAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'seo_optimization_001',
      name: 'SeoOptimizationAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.1
    });

    this.keywordDatabase = new Map();
    this.seoRules = {
      title_length: { min: 30, max: 60 },
      description_length: { min: 120, max: 160 },
      keyword_density: { min: 0.5, max: 3.0 },
      heading_structure: { h1: 1, h2_max: 6, h3_max: 12 }
    };

    this.addGoal('extract_keywords');
    this.addGoal('optimize_seo_elements');
  }

  /**
   * Perform comprehensive SEO optimization
   */
  async optimizeContent(generatedContent, productData) {
    console.log(`🔍 [${this.name}] Performing SEO optimization...`);
    
    const seoAnalysis = {
      keywords: {},
      metadata: {},
      content_optimization: {},
      schema_markup: {},
      seo_score: 0,
      recommendations: [],
      generated_at: new Date().toISOString()
    };

    // Extract keywords from all content
    seoAnalysis.keywords = await this.extractKeywords(generatedContent, productData);
    
    // Generate SEO metadata
    seoAnalysis.metadata = this.generateSeoMetadata(productData, seoAnalysis.keywords);
    
    // Optimize content structure
    seoAnalysis.content_optimization = this.optimizeContentStructure(generatedContent, seoAnalysis.keywords);
    
    // Generate schema markup
    seoAnalysis.schema_markup = this.generateSchemaMarkup(productData, generatedContent);
    
    // Calculate SEO score
    seoAnalysis.seo_score = this.calculateSeoScore(seoAnalysis);
    
    // Generate recommendations
    seoAnalysis.recommendations = this.generateSeoRecommendations(seoAnalysis);

    console.log(`✅ [${this.name}] SEO optimization completed - Score: ${seoAnalysis.seo_score}/100`);
    
    return seoAnalysis;
  }

  /**
   * Extract keywords from content and product data
   */
  async extractKeywords(generatedContent, productData) {
    const keywords = {
      primary_keywords: [],
      long_tail_keywords: [],
      semantic_keywords: [],
      keyword_density: {},
      keyword_opportunities: []
    };

    // Extract from product data
    const productKeywords = this.extractProductKeywords(productData);
    keywords.primary_keywords.push(...productKeywords.primary);
    keywords.semantic_keywords.push(...productKeywords.semantic);

    // Extract from generated content
    const contentKeywords = this.extractContentKeywords(generatedContent);
    keywords.long_tail_keywords.push(...contentKeywords.long_tail);
    keywords.keyword_density = contentKeywords.density;

    // Generate keyword opportunities
    keywords.keyword_opportunities = this.identifyKeywordOpportunities(productData, generatedContent);

    // Remove duplicates and sort by relevance
    keywords.primary_keywords = [...new Set(keywords.primary_keywords)].slice(0, 12);
    keywords.long_tail_keywords = [...new Set(keywords.long_tail_keywords)].slice(0, 10);
    keywords.semantic_keywords = [...new Set(keywords.semantic_keywords)].slice(0, 15);

    return keywords;
  }

  /**
   * Extract keywords from product data
   */
  extractProductKeywords(productData) {
    const primary = [];
    const semantic = [];

    // Product name variations
    if (productData.productName) {
      primary.push(productData.productName.toLowerCase());
      const nameWords = productData.productName.toLowerCase().split(' ');
      primary.push(...nameWords.filter(word => word.length > 3));
    }

    // Concentration and ingredients
    if (productData.concentration) {
      primary.push(productData.concentration.toLowerCase());
      semantic.push(`${productData.concentration} serum`);
    }

    if (productData.keyIngredients) {
      const ingredients = productData.keyIngredients.split(',').map(ing => ing.trim().toLowerCase());
      primary.push(...ingredients);
      semantic.push(...ingredients.map(ing => `${ing} skincare`));
      semantic.push(...ingredients.map(ing => `${ing} benefits`));
    }

    // Skin type targeting
    if (productData.skinType) {
      const skinTypes = productData.skinType.split(',').map(type => type.trim().toLowerCase());
      semantic.push(...skinTypes);
      semantic.push(...skinTypes.map(type => `${type} skin care`));
    }

    // Benefits
    if (productData.benefits) {
      const benefits = productData.benefits.split(',').map(benefit => benefit.trim().toLowerCase());
      primary.push(...benefits);
      semantic.push(...benefits.map(benefit => `${benefit} serum`));
    }

    return { primary, semantic };
  }

  /**
   * Extract keywords from generated content
   */
  extractContentKeywords(generatedContent) {
    const longTail = [];
    const density = {};
    const allText = this.extractAllText(generatedContent);

    // Extract long-tail keywords (3+ word phrases)
    const phrases = this.extractPhrases(allText, 3, 5);
    longTail.push(...phrases.slice(0, 10));

    // Calculate keyword density
    const words = allText.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    words.forEach(word => {
      if (word.length > 3) {
        density[word] = (density[word] || 0) + 1;
      }
    });

    // Convert to percentages
    Object.keys(density).forEach(word => {
      density[word] = ((density[word] / wordCount) * 100).toFixed(2);
    });

    return { long_tail: longTail, density };
  }

  /**
   * Extract all text from generated content
   */
  extractAllText(content) {
    let text = '';
    
    const extractFromObject = (obj) => {
      if (typeof obj === 'string') {
        text += obj + ' ';
      } else if (Array.isArray(obj)) {
        obj.forEach(extractFromObject);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(extractFromObject);
      }
    };

    extractFromObject(content);
    return text;
  }

  /**
   * Extract phrases of specific length
   */
  extractPhrases(text, minWords, maxWords) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = [];

    for (let length = minWords; length <= maxWords; length++) {
      for (let i = 0; i <= words.length - length; i++) {
        const phrase = words.slice(i, i + length).join(' ');
        if (this.isValidPhrase(phrase)) {
          phrases.push(phrase);
        }
      }
    }

    // Count frequency and return most common
    const phraseCount = {};
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });

    return Object.entries(phraseCount)
      .filter(([phrase, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([phrase]) => phrase);
  }

  /**
   * Check if phrase is valid for SEO
   */
  isValidPhrase(phrase) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'];
    const words = phrase.split(' ');
    
    // Must contain at least one non-stop word
    const hasContentWord = words.some(word => !stopWords.includes(word) && word.length > 2);
    
    // Must not be all stop words
    const allStopWords = words.every(word => stopWords.includes(word));
    
    return hasContentWord && !allStopWords && phrase.length > 10;
  }

  /**
   * Identify keyword opportunities
   */
  identifyKeywordOpportunities(productData, generatedContent) {
    const opportunities = [];

    // Seasonal opportunities
    opportunities.push({
      keyword: `${productData.productName} winter skincare`,
      opportunity: 'seasonal',
      potential: 'medium',
      reasoning: 'Seasonal skincare searches increase in winter'
    });

    // Problem-solution opportunities
    if (productData.benefits?.includes('dark spots')) {
      opportunities.push({
        keyword: 'how to fade dark spots naturally',
        opportunity: 'problem_solution',
        potential: 'high',
        reasoning: 'High search volume for dark spot solutions'
      });
    }

    // Comparison opportunities
    opportunities.push({
      keyword: `${productData.productName} vs competitors`,
      opportunity: 'comparison',
      potential: 'medium',
      reasoning: 'Users often compare products before purchase'
    });

    // Ingredient-focused opportunities
    if (productData.keyIngredients?.includes('Vitamin C')) {
      opportunities.push({
        keyword: 'vitamin c serum benefits',
        opportunity: 'ingredient_education',
        potential: 'high',
        reasoning: 'Educational content ranks well for ingredient searches'
      });
    }

    return opportunities;
  }

  /**
   * Generate SEO metadata
   */
  generateSeoMetadata(productData, keywords) {
    const metadata = {
      title_tags: [],
      meta_descriptions: [],
      og_tags: {},
      twitter_tags: {},
      canonical_urls: {}
    };

    // Generate title tags for different pages
    metadata.title_tags = {
      faq: `${productData.productName} FAQ - ${keywords.primary_keywords.slice(0, 2).join(', ')} | Skincare Guide`,
      product_page: `${productData.productName} - ${productData.concentration} ${keywords.primary_keywords[0]} | Buy Now`,
      comparison_page: `${productData.productName} vs Competitors - ${keywords.primary_keywords[0]} Comparison`
    };

    // Generate meta descriptions
    metadata.meta_descriptions = {
      faq: `Get answers about ${productData.productName}. Learn about ${keywords.primary_keywords.slice(0, 3).join(', ')} and more. Expert skincare advice.`,
      product_page: `${productData.productName} with ${productData.keyIngredients}. ${productData.benefits}. Perfect for ${productData.skinType}. ${productData.price}.`,
      comparison_page: `Compare ${productData.productName} with similar products. See ingredients, benefits, and pricing. Find the best ${keywords.primary_keywords[0]} for you.`
    };

    // Generate Open Graph tags
    metadata.og_tags = {
      'og:title': `${productData.productName} - ${productData.concentration} Skincare Solution`,
      'og:description': `${productData.benefits} with ${productData.keyIngredients}. Designed for ${productData.skinType}.`,
      'og:type': 'product',
      'og:image': `/images/${productData.productName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      'og:url': `https://example.com/products/${productData.productName.toLowerCase().replace(/\s+/g, '-')}`
    };

    // Generate Twitter Card tags
    metadata.twitter_tags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': metadata.og_tags['og:title'],
      'twitter:description': metadata.og_tags['og:description'],
      'twitter:image': metadata.og_tags['og:image']
    };

    return metadata;
  }

  /**
   * Optimize content structure for SEO
   */
  optimizeContentStructure(generatedContent, keywords) {
    const optimization = {
      heading_structure: {},
      keyword_placement: {},
      internal_linking: {},
      content_length: {},
      readability: {}
    };

    // Analyze and optimize heading structure
    optimization.heading_structure = this.optimizeHeadingStructure(generatedContent, keywords);
    
    // Optimize keyword placement
    optimization.keyword_placement = this.optimizeKeywordPlacement(generatedContent, keywords);
    
    // Suggest internal linking
    optimization.internal_linking = this.suggestInternalLinking(generatedContent, keywords);
    
    // Analyze content length
    optimization.content_length = this.analyzeContentLength(generatedContent);
    
    // Assess readability
    optimization.readability = this.assessReadability(generatedContent);

    return optimization;
  }

  /**
   * Optimize heading structure
   */
  optimizeHeadingStructure(content, keywords) {
    const structure = {
      suggested_h1: {},
      suggested_h2: {},
      suggested_h3: {},
      current_structure: 'flat', // Most content is currently flat
      recommendations: []
    };

    // Suggest H1 tags for each content type
    structure.suggested_h1 = {
      faq: `Frequently Asked Questions About ${keywords.primary_keywords[0]}`,
      product_page: `${keywords.primary_keywords[0]} - Complete Product Guide`,
      comparison_page: `${keywords.primary_keywords[0]} Comparison Guide`
    };

    // Suggest H2 tags
    structure.suggested_h2 = {
      faq: [
        `${keywords.primary_keywords[0]} Safety Information`,
        `How to Use ${keywords.primary_keywords[0]}`,
        `${keywords.primary_keywords[0]} Benefits and Results`,
        `Purchasing ${keywords.primary_keywords[0]}`
      ],
      product_page: [
        `What is ${keywords.primary_keywords[0]}?`,
        `${keywords.primary_keywords[0]} Benefits`,
        `Key Ingredients in ${keywords.primary_keywords[0]}`,
        `How to Use ${keywords.primary_keywords[0]}`,
        `${keywords.primary_keywords[0]} Safety Information`
      ],
      comparison_page: [
        `${keywords.primary_keywords[0]} vs Competitors`,
        `Ingredient Comparison`,
        `Price and Value Analysis`,
        `Which Product is Right for You?`
      ]
    };

    structure.recommendations = [
      'Implement hierarchical heading structure (H1 > H2 > H3)',
      'Include primary keywords in H1 and H2 tags',
      'Use semantic keywords in H3 tags',
      'Maintain logical content flow with headings'
    ];

    return structure;
  }

  /**
   * Optimize keyword placement
   */
  optimizeKeywordPlacement(content, keywords) {
    const placement = {
      primary_keyword_density: {},
      keyword_distribution: {},
      placement_recommendations: []
    };

    const primaryKeyword = keywords.primary_keywords[0];
    
    // Analyze current keyword density
    Object.keys(content).forEach(contentType => {
      const text = this.extractAllText(content[contentType]);
      const wordCount = text.split(/\s+/).length;
      const keywordCount = (text.toLowerCase().match(new RegExp(primaryKeyword, 'g')) || []).length;
      const density = ((keywordCount / wordCount) * 100).toFixed(2);
      
      placement.primary_keyword_density[contentType] = {
        density: parseFloat(density),
        count: keywordCount,
        word_count: wordCount,
        optimal: density >= 0.5 && density <= 3.0
      };
    });

    // Provide placement recommendations
    placement.placement_recommendations = [
      `Include "${primaryKeyword}" in the first 100 words`,
      `Use "${primaryKeyword}" in headings and subheadings`,
      `Maintain keyword density between 0.5% and 3.0%`,
      `Use semantic variations: ${keywords.semantic_keywords.slice(0, 3).join(', ')}`,
      `Include long-tail keywords naturally in content`
    ];

    return placement;
  }

  /**
   * Suggest internal linking opportunities
   */
  suggestInternalLinking(content, keywords) {
    const linking = {
      anchor_text_suggestions: [],
      linking_opportunities: [],
      link_structure: {}
    };

    // Suggest anchor text based on keywords
    linking.anchor_text_suggestions = [
      ...keywords.primary_keywords.slice(0, 5),
      ...keywords.long_tail_keywords.slice(0, 3),
      'learn more about skincare',
      'product comparison guide',
      'skincare routine tips'
    ];

    // Identify linking opportunities
    linking.linking_opportunities = [
      {
        from: 'faq',
        to: 'product_page',
        anchor: keywords.primary_keywords[0],
        context: 'Link from FAQ answers to detailed product information'
      },
      {
        from: 'product_page',
        to: 'comparison_page',
        anchor: 'compare with similar products',
        context: 'Link from product page to comparison for decision support'
      },
      {
        from: 'comparison_page',
        to: 'faq',
        anchor: 'frequently asked questions',
        context: 'Link from comparison to FAQ for additional information'
      }
    ];

    return linking;
  }

  /**
   * Analyze content length for SEO
   */
  analyzeContentLength(content) {
    const analysis = {};
    
    Object.entries(content).forEach(([contentType, contentData]) => {
      const text = this.extractAllText(contentData);
      const wordCount = text.split(/\s+/).length;
      
      analysis[contentType] = {
        word_count: wordCount,
        character_count: text.length,
        optimal_range: this.getOptimalWordCount(contentType),
        meets_minimum: wordCount >= this.getMinimumWordCount(contentType),
        recommendation: this.getContentLengthRecommendation(wordCount, contentType)
      };
    });
    
    return analysis;
  }

  /**
   * Get optimal word count for content type
   */
  getOptimalWordCount(contentType) {
    const ranges = {
      faq: { min: 800, max: 1500 },
      product_page: { min: 1000, max: 2000 },
      comparison_page: { min: 1200, max: 2500 }
    };
    
    return ranges[contentType] || { min: 500, max: 1500 };
  }

  /**
   * Get minimum word count for SEO
   */
  getMinimumWordCount(contentType) {
    const minimums = {
      faq: 500,
      product_page: 600,
      comparison_page: 800
    };
    
    return minimums[contentType] || 300;
  }

  /**
   * Get content length recommendation
   */
  getContentLengthRecommendation(wordCount, contentType) {
    const optimal = this.getOptimalWordCount(contentType);
    
    if (wordCount < optimal.min) {
      return `Increase content length to at least ${optimal.min} words for better SEO`;
    } else if (wordCount > optimal.max) {
      return `Consider breaking content into sections or separate pages`;
    } else {
      return 'Content length is optimal for SEO';
    }
  }

  /**
   * Assess readability for SEO
   */
  assessReadability(content) {
    const readability = {};
    
    Object.entries(content).forEach(([contentType, contentData]) => {
      const text = this.extractAllText(contentData);
      const sentences = text.split(/[.!?]+/).length;
      const words = text.split(/\s+/).length;
      const avgWordsPerSentence = words / sentences;
      
      // Simple readability score
      let score = 100;
      if (avgWordsPerSentence > 20) score -= 20;
      if (avgWordsPerSentence > 25) score -= 20;
      
      readability[contentType] = {
        avg_words_per_sentence: Math.round(avgWordsPerSentence),
        readability_score: Math.max(0, score),
        grade_level: this.calculateGradeLevel(avgWordsPerSentence),
        recommendations: this.getReadabilityRecommendations(avgWordsPerSentence)
      };
    });
    
    return readability;
  }

  /**
   * Calculate grade level
   */
  calculateGradeLevel(avgWordsPerSentence) {
    if (avgWordsPerSentence <= 12) return 'Elementary (6th grade)';
    if (avgWordsPerSentence <= 16) return 'Middle School (8th grade)';
    if (avgWordsPerSentence <= 20) return 'High School (10th grade)';
    return 'College Level';
  }

  /**
   * Get readability recommendations
   */
  getReadabilityRecommendations(avgWordsPerSentence) {
    const recommendations = [];
    
    if (avgWordsPerSentence > 20) {
      recommendations.push('Break long sentences into shorter ones');
      recommendations.push('Use bullet points for lists');
    }
    
    if (avgWordsPerSentence > 25) {
      recommendations.push('Simplify complex sentences');
      recommendations.push('Use active voice instead of passive');
    }
    
    recommendations.push('Use transition words for better flow');
    recommendations.push('Include subheadings to break up content');
    
    return recommendations;
  }

  /**
   * Generate schema markup
   */
  generateSchemaMarkup(productData, generatedContent) {
    const schema = {
      product_schema: this.generateProductSchema(productData),
      faq_schema: this.generateFaqSchema(generatedContent.faq),
      organization_schema: this.generateOrganizationSchema(),
      breadcrumb_schema: this.generateBreadcrumbSchema(productData)
    };

    return schema;
  }

  /**
   * Generate product schema markup
   */
  generateProductSchema(productData) {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': productData.productName,
      'description': `${productData.benefits} with ${productData.keyIngredients}. Designed for ${productData.skinType}.`,
      'brand': {
        '@type': 'Brand',
        'name': 'Skincare Brand'
      },
      'offers': {
        '@type': 'Offer',
        'price': productData.price?.replace(/[^\d]/g, '') || '699',
        'priceCurrency': 'INR',
        'availability': 'https://schema.org/InStock'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.5',
        'reviewCount': '127'
      }
    };
  }

  /**
   * Generate FAQ schema markup
   */
  generateFaqSchema(faqContent) {
    if (!faqContent?.questions) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqContent.questions.slice(0, 10).map(qa => ({
        '@type': 'Question',
        'name': qa.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': qa.answer
        }
      }))
    };
  }

  /**
   * Generate organization schema
   */
  generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Skincare Company',
      'url': 'https://example.com',
      'logo': 'https://example.com/logo.png',
      'sameAs': [
        'https://facebook.com/skincare',
        'https://instagram.com/skincare',
        'https://twitter.com/skincare'
      ]
    };
  }

  /**
   * Generate breadcrumb schema
   */
  generateBreadcrumbSchema(productData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://example.com'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Skincare',
          'item': 'https://example.com/skincare'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': productData.productName,
          'item': `https://example.com/products/${productData.productName.toLowerCase().replace(/\s+/g, '-')}`
        }
      ]
    };
  }

  /**
   * Calculate overall SEO score
   */
  calculateSeoScore(seoAnalysis) {
    let score = 0;
    const weights = {
      keywords: 0.25,
      metadata: 0.20,
      content_structure: 0.25,
      schema: 0.15,
      technical: 0.15
    };

    // Keywords score
    const keywordScore = this.scoreKeywords(seoAnalysis.keywords);
    score += keywordScore * weights.keywords;

    // Metadata score
    const metadataScore = this.scoreMetadata(seoAnalysis.metadata);
    score += metadataScore * weights.metadata;

    // Content structure score
    const structureScore = this.scoreContentStructure(seoAnalysis.content_optimization);
    score += structureScore * weights.content_structure;

    // Schema score
    const schemaScore = this.scoreSchema(seoAnalysis.schema_markup);
    score += schemaScore * weights.schema;

    // Technical score (default good score)
    score += 85 * weights.technical;

    return Math.round(score);
  }

  /**
   * Score keywords
   */
  scoreKeywords(keywords) {
    let score = 0;
    
    if (keywords.primary_keywords.length >= 10) score += 30;
    else score += (keywords.primary_keywords.length / 10) * 30;
    
    if (keywords.long_tail_keywords.length >= 8) score += 25;
    else score += (keywords.long_tail_keywords.length / 8) * 25;
    
    if (keywords.semantic_keywords.length >= 12) score += 25;
    else score += (keywords.semantic_keywords.length / 12) * 25;
    
    if (keywords.keyword_opportunities.length >= 3) score += 20;
    else score += (keywords.keyword_opportunities.length / 3) * 20;
    
    return Math.min(100, score);
  }

  /**
   * Score metadata
   */
  scoreMetadata(metadata) {
    let score = 0;
    
    // Title tags
    if (metadata.title_tags && Object.keys(metadata.title_tags).length >= 3) score += 25;
    
    // Meta descriptions
    if (metadata.meta_descriptions && Object.keys(metadata.meta_descriptions).length >= 3) score += 25;
    
    // Open Graph tags
    if (metadata.og_tags && Object.keys(metadata.og_tags).length >= 4) score += 25;
    
    // Twitter tags
    if (metadata.twitter_tags && Object.keys(metadata.twitter_tags).length >= 3) score += 25;
    
    return score;
  }

  /**
   * Score content structure
   */
  scoreContentStructure(optimization) {
    let score = 0;
    
    if (optimization.heading_structure) score += 25;
    if (optimization.keyword_placement) score += 25;
    if (optimization.internal_linking) score += 25;
    if (optimization.readability) score += 25;
    
    return score;
  }

  /**
   * Score schema markup
   */
  scoreSchema(schema) {
    let score = 0;
    
    if (schema.product_schema) score += 30;
    if (schema.faq_schema) score += 25;
    if (schema.organization_schema) score += 25;
    if (schema.breadcrumb_schema) score += 20;
    
    return score;
  }

  /**
   * Generate SEO recommendations
   */
  generateSeoRecommendations(seoAnalysis) {
    const recommendations = [];

    // Keyword recommendations
    if (seoAnalysis.keywords.primary_keywords.length < 10) {
      recommendations.push({
        type: 'keywords',
        priority: 'high',
        recommendation: 'Increase primary keyword count to at least 10',
        impact: 'Better keyword coverage and ranking opportunities'
      });
    }

    // Content structure recommendations
    if (seoAnalysis.content_optimization.heading_structure) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        recommendation: 'Implement hierarchical heading structure (H1, H2, H3)',
        impact: 'Improved content organization and SEO'
      });
    }

    // Schema recommendations
    if (!seoAnalysis.schema_markup.product_schema) {
      recommendations.push({
        type: 'schema',
        priority: 'medium',
        recommendation: 'Add product schema markup',
        impact: 'Enhanced search result appearance'
      });
    }

    // Technical recommendations
    recommendations.push({
      type: 'technical',
      priority: 'low',
      recommendation: 'Optimize page loading speed',
      impact: 'Better user experience and search rankings'
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get SEO optimization statistics
   */
  getSeoStats() {
    return {
      agent: this.name,
      keywords_tracked: this.keywordDatabase.size,
      seo_rules: this.seoRules,
      optimization_experiences: this.experiences.length,
      autonomy_level: this.autonomyLevel
    };
  }
}