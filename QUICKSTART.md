# RAG Chatbot - Quick Start Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com)

## Installation

### 1. Clone and Install

```bash
cd ai-rag-chatbot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
MODEL_ID=claude-opus-4-8
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing the API

### Option 1: Using cURL

```bash
# Upload a document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Node.js Guide",
    "content": "Node.js is a JavaScript runtime built on Chrome V8. It allows you to run JavaScript on the server side."
  }'

# Query the chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Node.js?",
    "conversationId": "demo-1"
  }'
```

### Option 2: Using the Example Script

```bash
node examples/basic-usage.js
```

### Option 3: Using the Bash Script

```bash
bash examples/curl-examples.sh
```

## Project Structure

```
ai-rag-chatbot/
├── src/
│   ├── api/                    # REST API routes
│   │   ├── routes/
│   │   │   ├── documents.js   # Document CRUD endpoints
│   │   │   └── chat.js         # Chat/query endpoints
│   │   └── middleware/
│   │       └── errorHandler.js # Error handling
│   ├── rag/                     # RAG engine
│   │   ├── retriever.js        # Document retrieval
│   │   └── generator.js        # Response generation
│   ├── models/                  # Data models
│   │   ├── document.js         # Document schema
│   │   └── conversation.js     # Conversation schema
│   ├── utils/                   # Utilities
│   │   ├── embeddings.js       # Vector operations
│   │   ├── storage.js          # File I/O
│   │   └── logger.js           # Logging
│   ├── scripts/                 # One-off scripts
│   │   └── generateEmbeddings.js
│   ├── config.js               # Configuration
│   └── index.js                # Entry point
├── tests/                       # Test files
├── examples/                    # Usage examples
├── data/                        # Document storage (auto-created)
├── package.json
├── .env.example
└── README.md
```

## API Endpoints

### Documents

#### Create Document
```bash
POST /api/documents
Content-Type: application/json

{
  "title": "Document Title",
  "content": "Document content here...",
  "metadata": {"source": "web"}  # optional
}
```

Response:
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "title": "Document Title",
    "content": "...",
    "createdAt": "2026-07-19T09:16:19.759Z",
    "updatedAt": "2026-07-19T09:16:19.759Z"
  }
}
```

#### Get All Documents
```bash
GET /api/documents
```

#### Get Single Document
```bash
GET /api/documents/{id}
```

#### Update Document
```bash
PUT /api/documents/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Document
```bash
DELETE /api/documents/{id}
```

### Chat

#### Send Query (RAG)
```bash
POST /api/chat
Content-Type: application/json

{
  "query": "Your question here",
  "conversationId": "optional-conv-id"
}
```

Response:
```json
{
  "success": true,
  "conversationId": "uuid",
  "query": "Your question here",
  "response": "AI-generated response...",
  "retrievedDocuments": [
    {
      "id": "doc-id",
      "title": "Document Title",
      "similarity": 0.85
    }
  ],
  "usage": {
    "input_tokens": 245,
    "output_tokens": 128
  },
  "model": "claude-opus-4-8",
  "timestamp": "2026-07-19T09:16:19.759Z"
}
```

#### Get Conversation History
```bash
GET /api/chat/{conversationId}
```

#### Delete Conversation
```bash
DELETE /api/chat/{conversationId}
```

### Health Check
```bash
GET /health
```

## Configuration Options

Edit `.env` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `ANTHROPIC_API_KEY` | - | **Required** - Claude API key |
| `MODEL_ID` | claude-opus-4-8 | Claude model to use |
| `DB_PATH` | ./data/documents.json | Documents storage path |
| `EMBEDDINGS_PATH` | ./data/embeddings.json | Embeddings storage path |
| `MAX_CONTEXT_LENGTH` | 4000 | Max tokens in context |
| `TOP_K_RESULTS` | 5 | Number of documents to retrieve |
| `MIN_SIMILARITY_SCORE` | 0.3 | Minimum relevance threshold |
| `LOG_LEVEL` | INFO | Logging level (ERROR, WARN, INFO, DEBUG) |

## Common Workflows

### Workflow 1: Basic Q&A

```bash
# 1. Upload a document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Guide",
    "content": "Python is a high-level language. It emphasizes code readability."
  }'

# 2. Ask a question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Python?"
  }'
```

### Workflow 2: Multi-turn Conversation

```bash
# Start conversation with same ID
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "First question",
    "conversationId": "my-chat-1"
  }'

# Follow-up question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Follow-up question",
    "conversationId": "my-chat-1"
  }'

# View entire conversation
curl http://localhost:3000/api/chat/my-chat-1
```

### Workflow 3: Document Management

```bash
# List all documents
curl http://localhost:3000/api/documents

# Update a document (use ID from list)
curl -X PUT http://localhost:3000/api/documents/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "New content"
  }'

# Delete document
curl -X DELETE http://localhost:3000/api/documents/{id}
```

## Running Tests

```bash
npm test
```

Tests cover:
- Embedding calculations
- Document validation
- Conversation management
- Vector similarity

## Troubleshooting

### "ANTHROPIC_API_KEY is not set"

```bash
# Make sure .env file exists and has your key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

### "Cannot find module '@anthropic-ai/sdk'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 is already in use"

```bash
# Use a different port
PORT=3001 npm start

# Or kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID {PID} /F

# On macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### "Cannot read property 'content' of undefined"

Make sure you're using the correct Claude model. Check that your API key has access to the model specified in `.env`.

## Next Steps

1. **Add More Documents**: Build a knowledge base by uploading relevant documents
2. **Customize Embeddings**: Replace simple embeddings with Claude's embedding API
3. **Upgrade Storage**: Move from JSON files to PostgreSQL with pgvector
4. **Add Authentication**: Secure the API with JWT or API keys
5. **Build a UI**: Create a web interface for the chatbot
6. **Deploy**: Push to production (Heroku, AWS, etc.)

## Resources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude Models](https://docs.anthropic.com/en/docs/about-claude/models/overview)
- [RAG Best Practices](https://docs.anthropic.com/en/docs/build-a-chatbot#building-a-chatbot)
- [Node.js Documentation](https://nodejs.org/docs/)

## Support

For issues or questions:
1. Check the [README.md](./README.md) for detailed documentation
2. Review [CLAUDE.md](./CLAUDE.md) for architecture details
3. See [examples/](./examples/) for usage patterns
