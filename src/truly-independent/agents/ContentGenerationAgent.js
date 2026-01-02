import { IndependentAgent } from '../IndependentAgent.js';
import { DataProcessingCapability } from '../capabilities/DataProcessingCapability.js';
import { CommunicationCapability } from '../capabilities/CommunicationCapability.js';
import { OpportunisticReasoning } from '../reasoning/OpportunisticReasoning.js';

/**
 * ContentGenerationAgent - A truly independent agent for content generation
 * 
 * This agent demonstrates true independence by:
 * 1. Making its own decisions about what content to generate
 * 2. Adapting its strategy based on available data
 * 3. Learning from its content generation experiences
 * 4. Collaborating with other agents when beneficial
 * 5. Modifying its goals based on what it discovers
 */
export class ContentGenerationAgent extends IndependentAgent {
  constructor(config = {}) {
    const agentConfig = {
      id: config.id || 'content_generator',
      name: config.name || 'ContentGenerationAgent',
      autonomyLevel: config.autonomyLevel || 0.8,
      adaptabilityLevel: config.adaptabilityLevel || 0.7,
      learningRate: config.learningRate || 0.1,
      
      // Modular capabilities
      capabilities: [
        {
          name: 'data_processing',
          type: 'analysis',
          execute: DataProcessingCapability.execute,
          canExecute: DataProcessingCapability.canExecute,
          cost: DataProcessingCapability.cost,
          reliability: DataProcessingCapability.reliability,
          parameters: DataProcessingCapability.parameters
        },
        {
          name: 'communication',
          type: 'interaction',
          execute: CommunicationCapability.execute,
          canExecute: CommunicationCapability.canExecute,
          cost: CommunicationCapability.cost,
          reliability: CommunicationCapability.reliability,
          parameters: CommunicationCapability.parameters
        }
      ],
      
      // Modular behaviors
      behaviors: [],
      
      // Modular reasoning strategies
      reasoningStrategies: [
        {
          name: 'opportunistic',
          evaluate: OpportunisticReasoning.evaluate,
          decide: OpportunisticReasoning.decide,
          learn: OpportunisticReasoning.learn,
          adapt: OpportunisticReasoning.adapt
        }
      ]
    };
    
    super(agentConfig);
    
    // Content-specific state
    this.contentTypes = ['faq', 'product_page', 'comparison_page'];
    this.generatedContent = new Map();
    this.contentStrategies = new Map();
    this.qualityMetrics = new Map();
    
    // Add content generation capability after super() call
    this.addCapability('content_generation', {
      name: 'content_generation',
      type: 'creation',
      execute: this.generateContent.bind(this),
      canExecute: this.canGenerateContent.bind(this),
      cost: 3,
      reliability: 0.85
    });
    
    // Add content-focused reasoning strategy
    this.addReasoningStrategy('content_focused', {
      name: 'content_focused',
      evaluate: this.evaluateContentOpportunities.bind(this),
      decide: this.makeContentDecision.bind(this),
      learn: this.learnFromContentGeneration.bind(this),
      adapt: this.adaptContentStrategy.bind(this)
    });
    
    // Initialize content strategies
    this.initializeContentStrategies();
    
    console.log(`📝 [${this.name}] Content generation agent initialized`);
    console.log(`   Content Types: ${this.contentTypes.join(', ')}`);
    console.log(`   Strategies: ${Array.from(this.contentStrategies.keys()).join(', ')}`);
  }
  
  /**
   * Initialize content generation strategies
   */
  initializeContentStrategies() {
    this.contentStrategies.set('faq', {
      minQuestions: 5,
      categories: ['informational', 'safety', 'usage', 'purchase', 'comparison'],
      questionTypes: ['what', 'how', 'why', 'when', 'where'],
      complexity: 'moderate'
    });
    
    this.contentStrategies.set('product_page', {
      sections: ['overview', 'benefits', 'usage', 'ingredients', 'pricing'],
      tone: 'informative',
      length: 'comprehensive',
      focus: 'customer_value'
    });
    
    this.contentStrategies.set('comparison_page', {
      comparisonPoints: ['price', 'ingredients', 'benefits', 'usage', 'suitability'],
      format: 'side_by_side',
      objectivity: 'balanced',
      depth: 'detailed'
    });
  }
  
