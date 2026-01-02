import { EventEmitter } from 'events';

/**
 * AgentRuntime - Environment for truly autonomous agents
 * 
 * Provides:
 * 1. Event-driven coordination
 * 2. Shared memory for agent communication
 * 3. Message routing between agents
 * 4. Autonomous agent lifecycle management
 */
export class AgentRuntime extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.sharedMemory = new Map();
    this.messageQueue = [];
    this.isRunning = false;
    this.startTime = null;
    
    // Runtime metrics
    this.metrics = {
      totalMessages: 0,
      totalEvents: 0,
      agentInteractions: 0
    };
    
    // Set up message routing
    this.setupMessageRouting();
  }

  /**
   * Register an autonomous agent with the runtime
   */
  registerAgent(agent) {
    if (!agent || !agent.name) {
      throw new Error('Invalid agent - must have a name');
    }
    
    this.agents.set(agent.name, agent);
    console.log(`📝 [Runtime] Registered autonomous agent: ${agent.name}`);
    console.log(`   Goals: ${agent.goals.join(', ')}`);
    console.log(`   Capabilities: ${agent.capabilities.join(', ')}`);
  }

  /**
   * Start the autonomous agent runtime
   */
  async startRuntime(initialData = {}) {
    console.log('\n🚀 Starting Autonomous Agent Runtime...');
    this.isRunning = true;
    this.startTime = Date.now();
    
    // Initialize shared memory with initial data
    for (const [key, value] of Object.entries(initialData)) {
      this.sharedMemory.set(key, value);
    }
    
    // Start all agents
    const agentPromises = [];
    for (const agent of this.agents.values()) {
      agentPromises.push(agent.startAutonomousOperation(this, this.sharedMemory));
    }
    
    await Promise.all(agentPromises);
    
    console.log(`🎯 Runtime started with ${this.agents.size} autonomous agents`);
    
    // Emit initial data availability event
    this.emit('data_available', initialData);
    
    return this.waitForCompletion();
  }

  /**
   * Wait for all agents to complete their goals
   */
  async waitForCompletion() {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        const allCompleted = this.checkIfAllGoalsCompleted();
        
        if (allCompleted) {
          console.log('\n🎉 All agent goals completed!');
          this.stopRuntime();
          resolve(this.collectResults());
        } else {
          // Check again in 500ms
          setTimeout(checkCompletion, 500);
        }
      };
      
      // Start checking after a brief delay
      setTimeout(checkCompletion, 1000);
    });
  }

  /**
   * Check if all agents have completed their goals
   */
  checkIfAllGoalsCompleted() {
    // For this implementation, we'll check if key results are available
    const requiredResults = [
      'parsed_data',
      'generated_questions', 
      'faq_page',
      'product_page',
      'comparison_page'
    ];
    
    return requiredResults.every(key => this.sharedMemory.has(key));
  }

  /**
   * Stop the autonomous agent runtime
   */
  stopRuntime() {
    console.log('\n🛑 Stopping Autonomous Agent Runtime...');
    this.isRunning = false;
    
    // Stop all agents
    for (const agent of this.agents.values()) {
      agent.stopAutonomousOperation();
    }
    
    const runtime = Date.now() - this.startTime;
    console.log(`⏱️  Runtime duration: ${runtime}ms`);
    console.log(`📊 Messages processed: ${this.metrics.totalMessages}`);
    console.log(`📊 Events emitted: ${this.metrics.totalEvents}`);
  }

  /**
   * Set up message routing between agents
   */
  setupMessageRouting() {
    this.on('agent_message', (message) => {
      this.routeMessage(message);
      this.metrics.totalMessages++;
    });
    
    // Track all events for metrics
    const originalEmit = this.emit;
    this.emit = (...args) => {
      this.metrics.totalEvents++;
      return originalEmit.apply(this, args);
    };
  }

  /**
   * Route a message to the target agent
   */
  routeMessage(message) {
    const targetAgent = this.agents.get(message.to);
    if (targetAgent) {
      targetAgent.inbox.push(message);
      this.metrics.agentInteractions++;
    } else {
      console.warn(`⚠️  [Runtime] Message target not found: ${message.to}`);
    }
  }

  /**
   * Get data from shared memory
   */
  getSharedData(key) {
    return this.sharedMemory.get(key);
  }

  /**
   * Set data in shared memory and notify agents
   */
  setSharedData(key, value) {
    this.sharedMemory.set(key, value);
    this.emit('data_available', { key, value });
  }

  /**
   * Collect results from all agents
   */
  collectResults() {
    const results = {
      sharedMemory: Object.fromEntries(this.sharedMemory.entries()),
      agentStatuses: {},
      runtimeMetrics: {
        ...this.metrics,
        duration: Date.now() - this.startTime,
        agentCount: this.agents.size
      }
    };
    
    // Collect agent statuses
    for (const [name, agent] of this.agents.entries()) {
      results.agentStatuses[name] = agent.getAutonomyStatus();
    }
    
    return results;
  }

  /**
   * Get runtime status
   */
  getRuntimeStatus() {
    return {
      isRunning: this.isRunning,
      agentCount: this.agents.size,
      sharedDataItems: this.sharedMemory.size,
      metrics: this.metrics,
      uptime: this.startTime ? Date.now() - this.startTime : 0
    };
  }
}