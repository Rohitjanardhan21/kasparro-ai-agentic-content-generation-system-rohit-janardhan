/**
 * Base Agent class - defines the contract for all agents
 */
export class Agent {
  constructor(name, dependencies = []) {
    this.name = name;
    this.dependencies = dependencies;
    this.state = 'idle';
  }

  /**
   * Execute the agent's primary function
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
      throw new Error(`Agent ${this.name} failed: ${error.message}`);
    }
  }

  /**
   * Override this method in concrete agents
   * @param {Object} input - Input data
   * @returns {Promise<Object>} - Processed output
   */
  async process(input) {
    throw new Error('process() method must be implemented by concrete agents');
  }

  /**
   * Validate input data structure
   * @param {Object} input - Input to validate
   * @returns {boolean} - Validation result
   */
  validateInput(input) {
    return input !== null && input !== undefined;
  }
}