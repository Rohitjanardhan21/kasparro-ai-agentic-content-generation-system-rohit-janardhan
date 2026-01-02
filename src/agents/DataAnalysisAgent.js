import { AutonomousAgent } from '../core/AutonomousAgent.js';

/**
 * Autonomous Data Analysis Agent
 * Analyzes product data and determines what content needs to be generated
 */
export class DataAnalysisAgent extends AutonomousAgent {
  constructor() {
    super('data-analyst', [
      {
        id: 'analyze-product-data',
        description: 'Analyze product data and determine content requirements',
        requiredCapability: 'data-analysis',
        priority: 10
      }
    ]);
    
    this.capabilities.add('data-analysis');
    this.capabilities.add('requirement-planning');
    
    this.analysisResults = null;
    this.contentRequirements = [];
  }

  async planForGoal(goal) {
    if (goal.id === 'analyze-product-data') {
      return {
        actions: [
          { type: 'validate-data', status: 'pending' },
          { type: 'analyze-structure', status: 'pending' },
          { type: 'determine-requirements', status: 'pending' },
          { type: 'coordinate-agents', status: 'pending' }
        ],
        currentIndex: 0,
        nextAction() {
          return this.actions.find(a => a.status === 'pending');
        },
        markActionComplete(action) {
          action.status = 'completed';
        },
        isComplete() {
          return this.actions.every(a => a.status === 'completed');
        }
      };
    }
    return null;
  }

  async executeAction(action) {
    switch (action.type) {
      case 'validate-data':
        return await this.validateProductData();
      
      case 'analyze-structure':
        return await this.analyzeDataStructure();
      
      case 'determine-requirements':
        return await this.determineContentRequirements();
      
      case 'coordinate-agents':
        return await this.coordinateWithOtherAgents();
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  async validateProductData() {
    const context = this.beliefs.get('context');
    
    if (!context || !context.productName) {
      return { success: false, error: 'No product data found' };
    }

    const requiredFields = ['productName', 'concentration', 'skinType', 'keyIngredients', 'benefits'];
    const missingFields = requiredFields.filter(field => !context[field]);
    
    if (missingFields.length > 0) {
      return { success: false, error: `Missing fields: ${missingFields.join(', ')}` };
    }

    console.log(`📊 Data validation complete - all required fields present`);
    return { success: true };
  }

  async analyzeDataStructure() {
    const context = this.beliefs.get('context');
    
    this.analysisResults = {
      productType: this.inferProductType(context),
      complexity: this.assessComplexity(context),
      targetAudience: this.identifyTargetAudience(context),
      contentOpportunities: this.identifyContentOpportunities(context)
    };

    console.log(`🔍 Data analysis complete:`, this.analysisResults);
    return { success: true };
  }

  async determineContentRequirements() {
    this.contentRequirements = [
      {
        type: 'faq',
        priority: 'high',
        minQuestions: 5,
        categories: ['informational', 'safety', 'usage', 'purchase', 'comparison'],
        assignedAgent: null
      },
      {
        type: 'product-description',
        priority: 'high',
        sections: ['specifications', 'benefits', 'usage', 'safety'],
        assignedAgent: null
      },
      {
        type: 'comparison',
        priority: 'medium',
        requiresCompetitor: true,
        assignedAgent: null
      }
    ];

    console.log(`📋 Content requirements determined:`, this.contentRequirements.length, 'types needed');
    return { success: true };
  }

  async coordinateWithOtherAgents() {
    // Broadcast content requirements to other agents
    this.broadcast('content-requirements', {
      requirements: this.contentRequirements,
      analysis: this.analysisResults,
      requestId: Date.now()
    });

    console.log(`📡 Broadcasted content requirements to all agents`);
    return { success: true };
  }

  inferProductType(data) {
    if (data.concentration && data.concentration.includes('Vitamin C')) {
      return 'skincare-serum';
    }
    return 'unknown';
  }

  assessComplexity(data) {
    const ingredients = data.keyIngredients ? data.keyIngredients.split(',').length : 0;
    const benefits = data.benefits ? data.benefits.split(',').length : 0;
    
    if (ingredients >= 3 || benefits >= 3) return 'high';
    if (ingredients >= 2 || benefits >= 2) return 'medium';
    return 'low';
  }

  identifyTargetAudience(data) {
    const skinTypes = data.skinType ? data.skinType.toLowerCase() : '';
    if (skinTypes.includes('oily') || skinTypes.includes('combination')) {
      return 'oily-combination-skin';
    }
    return 'general';
  }

  identifyContentOpportunities(data) {
    const opportunities = [];
    
    if (data.benefits) opportunities.push('benefits-focused-content');
    if (data.sideEffects) opportunities.push('safety-information');
    if (data.howToUse) opportunities.push('usage-instructions');
    if (data.price) opportunities.push('value-proposition');
    
    return opportunities;
  }

  getResults() {
    return {
      analysis: this.analysisResults,
      requirements: this.contentRequirements,
      status: 'completed'
    };
  }

  onActivate() {
    // Set up message handlers
    this.messageHandlers.set('agent-capability-response', this.handleCapabilityResponse.bind(this));
  }

  async handleCapabilityResponse(message) {
    // Update content requirements with agent assignments
    const { agentId, capabilities, canHandle } = message.payload;
    
    for (const requirement of this.contentRequirements) {
      if (!requirement.assignedAgent && canHandle.includes(requirement.type)) {
        requirement.assignedAgent = agentId;
        console.log(`📝 Assigned ${requirement.type} to agent ${agentId}`);
      }
    }
  }
}