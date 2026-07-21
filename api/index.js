import { initializeDataDirectory } from '../src/utils/storage.js';
import app from '../src/index.js';

// Initialize storage once on startup
let initialized = false;

export default async (req, res) => {
  // Initialize storage on first request
  if (!initialized) {
    try {
      console.log('Initializing storage...');
      await initializeDataDirectory();
      initialized = true;
      console.log('Storage initialized');
    } catch (error) {
      console.error('Storage init error:', error);
      return res.status(500).json({ error: 'Storage init failed' });
    }
  }

  // Delegate to Express app
  return app(req, res);
};

