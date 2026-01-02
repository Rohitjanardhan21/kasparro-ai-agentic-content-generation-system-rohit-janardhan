import { EventEmitter } from 'events';

/**
 * IndependentAgent - A truly independent and modular agent
 * 
 * True Independence means:
 * 1. Agent can learn and adapt its behavior
 * 2. Agent can modify its own goals dynamically
 * 3. Agent can reason about new situations not hardcoded
 * 4. Agent can negotiate and change its behavior based on interactions
 * 
 * True Modularity means:
 * 1. Agent can work in any domain, not just content generation
 * 2. Agent's capabilities are pluggable and configurable
 * 3. Agent can be composed with other agents without modification
 * 4. Agent's behavior is driven by configuration, not hardcoded logic
 */
export class IndependentAgent extends EventEmitter {
  constructor(config) {
    super();
    
    // Core identity
    this.id = config.id || `agent_${Date.now()}`;
    this.name = config.name || this.id;
    
    // Modular capabilities - can be plugged in
    this.capabilities = new Map();
    this.behaviors = new Map();
    this.reasoningStrategies = new Map();
    
    // Dynamic goals - can be modified at runtime
    this.goals = new Set();
    this.completedGoals = new Set();
    this.abandonedGoals = new Set();
    
    // Learning and adaptation
    this.experiences = [];
    this.knowledge = new Map();
    this.beliefs = new Map();
    this.preferences = new Map();
    
    // Independence metrics
    this.autonomyLevel = config.autonomyLevel || 0.8; // How independent the agent is
    this.adaptabilityLevel = config.adaptabilityLevel || 0.7; // How much it can change
    this.learningRate = config.learningRate || 0.1; // How fast it learns
    
    // Execution state
    this.isActive = false;
    this.reasoningInterval = config.reasoningInterval || 200;
    this.executionLoop = null;
    
    // Modularity - load capabilities from config
    this.loadCapabilities(config.capabilities || []);
    this.loadBehaviors(config.behaviors || []);
    this.loadReasoningStrategies(config.reasoningStrategies || []);
  }

  /**
   * Load modular capabilities
   */
  loadCapabilities(capabilityConfigs) {
    for (const capConfig of capabilityConfigs) {
      const capability = this.createCapability(capConfig);
      this.capabilities.set(capConfig.name, capability);
    }
  }

  /**
   * Load modular behaviors
   */
  loadBehaviors(behaviorConfigs) {
    for (const behaviorConfig of behaviorConfigs) {
      const behavior = this.createBehavior(behaviorConfig);
      this.behaviors.set(behaviorConfig.name, behavior);
    }
  }

  /**
   * Load modular reasoning strategies
   */
  loadReasoningStrategies(strategyConfigs) {
    for (const strategyConfig of strategyConfigs) {
      const strategy = this.createReasoningStrategy(strategyConfig);
      this.reasoningStrategies.set(strategyConfig.name, strategy);
    }
  }

  /**
   * Create a capability from configuration (modular)
   */
  createCapability(config) {
    return {
      name: config.name,
      type: config.type,
      parameters: config.parameters || {},
      execute: config.execute || (() => {}),
      canExecute: config.canExecute || (() => true),
      cost: config.cost || 1,
      reliability: config.reliability || 1.0
    };
  }

  /**
   * Create a behavior from configuration (modular)
   */
  createBehavior(config) {
    return {
      name: config.name,
      trigger: config.trigger || (() => false),
      action: config.action || (() => {}),
      priority: config.priority || 0.5,
      conditions: config.conditions || [],
      effects: config.effects || []
    };
  }

  /**
   * Create a reasoning strategy from configuration (modular)
   */
  createReasoningStrategy(config) {
    return {
      name: config.name,
      evaluate: config.evaluate || (() => 0),
      decide: config.decide || (() => null),
      learn: config.learn || (() => {}),
      adapt: config.adapt || (() => {})
    };
  }

  /**
   * Start independent operation
   */
  async start(environment) {
    console.log(`🤖 [${this.name}] Starting truly independent operation`);
    console.log(`   Autonomy Level: ${this.autonomyLevel}`);
    console.log(`   Adaptability: ${this.adaptabilityLevel}`);
    console.log(`   Capabilities: ${Array.from(this.capabilities.keys()).join(', ')}`);
    
    this.environment = environment;
    this.isActive = true;
    
    // Start autonomous reasoning
    this.executionLoop = setInterval(() => {
      this.independentReasoningCycle();
    }, this.reasoningInterval);
    
    // Register with environment
    if (this.environment && this.environment.registerAgent) {
      this.environment.registerAgent(this);
    }
  }

