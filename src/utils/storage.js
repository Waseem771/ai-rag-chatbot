import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import config from '../config.js';

// Synchronous initialization for Vercel
export function initializeDataDirectorySync() {
  try {
    const dataDir = path.dirname(config.dbPath);
    if (!fsSync.existsSync(dataDir)) {
      fsSync.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize documents file
    if (!fsSync.existsSync(config.dbPath)) {
      fsSync.writeFileSync(config.dbPath, JSON.stringify({ documents: [] }, null, 2));
    }

    // Initialize embeddings file
    if (!fsSync.existsSync(config.embeddingsPath)) {
      fsSync.writeFileSync(config.embeddingsPath, JSON.stringify({ embeddings: {} }, null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize data directory:', error);
    throw error;
  }
}

// Ensure data directory exists
export async function initializeDataDirectory() {
  try {
    const dataDir = path.dirname(config.dbPath);
    await fs.mkdir(dataDir, { recursive: true });

    // Initialize files if they don't exist
    const dbExists = await fileExists(config.dbPath);
    if (!dbExists) {
      await fs.writeFile(config.dbPath, JSON.stringify({ documents: [] }, null, 2));
    }

    const embExists = await fileExists(config.embeddingsPath);
    if (!embExists) {
      await fs.writeFile(config.embeddingsPath, JSON.stringify({ embeddings: {} }, null, 2));
    }
  } catch (error) {
    console.error('Failed to initialize data directory:', error);
    throw error;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Load documents from storage
export async function loadDocuments() {
  try {
    const data = await fs.readFile(config.dbPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.documents || [];
  } catch (error) {
    console.error('Error loading documents:', error);
    return [];
  }
}

// Save documents to storage
export async function saveDocuments(documents) {
  try {
    await fs.writeFile(config.dbPath, JSON.stringify({ documents }, null, 2));
  } catch (error) {
    console.error('Error saving documents:', error);
    throw error;
  }
}

// Load embeddings from storage
export async function loadEmbeddings() {
  try {
    const data = await fs.readFile(config.embeddingsPath, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.embeddings || {};
  } catch (error) {
    console.error('Error loading embeddings:', error);
    return {};
  }
}

// Save embeddings to storage
export async function saveEmbeddings(embeddings) {
  try {
    await fs.writeFile(config.embeddingsPath, JSON.stringify({ embeddings }, null, 2));
  } catch (error) {
    console.error('Error saving embeddings:', error);
    throw error;
  }
}
