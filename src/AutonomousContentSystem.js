import { AgentRuntime } from './autonomous/AgentRuntime.js';
import { AutonomousDataParserAgent } from './autonomous/agents/AutonomousDataParserAgent.js';
import { AutonomousQuestionGeneratorAgent } from './autonomous/agents/AutonomousQuestionGeneratorAgent.js';

/**
 * AutonomousContentSystem - Truly autonomous multi-agent content generation
 * 
 * Key Differences from Pipeline System:
 * 1. Agents make their own decisions about when to act
 * 2. Event-driven coordination instead of sequential execution
 * 3. Agents communicate and negotiate with each other
 * 4. Asynchronous, parallel operation
 * 5. Goal-oriented behavior rather than task execution
 */
export class AutonomousContentSystem {
  constructor() {
    this.runtime = new AgentRuntime();
    this.setupAutonomousAgents();
  }

  /**
   * Set up truly autonomous agents
   */
  setupAutonomousAgents() {
    console.log('🔧 Setting up autonomous agents...');
    
    // Create autonomous agents with goals and capabilities
    const dataParserAgent = new AutonomousDataParserAgent();
    const questionGeneratorAgent = new AutonomousQuestionGeneratorAgent();
    
    // Register agents with runtime
    this.runtime.registerAgent(dataParserAgent);
    this.runtime.registerAgent(questionGeneratorAgent);
    
    console.log('✅ Autonomous agents configured');
  }

  /**
   * Start autonomous content generation
   * Unlike pipeline systems, this starts autonomous operation and lets agents decide what to do
   */
  async generateContent(productData) {
    console.log('\n🚀 Starting Autonomous Content Generation...');
    console.log('🤖 Agents will autonomously decide when and how to act');
    
    try {
      // Start the autonomous runtime with initial data
      const results = await this.runtime.startRuntime({ productData });
      
      console.log('\n🎉 Autonomous content generation completed!');
      
      // Extract generated content from shared memory
      const content = this.extractGeneratedContent(results);
      
      return content;
      
    } catch (error) {
      console.error('❌ Autonomous system failed:', error.message);
      throw error;
    }
  }

  /**
   * Extract generated content from autonomous agent results
   */
  extractGeneratedContent(results) {
    const sharedMemory = results.sharedMemory;
    
    return {
      parsed_data: sharedMemory.parsed_data,
      questions: sharedMemory.generated_questions,
      prioritized_questions: sharedMemory.prioritized_questions,
      validation_results: sharedMemory.data_validation_results,
      agent_statuses: results.agentStatuses,
      runtime_metrics: results.runtimeMetrics
    };
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    const agents = Array.from(this.runtime.agents.keys());
    
    return {
      system_type: 'autonomous_multi_agent',
      agents: agents,
      agent_count: agents.length,
      runtime_status: this.runtime.getRuntimeStatus(),
      autonomy_features: [
        'goal_oriented_behavior',
        'event_driven_coordination', 
        'inter_agent_communication',
        'autonomous_decision_making',
        'asynchronous_operation'
      ],
      version: '2.0.0-autonomous'
    };
  }

  /**
   * Monitor autonomous agent activity
   */
  getAgentActivity() {
    const activity = {};
    
    for (const [name, agent] of this.runtime.agents.entries()) {
      activity[name] = agent.getAutonomyStatus();
    }
    
    return {
      agents: activity,
      runtime: this.runtime.getRuntimeStatus(),
      timestamp: new Date().toISOString()
    };
  }
}