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

// Initialize storage on first request
let storageInitialized = false;

app.use(async (req, res, next) => {
  if (!storageInitialized) {
    try {
      console.log(`\n🔧 Storage Mode: ${config.storageMode.toUpperCase()}`);
      if (config.useDatabase) {
        console.log('🗄️  Initializing PostgreSQL storage...');
        try {
          await initializePostgres();
        } catch (error) {
          console.warn('⚠️  PostgreSQL initialization failed:', error.message);
          console.warn('Falling back to file-based storage...');
          await initializeDataDirectory();
        }
      } else {
        console.log('📄 Initializing file-based storage...');
        await initializeDataDirectory();
      }
      storageInitialized = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      return res.status(500).json({ error: 'Storage initialization failed' });
    }
  }
  next();
});

// API Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: config.storageMode,
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
    storage: config.useDatabase ? 'PostgreSQL' : 'File-based',
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

// Start server only in local development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.port, () => {
    console.log(`\n🚀 RAG Chatbot v3.1.0 running on http://localhost:${config.port}`);
    console.log(`🌐 Open http://localhost:${config.port} in your browser`);
    console.log(`📁 File upload: PDF, Word (.docx), Text files supported`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Model: ${config.groqModel}`);
    console.log(`Storage: ${config.useDatabase ? 'PostgreSQL' : 'File-based'}\n`);
  });
}

export default app;