  /**
   * Stop independent operation
   */
  stop() {
    console.log(`🛑 [${this.name}] Stopping independent operation`);
    this.isActive = false;
    
    if (this.executionLoop) {
      clearInterval(this.executionLoop);
    }
  }

  /**
   * Independent reasoning cycle - truly autonomous decision making
   */
  async independentReasoningCycle() {
    if (!this.isActive) return;
    
    try {
      // 1. Perceive environment and update beliefs
      const perception = this.perceive();
      this.updateBeliefs(perception);
      
      // 2. Evaluate current situation using reasoning strategies
      const situation = this.evaluateSituation();
      
      // 3. Dynamically generate or modify goals based on situation
      this.adaptGoals(situation);
      
      // 4. Use reasoning strategies to make decisions
      const decision = this.makeIndependentDecision(situation);
      
      // 5. Execute decision and learn from results
      if (decision) {
        const result = await this.executeDecision(decision);
        this.learnFromExperience(decision, result, situation);
      }
      
      // 6. Adapt behavior based on learning
      this.adaptBehavior();
      
    } catch (error) {
      console.error(`❌ [${this.name}] Error in independent reasoning:`, error.message);
      this.learnFromError(error);
    }
  }

  /**
   * Perceive environment (modular - can be extended)
   */
  perceive() {
    const perception = {
      timestamp: Date.now(),
      environment: {},
      agents: [],
      resources: {},
      events: []
    };
    
    // Use environment if available
    if (this.environment) {
      if (this.environment.getAvailableData) {
        perception.environment = this.environment.getAvailableData();
      }
      if (this.environment.getActiveAgents) {
        perception.agents = this.environment.getActiveAgents();
      }
      if (this.environment.getSharedResources) {
        perception.resources = this.environment.getSharedResources();
      }
      
      // Also get actual data values, not just metadata
      if (this.environment.sharedData) {
        perception.actualData = {};
        for (const [key, dataObj] of this.environment.sharedData.entries()) {
          perception.actualData[key] = dataObj.value;
        }
      }
    }
    
    return perception;
  }

  /**
   * Update beliefs based on perception (learning)
   */
  updateBeliefs(perception) {
    // Update beliefs about environment data
    for (const [key, value] of Object.entries(perception.environment)) {
      this.beliefs.set(`env_${key}`, {
        value: value,
        confidence: 0.9,
        timestamp: perception.timestamp
      });
    }
    
    // Update beliefs about actual data values
    if (perception.actualData) {
      for (const [key, value] of Object.entries(perception.actualData)) {
        this.beliefs.set(`data_${key}`, {
          value: value,
          confidence: 1.0,
          timestamp: perception.timestamp
        });
      }
    }
    
    // Update beliefs about other agents
    this.beliefs.set('other_agents', {
      value: perception.agents,
      confidence: 1.0,
      timestamp: perception.timestamp
    });
    
    // Decay old beliefs (forgetting)
    this.decayBeliefs(perception.timestamp);
  }

  /**
   * Decay old beliefs to simulate forgetting
   */
  decayBeliefs(currentTime) {
    const maxAge = 30000; // 30 seconds
    
    for (const [key, belief] of this.beliefs.entries()) {
      const age = currentTime - belief.timestamp;
      if (age > maxAge) {
        belief.confidence *= 0.9; // Decay confidence
        if (belief.confidence < 0.1) {
          this.beliefs.delete(key); // Forget very old beliefs
        }
      }
    }
  }

  /**
   * Evaluate current situation using reasoning strategies
   */
  evaluateSituation() {
    const situation = {
      timestamp: Date.now(),
      beliefs: Object.fromEntries(this.beliefs.entries()),
      goals: Array.from(this.goals),
      capabilities: Array.from(this.capabilities.keys()),
      opportunities: [],
      threats: [],
      resources: []
    };
    
    // Use reasoning strategies to evaluate
    for (const [name, strategy] of this.reasoningStrategies.entries()) {
      try {
        const evaluation = strategy.evaluate(situation, this);
        situation[`${name}_evaluation`] = evaluation;
      } catch (error) {
        console.warn(`⚠️  [${this.name}] Reasoning strategy ${name} failed:`, error.message);
      }
    }
    
    return situation;
  }

