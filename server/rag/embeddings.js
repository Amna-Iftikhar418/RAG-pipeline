const { pipeline } = require("@huggingface/transformers");

let extractor = null;

async function loadExtractor(retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        dtype: "fp32",
      });
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(
        `[embeddings] Model load failed (attempt ${attempt + 1}/${retries + 1}): ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
}

async function getExtractor() {
  if (!extractor) {
    console.log("[embeddings] Loading local ONNX model (first run downloads ~23 MB)...");
    extractor = await loadExtractor();
    console.log("[embeddings] Model loaded.");
  }
  return extractor;
}

async function getEmbeddings(texts) {
  const ext = await getExtractor();
  const embeddings = [];

  for (const text of texts) {
    const output = await ext(text, { pooling: "mean", normalize: true });
    embeddings.push(Array.from(output.data));
  }

  return embeddings;
}

async function getQueryEmbedding(text) {
  const ext = await getExtractor();
  const output = await ext(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

module.exports = { getEmbeddings, getQueryEmbedding };
