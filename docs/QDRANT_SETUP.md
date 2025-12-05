# Qdrant Setup Guide for BGE Electrique Chatbot

## What is Qdrant?

Qdrant is a vector database designed for high-performance semantic search. It stores embeddings (vector representations of text) and allows fast similarity searches.

## Setup Options

### Option 1: Qdrant Cloud (Recommended)

1. **Create Qdrant Cloud Account**
   - Go to https://cloud.qdrant.io/
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Create Cluster"
   - Choose "Free Tier" (1GB storage)
   - Select a region close to you
   - Wait for cluster to be created (takes 1-2 minutes)

3. **Get Your Cluster URL**
   - Once created, click on your cluster
   - Copy the **Cluster URL** (looks like: `https://xxxxxx-xxxx-xxxx.aws.cloud.qdrant.io:6333`)
   - Copy the **API Key** (already in your .env file)

4. **Update .env File**
   - Open `backend/.env`
   - Replace `QDRANT_URL=https://your-cluster-url.qdrant.io:6333` with your actual cluster URL
   - Example: `QDRANT_URL=https://abc123-def456.aws.cloud.qdrant.io:6333`

### Option 2: Local Qdrant (Docker)

1. **Install Docker**
   - Download Docker Desktop from https://www.docker.com/products/docker-desktop

2. **Run Qdrant Container**
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

3. **Update .env File**
   ```
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=  # Leave empty for local
   ```

## Installation Steps

1. **Install Qdrant Client Package**
   ```bash
   cd backend
   npm install
   ```

2. **Verify Configuration**
   - Check that `backend/.env` has:
     - `GEMINI_API_KEY` ✓
     - `QDRANT_API_KEY` ✓
     - `QDRANT_URL` (update with your cluster URL)

3. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

4. **Upload PDF**
   - Open `upload.html` in browser
   - Drag and drop `codebook.pdf`
   - Wait for processing (may take 2-5 minutes for large PDFs)
   - Check console for progress

## How It Works

1. **PDF Upload**
   - PDF is parsed into text
   - Text is split into 1000-character chunks with 200-character overlap
   - Each chunk is sent to Gemini to generate embeddings (768-dimensional vectors)
   - Embeddings are stored in Qdrant with metadata (text, filename, chunk index)

2. **Chat Query**
   - User question is converted to embedding using Gemini
   - Qdrant finds the 5 most similar chunks (cosine similarity)
   - Similar chunks are used as context for Gemini to answer the question

## Qdrant Collection Details

- **Collection Name**: `bge_electrique_docs`
- **Vector Dimension**: 768 (Gemini text-embedding-004)
- **Distance Metric**: Cosine Similarity
- **Similarity Threshold**: 0.5 (only chunks with >50% similarity are used)

## Checking Qdrant Status

### Via API (Qdrant Cloud or Local)
Visit: `http://localhost:3000/api/pdf/stats`

Response:
```json
{
  "totalChunks": 150,
  "vectorSize": 768,
  "hasData": true,
  "collectionName": "bge_electrique_docs"
}
```

### Via Qdrant Dashboard (Cloud Only)
- Go to your cluster in Qdrant Cloud
- Click "Collections"
- View `bge_electrique_docs` collection stats

## Troubleshooting

### Error: "Collection not found"
- The collection will be created automatically on first PDF upload
- Just upload your PDF and it will initialize

### Error: "Connection refused"
- **Cloud**: Check your `QDRANT_URL` is correct
- **Local**: Make sure Docker container is running: `docker ps`

### Error: "Unauthorized"
- **Cloud**: Verify `QDRANT_API_KEY` is correct
- **Local**: Remove `QDRANT_API_KEY` from .env

### Slow Embedding Generation
- Normal for large PDFs (codebook.pdf may take 3-5 minutes)
- Each chunk needs an API call to Gemini
- Progress is logged in console

### No Results Found
- Check similarity threshold (currently 0.5)
- Try more specific questions
- Verify PDF was uploaded successfully via `/api/pdf/stats`

## Performance Optimization

### Batch Processing
- Embeddings are generated in batches of 10 chunks
- Reduces API calls and speeds up upload

### Similarity Threshold
- Current: 0.5 (50% similarity)
- Lower = more results (less strict)
- Higher = fewer results (more strict)
- Adjust in `ragService.js`: `score_threshold: 0.5`

### Top K Results
- Current: 5 chunks per query
- More chunks = more context but slower
- Adjust in `chat.js`: `getRelevantContext(userMessage, 5)`

## Cost Considerations

### Qdrant Cloud Free Tier
- 1GB storage (approximately 1-2 million vectors)
- Sufficient for most PDF documents
- No credit card required

### Gemini API
- Embeddings: $0.00001 per 1000 characters
- Chat: $0.075 per 1 million input tokens
- Free tier: $0 for first month
- Check usage: https://aistudio.google.com/app/apikey

## Next Steps

1. Update your `QDRANT_URL` in `backend/.env`
2. Run `cd backend && npm install`
3. Start backend: `npm start`
4. Upload `codebook.pdf` via `upload.html`
5. Start chatting!

## Support

For issues:
- Qdrant Docs: https://qdrant.tech/documentation/
- Gemini Docs: https://ai.google.dev/docs
- Check backend logs for detailed error messages
