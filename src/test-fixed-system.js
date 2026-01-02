import { TrueMultiAgentSystem } from './TrueMultiAgentSystem.js';
import fs from 'fs';

console.log('🧪 Testing Fixed Multi-Agent System');

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

async function testFixedSystem() {
  try {
    console.log('\n1. Creating fixed system...');
    const system = new TrueMultiAgentSystem();
    
    console.log('2. Running content generation with fixes...');
    const results = await system.generateContent(productData);
    
    console.log('\n3. Results Analysis:');
    console.log(`   System Type: ${results.system_type}`);
    console.log(`   Architecture: ${results.architecture}`);
    
    // Check generated content
    console.log('\n4. Generated Content:');
    const content = results.generated_content || {};
    console.log(`   Content Types Generated: ${Object.keys(content).length}`);
    
    for (const [type, data] of Object.entries(content)) {
      console.log(`   ✅ ${type}: Generated`);
      if (data && typeof data === 'object') {
        if (data.questions) {
          console.log(`      - ${data.questions.length} questions`);
        }
        if (data.sections) {
          console.log(`      - ${Object.keys(data.sections).length} sections`);
        }
      }
    }
    
    // Check analysis results
    console.log('\n5. Analysis Results:');
    const analysis = results.analysis_results || {};
    console.log(`   Analysis Types: ${Object.keys(analysis).length}`);
    
    // Performance metrics
    console.log('\n6. Performance Metrics:');
    const perf = results.performance || {};
    console.log(`   Total Decisions: ${perf.total_decisions || 0}`);
    console.log(`   Autonomy Ratio: ${Math.round((perf.autonomy_ratio || 0) * 100)}%`);
    console.log(`   Communications: ${perf.communication_events || 0}`);
    console.log(`   Learning Events: ${perf.learning_events || 0}`);
    
    // Save results
    console.log('\n7. Saving Results...');
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output', { recursive: true });
    }
    
    let savedFiles = 0;
    
    // Save generated content
    for (const [contentType, contentData] of Object.entries(content)) {
      const filename = `output/${contentType}.json`;
      fs.writeFileSync(filename, JSON.stringify(contentData, null, 2));
      console.log(`   ✅ Saved: ${filename}`);
      savedFiles++;
    }
    
    // Save system results
    fs.writeFileSync('output/fixed_system_results.json', JSON.stringify(results, null, 2));
    console.log(`   ✅ Saved: output/fixed_system_results.json`);
    savedFiles++;
    
    console.log(`\n📁 Total Files Saved: ${savedFiles}`);
    
    // Final assessment
    console.log('\n🎯 Final Assessment:');
    const contentGenerated = Object.keys(content).length > 0;
    const analysisCompleted = Object.keys(analysis).length > 0;
    const autonomyDemonstrated = (perf.total_decisions || 0) > 0;
    
    console.log(`   Content Generation: ${contentGenerated ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Data Analysis: ${analysisCompleted ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Autonomy Demonstrated: ${autonomyDemonstrated ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (contentGenerated && analysisCompleted && autonomyDemonstrated) {
      console.log('\n🏆 COMPLETE SUCCESS: Fixed Multi-Agent System Working!');
      return { success: true, contentGenerated, analysisCompleted, autonomyDemonstrated };
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS: Some components still need improvement');
      return { success: false, contentGenerated, analysisCompleted, autonomyDemonstrated };
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

testFixedSystem();