import { ContentGenerationSystem } from './ContentGenerationSystem.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Main entry point - runs the content generation pipeline
 */
async function main() {
  // Product data as specified in the challenge
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
    console.log('Initializing Content Generation System...');
    const system = new ContentGenerationSystem();
    
    console.log('System Info:', system.getSystemInfo());
    
    console.log('\nGenerating content pages...');
    const pages = await system.generateContent(productData);
    
    // Log question generation details
    const questionResults = system.orchestrator.results.get('QuestionGeneratorAgent');
    console.log(`\n📊 Generated ${questionResults.total_count} questions across ${questionResults.categories.length} categories`);
    
    // Log analytics insights
    const analyticsResults = system.orchestrator.results.get('AnalyticsAgent');
    console.log(`\n📈 Content Analytics:`);
    console.log(`   - Content utilization: ${analyticsResults.analytics.content_metrics.content_utilization_rate}%`);
    console.log(`   - Engagement prediction: ${analyticsResults.analytics.engagement_predictions.predicted_engagement_level}`);
    console.log(`   - Average question complexity: ${analyticsResults.analytics.question_analysis.average_complexity_score}`);
    
    // Log SEO insights
    const seoResults = system.orchestrator.results.get('SeoOptimizationAgent');
    console.log(`\n🔍 SEO Optimization:`);
    console.log(`   - SEO Score: ${seoResults.seo_optimization.seo_score.total_score}/100 (${seoResults.seo_optimization.seo_score.grade})`);
    console.log(`   - Primary keywords: ${seoResults.seo_optimization.keywords.primary_keywords.length}`);
    console.log(`   - Long-tail keywords: ${seoResults.seo_optimization.keywords.long_tail_keywords.length}`);
    
    // Create output directory
    mkdirSync('output', { recursive: true });
    
    // Write generated pages to JSON files
    writeFileSync('output/faq.json', JSON.stringify(pages.faq.content, null, 2));
    writeFileSync('output/product_page.json', JSON.stringify(pages.product.content, null, 2));
    writeFileSync('output/comparison_page.json', JSON.stringify(pages.comparison.content, null, 2));
    writeFileSync('output/analytics_report.json', JSON.stringify(pages.analytics.analytics, null, 2));
    writeFileSync('output/seo_optimization.json', JSON.stringify(pages.seo_optimization.seo_optimization, null, 2));
    
    // Write metadata summary
    const summary = {
      generation_summary: {
        timestamp: new Date().toISOString(),
        pages_generated: Object.keys(pages).length,
        system_info: system.getSystemInfo(),
        performance_metrics: {
          total_questions: questionResults.total_count,
          content_utilization: analyticsResults.analytics.content_metrics.content_utilization_rate,
          seo_score: seoResults.seo_optimization.seo_score.total_score,
          engagement_level: analyticsResults.analytics.engagement_predictions.predicted_engagement_level
        }
      },
      pages: {
        faq: pages.faq.metadata,
        product: pages.product.metadata,
        comparison: pages.comparison.metadata,
        analytics: { generated_at: pages.analytics.generated_at },
        seo: { generated_at: pages.seo_optimization.generated_at }
      }
    };
    
    writeFileSync('output/generation_summary.json', JSON.stringify(summary, null, 2));
    
    console.log('\n✅ Enhanced content generation completed successfully!');
    console.log('Generated files:');
    console.log('  📄 Core Content:');
    console.log('    - output/faq.json');
    console.log('    - output/product_page.json');
    console.log('    - output/comparison_page.json');
    console.log('  📊 Analytics & Optimization:');
    console.log('    - output/analytics_report.json');
    console.log('    - output/seo_optimization.json');
    console.log('  📋 Summary:');
    console.log('    - output/generation_summary.json');
    
    console.log(`\n🎯 System Performance:`);
    console.log(`   - ${questionResults.total_count} questions generated`);
    console.log(`   - ${analyticsResults.analytics.content_metrics.content_utilization_rate}% content utilization`);
    console.log(`   - ${seoResults.seo_optimization.seo_score.grade} SEO grade`);
    console.log(`   - ${analyticsResults.analytics.engagement_predictions.predicted_engagement_level} engagement prediction`);
    
  } catch (error) {
    console.error('❌ Content generation failed:', error.message);
    process.exit(1);
  }
}

// Run the system
main();