# BGE ELECTRIQUE Chatbot Backend

A Node.js backend server with Gemini AI and RAG (Retrieval-Augmented Generation) for PDF-based question answering.

## Features

- 🤖 **Gemini AI Integration** - Powered by Google's Gemini 1.5 Flash model
- 📄 **PDF Processing** - Upload and process large PDF documents
- 🔍 **RAG System** - Retrieval-Augmented Generation for context-aware responses
- ⚡ **Fast API** - Express.js REST API
- 🔒 **CORS Enabled** - Secure cross-origin requests
- 💾 **In-Memory Vector Store** - Quick semantic search

## Prerequisites

- Node.js (v18 or higher)
- Gemini API Key (Get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

## Usage

### Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

### API Endpoints

#### 1. Health Check
```
GET /api/health
```
Check if the server is running.

#### 2. Upload PDF
```
POST /api/pdf/upload
Content-Type: multipart/form-data

Body:
- pdf: <PDF file>
```
Upload a PDF document to process and add to the knowledge base.

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/pdf/upload -F "pdf=@your-document.pdf"
```

#### 3. Send Chat Message
```
POST /api/chat/message
Content-Type: application/json

Body:
{
  "message": "What is your question?",
  "chatId": "chat_123456789"
}
```
Send a message and get an AI-powered response based on the uploaded PDF.

**Example:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about electrical safety", "chatId": "chat_001"}'
```

#### 4. Get Vector Store Stats
```
GET /api/pdf/stats
```
Get statistics about the processed documents.

## How RAG Works

1. **PDF Upload**: Large PDF is uploaded and parsed
2. **Chunking**: Text is split into overlapping chunks (1000 chars with 200 char overlap)
3. **Vector Store**: Chunks are stored in memory with metadata
4. **Query Processing**: When a user asks a question:
   - System searches for relevant chunks using semantic similarity
   - Top K most relevant chunks are retrieved
   - Context is provided to Gemini AI
5. **Response Generation**: Gemini generates a response using the retrieved context

## Configuration

Edit `.env` file:

```env
# Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (Optional, default: 3000)
PORT=3000

# Environment (Optional, default: development)
NODE_ENV=development

# Allowed Origins for CORS (Optional)
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:8000
```

## Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   ├── chat.js           # Chat endpoints
│   └── pdf.js            # PDF upload endpoints
├── services/
│   └── ragService.js     # RAG implementation
├── package.json          # Dependencies
├── .env                  # Environment variables
└── README.md            # This file
```

## API Response Examples

### Chat Response
```json
{
  "response": "Based on the document, electrical safety requires...",
  "chatId": "chat_123456789",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "hasContext": true
}
```

### PDF Upload Response
```json
{
  "message": "PDF processed successfully",
  "fileName": "electrical-guide.pdf",
  "chunks": 145,
  "success": true
}
```

### Stats Response
```json
{
  "totalChunks": 145,
  "totalCharacters": 145000,
  "hasData": true
}
```

## Error Handling

All errors return JSON with appropriate HTTP status codes:

```json
{
  "error": "Error message here",
  "message": "Detailed error description"
}
```

## Performance Tips

1. **Large PDFs**: For very large PDFs (>50MB), consider increasing the chunk size
2. **Search Speed**: The semantic search queries Gemini for scoring, which can be slow. For faster results, use keyword-based search as a fallback
3. **Production**: For production use, replace the in-memory vector store with a proper vector database like Pinecone, Weaviate, or Chroma

## Upgrading to Production Vector Database

To use a production vector database, modify `ragService.js`:

1. Install a vector database client (e.g., `@pinecone-database/pinecone`)
2. Replace the `vectorStore` array with database calls
3. Use proper embeddings (e.g., Gemini embeddings or OpenAI embeddings)
4. Implement persistent storage

## Troubleshooting

### "API key not found" error
Make sure your `.env` file has the correct Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
```

### CORS errors
Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:
```
ALLOWED_ORIGINS=http://localhost:5500,http://your-frontend-url.com
```

### PDF upload fails
Check:
- File size is under 50MB
- File is actually a PDF (application/pdf MIME type)
- Server has enough memory

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
