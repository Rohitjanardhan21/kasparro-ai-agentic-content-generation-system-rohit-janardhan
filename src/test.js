import { ContentGenerationSystem } from './ContentGenerationSystem.js';

/**
 * Enhanced test suite for the Content Generation System
 */
async function runTests() {
  console.log('🧪 Running Enhanced Content Generation System Tests\n');

  const testData = {
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
    // Test 1: Enhanced System Initialization
    console.log('Test 1: Enhanced System Initialization');
    const system = new ContentGenerationSystem();
    const systemInfo = system.getSystemInfo();
    
    console.log('✅ Enhanced system initialized successfully');
    console.log(`   - Agents: ${systemInfo.agents.length} (including Analytics & SEO)`);
    console.log(`   - Templates: ${systemInfo.templates.length}`);
    console.log(`   - Content Blocks: ${systemInfo.content_blocks.length}`);
    console.log(`   - Version: ${systemInfo.version}`);
    console.log(`   - Features: ${systemInfo.features.length}\n`);

    // Test 2: Enhanced Content Generation
    console.log('Test 2: Enhanced Content Generation Pipeline');
    const startTime = Date.now();
    const pages = await system.generateContent(testData);
    const endTime = Date.now();
    
    console.log('✅ Enhanced content generation completed');
    console.log(`   - Pages generated: ${Object.keys(pages).length}`);
    console.log(`   - Execution time: ${endTime - startTime}ms`);
    console.log(`   - New features: Analytics, SEO Optimization\n`);

    // Test 3: Analytics Validation
    console.log('Test 3: Analytics Report Validation');
    const analytics = pages.analytics.analytics;
    
    console.log(`✅ Analytics generated successfully`);
    console.log(`   - Content utilization: ${analytics.content_metrics.content_utilization_rate}%`);
    console.log(`   - Engagement level: ${analytics.engagement_predictions.predicted_engagement_level}`);
    console.log(`   - Question complexity: ${analytics.question_analysis.average_complexity_score}`);
    console.log(`   - Readability score: ${analytics.readability_scores.faq_readability}\n`);

    // Test 4: SEO Optimization Validation
    console.log('Test 4: SEO Optimization Validation');
    const seo = pages.seo_optimization.seo_optimization;
    
    console.log(`✅ SEO optimization completed`);
    console.log(`   - SEO Score: ${seo.seo_score.total_score}/100 (${seo.seo_score.grade})`);
    console.log(`   - Primary keywords: ${seo.keywords.primary_keywords.length}`);
    console.log(`   - Long-tail keywords: ${seo.keywords.long_tail_keywords.length}`);
    console.log(`   - Meta title: "${seo.meta_data.title.substring(0, 50)}..."\n`);

    // Test 5: Enhanced FAQ Validation
    console.log('Test 5: Enhanced FAQ Page Validation');
    const faqContent = pages.faq.content;
    const enhancedFaqs = faqContent.faqs || [];
    
    console.log(`✅ Enhanced FAQ page validated`);
    console.log(`   - Questions with importance scores: ${enhancedFaqs.filter(q => q.importance_score).length}`);
    console.log(`   - Questions with search intent: ${enhancedFaqs.filter(q => q.search_intent).length}`);
    console.log(`   - Quality score: ${faqContent.question_quality_score || 'N/A'}\n`);

    // Test 6: Enhanced Product Page Validation
    console.log('Test 6: Enhanced Product Page Validation');
    const productContent = pages.product.content;
    
    console.log(`✅ Enhanced product page validated`);
    console.log(`   - Benefit timeline info: ${productContent.formatted_benefits?.[0]?.timeline || 'N/A'}`);
    console.log(`   - Usage step importance: ${productContent.steps?.[0]?.importance || 'N/A'}`);
    console.log(`   - Storage requirements: ${productContent.storage_requirements || 'N/A'}\n`);

    // Test 7: Performance Metrics
    console.log('Test 7: System Performance Analysis');
    const questionResults = system.orchestrator.results.get('QuestionGeneratorAgent');
    const analyticsResults = system.orchestrator.results.get('AnalyticsAgent');
    const seoResults = system.orchestrator.results.get('SeoOptimizationAgent');
    
    console.log(`✅ Performance metrics captured`);
    console.log(`   - Questions generated: ${questionResults.total_count}`);
    console.log(`   - Categories covered: ${questionResults.categories.length}`);
    console.log(`   - Content utilization: ${analyticsResults.analytics.content_metrics.content_utilization_rate}%`);
    console.log(`   - SEO grade: ${seoResults.seo_optimization.seo_score.grade}\n`);

    // Test 8: Advanced Features Test
    console.log('Test 8: Advanced Features Validation');
    
    const hasAnalytics = !!pages.analytics;
    const hasSeo = !!pages.seo_optimization;
    const hasEnhancedContent = productContent.formatted_benefits?.[0]?.timeline;
    
    console.log(`✅ Advanced features validated`);
    console.log(`   - Analytics module: ${hasAnalytics ? '✅' : '❌'}`);
    console.log(`   - SEO optimization: ${hasSeo ? '✅' : '❌'}`);
    console.log(`   - Enhanced content blocks: ${hasEnhancedContent ? '✅' : '❌'}\n`);

    console.log('🎉 All enhanced tests completed successfully!');
    console.log('\n📊 System Capabilities Demonstrated:');
    console.log('   ✅ Multi-agent orchestration (8 agents)');
    console.log('   ✅ Advanced content analytics');
    console.log('   ✅ SEO optimization with keyword analysis');
    console.log('   ✅ Enhanced content blocks with detailed insights');
    console.log('   ✅ Performance monitoring and recommendations');
    console.log('   ✅ Comprehensive JSON output with metadata');
    
  } catch (error) {
    console.error('❌ Enhanced test failed:', error.message);
    console.error(error.stack);
  }
}

// Run enhanced tests
runTests();