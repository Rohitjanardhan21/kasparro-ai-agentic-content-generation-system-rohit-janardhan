/**
 * Orchestrator - True Multi-Agent Coordination Platform
 * 
 * This orchestrator enables genuine multi-agent coordination by:
 * 1. Providing a platform for agent registration and discovery
 * 2. Facilitating agent-to-agent communication and negotiation
 * 3. Supporting dynamic goal formation and task creation by agents
 * 4. Enabling emergent workflows through agent collaboration
 * 5. Maintaining agent autonomy while providing coordination services
 */

import { EventEmitter } from 'events';

export class Orchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.orchestratorId = config.orchestratorId || `orchestrator_${Date.now()}`;
    this.agents = new Map();
    this.agentCapabilities = new Map();
    this.messageQueue = [];
    this.sharedKnowledge = new Map();
    
    // Coordination state (not control state)
    this.isRunning = false;
    this.facilitationRounds = 0;
    this.agentInteractions = [];
    this.emergentGoals = [];
    
    // Metrics for evaluation
    this.metrics = {
      startTime: null,
      endTime: null,
      totalAgents: 0,
      agentInteractions: 0,
      emergentGoals: 0,
      autonomousDecisions: 0,
      collaborativeActions: 0
    };
    
    console.log(`🎯 [Orchestrator] Initialized multi-agent coordination platform ${this.orchestratorId}`);
  }
  
  /**
   * Register an agent in the multi-agent system
   */
  registerAgent(agent) {
    if (this.agents.has(agent.id)) {
      console.warn(`⚠️  [Orchestrator] Agent ${agent.id} already registered`);
      return false;
    }
    
    // Register agent and its capabilities
    this.agents.set(agent.id, agent);
    this.agentCapabilities.set(agent.id, {
      capabilities: agent.getCapabilities(),
      type: agent.getType(),
      status: 'active',
      goals: [],
      interactions: []
    });
    
    // Set up agent communication channels
    agent.setOrchestrator(this);
    
    // Listen to agent events for coordination
    agent.on('goal_created', (goal) => this.handleAgentGoal(agent.id, goal));
    agent.on('interaction_request', (request) => this.facilitateInteraction(request));
    agent.on('decision_made', (decision) => this.recordDecision(agent.id, decision));
    agent.on('knowledge_shared', (knowledge) => this.updateSharedKnowledge(knowledge));
    
    console.log(`📝 [Orchestrator] Agent ${agent.id} registered with capabilities: [${agent.getCapabilities().join(', ')}]`);
    
    // Notify other agents about new member
    this.broadcastToAgents('agent_joined', {
      agentId: agent.id,
      type: agent.getType(),
      capabilities: agent.getCapabilities()
    }, agent.id);
    
    return true;
  }
  
  /**
   * Start the multi-agent coordination platform
   */
  async start(initialContext = {}) {
    if (this.isRunning) {
      throw new Error('Orchestrator is already running');
    }
    
    console.log('\n🚀 [Orchestrator] Starting multi-agent coordination platform...');
    console.log('🎯 Agents will operate autonomously with coordination support');
    
    this.isRunning = true;
    this.metrics.startTime = Date.now();
    this.metrics.totalAgents = this.agents.size;
    
    // Provide initial context to all agents
    if (Object.keys(initialContext).length > 0) {
      this.updateSharedKnowledge({ type: 'initial_context', data: initialContext });
    }
    
    // Start all agents autonomously
    console.log(`🤖 [Orchestrator] Starting ${this.agents.size} autonomous agents...`);
    for (const agent of this.agents.values()) {
      await agent.startAutonomousOperation(initialContext);
    }
    
    // Begin coordination facilitation
    try {
      await this.facilitateCoordination();
      
      this.metrics.endTime = Date.now();
      console.log('\n🎉 [Orchestrator] Multi-agent coordination completed successfully!');
      
      return this.collectResults();
      
    } catch (error) {
      this.metrics.endTime = Date.now();
      console.error(`❌ [Orchestrator] Coordination failed: ${error.message}`);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Facilitate coordination between autonomous agents
   */
  async facilitateCoordination() {
    console.log('\n🔄 [Orchestrator] Beginning coordination facilitation...');
    
    const maxRounds = 20; // Reduced from 50
    const roundDuration = 1000; // Reduced from 2000ms to 1000ms
    
    while (this.facilitationRounds < maxRounds && this.isRunning) {
      this.facilitationRounds++;
      
      // Only log every 5th round to reduce verbosity
      if (this.facilitationRounds % 5 === 1 || this.facilitationRounds <= 3) {
        console.log(`\n🎯 [Orchestrator] Facilitation Round ${this.facilitationRounds}`);
      }
      
      // 1. Process agent messages and interactions
      await this.processAgentMessages();
      
      // 2. Facilitate any pending interactions
      await this.processPendingInteractions();
      
      // 3. Update shared knowledge based on agent contributions
      await this.updateKnowledgeBase();
      
      // 4. Check if agents have achieved their goals
      const systemStatus = await this.assessSystemStatus();
      
      if (systemStatus.completed) {
        console.log(`✅ [Orchestrator] System goals achieved in ${this.facilitationRounds} rounds`);
        break;
      }
      
      // Allow agents to continue autonomous operation
      await this.sleep(roundDuration);
    }
    
    console.log(`🏁 [Orchestrator] Coordination facilitation completed after ${this.facilitationRounds} rounds`);
  }
  
  /**
   * Process messages between agents
   */
  async processAgentMessages() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`📨 [Orchestrator] Processing ${this.messageQueue.length} agent messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    for (const message of messages) {
      await this.deliverMessage(message);
      this.metrics.agentInteractions++;
    }
  }
  
  /**
   * Deliver message between agents
   */
  async deliverMessage(message) {
    const { fromAgent, toAgent, type, content } = message;
    
    if (toAgent === 'broadcast') {
      // Broadcast to all agents except sender
      for (const [agentId, agent] of this.agents.entries()) {
        if (agentId !== fromAgent) {
          try {
            await agent.receiveMessage({
              from: fromAgent,
              type: type,
              content: content,
              timestamp: Date.now()
            });
          } catch (error) {
            console.error(`❌ [Orchestrator] Failed to deliver message to ${agentId}: ${error.message}`);
          }
        }
      }
    } else {
      // Direct message to specific agent
      const targetAgent = this.agents.get(toAgent);
      if (targetAgent) {
        try {
          await targetAgent.receiveMessage({
            from: fromAgent,
            type: type,
            content: content,
            timestamp: Date.now()
          });
          
          // Log data responses for debugging
          if (type === 'data_response') {
            console.log(`📨 [Orchestrator] Delivered ${content.requestedData} from ${fromAgent} to ${toAgent}`);
          }
        } catch (error) {
          console.error(`❌ [Orchestrator] Failed to deliver message to ${toAgent}: ${error.message}`);
        }
      } else {
        console.error(`❌ [Orchestrator] Target agent ${toAgent} not found`);
      }
    }
  }
  
  /**
   * Process pending agent interactions
   */
  async processPendingInteractions() {
    // This method facilitates complex multi-agent interactions
    // like negotiations, collaborations, and resource sharing
    
    for (const interaction of this.agentInteractions) {
      if (interaction.status === 'pending') {
        await this.facilitateComplexInteraction(interaction);
      }
    }
  }
  
  /**
   * Facilitate complex multi-agent interaction
   */
  async facilitateComplexInteraction(interaction) {
    const { type, participants, data } = interaction;
    
    // Handle cases where participants might be undefined
    if (!participants || !Array.isArray(participants)) {
      console.log(`⚠️  [Orchestrator] Skipping interaction ${type} - invalid participants`);
      interaction.status = 'skipped';
      return;
    }
    
    console.log(`🤝 [Orchestrator] Facilitating ${type} interaction between ${participants.length} agents`);
    
    switch (type) {
      case 'collaboration':
        await this.facilitateCollaboration(participants, data);
        break;
      case 'negotiation':
        await this.facilitateNegotiation(participants, data);
        break;
      case 'resource_sharing':
        await this.facilitateResourceSharing(participants, data);
        break;
      default:
        console.log(`⚠️  [Orchestrator] Unknown interaction type: ${type}`);
    }
    
    interaction.status = 'completed';
    this.metrics.collaborativeActions++;
  }
  
  /**
   * Facilitate collaboration between agents
   */
  async facilitateCollaboration(participants, data) {
    console.log(`🤝 [Orchestrator] Facilitating collaboration: ${data.goal}`);
    
    // Create collaboration context
    const collaborationContext = {
      id: `collab_${Date.now()}`,
      goal: data.goal,
      participants: participants,
      sharedResources: {},
      status: 'active'
    };
    
    // Notify all participants
    for (const agentId of participants) {
      const agent = this.agents.get(agentId);
      if (agent) {
        await agent.joinCollaboration(collaborationContext);
      }
    }
  }
  
  /**
   * Facilitate negotiation between agents
   */
  async facilitateNegotiation(participants, data) {
    console.log(`💬 [Orchestrator] Facilitating negotiation: ${data.subject}`);
    
    // Simple negotiation protocol
    const negotiationRounds = 3;
    let agreement = null;
    
    for (let round = 1; round <= negotiationRounds; round++) {
      console.log(`   Round ${round}: Collecting proposals`);
      
      const proposals = [];
      for (const agentId of participants) {
        const agent = this.agents.get(agentId);
        if (agent) {
          const proposal = await agent.makeProposal(data);
          proposals.push({ agentId, proposal });
        }
      }
      
      // Simple agreement logic (can be made more sophisticated)
      if (proposals.length > 0) {
        agreement = proposals[0].proposal; // Take first proposal for simplicity
        break;
      }
    }
    
    // Notify participants of agreement
    if (agreement) {
      for (const agentId of participants) {
        const agent = this.agents.get(agentId);
        if (agent) {
          await agent.receiveAgreement(agreement);
        }
      }
    }
  }
  
  /**
   * Facilitate resource sharing between agents
   */
  async facilitateResourceSharing(participants, data) {
    console.log(`📦 [Orchestrator] Facilitating resource sharing: ${data.resource}`);
    
    const { resource, requester, providers } = data;
    
    // Find agents willing to share the resource
    for (const providerId of providers) {
      const provider = this.agents.get(providerId);
      const requesterAgent = this.agents.get(requester);
      
      if (provider && requesterAgent) {
        const canShare = await provider.canShareResource(resource);
        if (canShare) {
          const sharedResource = await provider.shareResource(resource);
          await requesterAgent.receiveResource(resource, sharedResource);
          break;
        }
      }
    }
  }
  
  /**
   * Update knowledge base with agent contributions
   */
  async updateKnowledgeBase() {
    // Agents can contribute to shared knowledge
    // This enables emergent intelligence and coordination
  }
  
  /**
   * Assess overall system status
   */
  async assessSystemStatus() {
    const activeAgents = Array.from(this.agents.values()).filter(agent => agent.isActive());
    const completedGoals = this.emergentGoals.filter(goal => goal.status === 'completed');
    
    // Check if we have generated the required content
    const hasRequiredContent = this.hasGeneratedRequiredContent();
    
    return {
      completed: hasRequiredContent || activeAgents.length === 0,
      activeAgents: activeAgents.length,
      totalAgents: this.agents.size,
      completedGoals: completedGoals.length,
      totalGoals: this.emergentGoals.length
    };
  }
  
  /**
   * Check if required content has been generated
   */
  hasGeneratedRequiredContent() {
    const requiredContent = ['faq', 'product_page', 'comparison_page'];
    return requiredContent.every(type => 
      this.sharedKnowledge.has(type) || this.sharedKnowledge.has(`${type}_content`)
    );
  }
  
  /**
   * Handle agent goal creation
   */
  handleAgentGoal(agentId, goal) {
    console.log(`🎯 [Orchestrator] Agent ${agentId} created goal: ${goal.description}`);
    
    this.emergentGoals.push({
      id: `goal_${Date.now()}`,
      agentId: agentId,
      description: goal.description,
      status: 'active',
      createdAt: Date.now()
    });
    
    this.metrics.emergentGoals++;
  }
  
  /**
   * Facilitate interaction between agents
   */
  facilitateInteraction(request) {
    console.log(`🔄 [Orchestrator] Facilitating interaction: ${request.type}`);
    
    // All interactions should go through message queue for proper delivery
    this.messageQueue.push(request);
  }
  
  /**
   * Record agent decision for metrics
   */
  recordDecision(agentId, decision) {
    // Only log significant decisions to reduce verbosity
    if (decision && decision.action && decision.action !== 'work_on_goal') {
      console.log(`🧠 [Orchestrator] Agent ${agentId} made decision: ${decision.action}`);
    }
    this.metrics.autonomousDecisions++;
  }
  
  /**
   * Update shared knowledge
   */
  updateSharedKnowledge(knowledge) {
    this.sharedKnowledge.set(knowledge.type, knowledge.data);
    console.log(`📚 [Orchestrator] Updated shared knowledge: ${knowledge.type}`);
  }
  
  /**
   * Broadcast message to all agents
   */
  broadcastToAgents(type, content, excludeAgent = null) {
    for (const [agentId, agent] of this.agents.entries()) {
      if (agentId !== excludeAgent) {
        agent.receiveMessage({
          from: 'orchestrator',
          type: type,
          content: content,
          timestamp: Date.now()
        });
      }
    }
  }
  
  /**
   * Collect results from multi-agent coordination
   */
  collectResults() {
    const results = {
      orchestrationType: 'true_multi_agent_coordination',
      architecture: 'autonomous_agents_with_coordination_platform',
      
      // Coordination metrics
      metrics: {
        ...this.metrics,
        runtime: this.metrics.endTime - this.metrics.startTime,
        facilitationRounds: this.facilitationRounds,
        autonomyRatio: this.metrics.autonomousDecisions / Math.max(this.metrics.totalAgents, 1),
        collaborationRatio: this.metrics.collaborativeActions / Math.max(this.metrics.agentInteractions, 1)
      },
      
      // Agent summaries
      agents: this.getAgentSummaries(),
      
      // Emergent goals and interactions
      emergentGoals: this.emergentGoals,
      agentInteractions: this.agentInteractions,
      
      // Shared knowledge
      sharedKnowledge: Object.fromEntries(this.sharedKnowledge.entries()),
      
      timestamp: new Date().toISOString()
    };
    
    return results;
  }
  
  /**
   * Get agent summaries
   */
  getAgentSummaries() {
    const summaries = {};
    
    for (const [agentId, agent] of this.agents.entries()) {
      const agentInfo = this.agentCapabilities.get(agentId);
      summaries[agentId] = {
        id: agentId,
        type: agent.getType(),
        capabilities: agent.getCapabilities(),
        status: agentInfo.status,
        goals: agentInfo.goals,
        interactions: agentInfo.interactions.length,
        isActive: agent.isActive()
      };
    }
    
    return summaries;
  }
  
  /**
   * Stop coordination platform
   */
  async stop() {
    console.log('\n🛑 [Orchestrator] Stopping coordination platform...');
    
    this.isRunning = false;
    
    // Stop all agents
    for (const agent of this.agents.values()) {
      await agent.stop();
    }
    
    console.log('✅ [Orchestrator] Coordination platform stopped');
  }
  
  /**
   * Utility: Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}