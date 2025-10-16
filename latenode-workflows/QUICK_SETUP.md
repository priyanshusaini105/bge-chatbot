# Quick Setup Guide - Latenode Workflows

Get your BGE Chatbot APIs running on Latenode in 15 minutes!

## 🎯 Prerequisites Checklist

- [ ] Latenode account ([Sign up free](https://app.latenode.com/auth))
- [ ] Google Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))
- [ ] Qdrant instance running ([Cloud](https://cloud.qdrant.io) or [Docker](https://hub.docker.com/r/qdrant/qdrant))

## ⚡ Quick Start (5 Steps)

### Step 1: Set Up Qdrant (5 min)

**Option A: Qdrant Cloud (Recommended)**
```
1. Go to https://cloud.qdrant.io
2. Sign up for free account
3. Create new cluster
4. Copy your cluster URL and API key
```

**Option B: Local Docker**
```powershell
# Run Qdrant locally
docker run -p 6333:6333 -p 6334:6334 -v ${PWD}/qdrant_storage:/qdrant/storage:z qdrant/qdrant

# Your Qdrant URL: http://localhost:6333
```

### Step 2: Get Google Gemini API Key (2 min)

```
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with "AIza...")
4. Keep it secure!
```

### Step 3: Create Chat Workflow in Latenode (5 min)

1. **Login to Latenode**
   - Go to https://app.latenode.com
   - Create new scenario: "BGE Chat Message"

2. **Add Trigger**
   - Click "+" button
   - Select "Trigger on Webhook"
   - Method: `POST`
   - Copy webhook URL

3. **Add JavaScript Node**
   - Click "+" after webhook
   - Select "JavaScript" node
   - Copy entire content from `chat-message.js`
   - Paste into code editor

4. **Generate Parameters**
   - Click "Generate Parameters" button
   - Fill in the fields:
     ```
     Gemini API Key: AIza... (your key)
     Qdrant URL: https://your-cluster.cloud.qdrant.io
     Qdrant API Key: your-qdrant-key
     Collection Name: bge_electrique_docs
     Top K Results: 5
     ```

5. **Save & Wait**
   - Click "Save"
   - Wait 60 seconds for npm packages to install
   - Green checkmark means ready!

### Step 4: Create PDF Upload Workflow (5 min)

1. **Create New Scenario**
   - Name: "BGE PDF Upload"

2. **Add Webhook Trigger**
   - Method: `POST`
   - Enable file uploads
   - Copy webhook URL

3. **Add JavaScript Node**
   - Copy content from `pdf-upload.js`
   - Paste into editor
   - Generate parameters
   - Use same API keys from Step 3

4. **Save & Wait**
   - Save scenario
   - Wait for package installation

### Step 5: Test Your Workflows (3 min)

**Test Chat (PowerShell):**
```powershell
$webhook = "YOUR_CHAT_WEBHOOK_URL"
$body = @{
    message = "What are electrical safety guidelines?"
    chatId = "test-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri $webhook -Method POST -Body $body -ContentType "application/json"
```

**Test PDF Upload (PowerShell):**
```powershell
$webhook = "YOUR_PDF_WEBHOOK_URL"
$pdfPath = "C:\path\to\codebook.pdf"

curl.exe -X POST $webhook -F "pdf=@$pdfPath"
```

## 🎉 Success Indicators

✅ Chat workflow returns AI response
✅ PDF workflow shows chunk count
✅ No error messages in Latenode logs
✅ Qdrant collection contains vectors

## 📊 Verify Your Setup

### Check Qdrant Collection

**PowerShell:**
```powershell
# For Qdrant Cloud
$headers = @{
    "api-key" = "YOUR_QDRANT_API_KEY"
}
Invoke-RestMethod -Uri "https://your-cluster.cloud.qdrant.io/collections/bge_electrique_docs" -Headers $headers

# For Local Qdrant
Invoke-RestMethod -Uri "http://localhost:6333/collections/bge_electrique_docs"
```

**Expected Response:**
```json
{
  "result": {
    "status": "green",
    "points_count": 150,
    "vectors_count": 150
  }
}
```

## 🔧 Common Setup Issues

### Issue: "API key not valid"
```
❌ Problem: Invalid Gemini API key
✅ Solution:
1. Go to https://makersuite.google.com/app/apikey
2. Create new key
3. Update in Latenode custom parameters
4. Save and retry
```

### Issue: "Cannot connect to Qdrant"
```
❌ Problem: Qdrant URL incorrect or not running
✅ Solution:
1. Verify Qdrant is running (check cloud dashboard or Docker)
2. Test URL in browser: https://your-cluster.cloud.qdrant.io
3. Check API key is correct
4. Ensure no firewall blocking
```

### Issue: "Dependency installation not completed"
```
❌ Problem: NPM packages still installing
✅ Solution:
1. Wait 60-90 seconds after saving
2. Refresh the Latenode page
3. Check for green checkmark on node
4. Try running again
```

### Issue: "No relevant chunks found"
```
❌ Problem: No PDFs uploaded yet
✅ Solution:
1. First upload a PDF using pdf-upload workflow
2. Wait for processing to complete
3. Then try chat workflow
4. Check Qdrant has vectors
```

## 📋 Configuration Templates

### Development Setup
```javascript
// Use these settings for testing
{
  "gemini_api_key": "AIza...",
  "qdrant_url": "http://localhost:6333",
  "qdrant_api_key": "", // Not needed for local
  "collection_name": "bge_dev_docs",
  "top_k": 3, // Lower for faster responses
  "chunk_size": 800,
  "chunk_overlap": 150
}
```

### Production Setup
```javascript
// Use these settings for production
{
  "gemini_api_key": "AIza...",
  "qdrant_url": "https://your-cluster.cloud.qdrant.io",
  "qdrant_api_key": "your-api-key",
  "collection_name": "bge_electrique_docs",
  "top_k": 5, // More context
  "chunk_size": 1000,
  "chunk_overlap": 200
}
```

## 🚀 Next Steps After Setup

1. **Upload Your First PDF**
   ```powershell
   $webhook = "YOUR_PDF_WEBHOOK_URL"
   curl.exe -X POST $webhook -F "pdf=@codebook.pdf"
   ```

2. **Test Chat with Context**
   ```powershell
   $webhook = "YOUR_CHAT_WEBHOOK_URL"
   $body = @{
       message = "What information is in the codebook?"
   } | ConvertTo-Json
   Invoke-RestMethod -Uri $webhook -Method POST -Body $body -ContentType "application/json"
   ```

3. **Integrate with Frontend**
   - Update `index.html` API endpoints to use Latenode webhooks
   - Replace `http://localhost:3000/api/chat/message` with your webhook URL
   - Test frontend integration

4. **Add Error Handling**
   - Set up Latenode alerts for failures
   - Add retry logic for transient errors
   - Monitor execution logs

5. **Optimize Performance**
   - Adjust `top_k` based on response quality
   - Tune chunk size for your PDFs
   - Consider caching frequent queries

## 📞 Getting Help

**Latenode Issues:**
- Check [Latenode Help Center](https://help.latenode.com/)
- Contact support via chat in Latenode dashboard

**Gemini API Issues:**
- Review [Google AI Documentation](https://ai.google.dev/docs)
- Check quota limits in Google Cloud Console

**Qdrant Issues:**
- Visit [Qdrant Documentation](https://qdrant.tech/documentation/)
- Join [Qdrant Discord](https://discord.gg/qdrant)

**Workflow Issues:**
- Check Latenode execution logs (Log tab)
- Review error messages in console.log output
- Verify all parameters are filled correctly

## 🎓 Learning Resources

- **Latenode Basics**: https://help.latenode.com/getting-started
- **RAG Fundamentals**: https://www.langchain.com/
- **Gemini AI Guide**: https://ai.google.dev/tutorials
- **Vector Databases**: https://qdrant.tech/articles/what-is-a-vector-database/

## ✅ Final Checklist

Before going to production:

- [ ] All API keys secured (not in public repos)
- [ ] Qdrant collection created and populated
- [ ] Chat workflow tested with multiple questions
- [ ] PDF upload tested with sample documents
- [ ] Error handling verified
- [ ] Response times acceptable (<5 seconds)
- [ ] Logs show no errors
- [ ] Frontend integrated (if applicable)
- [ ] Backup strategy for Qdrant data
- [ ] Monitoring/alerts configured

## 🎉 You're Done!

Your BGE Chatbot is now running on Latenode! 

**Test it out:**
```powershell
# Quick test
$webhook = "YOUR_CHAT_WEBHOOK_URL"
Invoke-RestMethod -Uri $webhook -Method POST -Body '{"message":"Hello!"}' -ContentType "application/json"
```

**Share your webhook URLs** with team members or integrate them into your applications!

---

Need more details? Check the full [README.md](./README.md) for comprehensive documentation.