  /**
   * Dynamically adapt goals based on situation (true independence)
   */
  adaptGoals(situation) {
    // Agent can modify its own goals based on what it learns
    
    // Remove completed goals
    for (const goal of this.goals) {
      if (this.isGoalCompleted(goal, situation)) {
        this.goals.delete(goal);
        this.completedGoals.add(goal);
        console.log(`✅ [${this.name}] Completed goal: ${goal}`);
        this.emit('goal_modified', { action: 'completed', goal: goal });
      }
    }
    
    // Generate new goals based on situation
    const newGoals = this.generateNewGoals(situation);
    for (const goal of newGoals) {
      if (!this.goals.has(goal) && !this.completedGoals.has(goal)) {
        this.goals.add(goal);
        console.log(`🎯 [${this.name}] New goal generated: ${goal}`);
        this.emit('goal_modified', { action: 'added', goal: goal });
      }
    }
    
    // Abandon impossible goals
    for (const goal of this.goals) {
      if (this.isGoalImpossible(goal, situation)) {
        this.goals.delete(goal);
        this.abandonedGoals.add(goal);
        console.log(`🚫 [${this.name}] Abandoned impossible goal: ${goal}`);
        this.emit('goal_modified', { action: 'abandoned', goal: goal });
      }
    }
  }

  /**
   * Check if a goal is completed
   */
  isGoalCompleted(goal, situation) {
    // This can be overridden or configured
    return false; // Default: goals are never automatically completed
  }

  /**
   * Generate new goals based on situation (true autonomy)
   */
  generateNewGoals(situation) {
    const newGoals = [];
    
    // Agent can create new goals based on what it observes
    // This is where true independence shows - agent decides its own objectives
    
    // Example: if agent sees data, it might decide to analyze it
    if ((situation.beliefs.data_productData || situation.beliefs.env_productData) && !this.goals.has('analyze_available_data')) {
      newGoals.push('analyze_available_data');
    }
    
    // Example: if agent sees other agents, it might decide to collaborate
    const otherAgents = situation.beliefs.other_agents?.value || [];
    if (otherAgents.length > 0 && !this.goals.has('establish_collaboration')) {
      newGoals.push('establish_collaboration');
    }
    
    // Agent can also generate goals based on its experiences
    if (this.experiences.length > 10 && !this.goals.has('optimize_performance')) {
      newGoals.push('optimize_performance');
    }
    
    return newGoals;
  }

  /**
   * Check if a goal is impossible
   */
  isGoalImpossible(goal, situation) {
    // Agent can reason about whether goals are achievable
    return false; // Default: assume goals are possible
  }

  /**
   * Make independent decision using reasoning strategies
   */
  makeIndependentDecision(situation) {
    let bestDecision = null;
    let bestScore = -Infinity;
    
    // Use all reasoning strategies to evaluate possible decisions
    for (const [strategyName, strategy] of this.reasoningStrategies.entries()) {
      try {
        const decision = strategy.decide(situation, this);
        if (decision) {
          const score = this.evaluateDecision(decision, situation);
          if (score > bestScore) {
            bestScore = score;
            bestDecision = {
              ...decision,
              strategy: strategyName,
              score: score,
              autonomous: true // Mark as autonomous decision
            };
          }
        }
      } catch (error) {
        console.warn(`⚠️  [${this.name}] Decision strategy ${strategyName} failed:`, error.message);
      }
    }
    
    // Emit decision event for monitoring
    if (bestDecision) {
      this.emit('decision_made', bestDecision);
    }
    
    return bestDecision;
  }

  /**
   * Evaluate a potential decision
   */
  evaluateDecision(decision, situation) {
    let score = 0;
    
    // Score based on goal alignment
    if (decision.goal && this.goals.has(decision.goal)) {
      score += 50;
    }
    
    // Score based on capability match
    if (decision.capability && this.capabilities.has(decision.capability)) {
      const capability = this.capabilities.get(decision.capability);
      score += capability.reliability * 30;
    }
    
    // Score based on expected outcome
    score += (decision.expectedValue || 0) * 20;
    
    // Adjust based on autonomy level
    score *= this.autonomyLevel;
    
    return score;
  }

  /**
   * Execute a decision
   */
  async executeDecision(decision) {
    console.log(`⚡ [${this.name}] Executing independent decision: ${decision.action || decision.type}`);
    
    const startTime = Date.now();
    let result = { success: false, error: null, data: null };
    
    try {
      // Execute using appropriate capability
      if (decision.capability && this.capabilities.has(decision.capability)) {
        const capability = this.capabilities.get(decision.capability);
        result.data = await capability.execute(decision.parameters || {}, this);
        result.success = true;
      } else if (decision.action) {
        // Execute custom action
        result.data = await this.executeCustomAction(decision);
        result.success = true;
      }
      
      result.executionTime = Date.now() - startTime;
      
    } catch (error) {
      result.error = error;
      result.executionTime = Date.now() - startTime;
      console.error(`❌ [${this.name}] Decision execution failed:`, error.message);
    }
    
    return result;
  }

