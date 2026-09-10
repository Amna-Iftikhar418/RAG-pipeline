# Task List

## Setup
- [ ] 1. Place `resume.pdf` in `C:\RAG\`
- [ ] 2. Create `.env` with `GROQ_API_KEY` and `HUGGINGFACE_API_KEY`
- [ ] 3. Create root `package.json` (express, cors, dotenv, pdf-parse, groq-sdk, @huggingface/inference)
- [ ] 4. Run `npm install` in root

## Backend - RAG Modules
- [ ] 5. Create `server/rag/pdfParser.js` — extract text from resume.pdf
- [ ] 6. Create `server/rag/chunker.js` — split text into ~500-char chunks with 50-char overlap
- [ ] 7. Create `server/rag/embeddings.js` — HuggingFace Inference API (all-MiniLM-L6-v2)
- [ ] 8. Create `server/rag/vectorStore.js` — in-memory store + cosine similarity
- [ ] 9. Create `server/rag/retriever.js` — query → embed → search → top-5 context

## Backend - Server
- [ ] 10. Create `server/index.js` — Express server, index resume on startup, `POST /api/chat`
- [ ] 11. Test backend: verify resume indexing and chat endpoint

## Frontend
- [ ] 12. Set up `client/` — Vite + React + Tailwind (package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html, main.jsx, index.css)
- [ ] 13. Create `client/src/components/Message.jsx` — message bubble component
- [ ] 14. Create `client/src/components/Chat.jsx` — chat interface + input
- [ ] 15. Create `client/src/App.jsx` — main app layout + API integration
- [ ] 16. Run `npm install` in `client/`

## Integration & Testing
- [ ] 17. Start backend (`node server/index.js`) and frontend (`cd client && npm run dev`)
- [ ] 18. Test end-to-end: ask questions, verify answers use resume context