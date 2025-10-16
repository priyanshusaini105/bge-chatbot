import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'bge_electrique_docs';

async function deleteCollection() {
    try {
        console.log(`🗑️  Deleting collection: ${COLLECTION_NAME}...`);
        await client.deleteCollection(COLLECTION_NAME);
        console.log('✅ Collection deleted successfully');
        console.log('💡 The collection will be recreated on next PDF upload with correct dimensions (768)');
    } catch (error) {
        console.error('❌ Error deleting collection:', error.message);
    }
}

deleteCollection();
