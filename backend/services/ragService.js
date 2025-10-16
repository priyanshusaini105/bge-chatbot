import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Qdrant Client
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'bge_electrique_docs';
const EMBEDDING_MODEL = 'text-embedding-004'; // Gemini embedding model

/**
 * Initialize Qdrant collection
 */
async function initializeCollection() {
    try {
        // Check if collection exists
        const collections = await qdrantClient.getCollections();
        const collectionExists = collections.collections.some(
            col => col.name === COLLECTION_NAME
        );

        if (!collectionExists) {
            console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 768, // Gemini text-embedding-004 dimension
                    distance: 'Cosine'
                }
            });
            console.log('Collection created successfully');
        } else {
            console.log(`Collection ${COLLECTION_NAME} already exists`);
        }
    } catch (error) {
        console.error('Error initializing collection:', error);
        throw error;
    }
}

/**
 * Generate embeddings using Gemini
 */
async function generateEmbedding(text) {
    try {
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Process PDF and create embeddings in Qdrant
 */
export async function processPDF(buffer, fileName) {
    try {
        console.log('Parsing PDF...');
        const data = await pdf(buffer);
        
        const pdfContent = data.text;
        console.log(`PDF parsed. Total text length: ${pdfContent.length} characters`);

        // Initialize collection
        await initializeCollection();

        // Split text into chunks
        const chunks = splitIntoChunks(pdfContent, 1000, 200);
        console.log(`Created ${chunks.length} chunks`);

        // Clear existing documents from this file (optional)
        console.log('Clearing old documents from collection...');
        try {
            await qdrantClient.delete(COLLECTION_NAME, {
                filter: {
                    must: [{
                        key: 'fileName',
                        match: { value: fileName }
                    }]
                }
            });
        } catch (error) {
            console.log('No existing documents to delete or error deleting:', error.message);
        }

        // Process chunks in batches
        const batchSize = 10;
        let processedChunks = 0;

        console.log('Generating embeddings and uploading to Qdrant...');
        
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const points = [];

            for (let j = 0; j < batch.length; j++) {
                const chunkIndex = i + j;
                const chunk = batch[j];

                try {
                    // Generate embedding
                    const embedding = await generateEmbedding(chunk);

                    // Create point for Qdrant
                    points.push({
                        id: `${Date.now()}_${chunkIndex}`,
                        vector: embedding,
                        payload: {
                            text: chunk,
                            fileName: fileName,
                            chunkIndex: chunkIndex,
                            uploadedAt: new Date().toISOString()
                        }
                    });

                    processedChunks++;
                    console.log(`Processed chunk ${processedChunks}/${chunks.length}`);
                } catch (error) {
                    console.error(`Error processing chunk ${chunkIndex}:`, error);
                }
            }

            // Upload batch to Qdrant
            if (points.length > 0) {
                await qdrantClient.upsert(COLLECTION_NAME, {
                    wait: true,
                    points: points
                });
                console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}`);
            }
        }

        console.log(`Successfully processed and uploaded ${processedChunks} chunks to Qdrant`);

        return {
            success: true,
            chunks: processedChunks,
            fileName: fileName
        };

    } catch (error) {
        console.error('PDF processing error:', error);
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
 * Get relevant context for a query using Qdrant semantic search
 */
export async function getRelevantContext(query, topK = 5) {
    try {
        console.log(`Searching for relevant context for query: "${query.substring(0, 50)}..."`);

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Search in Qdrant
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: true,
            score_threshold: 0.5 // Only return results with similarity > 0.5
        });

        if (!searchResult || searchResult.length === 0) {
            console.log('No relevant chunks found in Qdrant');
            return null;
        }

        console.log(`Found ${searchResult.length} relevant chunks with scores:`, 
            searchResult.map(r => r.score.toFixed(3)).join(', '));

        // Extract text from results
        const context = searchResult
            .map(result => result.payload.text)
            .join('\n\n---\n\n');

        return context;

    } catch (error) {
        console.error('Context retrieval error:', error);
        return null;
    }
}

/**
 * Get vector store statistics from Qdrant
 */
export async function getVectorStoreStats() {
    try {
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
