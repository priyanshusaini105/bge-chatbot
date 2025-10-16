/**
 * Test script to check Qdrant collection structure and search
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'bge_electrique_docs';

async function testQdrantStructure() {
    try {
        console.log('🔍 Testing Qdrant Collection Structure\n');
        console.log('Configuration:');
        console.log('- Qdrant URL:', QDRANT_URL);
        console.log('- Collection:', COLLECTION_NAME);
        console.log('- Has API Key:', !!QDRANT_API_KEY);
        console.log('- Has Gemini Key:', !!GEMINI_API_KEY);
        console.log('\n' + '='.repeat(60) + '\n');

        // Initialize Qdrant client
        const qdrantClient = new QdrantClient({
            url: QDRANT_URL,
            apiKey: QDRANT_API_KEY
        });

        // Test 1: Check collection info
        console.log('📊 Test 1: Collection Information');
        const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
        console.log('- Points count:', collectionInfo.points_count);
        console.log('- Vector size:', collectionInfo.config?.params?.vectors?.size);
        console.log('- Distance:', collectionInfo.config?.params?.vectors?.distance);
        console.log('\n' + '='.repeat(60) + '\n');

        if (collectionInfo.points_count === 0) {
            console.log('⚠️ No documents in collection. Please upload a PDF first.');
            return;
        }

        // Test 2: Get a sample point to check payload structure
        console.log('📄 Test 2: Sample Point Structure');
        const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
            limit: 1,
            with_payload: true,
            with_vector: false
        });

        if (scrollResult.points && scrollResult.points.length > 0) {
            const samplePoint = scrollResult.points[0];
            console.log('Sample Point ID:', samplePoint.id);
            console.log('Payload keys:', Object.keys(samplePoint.payload));
            console.log('Payload structure:', JSON.stringify(samplePoint.payload, null, 2));
        }
        console.log('\n' + '='.repeat(60) + '\n');

        // Test 3: Test search with a query
        console.log('🔎 Test 3: Search Test');
        const testQuery = "What are the ampacities for different wire sizes?";
        console.log('Query:', testQuery);

        // Generate embedding
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const embeddingResult = await embeddingModel.embedContent(testQuery);
        const queryVector = embeddingResult.embedding.values;

        console.log('✅ Generated query embedding (dimension:', queryVector.length, ')');

        // Perform search
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryVector,
            limit: 3,
            with_payload: true
        });

        console.log('\nSearch Results:');
        console.log('- Found', searchResult.length, 'results');
        
        searchResult.forEach((result, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log('Score:', result.score);
            console.log('Payload keys:', Object.keys(result.payload || {}));
            
            // Check different possible text fields
            const text = result.payload?.pageContent || 
                        result.payload?.text || 
                        result.payload?.content ||
                        result.payload?.metadata?.pageContent ||
                        'NO TEXT FIELD FOUND';
            
            console.log('Text preview:', text.substring(0, 200) + '...');
            
            if (result.payload?.metadata) {
                console.log('Metadata:', JSON.stringify(result.payload.metadata, null, 2));
            }
        });

        console.log('\n' + '='.repeat(60) + '\n');
        console.log('✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testQdrantStructure();
