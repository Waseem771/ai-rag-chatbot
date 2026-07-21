# 🚀 Getting Started with Your AI RAG Chatbot

**Last Updated**: 2026-07-19  
**Version**: 1.0.0  
**Status**: Ready to Use ✅

---

## 📋 Pre-flight Checklist

Before you start, make sure you have:

- ✅ Node.js 18 or higher installed
- ✅ npm or yarn package manager
- ✅ An Anthropic API key (get from https://console.anthropic.com)
- ✅ A text editor or IDE
- ✅ Terminal/command line access

---

## ⚡ 5-Minute Quick Start

### Step 1: Configure Your Environment (1 min)

```bash
# Navigate to project directory
cd ai-rag-chatbot

# Copy the environment template
cp .env.example .env
```

### Step 2: Add Your API Key (1 min)

Edit `.env` and add:

```env
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY_HERE
```

If you don't have an API key:
1. Visit https://console.anthropic.com
2. Create an account
3. Generate an API key
4. Paste it in `.env`

### Step 3: Start the Server (1 min)

```bash
npm run dev
```

You should see:
```
🚀 RAG Chatbot server running on http://localhost:3000
Environment: development
Model: claude-opus-4-8
```

### Step 4: Test It (2 min)

Open another terminal and run:

```bash
# Upload a document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Guide",
    "content": "Welcome to your AI RAG Chatbot! This is a sample document."
  }'

# Query the chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is in the welcome guide?"
  }'
```

**Success!** You should get a response from Claude with the information from your document.

---

## 📚 Next Steps

### Option A: Learn the Basics (15 minutes)

1. Read [START_HERE.md](./START_HERE.md)
2. Explore the API endpoints
3. Try uploading different documents
4. Ask various questions

### Option B: Run the Examples (10 minutes)

```bash
# JavaScript example with full workflow
node examples/basic-usage.js

# Or cURL examples
bash examples/curl-examples.sh
```

### Option C: Understand the Architecture (20 minutes)

1. Read [CLAUDE.md](./CLAUDE.md) - Architecture overview
2. Review [README.md](./README.md) - Feature details
3. Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

---

## 🎯 Common Tasks

### Upload a Document

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Programming",
    "content": "Python is a high-level programming language known for its simplicity and readability. It supports multiple programming paradigms."
  }'
```

### Get All Documents

```bash
curl http://localhost:3000/api/documents
```

### Query with Context

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Python?",
    "conversationId": "my-conversation-1"
  }'
```

### Continue a Conversation

```bash
# First question
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about Python",
    "conversationId": "chat-1"
  }'

# Follow-up question (uses conversation history)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are its uses?",
    "conversationId": "chat-1"
  }'
```

### View Conversation History

```bash
curl http://localhost:3000/api/chat/chat-1
```

---

## 🛠️ Useful Commands

```bash
# Start server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Regenerate embeddings
npm run embeddings

# Check code style
npm run lint

# Run JavaScript example
node examples/basic-usage.js

# Run cURL examples
bash examples/curl-examples.sh
```

---

## ⚙️ Configuration Guide

Edit `.env` to customize behavior:

### Server Configuration
```env
PORT=3000                    # Change server port
NODE_ENV=development         # Set to 'production' for deployment
```

### API Configuration
```env
ANTHROPIC_API_KEY=sk-ant-...  # Your Claude API key (REQUIRED!)
MODEL_ID=claude-opus-4-8      # Which Claude model to use
```

### RAG Configuration
```env
TOP_K_RESULTS=5               # How many documents to retrieve (default: 5)
MIN_SIMILARITY_SCORE=0.3      # Minimum relevance score (default: 0.3)
MAX_CONTEXT_LENGTH=4000       # Max tokens for context (default: 4000)
```

### Logging
```env
LOG_LEVEL=INFO                # Options: ERROR, WARN, INFO, DEBUG
```

---

## 🐛 Troubleshooting

### Problem: "ANTHROPIC_API_KEY is not set"

**Solution**: Make sure your `.env` file exists and contains your API key.

```bash
# Check if .env exists
ls -la .env

# If not, create it
cp .env.example .env

# Add your key
echo "ANTHROPIC_API_KEY=sk-ant-YOUR_KEY" >> .env
```

### Problem: "Cannot find module '@anthropic-ai/sdk'"

**Solution**: Reinstall dependencies.

```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Port 3000 already in use"

**Solution**: Use a different port.

```bash
PORT=3001 npm run dev
```

Or kill the process using port 3000:

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Problem: Server won't start

**Solution**: Check your setup.

```bash
# Verify Node.js version (need 18+)
node --version

# Verify npm
npm --version

# Check if .env file exists and has API key
cat .env

# Try reinstalling
rm -rf node_modules
npm install
```

### Problem: "Cannot read property 'content' of undefined"

**Solution**: Make sure you're sending valid JSON with required fields.

```bash
# ✅ Correct
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "content": "Sample content"}'

