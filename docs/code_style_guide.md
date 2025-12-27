# Code Style Guide & Maintainability

## 🎯 Philosophy: Code for Humans

This codebase follows the principle: **"Write code as if the person who maintains it is a violent psychopath who knows where you live."**

## 📋 Code Style Principles

### 1. **Clarity Over Cleverness**
```javascript
// ❌ Clever but unclear
const q = d.p?.b?.split(',').map(b=>b.trim()).filter(b=>b.length>0)||[];

// ✅ Clear and maintainable
const benefits = data.product?.benefits || '';
const benefitsList = benefits.split(',')
  .map(benefit => benefit.trim())
  .filter(benefit => benefit.length > 0);
```

### 2. **Descriptive Naming**
```javascript
// ❌ Cryptic names
function proc(d) { return d.map(x => x.toLowerCase()); }

// ✅ Self-documenting names
function normalizeIngredientNames(ingredients) {
  return ingredients.map(ingredient => ingredient.toLowerCase());
}
```

### 3. **Single Responsibility Functions**
```javascript
// ❌ Function doing too much
function processProductData(data) {
  // validates, transforms, analyzes, formats...
}

// ✅ Single responsibility
function validateProductData(data) { /* validation only */ }
function transformProductData(data) { /* transformation only */ }
function analyzeProductData(data) { /* analysis only */ }
```

## 🏗️ Architecture Patterns

### Agent Pattern
```javascript
/**
 * Base Agent class - defines the contract for all agents
 * 
 * Design Decision: Use inheritance to ensure consistent interface
 * Maintainability: New agents follow same pattern, easy to understand
 */
export class Agent {
  constructor(name, dependencies = []) {
    this.name = name;           // Clear identification
    this.dependencies = dependencies; // Explicit dependencies
    this.state = 'idle';        // Trackable state
  }

  /**
   * Execute the agent's primary function
   * 
   * @param {Object} input - Input data for the agent
   * @returns {Promise<Object>} - Agent output
   * 
   * Why async: Allows for future I/O operations without breaking interface
   */
  async execute(input) {
    this.state = 'running';
    try {
      const result = await this.process(input);
      this.state = 'completed';
      return result;
    } catch (error) {
      this.state = 'failed';
      // Wrap errors with context for easier debugging
      throw new Error(`Agent ${this.name} failed: ${error.message}`);
    }
  }
}
```

### Template Engine Pattern
```javascript
/**
 * Template Engine - handles template loading and rendering
 * 
 * Design Decision: Custom engine vs external library
 * Rationale: Full control, no dependencies, optimized for our use case
 */
export class TemplateEngine {
  constructor() {
    // Use Maps for O(1) lookup performance
    this.templates = new Map();
    this.contentBlocks = new Map();
  }

  /**
   * Process template recursively
   * 
   * Why recursive: Templates can contain nested structures
   * Maintainability: Single function handles all template types
   */
  processTemplate(template, data) {
    // Handle arrays
    if (Array.isArray(template)) {
      return template.map(item => this.processTemplate(item, data));
    }

    // Handle objects
    if (typeof template === 'object' && template !== null) {
      const result = {};
      for (const [key, value] of Object.entries(template)) {
        // Clear naming convention for special keys
        if (key.startsWith('$block:')) {
          const blockName = key.substring(7);
          const block = this.contentBlocks.get(blockName);
          if (block) {
            Object.assign(result, block(data, value));
          }
        } else if (key.startsWith('$field:')) {
          const fieldPath = key.substring(7);
          result[value] = this.getNestedValue(data, fieldPath);
        } else {
          result[key] = this.processTemplate(value, data);
        }
      }
      return result;
    }

    return template;
  }
}
```

## 📝 Documentation Standards

### Function Documentation
```javascript
/**
 * Calculate question importance score for FAQ prioritization
 * 
 * @param {Object} question - Question object with category and text
 * @param {Object} product - Product data for context
 * @returns {number} - Importance score (0-100)
 * 
 * Algorithm:
 * - Base score: 50
 * - Safety questions: +20 (user safety priority)
 * - Usage questions: +15 (practical value)
 * - Product name mentions: +10 (relevance)
 * - How-to questions: +5 (actionable content)
 * 
 * Example:
 * calculateQuestionImportance(
 *   { category: 'safety', question: 'Is this safe?' },
 *   { name: 'GlowBoost' }
 * ) // Returns 70
 */
function calculateQuestionImportance(question, product) {
  let score = 50; // Base score - why 50? Middle ground for prioritization
  
  // Safety questions get highest priority - user safety is paramount
  if (question.category === 'safety') score += 20;
  
  // Usage questions are highly valuable - users want practical info
  if (question.category === 'usage') score += 15;
  
  // Purchase questions help conversion
  if (question.category === 'purchase') score += 10;
  
  // Product-specific questions are more relevant
  if (question.question.toLowerCase().includes(product.name.toLowerCase())) {
    score += 10;
  }
  
  // How-to questions provide actionable value
  if (question.question.toLowerCase().includes('how')) score += 5;
  
  return Math.min(100, score); // Cap at 100 for consistency
}
```

