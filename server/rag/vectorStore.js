let vectors = [];

function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denom || !Number.isFinite(denom)) return 0;
  return dot / denom;
}

function storeVectors(embeddings, chunks) {
  vectors = embeddings.map((embedding, i) => ({
    embedding,
    text: chunks[i],
  }));
}

function search(queryEmbedding, topK = 5) {
  const results = vectors
    .map((v) => ({
      text: v.text,
      score: cosineSimilarity(queryEmbedding, v.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

module.exports = { storeVectors, search };
