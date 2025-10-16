# ⚡ START HERE - Qdrant Setup in 5 Minutes

## 🎯 What You Need To Do Right Now

Your chatbot code is ready! You just need to:
1. Get your Qdrant cluster URL (2 minutes)
2. Update one line in .env (30 seconds)
3. Start the servers (1 minute)
4. Upload your PDF (2-5 minutes)

Let's go! 🚀

---

## Step 1: Get Qdrant Cluster URL (2 minutes)

### Option A: Qdrant Cloud (Recommended - Free)

1. Open: https://cloud.qdrant.io
2. Click **"Sign Up"** or **"Log In"**
3. Click **"Create Cluster"**
4. Choose **"Free Tier"** (1GB free)
5. Click **"Create"**
6. Wait ~2 minutes for cluster creation
7. Click on your cluster name
8. **Copy the Cluster URL** - looks like:
   ```
   https://abc123-def456-ghi789.aws.cloud.qdrant.io:6333
   ```
   ✅ Got it? Move to Step 2!

### Option B: Local Qdrant (Advanced - Docker)

```bash
docker run -p 6333:6333 qdrant/qdrant
```
Your URL will be: `http://localhost:6333`

---

## Step 2: Update .env File (30 seconds)

1. Open this file: `backend\.env`
2. Find this line:
   ```
   QDRANT_URL=https://your-cluster-url.qdrant.io:6333
   ```
3. Replace it with YOUR cluster URL from Step 1:
   ```
   QDRANT_URL=https://abc123-def456-ghi789.aws.cloud.qdrant.io:6333
   ```
4. Save the file (Ctrl+S)

✅ Done? Move to Step 3!

---

## Step 3: Start Backend Server (1 minute)

### Windows:
Double-click `start-backend.bat`

### Or manually:
```bash
cd backend
npm start
```

**✅ Success looks like:**
```
✓ Server running on port 3000
✓ Gemini AI initialized
```

**❌ If you see errors about missing packages:**
```bash
cd backend
npm install
npm start
```

Keep this terminal window open!

---

## Step 4: Start Frontend (30 seconds)

Open **NEW** terminal/PowerShell:

### Option A: Python
```bash
python -m http.server 8000
```

### Option B: Node.js
```bash
npx http-server -p 8000
```

### Option C: VS Code
Right-click `index.html` → "Open with Live Server"

✅ Keep this terminal open too!

---

## Step 5: Upload Your PDF (2-5 minutes)

1. Open browser: **http://localhost:8000**
2. Click **"UPLOAD PDF"** button (top right)
3. Drag & drop `codebook.pdf` or click to select
4. Wait for processing:
   - Small PDF (10 pages): ~30 seconds
   - Medium PDF (50 pages): ~2 minutes
   - Large PDF (200+ pages): ~5 minutes

**Watch the progress:**
- You'll see "Processing..." with percentage
- Backend terminal shows: "Processed chunk X/Y"
- Success message when complete

✅ Upload complete!

---

## Step 6: Start Chatting! 🎉

1. Click **"NEW CHAT"** or just start typing
2. Try these questions:
   - "What is this document about?"
   - "Summarize the main topics"
   - "Explain [specific topic from PDF]"
3. Watch the bot answer using your PDF!

---

## ✅ Quick Verification

### Is backend running?
Open: http://localhost:3000/api/health
See: `{"status":"ok"}` ✅

### Is PDF uploaded?
Open: http://localhost:3000/api/pdf/stats
See: `{"totalChunks":150,"hasData":true}` ✅

### Is frontend working?
Open: http://localhost:8000
See: BGE ELECTRIQUE header ✅

---

## 🚨 Troubleshooting

### ❌ "Cannot connect to backend"
**Fix:** Backend not running. Run `cd backend && npm start`

### ❌ "Qdrant connection failed"
**Fix:** 
1. Check QDRANT_URL in .env is correct
2. Verify cluster is running in Qdrant Cloud dashboard
3. Check for typos (common mistake: missing https://)

### ❌ PDF upload stuck at "Processing..."
**Fix:**
- Check backend terminal for errors
- Large PDFs take time (3-5 min is normal)
- If error appears, try smaller PDF first to test

### ❌ Bot gives generic answers
**Fix:**
1. Verify PDF uploaded: check http://localhost:3000/api/pdf/stats
2. Make sure questions relate to PDF content
3. Try more specific questions

---

## 📊 What to Expect

### First PDF Upload:
```
[14:23:45] Parsing PDF...
[14:23:47] Created 150 chunks
[14:23:47] Generating embeddings...
[14:23:50] Processed chunk 1/150
[14:23:52] Processed chunk 2/150
...
[14:26:30] Processed chunk 150/150
[14:26:32] Successfully uploaded 150 chunks to Qdrant
```

### Chat Response:
```
You: What are the safety protocols?

[Bot thinking...]

Bot: Based on the codebook, the main safety protocols are:
1. [Specific detail from your PDF]
2. [Another detail from your PDF]
...
```

---

## 🎓 Pro Tips

### Better Questions = Better Answers
- ❌ "Tell me about this"
- ✅ "What are the voltage specifications in section 3?"

### Use PDF Terminology
- ❌ "How does it work?"
- ✅ "According to the codebook, how is X installed?"

### Be Specific
- ❌ "Explain everything"
- ✅ "What are the 3 main components?"

---

## 📚 Need More Help?

After you get it running, check these for details:
- **QUICK_START_CHECKLIST.md** - Detailed checklist
- **QDRANT_SETUP.md** - Complete Qdrant guide
- **ARCHITECTURE.md** - How it all works
- **README.md** - Full documentation

---

## 🎉 That's It!

You now have:
- ✅ Gemini AI for smart responses
- ✅ Qdrant vector database for fast search
- ✅ RAG system for PDF-based answers
- ✅ Modern, beautiful UI

**Total setup time: ~5-10 minutes**

**Enjoy your AI chatbot! 🚀**

---

## 🆘 Still Stuck?

1. Check **both** terminals are running (backend + frontend)
2. Check QDRANT_URL in .env has no typos
3. Verify API keys are correct
4. Try uploading a small PDF first to test
5. Check browser console (F12) for errors
6. Check backend terminal for error messages

**Common gotcha:** Make sure QDRANT_URL includes `https://` and `:6333` port!

Example: ✅ `https://abc123.qdrant.io:6333`
Not: ❌ `abc123.qdrant.io` (missing https and port)