### Class Documentation
```javascript
/**
 * QuestionGeneratorAgent - generates categorized user questions from product data
 * 
 * Purpose: Transform product specifications into user-focused Q&A content
 * 
 * Dependencies: DataParserAgent (needs clean product data)
 * 
 * Output: 18+ questions across 5 categories:
 * - Informational: What is this product?
 * - Safety: Are there side effects?
 * - Usage: How do I use this?
 * - Purchase: What's the price?
 * - Comparison: How does this compare?
 * 
 * Design Decision: Generate more questions than needed, then prioritize
 * Rationale: Gives flexibility in content selection and quality
 * 
 * Maintainability Notes:
 * - Add new categories by creating new generate*Questions methods
 * - Modify question templates in individual methods
 * - Question prioritization logic is in separate function
 */
export class QuestionGeneratorAgent extends Agent {
  constructor() {
    super('QuestionGeneratorAgent', ['DataParserAgent']);
  }
  // ... implementation
}
```

## 🔧 Error Handling Philosophy

### Fail Fast, Fail Clear
```javascript
// ❌ Silent failures
function processData(data) {
  if (!data) return {};
  // continues with undefined behavior
}

// ✅ Explicit validation with clear errors
function processData(data) {
  if (!data) {
    throw new Error('processData requires data parameter');
  }
  if (typeof data !== 'object') {
    throw new Error(`processData expects object, got ${typeof data}`);
  }
  // ... process with confidence
}
```

### Contextual Error Messages
```javascript
// ❌ Generic error
throw new Error('Invalid input');

// ✅ Specific, actionable error
throw new Error(`Agent ${this.name} failed: Missing required field 'productName' in input data`);
```

## 🧪 Testing Philosophy

### Test Names as Documentation
```javascript
// ❌ Unclear test purpose
test('agent works', () => { /* ... */ });

// ✅ Self-documenting test
test('DataParserAgent should throw error when productName is missing', () => {
  const agent = new DataParserAgent();
  const invalidInput = { concentration: '10%' }; // missing productName
  
  expect(() => agent.execute(invalidInput))
    .toThrow('Missing required field: productName');
});
```

## 📊 Performance Considerations

### Readable Performance Optimizations
```javascript
// ❌ Micro-optimization that hurts readability
const r = d.p?.b?.split(',').map(b=>b.trim()).filter(b=>b.length>0)||[];

// ✅ Clear code with reasonable performance
const benefits = data.product?.benefits || '';
if (!benefits) return [];

const benefitsList = benefits
  .split(',')
  .map(benefit => benefit.trim())
  .filter(benefit => benefit.length > 0);

return benefitsList;
```

### Comments for Non-Obvious Optimizations
```javascript
// Use Map instead of Object for O(1) lookup performance
// with frequent agent registration/retrieval
this.agents = new Map();

// Pre-compile regex for repeated use in content analysis
this.questionPatterns = {
  what: /^what\s+/i,
  how: /^how\s+/i,
  why: /^why\s+/i
};
```

## 🔄 Refactoring Guidelines

### When to Refactor
1. **Function > 20 lines**: Consider breaking down
2. **Repeated code**: Extract to shared function
3. **Complex conditionals**: Extract to named functions
4. **Magic numbers**: Convert to named constants

### How to Refactor Safely
1. **Write tests first**: Ensure behavior is captured
2. **Small steps**: One change at a time
3. **Verify continuously**: Run tests after each change
4. **Document changes**: Update comments and docs

## 🎯 Code Review Checklist

### Before Submitting
- [ ] Function names clearly describe what they do
- [ ] Complex logic has explanatory comments
- [ ] Error messages are specific and actionable
- [ ] No magic numbers or strings
- [ ] Tests cover the happy path and edge cases
- [ ] Documentation is updated

### Reviewing Others' Code
- [ ] Can I understand this without asking questions?
- [ ] Are the variable names self-explanatory?
- [ ] Is the error handling appropriate?
- [ ] Are there any obvious bugs or edge cases?
- [ ] Is the code consistent with the existing style?

## 🚀 Future Maintainer Notes

### Adding New Agents
1. Extend the `Agent` base class
2. Define clear dependencies in constructor
3. Implement the `process` method
4. Add comprehensive error handling
5. Write unit tests
6. Update orchestrator registration
7. Document the agent's purpose and interface

### Modifying Templates
1. Templates are in `src/templates/Templates.js`
2. Use `$field:` for direct data mapping
3. Use `$block:` for content block execution
4. Test with various data inputs
5. Update documentation

### Performance Monitoring
- Check execution times in test output
- Monitor memory usage for large datasets
- Profile bottlenecks before optimizing
- Maintain readability while improving performance

**Remember: The next person to work on this code might be you in 6 months. Write code that future-you will thank present-you for.**