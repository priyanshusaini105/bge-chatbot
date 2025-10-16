# 📘 API Quick Reference Guide

Quick reference for BGE ELECTRIQUE Chatbot API endpoints.

---

## Base URL
```
http://localhost:3000
```

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat/message` | POST | Send chat message |
| `/api/chat/stream` | POST | Stream chat response |
| `/api/pdf/upload` | POST | Upload PDF document |
| `/api/pdf/stats` | GET | Get database stats |

---

## Quick Examples

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Send Chat Message
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What are safety requirements?","chatId":"chat_123"}'
```

### Upload PDF
```bash
curl -X POST http://localhost:3000/api/pdf/upload \
  -F "pdf=@document.pdf"
```

### Get Stats
```bash
curl http://localhost:3000/api/pdf/stats
```

---

## JavaScript Examples

### Chat Message
```javascript
const response = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Your question here',
    chatId: 'chat_' + Date.now()
  })
});
const data = await response.json();
console.log(data.response);
```

### Upload PDF
```javascript
const formData = new FormData();
formData.append('pdf', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/pdf/upload', {
  method: 'POST',
  body: formData
});
const data = await response.json();
console.log(`Created ${data.chunks} chunks`);
```

---

## Response Formats

### Chat Response
```json
{
  "response": "AI-generated answer with markdown",
  "chatId": "chat_123",
  "timestamp": "2025-10-16T14:30:15.123Z",
  "hasContext": true
}
```

### Upload Response
```json
{
  "message": "PDF processed successfully",
  "fileName": "document.pdf",
  "chunks": 150,
  "success": true
}
```

### Stats Response
```json
{
  "totalChunks": 2719,
  "vectorSize": 768,
  "hasData": true,
  "collectionName": "bge_electrique_docs"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid data) |
| 404 | Not Found (wrong endpoint) |
| 500 | Server Error (API failure) |

---

## Notes

- ⏱️ First chat request: ~30-40s (cold start)
- ⏱️ Subsequent requests: 5-10s
- 📁 Max PDF size: 50MB
- 📊 PDF processing: 3-5 minutes
- 🔧 Embedding dimensions: 768
- 🤖 AI Model: gemini-2.0-flash-lite

---

For full documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
