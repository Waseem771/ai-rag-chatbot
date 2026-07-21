import * as fileStorage from '../utils/storage.js';
import * as postgresStorage from './postgres.js';

const usePostgres = !!process.env.DATABASE_URL;

/**
 * Storage factory - returns appropriate storage adapter
 * Auto-detects based on DATABASE_URL environment variable
 * Falls back to file storage if database unavailable
 */
const storage = usePostgres ? postgresStorage : fileStorage;

// Export all storage methods with consistent interface
export const loadDocuments = async (...args) => {
  try {
    return await storage.loadDocuments(...args);
  } catch (error) {
    console.warn('Storage operation failed, using file storage fallback:', error.message);
    return await fileStorage.loadDocuments(...args);
  }
};

export const saveDocuments = async (...args) => {
  try {
    return await storage.saveDocuments(...args);
  } catch (error) {
    console.warn('Storage operation failed, using file storage fallback:', error.message);
    return await fileStorage.saveDocuments(...args);
  }
};

export const loadEmbeddings = async (...args) => {
  try {
    return await storage.loadEmbeddings(...args);
  } catch (error) {
    console.warn('Storage operation failed, using file storage fallback:', error.message);
    return await fileStorage.loadEmbeddings(...args);
  }
};

export const saveEmbeddings = async (...args) => {
  try {
    return await storage.saveEmbeddings(...args);
  } catch (error) {
    console.warn('Storage operation failed, using file storage fallback:', error.message);
    return await fileStorage.saveEmbeddings(...args);
  }
};

// PostgreSQL-specific methods with fallback
export const saveDocument = storage.saveDocument || fileStorage.saveDocument;
export const updateDocument = storage.updateDocument || fileStorage.updateDocument;
export const deleteDocument = storage.deleteDocument || fileStorage.deleteDocument;
export const getDocument = storage.getDocument || fileStorage.getDocument;
export const saveEmbedding = storage.saveEmbedding || fileStorage.saveEmbedding;
export const getEmbedding = storage.getEmbedding || fileStorage.getEmbedding;
export const deleteEmbedding = storage.deleteEmbedding || fileStorage.deleteEmbedding;
export const saveConversation = storage.saveConversation || fileStorage.saveConversation;
export const addMessage = storage.addMessage || fileStorage.addMessage;
export const getConversationMessages = storage.getConversationMessages || fileStorage.getConversationMessages;
export const deleteConversation = storage.deleteConversation || fileStorage.deleteConversation;

// Export mode for conditional logic in routes
export { usePostgres };
