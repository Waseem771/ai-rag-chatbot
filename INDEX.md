# AI RAG Chatbot - Complete Project Index

## 📚 Documentation Map

### Getting Started
- **[QUICKSTART.md](./QUICKSTART.md)** - Start here! Step-by-step setup guide
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - What's included and next steps
- **[README.md](./README.md)** - Full feature documentation

### Understanding the Project
- **[CLAUDE.md](./CLAUDE.md)** - Architecture, design, and implementation details
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guidelines and patterns
- **[TODO.md](./TODO.md)** - Roadmap and planned features

### Deployment & Operations
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[examples/curl-examples.sh](./examples/curl-examples.sh)** - cURL examples
- **[examples/basic-usage.js](./examples/basic-usage.js)** - JavaScript example

---

## 🗂️ Project Structure

### Core Application
```
src/
├── index.js                 # Application entry point
├── config.js                # Configuration loader
├── api/                     # REST API layer
│   ├── routes/
│   │   ├── documents.js     # Document CRUD endpoints
│   │   └── chat.js          # Chat/RAG endpoints
│   └── middleware/
│       └── errorHandler.js  # Error handling
├── rag/                     # RAG engine
│   ├── retriever.js         # Document retrieval logic
│   └── generator.js         # Response generation with Claude
├── models/                  # Data models
│   ├── document.js          # Document schema
│   └── conversation.js      # Conversation schema
├── utils/                   # Utilities
│   ├── embeddings.js        # Vector operations
│   ├── storage.js           # File I/O
│   └── logger.js            # Logging utility
└── scripts/
    └── generateEmbeddings.js # Embedding regeneration
```

### Tests & Examples
```
tests/
├── api.test.js              # API unit tests

examples/
├── basic-usage.js           # Complete example
└── curl-examples.sh         # cURL examples
```

### Configuration
```
.env.example                 # Environment template
.env                         # Your local configuration (gitignored)
package.json               # Dependencies
```

### Data Storage (Auto-created)
```
data/
├── documents.json           # Document storage
└── embeddings.json          # Vector embeddings
```

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Configure
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# 2. Start server
npm run dev

# 3. Test (in another terminal)
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sample",
    "content": "Node.js is a JavaScript runtime."
  }'

# 4. Query
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Node.js?"}'
```

---

## 📋 API Reference

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents` | Create document |
| GET | `/api/documents` | List documents |
| GET | `/api/documents/:id` | Get document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |

### Chat (RAG)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Query with RAG |
| GET | `/api/chat/:conversationId` | Get conversation |
| DELETE | `/api/chat/:conversationId` | Delete conversation |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health |

