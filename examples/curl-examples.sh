#!/bin/bash
# cURL examples for RAG Chatbot API
# Make sure the server is running on http://localhost:3000

BASE_URL="http://localhost:3000/api"

echo "🤖 RAG Chatbot cURL Examples"
echo "============================="
echo ""

# Health check
echo "1️⃣ Health Check"
curl -s $BASE_URL/../health | jq .
echo ""

# Upload a document
echo "2️⃣ Upload Document"
DOC_RESPONSE=$(curl -s -X POST $BASE_URL/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "content": "JavaScript is a versatile programming language commonly used in web development. It runs in browsers and on servers with Node.js. Key features include event handling, DOM manipulation, and asynchronous programming."
  }')
echo $DOC_RESPONSE | jq .
DOC_ID=$(echo $DOC_RESPONSE | jq -r '.document.id')
echo ""

# Get all documents
echo "3️⃣ Get All Documents"
curl -s -X GET $BASE_URL/documents | jq .
echo ""

# Upload another document
echo "4️⃣ Upload Another Document"
DOC_RESPONSE_2=$(curl -s -X POST $BASE_URL/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development",
    "content": "Web development involves creating applications that run on web browsers. It typically involves HTML for structure, CSS for styling, and JavaScript for interactivity. Modern frameworks like React and Vue simplify development."
  }')
echo $DOC_RESPONSE_2 | jq .
echo ""

# Chat query
echo "5️⃣ Chat Query"
CHAT_RESPONSE=$(curl -s -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is JavaScript used for?",
    "conversationId": "conv-001"
  }')
echo $CHAT_RESPONSE | jq .
echo ""

# Get a specific document
echo "6️⃣ Get Specific Document"
curl -s -X GET $BASE_URL/documents/$DOC_ID | jq .
echo ""

# Update a document
echo "7️⃣ Update Document"
curl -s -X PUT $BASE_URL/documents/$DOC_ID \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Advanced",
    "content": "Advanced JavaScript concepts include closures, prototypes, async/await, and modules. Understanding these helps write more efficient and maintainable code."
  }' | jq .
echo ""

# Get conversation history
echo "8️⃣ Get Conversation History"
curl -s -X GET $BASE_URL/chat/conv-001 | jq .
echo ""

# Another chat query
echo "9️⃣ Another Chat Query"
curl -s -X POST $BASE_URL/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about web development",
    "conversationId": "conv-001"
  }' | jq .
echo ""

# Delete a document
echo "🔟 Delete Document"
curl -s -X DELETE $BASE_URL/documents/$DOC_ID | jq .
echo ""

echo "✅ Examples completed!"
