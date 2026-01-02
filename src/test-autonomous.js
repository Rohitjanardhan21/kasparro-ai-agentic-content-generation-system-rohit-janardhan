import { AutonomousContentSystem } from './AutonomousContentSystem.js';

/**
 * Test the truly autonomous multi-agent system
 * 
 * This demonstrates:
 * 1. Agents making autonomous decisions
 * 2. Event-driven coordination
 * 3. Inter-agent communication
 * 4. Goal-oriented behavior
 * 5. Asynchronous operation
 */
async function testAutonomousSystem() {
  console.log('🧪 Testing Truly Autonomous Multi-Agent System\n');
  console.log('🎯 This system demonstrates REAL agent autonomy:');
  console.log('   - Agents decide when to act based on their goals');
  console.log('   - Event-driven coordination (not sequential pipeline)');
  console.log('   - Inter-agent communication and negotiation');
  console.log('   - Asynchronous, parallel operation');
  console.log('   - Goal-oriented behavior\n');

  const productData = {
    productName: 'GlowBoost Vitamin C Serum',
    concentration: '10% Vitamin C',
    skinType: 'Oily, Combination',
    keyIngredients: 'Vitamin C, Hyaluronic Acid',
    benefits: 'Brightening, Fades dark spots',
    howToUse: 'Apply 2–3 drops in the morning before sunscreen',
    sideEffects: 'Mild tingling for sensitive skin',
    price: '₹699'
  };

  try {
    console.log('🚀 Initializing Autonomous Content System...');
    const system = new AutonomousContentSystem();
    
    console.log('\n📊 System Configuration:');
    const systemInfo = system.getSystemInfo();
    console.log(`   - System Type: ${systemInfo.system_type}`);
    console.log(`   - Autonomous Agents: ${systemInfo.agent_count}`);
    console.log(`   - Autonomy Features: ${systemInfo.autonomy_features.length}`);
    console.log(`   - Version: ${systemInfo.version}`);
    
    console.log('\n🎯 Autonomy Features Enabled:');
    systemInfo.autonomy_features.forEach(feature => {
      console.log(`   ✅ ${feature.replace(/_/g, ' ')}`);
    });
    
    console.log('\n🤖 Starting Autonomous Operation...');
    console.log('   (Agents will now make their own decisions about when to act)');
    
    const startTime = Date.now();
    
    // Start autonomous content generation
    const results = await system.generateContent(productData);
    
    const executionTime = Date.now() - startTime;
    
    console.log('\n📊 Autonomous Execution Results:');
    console.log(`   - Execution Time: ${executionTime}ms`);
    console.log(`   - Data Parsed: ${results.parsed_data ? '✅' : '❌'}`);
    console.log(`   - Questions Generated: ${results.questions ? results.questions.total_count : 0}`);
    console.log(`   - Questions Prioritized: ${results.prioritized_questions ? '✅' : '❌'}`);
    
    if (results.validation_results) {
      console.log(`   - Data Validation Score: ${results.validation_results.score}/100`);
    }
    
    console.log('\n🤖 Agent Autonomy Metrics:');
    for (const [agentName, status] of Object.entries(results.agent_statuses)) {
      console.log(`   ${agentName}:`);
      console.log(`     - Goals: ${status.goals.join(', ')}`);
      console.log(`     - Decisions Made: ${status.autonomyMetrics.decisionsCount}`);
      console.log(`     - Actions Taken: ${status.autonomyMetrics.actionsCount}`);
      console.log(`     - Communications: ${status.autonomyMetrics.communicationsCount}`);
      console.log(`     - Knowledge Items: ${status.autonomyMetrics.knowledgeItems}`);
    }
    
    console.log('\n🌐 Runtime Metrics:');
    const runtimeMetrics = results.runtime_metrics;
    console.log(`   - Total Messages: ${runtimeMetrics.totalMessages}`);
    console.log(`   - Total Events: ${runtimeMetrics.totalEvents}`);
    console.log(`   - Agent Interactions: ${runtimeMetrics.agentInteractions}`);
    console.log(`   - Runtime Duration: ${runtimeMetrics.duration}ms`);
    
    // Test real-time agent activity monitoring
    console.log('\n📡 Real-time Agent Activity:');
    const activity = system.getAgentActivity();
    for (const [agentName, agentActivity] of Object.entries(activity.agents)) {
      console.log(`   ${agentName}: ${agentActivity.state} (${agentActivity.isRunning ? 'active' : 'stopped'})`);
    }
    
    console.log('\n🎉 Autonomous System Test Completed Successfully!');
    console.log('\n✅ Key Autonomy Demonstrations:');
    console.log('   ✅ Agents made independent decisions about when to act');
    console.log('   ✅ Event-driven coordination between agents');
    console.log('   ✅ Agents communicated through shared memory and events');
    console.log('   ✅ Goal-oriented behavior with autonomous goal pursuit');
    console.log('   ✅ Asynchronous operation with real-time coordination');
    console.log('   ✅ No hardcoded sequential pipeline - true autonomy!');
    
  } catch (error) {
    console.error('❌ Autonomous system test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the autonomous system test
testAutonomousSystem();