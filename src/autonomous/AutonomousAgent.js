/**
 * AutonomousAgent - Truly autonomous agent with decision-making capabilities
 * 
 * Key Characteristics of Autonomy:
 * 1. Goal-oriented behavior - agents have objectives they pursue
 * 2. Decision-making - agents decide when and how to act
 * 3. Event-driven - agents respond to environmental changes
 * 4. Communication - agents coordinate with other agents
 * 5. Asynchronous operation - agents run independently
 */
export class AutonomousAgent {
  constructor(name, goals = [], capabilities = []) {
    this.name = name;
    this.goals = goals; // What this agent wants to achieve
    this.capabilities = capabilities; // What this agent can do
    this.state = 'idle';
    this.knowledge = new Map(); // Agent's knowledge base
    this.inbox = []; // Messages from other agents
    this.isRunning = false;
    this.eventBus = null; // Will be set by runtime
    this.executionInterval = null;
    
    // Autonomy metrics
    this.decisionsCount = 0;
    this.actionsCount = 0;
    this.communicationsCount = 0;
  }

  /**
   * Start autonomous operation - agent begins making decisions
   */
  async startAutonomousOperation(eventBus, sharedMemory) {
    this.eventBus = eventBus;
    this.sharedMemory = sharedMemory;
    this.isRunning = true;
    
    console.log(`🤖 [${this.name}] Starting autonomous operation with goals: ${this.goals.join(', ')}`);
    
    // Start the agent's decision-making loop
    this.executionInterval = setInterval(() => {
      this.autonomousDecisionCycle();
    }, 100); // Check every 100ms for new opportunities to act
    
    // Subscribe to relevant events
    this.subscribeToEvents();
  }

