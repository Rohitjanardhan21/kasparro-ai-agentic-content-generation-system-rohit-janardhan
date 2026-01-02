/**
 * DataProcessingCapability - A modular capability that can be plugged into any agent
 * 
 * This demonstrates true modularity:
 * 1. Can be used by any agent, not just content generation agents
 * 2. Configurable parameters and behavior
 * 3. No hardcoded domain knowledge
 * 4. Reusable across different contexts
 */

export const DataProcessingCapability = {
  name: 'data_processing',
  type: 'analysis',
  description: 'Processes and analyzes various types of data',
  
  parameters: {
    supportedFormats: ['json', 'text', 'csv', 'xml'],
    maxDataSize: 1000000, // 1MB
    processingStrategies: ['parse', 'validate', 'normalize', 'enrich']
  },
  
  /**
   * Check if this capability can process the given data
   */
  canExecute: (params, agent) => {
    if (!params.data) return false;
    
    const dataSize = JSON.stringify(params.data).length;
    if (dataSize > DataProcessingCapability.parameters.maxDataSize) {
      return false;
    }
    
    const format = params.format || 'json';
    return DataProcessingCapability.parameters.supportedFormats.includes(format);
  },
  
  /**
   * Execute data processing
   */
  execute: async (params, agent) => {
    const { data, strategy = 'parse', format = 'json' } = params;
    
    console.log(`🔧 [${agent.name}] Processing data with strategy: ${strategy}`);
    
    const result = {
      originalData: data,
      processedData: null,
      strategy: strategy,
      format: format,
      timestamp: new Date().toISOString(),
      processingTime: 0,
      quality: 0
    };
    
    const startTime = Date.now();
    
    try {
      switch (strategy) {
        case 'parse':
          result.processedData = await DataProcessingCapability.parseData(data, format);
          break;
        case 'validate':
          result.processedData = await DataProcessingCapability.validateData(data, params.schema);
          break;
        case 'normalize':
          result.processedData = await DataProcessingCapability.normalizeData(data);
          break;
        case 'enrich':
          result.processedData = await DataProcessingCapability.enrichData(data, agent);
          break;
        default:
          throw new Error(`Unknown processing strategy: ${strategy}`);
      }
      
      result.processingTime = Date.now() - startTime;
      result.quality = DataProcessingCapability.assessQuality(result.processedData);
      
      // Store processed data in agent's beliefs for future use
      agent.beliefs.set('processed_data', {
        value: result.processedData,
        confidence: result.quality / 100,
        timestamp: Date.now(),
        strategy: strategy
      });
      
      // Share processed data with environment
      if (agent.environment) {
        agent.environment.addData('processed_data', result.processedData, agent.name, {
          type: 'processed_data',
          confidence: result.quality / 100,
          strategy: strategy,
          quality: result.quality
        });
      }
      
      console.log(`✅ [${agent.name}] Data processing completed - Quality: ${result.quality}/100`);
      
      // Agent learns from this execution
      agent.emit('capability_executed', {
        capability: 'data_processing',
        success: true,
        result: result
      });
      
      return result;
      
    } catch (error) {
      result.error = error.message;
      result.processingTime = Date.now() - startTime;
      
      console.error(`❌ [${agent.name}] Data processing failed: ${error.message}`);
      
      agent.emit('capability_failed', {
        capability: 'data_processing',
        error: error.message,
        params: params
      });
      
      throw error;
    }
  },
  
  /**
   * Parse data based on format
   */
  parseData: async (data, format) => {
    switch (format) {
      case 'json':
        return DataProcessingCapability.parseJSON(data);
      case 'text':
        return DataProcessingCapability.parseText(data);
      case 'csv':
        return DataProcessingCapability.parseCSV(data);
      default:
        return data;
    }
  },
  
  /**
   * Parse JSON data
   */
  parseJSON: (data) => {
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    
    // Extract and clean fields
    const parsed = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        parsed[key] = value.trim().replace(/\s+/g, ' ');
      } else {
        parsed[key] = value;
      }
    }
    
    return parsed;
  },
  
  /**
   * Parse text data
   */
  parseText: (data) => {
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      lines: lines,
      wordCount: data.split(/\s+/).length,
      characterCount: data.length,
      paragraphs: data.split('\n\n').length
    };
  },
  
  /**
   * Parse CSV data
   */
  parseCSV: (data) => {
    const lines = data.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }
    }
    
    return { headers, rows, count: rows.length };
  },
  
  /**
   * Validate data against schema
   */
  validateData: async (data, schema) => {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      score: 100
    };
    
    if (!schema) {
      validation.warnings.push('No schema provided for validation');
      return { data, validation };
    }
    
    // Basic validation logic
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && !data[field]) {
        validation.errors.push(`Required field missing: ${field}`);
        validation.isValid = false;
        validation.score -= 20;
      }
      
      if (data[field] && rules.type && typeof data[field] !== rules.type) {
        validation.errors.push(`Field ${field} has wrong type: expected ${rules.type}, got ${typeof data[field]}`);
        validation.score -= 10;
      }
      
      if (data[field] && rules.minLength && data[field].length < rules.minLength) {
        validation.warnings.push(`Field ${field} is shorter than recommended (${rules.minLength})`);
        validation.score -= 5;
      }
    }
    
    return { data, validation };
  },
  
  /**
   * Normalize data
   */
  normalizeData: async (data) => {
    const normalized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Normalize strings
        normalized[key] = value
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase();
      } else if (typeof value === 'number') {
        // Normalize numbers
        normalized[key] = Number(value.toFixed(2));
      } else {
        normalized[key] = value;
      }
    }
    
    return normalized;
  },
  
  /**
   * Enrich data with additional information
   */
  enrichData: async (data, agent) => {
    const enriched = { ...data };
    
    // Add metadata
    enriched._metadata = {
      processedBy: agent.name,
      processedAt: new Date().toISOString(),
      enrichmentLevel: 'basic',
      confidence: 0.8
    };
    
    // Add derived fields based on existing data
    if (data.price && typeof data.price === 'string') {
      const numericPrice = parseFloat(data.price.replace(/[^\d.]/g, ''));
      if (!isNaN(numericPrice)) {
        enriched.numericPrice = numericPrice;
        enriched.priceCategory = DataProcessingCapability.categorizePriceRange(numericPrice);
      }
    }
    
    if (data.benefits && typeof data.benefits === 'string') {
      enriched.benefitsList = data.benefits.split(',').map(b => b.trim());
      enriched.benefitCount = enriched.benefitsList.length;
    }
    
    return enriched;
  },
  
  /**
   * Categorize price range
   */
  categorizePriceRange: (price) => {
    if (price < 100) return 'budget';
    if (price < 500) return 'affordable';
    if (price < 1000) return 'mid-range';
    if (price < 2000) return 'premium';
    return 'luxury';
  },
  
  /**
   * Assess data quality
   */
  assessQuality: (data) => {
    if (!data) return 0;
    
    let score = 100;
    
    // Check completeness
    const fields = Object.keys(data);
    if (fields.length === 0) score -= 50;
    
    // Check for empty values
    for (const [key, value] of Object.entries(data)) {
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        score -= 10;
      }
    }
    
    // Check data types consistency
    let stringFields = 0;
    let numberFields = 0;
    for (const value of Object.values(data)) {
      if (typeof value === 'string') stringFields++;
      if (typeof value === 'number') numberFields++;
    }
    
    // Penalize if all fields are the same type (might indicate parsing issues)
    if (stringFields === fields.length && fields.length > 3) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  },
  
  cost: 1,
  reliability: 0.95
};