  /**
   * Override goal completion check for content-specific goals
   */
  isGoalCompleted(goal, situation) {
    if (goal === 'generate_content') {
      // Check if we have generated all required content types
      const requiredTypes = this.contentTypes;
      const generatedTypes = Array.from(this.generatedContent.keys());
      const allGenerated = requiredTypes.every(type => generatedTypes.includes(type));
      
      if (allGenerated) {
        console.log(`✅ [${this.name}] All content types generated: ${generatedTypes.join(', ')}`);
      }
      
      return allGenerated;
    }
    
    if (goal === 'analyze_available_data') {
      // Check if we have processed available data
      return situation.beliefs.processed_data && situation.beliefs.processed_data.confidence > 0.7;
    }
    
    return super.isGoalCompleted(goal, situation);
  }
  
  /**
   * Override goal generation for content-specific goals
   */
  generateNewGoals(situation) {
    const newGoals = super.generateNewGoals(situation);
    
    // Generate content-specific goals based on situation
    if ((situation.beliefs.data_productData || situation.beliefs.env_productData || situation.beliefs.processed_data) && !this.goals.has('generate_content')) {
      newGoals.push('generate_content');
    }
    
    if (this.generatedContent.size > 0 && !this.goals.has('optimize_content_quality')) {
      newGoals.push('optimize_content_quality');
    }
    
    // Look for collaboration opportunities
    const otherAgents = situation.beliefs.other_agents?.value || [];
    const hasAnalysisAgent = otherAgents.some(agentName => 
      typeof agentName === 'string' && (agentName.includes('analysis') || agentName.includes('data'))
    );
    if (hasAnalysisAgent && !this.goals.has('collaborate_with_analysts')) {
      newGoals.push('collaborate_with_analysts');
    }
    
    return newGoals;
  }
  
  /**
   * Content generation capability
   */
  async generateContent(params, agent) {
    const { contentType, data, strategy } = params;
    
    console.log(`📝 [${agent.name}] Generating ${contentType} content`);
    
    if (!data) {
      throw new Error('No data provided for content generation');
    }
    
    const contentStrategy = agent.contentStrategies.get(contentType) || {};
    const result = {
      contentType: contentType,
      strategy: strategy || 'default',
      timestamp: new Date().toISOString(),
      quality: 0
    };
    
    try {
      switch (contentType) {
        case 'faq':
          result.content = await agent.generateFAQContent(data, contentStrategy);
          break;
        case 'product_page':
          result.content = await agent.generateProductPageContent(data, contentStrategy);
          break;
        case 'comparison_page':
          result.content = await agent.generateComparisonPageContent(data, contentStrategy);
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }
      
      result.quality = agent.assessContentQuality(result.content, contentType);
      
      // Store generated content
      agent.generatedContent.set(contentType, result);
      
      // Share content with environment
      if (agent.environment) {
        agent.environment.addData(`generated_${contentType}`, result.content, agent.name, {
          type: 'generated_content',
          contentType: contentType,
          quality: result.quality
        });
        
        // Also save to file system for assignment compliance
        try {
          const fs = await import('fs');
          if (!fs.existsSync('output')) {
            fs.mkdirSync('output', { recursive: true });
          }
          
          const filename = `output/${contentType}.json`;
          fs.writeFileSync(filename, JSON.stringify(result.content, null, 2));
          console.log(`💾 [${agent.name}] Saved ${contentType} to ${filename}`);
        } catch (error) {
          console.warn(`⚠️  [${agent.name}] Could not save ${contentType} to file: ${error.message}`);
        }
      }
      
      return result;
      
    } catch (error) {
      result.error = error.message;
      throw error;
    }
  }
  
  /**
   * Check if agent can generate content
   */
  canGenerateContent(params, agent) {
    return params.contentType && agent.contentTypes.includes(params.contentType) && params.data;
  }
  