  /**
   * Stop autonomous operation
   */
  stopAutonomousOperation() {
    this.isRunning = false;
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
    }
    console.log(`🛑 [${this.name}] Stopped autonomous operation`);
  }

  /**
   * Autonomous decision-making cycle - the heart of agent autonomy
   */
  async autonomousDecisionCycle() {
    if (!this.isRunning) return;
    
    try {
      // 1. Evaluate current situation
      const situation = this.evaluateSituation();
      
      // 2. Check if any goals can be pursued
      const actionableGoals = this.identifyActionableGoals(situation);
      
      // 3. Make decisions about what to do
      if (actionableGoals.length > 0) {
        const decision = this.makeDecision(actionableGoals, situation);
        this.decisionsCount++;
        
        // 4. Execute the decision
        if (decision) {
          await this.executeDecision(decision);
          this.actionsCount++;
        }
      }
      
      // 5. Process incoming messages
      this.processInbox();
      
    } catch (error) {
      console.error(`❌ [${this.name}] Error in decision cycle:`, error.message);
    }
  }

  /**
   * Evaluate the current situation to make informed decisions
   */
  evaluateSituation() {
    return {
      sharedData: this.sharedMemory ? Object.fromEntries(this.sharedMemory.entries()) : {},
      myKnowledge: Object.fromEntries(this.knowledge.entries()),
      pendingMessages: this.inbox.length,
      timestamp: Date.now()
    };
  }

  /**
   * Identify which goals can be pursued given the current situation
   */
  identifyActionableGoals(situation) {
    return this.goals.filter(goal => this.canPursueGoal(goal, situation));
  }

  /**
   * Determine if a specific goal can be pursued
   * Override in concrete agents for specific goal logic
   */
  canPursueGoal(goal, situation) {
    // Default implementation - override in concrete agents
    return true;
  }

  /**
   * Make a decision about what action to take
   * Override in concrete agents for specific decision logic
   */
  makeDecision(actionableGoals, situation) {
    // Default: pursue the first actionable goal
    if (actionableGoals.length > 0) {
      return {
        type: 'pursue_goal',
        goal: actionableGoals[0],
        situation: situation
      };
    }
    return null;
  }

  /**
   * Execute a decision made by the agent
   * Override in concrete agents for specific execution logic
   */
  async executeDecision(decision) {
    console.log(`⚡ [${this.name}] Executing decision: ${decision.type} for goal: ${decision.goal}`);
    
    // Default implementation - override in concrete agents
    await this.performAction(decision.goal, decision.situation);
  }

  /**
   * Perform the actual work for a goal
   * Override in concrete agents
   */
  async performAction(goal, situation) {
    // Override in concrete agents
    console.log(`🔧 [${this.name}] Performing action for goal: ${goal}`);
  }

  /**
   * Subscribe to events that this agent cares about
   */
  subscribeToEvents() {
    if (this.eventBus) {
      // Subscribe to data availability events
      this.eventBus.on('data_available', (data) => {
        this.handleDataAvailable(data);
      });
      
      // Subscribe to agent completion events
      this.eventBus.on('agent_completed', (agentName, result) => {
        this.handleAgentCompleted(agentName, result);
      });
    }
  }

  /**
   * Handle data becoming available
   */
  handleDataAvailable(data) {
    console.log(`📨 [${this.name}] Received data availability notification`);
    this.knowledge.set('latest_data', data);
  }

  /**
   * Handle another agent completing work
   */
  handleAgentCompleted(agentName, result) {
    console.log(`📨 [${this.name}] Agent ${agentName} completed work`);
    this.knowledge.set(`${agentName}_result`, result);
  }

  /**
   * Process messages from other agents
   */
  processInbox() {
    while (this.inbox.length > 0) {
      const message = this.inbox.shift();
      this.handleMessage(message);
      this.communicationsCount++;
    }
  }

  /**
   * Handle a message from another agent
   */
  handleMessage(message) {
    console.log(`💬 [${this.name}] Received message from ${message.from}: ${message.type}`);
    
    switch (message.type) {
      case 'data_request':
        this.handleDataRequest(message);
        break;
      case 'collaboration_request':
        this.handleCollaborationRequest(message);
        break;
      case 'result_notification':
        this.handleResultNotification(message);
        break;
      default:
        console.log(`❓ [${this.name}] Unknown message type: ${message.type}`);
    }
  }

  /**
   * Send a message to another agent
   */
  sendMessage(targetAgent, messageType, payload) {
    if (this.eventBus) {
      const message = {
        from: this.name,
        to: targetAgent,
        type: messageType,
        payload: payload,
        timestamp: Date.now()
      };
      
      this.eventBus.emit('agent_message', message);
      console.log(`📤 [${this.name}] Sent ${messageType} to ${targetAgent}`);
    }
  }

  /**
   * Broadcast an event to all agents
   */
  broadcastEvent(eventType, data) {
    if (this.eventBus) {
      this.eventBus.emit(eventType, data);
      console.log(`📢 [${this.name}] Broadcast ${eventType}`);
    }
  }

  /**
   * Store data in shared memory for other agents
   */
  shareData(key, data) {
    if (this.sharedMemory) {
      this.sharedMemory.set(key, data);
      this.broadcastEvent('data_available', { key, data });
    }
  }

  /**
   * Get agent status and autonomy metrics
   */
  getAutonomyStatus() {
    return {
      name: this.name,
      state: this.state,
      isRunning: this.isRunning,
      goals: this.goals,
      capabilities: this.capabilities,
      autonomyMetrics: {
        decisionsCount: this.decisionsCount,
        actionsCount: this.actionsCount,
        communicationsCount: this.communicationsCount,
        knowledgeItems: this.knowledge.size,
        pendingMessages: this.inbox.length
      }
    };
  }

  // Message handlers - override in concrete agents
  handleDataRequest(message) {
    // Override in concrete agents
  }

  handleCollaborationRequest(message) {
    // Override in concrete agents
  }

  handleResultNotification(message) {
    // Override in concrete agents
  }
}