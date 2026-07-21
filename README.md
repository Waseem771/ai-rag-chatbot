# AI RAG Chatbot

A retrieval-augmented generation (RAG) chatbot that combines document retrieval with AI-powered responses using Claude API.

## Features

- **Document Management**: Upload and manage documents for retrieval
- **Semantic Search**: Find relevant documents using vector embeddings
- **Context-Aware Responses**: Generate answers based on retrieved documents
- **REST API**: Simple HTTP endpoints for interaction
- **Conversation History**: Track multi-turn conversations

## Project Structure

```
ai-rag-chatbot/
├── src/
│   ├── api/              # Express routes and controllers
│   ├── rag/              # RAG engine core logic
│   ├── models/           # Data models and schemas
│   ├── utils/            # Utility functions
│   ├── scripts/          # One-off scripts (embeddings, etc.)
│   ├── config.js         # Configuration management
│   └── index.js          # Application entry point
├── data/                 # Document storage and embeddings
├── tests/                # Test files
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
└── README.md             # This file
```

## Setup

### 1. Clone and Install

```bash
cd ai-rag-chatbot
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Start the Server

```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Upload Document
```bash
POST /api/documents
Content-Type: application/json

{
  "title": "Document Title",
  "content": "Document content here..."
}
```

### Chat (Query with RAG)
```bash
POST /api/chat
Content-Type: application/json

{
  "query": "Your question here",
  "conversationId": "optional-conversation-id"
}
```

### Get Documents
```bash
GET /api/documents
```

### Delete Document
```bash
DELETE /api/documents/:id
```

## How RAG Works

1. **Document Ingestion**: Documents are stored with their embeddings
2. **Retrieval**: User queries are converted to embeddings and matched against document embeddings
3. **Context Assembly**: Top-K similar documents are retrieved
4. **Generation**: Claude generates a response using the retrieved context

## Configuration

Edit `.env` to customize:

- `PORT`: Server port (default: 3000)
- `ANTHROPIC_API_KEY`: Your Claude API key
- `MODEL_ID`: Claude model to use (default: claude-opus-4-8)
- `TOP_K_RESULTS`: Number of documents to retrieve (default: 5)
- `MIN_SIMILARITY_SCORE`: Minimum similarity threshold (default: 0.3)

## Development

### Run in Watch Mode
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Generate Embeddings
```bash
npm run embeddings
```

## Architecture

### RAG Engine
The RAG engine handles:
- Vector embeddings and similarity search
- Document retrieval and ranking
- Context assembly for the LLM
- Response generation with Claude

### API Layer
Express-based REST API with:
- Document management endpoints
- Chat/query endpoints
- Conversation tracking

## Limitations

- Currently uses simple cosine similarity for retrieval
- Embeddings are computed by Claude API (not fine-tuned)
- In-memory storage (file-based JSON)
- Single-threaded server

## Future Enhancements

- [ ] Database integration (PostgreSQL with pgvector)
- [ ] Hybrid search (keyword + semantic)
- [ ] Multi-modal documents (images, PDFs)
- [ ] Fine-tuned embeddings
- [ ] Caching layer
- [ ] Authentication
- [ ] Rate limiting
- [ ] Web UI

## License

MIT
