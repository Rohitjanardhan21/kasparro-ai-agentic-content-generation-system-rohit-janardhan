/**
 * CommunicationCapability - A modular capability for inter-agent communication
 */

export const CommunicationCapability = {
  name: 'communication',
  type: 'interaction',
  description: 'Enables inter-agent communication and coordination',
  
  parameters: {
    supportedProtocols: ['direct', 'broadcast', 'negotiation', 'query'],
    maxMessageSize: 10000,
    messageFormats: ['json', 'text', 'structured']
  },
  
  canExecute: (params, agent) => {
    if (!params.messageType && !params.protocol) return false;
    const protocol = params.protocol || 'direct';
    return CommunicationCapability.parameters.supportedProtocols.includes(protocol);
  },
  
  execute: async (params, agent) => {
    const { protocol = 'direct', target, messageType, content } = params;
    
    console.log(`📡 [${agent.name}] Communicating via ${protocol} protocol`);
    
    const result = {
      protocol: protocol,
      target: target,
      messageType: messageType,
      sent: false,
      timestamp: new Date().toISOString(),
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    try {
      if (!agent.environment) {
        throw new Error('No environment available for communication');
      }
      
      const message = {
        id: result.messageId,
        from: agent.name,
        to: target || 'all',
        type: messageType,
        content: content,
        timestamp: Date.now(),
        protocol: protocol
      };
      
      if (protocol === 'broadcast') {
        result.response = await agent.environment.broadcastMessage(message);
      } else {
        result.response = await agent.environment.deliverMessage(message);
      }
      
      result.sent = true;
      
      agent.emit('capability_executed', {
        capability: 'communication',
        success: true,
        result: result
      });
      
      // Emit communication event for system monitoring
      agent.emit('communication_sent', {
        protocol: protocol,
        target: target,
        messageType: messageType
      });
      
      return result;
      
    } catch (error) {
      result.error = error.message;
      
      agent.emit('capability_failed', {
        capability: 'communication',
        error: error.message,
        params: params
      });
      
      throw error;
    }
  },
  
  handleIncomingMessage: async (agent, message) => {
    console.log(`📨 [${agent.name}] Received ${message.type} from ${message.from}`);
    
    // Agent decides how to respond based on message type
    let response = null;
    
    switch (message.type) {
      case 'collaboration_proposal':
        response = await CommunicationCapability.handleCollaborationProposal(agent, message);
        break;
      case 'data_request':
        response = await CommunicationCapability.handleDataRequest(agent, message);
        break;
      case 'status_query':
        response = { status: agent.getStatus(), timestamp: Date.now() };
        break;
      default:
        response = { received: true, messageType: message.type };
    }
    
    return response;
  },
  
  handleCollaborationProposal: async (agent, message) => {
    const proposal = message.content;
    
    // Agent autonomously decides whether to collaborate
    const collaborationScore = CommunicationCapability.evaluateCollaboration(agent, proposal);
    const willCollaborate = collaborationScore > 0.5;
    
    return {
      collaboration: willCollaborate ? 'accepted' : 'declined',
      score: collaborationScore,
      capabilities: willCollaborate ? Array.from(agent.capabilities.keys()) : [],
      reasoning: `Collaboration scored ${collaborationScore}, ${willCollaborate ? 'accepted' : 'declined'}`
    };
  },
  
  handleDataRequest: async (agent, message) => {
    const request = message.content;
    
    // Agent decides what data to share
    const shareableData = CommunicationCapability.getShareableData(agent, request);
    
    return {
      dataShared: shareableData.length > 0,
      data: shareableData,
      note: shareableData.length > 0 ? 'Data shared' : 'No relevant data to share'
    };
  },
  
  evaluateCollaboration: (agent, proposal) => {
    let score = 0.3; // Base willingness
    
    // Increase score if agent has collaboration goal
    if (agent.goals.has('establish_collaboration')) {
      score += 0.4;
    }
    
    // Adjust based on autonomy level
    score *= agent.autonomyLevel;
    
    // Adjust based on current workload
    const workload = agent.goals.size / 10; // Normalize workload
    score *= (1 - Math.min(workload, 0.5));
    
    return Math.min(1.0, score);
  },
  
  getShareableData: (agent, request) => {
    const shareable = [];
    
    for (const [key, belief] of agent.beliefs.entries()) {
      if (belief.confidence > 0.7 && !key.startsWith('private_')) {
        if (!request.dataType || CommunicationCapability.matchesDataType(belief.value, request.dataType)) {
          shareable.push({
            key: key,
            value: belief.value,
            confidence: belief.confidence,
            timestamp: belief.timestamp
          });
        }
      }
    }
    
    return shareable;
  },
  
  matchesDataType: (value, requestedType) => {
    const actualType = typeof value === 'object' ? 'structured' : typeof value;
    return actualType === requestedType || requestedType === 'any';
  },
  
  cost: 2,
  reliability: 0.9
};