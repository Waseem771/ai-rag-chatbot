# 🚀 START HERE - AI RAG Chatbot

**Welcome!** Your AI RAG Chatbot is ready. This file will get you started in 5 minutes.

---

## What You Have 🎉

A complete, production-ready **Retrieval-Augmented Generation chatbot** that:

- 📄 **Uploads & manages documents**
- 🔍 **Searches semantically** using embeddings
- 🧠 **Generates intelligent responses** using Claude AI
- 💬 **Maintains conversations** across multiple queries
- 📡 **Provides REST API** for integration

---

## Quick Start (5 Minutes) 🚀

### 1. Configure Your API Key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
PORT=3000
MODEL_ID=claude-opus-4-8
```

**Get your key**: https://console.anthropic.com

### 2. Start the Server

```bash
npm run dev
```

You should see:
```
🚀 RAG Chatbot server running on http://localhost:3000
Environment: development
Model: claude-opus-4-8
```

### 3. Test It (New Terminal)

```bash
# Upload a document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Node.js Guide",
    "content": "Node.js is a JavaScript runtime. It lets you run JS on servers."
  }'

# Query with RAG
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Node.js?"
  }'
```

You'll get a response with AI-generated answer and source documents.

---

## Next Steps 📶

### Option A: Explore the API (10 minutes)
See all endpoints:
```bash
bash examples/curl-examples.sh
```

### Option B: Run JavaScript Example (5 minutes)
```bash
node examples/basic-usage.js
```

### Option C: Read Documentation
Check [INDEX.md](./INDEX.md) for complete navigation.

---

## Project Structure 📁

```
ai-rag-chatbot/
├── src/                    # Source code
│   ├── api/               # REST API routes
│   ├── rag/               # RAG engine (retrieve + generate)
│   ├── models/            # Data schemas
│   ├── utils/             # Utilities
│   ├── scripts/           # Helper scripts
│   ├── config.js          # Configuration
│   └── index.js           # Entry point
├── tests/                 # Test suite
├── examples/              # Usage examples
├── data/                  # Document storage (auto-created)
├── Documentation/         # Guides and references
├── package.json           # Dependencies
└── .env.example           # Configuration template
```

---

## API Quick Reference 📡

### Upload Document
```bash
POST /api/documents
{
  "title": "My Document",
  "content": "Document content here..."
}
```

### Query with RAG
```bash
POST /api/chat
{
  "query": "Your question here",
  "conversationId": "optional-id"
}
```

### Get Documents
```bash
GET /api/documents
```

### View Conversation
```bash
GET /api/chat/{conversationId}
```

See [QUICKSTART.md](./QUICKSTART.md) for complete API reference.

---

## Key Files 📄

| File | Purpose |
|------|----------|
| **[QUICKSTART.md](./QUICKSTART.md)** | Setup and API reference |
| **[INDEX.md](./INDEX.md)** | Project navigation |
| **[CLAUDE.md](./CLAUDE.md)** | Architecture details |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deploy to production |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Development guide |
| **[examples/](./examples/)** | Working code examples |

---

## Common Tasks 🛠️

### Upload Some Documents
```bash
# Document 1
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Python Guide", "content": "Python is a programming language..."}'

# Document 2
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "JavaScript", "content": "JavaScript runs in browsers..."}'
```

### Ask Questions
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Python?", "conversationId": "conv-1"}'

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about JavaScript", "conversationId": "conv-1"}'
```

### View Conversation
```bash
curl http://localhost:3000/api/chat/conv-1
```

### List All Documents
```bash
curl http://localhost:3000/api/documents
```

---

## Troubleshooting ⚠️

### "ANTHROPIC_API_KEY is not set"
```bash
echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY" > .env
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
PORT=3001 npm run dev
```

### Server won't start
- Check Node.js version: `node --version` (need 18+)
- Verify .env file exists and has API key
- Check error message in console

More help: See [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting)

---

## Available Commands 📲

```bash
# Development
npm run dev              # Start with auto-reload

# Production
npm start                # Start server

# Testing
npm test                 # Run tests

# Utilities
npm run embeddings       # Regenerate embeddings
npm run lint             # Check code style

# Examples
node examples/basic-usage.js    # JavaScript example
bash examples/curl-examples.sh  # cURL examples
```

---

## How RAG Works 🧠

```
1. You ask a question
2. System converts it to a vector (384 dimensions)
3. Finds similar documents using cosine similarity
4. Retrieves top 5 most relevant documents
5. Builds context from those documents
6. Sends question + context to Claude API
7. Claude generates response
8. You get answer + source documents
```

---

## What's Included 💻

✅ **9 source files** (~1,200 lines of code)  
✅ **1 test suite** (~70 test cases)  
✅ **2 examples** (JavaScript + cURL)  
✅ **10 documentation files** (~3,000+ lines)  
✅ **4 configuration files**  
✅ **207 npm packages** installed  

---

## Configuration Options ⚙️

Edit `.env` to customize:

```env
PORT=3000                     # Server port
NODE_ENV=development          # Environment
ANTHROPIC_API_KEY=...         # Your API key (REQUIRED!)
MODEL_ID=claude-opus-4-8     # Claude model to use
TOP_K_RESULTS=5              # Documents to retrieve per query
MIN_SIMILARITY_SCORE=0.3     # Minimum relevance threshold
LOG_LEVEL=INFO               # Logging level
```

---

## Next: Build Your Knowledge Base 📚

1. Think of documents you want to store
2. Upload them using the API
3. Ask questions about them
4. Build on this foundation

Example:
- Company policies
- Product documentation
- Employee handbook
- FAQ documents
- Research papers
- Any text-based knowledge

---

## Deploy to Production 🚢

When ready:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Choose platform (Heroku, AWS, Docker, etc.)
3. Follow deployment guide
4. Update database from JSON to PostgreSQL
5. Add authentication and monitoring

---

## Support & Help 💬

### Documentation
- **Setup**: [QUICKSTART.md](./QUICKSTART.md)
- **Navigation**: [INDEX.md](./INDEX.md)
- **Architecture**: [CLAUDE.md](./CLAUDE.md)
- **Development**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Roadmap**: [TODO.md](./TODO.md)

### Examples
- `examples/basic-usage.js` - Complete JavaScript example
- `examples/curl-examples.sh` - REST API examples

### Resources
- [Anthropic Docs](https://docs.anthropic.com/)
- [Claude Models](https://docs.anthropic.com/en/docs/about-claude/models/overview)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Docs](https://nodejs.org/)

---

## Ready? ✅

1. ✅ Setup `.env` with your API key
2. ✅ Run `npm run dev`
3. ✅ Test with curl or examples
4. ✅ Upload some documents
5. ✅ Ask questions
6. ✅ Explore the features

**Your chatbot is ready!** 🚀

---

**Questions?** Check [INDEX.md](./INDEX.md) for full navigation  
**Need deployment help?** See [DEPLOYMENT.md](./DEPLOYMENT.md)  
**Want to develop?** Read [DEVELOPMENT.md](./DEVELOPMENT.md)  

**Happy chatting!** 🙋
