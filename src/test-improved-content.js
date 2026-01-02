import { TrueMultiAgentSystem } from './TrueMultiAgentSystem.js';
import fs from 'fs';

console.log('🧪 Testing Improved Content Generation');

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

async function testImprovedContent() {
  try {
    console.log('\n1. Creating improved system...');
    const system = new TrueMultiAgentSystem();
    
    console.log('2. Running improved content generation...');
    const results = await system.generateContent(productData);
    
    console.log('\n3. Content Quality Check:');
    const content = results.generated_content || {};
    
    for (const [type, data] of Object.entries(content)) {
      console.log(`\n📄 ${type.toUpperCase()}:`);
      
      if (type === 'faq' && data.questions) {
        console.log(`   Questions: ${data.questions.length}`);
        data.questions.forEach((q, i) => {
          const hasProductName = q.question.includes('GlowBoost') || q.answer.includes('GlowBoost');
          console.log(`   ${i+1}. ${hasProductName ? '✅' : '❌'} ${q.question}`);
        });
      }
      
      if (type === 'product_page') {
        const hasRealData = data.title && data.title.includes('GlowBoost');
        console.log(`   Product Name Used: ${hasRealData ? '✅' : '❌'}`);
        console.log(`   Title: ${data.title || 'Missing'}`);
      }
      
      if (type === 'comparison_page') {
        const hasRealData = data.title && data.title.includes('GlowBoost');
        console.log(`   Product Name Used: ${hasRealData ? '✅' : '❌'}`);
        console.log(`   Title: ${data.title || 'Missing'}`);
      }
    }
    
    // Save improved content
    console.log('\n4. Saving Improved Content...');
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output', { recursive: true });
    }
    
    for (const [contentType, contentData] of Object.entries(content)) {
      const filename = `output/improved_${contentType}.json`;
      fs.writeFileSync(filename, JSON.stringify(contentData, null, 2));
      console.log(`   ✅ Saved: ${filename}`);
    }
    
    console.log('\n🎯 Content Quality Assessment:');
    const faqQuality = content.faq?.questions?.some(q => 
      q.question.includes('GlowBoost') || q.answer.includes('GlowBoost')
    );
    const productQuality = content.product_page?.title?.includes('GlowBoost');
    const comparisonQuality = content.comparison_page?.title?.includes('GlowBoost');
    
    console.log(`   FAQ Uses Real Data: ${faqQuality ? '✅ YES' : '❌ NO'}`);
    console.log(`   Product Page Uses Real Data: ${productQuality ? '✅ YES' : '❌ NO'}`);
    console.log(`   Comparison Uses Real Data: ${comparisonQuality ? '✅ YES' : '❌ NO'}`);
    
    const overallQuality = faqQuality && productQuality && comparisonQuality;
    console.log(`\n${overallQuality ? 'Content Quality: All types use real data' : 'Content Quality: Some types need verification'}`);
    
    return { success: true, qualityImproved: overallQuality };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testImprovedContent();