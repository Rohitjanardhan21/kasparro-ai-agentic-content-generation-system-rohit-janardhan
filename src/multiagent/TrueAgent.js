import { EventEmitter } from 'events';

/**
 * TrueAgent - A genuinely independent agent with autonomous behavior
 * 
 * Key Characteristics:
 * 1. Runs independently in its own execution context
 * 2. Makes autonomous decisions based on goals and environment
 * 3. Communicates directly with other agents
 * 4. Has its own knowledge base and reasoning
 * 5. Can negotiate and coordinate with peers
 */
export class TrueAgent extends EventEmitter {
  constructor(name, capabilities = [], goals = []) {
    super();
    
    this.name = name;
    this.capabilities = capabilities;
    this.goals = goals;
    
    // Agent state
    this.isActive = false;
    this.knowledge = new Map();
    this.beliefs = new Map();
    this.intentions = [];
    
    // Communication
    this.peers = new Map(); // Other agents this agent knows about
    this.messageQueue = [];
    
    // Autonomy metrics
    this.decisions = [];
    this.actions = [];
    this.negotiations = [];
    
    // Execution context
    this.executionLoop = null;
    this.reasoningInterval = 200; // How often agent reasons (ms)
  }

  /**
   * Start the agent's autonomous operation
   */
  async start(environment) {
    console.log(`🤖 [${this.name}] Starting autonomous operation`);
    console.log(`   Goals: ${this.goals.join(', ')}`);
    console.log(`   Capabilities: ${this.capabilities.join(', ')}`);
    
    this.environment = environment;
    this.isActive = true;
    
    // Start autonomous reasoning loop
    this.executionLoop = setInterval(() => {
      this.autonomousReasoningCycle();
    }, this.reasoningInterval);
    
    // Register with environment
    this.environment.registerAgent(this);
    
    // Discover other agents
    this.discoverPeers();
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log(`🛑 [${this.name}] Stopping autonomous operation`);
    this.isActive = false;
    
    if (this.executionLoop) {
      clearInterval(this.executionLoop);
    }
  }

  /**
   * Autonomous reasoning cycle - the heart of agent autonomy
   * This is where the agent makes independent decisions
   */
  async autonomousReasoningCycle() {
    if (!this.isActive) return;
    
    try {
      // 1. Perceive environment
      const perception = this.perceiveEnvironment();
      
      // 2. Update beliefs based on perception
      this.updateBeliefs(perception);
      
      // 3. Process incoming messages
      this.processMessages();
      
      // 4. Reason about goals and current situation
      const opportunities = this.identifyOpportunities();
      
      // 5. Make decisions about what to do
      if (opportunities.length > 0) {
        const decision = this.makeDecision(opportunities);
        
        if (decision) {
          this.decisions.push({
            timestamp: Date.now(),
            decision: decision,
            reasoning: decision.reasoning
          });
          
          // 6. Execute the decision
          await this.executeDecision(decision);
        }
      }
      
    } catch (error) {
      console.error(`❌ [${this.name}] Error in reasoning cycle:`, error.message);
    }
  }

  /**
   * Perceive the current environment state
   */
  perceiveEnvironment() {
    if (!this.environment) return {};
    
    return {
      availableData: this.environment.getAvailableData(),
      otherAgents: this.environment.getActiveAgents(),
      sharedResources: this.environment.getSharedResources(),
      timestamp: Date.now()
    };
  }

  /**
   * Update agent's beliefs based on new information
   */
  updateBeliefs(perception) {
    // Update belief about data availability
    if (perception.availableData) {
      for (const [key, data] of Object.entries(perception.availableData)) {
        this.beliefs.set(`data_available_${key}`, {
          available: true,
          timestamp: perception.timestamp,
          data: data
        });
      }
    }
    
    // Update belief about other agents
    this.beliefs.set('active_agents', perception.otherAgents || []);
  }

