import { AutonomousAgent } from '../AutonomousAgent.js';

/**
 * AutonomousDataParserAgent - Autonomously parses product data when available
 * 
 * Goals: Parse and validate product data
 * Triggers: When raw product data becomes available
 * Autonomy: Decides when data is ready to parse and validates quality
 */
export class AutonomousDataParserAgent extends AutonomousAgent {
  constructor() {
    super(
      'AutonomousDataParserAgent',
      ['parse_product_data', 'validate_data_quality'],
      ['data_parsing', 'validation', 'normalization']
    );
  }

  /**
   * Check if the agent can pursue its parsing goal
   */
  canPursueGoal(goal, situation) {
    switch (goal) {
      case 'parse_product_data':
        // Can parse if raw data is available and not already parsed
        return situation.sharedData.productData && 
               !situation.sharedData.parsed_data;
      
      case 'validate_data_quality':
        // Can validate if parsed data exists but not validated
        return situation.sharedData.parsed_data && 
               !situation.sharedData.data_validation_complete;
      
      default:
        return false;
    }
  }

  /**
   * Make autonomous decision about what to do
   */
  makeDecision(actionableGoals, situation) {
    // Prioritize parsing before validation
    if (actionableGoals.includes('parse_product_data')) {
      return {
        type: 'parse_data',
        goal: 'parse_product_data',
        data: situation.sharedData.productData
      };
    }
    
    if (actionableGoals.includes('validate_data_quality')) {
      return {
        type: 'validate_data',
        goal: 'validate_data_quality',
        data: situation.sharedData.parsed_data
      };
    }
    
    return null;
  }

  /**
   * Execute the autonomous decision
   */
  async executeDecision(decision) {
    console.log(`🤖 [${this.name}] Autonomously executing: ${decision.type}`);
    
    switch (decision.type) {
      case 'parse_data':
        await this.autonomouslyParseData(decision.data);
        break;
      case 'validate_data':
        await this.autonomouslyValidateData(decision.data);
        break;
    }
  }

  /**
   * Autonomously parse product data
   */
  async autonomouslyParseData(rawData) {
    console.log(`🔍 [${this.name}] Autonomously parsing product data...`);
    
    try {
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
          data_version: '1.0',
          source: 'autonomous_parsing'
        }
      };
      
      // Store in shared memory for other agents
      this.shareData('parsed_data', parsedData);
      
      // Notify other agents
      this.broadcastEvent('data_parsed', {
        agent: this.name,
        dataType: 'product_data',
        timestamp: Date.now()
      });
      
      console.log(`✅ [${this.name}] Successfully parsed product: ${parsedData.product.name}`);
      
    } catch (error) {
      console.error(`❌ [${this.name}] Parsing failed:`, error.message);
      this.broadcastEvent('parsing_failed', { error: error.message });
    }
  }

  /**
   * Autonomously validate data quality
   */
  async autonomouslyValidateData(parsedData) {
    console.log(`🔍 [${this.name}] Autonomously validating data quality...`);
    
    const validationResults = {
      isValid: true,
      issues: [],
      score: 100
    };
    
    // Check required fields
    const requiredFields = ['name', 'concentration', 'skinType', 'keyIngredients', 'benefits'];
    for (const field of requiredFields) {
      if (!parsedData.product[field]) {
        validationResults.issues.push(`Missing required field: ${field}`);
        validationResults.isValid = false;
        validationResults.score -= 20;
      }
    }
    
    // Check data quality
    if (parsedData.product.price && !parsedData.product.price.includes('₹')) {
      validationResults.issues.push('Price missing currency symbol');
      validationResults.score -= 10;
    }
    
    // Store validation results
    this.shareData('data_validation_complete', true);
    this.shareData('data_validation_results', validationResults);
    
    if (validationResults.isValid) {
      console.log(`✅ [${this.name}] Data validation passed (score: ${validationResults.score})`);
      this.broadcastEvent('data_validated', { score: validationResults.score });
    } else {
      console.log(`⚠️  [${this.name}] Data validation issues found: ${validationResults.issues.join(', ')}`);
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
   * Handle data availability events
   */
  handleDataAvailable(data) {
    super.handleDataAvailable(data);
    
    if (data.key === 'productData') {
      console.log(`📨 [${this.name}] Product data available - will parse autonomously`);
    }
  }
}