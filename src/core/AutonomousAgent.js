/**
 * AutonomousAgent - Base class for truly autonomous agents
 * Agents make their own decisions about when and how to act
 */
export class AutonomousAgent {
  constructor(id, capabilities = []) {
    this.id = id;
    this.capabilities = capabilities;
    this.state = 'idle';
    this.runtime = null;
    this.goals = [];
    this.memory = new Map();
    this.subscriptions = [];
    this.results = null;
  }

  /**
   * Set the runtime environment
   */
  setRuntime(runtime) {
    this.runtime = runtime;
    this.initialize();
  }

  /**
   * Initialize agent - define goals, subscriptions, etc.
   */
  initialize() {
    // Override in concrete agents
  }

  /**
   * Events this agent wants to listen to
   */
  getSubscriptions() {
    return this.subscriptions;
  }

  /**
   * Handle incoming events
   */
  async handleEvent(event) {
    console.log(`Agent ${this.id} received event: ${event.type}`);
    
    switch (event.type) {
      case 'system_start':
        await this.onSystemStart(event.detail);
        break;
      case 'data_updated':
        await this.onDataUpdated(event.detail);
        break;
      default:
        await this.onCustomEvent(event);
    }
  }

  /**
   * Autonomous action - agent decides what to do
   */
  async autonomousAction() {
    if (this.state === 'idle') {
      await this.evaluateGoals();
    } else if (this.state === 'working') {
      await this.continueWork();
    } else if (this.state === 'waiting') {
      await this.checkWaitConditions();
    }
  }

  /**
   * Evaluate current goals and decide on actions
   */
  async evaluateGoals() {
    for (const goal of this.goals) {
      if (await this.canAchieveGoal(goal)) {
        console.log(`Agent ${this.id} starting work on goal: ${goal.name}`);
        this.state = 'working';
        this.currentGoal = goal;
        await this.startWork(goal);
        break;
      }
    }
  }

  /**
   * Continue working on current goal
   */
  async continueWork() {
    if (this.currentGoal) {
      const completed = await this.workOnGoal(this.currentGoal);
      if (completed) {
        console.log(`Agent ${this.id} completed goal: ${this.currentGoal.name}`);
        await this.completeGoal(this.currentGoal);
        this.currentGoal = null;
        this.state = 'idle';
      }
    }
  }

  /**
   * Check if waiting conditions are met
   */
  async checkWaitConditions() {
    if (this.waitCondition && await this.waitCondition()) {
      this.state = 'idle';
      this.waitCondition = null;
    }
  }

  /**
   * Send message to another agent
   */
  sendMessage(toAgentId, messageType, payload) {
    if (this.runtime) {
      this.runtime.sendMessage(this.id, toAgentId, messageType, payload);
    }
  }

  /**
   * Receive message from another agent
   */
  async receiveMessage(message) {
    console.log(`Agent ${this.id} received message from ${message.from}: ${message.type}`);
    await this.processMessage(message);
  }

  /**
   * Process incoming message
   */
  async processMessage(message) {
    // Override in concrete agents
  }

  /**
   * Access shared memory
   */
  getSharedData(key) {
    return this.runtime ? this.runtime.getSharedData(key) : null;
  }

  setSharedData(key, value) {
    if (this.runtime) {
      this.runtime.setSharedData(key, value);
    }
  }

  /**
   * Broadcast event to all agents
   */
  broadcast(eventType, data) {
    if (this.runtime) {
      this.runtime.broadcast(eventType, data);
    }
  }

  /**
   * Check if agent is currently active
   */
  isActive() {
    return this.state !== 'completed' && this.state !== 'failed';
  }

  /**
   * Get agent results
   */
  getResults() {
    return this.results;
  }

  /**
   * Shutdown agent
   */
  shutdown() {
    this.state = 'completed';
  }

  // Abstract methods to override in concrete agents
  async onSystemStart(data) {}
  async onDataUpdated(data) {}
  async onCustomEvent(event) {}
  async canAchieveGoal(goal) { return false; }
  async startWork(goal) {}
  async workOnGoal(goal) { return false; }
  async completeGoal(goal) {}
}