  /**
   * Identify opportunities to pursue goals
   */
  identifyOpportunities() {
    const opportunities = [];
    
    for (const goal of this.goals) {
      if (this.canPursueGoal(goal)) {
        opportunities.push({
          type: 'goal_pursuit',
          goal: goal,
          priority: this.calculateGoalPriority(goal),
          requirements: this.getGoalRequirements(goal)
        });
      }
    }
    
    // Sort by priority
    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if a goal can be pursued given current beliefs
   * Override in concrete agents
   */
  canPursueGoal(goal) {
    // Default implementation - override in concrete agents
    return true;
  }

  /**
   * Calculate priority for a goal
   * Override in concrete agents
   */
  calculateGoalPriority(goal) {
    // Default implementation - override in concrete agents
    return 50;
  }

  /**
   * Get requirements for achieving a goal
   * Override in concrete agents
   */
  getGoalRequirements(goal) {
    // Default implementation - override in concrete agents
    return [];
  }

  /**
   * Make a decision about which opportunity to pursue
   */
  makeDecision(opportunities) {
    if (opportunities.length === 0) return null;
    
    // Choose highest priority opportunity
    const chosen = opportunities[0];
    
    return {
      action: 'pursue_goal',
      goal: chosen.goal,
      priority: chosen.priority,
      reasoning: `Pursuing goal '${chosen.goal}' with priority ${chosen.priority}`,
      timestamp: Date.now()
    };
  }

  /**
   * Execute a decision
   * Override in concrete agents
   */
  async executeDecision(decision) {
    console.log(`⚡ [${this.name}] Executing decision: ${decision.action} for goal '${decision.goal}'`);
    
    this.actions.push({
      timestamp: Date.now(),
      action: decision.action,
      goal: decision.goal
    });
    
    // Default implementation - override in concrete agents
    await this.performGoalAction(decision.goal);
  }

  /**
   * Perform action for a specific goal
   * Override in concrete agents
   */
  async performGoalAction(goal) {
    // Override in concrete agents
    console.log(`🔧 [${this.name}] Performing action for goal: ${goal}`);
  }

  /**
   * Process incoming messages from other agents
   */
  processMessages() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.handleMessage(message);
    }
  }

  /**
   * Handle a message from another agent
   */
  handleMessage(message) {
    console.log(`💬 [${this.name}] Received message from ${message.from}: ${message.type}`);
    
    switch (message.type) {
      case 'data_offer':
        this.handleDataOffer(message);
        break;
      case 'collaboration_request':
        this.handleCollaborationRequest(message);
        break;
      case 'negotiation':
        this.handleNegotiation(message);
        break;
      case 'result_share':
        this.handleResultShare(message);
        break;
      default:
        console.log(`❓ [${this.name}] Unknown message type: ${message.type}`);
    }
  }

  /**
   * Send a message to another agent
   */
  sendMessage(targetAgent, messageType, payload) {
    const message = {
      from: this.name,
      to: targetAgent,
      type: messageType,
      payload: payload,
      timestamp: Date.now()
    };
    
    if (this.environment) {
      this.environment.routeMessage(message);
    }
    
    console.log(`📤 [${this.name}] Sent ${messageType} to ${targetAgent}`);
  }

  /**
   * Broadcast a message to all known agents
   */
  broadcast(messageType, payload) {
    for (const peerName of this.peers.keys()) {
      this.sendMessage(peerName, messageType, payload);
    }
  }

  /**
   * Discover other agents in the environment
   */
  discoverPeers() {
    if (this.environment) {
      const otherAgents = this.environment.getActiveAgents();
      for (const agentName of otherAgents) {
        if (agentName !== this.name) {
          this.peers.set(agentName, { discovered: Date.now() });
        }
      }
    }
  }

  /**
   * Negotiate with another agent
   */
  async negotiate(targetAgent, proposal) {
    console.log(`🤝 [${this.name}] Starting negotiation with ${targetAgent}`);
    
    this.negotiations.push({
      timestamp: Date.now(),
      with: targetAgent,
      proposal: proposal,
      status: 'initiated'
    });
    
    this.sendMessage(targetAgent, 'negotiation', {
      type: 'proposal',
      proposal: proposal
    });
  }

  /**
   * Share knowledge with other agents
   */
  shareKnowledge(key, value) {
    this.knowledge.set(key, value);
    
    // Broadcast to interested agents
    this.broadcast('knowledge_share', {
      key: key,
      value: value,
      from: this.name
    });
  }

  /**
   * Get agent status and metrics
   */
  getStatus() {
    return {
      name: this.name,
      isActive: this.isActive,
      goals: this.goals,
      capabilities: this.capabilities,
      autonomyMetrics: {
        decisions: this.decisions.length,
        actions: this.actions.length,
        negotiations: this.negotiations.length,
        knowledgeItems: this.knowledge.size,
        beliefs: this.beliefs.size,
        peers: this.peers.size
      },
      lastActivity: this.decisions.length > 0 ? this.decisions[this.decisions.length - 1].timestamp : null
    };
  }

  // Message handlers - override in concrete agents
  handleDataOffer(message) {
    // Override in concrete agents
  }

  handleCollaborationRequest(message) {
    // Override in concrete agents
  }

  handleNegotiation(message) {
    // Override in concrete agents
  }

  handleResultShare(message) {
    // Override in concrete agents
  }
}