# ❌ Wrong (missing Content-Type header)
curl -X POST http://localhost:3000/api/documents \
  -d '{"title": "Test", "content": "Sample content"}'
```

---

## 📖 Documentation Map

```
Getting Started
├── START_HERE.md ........................ 5-minute intro
├── QUICKSTART.md ........................ Complete setup guide
├── GETTING_STARTED.md .................. This file
│
Learning
├── README.md ........................... Features & usage
├── CLAUDE.md ........................... Architecture
├── INDEX.md ............................ Full navigation
│
Development
├── DEVELOPMENT.md ...................... Dev guidelines
├── examples/ ........................... Code examples
├── tests/ ............................. Test suite
│
Deployment & Production
├── DEPLOYMENT.md ....................... Deploy guide
├── FINAL_REPORT.md ..................... Project summary
├── TODO.md ............................. Roadmap
```

---

## 🎯 Your First Project

Let's build a simple knowledge base:

### 1. Prepare Your Documents

Create a file `my-docs.txt`:

```
Document 1: Node.js
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.
It allows developers to use JavaScript for server-side programming.

Document 2: Express.js
Express is a minimal and flexible Node.js web application framework.
It provides a robust set of features for web and mobile applications.

Document 3: REST API
REST stands for Representational State Transfer.
It's an architectural style for designing networked applications.
```

### 2. Upload Documents

```bash
# Document 1
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Node.js",
    "content": "Node.js is a JavaScript runtime built on Chrome V8 JavaScript engine. It allows developers to use JavaScript for server-side programming."
  }'

# Document 2
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Express.js",
    "content": "Express is a minimal and flexible Node.js web application framework. It provides a robust set of features for web and mobile applications."
  }'

# Document 3
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "REST API",
    "content": "REST stands for Representational State Transfer. It is an architectural style for designing networked applications."
  }'
```

### 3. Ask Questions

```bash
# Question 1
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Node.js?"}'

# Question 2
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain Express.js"}'

# Question 3
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is REST API?"}'
```

---

## 🚀 Ready for Production?

When you're ready to deploy:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Choose your platform (Heroku, AWS, Docker, etc.)
3. Follow the deployment guide
4. Update configuration for production
5. Setup monitoring and logging

---

## 💡 Tips & Best Practices

### Document Upload
- Keep documents focused on a single topic
- Use clear, descriptive titles
- Include metadata for better organization
- Split large documents into smaller chunks

### Querying
- Ask specific questions for better results
- Use conversationId to maintain context
- Review retrieved documents in responses
- Adjust TOP_K_RESULTS if needed

### Development
- Use `npm run dev` for development (auto-reload)
- Run `npm test` before making changes
- Check logs for debugging
- Review [DEVELOPMENT.md](./DEVELOPMENT.md) for patterns

---

## 📞 Getting Help

### Documentation
- **Quick Questions**: Check [INDEX.md](./INDEX.md)
- **Setup Issues**: See [QUICKSTART.md](./QUICKSTART.md#troubleshooting)
- **Architecture**: Read [CLAUDE.md](./CLAUDE.md)
- **Deployment**: Review [DEPLOYMENT.md](./DEPLOYMENT.md)

### Examples
- JavaScript: `examples/basic-usage.js`
- cURL: `examples/curl-examples.sh`

### External Resources
- [Anthropic Docs](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## 🎓 Learning Path

### Beginner (30 minutes)
1. This file (5 min)
2. [START_HERE.md](./START_HERE.md) (5 min)
3. Upload a document (5 min)
4. Ask a question (5 min)
5. Review the response (5 min)

### Intermediate (1 hour)
1. [QUICKSTART.md](./QUICKSTART.md) (20 min)
2. [README.md](./README.md) (20 min)
3. Run `examples/basic-usage.js` (10 min)
4. Explore the API (10 min)

### Advanced (2 hours)
1. [CLAUDE.md](./CLAUDE.md) - Architecture (30 min)
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Dev guide (40 min)
3. Review source code (30 min)
4. Make custom changes (20 min)

---

## ✅ Success Checklist

You've successfully set up your chatbot when:

- ✅ Server starts without errors
- ✅ Can upload documents
- ✅ Can query with responses
- ✅ Get source documents in response
- ✅ Can maintain conversations
- ✅ All tests pass

---

## 🎉 You're Ready!

Congratulations! Your AI RAG Chatbot is ready to use.

### Next Steps

1. **Immediate**: `npm run dev` and start testing
2. **Short-term**: Build your knowledge base
3. **Medium-term**: Customize and extend
4. **Long-term**: Deploy to production

---

**Happy chatting!** 🚀

**Version**: 1.0.0  
**Last Updated**: 2026-07-19  
**Status**: ✅ Ready to Use
