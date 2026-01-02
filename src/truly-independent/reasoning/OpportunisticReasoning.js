/**
 * OpportunisticReasoning - A reasoning strategy that looks for opportunities
 * 
 * This demonstrates true independence by:
 * 1. Agent discovers opportunities not hardcoded in advance
 * 2. Agent can adapt to new situations dynamically
 * 3. Agent makes decisions based on current context, not predetermined rules
 * 4. Agent can change its behavior based on what it learns
 */

export const OpportunisticReasoning = {
  name: 'opportunistic',
  description: 'Identifies and pursues opportunities as they arise',
  
  /**
   * Evaluate current situation for opportunities
   */
  evaluate: (situation, agent) => {
    const opportunities = [];
    const threats = [];
    const resources = [];
    
    // Look for data opportunities
    const dataOpportunities = OpportunisticReasoning.identifyDataOpportunities(situation, agent);
    opportunities.push(...dataOpportunities);
    
    // Look for collaboration opportunities
    const collabOpportunities = OpportunisticReasoning.identifyCollaborationOpportunities(situation, agent);
    opportunities.push(...collabOpportunities);
    
    // Look for learning opportunities
    const learningOpportunities = OpportunisticReasoning.identifyLearningOpportunities(situation, agent);
    opportunities.push(...learningOpportunities);
    
    // Look for optimization opportunities
    const optimizationOpportunities = OpportunisticReasoning.identifyOptimizationOpportunities(situation, agent);
    opportunities.push(...optimizationOpportunities);
    
    // Assess threats
    const identifiedThreats = OpportunisticReasoning.identifyThreats(situation, agent);
    threats.push(...identifiedThreats);
    
    // Assess available resources
    const availableResources = OpportunisticReasoning.identifyResources(situation, agent);
    resources.push(...availableResources);
    
    return {
      opportunities: opportunities,
      threats: threats,
      resources: resources,
      opportunityScore: opportunities.length * 10,
      threatLevel: threats.length * 5,
      resourceAvailability: resources.length * 8
    };
  },
  
  /**
   * Make decision based on opportunistic evaluation
   */
  decide: (situation, agent) => {
    const evaluation = OpportunisticReasoning.evaluate(situation, agent);
    
    if (evaluation.opportunities.length === 0) {
      return null; // No opportunities to pursue
    }
    
    // Sort opportunities by potential value
    const sortedOpportunities = evaluation.opportunities.sort((a, b) => b.value - a.value);
    
    // Choose the best opportunity that agent can handle
    for (const opportunity of sortedOpportunities) {
      if (OpportunisticReasoning.canPursueOpportunity(opportunity, agent, situation)) {
        return {
          type: 'pursue_opportunity',
          opportunity: opportunity,
          action: opportunity.action,
          capability: opportunity.requiredCapability,
          parameters: opportunity.parameters,
          expectedValue: opportunity.value,
          reasoning: `Pursuing ${opportunity.type} opportunity with value ${opportunity.value}`
        };
      }
    }
    
    return null;
  },
  
  /**
   * Learn from opportunistic decisions
   */
  learn: (decision, result, situation, agent) => {
    if (!decision || decision.type !== 'pursue_opportunity') return;
    
    const opportunity = decision.opportunity;
    const success = result.success;
    const actualValue = success ? (result.data?.value || decision.expectedValue) : 0;
    
    // Update agent's knowledge about opportunity types
    const knowledgeKey = `opportunity_${opportunity.type}`;
    let opportunityKnowledge = agent.knowledge.get(knowledgeKey) || {
      attempts: 0,
      successes: 0,
      totalExpectedValue: 0,
      totalActualValue: 0,
      averageAccuracy: 0
    };
    
    opportunityKnowledge.attempts++;
    if (success) opportunityKnowledge.successes++;
    opportunityKnowledge.totalExpectedValue += decision.expectedValue;
    opportunityKnowledge.totalActualValue += actualValue;
    
    // Calculate prediction accuracy
    if (opportunityKnowledge.attempts > 0) {
      opportunityKnowledge.averageAccuracy = 
        opportunityKnowledge.totalActualValue / opportunityKnowledge.totalExpectedValue;
    }
    
    agent.knowledge.set(knowledgeKey, opportunityKnowledge);
    
    console.log(`🧠 [${agent.name}] Learned from ${opportunity.type} opportunity: ${success ? 'success' : 'failure'}`);
  },
  
  /**
   * Adapt reasoning based on learning
   */
  adapt: (agent) => {
    // Adjust opportunity thresholds based on success rates
    const opportunityTypes = ['data_processing', 'collaboration', 'learning', 'optimization'];
    
    for (const type of opportunityTypes) {
      const knowledge = agent.knowledge.get(`opportunity_${type}`);
      if (knowledge && knowledge.attempts > 5) {
        const successRate = knowledge.successes / knowledge.attempts;
        
        // Adjust agent's preferences for this opportunity type
        const preferenceKey = `opportunity_preference_${type}`;
        let currentPreference = agent.preferences.get(preferenceKey) || 0.5;
        
        if (successRate > 0.7) {
          currentPreference = Math.min(1.0, currentPreference + 0.1);
        } else if (successRate < 0.3) {
          currentPreference = Math.max(0.1, currentPreference - 0.1);
        }
        
        agent.preferences.set(preferenceKey, currentPreference);
      }
    }
  },
  
  /**
   * Identify data processing opportunities
   */
  identifyDataOpportunities: (situation, agent) => {
    const opportunities = [];
    
    // Look for unprocessed data in beliefs
    for (const [key, belief] of Object.entries(situation.beliefs)) {
      if ((key.startsWith('data_') || key.startsWith('env_')) && belief.value && typeof belief.value === 'object') {
        const dataKey = key.startsWith('data_') ? key.substring(5) : key.substring(4);
        
        // Skip if we already have processed data from this source
        if (situation.beliefs.processed_data && situation.beliefs.processed_data.confidence > 0.7) {
          continue; // Don't reprocess data that's already been processed successfully
        }
        
        // Check if agent has data processing capability
        if (agent.capabilities.has('data_processing')) {
          opportunities.push({
            type: 'data_processing',
            description: `Process available data: ${dataKey}`,
            action: 'process_data',
            requiredCapability: 'data_processing',
            parameters: {
              data: belief.value,
              strategy: 'parse'
            },
            value: OpportunisticReasoning.calculateDataValue(belief.value, agent),
            confidence: belief.confidence || 0.8,
            urgency: OpportunisticReasoning.calculateUrgency(belief.timestamp)
          });
        }
      }
    }
    
    return opportunities;
  },
  
  /**
   * Identify collaboration opportunities
   */
  identifyCollaborationOpportunities: (situation, agent) => {
    const opportunities = [];
    
    const otherAgents = situation.beliefs.other_agents?.value || [];
    
    if (otherAgents.length > 0 && agent.capabilities.has('communication')) {
      // Look for agents that might complement our capabilities
      for (const otherAgent of otherAgents) {
        if (otherAgent !== agent.name) {
          opportunities.push({
            type: 'collaboration',
            description: `Collaborate with ${otherAgent}`,
            action: 'initiate_collaboration',
            requiredCapability: 'communication',
            parameters: {
              target: otherAgent,
              protocol: 'negotiation',
              messageType: 'proposal',
              content: {
                type: 'collaboration_proposal',
                capabilities: Array.from(agent.capabilities.keys()),
                goals: Array.from(agent.goals)
              }
            },
            value: OpportunisticReasoning.calculateCollaborationValue(otherAgent, agent),
            confidence: 0.6,
            urgency: 0.3
          });
        }
      }
    }
    
    return opportunities;
  },
  
  /**
   * Identify learning opportunities
   */
  identifyLearningOpportunities: (situation, agent) => {
    const opportunities = [];
    
    // Look for patterns in agent's experiences
    if (agent.experiences.length > 10) {
      const recentFailures = agent.experiences
        .slice(-20)
        .filter(exp => !exp.success);
      
      if (recentFailures.length > 5) {
        opportunities.push({
          type: 'learning',
          description: 'Analyze recent failures to improve performance',
          action: 'analyze_failures',
          requiredCapability: null, // Built-in capability
          parameters: {
            experiences: recentFailures
          },
          value: recentFailures.length * 5, // More failures = more learning value
          confidence: 0.9,
          urgency: 0.7
        });
      }
    }
    
    // Look for knowledge gaps
    const knowledgeGaps = OpportunisticReasoning.identifyKnowledgeGaps(agent);
    for (const gap of knowledgeGaps) {
      opportunities.push({
        type: 'learning',
        description: `Fill knowledge gap: ${gap.area}`,
        action: 'acquire_knowledge',
        requiredCapability: 'communication', // Might need to ask other agents
        parameters: {
          knowledgeArea: gap.area,
          priority: gap.priority
        },
        value: gap.priority * 10,
        confidence: 0.7,
        urgency: gap.priority
      });
    }
    
    return opportunities;
  },
  
  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities: (situation, agent) => {
    const opportunities = [];
    
    // Look for inefficient patterns in agent's behavior
    if (agent.experiences.length > 20) {
      const recentExperiences = agent.experiences.slice(-20);
      const averageExecutionTime = recentExperiences.reduce((sum, exp) => 
        sum + (exp.result.executionTime || 0), 0) / recentExperiences.length;
      
      if (averageExecutionTime > 1000) { // If taking more than 1 second on average
        opportunities.push({
          type: 'optimization',
          description: 'Optimize execution performance',
          action: 'optimize_performance',
          requiredCapability: null,
          parameters: {
            targetMetric: 'execution_time',
            currentAverage: averageExecutionTime,
            targetImprovement: 0.2 // 20% improvement
          },
          value: Math.min(50, averageExecutionTime / 20), // Value based on potential time savings
          confidence: 0.8,
          urgency: 0.5
        });
      }
    }
    
    // Look for underutilized capabilities
    const underutilizedCapabilities = OpportunisticReasoning.identifyUnderutilizedCapabilities(agent);
    for (const capability of underutilizedCapabilities) {
      // Only create optimization opportunities for capabilities that have proper data
      if (capability.name === 'data_processing') {
        // Skip data_processing optimization if we don't have unprocessed data
        const hasUnprocessedData = Object.entries(situation.beliefs).some(([key, belief]) => 
          (key.startsWith('data_') || key.startsWith('env_')) && 
          belief.value && 
          typeof belief.value === 'object' &&
          !key.includes('processed_data')
        );
        
        if (!hasUnprocessedData) {
          continue; // Skip this capability optimization
        }
      }
      
      opportunities.push({
        type: 'optimization',
        description: `Better utilize capability: ${capability.name}`,
        action: 'optimize_capability_usage',
        requiredCapability: null, // This is a meta-action, not using the capability directly
        parameters: {
          targetCapability: capability.name,
          utilizationRate: capability.utilizationRate,
          improvementTarget: 0.2
        },
        value: (1 - capability.utilizationRate) * 15, // Reduced value to prioritize content generation
        confidence: 0.6,
        urgency: 0.4
      });
    }
    
    return opportunities;
  },
  
  /**
   * Identify threats in the environment
   */
  identifyThreats: (situation, agent) => {
    const threats = [];
    
    // Look for resource constraints
    if (agent.experiences.length > 10) {
      const recentFailures = agent.experiences.slice(-10).filter(exp => !exp.success);
      const failureRate = recentFailures.length / 10;
      
      if (failureRate > 0.5) {
        threats.push({
          type: 'performance_degradation',
          severity: failureRate,
          description: 'High failure rate detected'
        });
      }
    }
    
    // Look for conflicting goals
    const conflictingGoals = OpportunisticReasoning.identifyConflictingGoals(agent);
    if (conflictingGoals.length > 0) {
      threats.push({
        type: 'goal_conflict',
        severity: conflictingGoals.length * 0.2,
        description: `${conflictingGoals.length} conflicting goals detected`
      });
    }
    
    return threats;
  },
  
  /**
   * Identify available resources
   */
  identifyResources: (situation, agent) => {
    const resources = [];
    
    // Agent's own capabilities are resources
    for (const [name, capability] of agent.capabilities.entries()) {
      resources.push({
        type: 'capability',
        name: name,
        availability: capability.reliability || 1.0,
        cost: capability.cost || 1
      });
    }
    
    // Other agents are potential resources
    const otherAgents = situation.beliefs.other_agents?.value || [];
    for (const otherAgent of otherAgents) {
      if (otherAgent !== agent.name) {
        resources.push({
          type: 'agent',
          name: otherAgent,
          availability: 0.7, // Assume moderate availability
          cost: 2 // Collaboration has overhead
        });
      }
    }
    
    // Environment data is a resource
    for (const [key, belief] of Object.entries(situation.beliefs)) {
      if (key.startsWith('env_') && belief.value) {
        resources.push({
          type: 'data',
          name: key.substring(4),
          availability: belief.confidence || 0.8,
          cost: 0.5 // Data is relatively cheap to use
        });
      }
    }
    
    return resources;
  },
  
  /**
   * Check if agent can pursue an opportunity
   */
  canPursueOpportunity: (opportunity, agent, situation) => {
    // Check if agent has required capability
    if (opportunity.requiredCapability && !agent.capabilities.has(opportunity.requiredCapability)) {
      return false;
    }
    
    // Check if agent has enough autonomy to pursue this type of opportunity
    const minAutonomy = {
      'data_processing': 0.3,
      'collaboration': 0.5,
      'learning': 0.4,
      'optimization': 0.6
    };
    
    const requiredAutonomy = minAutonomy[opportunity.type] || 0.5;
    if (agent.autonomyLevel < requiredAutonomy) {
      return false;
    }
    
    // Check agent's preference for this opportunity type
    const preferenceKey = `opportunity_preference_${opportunity.type}`;
    const preference = agent.preferences.get(preferenceKey) || 0.5;
    
    // Use preference and confidence to make decision
    const pursuitThreshold = 0.3 + (0.4 * (1 - preference));
    return opportunity.confidence > pursuitThreshold;
  },
  
  /**
   * Calculate value of data processing opportunity
   */
  calculateDataValue: (data, agent) => {
    if (!data || typeof data !== 'object') return 0;
    
    const fieldCount = Object.keys(data).length;
    const complexity = JSON.stringify(data).length;
    
    // More fields and complexity = more value
    let value = fieldCount * 5 + Math.min(complexity / 100, 20);
    
    // Adjust based on agent's experience with data processing
    const dataKnowledge = agent.knowledge.get('opportunity_data_processing');
    if (dataKnowledge && dataKnowledge.averageAccuracy) {
      value *= dataKnowledge.averageAccuracy;
    }
    
    return Math.round(value);
  },
  
  /**
   * Calculate value of collaboration opportunity
   */
  calculateCollaborationValue: (otherAgent, agent) => {
    // Base value for any collaboration
    let value = 20;
    
    // Adjust based on agent's collaboration experience
    const collabKnowledge = agent.knowledge.get('opportunity_collaboration');
    if (collabKnowledge) {
      const successRate = collabKnowledge.successes / collabKnowledge.attempts;
      value *= successRate;
    }
    
    // Adjust based on agent's communication preference
    const commPreference = agent.preferences.get('opportunity_preference_collaboration') || 0.5;
    value *= commPreference;
    
    return Math.round(value);
  },
  
  /**
   * Calculate urgency based on timestamp
   */
  calculateUrgency: (timestamp) => {
    const age = Date.now() - timestamp;
    const maxAge = 60000; // 1 minute
    
    return Math.max(0, 1 - (age / maxAge));
  },
  
  /**
   * Identify knowledge gaps
   */
  identifyKnowledgeGaps: (agent) => {
    const gaps = [];
    
    // Look for capabilities that agent has but little knowledge about
    for (const [capName, capability] of agent.capabilities.entries()) {
      const knowledgeKey = `capability_${capName}`;
      const knowledge = agent.knowledge.get(knowledgeKey);
      
      if (!knowledge || knowledge.attempts < 5) {
        gaps.push({
          area: capName,
          priority: 0.7,
          type: 'capability_knowledge'
        });
      }
    }
    
    // Look for reasoning strategies with poor performance
    for (const [strategyName, strategy] of agent.reasoningStrategies.entries()) {
      const preference = agent.preferences.get(strategyName) || 0.5;
      
      if (preference < 0.3) {
        gaps.push({
          area: strategyName,
          priority: 0.5,
          type: 'strategy_improvement'
        });
      }
    }
    
    return gaps;
  },
  
  /**
   * Identify underutilized capabilities
   */
  identifyUnderutilizedCapabilities: (agent) => {
    const underutilized = [];
    
    for (const [capName, capability] of agent.capabilities.entries()) {
      const knowledgeKey = `capability_${capName}`;
      const knowledge = agent.knowledge.get(knowledgeKey);
      
      let utilizationRate = 0;
      if (knowledge && knowledge.attempts > 0) {
        // Calculate utilization based on recent usage
        const recentUsage = agent.experiences
          .slice(-20)
          .filter(exp => exp.decision.capability === capName).length;
        
        utilizationRate = recentUsage / 20;
      }
      
      if (utilizationRate < 0.3) { // Less than 30% utilization
        underutilized.push({
          name: capName,
          utilizationRate: utilizationRate,
          capability: capability
        });
      }
    }
    
    return underutilized;
  },
  
  /**
   * Identify conflicting goals
   */
  identifyConflictingGoals: (agent) => {
    const conflicts = [];
    const goals = Array.from(agent.goals);
    
    // Simple conflict detection - goals that require the same exclusive resource
    for (let i = 0; i < goals.length; i++) {
      for (let j = i + 1; j < goals.length; j++) {
        if (OpportunisticReasoning.goalsConflict(goals[i], goals[j])) {
          conflicts.push({
            goal1: goals[i],
            goal2: goals[j],
            type: 'resource_conflict'
          });
        }
      }
    }
    
    return conflicts;
  },
  
  /**
   * Check if two goals conflict
   */
  goalsConflict: (goal1, goal2) => {
    // Simple heuristic - goals with similar names might conflict
    const similarity = OpportunisticReasoning.calculateStringSimilarity(goal1, goal2);
    return similarity > 0.7 && goal1 !== goal2;
  },
  
  /**
   * Calculate string similarity
   */
  calculateStringSimilarity: (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = OpportunisticReasoning.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },
  
  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance: (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
};