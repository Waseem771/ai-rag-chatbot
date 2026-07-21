import Groq from 'groq-sdk';
import config from '../config.js';

// Lazy initialize client - only create when needed
let client = null;

function getClient() {
  if (!client) {
    if (!config.groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }
    client = new Groq({
      apiKey: config.groqApiKey,
    });
  }
  return client;
}

/**
 * Generate a response using Groq with the given context
 */
export async function generateResponse(query, context, conversationHistory = []) {
  try {
    const groqClient = getClient();
    const systemPrompt = buildSystemPrompt(context);

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: query,
      },
    ];

    const response = await groqClient.chat.completions.create({
      model: config.groqModel,
      max_tokens: config.maxTokens || 2048,
      messages,
      temperature: 0.2,
      top_p: 0.9,
      stream: false,
    });

    let responseText = response.choices[0]?.message?.content || '';

    // Remove thinking tags if present
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    return {
      response: responseText,
      usage: {
        input_tokens: response.usage?.input_tokens || 0,
        output_tokens: response.usage?.output_tokens || 0,
      },
      model: config.groqModel,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(context) {
  return `You are a brief document assistant. Answer in 1-2 sentences ONLY.

RULES:
1. Answer ONLY using document information
2. If not in documents: "I don't have information about this in the provided documents."
3. Maximum 2 sentences
4. NO explanations, thinking, or extra text
5. NO offers to help
6. Include document source

Documents:
${context || 'No documents available.'}`;
}