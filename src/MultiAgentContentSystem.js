import { AgentRuntime } from './core/AgentRuntime.js';
import { DataAnalystAgent } from './agents/DataAnalystAgent.js';
import { QuestionMasterAgent } from './agents/QuestionMasterAgent.js';
import { ContentArchitectAgent } from './agents/ContentArchitectAgent.js';

/**
 * True Multi-Agent Content Generation System
 * Agents operate autonomously and coordinate dynamically
 */
export class MultiAgentContentSystem {
  constructor() {
    this.runtime = new AgentRuntime();
    this.setupAgents();
  }

  setupAgents() {
    // Create autonomous agents
    const dataAnalyst = new DataAnalystAgent();
    const questionMaster = new QuestionMasterAgent();
    const contentArchitect = new ContentArchitectAgent();

    // Register agents with runtime
    this.runtime.registerAgent(dataAnalyst);
    this.runtime.registerAgent(questionMaster);
    this.runtime.registerAgent(contentArchitect);

    console.log('Multi-agent system initialized with autonomous agents:');
    console.log('- DataAnalystAgent: Analyzes product data and extracts insights');
    console.log('- QuestionMasterAgent: Generates questions based on analysis');
    console.log('- ContentArchitectAgent: Plans and coordinates content creation');
  }

  /**
   * Start the autonomous multi-agent system
   */
  async generateContent(productData) {
    console.log('\n🤖 Starting Multi-Agent Content Generation System...');
    console.log('Agents will coordinate autonomously to generate content\n');

    try {
      // Start the agent runtime - agents will coordinate themselves
      const results = await this.runtime.start(productData);
      
      // Extract final content from agent coordination
      const finalContent = this.runtime.getSharedData('final_content');
      
      if (finalContent) {
        console.log('\n✅ Multi-agent content generation completed successfully!');
        console.log(`Generated ${Object.keys(finalContent).length} content pages through agent coordination`);
        return finalContent;
      } else {
        throw new Error('Agents did not produce final content');
      }
      
    } catch (error) {
      console.error('❌ Multi-agent system error:', error.message);
      throw error;
    } finally {
      this.runtime.shutdown();
    }
  }

  /**
   * Get system status
   */
  getSystemInfo() {
    const agents = Array.from(this.runtime.agents.keys());
    return {
      system_type: 'autonomous_multi_agent',
      agents: agents,
      coordination_method: 'event_driven_messaging',
      autonomy_level: 'high',
      agent_count: agents.length
    };
  }

  /**
   * Monitor agent activity (for debugging)
   */
  getAgentStates() {
    const states = {};
    for (const [id, agent] of this.runtime.agents.entries()) {
      states[id] = {
        state: agent.state,
        goals: agent.goals.map(g => g.name),
        active: agent.isActive()
      };
    }
    return states;
  }
}