  /**
   * Execute custom action (extensible)
   */
  async executeCustomAction(decision) {
    console.log(`🔧 [${this.name}] Executing custom action: ${decision.action}`);
    
    switch (decision.action) {
      case 'analyze_failures':
        return this.analyzeFailures(decision.parameters);
      case 'optimize_capability_usage':
        return this.optimizeCapabilityUsage(decision.parameters);
      case 'acquire_knowledge':
        return this.acquireKnowledge(decision.parameters);
      case 'optimize_performance':
        return this.optimizePerformance(decision.parameters);
      default:
        return { action: decision.action, timestamp: Date.now() };
    }
  }
  
  /**
   * Analyze failures to improve performance
   */
  async analyzeFailures(params) {
    const experiences = params.experiences || this.experiences.slice(-10);
    const failures = experiences.filter(exp => !exp.success);
    
    console.log(`🔍 [${this.name}] Analyzing ${failures.length} recent failures`);
    
    // Identify common failure patterns
    const failurePatterns = {};
    for (const failure of failures) {
      const pattern = failure.decision?.capability || 'unknown';
      failurePatterns[pattern] = (failurePatterns[pattern] || 0) + 1;
    }
    
    // Update knowledge about failure patterns
    for (const [pattern, count] of Object.entries(failurePatterns)) {
      this.knowledge.set(`failure_pattern_${pattern}`, {
        count: count,
        lastSeen: Date.now(),
        severity: count / failures.length
      });
    }
    
    return {
      action: 'analyze_failures',
      failuresAnalyzed: failures.length,
      patterns: failurePatterns,
      timestamp: Date.now()
    };
  }
  
  /**
   * Optimize capability usage
   */
  async optimizeCapabilityUsage(params) {
    const targetCapability = params.targetCapability;
    const currentUtilization = params.utilizationRate || 0;
    
    console.log(`⚡ [${this.name}] Optimizing usage of ${targetCapability} capability`);
    
    // Update preferences to use this capability more
    const preferenceKey = `capability_preference_${targetCapability}`;
    const currentPreference = this.preferences.get(preferenceKey) || 0.5;
    const newPreference = Math.min(1.0, currentPreference + 0.1);
    this.preferences.set(preferenceKey, newPreference);
    
    return {
      action: 'optimize_capability_usage',
      capability: targetCapability,
      oldUtilization: currentUtilization,
      newPreference: newPreference,
      timestamp: Date.now()
    };
  }
  
  /**
   * Acquire knowledge in specific area
   */
  async acquireKnowledge(params) {
    const knowledgeArea = params.knowledgeArea;
    const priority = params.priority || 0.5;
    
    console.log(`📚 [${this.name}] Acquiring knowledge in ${knowledgeArea}`);
    
    // Simulate knowledge acquisition
    this.knowledge.set(`acquired_${knowledgeArea}`, {
      level: priority,
      acquiredAt: Date.now(),
      source: 'self_directed_learning'
    });
    
    return {
      action: 'acquire_knowledge',
      area: knowledgeArea,
      priority: priority,
      timestamp: Date.now()
    };
  }
  
  /**
   * Optimize performance
   */
  async optimizePerformance(params) {
    const targetMetric = params.targetMetric || 'execution_time';
    const currentAverage = params.currentAverage || 0;
    
    console.log(`🚀 [${this.name}] Optimizing ${targetMetric} performance`);
    
    // Adjust reasoning interval for better performance
    if (targetMetric === 'execution_time' && currentAverage > 1000) {
      this.reasoningInterval = Math.max(50, this.reasoningInterval - 50);
    }
    
    return {
      action: 'optimize_performance',
      metric: targetMetric,
      oldAverage: currentAverage,
      newReasoningInterval: this.reasoningInterval,
      timestamp: Date.now()
    };
  }

  /**
   * Learn from experience (true adaptation)
   */
  learnFromExperience(decision, result, situation) {
    const experience = {
      timestamp: Date.now(),
      decision: decision,
      result: result,
      situation: situation,
      success: result.success
    };
    
    this.experiences.push(experience);
    
    // Keep only recent experiences
    if (this.experiences.length > 100) {
      this.experiences = this.experiences.slice(-100);
    }
    
    // Update knowledge based on experience
    this.updateKnowledge(experience);
    
    // Adjust preferences based on success/failure
    this.adjustPreferences(experience);
    
    // Emit learning event for monitoring
    this.emit('learning_event', {
      type: 'experience_learning',
      success: result.success,
      strategy: decision.strategy
    });
  }

