# ✅ Quick Start Checklist

Follow these steps to get your BGE Electrique chatbot running with Qdrant:

## 1️⃣ Setup Qdrant (5 minutes)

- [ ] Go to https://cloud.qdrant.io
- [ ] Sign up / Log in
- [ ] Click "Create Cluster" → Choose Free Tier
- [ ] Wait for cluster creation (~2 minutes)
- [ ] Copy your **Cluster URL** (looks like: `https://xxxxx.qdrant.io:6333`)
- [ ] Copy your **API Key** (you should already have this)

## 2️⃣ Configure Backend (2 minutes)

- [ ] Open `backend/.env` in a text editor
- [ ] Update `QDRANT_URL=` with your cluster URL
- [ ] Verify `GEMINI_API_KEY=` is set
- [ ] Verify `QDRANT_API_KEY=` is set
- [ ] Save the file

**Your .env should look like:**
```env
GEMINI_API_KEY=AIzaSyAKVcrRwoCADaIFneBXLwLyV_sNBuTRzCA
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
QDRANT_URL=https://YOUR-CLUSTER-URL.qdrant.io:6333
QDRANT_COLLECTION_NAME=bge_electrique_docs
PORT=3000
```

## 3️⃣ Install Dependencies (1 minute)

- [ ] Open PowerShell/Terminal
- [ ] Navigate to project: `cd backend`
- [ ] Run: `npm install`
- [ ] Wait for installation to complete

## 4️⃣ Start Backend Server (1 minute)

- [ ] In backend folder, run: `npm start`
- [ ] Look for: `✓ Server running on port 3000`
- [ ] Look for: `✓ Gemini AI initialized`
- [ ] Keep this terminal window open

## 5️⃣ Start Frontend Server (1 minute)

Open a **NEW** terminal window:

**Option A: Python**
```bash
python -m http.server 8000
```

**Option B: Node.js**
```bash
npx http-server -p 8000
```

**Option C: VS Code**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

## 6️⃣ Upload PDF (3-5 minutes)

- [ ] Open browser: `http://localhost:8000`
- [ ] Click **"UPLOAD PDF"** button in header
- [ ] Drag and drop `codebook.pdf` or click to select
- [ ] Wait for upload and processing
  - Small PDFs: ~1 minute
  - Large PDFs: ~3-5 minutes
- [ ] You'll see progress in console
- [ ] Success message when done

**What happens during upload:**
- ✂️ PDF split into chunks (1000 chars each)
- 🧠 Each chunk converted to embedding (768-dim vector)
- 💾 Embeddings stored in Qdrant
- ⚡ Takes ~1 second per chunk

## 7️⃣ Start Chatting! 🎉

- [ ] Click "NEW CHAT" or just start typing
- [ ] Ask questions about your PDF:
  - "What is this document about?"
  - "Summarize the key points"
  - "Explain [specific topic] from the PDF"
- [ ] Bot will answer using PDF context!

---

## ✅ Verification Checklist

Test these to make sure everything works:

### Backend Health
```bash
curl http://localhost:3000/api/health
```
**Expected:** `{"status":"ok"}`

### PDF Stats
```bash
curl http://localhost:3000/api/pdf/stats
```
**Expected:**
```json
{
  "totalChunks": 150,
  "vectorSize": 768,
  "hasData": true,
  "collectionName": "bge_electrique_docs"
}
```

### Chat Test
Open browser console (F12) and check:
- ✅ No CORS errors
- ✅ API responses in Network tab
- ✅ Bot messages appear with context

---

## 🚨 Common Issues

### ❌ "Connection refused" on port 3000
**Solution:** Backend not running. Go to terminal and run `cd backend && npm start`

### ❌ "CORS error"
**Solution:** 
1. Check frontend URL in browser (should be localhost:8000 or 127.0.0.1)
2. Add to `ALLOWED_ORIGINS` in .env if using different port

### ❌ "Qdrant connection failed"
**Solution:** 
1. Check `QDRANT_URL` is correct (copy from Qdrant Cloud dashboard)
2. Verify API key is correct
3. Check Qdrant cluster is running (green status in dashboard)

### ❌ PDF upload shows "Processing..." forever
**Solution:**
1. Check backend terminal for errors
2. Check PDF file size (must be <50MB)
3. Large PDFs take time (3-5 min for 100+ pages is normal)
4. Look for progress in console: "Processed chunk X/Y"

### ❌ Bot gives generic answers
**Solution:**
1. Ensure PDF was uploaded successfully
2. Check `/api/pdf/stats` shows `hasData: true` and `totalChunks > 0`
3. Try more specific questions related to PDF content

---

## 📊 Expected Performance

| Action | Time |
|--------|------|
| Backend start | ~2 seconds |
| Frontend start | Instant |
| PDF upload (small 10 pages) | ~30 seconds |
| PDF upload (medium 50 pages) | ~2 minutes |
| PDF upload (large 200+ pages) | ~5-10 minutes |
| Chat response | ~2-5 seconds |
| Vector search in Qdrant | <100ms |

---

## 🎓 Tips for Best Results

1. **Ask Specific Questions**
   - ❌ "Tell me about this"
   - ✅ "What are the safety protocols mentioned in section 3?"

2. **Reference PDF Content**
   - ❌ "How does electricity work?"
   - ✅ "According to the codebook, what is the voltage specification?"

3. **Break Down Complex Questions**
   - ❌ "Explain everything about electrical installation"
   - ✅ First ask: "What are the main components?"
   - ✅ Then ask: "How is component X installed?"

4. **Check Context Quality**
   - If answers are vague, PDF might not have relevant info
   - Try rephrasing question to match PDF terminology
   - Check if PDF text is selectable (not scanned images)

---

## 🎉 You're All Set!

Your BGE Electrique chatbot is now running with:
- ✅ Gemini AI for intelligent responses
- ✅ Qdrant vector database for semantic search
- ✅ RAG system for PDF-based answers
- ✅ Modern, responsive UI

**Enjoy chatting with your PDF! 🚀**

---

## 📚 Learn More

- **QDRANT_SETUP.md** - Detailed Qdrant configuration
- **README.md** - Full project documentation
- **SETUP.md** - Step-by-step setup guide
- **backend/README.md** - API documentation

## 🆘 Need Help?

1. Check backend console for errors
2. Check browser console (F12) for frontend errors
3. Review the troubleshooting sections in README.md
4. Check Qdrant dashboard for collection status
5. Verify all API keys are correct in .env
