import { initializeDataDirectory } from '../src/utils/storage.js';
import app from '../src/index.js';

let initialized = false;

export default async function handler(req, res) {
  // Initialize storage once
  if (!initialized) {
    try {
      await initializeDataDirectory();
      initialized = true;
    } catch (error) {
      console.error('Init error:', error);
      return res.status(500).json({ error: 'Failed to initialize' });
    }
  }

  // Handle the request with Express
  return new Promise((resolve, reject) => {
    app(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

