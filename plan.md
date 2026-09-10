# RAG Resume Chatbot - Final Plan

## Overview
A RAG (Retrieval-Augmented Generation) chatbot that uses a static `resume.pdf` in the project root as its knowledge source. No file upload UI — the resume is indexed automatically on server startup.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Express.js + Node.js |
| PDF Parsing | `pdf-parse` |
| Text Chunking | Custom recursive character splitter |
| Embeddings | HuggingFace Inference API (`all-MiniLM-L6-v2`, 384-dim) |
| Vector Store | In-memory array + cosine similarity |
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| Frontend | React + Tailwind CSS (Vite) |

## Project Structure

```
C:\RAG\
├── resume.pdf                 # Static resume file (placed manually)
├── .env                       # GROQ_API_KEY, HUGGINGFACE_API_KEY
├── root package.json          # Backend dependencies
├── server/
│   ├── index.js               # Express server, startup indexing, chat endpoint
│   └── rag/
│       ├── pdfParser.js       # Extract text from resume.pdf
│       ├── chunker.js         # Split text into overlapping chunks
│       ├── embeddings.js      # HuggingFace vector embeddings
│       ├── vectorStore.js     # In-memory store + cosine similarity
│       └── retriever.js       # Query → embed → search → return top chunks
├── client/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css          # Tailwind directives
│   │   └── components/
│   │       ├── Chat.jsx       # Chat interface + input
│   │       └── Message.jsx    # Message bubbles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
```

## RAG Pipeline (From Scratch)

### Step 1: PDF Text Extraction (`pdfParser.js`)
- Read `resume.pdf` from project root
- Use `pdf-parse` to extract raw text
- Return cleaned text string

### Step 2: Text Chunking (`chunker.js`)
- Split text into chunks of ~500 characters
- 50 character overlap between chunks (for context continuity)
- Preserve meaningful boundaries (sentences, lines)
- Return array of `{ text, index }` objects

### Step 3: Embeddings (`embeddings.js`)
- Call HuggingFace Inference API
- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Input: text chunk → Output: 384-dimension vector
- Batch process all chunks
- Return array of `{ text, embedding, index }` objects

### Step 4: Vector Store (`vectorStore.js`)
- Store chunks with their embeddings in memory
- Implement cosine similarity function
- `addChunks(chunks)` — add to store
- `search(queryEmbedding, topK)` — return top-K most similar chunks
- Return `{ text, score, index }` for each result

### Step 5: Retriever (`retriever.js`)
- Orchestrate: query → embed → search → return context
- Take user question as input
- Embed question via HuggingFace
- Search vector store for top-5 matches
- Return formatted context string

## Server Startup Flow

```
node server/index.js
    ↓
Read resume.pdf from project root
    ↓
Extract text (pdfParser.js)
    ↓
Chunk text (chunker.js) → ~N chunks
    ↓
Embed all chunks (embeddings.js) via HuggingFace API
    ↓
Store in memory (vectorStore.js)
    ↓
"✅ Resume indexed. Ready to chat on port 3000."
```

## API Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/api/chat` | `{ "question": "..." }` | `{ "answer": "...", "sources": [...] }` | RAG-powered answer |

## Chat Request Flow

```
User types question in React UI
    ↓
POST /api/chat { question: "What is your experience?" }
    ↓
Embed question (HuggingFace)
    ↓
Search vector store → top 5 chunks
    ↓
Build prompt:
  "Based on the following resume context, answer the question.
   Context: {chunk1} {chunk2} ...
   Question: {user question}"
    ↓
Send to Groq LLM (llama-3.3-70b-versatile)
    ↓
Return { answer, sources }
    ↓
React UI displays answer
```

## Frontend (React + Tailwind)

### Components
- **`App.jsx`** — Main layout, state management for messages
- **`Chat.jsx`** — Chat container, input field, send button, message list
- **`Message.jsx`** — Styled message bubble (user vs assistant)

### Features
- Clean chat interface
- Loading indicator while RAG processes
- Error handling for API failures
- Auto-scroll to latest message

## Dependencies

### Backend (root `package.json`)
- `express` — Web server
- `cors` — Cross-origin requests
- `dotenv` — Environment variables
- `pdf-parse` — PDF text extraction
- `groq-sdk` — Groq LLM
- `@huggingface/inference` — Embeddings API

### Frontend (`client/package.json`)
- `react` + `react-dom`
- `vite` + `@vitejs/plugin-react` — Build tool
- `tailwindcss` + `postcss` + `autoprefixer` — Styling

## Implementation Order

| # | File | Description |
|---|------|-------------|
| 1 | `plan.md` | This document |
| 2 | `.env` | Environment variables |
| 3 | root `package.json` | Backend dependencies |
| 4 | `server/rag/pdfParser.js` | PDF text extraction |
| 5 | `server/rag/chunker.js` | Text chunking logic |
| 6 | `server/rag/embeddings.js` | HuggingFace embeddings |
| 7 | `server/rag/vectorStore.js` | In-memory vector store |
| 8 | `server/rag/retriever.js` | Retriever orchestration |
| 9 | `server/index.js` | Express server + startup pipeline |
| 10 | `client/` setup | Vite + React + Tailwind init |
| 11 | `client/src/components/Message.jsx` | Message bubble component |
| 12 | `client/src/components/Chat.jsx` | Chat interface |
| 13 | `client/src/App.jsx` | Main app layout |

## How to Run

```bash
# 1. Place your resume.pdf in C:\RAG\

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd client && npm install && cd ..

# 4. Set API keys in .env

# 5. Start backend
node server/index.js

# 6. In another terminal, start frontend
cd client && npm run dev
```