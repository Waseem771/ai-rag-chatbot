# Development Guide

Guidelines for developing and extending the RAG chatbot.

## Code Structure Principles

### Modular Organization
- Each module has a single responsibility
- Clear separation between API, RAG logic, and storage
- Utilities are reusable and self-contained

### File Organization

```
src/
├── api/              # HTTP request handling
│   ├── routes/       # Route handlers
│   └── middleware/   # Express middleware
├── rag/              # Core RAG logic
├── models/           # Data schemas and validation
├── utils/            # Helper functions
├── scripts/          # One-off scripts
└── config.js         # Configuration loading
```

## Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy and edit .env
cp .env.example .env
# Add ANTHROPIC_API_KEY
```

### 2. Start Development Server

```bash
# Auto-reloading server
npm run dev

# This watches src/ and restarts on changes
```

### 3. Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test tests/api.test.js
```

### 4. Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npx eslint --fix src/
```

## Adding New Features

### Example: Adding a New API Endpoint

#### 1. Create Route Handler

```javascript
// src/api/routes/search.js
import express from 'express';

const router = express.Router();

router.post('/advanced', async (req, res, next) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### 2. Register Route in Main App

```javascript
// src/index.js
import searchRoutes from './api/routes/search.js';

app.use('/api/search', searchRoutes);
```

#### 3. Add Tests

```javascript
// tests/search.test.js
import test from 'node:test';
import assert from 'node:assert';

test('search endpoint', () => {
  // Test implementation
});
```

### Example: Enhancing the Embedding System

#### Current (Simple Hash-Based)
```javascript
// src/utils/embeddings.js
export function simpleEmbedding(text) {
  // Hash-based embedding
}
```

#### Enhanced (Using Claude API)
```javascript
// src/utils/embeddings.js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function claudeEmbedding(text) {
  const response = await client.embeddings.create({
    model: 'claude-embedding-1',
    input: text,
  });
  return response.embedding;
}
```

## Testing Guidelines

### Unit Tests

```javascript
import test from 'node:test';
import assert from 'node:assert';
import { myFunction } from '../src/utils/myutil.js';

test('myFunction works correctly', () => {
  const result = myFunction('input');
  assert.strictEqual(result, 'expected');
});
```

### Integration Tests

```javascript
test('API endpoint returns correct response', async () => {
  const response = await fetch('http://localhost:3000/api/documents');
  const data = await response.json();
  assert(data.success);
  assert(Array.isArray(data.documents));
});
```

### Running Tests

```bash
# All tests
npm test

# Specific test file
node --test tests/api.test.js

# With coverage (using c8)
npm install -D c8
c8 node --test tests/**/*.test.js
```

## Database Considerations

### Current: JSON File Storage
- ✅ Simple, no setup required
- ❌ Not scalable
- ❌ Conversations lost on restart
- ❌ No concurrent write support

### Upgrade Path: PostgreSQL + pgvector

#### 1. Install Dependencies

```bash
npm install pg
```

#### 2. Create New Storage Layer

```javascript
// src/utils/pgStorage.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveDocument(doc) {
  const query = `
    INSERT INTO documents (id, title, content, created_at)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [doc.id, doc.title, doc.content, new Date()]);
}
```

#### 3. Create Database Schema

```sql
-- Initialize pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Embeddings with vector type
CREATE TABLE embeddings (
  document_id UUID PRIMARY KEY REFERENCES documents(id),
  embedding vector(384),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  messages JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Performance Optimization

### Caching

```javascript
// src/utils/cache.js
const cache = new Map();
const TTL = 60000; // 1 minute

export function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function setCached(key, value) {
  cache.set(key, {
    value,
    expiry: Date.now() + TTL,
  });
}
```

### Batch Operations

```javascript
// Process multiple documents efficiently
export async function batchGenerateEmbeddings(documents) {
  const chunks = chunk(documents, 10);
  for (const batch of chunks) {
    await Promise.all(
      batch.map(doc => generateEmbedding(doc))
    );
  }
}
```

## Security Considerations

### Input Validation

```javascript
// Always validate user input
export function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Invalid query');
  }
  if (query.length > 10000) {
    throw new Error('Query too long');
  }
  return query.trim();
}
```

### API Key Management

```javascript
// Never log or expose API keys
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY not configured');
}

// Validate key format
if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
  throw new Error('Invalid API key format');
}
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// src/api/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
});
```

## Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=DEBUG npm run dev
```

### Debug with VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.js",
      "env": {"LOG_LEVEL": "DEBUG"}
    }
  ]
}
```

### Using console.log strategically

```javascript
// Use logger instead of console.log
import { logger } from '../utils/logger.js';

logger.debug('Processing query', { query, userId });
logger.error('API error', error);
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add src/
git commit -m "Add new feature: description"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
# After review and approval, merge to main
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Ensure tests pass: `npm test`
5. Ensure linting passes: `npm run lint`
6. Submit pull request

## Documentation

- Update CLAUDE.md for architecture changes
- Update README.md for user-facing changes
- Add comments for complex logic
- Keep examples/ updated
