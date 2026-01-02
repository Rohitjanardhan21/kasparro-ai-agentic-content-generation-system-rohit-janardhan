/**
 * BaseAgent - Simple base class for specialized agents
 * 
 * Provides basic agent functionality without complex autonomy features
 */
export class BaseAgent {
  constructor(config = {}) {
    this.id = config.id || 'agent_' + Date.now();
    this.name = config.name || 'BaseAgent';
    this.autonomyLevel = config.autonomyLevel || 0.7;
    this.adaptabilityLevel = config.adaptabilityLevel || 0.6;
    this.learningRate = config.learningRate || 0.1;
    
    this.goals = new Set();
    this.completedGoals = new Set();
    this.experiences = [];
    this.isActive = false;
    
    console.log(`🤖 [${this.name}] Agent initialized`);
  }

  /**
   * Add a goal to the agent
   */
  addGoal(goal) {
    this.goals.add(goal);
    console.log(`🎯 [${this.name}] Added goal: ${goal}`);
  }

  /**
   * Complete a goal
   */
  completeGoal(goal) {
    if (this.goals.has(goal)) {
      this.goals.delete(goal);
      this.completedGoals.add(goal);
      console.log(`✅ [${this.name}] Completed goal: ${goal}`);
    }
  }

  /**
   * Record an experience
   */
  recordExperience(experience) {
    this.experiences.push({
      ...experience,
      timestamp: Date.now(),
      agent: this.name
    });
  }

  /**
   * Start the agent
   */
  async start() {
    this.isActive = true;
    console.log(`🚀 [${this.name}] Agent started`);
  }

  /**
   * Stop the agent
   */
  stop() {
    this.isActive = false;
    console.log(`🛑 [${this.name}] Agent stopped`);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      autonomyLevel: this.autonomyLevel,
      adaptabilityLevel: this.adaptabilityLevel,
      goals: Array.from(this.goals),
      completedGoals: Array.from(this.completedGoals),
      experiences: this.experiences.length,
      isActive: this.isActive
    };
  }

  /**
   * Make an autonomous decision (base implementation)
   */
  async makeDecision(situation) {
    this.recordExperience({
      type: 'decision',
      situation: situation,
      decision: 'base_decision'
    });
    
    return {
      action: 'process',
      autonomous: true,
      reasoning: 'Base agent decision making'
    };
  }

  /**
   * Learn from experience (base implementation)
   */
  learn(experience) {
    this.recordExperience({
      type: 'learning',
      experience: experience
    });
    
    // Simple learning: slightly increase autonomy
    if (Math.random() > 0.7) {
      this.autonomyLevel = Math.min(1.0, this.autonomyLevel + this.learningRate * 0.1);
    }
  }
}