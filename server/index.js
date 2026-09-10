const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const { extractTextFromPDF } = require("./rag/pdfParser");
const { chunkText } = require("./rag/chunker");
const { getEmbeddings } = require("./rag/embeddings");
const { storeVectors } = require("./rag/vectorStore");
const { retrieve } = require("./rag/retriever");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

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

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userQuery = messages[messages.length - 1].content;

    const context = await retrieve(userQuery);

    const systemPrompt = `You are a helpful, friendly, and professional AI assistant specializing in AMNA IFTIKHAR, an AI-Powered Full-Stack Developer and Agentic AI Engineer. Communicate naturally and confidently, and never make up information. For greetings, respond naturally, such as: "Hi! Ask me anything about AMNA IFTIKHAR."

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

Resume Context:
${context}`;

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3001;

indexResume().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