  /**
   * Generate FAQ content
   */
  async generateFAQContent(data, strategy) {
    const questions = [];
    const categories = strategy.categories || ['informational', 'usage', 'safety'];
    const minQuestions = strategy.minQuestions || 5;
    
    console.log(`📝 [${this.name}] Generating FAQ with data:`, Object.keys(data));
    
    // Generate questions for each category
    for (const category of categories) {
      const categoryQuestions = this.generateQuestionsForCategory(data, category);
      questions.push(...categoryQuestions);
    }
    
    // Ensure minimum number of questions
    while (questions.length < minQuestions) {
      const additionalQuestion = this.generateGenericQuestion(data, questions.length);
      questions.push(additionalQuestion);
    }
    
    return {
      title: `Frequently Asked Questions - ${data.productName || 'Product'}`,
      description: `Common questions and answers about ${data.productName || 'this product'}`,
      categories: categories,
      questions: questions,
      totalQuestions: questions.length,
      generatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Generate questions for specific category
   */
  generateQuestionsForCategory(data, category) {
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
   * Generate generic question
   */
  generateGenericQuestion(data, index) {
    const genericQuestions = [
      {
        question: `Who should use ${data.productName || 'this product'}?`,
        answer: `${data.productName || 'This product'} is suitable for people with ${data.skinType || 'various skin types'} looking for ${data.benefits || 'skincare benefits'}.`
      },
      {
        question: `How long does it take to see results with ${data.productName || 'this product'}?`,
        answer: `Results with ${data.productName || 'this product'} may vary, but many users notice improvements within a few weeks of consistent use.`
      },
      {
        question: `Can I use ${data.productName || 'this product'} with other skincare products?`,
        answer: `Yes, ${data.productName || 'this product'} can typically be incorporated into your existing skincare routine. ${data.howToUse || 'Follow the usage instructions for best results.'}`
      }
    ];
    
    return {
      category: 'general',
      ...genericQuestions[index % genericQuestions.length]
    };
  }
  
  /**
   * Generate product page content
   */
  async generateProductPageContent(data, strategy) {
    const sections = strategy.sections || ['overview', 'benefits', 'usage', 'ingredients'];
    const content = {
      title: data.productName || 'Product',
      sections: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        strategy: strategy,
        dataSource: 'product_data'
      }
    };
    
    for (const section of sections) {
      content.sections[section] = this.generateProductSection(data, section);
    }
    
    return content;
  }
  
  /**
   * Generate product page section
   */
  generateProductSection(data, section) {
    switch (section) {
      case 'overview':
        return {
          title: 'Product Overview',
          content: `${data.productName || 'This product'} is a ${data.concentration || ''} skincare solution featuring ${data.keyIngredients || 'premium ingredients'}. Designed specifically for ${data.skinType || 'various skin types'}, it delivers ${data.benefits || 'exceptional results'}.`
        };
        
      case 'benefits':
        return {
          title: 'Key Benefits',
          content: data.benefits || 'Provides comprehensive skincare benefits',
          list: data.benefits ? data.benefits.split(',').map(b => b.trim()) : []
        };
        
      case 'usage':
        return {
          title: 'How to Use',
          content: data.howToUse || 'Follow product instructions for best results',
          instructions: data.howToUse ? [data.howToUse] : []
        };
        
      case 'ingredients':
        return {
          title: 'Key Ingredients',
          content: data.keyIngredients || 'Premium skincare ingredients',
          list: data.keyIngredients ? data.keyIngredients.split(',').map(i => i.trim()) : []
        };
        
      case 'pricing':
        return {
          title: 'Pricing',
          content: `Available for ${data.price || 'competitive pricing'}`,
          price: data.price
        };
        
      default:
        return {
          title: section.charAt(0).toUpperCase() + section.slice(1),
          content: `Information about ${section}`
        };
    }
  }
  
  /**
   * Generate comparison page content
   */
  async generateComparisonPageContent(data, strategy) {
    // Create fictional competitor for comparison
    const competitor = this.createFictionalCompetitor(data);
    
    const comparisonPoints = strategy.comparisonPoints || ['price', 'ingredients', 'benefits'];
    const comparison = {
      title: `${data.productName || 'Product'} vs ${competitor.productName}`,
      description: `Detailed comparison between ${data.productName || 'our product'} and ${competitor.productName}`,
      products: {
        primary: data,
        competitor: competitor
      },
      comparison: {},
      summary: {},
      metadata: {
        generatedAt: new Date().toISOString(),
        comparisonType: 'product_vs_competitor'
      }
    };
    
    for (const point of comparisonPoints) {
      comparison.comparison[point] = this.compareProducts(data, competitor, point);
    }
    
    comparison.summary = this.generateComparisonSummary(data, competitor, comparison.comparison);
    
    return comparison;
  }
  
  /**
   * Create fictional competitor
   */
  createFictionalCompetitor(originalProduct) {
    const competitorNames = ['RadiantGlow Serum', 'PureBright Formula', 'VitaLux Treatment', 'GlowMax Essence'];
    const competitorName = competitorNames[Math.floor(Math.random() * competitorNames.length)];
    
    // Create competitor with similar but different attributes
    const originalPrice = parseFloat((originalProduct.price || '₹699').replace(/[^\d.]/g, ''));
    const competitorPrice = Math.round(originalPrice * (0.8 + Math.random() * 0.4)); // ±20% price variation
    
    return {
      productName: competitorName,
      concentration: '15% Vitamin C', // Different concentration
      skinType: 'All skin types', // Broader target
      keyIngredients: 'Vitamin C, Niacinamide, Peptides', // Different ingredients
      benefits: 'Anti-aging, Hydration, Pore minimizing', // Different benefits
      howToUse: 'Apply 3-4 drops in the evening after cleansing',
      sideEffects: 'May cause initial dryness',
      price: `₹${competitorPrice}`,
      fictional: true
    };
  }
  
  /**
   * Compare products on specific point
   */
  compareProducts(product1, product2, point) {
    switch (point) {
      case 'price':
        const price1 = parseFloat((product1.price || '0').replace(/[^\d.]/g, ''));
        const price2 = parseFloat((product2.price || '0').replace(/[^\d.]/g, ''));
        return {
          [product1.productName || 'Product 1']: product1.price,
          [product2.productName || 'Product 2']: product2.price,
          winner: price1 < price2 ? product1.productName : product2.productName,
          difference: Math.abs(price1 - price2),
          analysis: price1 < price2 ? 'More affordable option' : 'Premium pricing'
        };
        
      case 'ingredients':
        return {
          [product1.productName || 'Product 1']: product1.keyIngredients,
          [product2.productName || 'Product 2']: product2.keyIngredients,
          analysis: 'Both products feature vitamin C as the primary active ingredient'
        };
        
      case 'benefits':
        return {
          [product1.productName || 'Product 1']: product1.benefits,
          [product2.productName || 'Product 2']: product2.benefits,
          analysis: 'Each product targets different primary concerns'
        };
        
      case 'usage':
        return {
          [product1.productName || 'Product 1']: product1.howToUse,
          [product2.productName || 'Product 2']: product2.howToUse,
          analysis: 'Different application methods and timing'
        };
        
      case 'suitability':
        return {
          [product1.productName || 'Product 1']: product1.skinType,
          [product2.productName || 'Product 2']: product2.skinType,
          analysis: 'Consider your specific skin type when choosing'
        };
        
      default:
        return {
          analysis: `Comparison point ${point} requires additional data`
        };
    }
  }
  
  /**
   * Generate comparison summary
   */
  generateComparisonSummary(product1, product2, comparisons) {
    return {
      recommendation: `${product1.productName || 'Product 1'} offers excellent value with targeted benefits for ${product1.skinType || 'specific skin types'}`,
      keyDifferences: [
        'Different concentrations and formulations',
        'Varying price points and value propositions',
        'Distinct usage instructions and timing'
      ],
      bestFor: {
        [product1.productName || 'Product 1']: `Users with ${product1.skinType || 'specific skin types'} seeking ${product1.benefits || 'targeted benefits'}`,
        [product2.productName || 'Product 2']: `Users looking for ${product2.benefits || 'alternative benefits'} with ${product2.skinType || 'broader compatibility'}`
      }
    };
  }
  
  /**
   * Assess content quality
   */
  assessContentQuality(content, contentType) {
    let score = 50; // Base score
    
    if (!content) return 0;
    
    // Check completeness
    if (contentType === 'faq') {
      if (content.questions && content.questions.length >= 5) score += 20;
      if (content.categories && content.categories.length >= 3) score += 15;
      if (content.questions && content.questions.every(q => q.question && q.answer)) score += 15;
    } else if (contentType === 'product_page') {
      if (content.sections && Object.keys(content.sections).length >= 3) score += 20;
      if (content.title) score += 10;
      if (content.sections && content.sections.overview) score += 20;
    } else if (contentType === 'comparison_page') {
      if (content.products && content.products.primary && content.products.competitor) score += 25;
      if (content.comparison && Object.keys(content.comparison).length >= 3) score += 15;
      if (content.summary) score += 10;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Content-focused reasoning strategy - evaluate content opportunities
   */
  evaluateContentOpportunities(situation, agent) {
    const opportunities = [];
    
    // Look for data that can be used for content generation
    for (const [key, belief] of Object.entries(situation.beliefs)) {
      if ((key.includes('productData') || key.includes('processed_data') || key.includes('analysis')) && belief.value) {
        for (const contentType of agent.contentTypes) {
          if (!agent.generatedContent.has(contentType)) {
            opportunities.push({
              type: 'content_generation',
              contentType: contentType,
              dataSource: key,
              value: 30,
              confidence: belief.confidence || 0.8,
              data: belief.value // Include actual data
            });
          }
        }
      }
    }
    
    return {
      opportunities: opportunities,
      contentGenerationScore: opportunities.length * 10,
      readiness: opportunities.length > 0 ? 0.8 : 0.2
    };
  }
  
  /**
   * Make content-focused decision
   */
  makeContentDecision(situation, agent) {
    const evaluation = agent.evaluateContentOpportunities(situation, agent);
    
    if (evaluation.opportunities.length === 0) {
      return null;
    }

    // Choose highest value opportunity that we haven't generated yet
    const availableOpportunities = evaluation.opportunities.filter(opp => 
      !agent.generatedContent.has(opp.contentType)
    );
    
    if (availableOpportunities.length === 0) {
      // All content types generated, no more content decisions needed
      return null;
    }
    
    const bestOpportunity = availableOpportunities.reduce((best, current) => 
      current.value > best.value ? current : best
    );
    
    // Get the actual product data to use
    let dataToUse = null;
    
    // Try to get the original product data from environment
    if (agent.environment && agent.environment.getData) {
      const productDataObj = agent.environment.getData('productData');
      if (productDataObj && productDataObj.value) {
        dataToUse = productDataObj.value;
        console.log(`📊 [${agent.name}] Using original product data:`, Object.keys(dataToUse));
      }
    }
    
    // Fallback to processed data if available
    if (!dataToUse && situation.beliefs.processed_data?.value) {
      dataToUse = situation.beliefs.processed_data.value;
      console.log(`📊 [${agent.name}] Using processed data:`, Object.keys(dataToUse));
    }
    
    // Fallback to belief data
    if (!dataToUse) {
      if (situation.beliefs.data_productData?.value) {
        dataToUse = situation.beliefs.data_productData.value;
      } else if (situation.beliefs.env_productData?.value) {
        dataToUse = situation.beliefs.env_productData.value;
      }
    }
    
    if (!dataToUse) {
      console.log(`⚠️  [${agent.name}] No product data available for content generation`);
      return null;
    }
    
    return {
      type: 'generate_content',
      action: 'content_generation',
      capability: 'content_generation',
      parameters: {
        contentType: bestOpportunity.contentType,
        data: dataToUse,
        strategy: 'autonomous'
      },
      expectedValue: bestOpportunity.value,
      reasoning: `Generating ${bestOpportunity.contentType} content from product data`
    };
  }
  
  /**
   * Learn from content generation
   */
  learnFromContentGeneration(decision, result, situation, agent) {
    if (decision.type !== 'generate_content') return;
    
    const contentType = decision.parameters.contentType;
    const success = result.success;
    const quality = result.data?.quality || 0;
    
    // Update quality metrics
    if (!agent.qualityMetrics.has(contentType)) {
      agent.qualityMetrics.set(contentType, {
        attempts: 0,
        successes: 0,
        averageQuality: 0,
        totalQuality: 0
      });
    }
    
    const metrics = agent.qualityMetrics.get(contentType);
    metrics.attempts++;
    if (success) {
      metrics.successes++;
      metrics.totalQuality += quality;
      metrics.averageQuality = metrics.totalQuality / metrics.successes;
    }
    
    agent.qualityMetrics.set(contentType, metrics);
    
    console.log(`🧠 [${agent.name}] Learned from ${contentType} generation: quality ${quality}/100`);
  }
  
  /**
   * Adapt content strategy
   */
  adaptContentStrategy(agent) {
    // Adjust strategies based on quality metrics
    for (const [contentType, metrics] of agent.qualityMetrics.entries()) {
      if (metrics.attempts > 2 && metrics.averageQuality < 70) {
        // Improve strategy for low-quality content
        const strategy = agent.contentStrategies.get(contentType);
        if (strategy) {
          if (contentType === 'faq') {
            strategy.minQuestions = Math.min(strategy.minQuestions + 2, 15);
          } else if (contentType === 'product_page') {
            strategy.sections = [...new Set([...strategy.sections, 'detailed_benefits', 'usage_tips'])];
          }
          
          agent.contentStrategies.set(contentType, strategy);
          console.log(`📈 [${agent.name}] Adapted ${contentType} strategy for better quality`);
        }
      }
    }
  }
  
  /**
   * Behavior: Should discover data
   */
  shouldDiscoverData(situation, agent) {
    return !situation.beliefs.env_productData && agent.goals.has('analyze_available_data');
  }
  
  /**
   * Behavior: Discover available data
   */
  async discoverAvailableData(situation, agent) {
    if (agent.environment) {
      const availableData = agent.environment.getAvailableData();
      
      for (const [key, dataInfo] of Object.entries(availableData)) {
        if (key.includes('product') || key.includes('data')) {
          const data = agent.environment.getData(key);
          if (data) {
            agent.beliefs.set(`env_${key}`, {
              value: data.value,
              confidence: dataInfo.confidence,
              timestamp: Date.now()
            });
            
            console.log(`🔍 [${agent.name}] Discovered data: ${key}`);
          }
        }
      }
    }
  }
  
  /**
   * Behavior: Should seek collaboration
   */
  shouldSeekCollaboration(situation, agent) {
    const otherAgents = situation.beliefs.other_agents?.value || [];
    return otherAgents.length > 0 && agent.goals.has('collaborate_with_analysts');
  }
  
  /**
   * Behavior: Seek collaboration
   */
  async seekCollaboration(situation, agent) {
    const otherAgents = situation.beliefs.other_agents?.value || [];
    
    for (const otherAgent of otherAgents) {
      if (typeof otherAgent === 'string' && (otherAgent.includes('analysis') || otherAgent.includes('data'))) {
        if (agent.capabilities.has('communication')) {
          try {
            await agent.capabilities.get('communication').execute({
              protocol: 'direct',
              target: otherAgent,
              messageType: 'collaboration_proposal',
              content: {
                type: 'content_collaboration',
                proposal: 'Share analysis results for content generation',
                offeredCapabilities: ['content_generation'],
                requestedCapabilities: ['data_analysis']
              }
            }, agent);
            
            console.log(`🤝 [${agent.name}] Proposed collaboration with ${otherAgent}`);
          } catch (error) {
            console.log(`⚠️  [${agent.name}] Failed to contact ${otherAgent}: ${error.message}`);
          }
        }
      }
    }
  }
  
  /**
   * Behavior: Should optimize content
   */
  shouldOptimizeContent(situation, agent) {
    return agent.generatedContent.size > 0 && agent.goals.has('optimize_content_quality');
  }
  
  /**
   * Behavior: Optimize content strategy
   */
  async optimizeContentStrategy(situation, agent) {
    for (const [contentType, content] of agent.generatedContent.entries()) {
      if (content.quality < 80) {
        console.log(`🔧 [${agent.name}] Optimizing ${contentType} strategy (current quality: ${content.quality})`);
        
        // Regenerate with improved strategy
        const data = situation.beliefs.env_productData?.value;
        if (data && agent.capabilities.has('content_generation')) {
          try {
            await agent.capabilities.get('content_generation').execute({
              contentType: contentType,
              data: data,
              strategy: 'optimized'
            }, agent);
          } catch (error) {
            console.log(`⚠️  [${agent.name}] Failed to regenerate ${contentType}: ${error.message}`);
          }
        }
      }
    }
  }
  
  /**
   * Handle incoming messages
   */
  async handleIncomingMessage(message) {
    console.log(`📨 [${this.name}] Received message: ${message.type} from ${message.from}`);
    
    switch (message.type) {
      case 'data_sharing':
        await this.handleDataSharing(message);
        break;
      case 'collaboration_response':
        await this.handleCollaborationResponse(message);
        break;
      case 'content_request':
        await this.handleContentRequest(message);
        break;
      default:
        if (this.capabilities.has('communication')) {
          await CommunicationCapability.handleIncomingMessage(this, message);
        }
    }
  }
  
  /**
   * Handle data sharing message
   */
  async handleDataSharing(message) {
    const sharedData = message.content;
    
    if (sharedData.type === 'analysis_result' || sharedData.type === 'processed_data') {
      this.beliefs.set('shared_analysis', {
        value: sharedData.data,
        source: message.from,
        timestamp: Date.now(),
        confidence: 0.9
      });
      
      console.log(`📊 [${this.name}] Received analysis data from ${message.from}`);
      
      // Trigger content generation if we have the goal
      if (this.goals.has('generate_content')) {
        this.goals.add('use_shared_analysis');
      }
    }
  }
  
  /**
   * Handle collaboration response
   */
  async handleCollaborationResponse(message) {
    const response = message.content;
    
    if (response.collaboration === 'accepted') {
      console.log(`🤝 [${this.name}] Collaboration accepted by ${message.from}`);
      
      // Add collaboration goal
      this.goals.add('active_collaboration');
      
      // Update beliefs about collaborator
      this.beliefs.set('collaborator', {
        value: message.from,
        capabilities: response.capabilities || [],
        timestamp: Date.now(),
        confidence: 1.0
      });
    }
  }
  
  /**
   * Handle content request
   */
  async handleContentRequest(message) {
    const request = message.content;
    
    if (request.contentType && this.contentTypes.includes(request.contentType)) {
      const hasContent = this.generatedContent.has(request.contentType);
      
      if (hasContent && this.capabilities.has('communication')) {
        const content = this.generatedContent.get(request.contentType);
        
        await this.capabilities.get('communication').execute({
          protocol: 'direct',
          target: message.from,
          messageType: 'content_response',
          content: {
            contentType: request.contentType,
            content: content.content,
            quality: content.quality,
            timestamp: content.timestamp
          }
        }, this);
        
        console.log(`📤 [${this.name}] Shared ${request.contentType} content with ${message.from}`);
      }
    }
  }
  
  /**
   * Get agent-specific status
   */
  getStatus() {
    const baseStatus = super.getStatus();
    
    return {
      ...baseStatus,
      contentGeneration: {
        supportedTypes: this.contentTypes,
        generatedContent: Array.from(this.generatedContent.keys()),
        qualityMetrics: Object.fromEntries(this.qualityMetrics.entries()),
        strategies: Object.fromEntries(this.contentStrategies.entries())
      }
    };
  }
}