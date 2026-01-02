import { TrueMultiAgentSystem } from './TrueMultiAgentSystem.js';

console.log('🧪 Testing System Monitoring');

const productData = {
  productName: "GlowBoost Vitamin C Serum",
  concentration: "10% Vitamin C",
  skinType: "Oily, Combination",
  keyIngredients: "Vitamin C, Hyaluronic Acid",
  benefits: "Brightening, Fades dark spots",
  howToUse: "Apply 2–3 drops in the morning before sunscreen",
  sideEffects: "Mild tingling for sensitive skin",
  price: "₹699"
};

async function testMonitoring() {
  try {
    console.log('\n1. Creating system with monitoring...');
    const system = new TrueMultiAgentSystem();
    
    console.log('2. Running system for 5 seconds...');
    
    // Start the system
    system.environment.start();
    system.environment.addData('productData', productData, 'system');
    
    // Start agents
    for (const agent of system.agents) {
      await agent.start(system.environment);
    }
    
    // Let it run for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check metrics
    console.log('\n3. System Metrics:');
    console.log(`   Total Decisions: ${system.systemMetrics.totalDecisions}`);
    console.log(`   Autonomous Actions: ${system.systemMetrics.autonomousActions}`);
    console.log(`   Goal Modifications: ${system.systemMetrics.goalModifications}`);
    console.log(`   Learning Events: ${system.systemMetrics.learningEvents}`);
    console.log(`   Communications: ${system.systemMetrics.interAgentCommunications}`);
    
    const autonomyRatio = system.systemMetrics.totalDecisions > 0 ? 
      system.systemMetrics.autonomousActions / system.systemMetrics.totalDecisions : 0;
    console.log(`   Autonomy Ratio: ${Math.round(autonomyRatio * 100)}%`);
    
    // Stop system
    system.environment.stop();
    for (const agent of system.agents) {
      agent.stop();
    }
    
    // Verify monitoring is working
    if (system.systemMetrics.totalDecisions > 0) {
      console.log('\n✅ Monitoring is working correctly!');
      console.log('   Agents are making autonomous decisions');
      console.log('   System is capturing metrics properly');
    } else {
      console.log('\n❌ Monitoring issue detected');
      console.log('   No decisions recorded despite agent activity');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testMonitoring();