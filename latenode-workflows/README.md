# Latenode Workflows for BGE Chatbot APIs

This directory contains Latenode-compatible JavaScript workflows that replicate your backend API functionality. These workflows can be deployed directly to Latenode's platform, eliminating the need for a separate backend server.

## 📁 Workflow Files

### 1. `chat-message.js`
**Equivalent to:** `POST /api/chat/message`

Handles chat messages using RAG (Retrieval Augmented Generation) with Qdrant and Google Gemini.

**Features:**
- Retrieves relevant context from Qdrant vector store
- Generates AI responses using Gemini 2.0 Flash Lite
- Returns structured JSON response
- Includes custom parameters for easy configuration

### 2. `chat-stream.js`
**Equivalent to:** `POST /api/chat/stream`

Streaming version of the chat endpoint (with Latenode limitations).

**Features:**
- Same RAG capabilities as chat-message
- Collects streaming chunks
- Returns complete response with chunk information
- Note: Full SSE streaming may be limited in Latenode

### 3. `pdf-upload.js`
**Equivalent to:** `POST /api/pdf/upload`

Processes PDF files and stores embeddings in Qdrant.

**Features:**
- Parses PDF files
- Splits text into overlapping chunks
- Generates embeddings using Google Gemini
- Uploads to Qdrant vector store
- Auto-creates collection if needed

## 🚀 Setup Instructions

### Prerequisites

