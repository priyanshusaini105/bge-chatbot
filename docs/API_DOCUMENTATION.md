# 🚀 BGE ELECTRIQUE Chatbot API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000`  
**Last Updated**: October 16, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Chat Message](#chat-message)
   - [Chat Stream](#chat-stream)
   - [PDF Upload](#pdf-upload)
   - [PDF Stats](#pdf-stats)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## 🌟 Overview

The BGE ELECTRIQUE Chatbot API provides a RAG-powered (Retrieval Augmented Generation) conversational AI system specialized in electrical systems, installations, and services. The API uses Gemini AI for natural language processing and Qdrant for vector-based document retrieval.

### Key Features
- ✅ Context-aware responses using RAG
- ✅ PDF document upload and processing
- ✅ Real-time and streaming chat responses
- ✅ Vector-based semantic search
- ✅ Markdown-formatted responses

---

## 🔐 Authentication

Currently, the API does not require authentication for development. For production deployment, implement:
- API key authentication
- OAuth 2.0
- JWT tokens

**CORS Configuration:**
- Allowed Origins: `http://localhost:5500`, `http://localhost:8000`, `http://127.0.0.1:5500`
- Credentials: Enabled
- Methods: GET, POST, OPTIONS

---

## 📡 Endpoints

### Health Check

Check if the API server is running and healthy.

#### `GET /api/health`

**Description**: Returns the health status of the API server.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "status": "ok",
  "message": "BGE ELECTRIQUE Chatbot API is running",
  "timestamp": "2025-10-16T14:27:05.830Z"
}
```

**Status Codes:**
- `200 OK` - Server is healthy and running

**Example (cURL):**
```bash
curl -X GET http://localhost:3000/api/health
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/health');
const data = await response.json();
console.log(data.status); // "ok"
```

---

### Chat Message

Send a message to the chatbot and receive an AI-generated response.

#### `POST /api/chat/message`

**Description**: Sends a user message and receives a context-aware response from the chatbot using RAG.

**Request:**
```http
POST /api/chat/message HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "message": "What are the safety requirements for electrical work?",
  "chatId": "chat_1234567890"
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The user's message/question (max length: 5000 chars) |
| `chatId` | string | No | Unique chat session identifier for conversation tracking |

**Response:**
```json
{
  "response": "Here are the safety requirements for electrical work:\n\n* **Disconnection:** Repairs on live equipment are prohibited...",
  "chatId": "chat_1234567890",
  "timestamp": "2025-10-16T14:30:15.123Z",
  "hasContext": true
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `response` | string | AI-generated response (markdown formatted) |
| `chatId` | string | Chat session identifier |
| `timestamp` | string | ISO 8601 timestamp of response |
| `hasContext` | boolean | Whether relevant context was found in the knowledge base |

**Status Codes:**
- `200 OK` - Successfully generated response
- `400 Bad Request` - Missing or invalid message
- `500 Internal Server Error` - AI generation failed

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are grounding requirements?",
    "chatId": "chat_123"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'What are grounding requirements?',
    chatId: 'chat_' + Date.now()
  })
});

const data = await response.json();
console.log(data.response); // AI-generated response
console.log(data.hasContext); // true/false
```

**Example (Python):**
```python
import requests

response = requests.post(
    'http://localhost:3000/api/chat/message',
    json={
        'message': 'What are grounding requirements?',
        'chatId': 'chat_123'
    }
)

data = response.json()
print(data['response'])
```

---

### Chat Stream

Stream a chat response in real-time (Server-Sent Events).

#### `POST /api/chat/stream`

**Description**: Sends a message and streams the AI response in chunks for real-time display.

**Request:**
```http
POST /api/chat/stream HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "message": "Explain electrical safety in detail"
}
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | The user's message/question |

**Response (Server-Sent Events):**
```
data: {"text":"Electrical"}

data: {"text":" safety"}

data: {"text":" involves"}

data: [DONE]
```

**Response Format:**
- Content-Type: `text/event-stream`
- Each chunk: `data: {"text": "chunk content"}\n\n`
- End marker: `data: [DONE]\n\n`

**Status Codes:**
- `200 OK` - Stream started successfully
- `400 Bad Request` - Missing or invalid message
- `500 Internal Server Error` - Streaming failed

**Example (JavaScript - EventSource):**
```javascript
// Note: EventSource doesn't support POST, use fetch with ReadableStream
const response = await fetch('http://localhost:3000/api/chat/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Explain electrical safety'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream complete');
      } else {
        const parsed = JSON.parse(data);
        console.log(parsed.text); // Display chunk
      }
    }
  }
}
```

---

### PDF Upload

Upload and process a PDF document for the knowledge base.

#### `POST /api/pdf/upload`

**Description**: Uploads a PDF file, extracts text, generates embeddings, and stores in Qdrant vector database.

**Request:**
```http
POST /api/pdf/upload HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="pdf"; filename="document.pdf"
Content-Type: application/pdf

