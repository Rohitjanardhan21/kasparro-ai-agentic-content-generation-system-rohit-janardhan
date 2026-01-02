/**
 * BaseAgent - Foundation for truly autonomous agents
 * 
 * Key Principles:
 * 1. Agents make their own decisions about when and how to act
 * 2. Agents communicate directly with other agents
 * 3. Agents have their own goals and can modify them
 * 4. Agents learn and adapt their behavior
 * 5. No external orchestration or control
 */

import { EventEmitter } from 'events';

export class BaseAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = config.id || `agent_${Date.now()}`;
    this.name = config.name || this.id;
    this.type = config.type || 'generic';
    this.capabilities = new Set(config.capabilities || []);
    
    // Agent state
    this.isRunning = false;
    this.goals = new Set(config.initialGoals || []);
    this.completedGoals = new Set();
    this.beliefs = new Map();
    this.knowledge = new Map();
    
    // Communication
    this.communicationHub = null;
    this.messageCount = 0;
    this.decisionCount = 0;
    
    // Autonomy parameters
    this.autonomyLevel = config.autonomyLevel || 0.8;
    this.decisionInterval = config.decisionInterval || 4000; // 4 seconds
    this.maxRuntime = config.maxRuntime || 80000; // 80 seconds for 8 agents
    
    console.log(`🤖 [${this.id}] ${this.type} agent created`);
  }
  
  /**
   * Set communication hub (not control)
   */
  setCommunicationHub(hub) {
    this.communicationHub = hub;
  }
  
  /**
   * Start autonomous operation
   */
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    console.log(`🚀 [${this.id}] Starting autonomous operation`);
    
    // Start autonomous decision-making loop
    this.startDecisionLoop();
    
    // Discover other agents
    this.discoverOtherAgents();
    
    // Initialize agent-specific behavior
    await this.initialize();
  }
  
  /**
   * Stop autonomous operation
   */
  async stop() {
    this.isRunning = false;
    
    if (this.decisionTimer) {
      clearInterval(this.decisionTimer);
    }
    
    console.log(`🛑 [${this.id}] Stopped autonomous operation`);
    
    // Cleanup agent-specific resources
    await this.cleanup();
  }
  
  /**
   * Start autonomous decision-making loop
   */
  startDecisionLoop() {
    this.decisionTimer = setInterval(async () => {
      if (!this.isRunning) return;
      
      // Check if we should continue running
      const runtime = Date.now() - this.startTime;
      if (runtime > this.maxRuntime) {
        console.log(`⏰ [${this.id}] Maximum runtime reached, stopping`);
        await this.stop();
        return;
      }
      
      // Make autonomous decision
      await this.makeAutonomousDecision();
      
    }, this.decisionInterval);
  }
  
  /**
   * Make autonomous decision (core autonomy method)
   */
  async makeAutonomousDecision() {
    try {
      // Assess current situation
      const situation = this.assessSituation();
      
      // Decide what to do based on goals and situation
      const decision = this.decideAction(situation);
      
      if (decision) {
        this.decisionCount++;
        
        // Execute the decision
        const result = await this.executeDecision(decision);
        
        // Learn from the result
        this.learnFromResult(decision, result);
        
        // Emit decision event for monitoring
        this.emit('decision_made', {
          decision: decision,
          result: result,
          autonomous: true,
          timestamp: Date.now()
        });
        
        console.log(`🧠 [${this.id}] Made decision: ${decision.action}`);
      }
      
    } catch (error) {
      console.error(`❌ [${this.id}] Error in autonomous decision: ${error.message}`);
    }
  }
  
  /**
   * Assess current situation
   */
  assessSituation() {
    return {
      goals: Array.from(this.goals),
      completedGoals: Array.from(this.completedGoals),
      beliefs: Object.fromEntries(this.beliefs.entries()),
      knowledge: Object.fromEntries(this.knowledge.entries()),
      runtime: Date.now() - this.startTime,
      messageCount: this.messageCount,
      hasActiveGoals: this.goals.size > 0
    };
  }
  
  /**
   * Decide what action to take (must be implemented by subclasses)
   */
  decideAction(situation) {
    // Default: work on first available goal
    if (this.goals.size > 0) {
      const firstGoal = Array.from(this.goals)[0];
      return {
        action: 'work_on_goal',
        goal: firstGoal,
        reasoning: 'Working on first available goal'
      };
    }
    
    return null; // No action needed
  }
  
  /**
   * Execute a decision (must be implemented by subclasses)
   */
  async executeDecision(decision) {
    console.log(`⚡ [${this.id}] Executing: ${decision.action}`);
    
    // Default implementation
    if (decision.action === 'work_on_goal') {
      // Simulate working on goal
      await this.sleep(1000);
      
      // Mark goal as completed
      this.goals.delete(decision.goal);
      this.completedGoals.add(decision.goal);
      
      return { success: true, message: `Completed goal: ${decision.goal}` };
    }
    
    return { success: false, message: 'Unknown action' };
  }
  
  /**
   * Learn from decision result
   */
  learnFromResult(decision, result) {
    // Update knowledge based on result
    const knowledgeKey = `action_${decision.action}`;
    let actionKnowledge = this.knowledge.get(knowledgeKey) || {
      attempts: 0,
      successes: 0,
      failures: 0
    };
    
    actionKnowledge.attempts++;
    if (result.success) {
      actionKnowledge.successes++;
    } else {
      actionKnowledge.failures++;
    }
    
    this.knowledge.set(knowledgeKey, actionKnowledge);
  }
  
  /**
   * Send message to another agent
   */
  async sendMessage(targetAgentId, messageType, content) {
    if (!this.communicationHub) {
      console.warn(`⚠️  [${this.id}] No communication hub available`);
      return false;
    }
    
    const message = {
      type: messageType,
      content: content,
      timestamp: Date.now()
    };
    
    const sent = this.communicationHub.routeMessage(this.id, targetAgentId, message);
    
    if (sent) {
      this.messageCount++;
      this.emit('message_sent', { to: targetAgentId, message });
      console.log(`📤 [${this.id}] Sent ${messageType} to ${targetAgentId}`);
    }
    
    return sent;
  }
  
  /**
   * Broadcast message to all agents
   */
  async broadcastMessage(messageType, content) {
    if (!this.communicationHub) {
      console.warn(`⚠️  [${this.id}] No communication hub available`);
      return false;
    }
    
    const message = {
      type: messageType,
      content: content,
      timestamp: Date.now()
    };
    
    const sent = this.communicationHub.broadcast(this.id, message);
    
    if (sent) {
      this.messageCount++;
      this.emit('message_sent', { broadcast: true, message });
      console.log(`📡 [${this.id}] Broadcast ${messageType}`);
    }
    
    return sent;
  }
  
  /**
   * Receive system event
   */
  receiveSystemEvent(event) {
    // Update beliefs based on system events
    if (event.eventType === 'agent_joined') {
      this.updateBeliefAboutOtherAgents(event.data);
    } else if (event.eventType === 'data_available') {
      this.updateBeliefAboutAvailableData(event.data);
    }
    
    // Agents can react to system events autonomously
    this.reactToSystemEvent(event);
  }
  
  /**
   * Receive message from another agent
   */
  receiveMessage(message) {
    // Handle different message types
    if (message.type === 'clean_data_available') {
      this.beliefs.set('clean_data', message.content.data);
      console.log(`📊 [${this.id}] Received clean data from ${message.from}`);
    } else if (message.type === 'question_bank_available') {
      this.beliefs.set('question_bank', message.content);
      console.log(`❓ [${this.id}] Received question bank from ${message.from}`);
    } else if (message.type === 'comparison_data_available') {
      this.beliefs.set('comparison_data', message.content);
      console.log(`🔍 [${this.id}] Received comparison data from ${message.from}`);
    } else if (message.type === 'content_generated') {
      const contentType = message.content.contentType + '_content';
      this.beliefs.set(contentType, message.content.data);
      console.log(`📄 [${this.id}] Received ${message.content.contentType} content from ${message.from}`);
    }
    
    // Call agent-specific message handler if it exists
    if (typeof this.handleMessage === 'function') {
      this.handleMessage(message);
    }
  }
  
  /**
   * Update belief about other agents
   */
  updateBeliefAboutOtherAgents(agentData) {
    let otherAgents = this.beliefs.get('other_agents') || [];
    
    if (!otherAgents.includes(agentData.agentId)) {
      otherAgents.push(agentData.agentId);
      this.beliefs.set('other_agents', otherAgents);
      
      console.log(`👥 [${this.id}] Discovered agent: ${agentData.agentId} (${agentData.agentType})`);
    }
  }
  
  /**
   * Update belief about available data
   */
  updateBeliefAboutAvailableData(dataInfo) {
    this.beliefs.set('available_data', dataInfo.data);
    console.log(`📊 [${this.id}] Discovered available data`);
  }
  
  /**
   * React to system event (can be overridden by subclasses)
   */
  reactToSystemEvent(event) {
    // Default: no reaction
  }
  
  /**
   * Discover other agents in the system
   */
  discoverOtherAgents() {
    // Broadcast presence to discover other agents
    this.broadcastMessage('agent_discovery', {
      agentId: this.id,
      agentType: this.type,
      capabilities: Array.from(this.capabilities),
      timestamp: Date.now()
    });
  }
  
  /**
   * Add a new goal
   */
  addGoal(goal) {
    this.goals.add(goal);
    console.log(`🎯 [${this.id}] Added goal: ${goal}`);
  }
  
  /**
   * Remove a goal
   */
  removeGoal(goal) {
    this.goals.delete(goal);
    console.log(`✅ [${this.id}] Removed goal: ${goal}`);
  }
  
  /**
   * Check if agent is active
   */
  isActive() {
    return this.isRunning;
  }
  
  /**
   * Check if agent has completed its goals
   */
  hasCompletedGoals() {
    return this.goals.size === 0 && this.completedGoals.size > 0;
  }
  
  /**
   * Get agent capabilities
   */
  getCapabilities() {
    return Array.from(this.capabilities);
  }
  
  /**
   * Get agent type
   */
  getType() {
    return this.type;
  }
  
  /**
   * Get message count
   */
  getMessageCount() {
    return this.messageCount;
  }
  
  /**
   * Get decision count
   */
  getDecisionCount() {
    return this.decisionCount;
  }
  
  /**
   * Initialize agent (to be implemented by subclasses)
   */
  async initialize() {
    // Override in subclasses
  }
  
  /**
   * Cleanup agent (to be implemented by subclasses)
   */
  async cleanup() {
    // Override in subclasses
  }
  
  /**
   * Utility: Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}