1. **Latenode Account**
   - Sign up at [Latenode](https://latenode.com)
   - Create a new scenario

2. **Required Services**
   - Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
   - Qdrant instance (Cloud or self-hosted)
     - Cloud: [Qdrant Cloud](https://cloud.qdrant.io)
     - Self-hosted: [Qdrant Docker](https://qdrant.tech/documentation/quick-start/)

### Step-by-Step Setup

#### For Chat Message Workflow

1. **Create Scenario in Latenode**
   - Click "Create New Scenario"
   - Add "Trigger on Webhook" node
   - Add "JavaScript" node after the trigger

2. **Configure Webhook Trigger**
   - Set method to `POST`
   - Copy the webhook URL for later use
   - Expected body format:
     ```json
     {
       "message": "Your question here",
       "chatId": "optional-chat-id"
     }
     ```

3. **Add JavaScript Node**
   - Copy the content from `chat-message.js`
   - Paste into the JavaScript node editor
   - Click "Generate Parameters" button

4. **Configure Custom Parameters**
   - **Gemini API Key**: Your Google AI API key
   - **Qdrant URL**: Your Qdrant instance URL
   - **Qdrant API Key**: (Optional) Your Qdrant Cloud API key
   - **Collection Name**: `bge_electrique_docs` (or your custom name)
   - **Top K Results**: `5` (number of relevant chunks to retrieve)

5. **Save and Test**
   - Save the scenario
   - Wait for npm packages to install (takes 30-60 seconds)
   - Test with a sample message

#### For PDF Upload Workflow

1. **Create New Scenario**
   - Add "Trigger on Webhook" node
   - Configure to accept file uploads (multipart/form-data)

2. **Configure Webhook for File Upload**
   - Enable file upload in webhook settings
   - Expected form data:
     - Field name: `pdf`
     - File type: PDF

3. **Add JavaScript Node**
   - Copy content from `pdf-upload.js`
   - Generate parameters
   - Configure same API keys as chat workflow

4. **Configure Parameters**
   - Same Gemini and Qdrant settings
   - **Chunk Size**: `1000` (characters per chunk)
   - **Chunk Overlap**: `200` (overlap between chunks)

5. **Test Upload**
   - Upload a PDF via the webhook
   - Monitor execution logs
   - Check Qdrant collection for new vectors

#### For Streaming Workflow

Follow the same steps as Chat Message workflow, but use `chat-stream.js`.

**Note:** Due to Latenode's 2-minute execution limit, this workflow collects all chunks and returns them together rather than true streaming.

## 🔧 Configuration Reference

### Environment Variables (Custom Parameters)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `gemini_api_key` | string | Yes | - | Google Gemini API key |
| `qdrant_url` | string | Yes | - | Qdrant instance URL |
| `qdrant_api_key` | string | No | - | Qdrant API key (cloud only) |
| `collection_name` | string | No | `bge_electrique_docs` | Vector collection name |
| `top_k` | int | No | `5` | Number of relevant chunks |
| `chunk_size` | int | No | `1000` | PDF chunk size |
| `chunk_overlap` | int | No | `200` | Chunk overlap size |

### Webhook Input Format

**Chat Message:**
```json
{
  "message": "What are the electrical safety guidelines?",
  "chatId": "chat-123"
}
```

**PDF Upload:**
```
POST /your-webhook-url
Content-Type: multipart/form-data

pdf: [PDF file binary]
```

### Response Format

**Chat Message Response:**
```json
{
  "response": "AI generated response...",
  "chatId": "chat-123",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "hasContext": true,
  "relevantChunks": 3,
  "status": 200,
  "success": true
}
```

**PDF Upload Response:**
```json
{
  "success": true,
  "message": "PDF processed successfully",
  "fileName": "document.pdf",
  "chunks": 45,
  "textLength": 45000,
  "totalVectors": 150,
  "collectionName": "bge_electrique_docs",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "status": 200
}
```

## 📊 Workflow Architecture

```
┌─────────────────┐
│ Webhook Trigger │
│  (HTTP POST)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JavaScript     │
│     Node        │
│                 │
│ 1. Parse Input  │
│ 2. RAG Search   │
│ 3. AI Generate  │
│ 4. Return JSON  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Response      │
│  (JSON/SSE)     │
└─────────────────┘
```

## 🔍 Testing Examples

### Test Chat Message (cURL)

```bash
curl -X POST https://your-latenode-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the safety requirements for electrical installations?",
    "chatId": "test-123"
  }'
```

### Test Chat Message (PowerShell)

```powershell
$body = @{
    message = "What are the safety requirements for electrical installations?"
    chatId = "test-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-latenode-webhook-url" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Test PDF Upload (PowerShell)

```powershell
$filePath = "C:\path\to\your\document.pdf"
$webhook = "https://your-latenode-webhook-url"

$form = @{
    pdf = Get-Item -Path $filePath
}

Invoke-RestMethod -Uri $webhook `
    -Method POST `
    -Form $form
```

## 📝 Important Notes

### Limitations

1. **Execution Time**: Latenode has a 2-minute maximum execution time per node
   - For large PDFs (>50 pages), consider splitting the workflow
   - Use background processing for heavy tasks

2. **Streaming**: True SSE streaming is limited
   - Use the streaming workflow for chunk-based responses
   - Consider chat-message.js for most use cases

3. **File Size**: Maximum file size depends on your Latenode plan
   - Recommended: Keep PDFs under 50MB
   - Optimize PDFs before upload

4. **Rate Limits**: 
   - Google Gemini: 60 requests/minute (free tier)
   - Qdrant Cloud: Varies by plan
   - Consider adding rate limiting logic

### Best Practices

1. **Error Handling**: All workflows include comprehensive error handling
2. **Logging**: Use `console.log()` to debug in Latenode's Log tab
3. **Testing**: Always test with small files first
4. **Monitoring**: Monitor execution logs for performance issues
5. **Security**: Never hardcode API keys - use custom parameters

## 🆘 Troubleshooting

### Common Issues

**Issue: "Dependency installation is not yet completed"**
- **Solution**: Wait 30-60 seconds after saving the scenario before running

**Issue: "No relevant chunks found"**
- **Solution**: Ensure PDFs are uploaded and indexed in Qdrant first

**Issue: "API key not valid"**
- **Solution**: Verify your Gemini API key at Google AI Studio

**Issue: "Connection to Qdrant failed"**
- **Solution**: Check Qdrant URL and API key, ensure instance is running

**Issue: "Timeout error"**
- **Solution**: Reduce chunk_size or top_k parameters, or split large PDFs

## 🔗 Additional Resources

- [Latenode Documentation](https://help.latenode.com/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [LangChain JS Docs](https://js.langchain.com/docs/)

## 🎯 Next Steps

1. Set up your Latenode account
2. Create Qdrant instance (cloud or local)
3. Get Google Gemini API key
4. Deploy chat-message workflow first
5. Test with sample questions
6. Deploy pdf-upload workflow
7. Upload your first PDF
8. Integrate with your frontend

## 💡 Tips for Production

1. **Use Qdrant Cloud** for better reliability
2. **Set up monitoring** for execution failures
3. **Implement caching** for frequently asked questions
4. **Add authentication** to your webhooks
5. **Version your workflows** in Latenode
6. **Set up alerts** for errors
7. **Monitor costs** for API usage

## 📞 Support

For issues specific to:
- **Latenode Platform**: Contact Latenode support
- **Google Gemini**: Check Google AI Studio
- **Qdrant**: Visit Qdrant Discord/GitHub
- **This Implementation**: Review backend code in `/backend` directory

---

**Ready to deploy?** Start with the chat-message workflow and test with simple questions before moving to PDF uploads!
