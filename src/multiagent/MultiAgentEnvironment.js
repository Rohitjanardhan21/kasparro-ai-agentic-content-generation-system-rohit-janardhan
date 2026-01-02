import { EventEmitter } from 'events';

/**
 * MultiAgentEnvironment - The environment where truly independent agents operate
 * 
 * This is NOT an orchestrator that controls agents.
 * Instead, it provides:
 * 1. Communication infrastructure for agents
 * 2. Shared resources and data
 * 3. Agent discovery and registration
 * 4. Message routing between agents
 * 5. Environment state that agents can perceive
 */
export class MultiAgentEnvironment extends EventEmitter {
  constructor() {
    super();
    
    this.agents = new Map();
    this.sharedData = new Map();
    this.messageHistory = [];
    this.resources = new Map();
    
    // Environment state
    this.isActive = false;
    this.startTime = null;
    
    // Metrics
    this.metrics = {
      totalMessages: 0,
      agentInteractions: 0,
      dataExchanges: 0,
      negotiations: 0
    };
  }

  /**
   * Start the multi-agent environment
   */
  start() {
    console.log('🌍 Starting Multi-Agent Environment...');
    this.isActive = true;
    this.startTime = Date.now();
    
    // Environment doesn't control agents - they control themselves
    console.log('🤖 Environment ready - agents can now operate autonomously');
  }

  /**
   * Stop the environment
   */
  stop() {
    console.log('🛑 Stopping Multi-Agent Environment...');
    this.isActive = false;
    
    // Stop all agents
    for (const agent of this.agents.values()) {
      agent.stop();
    }
  }

  /**
   * Register an agent with the environment
   * Agents register themselves - environment doesn't control this
   */
  registerAgent(agent) {
    if (!agent || !agent.name) {
      throw new Error('Invalid agent registration');
    }
    
    this.agents.set(agent.name, agent);
    console.log(`📝 [Environment] Agent ${agent.name} registered (self-registration)`);
    
    // Notify other agents about new peer
    this.emit('agent_joined', {
      agentName: agent.name,
      capabilities: agent.capabilities,
      goals: agent.goals
    });
  }

  /**
   * Route message between agents
   * Environment provides communication infrastructure but doesn't control content
   */
  routeMessage(message) {
    const targetAgent = this.agents.get(message.to);
    
    if (targetAgent) {
      // Deliver message to target agent
      targetAgent.messageQueue.push(message);
      
      // Track metrics
      this.metrics.totalMessages++;
      this.metrics.agentInteractions++;
      
      // Store in history
      this.messageHistory.push({
        ...message,
        delivered: Date.now()
      });
      
      console.log(`📨 [Environment] Routed message: ${message.from} → ${message.to} (${message.type})`);
    } else {
      console.warn(`⚠️  [Environment] Target agent not found: ${message.to}`);
    }
  }

  /**
   * Get available data that agents can perceive
   */
  getAvailableData() {
    return Object.fromEntries(this.sharedData.entries());
  }

  /**
   * Get list of active agents
   */
  getActiveAgents() {
    return Array.from(this.agents.keys()).filter(name => {
      const agent = this.agents.get(name);
      return agent && agent.isActive;
    });
  }

  /**
   * Get shared resources
   */
  getSharedResources() {
    return Object.fromEntries(this.resources.entries());
  }

  /**
   * Add data to the environment (can be done by agents or external sources)
   */
  addData(key, data, source = 'unknown') {
    this.sharedData.set(key, {
      data: data,
      addedBy: source,
      timestamp: Date.now()
    });
    
    console.log(`📊 [Environment] Data added: ${key} (by ${source})`);
    
    // Notify agents about new data availability
    this.emit('data_available', {
      key: key,
      source: source,
      timestamp: Date.now()
    });
    
    this.metrics.dataExchanges++;
  }

  /**
   * Add a shared resource
   */
  addResource(name, resource) {
    this.resources.set(name, resource);
    console.log(`🔧 [Environment] Resource added: ${name}`);
  }

  /**
   * Wait for specific conditions to be met
   * This allows the system to run until agents achieve their collective goals
   */
  async waitForCondition(conditionFn, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCondition = () => {
        if (conditionFn(this)) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      
      checkCondition();
    });
  }

  /**
   * Wait for agents to complete their goals
   */
  async waitForCompletion(expectedResults = []) {
    console.log('⏳ Waiting for agents to complete their goals...');
    
    try {
      await this.waitForCondition((env) => {
        // Check if all expected results are available
        return expectedResults.every(result => env.sharedData.has(result));
      });
      
      console.log('🎉 All agent goals completed!');
      return this.collectResults();
      
    } catch (error) {
      console.log('⏰ Timeout reached - collecting partial results');
      return this.collectResults();
    }
  }

  /**
   * Collect results from the multi-agent system
   */
  collectResults() {
    const results = {
      sharedData: {},
      agentStatuses: {},
      environmentMetrics: {
        ...this.metrics,
        runtime: this.startTime ? Date.now() - this.startTime : 0,
        activeAgents: this.getActiveAgents().length,
        totalAgents: this.agents.size
      },
      messageHistory: this.messageHistory.slice(-50), // Last 50 messages
      timestamp: new Date().toISOString()
    };
    
    // Extract shared data
    for (const [key, value] of this.sharedData.entries()) {
      results.sharedData[key] = value;
    }
    
    // Get agent statuses
    for (const [name, agent] of this.agents.entries()) {
      results.agentStatuses[name] = agent.getStatus();
    }
    
    return results;
  }

  /**
   * Get environment status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      agentCount: this.agents.size,
      activeAgents: this.getActiveAgents().length,
      sharedDataItems: this.sharedData.size,
      resources: this.resources.size,
      metrics: this.metrics,
      uptime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Monitor agent interactions in real-time
   */
  getInteractionSummary() {
    const interactions = {};
    
    // Analyze message patterns
    for (const message of this.messageHistory.slice(-100)) {
      const key = `${message.from}->${message.to}`;
      if (!interactions[key]) {
        interactions[key] = { count: 0, types: new Set() };
      }
      interactions[key].count++;
      interactions[key].types.add(message.type);
    }
    
    // Convert sets to arrays for JSON serialization
    for (const interaction of Object.values(interactions)) {
      interaction.types = Array.from(interaction.types);
    }
    
    return {
      interactions: interactions,
      totalMessages: this.metrics.totalMessages,
      activeAgents: this.getActiveAgents(),
      timestamp: Date.now()
    };
  }
}