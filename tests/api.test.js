import test from 'node:test';
import assert from 'node:assert';
import { cosineSimilarity, simpleEmbedding, rankDocuments } from '../src/utils/embeddings.js';
import { createDocument, validateDocument } from '../src/models/document.js';
import { createConversation, addMessageToConversation, getConversationHistory } from '../src/models/conversation.js';

test('Embeddings - cosineSimilarity', () => {
  const vec1 = [1, 0, 0];
  const vec2 = [1, 0, 0];
  const similarity = cosineSimilarity(vec1, vec2);
  assert.strictEqual(similarity, 1, 'Identical vectors should have similarity 1');
});

test('Embeddings - simpleEmbedding', () => {
  const embedding = simpleEmbedding('hello world');
  assert.strictEqual(embedding.length, 384, 'Embedding should have 384 dimensions');
  assert(embedding.some(val => val !== 0), 'Embedding should not be all zeros');
});

test('Embeddings - rankDocuments', () => {
  const queryEmbedding = simpleEmbedding('hello');
  const docEmbeddings = {
    doc1: simpleEmbedding('hello world'),
    doc2: simpleEmbedding('goodbye'),
  };

  const ranked = rankDocuments(queryEmbedding, docEmbeddings, 0);
  assert(ranked.length > 0, 'Should return ranked documents');
  assert(ranked[0].similarity >= ranked[1].similarity, 'Results should be sorted by similarity');
});

test('Document - createDocument', () => {
  const doc = createDocument('Test Doc', 'Test content');
  assert.strictEqual(doc.title, 'Test Doc');
  assert.strictEqual(doc.content, 'Test content');
  assert(doc.id, 'Document should have an ID');
  assert(doc.createdAt, 'Document should have createdAt timestamp');
});

test('Document - validateDocument', () => {
  const validDoc = { title: 'Test', content: 'Content' };
  const validation = validateDocument(validDoc);
  assert.strictEqual(validation.valid, true, 'Valid document should pass validation');

  const invalidDoc = { title: '', content: 'Content' };
  const invalidValidation = validateDocument(invalidDoc);
  assert.strictEqual(invalidValidation.valid, false, 'Invalid document should fail validation');
});

test('Conversation - createConversation', () => {
  const conv = createConversation();
  assert(conv.id, 'Conversation should have an ID');
  assert.strictEqual(conv.messages.length, 0, 'New conversation should have no messages');
});

test('Conversation - addMessageToConversation', () => {
  const conv = createConversation();
  addMessageToConversation(conv, 'user', 'Hello');
  assert.strictEqual(conv.messages.length, 1);
  assert.strictEqual(conv.messages[0].role, 'user');
  assert.strictEqual(conv.messages[0].content, 'Hello');
});

test('Conversation - getConversationHistory', () => {
  const conv = createConversation();
  addMessageToConversation(conv, 'user', 'Hello');
  addMessageToConversation(conv, 'assistant', 'Hi there');

  const history = getConversationHistory(conv);
  assert.strictEqual(history.length, 2);
  assert.deepStrictEqual(history[0], { role: 'user', content: 'Hello' });
});