  /**
   * Update knowledge from experience
   */
  updateKnowledge(experience) {
    const key = `${experience.decision.strategy}_${experience.decision.action || experience.decision.type}`;
    
    if (!this.knowledge.has(key)) {
      this.knowledge.set(key, {
        attempts: 0,
        successes: 0,
        failures: 0,
        averageTime: 0,
        reliability: 0.5
      });
    }
    
    const knowledge = this.knowledge.get(key);
    knowledge.attempts++;
    
    if (experience.success) {
      knowledge.successes++;
    } else {
      knowledge.failures++;
    }
    
    knowledge.reliability = knowledge.successes / knowledge.attempts;
    knowledge.averageTime = (knowledge.averageTime + experience.result.executionTime) / 2;
    
    this.knowledge.set(key, knowledge);
  }

  /**
   * Adjust preferences based on experience
   */
  adjustPreferences(experience) {
    const strategy = experience.decision.strategy;
    
    if (!this.preferences.has(strategy)) {
      this.preferences.set(strategy, 0.5);
    }
    
    const currentPreference = this.preferences.get(strategy);
    const adjustment = experience.success ? this.learningRate : -this.learningRate;
    const newPreference = Math.max(0, Math.min(1, currentPreference + adjustment));
    
    this.preferences.set(strategy, newPreference);
  }

  /**
   * Adapt behavior based on learning
   */
  adaptBehavior() {
    // Agent can modify its own behavior based on what it has learned
    
    // Adjust autonomy level based on success rate
    const recentExperiences = this.experiences.slice(-20);
    if (recentExperiences.length > 10) {
      const successRate = recentExperiences.filter(e => e.success).length / recentExperiences.length;
      
      if (successRate > 0.8 && this.autonomyLevel < 1.0) {
        this.autonomyLevel = Math.min(1.0, this.autonomyLevel + 0.01);
        console.log(`📈 [${this.name}] Increased autonomy to ${this.autonomyLevel.toFixed(2)}`);
      } else if (successRate < 0.3 && this.autonomyLevel > 0.1) {
        this.autonomyLevel = Math.max(0.1, this.autonomyLevel - 0.01);
        console.log(`📉 [${this.name}] Decreased autonomy to ${this.autonomyLevel.toFixed(2)}`);
      }
    }
    
    // Adapt reasoning interval based on activity level
    const recentActivity = this.experiences.filter(e => Date.now() - e.timestamp < 5000).length;
    if (recentActivity > 5) {
      this.reasoningInterval = Math.max(100, this.reasoningInterval - 10);
    } else if (recentActivity === 0) {
      this.reasoningInterval = Math.min(1000, this.reasoningInterval + 10);
    }
  }

  /**
   * Learn from errors
   */
  learnFromError(error) {
    console.log(`🧠 [${this.name}] Learning from error: ${error.message}`);
    
    // Agent can adapt its behavior when it encounters errors
    this.beliefs.set('last_error', {
      value: error.message,
      timestamp: Date.now(),
      confidence: 1.0
    });
    
    // Reduce confidence in current approach
    this.autonomyLevel *= 0.95;
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
      autonomyLevel: this.autonomyLevel,
      adaptabilityLevel: this.adaptabilityLevel,
      goals: Array.from(this.goals),
      completedGoals: Array.from(this.completedGoals),
      capabilities: Array.from(this.capabilities.keys()),
      behaviors: Array.from(this.behaviors.keys()),
      reasoningStrategies: Array.from(this.reasoningStrategies.keys()),
      experiences: this.experiences.length,
      knowledge: this.knowledge.size,
      beliefs: this.beliefs.size,
      preferences: Object.fromEntries(this.preferences.entries())
    };
  }

  /**
   * Add new capability at runtime (modularity)
   */
  addCapability(name, capability) {
    this.capabilities.set(name, capability);
    console.log(`🔧 [${this.name}] Added new capability: ${name}`);
  }

  /**
   * Remove capability at runtime (modularity)
   */
  removeCapability(name) {
    this.capabilities.delete(name);
    console.log(`🗑️  [${this.name}] Removed capability: ${name}`);
  }

  /**
   * Add new reasoning strategy at runtime (modularity)
   */
  addReasoningStrategy(name, strategy) {
    this.reasoningStrategies.set(name, strategy);
    console.log(`🧠 [${this.name}] Added new reasoning strategy: ${name}`);
  }
}