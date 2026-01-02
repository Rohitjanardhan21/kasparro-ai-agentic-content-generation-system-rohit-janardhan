import { BaseAgent } from './BaseAgent.js';

/**
 * SeoOptimizationAgent - Autonomous agent for SEO optimization
 * 
 * This agent:
 * 1. Autonomously analyzes content for SEO opportunities
 * 2. Makes independent decisions about optimization strategies
 * 3. Generates SEO metadata and recommendations
 * 4. Shares SEO insights with other agents
 */
export class SeoOptimizationAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'seo_optimization',
      name: 'SeoOptimizationAgent',
      capabilities: ['keyword_analysis', 'seo_optimization', 'metadata_generation'],
      initialGoals: ['wait_for_content', 'analyze_seo_opportunities', 'generate_seo_data', 'save_seo_optimization']
    });

    this.seoData = null;
    this.keywordDatabase = new Map();
    this.seoRules = {
      title_length: { min: 30, max: 60 },
      description_length: { min: 120, max: 160 },
      keyword_density: { min: 0.5, max: 3.0 }
    };
  }

  async initialize() {
    console.log(`🔍 [${this.id}] SEO Optimization Agent initialized`);
  }
  
  decideAction(situation) {
    // Check if we have any generated content to optimize
    const hasContent = situation.beliefs.faq_content || 
                      situation.beliefs.product_content || 
                      situation.beliefs.comparison_content ||
                      situation.beliefs.clean_data;
    
    if (!hasContent && this.goals.has('wait_for_content')) {
      return { action: 'wait_for_content', reasoning: 'Waiting for content to optimize for SEO' };
    }
    
    if (hasContent && this.goals.has('analyze_seo_opportunities')) {
      return { action: 'analyze_seo_opportunities', reasoning: 'Analyzing SEO opportunities in content' };
    }
    
    if (this.keywordDatabase.size > 0 && this.goals.has('generate_seo_data')) {
      return { action: 'generate_seo_data', reasoning: 'Generating SEO metadata and recommendations' };
    }
    
    if (this.seoData && this.goals.has('save_seo_optimization')) {
      return { action: 'save_seo_optimization', reasoning: 'Saving SEO optimization data' };
    }
    
    return null;
  }
  
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'wait_for_content':
          return await this.waitForContent();
        case 'analyze_seo_opportunities':
          return await this.analyzeSeoOpportunities();
        case 'generate_seo_data':
          return await this.generateSeoData();
        case 'save_seo_optimization':
          return await this.saveSeoOptimization();
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  async waitForContent() {
    const hasContent = this.beliefs.has('faq_content') || 
                      this.beliefs.has('product_content') || 
                      this.beliefs.has('comparison_content') ||
                      this.beliefs.has('clean_data');
    
    if (hasContent) {
      this.goals.delete('wait_for_content');
      return { success: true, message: 'Content received for SEO analysis' };
    }
    return { success: false, message: 'Still waiting for content' };
  }
  
  async analyzeSeoOpportunities() {
    console.log(`🔍 [${this.id}] Analyzing SEO opportunities`);
    
    // Extract keywords from all available content
    const allContent = this.gatherAllContent();
    const keywords = this.extractKeywords(allContent);
    
    // Store keywords in database
    keywords.primary_keywords.forEach((keyword, index) => {
      this.keywordDatabase.set(keyword, {
        type: 'primary',
        relevance: 100 - (index * 5),
        frequency: this.calculateKeywordFrequency(keyword, allContent),
        competition: this.estimateCompetition(keyword)
      });
    });
    
    keywords.long_tail_keywords.forEach((keyword, index) => {
      this.keywordDatabase.set(keyword, {
        type: 'long_tail',
        relevance: 80 - (index * 3),
        frequency: this.calculateKeywordFrequency(keyword, allContent),
        competition: this.estimateCompetition(keyword)
      });
    });
    
    console.log(`🎯 [${this.id}] Identified ${this.keywordDatabase.size} SEO keywords`);
    
    this.goals.delete('analyze_seo_opportunities');
    return { success: true, message: `Analyzed ${this.keywordDatabase.size} keywords` };
  }
  
  gatherAllContent() {
    const allContent = {
      text: '',
      productData: this.beliefs.get('clean_data') || {},
      faqContent: this.beliefs.get('faq_content') || {},
      productContent: this.beliefs.get('product_content') || {},
      comparisonContent: this.beliefs.get('comparison_content') || {}
    };
    
    // Extract text from all content
    allContent.text += this.extractTextFromObject(allContent.productData) + ' ';
    allContent.text += this.extractTextFromObject(allContent.faqContent) + ' ';
    allContent.text += this.extractTextFromObject(allContent.productContent) + ' ';
    allContent.text += this.extractTextFromObject(allContent.comparisonContent) + ' ';
    
    return allContent;
  }
  
  extractTextFromObject(obj) {
    let text = '';
    
    const extractRecursive = (item) => {
      if (typeof item === 'string') {
        text += item + ' ';
      } else if (Array.isArray(item)) {
        item.forEach(extractRecursive);
      } else if (item && typeof item === 'object') {
        Object.values(item).forEach(extractRecursive);
      }
    };
    
    extractRecursive(obj);
    return text;
  }
  
  extractKeywords(allContent) {
    const productData = allContent.productData;
    const text = allContent.text.toLowerCase();
    
    const keywords = {
      primary_keywords: [],
      long_tail_keywords: [],
      semantic_keywords: []
    };
    
    // Extract from product data
    if (productData.productName) {
      keywords.primary_keywords.push(productData.productName.toLowerCase());
      const nameWords = productData.productName.toLowerCase().split(' ');
      keywords.primary_keywords.push(...nameWords.filter(word => word.length > 3));
    }
    
    if (productData.concentration) {
      keywords.primary_keywords.push(productData.concentration.toLowerCase());
      keywords.semantic_keywords.push(`${productData.concentration} serum`);
    }
    
    if (productData.keyIngredients) {
      const ingredients = productData.keyIngredients.split(',').map(ing => ing.trim().toLowerCase());
      keywords.primary_keywords.push(...ingredients);
      keywords.semantic_keywords.push(...ingredients.map(ing => `${ing} skincare`));
    }
    
    if (productData.benefits) {
      const benefits = productData.benefits.split(',').map(benefit => benefit.trim().toLowerCase());
      keywords.primary_keywords.push(...benefits);
      keywords.semantic_keywords.push(...benefits.map(benefit => `${benefit} serum`));
    }
    
    // Extract long-tail keywords from content
    const phrases = this.extractPhrases(text, 3, 5);
    keywords.long_tail_keywords.push(...phrases.slice(0, 10));
    
    // Remove duplicates and limit
    keywords.primary_keywords = [...new Set(keywords.primary_keywords)].slice(0, 12);
    keywords.long_tail_keywords = [...new Set(keywords.long_tail_keywords)].slice(0, 8);
    keywords.semantic_keywords = [...new Set(keywords.semantic_keywords)].slice(0, 15);
    
    return keywords;
  }
  
  extractPhrases(text, minWords, maxWords) {
    const words = text.split(/\s+/);
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
  
  isValidPhrase(phrase) {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = phrase.split(' ');
    
    const hasContentWord = words.some(word => !stopWords.includes(word) && word.length > 2);
    const allStopWords = words.every(word => stopWords.includes(word));
    
    return hasContentWord && !allStopWords && phrase.length > 10;
  }
  
  calculateKeywordFrequency(keyword, allContent) {
    const text = allContent.text.toLowerCase();
    const matches = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    const totalWords = text.split(/\s+/).length;
    return totalWords > 0 ? ((matches / totalWords) * 100).toFixed(2) : 0;
  }
  
  estimateCompetition(keyword) {
    // Simple competition estimation based on keyword characteristics
    const length = keyword.length;
    const wordCount = keyword.split(' ').length;
    
    if (wordCount >= 3) return 'low'; // Long-tail keywords have lower competition
    if (length > 15) return 'medium';
    return 'high'; // Short, generic keywords have high competition
  }
  
  async generateSeoData() {
    console.log(`📝 [${this.id}] Generating SEO metadata and recommendations`);
    
    const productData = this.beliefs.get('clean_data') || {};
    const primaryKeywords = Array.from(this.keywordDatabase.entries())
      .filter(([keyword, data]) => data.type === 'primary')
      .sort((a, b) => b[1].relevance - a[1].relevance)
      .map(([keyword]) => keyword)
      .slice(0, 5);
    
    this.seoData = {
      keywords: {
        primary: primaryKeywords,
        long_tail: Array.from(this.keywordDatabase.entries())
          .filter(([keyword, data]) => data.type === 'long_tail')
          .map(([keyword]) => keyword)
          .slice(0, 8),
        keyword_analysis: Object.fromEntries(this.keywordDatabase.entries())
      },
      
      metadata: {
        title_tags: this.generateTitleTags(productData, primaryKeywords),
        meta_descriptions: this.generateMetaDescriptions(productData, primaryKeywords),
        og_tags: this.generateOpenGraphTags(productData, primaryKeywords),
        schema_markup: this.generateSchemaMarkup(productData)
      },
      
      optimization: {
        content_recommendations: this.generateContentRecommendations(primaryKeywords),
        keyword_placement: this.generateKeywordPlacement(primaryKeywords),
        internal_linking: this.generateInternalLinking(primaryKeywords),
        technical_seo: this.generateTechnicalSeoRecommendations()
      },
      
      performance: {
        seo_score: this.calculateSeoScore(),
        optimization_opportunities: this.identifyOptimizationOpportunities(),
        competitive_analysis: this.generateCompetitiveAnalysis(primaryKeywords)
      },
      
      generated_by: this.id,
      timestamp: new Date().toISOString()
    };
    
    this.goals.delete('generate_seo_data');
    return { success: true, message: 'SEO data generated successfully' };
  }
  
  generateTitleTags(productData, keywords) {
    const primaryKeyword = keywords[0] || 'skincare product';
    
    return {
      faq: `${productData.productName || 'Product'} FAQ - ${primaryKeyword} Questions Answered`,
      product_page: `${productData.productName || 'Product'} - ${primaryKeyword} | ${productData.price || 'Buy Now'}`,
      comparison_page: `${productData.productName || 'Product'} vs Competitors - ${primaryKeyword} Comparison`
    };
  }
  
  generateMetaDescriptions(productData, keywords) {
    const primaryKeyword = keywords[0] || 'skincare';
    const secondaryKeyword = keywords[1] || 'benefits';
    
    return {
      faq: `Get answers about ${productData.productName || 'our product'}. Learn about ${primaryKeyword}, ${secondaryKeyword}, and more. Expert skincare guidance.`,
      product_page: `${productData.productName || 'Premium skincare'} with ${productData.keyIngredients || 'quality ingredients'}. ${productData.benefits || 'Amazing benefits'} for ${productData.skinType || 'all skin types'}.`,
      comparison_page: `Compare ${productData.productName || 'our product'} with competitors. See ${primaryKeyword} benefits, ingredients, and pricing. Find your perfect match.`
    };
  }
  
  generateOpenGraphTags(productData, keywords) {
    return {
      'og:title': `${productData.productName || 'Premium Skincare'} - ${keywords[0] || 'Quality Products'}`,
      'og:description': `${productData.benefits || 'Amazing skincare benefits'} with ${productData.keyIngredients || 'premium ingredients'}. Perfect for ${productData.skinType || 'all skin types'}.`,
      'og:type': 'product',
      'og:image': `/images/${(productData.productName || 'product').toLowerCase().replace(/\s+/g, '-')}.jpg`,
      'og:url': `https://example.com/products/${(productData.productName || 'product').toLowerCase().replace(/\s+/g, '-')}`
    };
  }
  
  generateSchemaMarkup(productData) {
    return {
      product_schema: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': productData.productName || 'Skincare Product',
        'description': `${productData.benefits || 'Premium skincare'} with ${productData.keyIngredients || 'quality ingredients'}`,
        'brand': { '@type': 'Brand', 'name': 'Skincare Brand' },
        'offers': {
          '@type': 'Offer',
          'price': (productData.price || '₹699').replace(/[^\d]/g, ''),
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock'
        }
      },
      
      faq_schema: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `What is ${productData.productName || 'this product'}?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `${productData.productName || 'This product'} is a ${productData.concentration || 'premium'} skincare solution with ${productData.keyIngredients || 'quality ingredients'}.`
            }
          }
        ]
      }
    };
  }
  
  generateContentRecommendations(keywords) {
    return [
      `Include primary keyword "${keywords[0] || 'main keyword'}" in the first 100 words`,
      `Use "${keywords[1] || 'secondary keyword'}" in headings and subheadings`,
      `Maintain keyword density between 0.5% and 3.0%`,
      `Create content around long-tail keywords for better ranking`,
      `Use semantic variations naturally throughout content`
    ];
  }
  
  generateKeywordPlacement(keywords) {
    return {
      title_placement: `Include "${keywords[0] || 'primary keyword'}" in page titles`,
      heading_placement: `Use keywords in H1, H2, and H3 tags strategically`,
      content_placement: `Distribute keywords naturally throughout content`,
      meta_placement: `Include keywords in meta descriptions and alt tags`,
      url_placement: `Use keywords in URL structure when possible`
    };
  }
  
  generateInternalLinking(keywords) {
    return {
      anchor_texts: keywords.slice(0, 5),
      linking_opportunities: [
        { from: 'FAQ', to: 'Product Page', anchor: keywords[0] || 'product info' },
        { from: 'Product Page', to: 'Comparison', anchor: 'compare products' },
        { from: 'Comparison', to: 'FAQ', anchor: 'learn more' }
      ],
      link_strategy: 'Use descriptive anchor text with target keywords'
    };
  }
  
  generateTechnicalSeoRecommendations() {
    return [
      'Optimize page loading speed for better user experience',
      'Ensure mobile-friendly responsive design',
      'Implement proper heading hierarchy (H1 > H2 > H3)',
      'Add alt text to all images with relevant keywords',
      'Create XML sitemap for better crawling',
      'Optimize URL structure with keywords'
    ];
  }
  
  calculateSeoScore() {
    let score = 0;
    
    // Keyword analysis score (40%)
    const keywordScore = Math.min(100, this.keywordDatabase.size * 8);
    score += keywordScore * 0.4;
    
    // Content optimization score (30%)
    const contentScore = 75; // Default good score
    score += contentScore * 0.3;
    
    // Technical SEO score (30%)
    const technicalScore = 80; // Default good score
    score += technicalScore * 0.3;
    
    return Math.round(score);
  }
  
  identifyOptimizationOpportunities() {
    const opportunities = [];
    
    if (this.keywordDatabase.size < 10) {
      opportunities.push({
        type: 'keyword_expansion',
        priority: 'high',
        description: 'Expand keyword research to identify more opportunities',
        potential_impact: 'Increased organic traffic'
      });
    }
    
    opportunities.push({
      type: 'content_optimization',
      priority: 'medium',
      description: 'Optimize existing content with identified keywords',
      potential_impact: 'Better search rankings'
    });
    
    opportunities.push({
      type: 'technical_seo',
      priority: 'medium',
      description: 'Implement technical SEO improvements',
      potential_impact: 'Enhanced crawlability and user experience'
    });
    
    return opportunities;
  }
  
  generateCompetitiveAnalysis(keywords) {
    return {
      target_keywords: keywords,
      competition_level: {
        low_competition: keywords.filter(k => this.keywordDatabase.get(k)?.competition === 'low'),
        medium_competition: keywords.filter(k => this.keywordDatabase.get(k)?.competition === 'medium'),
        high_competition: keywords.filter(k => this.keywordDatabase.get(k)?.competition === 'high')
      },
      strategy_recommendations: [
        'Focus on long-tail keywords with lower competition',
        'Create comprehensive content around primary keywords',
        'Build topical authority in skincare niche'
      ]
    };
  }
  
  async saveSeoOptimization() {
    console.log(`💾 [${this.id}] Saving SEO optimization data`);
    
    try {
      const fs = await import('fs');
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      
      fs.writeFileSync('output/seo_optimization.json', JSON.stringify(this.seoData, null, 2));
      
      // Broadcast SEO completion
      await this.broadcastMessage('seo_optimization_completed', {
        seo_data: this.seoData,
        generator: this.id
      });
      
      this.goals.delete('save_seo_optimization');
      return { success: true, message: 'SEO optimization data saved' };
    } catch (error) {
      throw new Error(`Failed to save SEO optimization: ${error.message}`);
    }
  }
  
  async handleMessage(message) {
    if (message.type === 'content_generated') {
      const contentType = message.content.contentType + '_content';
      this.beliefs.set(contentType, message.content.data);
      console.log(`🔍 [${this.id}] Received ${message.content.contentType} content for SEO analysis`);
    }
    
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
      console.log(`🔍 [${this.id}] Received clean data for SEO analysis`);
    }
  }
}