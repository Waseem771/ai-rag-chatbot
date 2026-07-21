import * as fileStorage from '../utils/storage.js';
import * as postgresStorage from './postgres.js';

const usePostgres = !!process.env.DATABASE_URL;

/**
 * Storage factory - returns appropriate storage adapter
 * Auto-detects based on DATABASE_URL environment variable
 */
const storage = usePostgres ? postgresStorage : fileStorage;

// Export all storage methods with consistent interface
export const loadDocuments = storage.loadDocuments;
export const saveDocuments = storage.saveDocuments || (async (docs) => {
  // PostgreSQL doesn't have this method - it handles individual saves
  throw new Error('saveDocuments not supported in PostgreSQL mode');
});
export const loadEmbeddings = storage.loadEmbeddings;
export const saveEmbeddings = storage.saveEmbeddings || (async (embs) => {
  // PostgreSQL doesn't have this method - it handles individual saves
  throw new Error('saveEmbeddings not supported in PostgreSQL mode');
});

// PostgreSQL-specific methods (file storage returns undefined for these)
export const saveDocument = storage.saveDocument;
export const updateDocument = storage.updateDocument;
export const deleteDocument = storage.deleteDocument;
export const getDocument = storage.getDocument;
export const saveEmbedding = storage.saveEmbedding;
export const getEmbedding = storage.getEmbedding;
export const deleteEmbedding = storage.deleteEmbedding;
export const saveConversation = storage.saveConversation;
export const addMessage = storage.addMessage;
export const getConversationMessages = storage.getConversationMessages;
export const deleteConversation = storage.deleteConversation;

// Export mode for conditional logic in routes
export { usePostgres };
