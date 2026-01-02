/**
 * TemplateEngine - Processes templates with content blocks and field mapping
 * 
 * This engine provides:
 * 1. Template registration and management
 * 2. Content block execution
 * 3. Field mapping and variable interpolation
 * 4. Reusable transformation functions
 */

export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.contentBlocks = new Map();
    this.fieldMappings = new Map();
  }
  
  /**
   * Register a template
   */
  registerTemplate(name, template) {
    this.templates.set(name, {
      ...template,
      registeredAt: Date.now()
    });
    
    console.log(`📋 [TemplateEngine] Registered template: ${name}`);
  }
  
  /**
   * Register a content block
   */
  registerContentBlock(name, blockFunction) {
    this.contentBlocks.set(name, {
      execute: blockFunction,
      registeredAt: Date.now()
    });
    
    console.log(`🧩 [TemplateEngine] Registered content block: ${name}`);
  }
  
  /**
   * Process template with data
   */
  async processTemplate(templateName, data, options = {}) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    console.log(`⚡ [TemplateEngine] Processing template: ${templateName}`);
    
    const result = {
      templateName: templateName,
      processedAt: new Date().toISOString(),
      data: {}
    };
    
    // Process template structure
    if (template.structure) {
      result.data = await this.processTemplateStructure(template.structure, data, options);
    }
    
    // Apply field mappings
    if (template.fieldMappings) {
      result.data = this.applyFieldMappings(result.data, template.fieldMappings, data);
    }
    
    // Execute content blocks
    if (template.contentBlocks) {
      result.data = await this.executeContentBlocks(result.data, template.contentBlocks, data);
    }
    
    return result.data;
  }
  
  /**
   * Process template structure
   */
  async processTemplateStructure(structure, data, options) {
    const processed = {};
    
    for (const [key, value] of Object.entries(structure)) {
      if (typeof value === 'string') {
        // Simple field mapping
        processed[key] = this.interpolateVariables(value, data);
      } else if (typeof value === 'object' && value !== null) {
        if (value.type === 'block') {
          // Content block execution
          processed[key] = await this.executeBlock(value.block, data, value.params || {});
        } else if (value.type === 'list') {
          // List processing
          processed[key] = await this.processList(value, data);
        } else {
          // Nested structure
          processed[key] = await this.processTemplateStructure(value, data, options);
        }
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  }
  
  /**
   * Apply field mappings
   */
  applyFieldMappings(processedData, mappings, originalData) {
    const mapped = { ...processedData };
    
    for (const [targetField, sourceField] of Object.entries(mappings)) {
      if (originalData[sourceField] !== undefined) {
        mapped[targetField] = originalData[sourceField];
      }
    }
    
    return mapped;
  }
  
  /**
   * Execute content blocks
   */
  async executeContentBlocks(processedData, blockConfigs, originalData) {
    const enhanced = { ...processedData };
    
    for (const [field, blockConfig] of Object.entries(blockConfigs)) {
      if (typeof blockConfig === 'string') {
        // Simple block execution
        enhanced[field] = await this.executeBlock(blockConfig, originalData);
      } else if (typeof blockConfig === 'object') {
        // Block with parameters
        enhanced[field] = await this.executeBlock(blockConfig.block, originalData, blockConfig.params || {});
      }
    }
    
    return enhanced;
  }
  
  /**
   * Execute a single content block
   */
  async executeBlock(blockName, data, params = {}) {
    const block = this.contentBlocks.get(blockName);
    if (!block) {
      console.warn(`⚠️  [TemplateEngine] Content block not found: ${blockName}`);
      return null;
    }
    
    try {
      return await block.execute(data, params);
    } catch (error) {
      console.error(`❌ [TemplateEngine] Error executing block ${blockName}:`, error.message);
      return null;
    }
  }
  
  /**
   * Process list items
   */
  async processList(listConfig, data) {
    const items = [];
    
    if (listConfig.source && data[listConfig.source]) {
      const sourceData = data[listConfig.source];
      
      if (Array.isArray(sourceData)) {
        for (const item of sourceData) {
          if (listConfig.itemTemplate) {
            const processedItem = await this.processTemplateStructure(listConfig.itemTemplate, item);
            items.push(processedItem);
          } else {
            items.push(item);
          }
        }
      }
    }
    
    return items;
  }
  
  /**
   * Interpolate variables in strings
   */
  interpolateVariables(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || match;
    });
  }
  
  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }
  
  /**
   * Get available content blocks
   */
  getAvailableContentBlocks() {
    return Array.from(this.contentBlocks.keys());
  }
  
  /**
   * Get engine information
   */
  getInfo() {
    return {
      templates: this.getAvailableTemplates(),
      contentBlocks: this.getAvailableContentBlocks(),
      totalTemplates: this.templates.size,
      totalContentBlocks: this.contentBlocks.size
    };
  }
}