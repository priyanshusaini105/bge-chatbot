import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function testGemini() {
    try {
        console.log('🧪 Testing Gemini API...');
        console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 20) + '...');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Test embeddings
        console.log('\n📊 Testing embeddings API...');
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await embeddingModel.embedContent('Hello world');
        console.log('✅ Embeddings work! Vector length:', result.embedding.values.length);
        
        // Test chat
        console.log('\n💬 Testing chat API...');
        const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const chat = await chatModel.generateContent('Say "Hello" in one word');
        const response = await chat.response;
        console.log('✅ Chat works! Response:', response.text());
        
        console.log('\n✅ Gemini API is working correctly!');
        
    } catch (error) {
        console.error('\n❌ Gemini test failed:');
        console.error('Error:', error.message);
        if (error.status) console.error('Status:', error.status);
        if (error.statusText) console.error('Status Text:', error.statusText);
        console.error('\n🔍 Check:');
        console.error('  1. API key is valid');
        console.error('  2. API key has Gemini API enabled');
        console.error('  3. No rate limiting');
    }
}

testGemini();
