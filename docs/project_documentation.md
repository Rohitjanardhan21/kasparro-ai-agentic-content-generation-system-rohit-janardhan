# Project Documentation

## Problem Statement

Design and implement a modular agentic automation system that takes product data and automatically generates structured, machine-readable content pages. The system must demonstrate multi-agent workflows, automation graphs, reusable content logic, template-based generation, and structured JSON output.

## Solution Overview

The system implements a **DAG-based multi-agent architecture** where specialized agents process product data through a coordinated workflow to generate three types of content pages: FAQ, Product Description, and Product Comparison.

### Core Architecture Principles

- **Agent Autonomy**: Each agent has a single responsibility and clear input/output contracts
- **Dependency Management**: Agents declare their dependencies, enabling automatic execution ordering
- **Template-Driven Generation**: Reusable templates with embedded content logic blocks
- **Structured Output**: All content generated as machine-readable JSON

## Scopes & Assumptions

### In Scope
- Multi-agent workflow orchestration
- Template-based content generation
- Reusable content logic blocks
- JSON output format
- Automated question generation (15+ questions across 5 categories)
- Fictional product comparison data generation

### Out of Scope
- External API integrations
- Real-time data fetching
- User interface components
- Database persistence
- Content validation beyond structural checks

### Assumptions
- Product data follows the specified schema
- Generated content doesn't require real-world fact verification
- Fictional comparison products are acceptable for demonstration
- JSON output format is sufficient for machine readability

## System Design

### 1. Core Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Orchestrator  │────│  Template Engine │────│ Content Blocks  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ├── DataParserAgent
         ├── QuestionGeneratorAgent  
         ├── ComparisonDataAgent
         ├── FaqPageAgent
         ├── ProductPageAgent
         └── ComparisonPageAgent
```

### 2. Agent Workflow (DAG)

```
DataParserAgent
    ├── QuestionGeneratorAgent ──→ FaqPageAgent
    ├── ComparisonDataAgent ────→ ComparisonPageAgent  
    └── ProductPageAgent
```

**Execution Order**: DataParserAgent → [QuestionGeneratorAgent, ComparisonDataAgent, ProductPageAgent] → [FaqPageAgent, ComparisonPageAgent]

### 3. Agent Responsibilities

| Agent | Input | Output | Responsibility |
|-------|-------|--------|----------------|
| **DataParserAgent** | Raw product data | Cleaned product model | Data validation and normalization |
| **QuestionGeneratorAgent** | Product model | Categorized questions | Generate 15+ questions across 5 categories |
| **ComparisonDataAgent** | Product model | Fictional Product B | Create comparison product data |
| **FaqPageAgent** | Product + Questions | FAQ JSON | Generate FAQ page using templates |
| **ProductPageAgent** | Product model | Product JSON | Generate product description page |
| **ComparisonPageAgent** | Product A + B | Comparison JSON | Generate side-by-side comparison |

### 4. Template System

Templates define the structure and use content blocks for dynamic content generation:

```javascript
{
  "page_info": {
    "title": "{{product.name}} - FAQ"
  },
  "$block:generateFaqBlock": {
    "limit": 5
  },
  "$field:product.name": "product_name"
}
```

**Template Features**:
- Field mapping with `$field:` prefix
- Content block execution with `$block:` prefix  
- Variable interpolation with `{{}}` syntax
- Nested object processing

### 5. Content Logic Blocks

Reusable functions that transform product data into structured content:

| Block | Purpose | Output |
|-------|---------|--------|
| `generateBenefitsBlock` | Extract and format benefits | Structured benefit list |
| `extractUsageBlock` | Parse usage instructions | Step-by-step usage guide |
| `compareIngredientsBlock` | Compare product ingredients | Ingredient analysis |
| `generateSafetyBlock` | Process safety information | Safety guidelines |
| `generatePricingBlock` | Format pricing data | Price analysis |
| `generateSpecsBlock` | Extract specifications | Product specifications |
| `generateFaqBlock` | Filter and format Q&As | FAQ entries |

### 6. Data Flow

1. **Input**: Raw product data object
2. **Parse**: DataParserAgent validates and cleans data
3. **Enrich**: Parallel agents generate questions and comparison data
4. **Generate**: Page agents use templates and blocks to create content
5. **Output**: Three JSON files with structured content

### 7. Orchestration Strategy

The system uses **topological sorting** to determine agent execution order based on declared dependencies. This ensures:
- Agents execute only after their dependencies complete
- Parallel execution where possible
- Circular dependency detection
- Automatic workflow optimization

### 8. Extensibility Design

**Adding New Agents**:
```javascript
class NewAgent extends Agent {
  constructor() {
    super('NewAgent', ['DataParserAgent']); // Declare dependencies
  }
  async process(input) { /* Implementation */ }
}
```

**Adding New Templates**:
```javascript
templateEngine.registerTemplate('new_page', TEMPLATE_DEFINITION);
```

**Adding New Content Blocks**:
```javascript
templateEngine.registerContentBlock('newBlock', transformFunction);
```

### 9. Output Structure

Each generated page follows this structure:
```json
{
  "page_type": "faq|product|comparison",
  "content": { /* Template-generated content */ },
  "metadata": {
    "generated_at": "ISO timestamp",
    "additional_metadata": "..."
  }
}
```

### 10. Quality Assurance

- **Input Validation**: Required field checking in DataParserAgent
- **Dependency Management**: Automatic dependency resolution
- **Error Handling**: Agent-level error catching with meaningful messages
- **Output Validation**: JSON structure verification
- **Extensibility**: Clear interfaces for adding new components

This architecture demonstrates production-ready agentic system design with clear separation of concerns, reusable components, and scalable orchestration patterns.