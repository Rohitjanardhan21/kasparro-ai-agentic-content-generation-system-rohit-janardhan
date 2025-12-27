/**
 * Orchestrator - manages the execution flow of agents using DAG-based scheduling
 * 
 * Key Responsibilities:
 * 1. Agent Registration: Track all available agents
 * 2. Dependency Resolution: Determine execution order via topological sort
 * 3. Data Flow Management: Pass results between dependent agents
 * 4. Error Propagation: Handle failures gracefully
 * 
 * Design Decisions:
 * - DAG over linear: Enables parallel execution where possible
 * - Topological sort: Ensures dependencies are met
 * - Result caching: Agents can access outputs from dependencies
 * 
 * Usage:
 * 1. Register agents with their dependencies
 * 2. Call execute() with initial data
 * 3. System automatically determines optimal execution order
 */
export class Orchestrator {
  constructor() {
    // Use Maps for O(1) lookup performance with frequent access
    this.agents = new Map();           // agentName -> Agent instance
    this.executionGraph = new Map();   // agentName -> dependencies array
    this.results = new Map();          // agentName -> execution result
  }

  /**
   * Register an agent with the orchestrator
   * 
   * @param {Agent} agent - Agent instance to register
   * 
   * Side effects:
   * - Adds agent to execution registry
   * - Records dependency relationships for topological sort
   */
  registerAgent(agent) {
    this.agents.set(agent.name, agent);
    this.executionGraph.set(agent.name, agent.dependencies);
  }

  /**
   * Execute all agents in dependency order using topological sort
   * 
   * Algorithm:
   * 1. Calculate execution order via topological sort
   * 2. For each agent in order:
   *    a. Prepare input data (initial + dependency results)
   *    b. Execute agent
   *    c. Store result for dependent agents
   * 
   * @param {Object} initialData - Starting data for the pipeline
   * @returns {Promise<Map>} - Results from all agents
   */
  async execute(initialData) {
    // Clear previous results to avoid stale data
    this.results.clear();
    
    const executionOrder = this.topologicalSort();
    console.log('Execution order:', executionOrder);

    // Execute agents sequentially in dependency order
    // Note: Could be optimized for parallel execution of independent agents
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
   * 
   * Input Structure:
   * - Original initialData fields (spread at root level)
   * - Dependency results (keyed by agent name)
   * 
   * Example:
   * {
   *   productName: "...",        // from initialData
   *   DataParserAgent: {...},    // from dependency result
   *   QuestionGeneratorAgent: {...} // from dependency result
   * }
   * 
   * @param {string} agentName - Name of the agent
   * @param {Object} initialData - Initial pipeline data
   * @returns {Object} - Prepared input for the agent
   */
  prepareAgentInput(agentName, initialData) {
    const dependencies = this.executionGraph.get(agentName);
    const input = { ...initialData }; // Start with initial data

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
   * 
   * Algorithm: Depth-First Search with cycle detection
   * - Ensures dependencies execute before dependents
   * - Detects circular dependencies (which would cause deadlock)
   * 
   * Time Complexity: O(V + E) where V = agents, E = dependencies
   * Space Complexity: O(V) for visited sets
   * 
   * @returns {Array<string>} - Ordered list of agent names
   * @throws {Error} - If circular dependency detected
   */
  topologicalSort() {
    const visited = new Set();    // Permanently visited nodes
    const temp = new Set();       // Temporarily visited (for cycle detection)
    const result = [];            // Final execution order

    const visit = (node) => {
      // Cycle detection: if we revisit a temporarily visited node
      if (temp.has(node)) {
        throw new Error('Circular dependency detected');
      }
      
      if (!visited.has(node)) {
        temp.add(node);
        
        // Visit all dependencies first (DFS)
        const dependencies = this.executionGraph.get(node) || [];
        for (const dep of dependencies) {
          visit(dep);
        }
        
        temp.delete(node);
        visited.add(node);
        result.push(node); // Add to result after all dependencies processed
      }
    };

    // Visit all agents to handle disconnected components
    for (const agentName of this.agents.keys()) {
      if (!visited.has(agentName)) {
        visit(agentName);
      }
    }

    return result;
  }
}