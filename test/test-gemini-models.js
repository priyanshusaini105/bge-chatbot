import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, 'backend', '.env') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hi in one word');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} works! Response: ${text.trim()}`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
        return false;
    }
}

async function testAllModels() {
    console.log('🔍 Testing various Gemini models...\n');
    
    const models = [
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-pro'
    ];
    
    const results = {};
    
    for (const model of models) {
        results[model] = await testModel(model);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Results Summary:');
    console.log('='.repeat(60));
    
    for (const [model, worked] of Object.entries(results)) {
        const status = worked ? '✅' : '❌';
        console.log(`${status} ${model}`);
    }
    
    const workingModels = Object.entries(results)
        .filter(([_, worked]) => worked)
        .map(([model, _]) => model);
    
    if (workingModels.length > 0) {
        console.log(`\n✨ Recommended model: ${workingModels[0]}`);
    }
}

testAllModels().catch(console.error);
