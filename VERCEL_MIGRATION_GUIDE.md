# Vercel Migration - Detailed Implementation Guide

This document provides step-by-step code changes to support both file-based storage (local) and PostgreSQL (Vercel).

## Architecture: Dual Storage Support

The app will auto-detect storage mode:
- **Local development** (no `DATABASE_URL`): Use file-based storage
- **Vercel production** (`DATABASE_URL` set): Use PostgreSQL

## Changes Required

### 1. Update `src/index.js`

Replace the initialization to support both storages:

```javascript
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import documentRoutes from './api/routes/documents.js';
import chatRoutes from './api/routes/chat.js';
import { initializeDataDirectory } from './utils/storage.js';
import { initializePostgres } from './storage/postgres.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize storage (file or database)
const usePostgres = !!process.env.DATABASE_URL;
if (usePostgres) {
  console.log('🗄️  Initializing PostgreSQL storage...');
  await initializePostgres();
} else {
  console.log('📄 Initializing file-based storage...');
  await initializeDataDirectory();
}

// API Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    storage: usePostgres ? 'postgresql' : 'file',
    timestamp: new Date().toISOString() 
  });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🤖 Welcome to AI RAG Chatbot!',
    version: '3.1.0',
    status: 'running',
    storage: usePostgres ? 'PostgreSQL' : 'File-based',
    api: 'Groq (Free)',
    features: {
      fileUpload: 'Supports PDF, Word, and Text files',
      embedding: 'Automatic document embedding',
      semanticSearch: 'Find relevant documents',
      chat: 'Multi-turn conversations'
    },
    endpoints: {
      documents: {
        create: 'POST /api/documents (supports file upload)',
        list: 'GET /api/documents',
        get: 'GET /api/documents/:id',
        update: 'PUT /api/documents/:id',
        delete: 'DELETE /api/documents/:id'
      },
      chat: {
        query: 'POST /api/chat',
        history: 'GET /api/chat/:conversationId',
        delete: 'DELETE /api/chat/:conversationId'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 RAG Chatbot v3.1.0 running on http://localhost:${config.port}`);
  console.log(`🌐 Open http://localhost:${config.port} in your browser`);
  console.log(`📁 File upload: PDF, Word (.docx), Text files supported`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Model: ${config.groqModel}`);
  console.log(`Storage: ${usePostgres ? 'PostgreSQL' : 'File-based'}`);
});

export default app;
```

### 2. Create Storage Factory (`src/storage/factory.js`)

Create an abstraction layer that returns the appropriate storage:

```javascript
import * as fileStorage from '../utils/storage.js';
import * as postgresStorage from './postgres.js';

const usePostgres = !!process.env.DATABASE_URL;

/**
 * Storage factory - returns appropriate storage adapter
 */
const storage = usePostgres ? postgresStorage : fileStorage;

export const {
  loadDocuments,
  saveDocuments,
  loadEmbeddings,
  saveEmbeddings,
  saveDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  saveEmbedding,
  getEmbedding,
  deleteEmbedding,
  saveConversation,
  addMessage,
  getConversationMessages,
  deleteConversation
} = storage;

export { usePostgres };
```

### 3. Update `src/api/routes/documents.js`

Replace document route handlers to use the storage factory:

```javascript
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as storage from '../../storage/factory.js';
import { createDocument, validateDocument } from '../../models/document.js';
import { simpleEmbedding } from '../../utils/embeddings.js';
import { upload } from '../../utils/fileUpload.js';
import { extractTextFromFile, getFileInfo } from '../../utils/fileExtractor.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * POST /api/documents - Upload a new document (text or file)
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    let title = req.body.title;
    let content = '';

    // If file is uploaded, extract text from it
    if (req.file) {
      try {
        const fileInfo = getFileInfo(req.file.path);
        title = title || fileInfo.name.replace(fileInfo.type, '').trim();
        
        console.log('=== FILE UPLOAD DEBUG ===');
        console.log('Original filename:', req.file.originalname);
        console.log('File path:', req.file.path);
        console.log('File mimetype:', req.file.mimetype);
        console.log('File size:', req.file.size);
        
        const ext = path.extname(req.file.path).toLowerCase();
        console.log('Detected extension from path:', ext);
        
        const extFromOriginal = path.extname(req.file.originalname).toLowerCase();
        console.log('Extension from originalname:', extFromOriginal);
        console.log('======================');
        
        content = await extractTextFromFile(req.file.path);
        
        console.log('Extracted content length:', content.length);
        console.log('Extracted content preview:', content.substring(0, 100));
        
        // Delete the uploaded file after extraction
        fs.unlinkSync(req.file.path);
      } catch (error) {
        // Clean up the file if extraction failed
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw new Error(`File processing failed: ${error.message}`);
      }
    } else {
      // Use text from request body
      content = req.body.content;
    }

    // Validate input
    const validation = validateDocument({ title, content });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Create document
    const doc = createDocument(title, content, req.body.metadata);

    // Generate embedding
    const embedding = simpleEmbedding(`${doc.title} ${doc.content}`);

    // Save document using appropriate storage
    if (storage.usePostgres) {
      // PostgreSQL: save directly
      await storage.saveDocument(doc);
      await storage.saveEmbedding(doc.id, embedding);
    } else {
      // File storage: load, update, save all documents
      const documents = await storage.loadDocuments();
      documents.push(doc);
      await storage.saveDocuments(documents);

      const embeddings = await storage.loadEmbeddings();
      embeddings[doc.id] = embedding;
      await storage.saveEmbeddings(embeddings);
    }

    res.status(201).json({
      success: true,
      document: doc,
      message: `Document "${title}" uploaded and processed successfully`,
      stats: {
        fileSize: req.file ? req.file.size : 0,
        contentLength: content.length,
        wordCount: content.split(/\s+/).length
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    next(error);
  }
});

/**
 * GET /api/documents - Get all documents
 */
router.get('/', async (req, res, next) => {
  try {
    const documents = await storage.loadDocuments();
    res.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/:id - Get a specific document
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let doc;
    if (storage.usePostgres) {
      doc = await storage.getDocument(id);
    } else {
      const documents = await storage.loadDocuments();
      doc = documents.find(d => d.id === id);
    }

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      success: true,
      document: doc,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/documents/:id - Delete a document
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (storage.usePostgres) {
      // PostgreSQL: cascading delete handles embedding
      await storage.deleteDocument(id);
    } else {
      // File storage: manual delete
      const documents = await storage.loadDocuments();
      const index = documents.findIndex(d => d.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Document not found' });
      }

      documents.splice(index, 1);
      await storage.saveDocuments(documents);

      const embeddings = await storage.loadEmbeddings();
      delete embeddings[id];
      await storage.saveEmbeddings(embeddings);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/documents/:id - Update a document
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, metadata } = req.body;

    // Validate input
    const validation = validateDocument({ title, content });
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const updates = {
      title: title.trim(),
      content: content.trim(),
      metadata: metadata || {},
      updatedAt: new Date().toISOString(),
    };

    let updatedDoc;
    if (storage.usePostgres) {
      updatedDoc = await storage.updateDocument(id, updates);
    } else {
      const documents = await storage.loadDocuments();
      const docIndex = documents.findIndex(d => d.id === id);

      if (docIndex === -1) {
        return res.status(404).json({ error: 'Document not found' });
      }

      documents[docIndex] = {
        ...documents[docIndex],
        ...updates,
      };
      await storage.saveDocuments(documents);
      updatedDoc = documents[docIndex];
    }

    // Update embedding
    const embedding = simpleEmbedding(`${updates.title} ${updates.content}`);
    await storage.saveEmbedding(id, embedding);

    res.json({
      success: true,
      document: updatedDoc,
      message: 'Document updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 4. Update `src/api/routes/chat.js`

Support database-backed conversations:

```javascript
import express from 'express';
import { retrieveDocuments, buildContext } from '../../rag/retriever.js';
import { generateResponse } from '../../rag/generator.js';
import { createConversation, addMessageToConversation, getConversationHistory } from '../../models/conversation.js';
import * as storage from '../../storage/factory.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory conversation storage (for file-based mode only)
const conversations = new Map();

/**
 * POST /api/chat - Send a message and get a response
 */
router.post('/', async (req, res, next) => {
  try {
    const { query, conversationId } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Query is required and must be a non-empty string',
      });
    }

    let conversation;
    const newConvId = conversationId || uuidv4();

    if (storage.usePostgres) {
      // Database-backed conversation
      conversation = await storage.saveConversation(newConvId);
    } else {
      // In-memory conversation
      conversation = conversations.get(newConvId) || createConversation(newConvId);
    }

    // Retrieve relevant documents
    const retrievedDocs = await retrieveDocuments(query);

    // Build context from retrieved documents
    const context = buildContext(retrievedDocs);

    // Get conversation history
    let history;
    if (storage.usePostgres) {
      const messages = await storage.getConversationMessages(conversation.id);
      history = messages.map(m => ({ role: m.role, content: m.content }));
    } else {
      history = getConversationHistory(conversation);
    }

    // Generate response
    const result = await generateResponse(query, context, history);

    // Add messages to conversation
    if (storage.usePostgres) {
      await storage.addMessage(conversation.id, 'user', query);
      await storage.addMessage(conversation.id, 'assistant', result.response);
    } else {
      addMessageToConversation(conversation, 'user', query);
      addMessageToConversation(conversation, 'assistant', result.response);
      conversations.set(conversation.id, conversation);
    }

    res.json({
      success: true,
      conversationId: conversation.id,
      query,
      response: result.response,
      retrievedDocuments: retrievedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity,
      })),
      usage: result.usage,
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/:conversationId - Get conversation history
 */