See [QUICKSTART.md](./QUICKSTART.md#api-endpoints) for complete endpoint documentation.

---

## 🛠️ Development

### Install & Setup
```bash
npm install                 # Install dependencies
cp .env.example .env       # Setup environment
```

### Running
```bash
npm run dev                # Development (auto-reload)
npm start                  # Production
npm test                   # Run tests
npm run lint               # Check code style
npm run embeddings         # Regenerate embeddings
```

### Examples
```bash
node examples/basic-usage.js       # Run JavaScript example
bash examples/curl-examples.sh     # Run cURL examples
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide.

---

## 🏗️ Architecture Overview

### RAG Pipeline Flow
```
User Query
    ↓
Generate Embedding (Simple Hash or Claude API)
    ↓
Find Similar Documents (Cosine Similarity)
    ↓
Retrieve Top-K Documents
    ↓
Build Context String
    ↓
Send to Claude with Context
    ↓
Generate Response
    ↓
Return Response + Source Documents
```

### System Components
```
┌─────────────────────────────────────┐
│         Express Server              │
│  (HTTP API Layer)                   │
└──────────┬──────────────────────────┘
           │
      ┌────┴────┐
      │          │
┌─────▼──┐  ┌───▼──────┐
│Documents│  │Chat/Query│
│Routes   │  │Routes    │
└─────┬──┘  └───┬──────┘
      │         │
      └────┬────┘
           │
      ┌────▼────────────────┐
      │   RAG Engine        │
      ├─────────────────────┤
      │ Retriever           │
      │ - Load docs         │
      │ - Generate query    │
      │   embedding         │
      │ - Rank by           │
      │   similarity        │
      └────┬───────────┬────┘
           │           │
      ┌────▼───┐  ┌───▼──────────┐
      │Generator│  │Storage Layer │
      │         │  │              │
      │Send to  │  │File I/O      │
      │Claude  │  │(JSON)        │
      │API     │  │              │
      └────────┘  └──────────────┘
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture.

---

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# API
ANTHROPIC_API_KEY=sk-ant-...
MODEL_ID=claude-opus-4-8

# Storage
DB_PATH=./data/documents.json
EMBEDDINGS_PATH=./data/embeddings.json

# RAG
MAX_CONTEXT_LENGTH=4000
TOP_K_RESULTS=5
MIN_SIMILARITY_SCORE=0.3

# Logging
LOG_LEVEL=INFO
```

See [QUICKSTART.md#configuration-options](./QUICKSTART.md#configuration-options) for details.

---

## 📦 Dependencies

### Production
- `@anthropic-ai/sdk` - Claude API client
- `express` - Web framework
- `dotenv` - Environment configuration
- `uuid` - Unique ID generation
- `cors` - Cross-origin support
- `body-parser` - Request parsing

### Development
- `eslint` - Code linting
- `@types/node` - TypeScript types

---

## 🧪 Testing

### Test Coverage
- Embedding calculations
- Document validation
- Conversation management
- Vector operations

### Run Tests
```bash
npm test                           # All tests
node --test tests/api.test.js     # Specific test
```

See [DEVELOPMENT.md#testing-guidelines](./DEVELOPMENT.md#testing-guidelines) for details.

---

## 🚢 Deployment

### Quick Deploy Options
- **Heroku**: See [DEPLOYMENT.md#heroku-deployment](./DEPLOYMENT.md#heroku-deployment)
- **AWS**: See [DEPLOYMENT.md#aws-deployment](./DEPLOYMENT.md#aws-deployment)
- **Docker**: See [DEPLOYMENT.md#docker-deployment](./DEPLOYMENT.md#docker-deployment)

### Pre-deployment Checklist
- ✅ Set `NODE_ENV=production`
- ✅ Configure `ANTHROPIC_API_KEY`
- ✅ Setup database (migrate from JSON to PostgreSQL)
- ✅ Configure logging and monitoring
- ✅ Setup SSL/HTTPS
- ✅ Enable rate limiting
- ✅ Configure CORS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

---

## 📈 Performance

### Current Limitations
- JSON file storage (not scalable)
- Simple hash-based embeddings (low semantic quality)
- In-memory conversations (lost on restart)
- Single server (no clustering)

### Optimization Path
1. **v1.2**: Migrate to PostgreSQL + pgvector
2. **v2.0**: Use Claude embedding API
3. **v2.0**: Add caching and Redis
4. **v3.0**: Multi-server deployment with load balancing

See [TODO.md](./TODO.md) for roadmap.

---

## 🐛 Troubleshooting

### Common Issues

**"ANTHROPIC_API_KEY is not set"**
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

**"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**
```bash
PORT=3001 npm start
```

See [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting) for more solutions.

---

## 📞 Getting Help

1. **Quick Questions**: Check [QUICKSTART.md](./QUICKSTART.md)
2. **Architecture**: Read [CLAUDE.md](./CLAUDE.md)
3. **Development**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
4. **Deployment**: Review [DEPLOYMENT.md](./DEPLOYMENT.md)
5. **API Docs**: Check endpoint examples in [examples/](./examples/)

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Read [QUICKSTART.md](./QUICKSTART.md)
2. ✅ Set up `.env` with your API key
3. ✅ Run `npm run dev`
4. ✅ Test with example queries

### Short-term (This Week)
- Build a collection of documents
- Test different query types
- Review conversation history
- Experiment with configuration

### Medium-term (This Month)
- Build a web UI
- Migrate to PostgreSQL
- Setup monitoring
- Prepare for deployment

### Long-term (Ongoing)
- Improve search accuracy
- Add advanced features
- Scale to production
- Build community

See [TODO.md](./TODO.md) for complete roadmap.

---

## 📄 License

MIT License - Free to use and modify!

---

## 🙏 Credits

Built with:
- [Anthropic Claude](https://www.anthropic.com/)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)

---

**Last Updated**: 2026-07-19  
**Version**: 1.0.0
