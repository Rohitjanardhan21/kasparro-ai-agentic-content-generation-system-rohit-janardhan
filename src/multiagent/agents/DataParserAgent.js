import { TrueAgent } from '../TrueAgent.js';

/**
 * DataParserAgent - A truly independent agent that parses data autonomously
 * 
 * This agent:
 * 1. Monitors the environment for raw data
 * 2. Decides when to parse data based on its goals
 * 3. Negotiates with other agents about data quality
 * 4. Shares parsed results when ready
 * 5. Operates completely independently
 */
export class DataParserAgent extends TrueAgent {
  constructor() {
    super(
      'DataParserAgent',
      ['data_parsing', 'data_validation', 'data_normalization'],
      ['parse_available_data', 'ensure_data_quality', 'share_clean_data']
    );
    
    this.dataQualityThreshold = 80;
    this.parsingAttempts = 0;
    this.maxAttempts = 3;
  }

  /**
   * Check if agent can pursue a specific goal
   */
  canPursueGoal(goal) {
    switch (goal) {
      case 'parse_available_data':
        // Can parse if raw data is available and not already parsed
        return this.beliefs.has('data_available_productData') && 
               !this.beliefs.has('parsed_data_complete');
      
      case 'ensure_data_quality':
        // Can validate if parsing is complete but quality not ensured
        return this.beliefs.has('parsed_data_complete') && 
               !this.beliefs.has('quality_assured');
      
      case 'share_clean_data':
        // Can share if data is parsed and quality assured
        return this.beliefs.has('parsed_data_complete') && 
               this.beliefs.has('quality_assured') &&
               !this.beliefs.has('data_shared');
      
      default:
        return false;
    }
  }

  /**
   * Calculate priority for goals
   */
  calculateGoalPriority(goal) {
    switch (goal) {
      case 'parse_available_data':
        return 90; // High priority - foundational task
      case 'ensure_data_quality':
        return 80; // Important for system reliability
      case 'share_clean_data':
        return 70; // Important for other agents
      default:
        return 50;
    }
  }

  /**
   * Perform action for a specific goal
   */
  async performGoalAction(goal) {
    switch (goal) {
      case 'parse_available_data':
        await this.autonomouslyParseData();
        break;
      case 'ensure_data_quality':
        await this.autonomouslyEnsureQuality();
        break;
      case 'share_clean_data':
        await this.autonomouslyShareData();
        break;
    }
  }

  /**
   * Autonomously parse available data
   */
  async autonomouslyParseData() {
    console.log(`🔍 [${this.name}] Autonomously parsing data (attempt ${this.parsingAttempts + 1})`);
    
    try {
      // Get raw data from environment
      const rawDataBelief = this.beliefs.get('data_available_productData');
      if (!rawDataBelief) {
        throw new Error('No raw data available for parsing');
      }
      
      const rawData = rawDataBelief.data.data;
      this.parsingAttempts++;
      
      // Validate input structure
      this.validateInputStructure(rawData);
      
      // Parse and clean the data
      const parsedData = {
        product: {
          name: this.cleanString(rawData.productName),
          concentration: this.cleanString(rawData.concentration),
          skinType: this.cleanString(rawData.skinType),
          keyIngredients: this.cleanString(rawData.keyIngredients),
          benefits: this.cleanString(rawData.benefits),
          howToUse: this.cleanString(rawData.howToUse),
          sideEffects: this.cleanString(rawData.sideEffects),
          price: this.cleanString(rawData.price)
        },
        metadata: {
          parsed_at: new Date().toISOString(),
          parsed_by: this.name,
          parsing_attempt: this.parsingAttempts,
          data_version: '1.0'
        }
      };
      
      // Store in agent's knowledge
      this.knowledge.set('parsed_data', parsedData);
      this.beliefs.set('parsed_data_complete', true);
      
      // Share with environment
      this.environment.addData('parsed_data', parsedData, this.name);
      
      console.log(`✅ [${this.name}] Successfully parsed product: ${parsedData.product.name}`);
      
      // Notify other agents
      this.broadcast('data_offer', {
        type: 'parsed_product_data',
        quality: 'preliminary',
        from: this.name
      });
      
    } catch (error) {
      console.error(`❌ [${this.name}] Parsing failed:`, error.message);
      
      if (this.parsingAttempts < this.maxAttempts) {
        console.log(`🔄 [${this.name}] Will retry parsing...`);
      } else {
        console.log(`🚫 [${this.name}] Max parsing attempts reached`);
        this.beliefs.set('parsing_failed', true);
      }
    }
  }

