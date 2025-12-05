import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function testGeminiModels() {
    console.log('🔑 Testing Gemini API Key...\n');
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    console.log('API Key present:', apiKey ? 'YES' : 'NO');
    console.log('API Key (first 20 chars):', apiKey ? apiKey.substring(0, 20) + '...' : 'N/A');
    console.log('');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test gemini-2.0-flash-lite
    console.log('Testing gemini-2.0-flash-lite:');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const result = await model.generateContent('Say "Hello World"');
        const response = await result.response;
        console.log('✅ SUCCESS:', response.text().substring(0, 50));
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
    
    console.log('\nTesting gemini-1.5-pro:');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent('Say "Hello World"');
        const response = await result.response;
        console.log('✅ SUCCESS:', response.text().substring(0, 50));
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
    
    console.log('\nTesting gemini-1.5-flash:');
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say "Hello World"');
        const response = await result.response;
        console.log('✅ SUCCESS:', response.text().substring(0, 50));
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
}

testGeminiModels();
