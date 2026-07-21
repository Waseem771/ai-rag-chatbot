/**
 * Basic usage example for the RAG Chatbot
 * This demonstrates how to interact with the API
 */

const API_BASE = 'http://localhost:3000/api';

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}

// Main demo function
async function runDemo() {
  console.log('🤖 RAG Chatbot Demo\n');

  try {
    // 1. Upload documents
    console.log('📄 Uploading documents...');
    const doc1 = await apiCall('POST', '/documents', {
      title: 'Introduction to Machine Learning',
      content: `Machine learning is a subset of artificial intelligence. It enables systems to learn and improve 
from experience without being explicitly programmed. There are three main types: supervised learning, 
unsupervised learning, and reinforcement learning.`,
    });
    console.log(`✓ Document 1 uploaded: ${doc1.document.id}\n`);

    const doc2 = await apiCall('POST', '/documents', {
      title: 'Python Programming Basics',
      content: `Python is a high-level programming language known for its simplicity. It was created by Guido van Rossum 
in 1991. Python uses indentation to define code blocks and supports multiple programming paradigms.`,
    });
    console.log(`✓ Document 2 uploaded: ${doc2.document.id}\n`);

    // 2. Get all documents
    console.log('📚 Retrieving all documents...');
    const allDocs = await apiCall('GET', '/documents');
    console.log(`✓ Found ${allDocs.count} documents\n`);

    // 3. Chat with the chatbot
    console.log('💬 Starting conversation...\n');

    const conversationId = 'demo-conversation-1';

    // Query 1
    console.log('User: What are the types of machine learning?');
    const response1 = await apiCall('POST', '/chat', {
      query: 'What are the types of machine learning?',
      conversationId,
    });
    console.log(`Assistant: ${response1.response}`);
    console.log(`Documents retrieved: ${response1.retrievedDocuments.length}\n`);

    // Query 2
    console.log('User: Tell me about Python.');
    const response2 = await apiCall('POST', '/chat', {
      query: 'Tell me about Python.',
      conversationId,
    });
    console.log(`Assistant: ${response2.response}`);
    console.log(`Documents retrieved: ${response2.retrievedDocuments.length}\n`);

    // 4. Get conversation history
    console.log('📖 Conversation history:');
    const conversation = await apiCall('GET', `/chat/${conversationId}`);
    console.log(`Total messages: ${conversation.conversation.messages.length}\n`);

    // 5. Update a document
    console.log('✏️  Updating a document...');
    const updated = await apiCall('PUT', `/documents/${doc1.document.id}`, {
      title: 'Machine Learning Fundamentals',
      content: 'Updated content about machine learning...',
    });
    console.log(`✓ Document updated\n`);

    // 6. Delete a document
    console.log('🗑️  Deleting a document...');
    await apiCall('DELETE', `/documents/${doc2.document.id}`);
    console.log(`✓ Document deleted\n`);

    console.log('✅ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}

export { apiCall };
