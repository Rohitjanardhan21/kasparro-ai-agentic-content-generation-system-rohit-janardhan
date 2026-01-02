import { EventEmitter } from 'events';

/**
 * ModularEnvironment - A non-controlling environment for truly independent agents
 * 
 * Key Principles:
 * 1. Environment does NOT control agents - it only provides services
 * 2. Agents make their own decisions about when and how to act
 * 3. Environment facilitates communication and resource sharing
 * 4. No orchestration or workflow control
 * 5. Agents can join/leave dynamically
 */
export class ModularEnvironment extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = config.id || `env_${Date.now()}`;
    this.name = config.name || 'ModularEnvironment';
    
    // Registered agents (but environment doesn't control them)
    this.agents = new Map();
    
    // Shared resources that agents can access
    this.sharedData = new Map();
    this.sharedResources = new Map();
    
    // Communication infrastructure
    this.messageQueue = [];
    this.messageHistory = [];
    
    // Environment services
    this.services = new Map();
    
    // Metrics (for observation, not control)
    this.metrics = {
      totalMessages: 0,
      agentInteractions: 0,
      dataShares: 0,
      collaborations: 0,
      startTime: Date.now()
    };
    
    this.isActive = false;
    this.processingInterval = null;
    
    console.log(`🌍 [${this.name}] Modular environment created`);
  }
  
  /**
   * Start environment services (not agent control)
   */
  start() {
    console.log(`🚀 [${this.name}] Starting environment services...`);
    
    this.isActive = true;
    this.metrics.startTime = Date.now();
    
    // Start message processing
    this.processingInterval = setInterval(() => {
      this.processMessages();
    }, 100);
    
    // Emit environment ready event
    this.emit('environment_ready', {
      environmentId: this.id,
      services: Array.from(this.services.keys()),
      timestamp: Date.now()
    });
    
    console.log(`✅ [${this.name}] Environment services active`);
    console.log(`   - Message processing: enabled`);
    console.log(`   - Resource sharing: enabled`);
    console.log(`   - Agent registration: open`);
  }
  
  /**
   * Stop environment services
   */
  stop() {
    console.log(`🛑 [${this.name}] Stopping environment services...`);
    
    this.isActive = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    // Notify agents that environment is stopping
    this.emit('environment_stopping', {
      environmentId: this.id,
      timestamp: Date.now()
    });
    
    console.log(`✅ [${this.name}] Environment services stopped`);
  }
  
  /**
   * Register agent (agent chooses to join)
   */
  registerAgent(agent) {
    if (this.agents.has(agent.name)) {
      console.log(`⚠️  [${this.name}] Agent ${agent.name} already registered`);
      return false;
    }
    
    this.agents.set(agent.name, {
      agent: agent,
      joinedAt: Date.now(),
      messageCount: 0,
      lastActivity: Date.now()
    });
    
    console.log(`📝 [${this.name}] Agent ${agent.name} registered`);
    
    // Set up message handling for this agent
    agent.on('message', (message) => {
      this.handleAgentMessage(agent.name, message);
    });
    
    // Emit agent joined event
    this.emit('agent_joined', {
      agentName: agent.name,
      agentCount: this.agents.size,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Unregister agent (agent chooses to leave)
   */
  unregisterAgent(agentName) {
    if (!this.agents.has(agentName)) {
      return false;
    }
    
    this.agents.delete(agentName);
    
    console.log(`📤 [${this.name}] Agent ${agentName} unregistered`);
    
    this.emit('agent_left', {
      agentName: agentName,
      agentCount: this.agents.size,
      timestamp: Date.now()
    });
    
    return true;
  }
  
  /**
   * Get available data for agents to discover
   */
  getAvailableData() {
    const available = {};
    
    for (const [key, data] of this.sharedData.entries()) {
      available[key] = {
        type: data.type,
        size: JSON.stringify(data.value).length,
        timestamp: data.timestamp,
        source: data.source,
        confidence: data.confidence || 1.0
      };
    }
    
    return available;
  }
  
  /**
   * Get active agents (for agent discovery)
   */
  getActiveAgents() {
    const active = [];
    
    for (const [name, info] of this.agents.entries()) {
      if (info.agent.isActive) {
        active.push(name); // Return just the name string
      }
    }
    
    return active;
  }
  
  /**
   * Get shared resources
   */
  getSharedResources() {
    const resources = {};
    
    for (const [key, resource] of this.sharedResources.entries()) {
      resources[key] = {
        type: resource.type,
        availability: resource.availability,
        cost: resource.cost,
        owner: resource.owner
      };
    }
    
    return resources;
  }
  
  /**
   * Add data to shared environment (agents can contribute)
   */
  addData(key, value, source, metadata = {}) {
    this.sharedData.set(key, {
      value: value,
      source: source,
      timestamp: Date.now(),
      type: metadata.type || this.inferDataType(value),
      confidence: metadata.confidence || 1.0,
      metadata: metadata
    });
    
    this.metrics.dataShares++;
    
    console.log(`📊 [${this.name}] Data added: ${key} (from ${source})`);
    
    // Emit data available event
    this.emit('data_available', {
      key: key,
      type: this.sharedData.get(key).type,
      source: source,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get data from shared environment
   */
  getData(key) {
    return this.sharedData.get(key);
  }
  
  /**
   * Add shared resource
   */
  addResource(key, resource, owner) {
    this.sharedResources.set(key, {
      ...resource,
      owner: owner,
      addedAt: Date.now()
    });
    
    console.log(`🔧 [${this.name}] Resource added: ${key} (by ${owner})`);
    
    this.emit('resource_available', {
      key: key,
      type: resource.type,
      owner: owner,
      timestamp: Date.now()
    });
  }
  
  /**
   * Deliver message between agents
   */
  async deliverMessage(message) {
    if (!this.isActive) {
      return false;
    }
    
    this.messageQueue.push({
      ...message,
      queuedAt: Date.now()
    });
    
    this.metrics.totalMessages++;
    
    return true;
  }
  
  /**
   * Broadcast message to all agents
   */
  async broadcastMessage(message) {
    if (!this.isActive) {
      return [];
    }
    
    const deliveredTo = [];
    
    for (const [agentName, agentInfo] of this.agents.entries()) {
      if (agentName !== message.from && agentInfo.agent.isActive) {
        const broadcastMessage = {
          ...message,
          to: agentName,
          broadcast: true,
          queuedAt: Date.now()
        };
        
        this.messageQueue.push(broadcastMessage);
        deliveredTo.push(agentName);
      }
    }
    
    this.metrics.totalMessages += deliveredTo.length;
    
    return deliveredTo;
  }
  
  /**
   * Process message queue (environment service)
   */
  processMessages() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.deliverMessageToAgent(message);
    }
  }
  
  /**
   * Deliver message to specific agent
   */
  async deliverMessageToAgent(message) {
    const targetAgent = this.agents.get(message.to);
    
    if (!targetAgent || !targetAgent.agent.isActive) {
      console.log(`⚠️  [${this.name}] Cannot deliver message to ${message.to} - agent not available`);
      return false;
    }
    
    try {
      // Store message in history
      this.messageHistory.push({
        ...message,
        deliveredAt: Date.now()
      });
      
      // Keep only recent history
      if (this.messageHistory.length > 1000) {
        this.messageHistory = this.messageHistory.slice(-1000);
      }
      
      // Update agent activity
      targetAgent.messageCount++;
      targetAgent.lastActivity = Date.now();
      
      // Deliver to agent
      if (targetAgent.agent.capabilities.has('communication')) {
        const commCapability = targetAgent.agent.capabilities.get('communication');
        if (commCapability.handleIncomingMessage) {
          await commCapability.handleIncomingMessage(targetAgent.agent, message);
        }
      } else {
        // Emit message event for agent to handle
        targetAgent.agent.emit('incoming_message', message);
      }
      
      this.metrics.agentInteractions++;
      
      return true;
      
    } catch (error) {
      console.error(`❌ [${this.name}] Error delivering message:`, error.message);
      return false;
    }
  }
  
  /**
   * Handle message from agent
   */
  handleAgentMessage(agentName, message) {
    console.log(`📨 [${this.name}] Message from ${agentName}: ${message.type}`);
    
    // Environment doesn't control what agents do with messages
    // It just facilitates delivery
    this.deliverMessage({
      ...message,
      from: agentName
    });
  }
  
  /**
   * Wait for specific conditions (for testing/observation)
   */
  async waitForCompletion(expectedData, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCompletion = () => {
        const availableData = Array.from(this.sharedData.keys());
        const hasAllData = expectedData.every(key => availableData.includes(key));
        
        if (hasAllData) {
          resolve({
            completed: true,
            sharedData: Object.fromEntries(this.sharedData.entries()),
            agentStatuses: this.getAgentStatuses(),
            environmentMetrics: this.getMetrics()
          });
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          resolve({
            completed: false,
            timeout: true,
            availableData: availableData,
            expectedData: expectedData,
            sharedData: Object.fromEntries(this.sharedData.entries()),
            agentStatuses: this.getAgentStatuses(),
            environmentMetrics: this.getMetrics()
          });
          return;
        }
        
        setTimeout(checkCompletion, 500);
      };
      
      checkCompletion();
    });
  }
  
  /**
   * Get agent statuses (for observation)
   */
  getAgentStatuses() {
    const statuses = {};
    
    for (const [name, info] of this.agents.entries()) {
      statuses[name] = {
        isActive: info.agent.isActive,
        goals: Array.from(info.agent.goals),
        completedGoals: Array.from(info.agent.completedGoals),
        autonomyLevel: info.agent.autonomyLevel,
        messageCount: info.messageCount,
        lastActivity: info.lastActivity,
        joinedAt: info.joinedAt
      };
    }
    
    return statuses;
  }
  
  /**
   * Get environment metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      activeAgents: Array.from(this.agents.values()).filter(info => info.agent.isActive).length,
      totalAgents: this.agents.size,
      sharedDataCount: this.sharedData.size,
      sharedResourceCount: this.sharedResources.size,
      messageQueueSize: this.messageQueue.length,
      messageHistorySize: this.messageHistory.length
    };
  }
  
  /**
   * Get interaction summary
   */
  getInteractionSummary() {
    const recentMessages = this.messageHistory.slice(-50);
    const interactions = {};
    
    for (const message of recentMessages) {
      const key = `${message.from}->${message.to}`;
      if (!interactions[key]) {
        interactions[key] = { count: 0, types: new Set(), lastInteraction: 0 };
      }
      interactions[key].count++;
      interactions[key].types.add(message.type);
      interactions[key].lastInteraction = Math.max(interactions[key].lastInteraction, message.deliveredAt);
    }
    
    // Convert sets to arrays for JSON serialization
    for (const interaction of Object.values(interactions)) {
      interaction.types = Array.from(interaction.types);
    }
    
    return {
      totalInteractions: Object.keys(interactions).length,
      interactions: interactions,
      recentMessageCount: recentMessages.length,
      mostActiveAgents: this.getMostActiveAgents()
    };
  }
  
  /**
   * Get most active agents
   */
  getMostActiveAgents() {
    return Array.from(this.agents.entries())
      .sort((a, b) => b[1].messageCount - a[1].messageCount)
      .slice(0, 5)
      .map(([name, info]) => ({
        name: name,
        messageCount: info.messageCount,
        lastActivity: info.lastActivity
      }));
  }
  
  /**
   * Get environment status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
      agents: this.getAgentStatuses(),
      metrics: this.getMetrics(),
      services: Array.from(this.services.keys()),
      sharedDataKeys: Array.from(this.sharedData.keys()),
      sharedResourceKeys: Array.from(this.sharedResources.keys())
    };
  }
  
  /**
   * Infer data type
   */
  inferDataType(value) {
    if (typeof value === 'string') return 'text';
    if (typeof value === 'number') return 'numeric';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'structured';
    return 'unknown';
  }
  
  /**
   * Add environment service
   */
  addService(name, service) {
    this.services.set(name, service);
    console.log(`🔧 [${this.name}] Service added: ${name}`);
  }
  
  /**
   * Get environment service
   */
  getService(name) {
    return this.services.get(name);
  }
}