router.get('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    let messages;
    if (storage.usePostgres) {
      messages = await storage.getConversationMessages(conversationId);
    } else {
      const conversation = conversations.get(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      messages = conversation.messages || [];
    }

    res.json({
      success: true,
      conversationId,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/chat/:conversationId - Delete conversation
 */
router.delete('/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (storage.usePostgres) {
      await storage.deleteConversation(conversationId);
    } else {
      if (!conversations.has(conversationId)) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      conversations.delete(conversationId);
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Installation & Deployment

### Step 1: Install Dependencies

```bash
npm install pg pg-vector
```

### Step 2: Update package.json

Ensure these are in `dependencies`:
```json
"pg": "^8.11.0",
"pg-vector": "^0.1.0"
```

### Step 3: Local Testing with PostgreSQL

To test locally with PostgreSQL:

```bash
# Start a local Postgres (using Docker)
docker run --name postgres-rag -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:16

# Set connection string
export DATABASE_URL="postgresql://postgres:password@localhost:5432/rag_chatbot"

# Run app
npm run dev
```

### Step 4: Deploy to Vercel

1. Set `DATABASE_URL` in Vercel Environment Variables
2. Push code to GitHub/GitLab
3. Vercel auto-deploys

```bash
git add .
git commit -m "feat: add PostgreSQL storage for Vercel deployment"
git push origin main
```

## Rollback & Safety

If something breaks:

1. Don't set `DATABASE_URL` in Vercel env
2. App auto-detects and uses file storage (local only)
3. Fix code locally, test with both modes
4. Redeploy with `DATABASE_URL` when ready

## Testing Checklist

- [ ] Local app works with file storage (no `DATABASE_URL`)
- [ ] Local app works with PostgreSQL (`DATABASE_URL` set)
- [ ] Documents upload successfully
- [ ] Documents persist between requests
- [ ] Chat queries work with retrieved documents
- [ ] Conversation history persists
- [ ] Delete operations work in both modes
- [ ] Vercel deployment succeeds
- [ ] Vercel app uploads documents
- [ ] Vercel app performs chat queries

