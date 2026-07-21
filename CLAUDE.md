# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AI RAG Chatbot is a Node.js-based Retrieval-Augmented Generation chatbot that combines document retrieval with Groq API for intelligent question answering. It features file upload support (PDF, DOCX, TXT), semantic search via cosine similarity on hash-based embeddings, and multi-turn conversations.

## Quick Commands

```bash
# Development
npm install                 # Install dependencies
npm run dev                 # Run with file watcher
npm start                   # Start server (production mode)
npm test                    # Run all tests
npm run lint                # Run ESLint

# Database/Data
npm run embeddings          # Regenerate embeddings for all documents
```

## Project Architecture

### Core Layers

**1. API Layer** (`src/api/routes/`)
- `documents.js`: CRUD endpoints for document management (POST/GET/PUT/DELETE)
- `chat.js`: Query endpoints with RAG-augmented responses
- File upload handling via `multer` → `fileExtractor` → storage

**2. RAG Engine** (`src/rag/`)
- `retriever.js`: Semantic search via cosine similarity on embeddings
- `generator.js`: Groq API integration for response generation

**3. Storage Layer** (`src/utils/storage.js`)
- **CRITICAL LIMITATION**: File-based JSON storage (`data/documents.json`, `data/embeddings.json`)
- Not suitable for serverless (Vercel) — files are ephemeral and lost on cold start
- See **Vercel Deployment Issues** section below

**4. Utilities** (`src/utils/`)
- `embeddings.js`: 384-dim hash-based embedding (deterministic, not semantically sophisticated)
- `fileExtractor.js`: Text extraction (supports DOCX via `mammoth`, TXT, no PDF)
- `fileUpload.js`: Multer disk storage to `./uploads` (also ephemeral on Vercel)
- `logger.js`: Logging utilities

### Data Models

- `document.js`: Document creation/validation (id, title, content, metadata, timestamps)
- `conversation.js`: Conversation tracking (in-memory; lost on restart)

## Configuration

Environment variables (see `.env.example`):
- `GROQ_API_KEY`: Free API key from https://console.groq.com (REQUIRED)
- `GROQ_MODEL`: Model choice (default: `mixtral-8x7b-32768`)
- `PORT`: Server port (default: 3000)
- `TOP_K_RESULTS`: Documents to retrieve per query (default: 5)
- `MIN_SIMILARITY_SCORE`: Relevance threshold 0.0–1.0 (default: 0.3)
- `DB_PATH`, `EMBEDDINGS_PATH`: Storage paths (ignored on Vercel—see below)

## API Endpoints

### Documents
- `POST /api/documents` — Upload document or submit text; supports multipart file upload
- `GET /api/documents` — List all documents with count
- `GET /api/documents/:id` — Fetch single document
- `PUT /api/documents/:id` — Update title/content/metadata
- `DELETE /api/documents/:id` — Delete document and embedding

### Chat
- `POST /api/chat` — Query with RAG context (returns conversationId, messages, context used)
- `GET /api/chat/:conversationId` — Retrieve conversation history
- `DELETE /api/chat/:conversationId` — Clear conversation

### Health
- `GET /health` — Server status
- `GET /api` — API documentation and feature list

## Storage & Persistence

### Local Development
- Documents and embeddings stored as JSON in `data/` directory
- Uploaded files temporarily stored in `uploads/` (deleted after extraction)
- Works as-is for local development

### Vercel Production — **BROKEN (Ephemeral Filesystem)**
**Problem**: Vercel's serverless functions have an ephemeral filesystem. Any files written to disk are lost when the function terminates. Document uploads and embeddings written to `data/` are immediately lost, causing:
- ❌ "Error uploading" failures on file upload
- ❌ Subsequent queries return no documents (empty database)
- ❌ Cold starts reset state

**Solution (TODO)**: 
1. Replace file-based storage with **PostgreSQL + pgvector** for persistent, production-grade storage
2. Configure `DB_PATH` and `EMBEDDINGS_PATH` to point to database instead of files, OR create a new `src/storage/postgres.js` adapter
3. Alternatively, use cloud storage (AWS S3, Google Cloud Storage) for documents and a database for metadata/embeddings
4. See "Future Improvements" section

## Common Tasks

### Adding a New Document Field
1. Update `src/models/document.js` validation schema
2. Update `src/api/routes/documents.js` to accept the field in POST/PUT handlers
3. Update `src/utils/storage.js` or database adapter if schema requires migration

### Changing Embedding Strategy
1. Modify `src/utils/embeddings.js` (`simpleEmbedding()` function)
2. Regenerate all embeddings: `npm run embeddings`
3. Note: Hash-based embeddings are deterministic—changing the algorithm breaks existing embeddings

### Debugging Upload Failures
1. Check `console.log` statements in `src/api/routes/documents.js` (lines 27–43)
2. Verify `GROQ_API_KEY` is set and valid
3. On Vercel: **This is almost certainly the file persistence issue** — see Vercel Production section above

## Testing

Tests use Node's built-in test runner:

```bash
npm test                    # Run all .test.js files in src/ and tests/
node --test src/**/*.test.js # Run specific tests
```

Test files cover:
- Embedding calculations (similarity, distance)
- Document validation
- Conversation management

## Limitations & Known Issues

1. **Hash-based embeddings** are deterministic but not semantically meaningful (not trained on language)
2. **Conversation state is in-memory** — lost on server restart
3. **File extraction**: PDF support disabled; DOCX via `mammoth`; no image/multi-modal support
4. **No authentication or rate limiting** — all endpoints public
5. **File-based storage incompatible with Vercel** — see above
6. **Single-threaded server** — no horizontal scaling

## Future Improvements

- [ ] PostgreSQL + pgvector for persistent, scalable storage
- [ ] Groq embedding API for semantic (non-hash) embeddings
- [ ] Hybrid search (keyword + semantic)
- [ ] PDF support via `pdf-parse` or `pdfjs-dist`
- [ ] Document chunking for large files
- [ ] Web UI dashboard
- [ ] Authentication (JWT/OAuth)
- [ ] Rate limiting and quota management
- [ ] Conversation persistence to database
- [ ] Caching layer for frequent queries
- [ ] Monitoring and structured logging

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- Node 18+ recommended
- Requires ANTHROPIC_API_KEY for full functionality
- Tests use Node's built-in test runner (no external framework)
