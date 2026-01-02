/**
 * AgentRuntime - Provides autonomous execution environment for agents
 * Agents can make decisions, communicate, and coordinate dynamically
 */
export class AgentRuntime {
  constructor() {
    this.agents = new Map();
    this.messageQueue = [];
    this.sharedMemory = new Map();
    this.eventBus = new EventTarget();
    this.isRunning = false;
  }

  /**
   * Register an autonomous agent
   */
  registerAgent(agent) {
    agent.setRuntime(this);
    this.agents.set(agent.id, agent);
    
    // Agent can subscribe to events it's interested in
    agent.getSubscriptions().forEach(eventType => {
      this.eventBus.addEventListener(eventType, (event) => {
        agent.handleEvent(event);
      });
    });
  }

  /**
   * Start the multi-agent system
   */
  async start(initialData) {
    this.isRunning = true;
    this.sharedMemory.set('initial_data', initialData);
    
    // Broadcast system start event - agents decide if they want to act
    this.broadcast('system_start', { data: initialData });
    
    // Run the agent coordination loop
    while (this.isRunning && this.hasActiveAgents()) {
      await this.coordinationCycle();
      await this.sleep(100); // Allow agents to process
    }
    
    return this.collectResults();
  }

  /**
   * Coordination cycle - agents can request actions, communicate, etc.
   */
  async coordinationCycle() {
    // Process pending messages between agents
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      await this.deliverMessage(message);
    }

    // Give each agent a chance to act autonomously
    for (const agent of this.agents.values()) {
      if (agent.isActive()) {
        try {
          await agent.autonomousAction();
        } catch (error) {
          console.error(`Agent ${agent.id} error:`, error.message);
        }
      }
    }
  }

  /**
   * Inter-agent communication
   */
  sendMessage(fromAgentId, toAgentId, messageType, payload) {
    this.messageQueue.push({
      from: fromAgentId,
      to: toAgentId,
      type: messageType,
      payload: payload,
      timestamp: Date.now()
    });
  }

  async deliverMessage(message) {
    const recipient = this.agents.get(message.to);
    if (recipient) {
      await recipient.receiveMessage(message);
    }
  }

  /**
   * Broadcast events to all interested agents
   */
  broadcast(eventType, data) {
    const event = new CustomEvent(eventType, { detail: data });
    this.eventBus.dispatchEvent(event);
  }

  /**
   * Shared memory for agent coordination
   */
  setSharedData(key, value) {
    this.sharedMemory.set(key, value);
    this.broadcast('data_updated', { key, value });
  }

  getSharedData(key) {
    return this.sharedMemory.get(key);
  }

  /**
   * Check if any agents are still active
   */
  hasActiveAgents() {
    return Array.from(this.agents.values()).some(agent => agent.isActive());
  }

  /**
   * Collect final results from all agents
   */
  collectResults() {
    const results = {};
    for (const [id, agent] of this.agents.entries()) {
      const agentResults = agent.getResults();
      if (agentResults) {
        results[id] = agentResults;
      }
    }
    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Shutdown the system
   */
  shutdown() {
    this.isRunning = false;
    for (const agent of this.agents.values()) {
      agent.shutdown();
    }
  }
}