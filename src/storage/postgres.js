import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const { Pool } = pg;

let pool = null;

/**
 * Initialize PostgreSQL connection pool
 */
export async function initializePostgres() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Vercel connection pooling settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create tables if they don't exist
    await createTables(client);
    client.release();

    return pool;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL:', error);
    throw error;
  }
}

/**
 * Create necessary tables
 */
async function createTables(client) {
  try {
    // Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
      CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
    `);

    // Embeddings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
        embedding VECTOR(384),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_embeddings_document_id ON embeddings(document_id);
    `);

    // Conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
    `);

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

/**
 * Load documents from PostgreSQL
 */
export async function loadDocuments() {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(`
      SELECT id, title, content, metadata, created_at as "createdAt", updated_at as "updatedAt"
      FROM documents
      ORDER BY created_at DESC
    `);

    return result.rows;
  } catch (error) {
    console.error('Error loading documents:', error);
    throw error;
  }
}

/**
 * Save a new document
 */
export async function saveDocument(doc) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `INSERT INTO documents (id, title, content, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, content, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
      [doc.id, doc.title, doc.content, JSON.stringify(doc.metadata), doc.createdAt, doc.updatedAt]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDocument(id, updates) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `UPDATE documents
       SET title = $1, content = $2, metadata = $3, updated_at = $4
       WHERE id = $5
       RETURNING id, title, content, metadata, created_at as "createdAt", updated_at as "updatedAt"`,
      [updates.title, updates.content, JSON.stringify(updates.metadata), new Date().toISOString(), id]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id) {
  try {
    if (!pool) throw new Error('Database not initialized');

    await pool.query('DELETE FROM documents WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Get a single document
 */
export async function getDocument(id) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `SELECT id, title, content, metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM documents WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

/**
 * Save embedding for a document
 */
export async function saveEmbedding(documentId, embedding) {
  try {
    if (!pool) throw new Error('Database not initialized');

    await pool.query(
      `INSERT INTO embeddings (document_id, embedding)
       VALUES ($1, $2)
       ON CONFLICT (document_id) DO UPDATE SET embedding = $2`,
      [documentId, JSON.stringify(embedding)]
    );
  } catch (error) {
    console.error('Error saving embedding:', error);
    throw error;
  }
}

/**
 * Get embedding for a document
 */
export async function getEmbedding(documentId) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      'SELECT embedding FROM embeddings WHERE document_id = $1',
      [documentId]
    );

    return result.rows[0]?.embedding ? JSON.parse(result.rows[0].embedding) : null;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

/**
 * Get all embeddings
 */
export async function loadEmbeddings() {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      'SELECT document_id, embedding FROM embeddings'
    );

    const embeddings = {};
    result.rows.forEach(row => {
      embeddings[row.document_id] = JSON.parse(row.embedding);
    });

    return embeddings;
  } catch (error) {
    console.error('Error loading embeddings:', error);
    throw error;
  }
}

/**
 * Delete embedding for a document
 */
export async function deleteEmbedding(documentId) {
  try {
    if (!pool) throw new Error('Database not initialized');

    await pool.query('DELETE FROM embeddings WHERE document_id = $1', [documentId]);
  } catch (error) {
    console.error('Error deleting embedding:', error);
    throw error;
  }
}

/**
 * Save a conversation
 */
export async function saveConversation(conversationId) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `INSERT INTO conversations (id, created_at, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET updated_at = $3
       RETURNING id, created_at as "createdAt", updated_at as "updatedAt"`,
      [conversationId || uuidv4(), new Date().toISOString(), new Date().toISOString()]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * Add message to conversation
 */
export async function addMessage(conversationId, role, content) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `INSERT INTO messages (id, conversation_id, role, content, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, conversation_id as "conversationId", role, content, created_at as "createdAt"`,
      [uuidv4(), conversationId, role, content, new Date().toISOString()]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

/**
 * Get conversation history
 */
export async function getConversationMessages(conversationId) {
  try {
    if (!pool) throw new Error('Database not initialized');

    const result = await pool.query(
      `SELECT id, conversation_id as "conversationId", role, content, created_at as "createdAt"
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId) {
  try {
    if (!pool) throw new Error('Database not initialized');

    await pool.query('DELETE FROM conversations WHERE id = $1', [conversationId]);
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  try {
    if (pool) {
      await pool.end();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database:', error);
  }
}