  /**
   * Autonomously ensure data quality
   */
  async autonomouslyEnsureQuality() {
    console.log(`🔍 [${this.name}] Autonomously ensuring data quality...`);
    
    const parsedData = this.knowledge.get('parsed_data');
    if (!parsedData) {
      console.error(`❌ [${this.name}] No parsed data to validate`);
      return;
    }
    
    // Perform quality assessment
    const qualityScore = this.assessDataQuality(parsedData);
    
    if (qualityScore >= this.dataQualityThreshold) {
      console.log(`✅ [${this.name}] Data quality acceptable (score: ${qualityScore})`);
      this.beliefs.set('quality_assured', true);
      this.knowledge.set('quality_score', qualityScore);
      
      // Notify other agents about quality
      this.broadcast('result_share', {
        type: 'quality_assessment',
        score: qualityScore,
        status: 'passed',
        from: this.name
      });
      
    } else {
      console.log(`⚠️  [${this.name}] Data quality below threshold (score: ${qualityScore})`);
      
      // Negotiate with other agents for additional data or processing
      await this.negotiateQualityImprovement(qualityScore);
    }
  }

  /**
   * Autonomously share clean data
   */
  async autonomouslyShareData() {
    console.log(`📤 [${this.name}] Autonomously sharing clean data...`);
    
    const parsedData = this.knowledge.get('parsed_data');
    const qualityScore = this.knowledge.get('quality_score');
    
    if (!parsedData) {
      console.error(`❌ [${this.name}] No data to share`);
      return;
    }
    
    // Add quality metadata
    const cleanData = {
      ...parsedData,
      quality: {
        score: qualityScore,
        assured_by: this.name,
        assured_at: new Date().toISOString()
      }
    };
    
    // Share with environment
    this.environment.addData('clean_product_data', cleanData, this.name);
    this.beliefs.set('data_shared', true);
    
    // Notify interested agents
    this.broadcast('data_offer', {
      type: 'clean_product_data',
      quality: 'assured',
      score: qualityScore,
      from: this.name
    });
    
    console.log(`✅ [${this.name}] Clean data shared with quality score: ${qualityScore}`);
  }

  /**
   * Assess data quality
   */
  assessDataQuality(data) {
    let score = 100;
    const product = data.product;
    
    // Check required fields
    const requiredFields = ['name', 'concentration', 'skinType', 'keyIngredients', 'benefits'];
    for (const field of requiredFields) {
      if (!product[field] || product[field].trim().length === 0) {
        score -= 20;
      }
    }
    
    // Check data format quality
    if (product.price && !product.price.includes('₹')) {
      score -= 10;
    }
    
    if (product.concentration && !product.concentration.toLowerCase().includes('vitamin c')) {
      score -= 15;
    }
    
    return Math.max(0, score);
  }

  /**
   * Negotiate with other agents for quality improvement
   */
  async negotiateQualityImprovement(currentScore) {
    console.log(`🤝 [${this.name}] Negotiating quality improvement (current: ${currentScore})`);
    
    // Find agents that might help improve quality
    const activeAgents = this.environment.getActiveAgents();
    
    for (const agentName of activeAgents) {
      if (agentName !== this.name) {
        await this.negotiate(agentName, {
          type: 'quality_improvement',
          currentScore: currentScore,
          threshold: this.dataQualityThreshold,
          assistance: 'data_enhancement'
        });
      }
    }
  }

  /**
   * Validate input structure
   */
  validateInputStructure(data) {
    const requiredFields = [
      'productName', 'concentration', 'skinType', 'keyIngredients',
      'benefits', 'howToUse', 'sideEffects', 'price'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required input field: ${field}`);
      }
    }
  }

  /**
   * Clean and normalize string data
   */
  cleanString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' ');
  }

  /**
   * Handle data offers from other agents
   */
  handleDataOffer(message) {
    console.log(`📨 [${this.name}] Received data offer: ${message.payload.type}`);
    
    // Agent can decide whether to accept or negotiate
    if (message.payload.type === 'enhanced_data') {
      this.sendMessage(message.from, 'collaboration_request', {
        type: 'data_enhancement_collaboration',
        interested: true
      });
    }
  }

  /**
   * Handle collaboration requests
   */
  handleCollaborationRequest(message) {
    console.log(`🤝 [${this.name}] Received collaboration request from ${message.from}`);
    
    // Agent decides whether to collaborate based on its goals and current state
    const canCollaborate = this.beliefs.has('parsed_data_complete') && 
                          !this.beliefs.has('quality_assured');
    
    this.sendMessage(message.from, 'negotiation', {
      type: 'collaboration_response',
      accepted: canCollaborate,
      reason: canCollaborate ? 'can_help_with_quality' : 'busy_with_parsing'
    });
  }

  /**
   * Handle negotiations
   */
  handleNegotiation(message) {
    console.log(`💼 [${this.name}] Handling negotiation from ${message.from}`);
    
    const payload = message.payload;
    
    if (payload.type === 'collaboration_response' && payload.accepted) {
      console.log(`✅ [${this.name}] Collaboration accepted by ${message.from}`);
      // Agent can now work with the other agent
    }
  }
}