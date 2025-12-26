/**
 * Template Engine - handles template loading and rendering
 */
export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.contentBlocks = new Map();
  }

  /**
   * Register a template
   * @param {string} name - Template name
   * @param {Object} template - Template definition
   */
  registerTemplate(name, template) {
    this.validateTemplate(template);
    this.templates.set(name, template);
  }

  /**
   * Register a content logic block
   * @param {string} name - Block name
   * @param {Function} block - Content logic function
   */
  registerContentBlock(name, block) {
    this.contentBlocks.set(name, block);
  }

  /**
   * Render a template with data
   * @param {string} templateName - Name of template to render
   * @param {Object} data - Data to render with
   * @returns {Object} - Rendered content
   */
  render(templateName, data) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.processTemplate(template, data);
  }

  /**
   * Process template recursively
   * @param {Object} template - Template to process
   * @param {Object} data - Data context
   * @returns {Object} - Processed template
   */
  processTemplate(template, data) {
    if (Array.isArray(template)) {
      return template.map(item => this.processTemplate(item, data));
    }

    if (typeof template === 'object' && template !== null) {
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        if (key.startsWith('$block:')) {
          // Execute content block
          const blockName = key.substring(7);
          const block = this.contentBlocks.get(blockName);
          if (block) {
            Object.assign(result, block(data, value));
          }
        } else if (key.startsWith('$field:')) {
          // Direct field mapping
          const fieldPath = key.substring(7);
          result[value] = this.getNestedValue(data, fieldPath);
        } else if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
          // Template variable
          const fieldPath = value.slice(2, -2).trim();
          result[key] = this.getNestedValue(data, fieldPath);
        } else {
          result[key] = this.processTemplate(value, data);
        }
      }
      return result;
    }

    return template;
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot notation path
   * @returns {*} - Found value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate template structure
   * @param {Object} template - Template to validate
   */
  validateTemplate(template) {
    if (!template || typeof template !== 'object') {
      throw new Error('Template must be an object');
    }
  }
}