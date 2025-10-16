# BGE ELECTRIQUE Chatbot - Complete Setup Guide

A full-stack chatbot application with PDF-based RAG (Retrieval-Augmented Generation) using Gemini AI.

## 🏗️ Project Structure

```
bge-chatbot/
├── backend/                 # Node.js backend server
│   ├── routes/
│   │   ├── chat.js         # Chat API routes
│   │   └── pdf.js          # PDF upload routes
│   ├── services/
│   │   └── ragService.js   # RAG implementation
│   ├── server.js           # Main server file
│   ├── package.json
│   ├── .env                # Environment variables
│   └── README.md
├── index.html              # Frontend chat UI
├── upload.html             # PDF upload UI
├── app.js                  # Frontend logic
└── README.md              # This file
```

## 🚀 Quick Start

### Step 1: Set Up Backend

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
   - Open `backend/.env`
   - Add your Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey)):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:8000,http://127.0.0.1:5500
```

4. **Start the backend server:**
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

The backend will start at `http://localhost:3000`

### Step 2: Upload PDF Document

Before using the chatbot, upload your PDF document:

**Option 1: Using the Upload UI**
1. Open `upload.html` in your browser
2. Drag and drop your PDF or click to select
3. Click "UPLOAD PDF"
4. Wait for processing to complete

**Option 2: Using curl:**
```bash
curl -X POST http://localhost:3000/api/pdf/upload -F "pdf=@your-document.pdf"
```

**Option 3: Using Postman:**
- Method: POST
- URL: `http://localhost:3000/api/pdf/upload`
- Body: form-data
- Key: `pdf` (type: File)
- Value: Select your PDF file

### Step 3: Run Frontend

1. **Open the frontend:**
   - Simply open `index.html` in a web browser
   - Or use a local server:
   
   **Using Python:**
   ```bash
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

   **Using Node.js http-server:**
   ```bash
   npx http-server -p 8000
   ```
   Then visit `http://localhost:8000`

   **Using VS Code Live Server:**
   - Install "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

2. **Start chatting!**
   - Type your questions in the chat interface
   - The bot will answer based on the uploaded PDF content

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:
```env
# Required: Your Gemini API Key
GEMINI_API_KEY=your_key_here

# Optional: Server port (default: 3000)
PORT=3000

# Optional: Environment
NODE_ENV=development

# Optional: CORS origins (add your frontend URLs)
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:8000
```

### Frontend Configuration

If your backend runs on a different port, update the API URL in `app.js`:
```javascript
// Find this line in generateBotResponse method:
const response = await fetch('http://localhost:3000/api/chat/message', {
```

## 📋 API Endpoints

### 1. Health Check
```
GET http://localhost:3000/api/health
```
Response:
```json
{
  "status": "ok",
  "message": "BGE ELECTRIQUE Chatbot API is running",
  "timestamp": "2025-10-16T10:30:00.000Z"
}
```

### 2. Upload PDF
```
POST http://localhost:3000/api/pdf/upload
Content-Type: multipart/form-data
Body: pdf file
```
Response:
```json
{
  "message": "PDF processed successfully",
  "fileName": "document.pdf",
  "chunks": 145,
  "success": true
}
```

### 3. Send Message
```
POST http://localhost:3000/api/chat/message
Content-Type: application/json
Body: {
  "message": "Your question here",
  "chatId": "chat_id_here"
}
```
Response:
```json
{
  "response": "AI generated response...",
  "chatId": "chat_123456789",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "hasContext": true
}
```

### 4. Get Stats
```
GET http://localhost:3000/api/pdf/stats
```
Response:
```json
{
  "totalChunks": 145,
  "totalCharacters": 145000,
  "hasData": true
}
```

## 🎯 Features

### Backend Features
- ✅ Gemini AI integration (gemini-2.0-flash-lite model)
- ✅ PDF parsing and processing (supports large PDFs)
- ✅ RAG (Retrieval-Augmented Generation)
- ✅ Semantic search for relevant context
- ✅ In-memory vector store
- ✅ CORS enabled
- ✅ Comprehensive error handling
- ✅ File upload with size validation

