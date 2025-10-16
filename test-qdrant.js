import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function testQdrant() {
    try {
        console.log('🔍 Testing Qdrant connection...');
        console.log('URL:', process.env.QDRANT_URL);
        console.log('Collection:', process.env.QDRANT_COLLECTION_NAME);
        
        const client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            checkCompatibility: false
        });
        
        console.log('\n📡 Fetching collections...');
        const collections = await client.getCollections();
        console.log('✅ Collections:', collections.collections.map(c => c.name));
        
        const collectionName = process.env.QDRANT_COLLECTION_NAME || 'bge_electrique_docs';
        const exists = collections.collections.some(c => c.name === collectionName);
        
        if (!exists) {
            console.log(`\n📦 Creating collection: ${collectionName}`);
            await client.createCollection(collectionName, {
                vectors: {
                    size: 768,
                    distance: 'Cosine'
                }
            });
            console.log('✅ Collection created!');
        } else {
            console.log(`\n✅ Collection '${collectionName}' already exists`);
            const info = await client.getCollection(collectionName);
            console.log('📊 Points count:', info.points_count);
        }
        
        console.log('\n✅ Qdrant is working correctly!');
        
    } catch (error) {
        console.error('\n❌ Qdrant test failed:', error.message);
        console.error('Full error:', error);
    }
}

testQdrant();
