# 🤖 BGE ELECTRIQUE Chatbot

An intelligent chatbot powered by Google's Gemini AI with RAG (Retrieval-Augmented Generation) for PDF-based question answering. Features a modern, minimal UI built with Tailwind CSS.

## ✨ Features

### 🎨 Frontend
- **Modern UI** - Clean, minimal design with Tailwind CSS & rounded corners
- **Real-time Chat** - Smooth, responsive chat interface
- **URL-based Chats** - Each chat has unique ID in URL parameters
- **Local Storage** - Automatic chat history saving
- **PDF Upload UI** - Drag-and-drop PDF upload interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished UX with fade-in effects

### 🤖 Backend
- **Gemini AI** - Powered by Google's Gemini 1.5 Flash
- **Qdrant Vector Database** - Production-grade vector storage for embeddings
- **RAG System** - Retrieval-Augmented Generation from PDFs
- **PDF Processing** - Upload and parse large PDF documents (up to 50MB)
- **Semantic Search** - Find relevant context using vector similarity
- **REST API** - Express.js backend with CORS support
- **Error Handling** - Comprehensive error management

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Recommended)

1. **Double-click `setup-backend.bat`**
   - Installs dependencies
   - Creates .env file
   - Opens .env for you to add your Gemini API key

2. **Get your Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create an API key
   - Paste it in the `.env` file that opened

3. **Double-click `quick-start.bat`**
   - Starts backend server
   - Opens chatbot in browser
   - You're ready to go!

### Option 2: Manual Setup

#### Step 1: Setup Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and add your API keys:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_URL=https://your-cluster-url.qdrant.io:6333
```

**Get API Keys:**
- Gemini: https://makersuite.google.com/app/apikey
- Qdrant: https://cloud.qdrant.io (see `docs/QDRANT_SETUP.md`)

Start the backend:
```bash
npm start
```

#### Step 2: Run Frontend

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000
```

Open `http://localhost:8000` in your browser.

#### Step 3: Upload PDF

