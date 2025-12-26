import { Orchestrator } from './core/Orchestrator.js';
import { TemplateEngine } from './core/TemplateEngine.js';

// Import agents
import { DataParserAgent } from './agents/DataParserAgent.js';
import { QuestionGeneratorAgent } from './agents/QuestionGeneratorAgent.js';
import { ComparisonDataAgent } from './agents/ComparisonDataAgent.js';
import { FaqPageAgent } from './agents/FaqPageAgent.js';
import { ProductPageAgent } from './agents/ProductPageAgent.js';
import { ComparisonPageAgent } from './agents/ComparisonPageAgent.js';
import { AnalyticsAgent } from './agents/AnalyticsAgent.js';
import { SeoOptimizationAgent } from './agents/SeoOptimizationAgent.js';

// Import templates and blocks
import { FAQ_PAGE_TEMPLATE, PRODUCT_PAGE_TEMPLATE, COMPARISON_PAGE_TEMPLATE } from './templates/Templates.js';
import {
  generateBenefitsBlock,
  extractUsageBlock,
  compareIngredientsBlock,
  generateSafetyBlock,
  generatePricingBlock,
  generateSpecsBlock,
  generateFaqBlock
} from './blocks/ContentBlocks.js';

/**
 * Main Content Generation System
 * Orchestrates the multi-agent workflow for content generation
 */
export class ContentGenerationSystem {
  constructor() {
    this.orchestrator = new Orchestrator();
    this.templateEngine = new TemplateEngine();
    this.setupSystem();
  }

  /**
   * Initialize the system with agents, templates, and content blocks
   */
  setupSystem() {
    // Register content blocks
    this.templateEngine.registerContentBlock('generateBenefitsBlock', generateBenefitsBlock);
    this.templateEngine.registerContentBlock('extractUsageBlock', extractUsageBlock);
    this.templateEngine.registerContentBlock('compareIngredientsBlock', compareIngredientsBlock);
    this.templateEngine.registerContentBlock('generateSafetyBlock', generateSafetyBlock);
    this.templateEngine.registerContentBlock('generatePricingBlock', generatePricingBlock);
    this.templateEngine.registerContentBlock('generateSpecsBlock', generateSpecsBlock);
    this.templateEngine.registerContentBlock('generateFaqBlock', generateFaqBlock);

    // Register templates
    this.templateEngine.registerTemplate('faq_page', FAQ_PAGE_TEMPLATE);
    this.templateEngine.registerTemplate('product_page', PRODUCT_PAGE_TEMPLATE);
    this.templateEngine.registerTemplate('comparison_page', COMPARISON_PAGE_TEMPLATE);

    // Register agents with orchestrator
    this.orchestrator.registerAgent(new DataParserAgent());
    this.orchestrator.registerAgent(new QuestionGeneratorAgent());
    this.orchestrator.registerAgent(new ComparisonDataAgent());
    this.orchestrator.registerAgent(new FaqPageAgent(this.templateEngine));
    this.orchestrator.registerAgent(new ProductPageAgent(this.templateEngine));
    this.orchestrator.registerAgent(new ComparisonPageAgent(this.templateEngine));
    this.orchestrator.registerAgent(new AnalyticsAgent());
    this.orchestrator.registerAgent(new SeoOptimizationAgent());
  }

  /**
   * Generate all content pages from product data
   * @param {Object} productData - Raw product data
   * @returns {Promise<Object>} - Generated pages
   */
  async generateContent(productData) {
    console.log('Starting enhanced content generation pipeline...');
    
    try {
      // Execute the agent workflow
      const results = await this.orchestrator.execute(productData);
      
      // Extract page content from agent results
      const pages = {
        faq: results.get('FaqPageAgent'),
        product: results.get('ProductPageAgent'),
        comparison: results.get('ComparisonPageAgent'),
        analytics: results.get('AnalyticsAgent'),
        seo_optimization: results.get('SeoOptimizationAgent')
      };

      console.log('Enhanced content generation completed successfully');
      return pages;
      
    } catch (error) {
      console.error('Content generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get system status and configuration
   * @returns {Object} - System information
   */
  getSystemInfo() {
    return {
      agents: Array.from(this.orchestrator.agents.keys()),
      templates: Array.from(this.templateEngine.templates.keys()),
      content_blocks: Array.from(this.templateEngine.contentBlocks.keys()),
      system_ready: true,
      version: '2.0.0',
      features: [
        'Multi-agent orchestration',
        'Template-based generation',
        'Content analytics',
        'SEO optimization',
        'Advanced content blocks'
      ]
    };
  }
}