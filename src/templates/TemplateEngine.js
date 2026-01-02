/**
 * Template Engine - Processes templates with field mapping and content blocks
 * 
 * Features:
 * - Field mapping with $field: prefix
 * - Content block execution with $block: prefix  
 * - Variable interpolation with {{}} syntax
 * - Nested object processing
 */
export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.contentBlocks = new Map();
    this.fieldProcessors = new Map();
  }

  /**
   * Register a template
   */
  registerTemplate(name, template) {
    this.templates.set(name, template);
    console.log(`📋 [TemplateEngine] Registered template: ${name}`);
  }

  /**
   * Register a content block
   */
  registerContentBlock(name, blockFunction) {
    this.contentBlocks.set(name, blockFunction);
    console.log(`🧩 [TemplateEngine] Registered content block: ${name}`);
  }

  /**
   * Register a field processor
   */
  registerFieldProcessor(fieldName, processor) {
    this.fieldProcessors.set(fieldName, processor);
  }

  /**
   * Process a template with data
   */
  async processTemplate(templateName, data, context = {}) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    console.log(`🔄 [TemplateEngine] Processing template: ${templateName}`);
    
    try {
      const result = await this.processObject(template, data, context);
      console.log(`✅ [TemplateEngine] Template processed successfully: ${templateName}`);
      return result;
    } catch (error) {
      console.error(`❌ [TemplateEngine] Template processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process an object recursively
   */
  async processObject(obj, data, context) {
    if (typeof obj === 'string') {
      return await this.processString(obj, data, context);
    }
    
    if (Array.isArray(obj)) {
      const results = [];
      for (const item of obj) {
        results.push(await this.processObject(item, data, context));
      }
      return results;
    }
    
    if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = await this.processObject(value, data, context);
      }
      return result;
    }
    
    return obj;
  }

  /**
   * Process a string with field mapping, blocks, and interpolation
   */
  async processString(str, data, context) {
    if (typeof str !== 'string') return str;

    // Process field mappings ($field:fieldName)
    if (str.startsWith('$field:')) {
      const fieldName = str.substring(7);
      return this.processField(fieldName, data, context);
    }

    // Process content blocks ($block:blockName)
    if (str.startsWith('$block:')) {
      const blockName = str.substring(7);
      return await this.processContentBlock(blockName, data, context);
    }

    // Process variable interpolation ({{variable}})
    return this.interpolateVariables(str, data, context);
  }

  /**
   * Process field mapping
   */
  processField(fieldName, data, context) {
    // Check for custom field processor
    if (this.fieldProcessors.has(fieldName)) {
      const processor = this.fieldProcessors.get(fieldName);
      return processor(data, context);
    }

    // Direct field access
    if (data && data.hasOwnProperty(fieldName)) {
      return data[fieldName];
    }

    // Nested field access (e.g., "product.name")
    if (fieldName.includes('.')) {
      const parts = fieldName.split('.');
      let value = data;
      for (const part of parts) {
        if (value && value.hasOwnProperty(part)) {
          value = value[part];
        } else {
          return null;
        }
      }
      return value;
    }

    return null;
  }

  /**
   * Process content block
   */
  async processContentBlock(blockName, data, context) {
    const block = this.contentBlocks.get(blockName);
    if (!block) {
      console.warn(`⚠️  [TemplateEngine] Content block not found: ${blockName}`);
      return null;
    }

    try {
      console.log(`🧩 [TemplateEngine] Executing content block: ${blockName}`);
      const result = await block(data, context);
      return result;
    } catch (error) {
      console.error(`❌ [TemplateEngine] Content block failed: ${blockName} - ${error.message}`);
      return null;
    }
  }

  /**
   * Interpolate variables in string
   */
  interpolateVariables(str, data, context) {
    return str.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const trimmed = variable.trim();
      
      // Check context first
      if (context && context.hasOwnProperty(trimmed)) {
        return context[trimmed];
      }
      
      // Check data
      if (data && data.hasOwnProperty(trimmed)) {
        return data[trimmed];
      }
      
      // Nested access
      if (trimmed.includes('.')) {
        const parts = trimmed.split('.');
        let value = data;
        for (const part of parts) {
          if (value && value.hasOwnProperty(part)) {
            value = value[part];
          } else {
            return match; // Return original if not found
          }
        }
        return value;
      }
      
      return match; // Return original if not found
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
   * Get template engine info
   */
  getInfo() {
    return {
      templates: this.getAvailableTemplates(),
      contentBlocks: this.getAvailableContentBlocks(),
      fieldProcessors: Array.from(this.fieldProcessors.keys())
    };
  }
}