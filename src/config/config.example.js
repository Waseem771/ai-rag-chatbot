// This is an example configuration file
// Copy this to config.js and update values as needed

export const ragConfig = {
  // How many documents to retrieve for context
  topK: 5,

  // Minimum similarity score threshold
  minSimilarity: 0.3,

  // Maximum tokens to include in context
  maxContextTokens: 4000,

  // Claude model to use
  model: 'claude-opus-4-8',

  // System prompt template
  systemPrompt: `You are a helpful assistant. Use the provided context to answer questions accurately.
If the context doesn't contain relevant information, say so clearly.
Always cite which documents you're referencing.`,

  // How to handle missing context
  allowGeneralKnowledge: true,
};
