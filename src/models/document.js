import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new document object
 */
export function createDocument(title, content, metadata = {}) {
  return {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Validate document
 */
export function validateDocument(doc) {
  const errors = [];

  if (!doc.title || typeof doc.title !== 'string' || doc.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (!doc.content || typeof doc.content !== 'string' || doc.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (doc.title && doc.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }

  if (doc.content && doc.content.length > 50000) {
    errors.push('Content must be less than 50,000 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
