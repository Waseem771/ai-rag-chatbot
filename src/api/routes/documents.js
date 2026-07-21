import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { loadDocuments, saveDocuments, loadEmbeddings, saveEmbeddings } from '../../utils/storage.js';
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
        title = title || req.file.originalname.replace(path.extname(req.file.originalname), '').trim();

        console.log('=== FILE UPLOAD DEBUG ===');
        console.log('Original filename:', req.file.originalname);
        console.log('File mimetype:', req.file.mimetype);
        console.log('File size:', req.file.size);

        const ext = path.extname(req.file.originalname).toLowerCase();
        console.log('Extension from originalname:', ext);
        console.log('======================');

        // Handle memory storage - extract from buffer
        if (req.file.buffer) {
          content = await extractTextFromFile(req.file.buffer, req.file.mimetype, ext);
        } else if (req.file.path) {
          // Fallback for disk storage
          content = await extractTextFromFile(req.file.path);
          // Delete the uploaded file after extraction
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }

        console.log('Extracted content length:', content.length);
        console.log('Extracted content preview:', content.substring(0, 100));
      } catch (error) {
        // Clean up the file if extraction failed
        if (req.file.path && fs.existsSync(req.file.path)) {
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

    // Save document
    const documents = await loadDocuments();
    documents.push(doc);
    await saveDocuments(documents);

    // Save embedding
    const embeddings = await loadEmbeddings();
    embeddings[doc.id] = embedding;
    await saveEmbeddings(embeddings);

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
    const documents = await loadDocuments();
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
    const documents = await loadDocuments();
    const doc = documents.find(d => d.id === id);

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
    const documents = await loadDocuments();
    const index = documents.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Remove document
    documents.splice(index, 1);
    await saveDocuments(documents);

    // Remove embedding
    const embeddings = await loadEmbeddings();
    delete embeddings[id];
    await saveEmbeddings(embeddings);

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

    const documents = await loadDocuments();
    const docIndex = documents.findIndex(d => d.id === id);

    if (docIndex === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update document
    documents[docIndex] = {
      ...documents[docIndex],
      title: title.trim(),
      content: content.trim(),
      metadata: metadata || documents[docIndex].metadata,
      updatedAt: new Date().toISOString(),
    };
    await saveDocuments(documents);

    // Update embedding
    const embedding = simpleEmbedding(`${title} ${content}`);
    const embeddings = await loadEmbeddings();
    embeddings[id] = embedding;
    await saveEmbeddings(embeddings);

    res.json({
      success: true,
      document: documents[docIndex],
      message: 'Document updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