[PDF binary data]
------WebKitFormBoundary--
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pdf` | file | Yes | PDF file to upload (max size: 50MB) |

**Response:**
```json
{
  "message": "PDF processed successfully",
  "fileName": "document.pdf",
  "chunks": 150,
  "success": true
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `fileName` | string | Name of the uploaded file |
| `chunks` | number | Number of text chunks created |
| `success` | boolean | Processing status |

**Status Codes:**
- `200 OK` - PDF processed successfully
- `400 Bad Request` - No file uploaded or invalid file type
- `500 Internal Server Error` - Processing failed

**Processing Details:**
1. PDF text extraction
2. Text chunking (1000 chars with 200 char overlap)
3. Embedding generation (768-dimensional vectors)
4. Storage in Qdrant collection
5. Processing time: 3-5 minutes for large PDFs

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/pdf/upload \
  -F "pdf=@/path/to/document.pdf"
```

**Example (JavaScript - FormData):**
```javascript
const formData = new FormData();
formData.append('pdf', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/pdf/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(`Processed ${data.chunks} chunks`);
```

**Example (Python):**
```python
import requests

files = {'pdf': open('document.pdf', 'rb')}
response = requests.post(
    'http://localhost:3000/api/pdf/upload',
    files=files
)

data = response.json()
print(f"Processed {data['chunks']} chunks")
```

---

### PDF Stats

Get statistics about the vector database.

#### `GET /api/pdf/stats`

**Description**: Returns statistics about the Qdrant vector store including total chunks and collection info.

**Request:**
```http
GET /api/pdf/stats HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "totalChunks": 2719,
  "vectorSize": 768,
  "hasData": true,
  "collectionName": "bge_electrique_docs"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `totalChunks` | number | Total number of document chunks stored |
| `vectorSize` | number | Dimension of embedding vectors |
| `hasData` | boolean | Whether any data exists in the collection |
| `collectionName` | string | Name of the Qdrant collection |
| `error` | string | Error message (if any) |

**Status Codes:**
- `200 OK` - Stats retrieved successfully
- `500 Internal Server Error` - Failed to retrieve stats

**Example (cURL):**
```bash
curl -X GET http://localhost:3000/api/pdf/stats
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/pdf/stats');
const data = await response.json();

console.log(`Total chunks: ${data.totalChunks}`);
console.log(`Has data: ${data.hasData}`);
```

---

## ❌ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "stack": "Stack trace (development only)"
}
```

### Common Error Codes

| Status Code | Description | Possible Causes |
|-------------|-------------|-----------------|
| `400 Bad Request` | Invalid request parameters | Missing required fields, invalid data format |
| `404 Not Found` | Endpoint not found | Wrong URL or method |
| `500 Internal Server Error` | Server error | AI service failure, database error |

### Example Error Responses

**400 Bad Request:**
```json
{
  "error": "Message is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to generate response",
  "message": "API key not valid. Please pass a valid API key."
}
```

---

## ⚡ Rate Limiting

**Current Status**: Not implemented (development mode)

**Recommended for Production:**
- Requests per minute: 60
- Requests per hour: 1000
- PDF uploads per day: 100

**Rate Limit Response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 📖 Examples

### Complete Chat Flow

```javascript
// 1. Check API health
const health = await fetch('http://localhost:3000/api/health')
  .then(r => r.json());
console.log(health.status); // "ok"

// 2. Check knowledge base stats
const stats = await fetch('http://localhost:3000/api/pdf/stats')
  .then(r => r.json());
console.log(`Knowledge base has ${stats.totalChunks} chunks`);

// 3. Send a message
const chatResponse = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What are the safety requirements?',
    chatId: 'chat_' + Date.now()
  })
}).then(r => r.json());

console.log(chatResponse.response); // AI response
console.log(chatResponse.hasContext); // true if context found
```

### Upload and Query Flow

```javascript
// 1. Upload a PDF
const formData = new FormData();
formData.append('pdf', pdfFile);

const uploadResponse = await fetch('http://localhost:3000/api/pdf/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json());

console.log(`Uploaded: ${uploadResponse.chunks} chunks created`);

// 2. Wait for processing (3-5 minutes for large files)
await new Promise(resolve => setTimeout(resolve, 180000));

// 3. Query with new context
const queryResponse = await fetch('http://localhost:3000/api/chat/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What does the document say about safety?',
    chatId: 'chat_' + Date.now()
  })
}).then(r => r.json());

console.log(queryResponse.response); // Should include new document context
```

---

## 🔧 Configuration

### Environment Variables

```env
# Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Qdrant Configuration (Required)
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_COLLECTION_NAME=bge_electrique_docs

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5500,http://localhost:8000
```

### Models Used

**AI Model**: `gemini-2.0-flash-lite`
- Fast and cost-effective
- Good for conversational responses
- Supports markdown output

**Embedding Model**: `text-embedding-004`
- 768-dimensional vectors
- Optimized for semantic search
- High accuracy for technical documents

---

## 📊 Response Times

**Average Response Times** (after initialization):

| Endpoint | Average Time | Notes |
|----------|--------------|-------|
| `/api/health` | < 50ms | Simple health check |
| `/api/pdf/stats` | < 200ms | Database query |
| `/api/chat/message` | 5-10s | AI generation + RAG |
| `/api/chat/stream` | 5-10s | Streamed response |
| `/api/pdf/upload` | 3-5 min | Depends on PDF size |

**First Request**: ~30-40 seconds (cold start + model initialization)

---

## 🔒 Security Notes

### Production Deployment Checklist:
- [ ] Add API authentication
- [ ] Implement rate limiting
- [ ] Enable HTTPS/TLS
- [ ] Sanitize user inputs
- [ ] Add request validation
- [ ] Implement logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure proper CORS for production domains
- [ ] Add file upload virus scanning
- [ ] Implement request timeout limits

---

## 📞 Support

**Issues**: [GitHub Issues](https://github.com/priyanshusaini105/bge-chatbot/issues)  
**Email**: support@bge-electrique.com  
**Documentation**: This file

---

## 📝 Changelog

### Version 1.0.0 (2025-10-16)
- ✅ Initial API release
- ✅ Chat message endpoint with RAG
- ✅ PDF upload and processing
- ✅ Streaming chat support
- ✅ Vector database integration
- ✅ Health check endpoint
- ✅ Stats endpoint

---

**Last Updated**: October 16, 2025  
**API Version**: 1.0.0  
**Status**: Production Ready ✅
