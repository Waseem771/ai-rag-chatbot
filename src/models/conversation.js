import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new conversation
 */
export function createConversation(id = null) {
  return {
    id: id || uuidv4(),
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add a message to conversation
 */
export function addMessageToConversation(conversation, role, content) {
  conversation.messages.push({
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
  });
  conversation.updatedAt = new Date().toISOString();
  return conversation;
}

/**
 * Get conversation messages in Claude API format
 */
export function getConversationHistory(conversation) {
  return conversation.messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
}
