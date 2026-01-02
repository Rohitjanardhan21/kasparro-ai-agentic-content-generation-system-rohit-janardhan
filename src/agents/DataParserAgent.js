/**
 * DataParserAgent - Autonomous agent for data parsing and validation
 * 
 * This agent:
 * 1. Autonomously discovers and validates product data
 * 2. Makes independent decisions about data processing approach
 * 3. Shares clean data with other agents when ready
 * 4. Adapts validation strategies based on data quality
 */

import { BaseAgent } from './BaseAgent.js';

export class DataParserAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'data_parser',
      name: 'DataParserAgent',
      capabilities: ['data_validation', 'data_normalization', 'quality_assessment'],
      initialGoals: ['discover_raw_data', 'validate_data', 'normalize_data', 'share_clean_data']
    });
    
    // Parser-specific state
    this.validationRules = new Map();
    this.processedData = null;
    this.qualityScore = 0;
    
    this.initializeValidationRules();
  }
  
  /**
   * Initialize validation rules
   */
  initializeValidationRules() {
    this.validationRules.set('productName', {
      required: true,
      type: 'string',
      minLength: 3
    });
    
    this.validationRules.set('price', {
      required: true,
      type: 'string',
      pattern: /₹?\d+/
    });
    
    this.validationRules.set('keyIngredients', {
      required: true,
      type: 'string',
      minLength: 5
    });
  }
  
  /**
   * Initialize data parser agent
   */
  async initialize() {
    console.log(`📊 [${this.id}] Data Parser Agent initialized`);
    console.log(`   Validation Rules: ${this.validationRules.size} rules configured`);
  }
  
  /**
   * Decide what action to take based on situation
   */
  decideAction(situation) {
    // Priority 1: Discover raw data if we don't have any
    if (!situation.beliefs.available_data && this.goals.has('discover_raw_data')) {
      return {
        action: 'discover_raw_data',
        reasoning: 'Need to find raw product data to process'
      };
    }
    
    // Priority 2: Validate data if we have it but haven't validated
    if (situation.beliefs.available_data && this.goals.has('validate_data')) {
      return {
        action: 'validate_data',
        data: situation.beliefs.available_data,
        reasoning: 'Validating discovered product data'
      };
    }
    
    // Priority 3: Normalize data after validation
    if (this.processedData && this.goals.has('normalize_data')) {
      return {
        action: 'normalize_data',
        reasoning: 'Normalizing validated data for consistency'
      };
    }
    
    // Priority 4: Share clean data with other agents
    if (this.processedData && this.qualityScore > 70 && this.goals.has('share_clean_data')) {
      return {
        action: 'share_clean_data',
        reasoning: 'Sharing clean, validated data with other agents'
      };
    }
    
    return null; // No action needed
  }
  
  /**
   * Execute a decision
   */
  async executeDecision(decision) {
    try {
      switch (decision.action) {
        case 'discover_raw_data':
          return await this.discoverRawData();
          
        case 'validate_data':
          return await this.validateData(decision.data);
          
        case 'normalize_data':
          return await this.normalizeData();
          
        case 'share_clean_data':
          return await this.shareCleanData();
          
        default:
          return { success: false, message: `Unknown action: ${decision.action}` };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Discover raw data
   */
  async discoverRawData() {
    // Look for data in beliefs (from system events)
    if (this.beliefs.has('available_data')) {
      const data = this.beliefs.get('available_data');
      console.log(`🔍 [${this.id}] Discovered raw data:`, Object.keys(data));
      
      this.goals.delete('discover_raw_data');
      return { success: true, message: 'Raw data discovered', data: data };
    }
    
    return { success: false, message: 'No raw data available yet' };
  }
  
  /**
   * Validate data
   */
  async validateData(data) {
    console.log(`✅ [${this.id}] Validating product data`);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };
    
    // Validate against rules
    for (const [field, rule] of this.validationRules.entries()) {
      const value = data[field];
      
      if (rule.required && (!value || value === '')) {
        validation.errors.push(`Missing required field: ${field}`);
        validation.isValid = false;
        validation.score -= 20;
      } else if (value) {
        if (rule.type === 'string' && typeof value !== 'string') {
          validation.warnings.push(`Field ${field} should be string`);
          validation.score -= 5;
        }
        
        if (rule.minLength && value.length < rule.minLength) {
          validation.warnings.push(`Field ${field} too short`);
          validation.score -= 10;
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          validation.warnings.push(`Field ${field} format invalid`);
          validation.score -= 10;
        }
      }
    }
    
    this.processedData = {
      ...data,
      validation: validation,
      processedAt: new Date().toISOString(),
      processedBy: this.id
    };
    
    this.qualityScore = validation.score;
    
    console.log(`📊 [${this.id}] Validation complete - Score: ${validation.score}/100`);
    
    this.goals.delete('validate_data');
    
    return { 
      success: true, 
      message: `Data validated with score ${validation.score}/100`,
      validation: validation
    };
  }
  
  /**
   * Normalize data
   */
  async normalizeData() {
    console.log(`🔧 [${this.id}] Normalizing data for consistency`);
    
    if (!this.processedData) {
      throw new Error('No processed data to normalize');
    }
    
    const normalized = { ...this.processedData };
    
    // Normalize price format
    if (normalized.price) {
      normalized.price = normalized.price.replace(/[^\d₹]/g, '');
      if (!normalized.price.startsWith('₹')) {
        normalized.price = '₹' + normalized.price.replace('₹', '');
      }
    }
    
    // Normalize ingredient list
    if (normalized.keyIngredients) {
      normalized.keyIngredients = normalized.keyIngredients
        .split(',')
        .map(ingredient => ingredient.trim())
        .join(', ');
    }
    
    // Add normalized flag
    normalized.normalized = true;
    normalized.normalizedAt = new Date().toISOString();
    
    this.processedData = normalized;
    
    this.goals.delete('normalize_data');
    
    return { 
      success: true, 
      message: 'Data normalized successfully',
      normalizedData: normalized
    };
  }
  
  /**
   * Share clean data with other agents
   */
  async shareCleanData() {
    console.log(`📤 [${this.id}] Sharing clean data with other agents`);
    
    if (!this.processedData) {
      throw new Error('No processed data to share');
    }
    
    // Broadcast clean data to all agents
    await this.broadcastMessage('clean_data_available', {
      data: this.processedData,
      qualityScore: this.qualityScore,
      provider: this.id,
      timestamp: Date.now()
    });
    
    this.goals.delete('share_clean_data');
    
    return { 
      success: true, 
      message: 'Clean data shared with all agents',
      qualityScore: this.qualityScore
    };
  }
  
  /**
   * React to system events
   */
  reactToSystemEvent(event) {
    if (event.eventType === 'data_available') {
      // Immediately add goal to process new data
      this.addGoal('validate_data');
      console.log(`📊 [${this.id}] Reacting to new data availability`);
    }
  }
}