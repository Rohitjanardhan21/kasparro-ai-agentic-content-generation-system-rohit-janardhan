/**
 * BaseAgent - Foundation for truly autonomous multi-agent system
 * 
 * Key Principles:
 * 1. Agents are fully autonomous with their own goals and decision-making
 * 2. Agents interact dynamically with other agents through negotiation
 * 3. Agents can create goals, form collaborations, and adapt behavior
 * 4. Agents maintain independence while participating in coordination
 * 5. Agents have emergent behavior and can learn from interactions
 */

import { EventEmitter } from 'events';

export class BaseAgent extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = config.id || `agent_${Date.now()}`;
    this.name = config.name || this.id;
    this.type = config.type || 'generic';
    this.capabilities = new Set(config.capabilities || []);
    
    // Autonomous agent state
    this.isRunning = false;
    this.goals = new Set();
    this.beliefs = new Map();
    this.knowledge = new Map();
    this.collaborations = new Map();
    
    // Coordination infrastructure
    this.orchestrator = null;
    this.peerAgents = new Map();
    this.messageHistory = [];
    this.decisionHistory = [];
    
    // Autonomous behavior parameters
    this.autonomyLevel = 0.9;
    this.decisionInterval = 2000; // Reduced from 3000ms to 2000ms
    this.maxRuntime = 60000; // Reduced from 120000ms to 60000ms (1 minute)
    
    // Agent metrics
    this.decisionsCount = 0;
    this.interactionsCount = 0;
    this.collaborationsCount = 0;
    this.goalsAchieved = 0;
    
    console.log(`🤖 [${this.id}] Autonomous ${this.type} agent created with capabilities: [${Array.from(this.capabilities).join(', ')}]`);
  }
  
  /**
   * Set orchestrator for coordination (not control)
   */
  setOrchestrator(orchestrator) {
    this.orchestrator = orchestrator;
  }
  
  /**
   * Start autonomous operation
   */
  async startAutonomousOperation(initialContext = {}) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    console.log(`🚀 [${this.id}] Starting autonomous operation`);
    
    // Process initial context
    if (Object.keys(initialContext).length > 0) {
      this.beliefs.set('initial_context', initialContext);
      await this.processInitialContext(initialContext);
    }
    
    // Create initial goals based on agent's purpose
    await this.createInitialGoals();
    
    // Start autonomous decision-making loop
    this.startDecisionLoop();
    
    // Initialize agent-specific behavior
    await this.initialize();
  }
  
  /**
   * Process initial context and create relevant beliefs
   */
  async processInitialContext(context) {
    // Each agent processes context differently based on their capabilities
    if (this.capabilities.has('data_validation') && context.productName) {
      this.beliefs.set('product_data_available', true);
      this.beliefs.set('product_data', context);
    }
    
    // Create goal based on context - ensure we don't corrupt the context
    if (context && context.productName) {
      const productName = context.productName;
      this.createGoal(`process_product_${productName.replace(/\s+/g, '_')}`);
    }
  }
  
  /**
   * Create initial goals based on agent capabilities
   */
  async createInitialGoals() {
    // Each agent type creates different initial goals
    if (this.capabilities.has('data_validation')) {
      this.createGoal('validate_and_normalize_data');
    }
    
    if (this.capabilities.has('question_generation')) {
      this.createGoal('generate_comprehensive_questions');
    }
    
    if (this.capabilities.has('faq_generation')) {
      this.createGoal('create_faq_content');
    }
    
    if (this.capabilities.has('product_page_generation')) {
      this.createGoal('create_product_page');
    }
    
    if (this.capabilities.has('competitor_generation')) {
      this.createGoal('analyze_market_competition');
    }
    
    if (this.capabilities.has('comparison_generation')) {
      this.createGoal('create_comparison_analysis');
    }
    
    if (this.capabilities.has('content_analysis')) {
      this.createGoal('analyze_content_quality');
    }
    
    if (this.capabilities.has('seo_optimization')) {
      this.createGoal('optimize_content_seo');
    }
  }
  
  /**
   * Create a new goal
   */
  createGoal(description) {
    const goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      description: description,
      status: 'active',
      createdAt: Date.now(),
      priority: this.calculateGoalPriority(description)
    };
    
    this.goals.add(goal);
    console.log(`🎯 [${this.id}] Created goal: ${description}`);
    
    // Notify orchestrator about new goal
    if (this.orchestrator) {
      this.emit('goal_created', goal);
    }
    
    return goal;
  }
  
  /**
   * Calculate goal priority based on agent's current state
   */
  calculateGoalPriority(description) {
    // Simple priority calculation - can be made more sophisticated
    if (description.includes('validate') || description.includes('data')) return 10;
    if (description.includes('generate') || description.includes('create')) return 8;
    if (description.includes('analyze') || description.includes('optimize')) return 6;
    return 5;
  }
  
  /**
   * Start autonomous decision-making loop
   */
  startDecisionLoop() {
    this.decisionTimer = setInterval(async () => {
      if (!this.isRunning) return;
      
      // Check runtime limit
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
   * Make autonomous decision (core autonomy)
   */
  async makeAutonomousDecision() {
    try {
      // Assess current situation
      const situation = this.assessSituation();
      
      // Decide what to do based on goals, beliefs, and situation
      const decision = await this.decideAction(situation);
      
      if (decision) {
        this.decisionsCount++;
        
        // Execute the decision
        const result = await this.executeDecision(decision);
        
        // Learn from the result
        this.learnFromResult(decision, result);
        
        // Record decision for analysis
        this.decisionHistory.push({
          decision: decision,
          result: result,
          timestamp: Date.now(),
          situation: situation
        });
        
        // Emit decision event (reduce logging verbosity)
        this.emit('decision_made', {
          decision: decision,
          result: result,
          autonomous: true
        });
        
        // Only log significant decisions or goal work
        if (decision.action === 'work_on_goal' || this.decisionsCount % 10 === 1) {
          console.log(`🧠 [${this.id}] Made autonomous decision: ${decision.action}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ [${this.id}] Error in autonomous decision: ${error.message}`);
    }
  }
  
  /**
   * Assess current situation for decision making
   */
  assessSituation() {
    return {
      goals: Array.from(this.goals),
      beliefs: Object.fromEntries(this.beliefs.entries()),
      knowledge: Object.fromEntries(this.knowledge.entries()),
      collaborations: Array.from(this.collaborations.keys()),
      runtime: Date.now() - this.startTime,
      hasActiveGoals: this.goals.size > 0,
      canCollaborate: this.orchestrator !== null
    };
  }
  
  /**
   * Decide what action to take (agent-specific logic)
   */
  async decideAction(situation) {
    // Default decision logic - should be overridden by specific agents
    
    // Priority 1: Work on highest priority goal
    const activeGoals = situation.goals.filter(goal => goal.status === 'active');
    if (activeGoals.length > 0) {
      const highestPriorityGoal = activeGoals.sort((a, b) => b.priority - a.priority)[0];
      
      return {
        action: 'work_on_goal',
        goal: highestPriorityGoal,
        reasoning: `Working on highest priority goal: ${highestPriorityGoal.description}`
      };
    }
    
    // Priority 2: Share knowledge if we have valuable information
    if (this.hasValuableKnowledge()) {
      return {
        action: 'share_knowledge',
        reasoning: 'Sharing valuable knowledge with other agents'
      };
    }
    
    // Priority 3: Seek collaboration if no active goals (but limit frequency)
    if (situation.canCollaborate && this.goals.size === 0 && this.collaborations.size < 3) {
      return {
        action: 'seek_collaboration',
        reasoning: 'No active goals, seeking collaboration opportunities'
      };
    }
    
    return null; // No action needed
  }
  
  /**
   * Execute a decision
   */
  async executeDecision(decision) {
    console.log(`⚡ [${this.id}] Executing decision: ${decision.action}`);
    
    switch (decision.action) {
      case 'work_on_goal':
        return await this.workOnGoal(decision.goal);
        
      case 'seek_collaboration':
        return await this.seekCollaboration();
        
      case 'share_knowledge':
        return await this.shareKnowledge();
        
      case 'request_data':
        return await this.requestDataFromPeers(decision.dataType);
        
      case 'negotiate_resource':
        return await this.negotiateResource(decision.resource);
        
      default:
        // Delegate to agent-specific execution
        return await this.executeAgentSpecificAction(decision);
    }
  }
  
  /**
   * Work on a specific goal
   */
  async workOnGoal(goal) {
    console.log(`🎯 [${this.id}] Working on goal: ${goal.description}`);
    
    // Check if we have required data/resources
    const requirements = this.assessGoalRequirements(goal);
    
    if (requirements.missingData.length > 0) {
      // Request missing data from other agents
      await this.requestDataFromPeers(requirements.missingData);
      return { success: false, message: 'Waiting for required data', goal: goal.id };
    }
    
    // Perform goal-specific work
    const result = await this.performGoalWork(goal);
    
    if (result.success) {
      // Mark goal as completed
      goal.status = 'completed';
      goal.completedAt = Date.now();
      this.goalsAchieved++;
      
      // Remove completed goal from active goals
      this.goals.delete(goal);
      
      console.log(`✅ [${this.id}] Goal completed: ${goal.description}`);
      
      // Share results with other agents
      await this.shareResults(goal, result);
    } else {
      console.log(`⏳ [${this.id}] Goal in progress: ${goal.description} - ${result.message}`);
    }
    
    return result;
  }
  
  /**
   * Assess what's needed to complete a goal
   */
  assessGoalRequirements(goal) {
    const requirements = {
      missingData: [],
      requiredCapabilities: [],
      estimatedEffort: 1
    };
    
    // Goal-specific requirements
    if (goal.description.includes('questions') && !this.beliefs.has('clean_data')) {
      requirements.missingData.push('clean_data');
    }
    
    if (goal.description.includes('faq') && !this.beliefs.has('questions')) {
      requirements.missingData.push('questions');
    }
    
    if (goal.description.includes('comparison') && !this.beliefs.has('competitor_data')) {
      requirements.missingData.push('competitor_data');
    }
    
    if (goal.description.includes('analyze') && !this.hasContentForAnalysis()) {
      requirements.missingData.push('content_data');
    }
    
    return requirements;
  }
  
  /**
   * Check if agent has content for analysis
   */
  hasContentForAnalysis() {
    // Check beliefs first
    if (this.beliefs.has('faq_content') || 
        this.beliefs.has('product_content') || 
        this.beliefs.has('comparison_content')) {
      return true;
    }
    
    // Check if output files exist (for analytics agent)
    if (this.capabilities.has('content_analysis')) {
      try {
        const fs = require('fs');
        return fs.existsSync('output/faq.json') || 
               fs.existsSync('output/product_page.json') || 
               fs.existsSync('output/comparison_page.json');
      } catch (error) {
        return false;
      }
    }
    
    return false;
  }
  
  /**
   * Perform goal-specific work (to be overridden by specific agents)
   */
  async performGoalWork(goal) {
    // Default implementation - should be overridden
    console.log(`🔧 [${this.id}] Performing default work for goal: ${goal.description}`);
    
    // Mark goal as completed to avoid infinite loops
    goal.status = 'completed';
    goal.completedAt = Date.now();
    this.goalsAchieved++;
    
    // Remove completed goal from active goals
    this.goals.delete(goal);
    
    // Simulate work
    await this.sleep(500);
    
    return {
      success: true,
      message: `Completed goal: ${goal.description}`,
      data: { goalId: goal.id, agentId: this.id, timestamp: Date.now() }
    };
  }
  
  /**
   * Request data from peer agents
   */
  async requestDataFromPeers(dataTypes) {
    if (!Array.isArray(dataTypes)) dataTypes = [dataTypes];
    
    console.log(`📨 [${this.id}] Requesting data: [${dataTypes.join(', ')}]`);
    
    // For analytics agent, request specific content types
    if (this.capabilities.has('content_analysis')) {
      const contentTypes = ['faq_content', 'product_content', 'comparison_content'];
      for (const contentType of contentTypes) {
        const message = {
          fromAgent: this.id,
          toAgent: 'broadcast',
          type: 'data_request',
          content: {
            requestedData: contentType,
            requester: this.id,
            timestamp: Date.now()
          }
        };
        
        this.sendMessage(message);
        this.interactionsCount++;
      }
      
      return { success: true, message: `Requested ${contentTypes.length} content types` };
    }
    
    // Default behavior for other agents
    for (const dataType of dataTypes) {
      const message = {
        fromAgent: this.id,
        toAgent: 'broadcast',
        type: 'data_request',
        content: {
          requestedData: dataType,
          requester: this.id,
          timestamp: Date.now()
        }
      };
      
      this.sendMessage(message);
      this.interactionsCount++;
    }
    
    return { success: true, message: `Requested ${dataTypes.length} data types` };
  }
  
  /**
   * Share results with other agents
   */
  async shareResults(goal, result) {
    console.log(`📤 [${this.id}] Sharing results from goal: ${goal.description}`);
    
    const message = {
      fromAgent: this.id,
      toAgent: 'broadcast',
      type: 'data_share',
      content: {
        goalId: goal.id,
        goalDescription: goal.description,
        result: result,
        dataType: this.inferDataType(goal),
        timestamp: Date.now()
      }
    };
    
    this.sendMessage(message);
    this.interactionsCount++;
    
    // Also update shared knowledge through orchestrator
    if (this.orchestrator) {
      this.emit('knowledge_shared', {
        type: this.inferDataType(goal),
        data: result.data
      });
    }
  }
  
  /**
   * Infer data type from goal description
   */
  inferDataType(goal) {
    if (goal.description.includes('validate') || goal.description.includes('data')) return 'clean_data';
    if (goal.description.includes('questions')) return 'questions';
    if (goal.description.includes('faq')) return 'faq_content';
    if (goal.description.includes('product_page')) return 'product_content';
    if (goal.description.includes('competition') || goal.description.includes('competitor')) return 'competitor_data';
    if (goal.description.includes('comparison')) return 'comparison_content';
    if (goal.description.includes('analyze')) return 'analysis_data';
    if (goal.description.includes('seo')) return 'seo_data';
    return 'general_data';
  }
  
  /**
   * Seek collaboration with other agents
   */
  async seekCollaboration() {
    console.log(`🤝 [${this.id}] Seeking collaboration opportunities`);
    
    const collaborationRequest = {
      fromAgent: this.id,
      toAgent: 'broadcast',
      type: 'collaboration_request',
      content: {
        capabilities: Array.from(this.capabilities),
        availableFor: ['data_processing', 'content_generation', 'analysis'],
        timestamp: Date.now()
      }
    };
    
    this.sendMessage(collaborationRequest);
    this.interactionsCount++;
    
    return { success: true, message: 'Collaboration request sent' };
  }
  
  /**
   * Share knowledge with other agents
   */
  async shareKnowledge() {
    console.log(`📚 [${this.id}] Sharing knowledge with other agents`);
    
    const knowledgeToShare = this.selectValuableKnowledge();
    
    if (knowledgeToShare.length > 0) {
      const message = {
        fromAgent: this.id,
        toAgent: 'broadcast',
        type: 'knowledge_share',
        content: {
          knowledge: knowledgeToShare,
          timestamp: Date.now()
        }
      };
      
      this.sendMessage(message);
      this.interactionsCount++;
    }
    
    return { success: true, message: `Shared ${knowledgeToShare.length} knowledge items` };
  }
  
  /**
   * Check if agent has valuable knowledge to share
   */
  hasValuableKnowledge() {
    return this.knowledge.size > 0 || this.beliefs.size > 2; // More than initial beliefs
  }
  
  /**
   * Select valuable knowledge to share
   */
  selectValuableKnowledge() {
    const valuable = [];
    
    // Share processed data
    for (const [key, value] of this.beliefs.entries()) {
      if (key !== 'initial_context' && typeof value === 'object') {
        valuable.push({ type: key, data: value });
      }
    }
    
    return valuable.slice(0, 3); // Limit to 3 items
  }
  
  /**
   * Broadcast message to all agents
   */
  async broadcastMessage(type, content) {
    const message = {
      fromAgent: this.id,
      toAgent: 'broadcast',
      type: type,
      content: content
    };
    
    this.sendMessage(message);
  }

  /**
   * Send message through orchestrator
   */
  sendMessage(message) {
    if (this.orchestrator) {
      this.emit('interaction_request', message);
    }
    
    this.messageHistory.push(message);
  }
  
  /**
   * Receive message from another agent
   */
  async receiveMessage(message) {
    console.log(`📨 [${this.id}] Received ${message.type} from ${message.from}`);
    
    this.messageHistory.push(message);
    
    // Process different message types
    switch (message.type) {
      case 'data_request':
        await this.handleDataRequest(message);
        break;
        
      case 'data_response':
        await this.handleDataResponse(message);
        break;
        
      case 'data_share':
        await this.handleDataShare(message);
        break;
        
      case 'clean_data_available':
        await this.handleCleanDataAvailable(message);
        break;
        
      case 'questions_available':
        await this.handleQuestionsAvailable(message);
        break;
        
      case 'competitor_data_available':
        await this.handleCompetitorDataAvailable(message);
        break;
        
      case 'questions_available':
        await this.handleQuestionsAvailable(message);
        break;
        
      case 'competitor_data_available':
        await this.handleCompetitorDataAvailable(message);
        break;
        
      case 'faq_content_available':
        await this.handleFaqContentAvailable(message);
        break;
        
      case 'product_content_available':
        await this.handleProductContentAvailable(message);
        break;
        
      case 'comparison_content_available':
        await this.handleComparisonContentAvailable(message);
        break;
        
      case 'collaboration_request':
        await this.handleCollaborationRequest(message);
        break;
        
      case 'collaboration_accepted':
        await this.handleCollaborationAccepted(message);
        break;
        
      case 'knowledge_share':
        await this.handleKnowledgeShare(message);
        break;
        
      case 'agent_joined':
        await this.handleAgentJoined(message);
        break;
        
      case 'content_generated':
        await this.handleContentGenerated(message);
        break;
        
      case 'analytics_completed':
        await this.handleAnalyticsCompleted(message);
        break;
        
      case 'seo_optimization_completed':
        await this.handleSeoOptimizationCompleted(message);
        break;
        
      case 'comparison_data_available':
        await this.handleCompetitorDataAvailable(message);
        break;
        
      default:
        console.log(`🤷 [${this.id}] Unknown message type: ${message.type}`);
    }
  }
  
  /**
   * Handle data request from another agent
   */
  async handleDataRequest(message) {
    const { requestedData } = message.content;
    
    // Check if we have the requested data
    let dataToShare = null;
    if (this.beliefs.has(requestedData)) {
      dataToShare = this.beliefs.get(requestedData);
    } else if (this.knowledge.has(requestedData)) {
      dataToShare = this.knowledge.get(requestedData);
    } else if (requestedData === 'questions' && this.beliefs.has('questions')) {
      dataToShare = this.beliefs.get('questions');
    } else if (requestedData === 'competitor_data' && this.beliefs.has('competitor_data')) {
      dataToShare = this.beliefs.get('competitor_data');
    } else if (requestedData === 'faq_content' && this.beliefs.has('faq_content')) {
      dataToShare = this.beliefs.get('faq_content');
    } else if (requestedData === 'product_content' && this.beliefs.has('product_content')) {
      dataToShare = this.beliefs.get('product_content');
    } else if (requestedData === 'comparison_content' && this.beliefs.has('comparison_content')) {
      dataToShare = this.beliefs.get('comparison_content');
    }
    
    if (dataToShare) {
      const response = {
        fromAgent: this.id,
        toAgent: message.from,
        type: 'data_response',
        content: {
          requestedData: requestedData,
          data: dataToShare,
          timestamp: Date.now()
        }
      };
      
      this.sendMessage(response);
      console.log(`📤 [${this.id}] Provided ${requestedData} to ${message.from}`);
    } else {
      console.log(`❌ [${this.id}] Cannot provide ${requestedData} - not available`);
    }
  }
  
  /**
   * Handle data response from another agent
   */
  async handleDataResponse(message) {
    const { requestedData, data } = message.content;
    
    // Store the received data in beliefs
    this.beliefs.set(requestedData, data);
    
    console.log(`📥 [${this.id}] Received ${requestedData} from ${message.from}`);
    
    // Check if this enables us to work on any goals
    this.checkGoalEnablement();
  }
  
  /**
   * Handle data share from another agent
   */
  async handleDataShare(message) {
    const { dataType, result } = message.content;
    
    // Store the data in beliefs with multiple possible keys
    this.beliefs.set(dataType, result.data);
    if (dataType === 'clean_data') {
      this.beliefs.set('parse_data', result.data);
    }
    
    console.log(`📥 [${this.id}] Received ${dataType} from ${message.from}`);
    
    // Check if this enables us to work on any goals
    this.checkGoalEnablement();
  }
  
  /**
   * Handle collaboration request
   */
  async handleCollaborationRequest(message) {
    const { capabilities } = message.content;
    
    // Simple collaboration logic - accept if we have complementary capabilities
    const hasComplementary = capabilities.some(cap => !this.capabilities.has(cap));
    
    if (hasComplementary && this.collaborations.size < 2) {
      this.collaborations.set(message.from, {
        startedAt: Date.now(),
        capabilities: capabilities
      });
      
      this.collaborationsCount++;
      console.log(`🤝 [${this.id}] Accepted collaboration with ${message.from}`);
      
      // Send acceptance
      const response = {
        fromAgent: this.id,
        toAgent: message.from,
        type: 'collaboration_accepted',
        content: {
          myCapabilities: Array.from(this.capabilities),
          timestamp: Date.now()
        }
      };
      
      this.sendMessage(response);
    }
  }
  
  /**
   * Handle knowledge share
   */
  async handleKnowledgeShare(message) {
    const { knowledge } = message.content;
    
    for (const item of knowledge) {
      this.knowledge.set(`${message.from}_${item.type}`, item.data);
    }
    
    console.log(`📚 [${this.id}] Received ${knowledge.length} knowledge items from ${message.from}`);
  }
  
  /**
   * Handle agent joined notification
   */
  async handleAgentJoined(message) {
    const { agentId, type, capabilities } = message.content;
    
    this.peerAgents.set(agentId, {
      type: type,
      capabilities: capabilities,
      discoveredAt: Date.now()
    });
    
    console.log(`👥 [${this.id}] Discovered agent: ${agentId} (${type})`);
  }
  
  /**
   * Handle clean data available message
   */
  async handleCleanDataAvailable(message) {
    const { data } = message.content;
    this.beliefs.set('clean_data', data);
    console.log(`📥 [${this.id}] Received clean data from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle questions available message
   */
  async handleQuestionsAvailable(message) {
    const { questions } = message.content;
    this.beliefs.set('questions', questions);
    console.log(`📥 [${this.id}] Received questions from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle competitor data available message
   */
  async handleCompetitorDataAvailable(message) {
    const { competitors } = message.content;
    this.beliefs.set('competitor_data', competitors);
    console.log(`📥 [${this.id}] Received competitor data from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle FAQ content available message
   */
  async handleFaqContentAvailable(message) {
    const { content } = message.content;
    this.beliefs.set('faq_content', content);
    console.log(`📥 [${this.id}] Received FAQ content from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle product content available message
   */
  async handleProductContentAvailable(message) {
    const { content } = message.content;
    this.beliefs.set('product_content', content);
    console.log(`📥 [${this.id}] Received product content from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle comparison content available message
   */
  async handleComparisonContentAvailable(message) {
    const { content } = message.content;
    this.beliefs.set('comparison_content', content);
    console.log(`📥 [${this.id}] Received comparison content from ${message.from}`);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle collaboration accepted message
   */
  async handleCollaborationAccepted(message) {
    const { myCapabilities } = message.content;
    console.log(`🤝 [${this.id}] Collaboration accepted by ${message.from}`);
    
    this.collaborations.set(message.from, {
      startedAt: Date.now(),
      capabilities: myCapabilities || []
    });
    
    this.collaborationsCount++;
  }
  
  /**
   * Handle content generated message
   */
  async handleContentGenerated(message) {
    const { contentType, data } = message.content;
    console.log(`📄 [${this.id}] Content generated: ${contentType} by ${message.from}`);
    
    // Store the generated content
    this.beliefs.set(`${contentType}_content`, data);
    this.checkGoalEnablement();
  }
  
  /**
   * Handle analytics completed message
   */
  async handleAnalyticsCompleted(message) {
    console.log(`📊 [${this.id}] Analytics completed by ${message.from}`);
    
    if (message.content && message.content.data) {
      this.beliefs.set('analysis_data', message.content.data);
      this.checkGoalEnablement();
    }
  }
  
  /**
   * Handle SEO optimization completed message
   */
  async handleSeoOptimizationCompleted(message) {
    console.log(`🔍 [${this.id}] SEO optimization completed by ${message.from}`);
    
    if (message.content && message.content.data) {
      this.beliefs.set('seo_data', message.content.data);
      this.checkGoalEnablement();
    }
  }
  
  /**
   * Check if new data enables working on goals
   */
  checkGoalEnablement() {
    for (const goal of this.goals) {
      if (goal.status === 'active') {
        const requirements = this.assessGoalRequirements(goal);
        if (requirements.missingData.length === 0) {
          console.log(`🎯 [${this.id}] Goal ${goal.description} is now ready to execute`);
        }
      }
    }
  }
  
  /**
   * Execute agent-specific action (to be overridden)
   */
  async executeAgentSpecificAction(decision) {
    return { success: false, message: 'Agent-specific action not implemented' };
  }
  
  /**
   * Learn from decision result
   */
  learnFromResult(decision, result) {
    // Update knowledge based on result
    const knowledgeKey = `decision_${decision.action}`;
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
   * Join collaboration
   */
  async joinCollaboration(context) {
    console.log(`🤝 [${this.id}] Joining collaboration: ${context.goal}`);
    
    this.collaborations.set(context.id, context);
    this.collaborationsCount++;
    
    // Create collaborative goal
    this.createGoal(`collaborate_${context.goal}`);
  }
  
  /**
   * Make proposal in negotiation
   */
  async makeProposal(data) {
    // Simple proposal logic - can be made more sophisticated
    return {
      agentId: this.id,
      proposal: `${this.id}_proposal`,
      capabilities: Array.from(this.capabilities),
      timestamp: Date.now()
    };
  }
  
  /**
   * Receive agreement from negotiation
   */
  async receiveAgreement(agreement) {
    console.log(`📋 [${this.id}] Received agreement: ${agreement.proposal}`);
    this.beliefs.set('latest_agreement', agreement);
  }
  
  /**
   * Check if can share resource
   */
  async canShareResource(resource) {
    return this.beliefs.has(resource);
  }
  
  /**
   * Share resource with another agent
   */
  async shareResource(resource) {
    return this.beliefs.get(resource);
  }
  
  /**
   * Receive resource from another agent
   */
  async receiveResource(resourceType, resource) {
    this.beliefs.set(resourceType, resource);
    console.log(`📦 [${this.id}] Received resource: ${resourceType}`);
  }
  
  /**
   * Check if agent is active
   */
  isActive() {
    return this.isRunning && this.goals.size > 0;
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
   * Initialize agent (to be overridden by specific agents)
   */
  async initialize() {
    // Override in subclasses
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
    console.log(`📊 [${this.id}] Final stats: ${this.decisionsCount} decisions, ${this.interactionsCount} interactions, ${this.goalsAchieved} goals achieved`);
  }
  
  /**
   * Utility: Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}