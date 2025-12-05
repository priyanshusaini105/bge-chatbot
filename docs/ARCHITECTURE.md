# 🏗️ System Architecture (with Qdrant)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Tailwind CSS + Vanilla JS)                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS BACKEND                          │
│                        (Port 3000)                              │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  Chat Routes   │  │  PDF Routes    │  │  Health Check    │ │
│  │  /api/chat/*   │  │  /api/pdf/*    │  │  /api/health     │ │
│  └────────────────┘  └────────────────┘  └──────────────────┘ │
│           │                   │                                │
│           └───────┬───────────┘                                │
│                   │                                            │
│           ┌───────▼───────────┐                                │
│           │   RAG Service     │                                │
│           │ (ragService.js)   │                                │
│           └───────┬───────────┘                                │
└───────────────────┼─────────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│   GEMINI AI     │    │  QDRANT VECTOR DB    │
│   (Google)      │    │   (Cloud/Local)      │
│                 │    │                      │
│ ┌─────────────┐ │    │ ┌─────────────────┐  │
│ │ Embeddings  │ │    │ │   Collection    │  │
│ │   Model     │ │    │ │ "bge_electrique │  │
│ │             │ │    │ │     _docs"      │  │
│ │ text-       │ │    │ │                 │  │
│ │ embedding-  │ │    │ │ 768-dim vectors │  │
│ │ 004         │ │    │ │ Cosine distance │  │
│ └─────────────┘ │    │ └─────────────────┘  │
│                 │    │                      │
│ ┌─────────────┐ │    │ ┌─────────────────┐  │
│ │   Chat      │ │    │ │  Vector Search  │  │
│ │   Model     │ │    │ │  (Similarity)   │  │
│ │             │ │    │ │                 │  │
│ │ gemini-2.0-flash-lite │ │    │ │  Top K: 5       │  │
│ │        │ │    │ │  Threshold: 0.5 │  │
│ └─────────────┘ │    │ └─────────────────┘  │
└─────────────────┘    └──────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1️⃣ PDF Upload Flow

```
┌─────────────┐
│   User      │
│  Uploads    │
│  PDF File   │
└──────┬──────┘
       │
       │ 1. FormData POST
       ▼
┌──────────────────┐
│  Express Server  │
│  /api/pdf/upload │
└──────┬───────────┘
       │
       │ 2. Pass buffer
       ▼
┌──────────────────────┐
│   RAG Service        │
│  processPDF()        │
└──────┬───────────────┘
       │
       │ 3. Parse with pdf-parse
       ▼
┌──────────────────────┐
│  "Full PDF text..."  │
│  50,000 characters   │
└──────┬───────────────┘
       │
       │ 4. Split into chunks
       ▼
┌──────────────────────────────┐
│  Chunk 1: "First 1000 chars" │
│  Chunk 2: "Next 1000 chars"  │
│  Chunk 3: "Next 1000 chars"  │
│  ...                         │
│  Chunk N: "Last chunk"       │
└──────┬───────────────────────┘
       │
       │ 5. For each chunk (batches of 10)
       ▼
┌─────────────────────────────────────┐
│          GEMINI EMBEDDINGS          │
│                                     │
│  Input:  "First 1000 chars"         │
│  Output: [0.123, -0.456, ..., 0.789]│
│          (768 numbers)              │
└──────┬──────────────────────────────┘
       │
       │ 6. Store in Qdrant
       ▼
┌─────────────────────────────────────┐
│         QDRANT POINT                │
│                                     │
│  id: "1735123456_0"                 │
│  vector: [0.123, -0.456, ...]       │
│  payload: {                         │
│    text: "First 1000 chars",        │
│    fileName: "codebook.pdf",        │
│    chunkIndex: 0                    │
│  }                                  │
└─────────────────────────────────────┘
       │
       │ 7. Repeat for all chunks
       ▼
┌─────────────────────────────────────┐
│   ✅ Upload Complete                │
│   150 chunks stored in Qdrant       │
└─────────────────────────────────────┘
```

---

### 2️⃣ Chat Query Flow

```
┌─────────────┐
│   User      │
│  Asks:      │
│  "What is   │
│   X?"       │
└──────┬──────┘
       │
       │ 1. POST /api/chat/message
       ▼
┌──────────────────┐
│  Express Server  │
│  /api/chat       │
└──────┬───────────┘
       │
       │ 2. Call RAG service
       ▼
┌──────────────────────────┐
│   RAG Service            │
│  getRelevantContext()    │
└──────┬───────────────────┘
       │
       │ 3. Generate query embedding
       ▼
┌─────────────────────────────────────┐
│          GEMINI EMBEDDINGS          │
│                                     │
│  Input:  "What is X?"               │
│  Output: [0.234, -0.567, ..., 0.890]│
│          (768 numbers)              │
└──────┬──────────────────────────────┘
       │
       │ 4. Search similar vectors
       ▼
┌─────────────────────────────────────┐
│      QDRANT VECTOR SEARCH           │
│                                     │
│  Query Vector: [0.234, -0.567, ...] │
│  Method: Cosine Similarity          │
│  Limit: Top 5                       │
│  Threshold: > 0.5                   │
└──────┬──────────────────────────────┘
       │
       │ 5. Return similar chunks
       ▼
┌─────────────────────────────────────┐
│      SEARCH RESULTS                 │
│                                     │
│  1. Chunk 45 (score: 0.87)          │
│  2. Chunk 12 (score: 0.78)          │
│  3. Chunk 89 (score: 0.72)          │
│  4. Chunk 33 (score: 0.65)          │
│  5. Chunk 56 (score: 0.59)          │
└──────┬──────────────────────────────┘
       │
       │ 6. Extract text from chunks
       ▼
┌─────────────────────────────────────┐
│        CONTEXT (Combined)           │
│                                     │
│  "Text from chunk 45...             │
│   ---                               │
│   Text from chunk 12...             │
│   ---                               │
│   Text from chunk 89..."            │
└──────┬──────────────────────────────┘
       │
       │ 7. Create augmented prompt
       ▼
┌─────────────────────────────────────┐
│         GEMINI CHAT (1.5 Flash)     │
│                                     │
│  System: "You are BGE assistant"    │
│  Context: "[relevant chunks]"       │
│  Question: "What is X?"             │
│                                     │
│  → Generates answer using context   │
└──────┬──────────────────────────────┘
       │
       │ 8. Return response
       ▼
┌─────────────────────────────────────┐
│   ✅ Chat Response                  │
│   "Based on the codebook, X is..."  │
└─────────────────────────────────────┘
       │
       │ 9. Display to user
       ▼
┌─────────────┐
│   User      │
│   Sees      │
│   Answer    │
└─────────────┘
```

---

## 🔑 Key Components Explained

### Frontend (index.html + app.js)
- **Purpose:** User interface for chatting
- **Tech:** Tailwind CSS + Vanilla JavaScript
- **Features:** 
  - Chat bubbles with rounded corners
  - URL-based chat management
  - localStorage for persistence
  - Inline CSS for dynamic elements

### Express Backend (server.js)
- **Purpose:** API server
- **Port:** 3000
- **Routes:**
  - `POST /api/chat/message` - Send message, get response
  - `POST /api/pdf/upload` - Upload PDF for processing
  - `GET /api/pdf/stats` - Get vector store statistics
  - `GET /api/health` - Health check

### RAG Service (ragService.js)
- **Purpose:** Core RAG logic
- **Functions:**
  - `processPDF(buffer, fileName)` - Parse and embed PDF
  - `generateEmbedding(text)` - Create 768-dim vector
  - `getRelevantContext(query, topK)` - Search Qdrant
  - `getVectorStoreStats()` - Get collection info

### Gemini AI
- **Embedding Model:** `text-embedding-004`
  - Input: Text string (any length)
  - Output: 768-dimensional vector
  - Use: Convert text to searchable vectors
  
- **Chat Model:** `gemini-2.0-flash-lite`
  - Input: Prompt + context + question
  - Output: Natural language response
  - Use: Generate answers using PDF context

### Qdrant Vector Database
- **Collection:** `bge_electrique_docs`
- **Vector Size:** 768 dimensions (matches Gemini embeddings)
- **Distance:** Cosine similarity (best for text embeddings)
- **Storage:** Cloud (persistent) or Local Docker
- **Search:** Sub-100ms for millions of vectors

---

## 📈 Performance Metrics

### Embeddings Generation
```
Time per chunk: ~1-2 seconds
API calls: 1 per chunk
100-page PDF ≈ 150 chunks ≈ 2-3 minutes total
```

### Vector Search
```
Qdrant search: <100ms (typically 20-50ms)
Compare to old method: 5-10 seconds
Speedup: 50-100x faster
```

### Chat Response
```
Total time: ~2-5 seconds
├─ Vector search: 20-50ms
├─ Gemini generation: 2-4 seconds
└─ Network latency: 100-500ms
```

---

## 🔒 Security Considerations

### API Keys
```
✅ Stored in .env (not committed to git)
✅ .env in .gitignore
✅ Server-side only (never exposed to frontend)
```

### CORS
```
✅ Configured in backend
✅ Only allows specific origins
✅ Prevents unauthorized access
```

### File Upload
```
✅ 50MB size limit
✅ PDF-only validation
✅ Multer for secure file handling
```

---

## 🎯 Optimization Tips

### 1. Chunk Size
```javascript
// Current: 1000 chars with 200 overlap
splitIntoChunks(text, 1000, 200)

// Smaller = more precise, more API calls
splitIntoChunks(text, 500, 100)

// Larger = less API calls, less precise
splitIntoChunks(text, 2000, 400)
```

### 2. Top K Results
```javascript
// Current: 5 chunks
getRelevantContext(query, 5)

// More context (slower, more comprehensive)
getRelevantContext(query, 10)

// Less context (faster, more focused)
getRelevantContext(query, 3)
```

### 3. Similarity Threshold
```javascript
// Current: 0.5 (50% similarity)
score_threshold: 0.5

// More strict (fewer, better results)
score_threshold: 0.7

// Less strict (more results, lower quality)
score_threshold: 0.3
```

---

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
# Response: {"status":"ok"}
```

### Stats Check
```bash
curl http://localhost:3000/api/pdf/stats
# Response: {"totalChunks":150,"vectorSize":768,...}
```

### Chat Test
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What is this document about?","chatId":"test123"}'
```

---

**This architecture provides a production-ready, scalable RAG system! 🚀**
