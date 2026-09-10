const { getQueryEmbedding } = require("./embeddings");
const { search } = require("./vectorStore");

async function retrieve(query) {
  const queryEmbedding = await getQueryEmbedding(query);
  const results = search(queryEmbedding, 5);
  return results.map((r) => r.text).join("\n\n---\n\n");
}

module.exports = { retrieve };
