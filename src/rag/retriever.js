import { loadDocuments, loadEmbeddings } from '../utils/storage.js';
import { simpleEmbedding, rankDocuments } from '../utils/embeddings.js';
import config from '../config.js';

/**
 * Retrieve relevant documents based on a query
 */
export async function retrieveDocuments(query) {
  try {
    const documents = await loadDocuments();
    const embeddingsMap = await loadEmbeddings();

    if (documents.length === 0) {
      return [];
    }

    // Generate embedding for query
    const queryEmbedding = simpleEmbedding(query);

    // Rank documents by similarity
    const rankedDocs = rankDocuments(queryEmbedding, embeddingsMap, config.minSimilarityScore);

    // Get top K results
    const topResults = rankedDocs.slice(0, config.topKResults);

    // Fetch full document data
    const retrievedDocs = topResults
      .map(result => {
        const doc = documents.find(d => d.id === result.docId);
        return doc
          ? {
              ...doc,
              similarity: result.similarity,
            }
          : null;
      })
      .filter(Boolean);

    return retrievedDocs;
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return [];
  }
}

/**
 * Build context from retrieved documents
 */
export function buildContext(documents) {
  if (documents.length === 0) {
    return '';
  }

  let context = 'Based on the following documents:\n\n';

  documents.forEach((doc, index) => {
    const similarity = (doc.similarity * 100).toFixed(1);
    context += `[Document ${index + 1}: ${doc.title} (Relevance: ${similarity}%)]\n`;
    context += `${doc.content}\n\n`;
  });

  return context;
}
