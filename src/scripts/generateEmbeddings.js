/**
 * Script to regenerate embeddings for all documents
 * Useful when you want to recompute embeddings with a different algorithm
 */

import { loadDocuments, saveEmbeddings } from '../utils/storage.js';
import { simpleEmbedding } from '../utils/embeddings.js';

async function generateEmbeddings() {
  console.log('🔄 Regenerating embeddings for all documents...');

  try {
    const documents = await loadDocuments();

    if (documents.length === 0) {
      console.log('📭 No documents found. Nothing to do.');
      return;
    }

    const embeddings = {};

    for (const doc of documents) {
      const text = `${doc.title} ${doc.content}`;
      embeddings[doc.id] = simpleEmbedding(text);
      console.log(`✓ Generated embedding for: ${doc.title}`);
    }

    await saveEmbeddings(embeddings);
    console.log(`\n✅ Successfully regenerated ${documents.length} embeddings`);
  } catch (error) {
    console.error('❌ Error regenerating embeddings:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmbeddings();
}

export { generateEmbeddings };
