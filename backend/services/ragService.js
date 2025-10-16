import pdf from 'pdf-parse';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { Document } from '@langchain/core/documents';

// Lazy initialization - will be created when first needed
let embeddings = null;
let qdrantClient = null;

/**
 * Initialize embeddings and Qdrant client
 */
function initializeClients() {
    if (!embeddings) {
        embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
            modelName: 'text-embedding-004'
        });
    }
    
    if (!qdrantClient) {
        qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333',
            apiKey: process.env.QDRANT_API_KEY
        });
    }
}

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'bge_electrique_docs';

/**
 * Initialize Qdrant collection
 */
async function initializeCollection() {
    try {
        initializeClients();
        
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            col => col.name === COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 768,
                    distance: 'Cosine'
                }
            });
            console.log('✅ Collection created successfully');
        } else {
            console.log(`✅ Collection ${COLLECTION_NAME} already exists`);
        }
    } catch (error) {
        console.error('Error initializing collection:', error);
        throw error;
    }
}

/**
 * Process PDF and create embeddings in Qdrant using LangChain
 */
export async function processPDF(buffer, fileName) {
    try {
        console.log('📄 Parsing PDF...');
        const data = await pdf(buffer);
        
        const pdfContent = data.text;
        console.log(`✅ PDF parsed. Total text length: ${pdfContent.length} characters`);

        // Initialize collection
        await initializeCollection();

        // Split text into chunks
        const chunks = splitIntoChunks(pdfContent, 1000, 200);
        console.log(`✅ Created ${chunks.length} chunks`);

        // Create LangChain documents
        const documents = chunks.map((chunk, index) => new Document({
            pageContent: chunk,
            metadata: {
                fileName: fileName,
                chunkIndex: index,
                uploadedAt: new Date().toISOString()
            }
        }));

        console.log('🚀 Starting embedding generation with LangChain...');
        console.log(`⏳ Processing ${documents.length} chunks (this may take 3-5 minutes)...`);

        // Use LangChain's QdrantVectorStore to handle embeddings and upload
        const vectorStore = await QdrantVectorStore.fromDocuments(
            documents,
            embeddings,
            {
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_API_KEY,
                collectionName: COLLECTION_NAME,
            }
        );

        console.log(`✅ Successfully processed and uploaded ${documents.length} chunks to Qdrant`);

        return {
            success: true,
            chunks: documents.length,
            fileName: fileName
        };

    } catch (error) {
        console.error('❌ PDF processing error:', error);
        console.error('Error details:', error.message);
        throw new Error(`Failed to process PDF: ${error.message}`);
    }
}

/**
 * Split text into overlapping chunks
 */
function splitIntoChunks(text, chunkSize, overlap) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();
        
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        
        start += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Get relevant context for a query using LangChain and Qdrant
 */
export async function getRelevantContext(query, topK = 5) {
    try {
        initializeClients();
        
        console.log(`🔍 Searching for relevant context for query: "${query.substring(0, 50)}..."`);

        // Initialize vector store for similarity search
        const vectorStore = new QdrantVectorStore(embeddings, {
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY,
            collectionName: COLLECTION_NAME,
        });

        // Perform similarity search
        const results = await vectorStore.similaritySearch(query, topK);

        if (!results || results.length === 0) {
            console.log('⚠️ No relevant chunks found in Qdrant');
            return null;
        }

        console.log(`✅ Found ${results.length} relevant chunks`);

        // Extract text from results
        const context = results
            .map(doc => doc.pageContent)
            .join('\n\n---\n\n');

        return context;

    } catch (error) {
        console.error('❌ Context retrieval error:', error);
        console.error('Error details:', error.message);
        return null;
    }
}

/**
 * Get vector store statistics from Qdrant
 */
export async function getVectorStoreStats() {
    try {
        initializeClients();
        
        const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
        
        return {
            totalChunks: collectionInfo.points_count || 0,
            vectorSize: collectionInfo.config?.params?.vectors?.size || 768,
            hasData: (collectionInfo.points_count || 0) > 0,
            collectionName: COLLECTION_NAME
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return {
            totalChunks: 0,
            vectorSize: 768,
            hasData: false,
            collectionName: COLLECTION_NAME,
            error: error.message
        };
    }
}

export default {
    processPDF,
    getRelevantContext,
    getVectorStoreStats
};
