/**
 * Base Agent class - defines the contract for all agents in the system
 * 
 * Design Philosophy:
 * - Single Responsibility: Each agent has one clear purpose
 * - Explicit Dependencies: Agents declare what they need to run
 * - State Tracking: Monitor agent execution status
 * - Error Context: Provide meaningful error messages for debugging
 * - Bulletproof Validation: Comprehensive input/output validation
 * 
 * Usage Pattern:
 * 1. Extend this class for new agents
 * 2. Define dependencies in constructor
 * 3. Implement the process() method
 * 4. Let the orchestrator handle execution flow
 */
export class Agent {
  /**
   * Create a new agent with comprehensive validation
   * @param {string} name - Unique identifier for this agent
   * @param {string[]} dependencies - Names of agents this one depends on
   */
  constructor(name, dependencies = []) {
    // Bulletproof constructor validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Agent name must be a non-empty string');
    }
    if (!Array.isArray(dependencies)) {
      throw new Error('Dependencies must be an array');
    }
    if (dependencies.some(dep => typeof dep !== 'string' || dep.trim().length === 0)) {
      throw new Error('All dependencies must be non-empty strings');
    }
    
    this.name = name.trim();
    this.dependencies = [...dependencies]; // Defensive copy
    this.state = 'idle'; // idle -> running -> completed/failed
    this.executionTime = 0;
    this.lastError = null;
    this.executionCount = 0;
  }

  /**
   * Execute the agent's primary function with bulletproof error handling
   * 
   * This method provides:
   * - State tracking for monitoring
   * - Performance metrics
   * - Comprehensive error handling
   * - Input/output validation
   * - Execution logging
   * 
   * @param {Object} input - Input data for the agent
   * @returns {Promise<Object>} - Agent output with metadata
   */
  async execute(input) {
    const startTime = Date.now();
    this.state = 'running';
    this.lastError = null;
    this.executionCount++;
    
    try {
      // Bulletproof input validation
      if (!this.validateInput(input)) {
        throw new Error(`Invalid input for agent ${this.name}: Input validation failed. Expected object, got ${typeof input}`);
      }

      console.log(`[${this.name}] Starting execution (attempt #${this.executionCount})...`);
      
      // Execute the agent's core logic
      const result = await this.process(input);
      
      // Bulletproof output validation
      if (!this.validateOutput(result)) {
        throw new Error(`Invalid output from agent ${this.name}: Output validation failed. Expected object, got ${typeof result}`);
      }

      // Record successful execution
      this.executionTime = Date.now() - startTime;
      this.state = 'completed';
      
      console.log(`[${this.name}] ✅ Completed successfully in ${this.executionTime}ms`);
      
      // Return result with execution metadata
      return {
        ...result,
        _metadata: {
          agent: this.name,
          executionTime: this.executionTime,
          timestamp: new Date().toISOString(),
          success: true,
          executionCount: this.executionCount
        }
      };
      
    } catch (error) {
      // Record failed execution
      this.executionTime = Date.now() - startTime;
      this.state = 'failed';
      this.lastError = error;
      
      console.error(`[${this.name}] ❌ Failed after ${this.executionTime}ms:`, error.message);
      
      // Provide detailed error context for debugging
      const enhancedError = new Error(
        `Agent ${this.name} failed (attempt #${this.executionCount}): ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.agent = this.name;
      enhancedError.executionTime = this.executionTime;
      
      throw enhancedError;
    }
  }

  /**
   * Override this method in concrete agents to implement specific logic
   * 
   * Design Decision: Abstract method pattern
   * Rationale: Ensures all agents implement their core logic
   * 
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Processed output
   */
  async process(input) {
    throw new Error(`process() method must be implemented by concrete agent: ${this.name}`);
  }

  /**
   * Validate input data structure - override for specific validation
   * 
   * @param {Object} input - Input to validate
   * @returns {boolean} - Validation result
   */
  validateInput(input) {
    return input !== null && input !== undefined && typeof input === 'object';
  }

  /**
   * Validate output data structure - override for specific validation
   * 
   * @param {Object} output - Output to validate
   * @returns {boolean} - Validation result
   */
  validateOutput(output) {
    return output !== null && output !== undefined && typeof output === 'object';
  }

  /**
   * Get comprehensive agent status and performance metrics
   * @returns {Object} - Agent status information
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      dependencies: [...this.dependencies], // Defensive copy
      executionTime: this.executionTime,
      executionCount: this.executionCount,
      lastError: this.lastError?.message || null,
      ready: this.state === 'idle' || this.state === 'completed',
      hasExecuted: this.executionCount > 0
    };
  }

  /**
   * Reset agent state for re-execution
   */
  reset() {
    this.state = 'idle';
    this.lastError = null;
    this.executionTime = 0;
    // Note: Don't reset executionCount - it's a lifetime metric
  }
}