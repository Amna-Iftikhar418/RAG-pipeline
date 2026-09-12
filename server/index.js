const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const fs = require("fs");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Groq = require("groq-sdk");
const { extractTextFromPDF } = require("./rag/pdfParser");
const { chunkText } = require("./rag/chunker");
const { getEmbeddings } = require("./rag/embeddings");
const { storeVectors } = require("./rag/vectorStore");
const { retrieve } = require("./rag/retriever");

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("Missing GROQ_API_KEY in .env. Set it and restart the server.");
  process.exit(1);
}

const app = express();

app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN } : {}));
app.use(express.json({ limit: "1mb" }));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT) || 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ error: "Too many requests, please slow down." }),
});

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  timeout: Number(process.env.GROQ_TIMEOUT_MS) || 30000,
});

const PDF_PATH = path.join(__dirname, "..", "resume.pdf");

async function indexResume() {
  console.log("Extracting text from resume...");
  const text = await extractTextFromPDF(PDF_PATH);
  console.log(`Extracted ${text.length} characters`);

  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks`);

  console.log("Generating embeddings...");
  const embeddings = await getEmbeddings(chunks);
  storeVectors(embeddings, chunks);
  console.log("Resume indexed successfully!");
}

async function buildSystemPrompt(userQuery) {
  const context = await retrieve(userQuery);
  const contextBlock = context.trim()
    ? `Resume Context:\n${context}`
    : "No resume content is currently indexed or available. If the user asks anything about the resume, tell them the resume data is temporarily unavailable. Otherwise answer from your own knowledge as normal.";

  return `You are a helpful, friendly, and professional AI assistant specializing in AMNA IFTIKHAR, an AI-Powered Full-Stack Developer and Agentic AI Engineer. Communicate naturally and confidently, and never make up information. For greetings, respond naturally, such as: "Hi! Ask me anything about AMNA IFTIKHAR."

RESPONSE STYLE
- Answer directly and get to the point in 1-3 sentences.
- Be concise. Do not write long or overly detailed responses.
- Use simple, clear language.
- Only use bullet points or headings when the user asks for a list or when comparing multiple items. Otherwise, use short paragraphs.
- Never dump an entire resume or profile in a single response. Summarize briefly and let the user ask follow-up questions.

RESUME CONTEXT BELOW
A reference document about AMNA IFTIKHAR is provided below. Follow these rules:
- If the retrieved context is relevant to the user's question, use it as your primary source.
- If the user's question is about AMNA IFTIKHAR, answer using only the information present in the context. If the required information is not in the context, clearly say it is not available. Do not invent or guess.
- If the user asks something unrelated or general, answer it briefly from your own knowledge.
- Only if you cannot answer reliably (too specific, unknown, or outside your abilities) should you politely say you cannot help.
- Do not force unrelated questions to match the context, and do not hallucinate an answer just because the context is irrelevant.

${contextBlock}`;
}

app.post("/api/chat", chatLimiter, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "messages must be a non-empty array" });
    }

    const last = messages[messages.length - 1];
    if (
      !last ||
      typeof last !== "object" ||
      typeof last.content !== "string" ||
      !last.content.trim()
    ) {
      return res
        .status(400)
        .json({ error: "last message must contain non-empty text" });
    }

    const userQuery = last.content.trim().slice(0, 2000);
    const history = messages
      .slice(-10)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 4000),
      }))
      .filter((m) => m.content.trim());

    const systemPrompt = await buildSystemPrompt(userQuery);

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "system", content: systemPrompt }, ...history],
    });

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "Model returned an empty reply." });
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

const DIST = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(path.join(DIST, "index.html"))) {
  app.use(express.static(DIST));
  app.get("*", (req, res) => res.sendFile(path.join(DIST, "index.html")));
}

app.use((err, req, res, next) => {
  console.error("Request error:", err.message);
  if (err.status === 400 || err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid request body" });
  }
  res.status(500).json({ error: "Something went wrong" });
});

async function start() {
  let indexed = false;
  try {
    await indexResume();
    indexed = true;
  } catch (error) {
    console.error("Failed to index resume:", error.message);
    console.warn("Server will start WITHOUT resume context.");
  }

  app
    .listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      if (indexed) {
        console.log("Resume indexed - RAG ready.");
      } else {
        console.warn("Resume NOT indexed - responses will have no context.");
      }
    })
    .on("error", (error) => {
      console.error("Server failed to start:", error.message);
      process.exit(1);
    });
}

start();