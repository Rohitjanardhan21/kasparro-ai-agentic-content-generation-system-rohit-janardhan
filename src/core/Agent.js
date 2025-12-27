/**
 * Base Agent class - defines the contract for all agents in the system
 * 
 * Design Philosophy:
 * - Single Responsibility: Each agent has one clear purpose
 * - Explicit Dependencies: Agents declare what they need to run
 * - State Tracking: Monitor agent execution status
 * - Error Context: Provide meaningful error messages for debugging
 * 
 * Usage Pattern:
 * 1. Extend this class for new agents
 * 2. Define dependencies in constructor
 * 3. Implement the process() method
 * 4. Let the orchestrator handle execution flow
 */
export class Agent {
  /**
   * Create a new agent
   * @param {string} name - Unique identifier for this agent
   * @param {string[]} dependencies - Names of agents this one depends on
   */
  constructor(name, dependencies = []) {
    this.name = name;
    this.dependencies = dependencies;
    this.state = 'idle'; // idle -> running -> completed/failed
  }

  /**
   * Execute the agent's primary function with error handling and state management
   * 
   * This method provides:
   * - State tracking for monitoring
   * - Error wrapping with context
   * - Consistent async interface
   * 
   * @param {Object} input - Input data for the agent
   * @returns {Promise<Object>} - Agent output
   */
  async execute(input) {
    this.state = 'running';
    try {
      const result = await this.process(input);
      this.state = 'completed';
      return result;
    } catch (error) {
      this.state = 'failed';
      // Wrap error with agent context for easier debugging
      throw new Error(`Agent ${this.name} failed: ${error.message}`);
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
    throw new Error('process() method must be implemented by concrete agents');
  }

  /**
   * Validate input data structure - override for specific validation
   * 
   * @param {Object} input - Input to validate
   * @returns {boolean} - Validation result
   */
  validateInput(input) {
    return input !== null && input !== undefined;
  }
}