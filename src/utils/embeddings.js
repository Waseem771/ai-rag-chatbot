// Simple cosine similarity calculation
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// Simple hash-based embedding for demo
// In production, use Claude's embedding API
export function simpleEmbedding(text) {
  const embedding = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      embedding[(charCode + i * j) % 384] += 1 / (1 + j);
    }
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// Rank documents by similarity to query
export function rankDocuments(queryEmbedding, documentEmbeddings, minScore = 0.3) {
  const results = Object.entries(documentEmbeddings)
    .map(([docId, embedding]) => ({
      docId,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    }))
    .filter(result => result.similarity >= minScore)
    .sort((a, b) => b.similarity - a.similarity);

  return results;
}