### Frontend Features
- ✅ Modern, minimal UI with Tailwind CSS
- ✅ Real-time chat interface
- ✅ Unique chat IDs with URL parameters
- ✅ Local storage for chat history
- ✅ Responsive design
- ✅ Smooth animations
- ✅ PDF upload interface
- ✅ API status indicator

## 🔍 How RAG Works

1. **PDF Upload**: Large PDF is processed and split into chunks
2. **Chunking**: Text divided into 1000-character chunks with 200-character overlap
3. **Storage**: Chunks stored in memory with metadata
4. **Query**: User asks a question
5. **Retrieval**: System finds most relevant chunks using Gemini for semantic similarity scoring
6. **Augmentation**: Top 3 relevant chunks are added to the prompt as context
7. **Generation**: Gemini AI generates response using the retrieved context

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `GEMINI_API_KEY` is set in `.env`
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires v18+)

### Frontend can't connect
- Ensure backend is running (`http://localhost:3000`)
- Check browser console for CORS errors
- Verify `ALLOWED_ORIGINS` in backend `.env` includes your frontend URL
- Try accessing health check: `http://localhost:3000/api/health`

### PDF upload fails
- Check file size (max 50MB)
- Ensure file is a valid PDF
- Check backend logs for detailed error messages
- Verify backend has enough memory

### Bot gives generic answers
- Make sure you've uploaded a PDF first
- Check if PDF was processed successfully: `GET http://localhost:3000/api/pdf/stats`
- Try asking questions that are specifically about the PDF content
- Check backend logs to see if context is being retrieved

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:8000,http://127.0.0.1:5500
```
- Restart the backend server after changing `.env`

## 📊 Testing the Setup

1. **Test backend health:**
```bash
curl http://localhost:3000/api/health
```

2. **Upload a test PDF:**
```bash
curl -X POST http://localhost:3000/api/pdf/upload -F "pdf=@test.pdf"
```

3. **Check stats:**
```bash
curl http://localhost:3000/api/pdf/stats
```

4. **Test chat:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is this document about?", "chatId": "test_123"}'
```

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name bge-chatbot
pm2 save
pm2 startup
```
3. Consider using a proper vector database (Pinecone, Weaviate, Chroma)
4. Add rate limiting and authentication
5. Use environment variables for sensitive data
6. Deploy to a cloud service (AWS, Google Cloud, Heroku)

### Frontend
1. Update API URL in `app.js` to production backend URL
2. Deploy to hosting service (Vercel, Netlify, GitHub Pages)
3. Enable HTTPS
4. Configure proper CORS origins in backend

## 💡 Tips & Best Practices

### For Better Results
- **Question Quality**: Ask specific, clear questions for better results
- **PDF Quality**: Ensure PDFs have selectable text (not scanned images)
- **Context Size**: The system retrieves top 3 chunks - make sure your PDF is well-structured
- **Question Scope**: Questions closely related to PDF content will get better answers

### Performance Tips
- **Large PDFs**: The larger the PDF, the more chunks created, which may slow down search
- **Chunk Size**: Default is 1000 characters with 200 overlap - adjust in `ragService.js` if needed
- **Search Speed**: Semantic search queries Gemini for scoring, which can be slow. For production, use embeddings and vector databases

### Development Tips
- Use `npm run dev` for auto-reload during development
- Check backend logs for debugging
- Use browser DevTools Network tab to inspect API calls
- Test with small PDFs first before uploading large documents

## 🔐 Security Considerations

- Never commit `.env` file with real API keys
- Use environment variables for all sensitive data
- Implement rate limiting in production
- Add authentication for PDF upload endpoint
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement file upload size limits
- Scan uploaded files for malware in production

## 📝 Project Files

- `index.html` - Main chat interface
- `upload.html` - PDF upload interface
- `app.js` - Frontend JavaScript logic
- `backend/server.js` - Express server setup
- `backend/routes/chat.js` - Chat API routes
- `backend/routes/pdf.js` - PDF upload routes
- `backend/services/ragService.js` - RAG implementation
- `backend/.env` - Environment configuration (not in git)

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [RAG Overview](https://www.pinecone.io/learn/retrieval-augmented-generation/)

## 📞 Support

For issues and questions:
1. Check this README first
2. Check backend logs for errors
3. Check browser console for frontend errors
4. Open an issue on the repository with:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Made with ⚡ by BGE ELECTRIQUE**
