/**
 * Main Entry Point - 8-Agent Multi-Agent Content Generation System
 * 
 * This system demonstrates true multi-agent architecture with:
 * - 8 specialized autonomous agents
 * - Dynamic coordination without central control
 * - Emergent behavior from agent interactions
 * - Template engine with reusable content blocks
 * - Machine-readable output generation
 */

import { test8AgentSystem } from './test-8-agent-system.js';

async function main() {
  console.log('🚀 Starting 8-Agent Multi-Agent Content Generation System');
  console.log('=' .repeat(70));
  
  try {
    const results = await test8AgentSystem();
    
    console.log('\n🎉 System execution completed successfully!');
    console.log('\n📊 Final Results Summary:');
    console.log(`   Agents: ${results.systemMetrics.totalAgents}`);
    console.log(`   Runtime: ${Math.round(results.systemMetrics.runtime / 1000)}s`);
    console.log(`   Autonomy: ${Math.round(results.systemMetrics.autonomyRatio * 100)}%`);
    console.log(`   Content Generated: ${Object.keys(results.generatedContent).length} types`);
    
  } catch (error) {
    console.error('\n❌ System execution failed:', error.message);
    process.exit(1);
  }
}

// Run the system
main();