1. Click "UPLOAD PDF" button in the header
2. Select or drag-and-drop your PDF file
3. Wait for processing to complete
4. Start chatting!

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **Qdrant Account** - [Get it here](https://cloud.qdrant.io) (Free tier available)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

**📘 See `docs/QDRANT_SETUP.md` for detailed Qdrant setup instructions**

## 📖 Usage Guide

### 1. Upload Your PDF
- Click "UPLOAD PDF" in the header
- Select a PDF file (max 50MB)
- Wait for processing (chunks will be created)
- PDF content is now searchable

### 2. Start Chatting
- Type your question in the input field
- Press Enter or click "SEND"
- Bot will answer using PDF context

### 3. Manage Chats
- Click "NEW CHAT" to start fresh conversation
- Each chat has unique URL - bookmark or share it
- Chat history saved automatically in browser

### 4. Ask Better Questions
- Be specific about what you want to know
- Reference topics from the uploaded PDF
- Ask follow-up questions for clarity

## 🗂️ Project Structure

```
bge-chatbot/
├── backend/                    # Node.js server
│   ├── routes/
│   │   ├── chat.js            # Chat API endpoints
│   │   └── pdf.js             # PDF upload endpoints
│   ├── services/
│   │   └── ragService.js      # RAG implementation
│   ├── server.js              # Express server
│   ├── package.json           # Dependencies
│   └── .env                   # Config (create from .env.example)
├── index.html                 # Main chat interface
├── upload.html                # PDF upload interface  
├── app.js                     # Frontend JavaScript
├── setup-backend.bat          # Windows setup script
├── start-backend.bat          # Start backend script
├── quick-start.bat            # One-click start
└── README.md                  # This file
```

## 🔧 Configuration

### Backend (.env file)
```env
GEMINI_API_KEY=your_api_key_here              # Required - Gemini API
QDRANT_API_KEY=your_qdrant_api_key            # Required - Qdrant Cloud
QDRANT_URL=https://xxx.qdrant.io:6333        # Required - Qdrant cluster URL
QDRANT_COLLECTION_NAME=bge_electrique_docs   # Optional (default shown)
PORT=3000                                     # Optional (default: 3000)
NODE_ENV=development                          # Optional
ALLOWED_ORIGINS=http://localhost:8000        # Optional (for CORS)
```

### Frontend (app.js)
To change backend URL, edit the fetch call:
```javascript
const response = await fetch('http://localhost:3000/api/chat/message', {
```

## 🎨 Customization

### Styling
- Uses Tailwind CSS in `index.html`
- Inline CSS in `app.js` for dynamic elements
- Colors: Black, White, Gray (monochromatic)
- Modern rounded corners throughout

### RAG Settings (backend/services/ragService.js)
```javascript
const chunks = splitIntoChunks(pdfContent, 1000, 200);  // Chunk size, overlap
const searchResult = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 5,                    // Top K results (5 chunks)
    score_threshold: 0.5         // Similarity threshold (50%)
});
```

## 🔍 How RAG Works (with Qdrant)

1. **PDF Upload** → Document split into 1000-char chunks (200-char overlap)
2. **Embedding Generation** → Each chunk converted to 768-dim vector using Gemini
3. **Storage** → Embeddings stored in Qdrant vector database with metadata
4. **User Query** → Question converted to embedding using Gemini
5. **Vector Search** → Qdrant finds top 5 most similar chunks (cosine similarity)
6. **Filtering** → Only chunks with >50% similarity used (threshold: 0.5)
7. **Augmentation** → Relevant chunks added as context to prompt
8. **Generation** → Gemini generates answer using PDF context

**Why Qdrant?**
- ⚡ Fast vector similarity search (milliseconds vs seconds)
- 📦 Scalable storage (handles millions of vectors)
- 🎯 Better relevance (cosine similarity > scoring)
- 💾 Persistent storage (survives server restarts)

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# View backend logs
cd backend
npm start
# Check console output
```

### Common Errors

| Error | Solution |
|-------|----------|
| `GEMINI_API_KEY not found` | Add key to `backend/.env` |
| `CORS error` | Add frontend URL to `ALLOWED_ORIGINS` in `.env` |
| `Port 3000 in use` | Change `PORT` in `.env` or stop other process |
| `PDF upload fails` | Check file size (<50MB) and format (PDF only) |
| `Generic bot responses` | Upload PDF first via "UPLOAD PDF" button |

### Getting Help
1. Check `docs/SETUP.md` for detailed instructions
2. Check backend console logs for errors
3. Check browser DevTools console
4. Verify API endpoints with curl/Postman

## 📚 API Reference

### Complete Documentation
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Full API reference with examples
- **[API Quick Reference](./docs/API_QUICK_REFERENCE.md)** - Quick command reference
- **[OpenAPI Specification](./openapi.yaml)** - OpenAPI/Swagger spec
- **[Postman Collection](./BGE_ELECTRIQUE_API.postman_collection.json)** - Import into Postman

### Quick Reference

**Endpoints:**
- Health: `GET /api/health`
- Chat: `POST /api/chat/message`
- Stream: `POST /api/chat/stream`
- Upload PDF: `POST /api/pdf/upload`
- Stats: `GET /api/pdf/stats`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What are safety requirements?","chatId":"chat_123"}'
```

See full documentation in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🚀 Production Deployment

### Backend
- Use PM2: `pm2 start server.js`
- ✅ Already using Qdrant vector database (production-ready!)
- Add rate limiting & authentication
- Enable HTTPS
- Monitor Qdrant usage via cloud dashboard

### Frontend  
- Deploy to Vercel/Netlify
- Update API URL in `app.js`
- Enable HTTPS

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Fork, make changes, submit PR.

## 💡 Tips

- Ask specific questions related to PDF content
- Ensure PDFs have selectable text (not scanned images)
- Larger PDFs = more chunks = slower but more comprehensive
- For best results, structure questions clearly

---

**Built with ⚡ for BGE ELECTRIQUE**
