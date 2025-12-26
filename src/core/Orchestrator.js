/**
 * Orchestrator - manages the execution flow of agents
 * Implements a DAG-based workflow execution
 */
export class Orchestrator {
  constructor() {
    this.agents = new Map();
    this.executionGraph = new Map();
    this.results = new Map();
  }

  /**
   * Register an agent with the orchestrator
   * @param {Agent} agent - Agent instance to register
   */
  registerAgent(agent) {
    this.agents.set(agent.name, agent);
    this.executionGraph.set(agent.name, agent.dependencies);
  }

  /**
   * Execute all agents in dependency order
   * @param {Object} initialData - Starting data for the pipeline
   * @returns {Promise<Map>} - Results from all agents
   */
  async execute(initialData) {
    const executionOrder = this.topologicalSort();
    console.log('Execution order:', executionOrder);

    for (const agentName of executionOrder) {
      const agent = this.agents.get(agentName);
      const input = this.prepareAgentInput(agentName, initialData);
      
      console.log(`Executing agent: ${agentName}`);
      const result = await agent.execute(input);
      this.results.set(agentName, result);
      console.log(`Agent ${agentName} completed`);
    }

    return this.results;
  }

  /**
   * Prepare input for an agent based on its dependencies
   * @param {string} agentName - Name of the agent
   * @param {Object} initialData - Initial pipeline data
   * @returns {Object} - Prepared input for the agent
   */
  prepareAgentInput(agentName, initialData) {
    const dependencies = this.executionGraph.get(agentName);
    const input = { ...initialData };

    // Add results from dependency agents
    for (const dep of dependencies) {
      if (this.results.has(dep)) {
        input[dep] = this.results.get(dep);
      }
    }

    return input;
  }

  /**
   * Topological sort to determine execution order
   * @returns {Array<string>} - Ordered list of agent names
   */
  topologicalSort() {
    const visited = new Set();
    const temp = new Set();
    const result = [];

    const visit = (node) => {
      if (temp.has(node)) {
        throw new Error('Circular dependency detected');
      }
      if (!visited.has(node)) {
        temp.add(node);
        const dependencies = this.executionGraph.get(node) || [];
        for (const dep of dependencies) {
          visit(dep);
        }
        temp.delete(node);
        visited.add(node);
        result.push(node);
      }
    };

    for (const agentName of this.agents.keys()) {
      if (!visited.has(agentName)) {
        visit(agentName);
      }
    }

    return result;
  }
}