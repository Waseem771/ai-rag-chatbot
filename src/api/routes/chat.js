import express from 'express';
import { retrieveDocuments, buildContext } from '../../rag/retriever.js';
import { generateResponse } from '../../rag/generator.js';
import { createConversation, addMessageToConversation, getConversationHistory } from '../../models/conversation.js';

const router = express.Router();

// In-memory conversation storage (for demo)
// In production, use a database
const conversations = new Map();

/**
 * POST /api/chat - Send a message and get a response
 */
router.post('/', async (req, res, next) => {
  try {
    const { query, conversationId } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query is required and must be a non-empty string',
      });
    }

    // Get or create conversation
    let conversation = conversations.get(conversationId) || createConversation(conversationId);

    // Retrieve relevant documents
    const retrievedDocs = await retrieveDocuments(query);

    // Build context from retrieved documents
    const context = buildContext(retrievedDocs);

    // Get conversation history
    const history = getConversationHistory(conversation);

    // Generate response
    const result = await generateResponse(query, context, history);

    // Add messages to conversation
    addMessageToConversation(conversation, 'user', query);
    addMessageToConversation(conversation, 'assistant', result.response);

    // Save conversation
    conversations.set(conversation.id, conversation);

    res.json({
      success: true,
      conversationId: conversation.id,
      query,
      response: result.response,
      retrievedDocuments: retrievedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity,
      })),
      usage: result.usage,
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/:conversationId - Get conversation history
 */
router.get('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/chat/:conversationId - Delete conversation
 */
router.delete('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!conversations.has(conversationId)) {
      return res.status(404).json({
        error: 'Conversation not found',
      });
    }

    conversations.delete(conversationId);

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
