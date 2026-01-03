/**
 * DataParserAgent - Orchestrated agent for data parsing and validation
 * 
 * This agent:
 * 1. Validates and normalizes product data when executed by orchestrator
 * 2. Provides clean, structured data for dependent agents
 * 3. Implements quality assessment and validation rules
 * 4. Has no dependencies (executes first in DAG)
 */

import { BaseAgent } from './BaseAgent.js';

export class DataParserAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      ...config,
      type: 'data_parser',
      name: 'DataParserAgent',
      capabilities: ['data_validation', 'data_normalization', 'quality_assessment'],
      dependencies: [] // No dependencies - executes first
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
   * Perform goal-specific work (autonomous agent implementation)
   */
  async performGoalWork(goal) {
    console.log(`📊 [${this.id}] Working on goal: ${goal.description}`);
    
    if (goal.description.includes('validate') || goal.description.includes('data')) {
      return await this.validateAndNormalizeData();
    }
    
    return { success: false, message: 'Unknown goal type' };
  }
  
  /**
   * Validate and normalize data autonomously
   */
  async validateAndNormalizeData() {
    // Get initial context data
    const initialContext = this.beliefs.get('initial_context');
    if (!initialContext) {
      return { success: false, message: 'No initial context data available' };
    }
    
    console.log(`✅ [${this.id}] Validating product data`);
    const validationResult = this.validateData(initialContext);
    
    if (!validationResult.isValid) {
      return { success: false, message: `Data validation failed: ${validationResult.errors.join(', ')}` };
    }
    
    console.log(`📊 [${this.id}] Validation complete - Score: ${validationResult.score}/100`);
    this.qualityScore = validationResult.score;
    
    // Normalize data
    console.log(`🔧 [${this.id}] Normalizing data for consistency`);
    this.processedData = this.normalizeData(initialContext);
    
    // Store in beliefs for other agents
    this.beliefs.set('clean_data', this.processedData);
    this.knowledge.set('processed_data', this.processedData);
    
    console.log(`📤 [${this.id}] Data parsing completed - Quality Score: ${this.qualityScore}/100`);
    
    // Share clean data with other agents immediately
    console.log(`📡 [${this.id}] Broadcasting clean_data_available message...`);
    await this.broadcastMessage('clean_data_available', {
      data: this.processedData,
      provider: this.id,
      qualityScore: this.qualityScore,
      timestamp: Date.now()
    });
    console.log(`📡 [${this.id}] Broadcast complete`);
    
    // Mark all data-related goals as completed
    for (const goal of this.goals) {
      if (goal.description.includes('validate') || goal.description.includes('data') || goal.description.includes('process_product')) {
        goal.status = 'completed';
        goal.completedAt = Date.now();
        this.goalsAchieved++;
      }
    }
    
    // Remove completed goals
    this.goals = new Set(Array.from(this.goals).filter(goal => goal.status !== 'completed'));
    
    return {
      success: true,
      message: `Data validated and normalized with quality score ${this.qualityScore}/100`,
      data: this.processedData
    };
  }

  /**
   * Perform task-specific work for data parsing
   */
  async performTaskWork(task) {
    console.log(`📊 [${this.id}] Starting data parsing task: ${task.id}`);
    
    if (!task.data) {
      throw new Error('No data provided for parsing task');
    }
    
    // Step 1: Validate data
    console.log(`✅ [${this.id}] Validating product data`);
    const validationResult = this.validateData(task.data);
    
    if (!validationResult.isValid) {
      throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    console.log(`📊 [${this.id}] Validation complete - Score: ${validationResult.score}/100`);
    this.qualityScore = validationResult.score;
    
    // Step 2: Normalize data
    console.log(`🔧 [${this.id}] Normalizing data for consistency`);
    this.processedData = this.normalizeData(task.data);
    
    // Step 3: Store in shared data for other agents
    this.sharedData.set('clean_data', this.processedData);
    this.sharedData.set('parse_data', this.processedData);
    
    // Step 4: Return result
    const result = {
      agentId: this.id,
      taskId: task.id,
      type: 'clean_data',
      data: this.processedData,
      qualityScore: this.qualityScore,
      validationRules: Array.from(this.validationRules.keys()),
      timestamp: Date.now()
    };
    
    console.log(`📤 [${this.id}] Data parsing completed - Quality Score: ${this.qualityScore}/100`);
    
    return result;
  }
  
  /**
   * Validate data against rules
   */
  validateData(data) {
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
    
    return validation;
  }
  
  /**
   * Normalize data for consistency
   */
  normalizeData(data) {
    const normalized = { ...data };
    
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
    
    // Add processing metadata
    normalized.processed = true;
    normalized.processedAt = new Date().toISOString();
    normalized.processedBy = this.id;
    
    return normalized;
  }
}