import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadPDF() {
    try {
        const pdfPath = path.join(__dirname, 'codebook.pdf');
        
        console.log('📄 Reading PDF file...');
        const fileBuffer = fs.readFileSync(pdfPath);
        console.log(`✅ File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        const formData = new FormData();
        formData.append('pdf', fileBuffer, {
            filename: 'codebook.pdf',
            contentType: 'application/pdf'
        });
        
        console.log('📤 Uploading to backend...');
        console.log('⏳ This may take 5-10 minutes for a 4.5MB PDF...');
        console.log('💡 The backend will:');
        console.log('   1. Parse the PDF (30 seconds)');
        console.log('   2. Split into chunks (~100-200 chunks)');
        console.log('   3. Generate embeddings for each chunk (5-8 minutes)');
        console.log('   4. Upload to Qdrant (1-2 minutes)');
        console.log('\n⏰ Started at:', new Date().toLocaleTimeString());
        console.log('🔄 Check backend terminal for progress...\n');
        
        const startTime = Date.now();
        
        const response = await fetch('http://localhost:3000/api/pdf/upload', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('\n🎉 ========================================');
            console.log('✅ SUCCESS! PDF uploaded and processed');
            console.log('========================================');
            console.log(`⏱️  Total time: ${Math.floor(duration / 60)}m ${duration % 60}s`);
            console.log('📊 Results:', JSON.stringify(result, null, 2));
            console.log('\n🎉 You can now chat with your PDF!');
            console.log('🌐 Open: http://localhost:8000');
            console.log('💬 Try asking: "What is this document about?"');
        } else {
            console.log('\n❌ ========================================');
            console.log('ERROR: Upload failed');
            console.log('========================================');
            console.error('❌ Error:', JSON.stringify(result, null, 2));
            console.log('\n🔍 Check backend terminal for detailed error logs');
        }
        
    } catch (error) {
        console.error('\n❌ Upload failed with exception:');
        console.error('Error:', error.message);
        if (error.code) console.error('Code:', error.code);
        console.error('\n🔍 Make sure:');
        console.error('  1. Backend is running (http://localhost:3000)');
        console.error('  2. Qdrant is connected');
        console.error('  3. Gemini API key is valid');
    }
}

uploadPDF();
