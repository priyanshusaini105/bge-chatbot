/**
 * Latenode Workflow: PDF Upload and Processing API
 * 
 * This workflow processes PDF files and stores them in Qdrant vector database
 * Endpoint equivalent: POST /api/pdf/upload
 * 
 * Prerequisites in Latenode:
 * 1. Add a "Trigger on Webhook" node that accepts file uploads
 * 2. Configure webhook to receive multipart/form-data with PDF file
 * 3. Set up Qdrant connection (cloud or self-hosted)
 * 
 * File Handling:
 * - The PDF file should be sent from the webhook trigger
 * - Access it via data["{{1.body.files.[0].content}}"] for file path
 */

/** @CustomParams
{
    "gemini_api_key": {
        "type": "string",
        "title": "Gemini API Key",
        "required": true,
        "description": "Your Google Gemini API key for embeddings"
    },
    "qdrant_url": {
        "type": "string",
        "title": "Qdrant URL",
        "required": true,
        "description": "Qdrant instance URL (e.g., http://localhost:6333)"
    },
    "qdrant_api_key": {
        "type": "string",
        "title": "Qdrant API Key",
        "required": false,
        "description": "Qdrant API key (if using cloud)"
    },
    "collection_name": {
        "type": "string",
        "title": "Collection Name",
        "required": false,
        "description": "Qdrant collection name (default: bge_electrique_docs)"
    },
    "chunk_size": {
        "type": "int",
        "title": "Chunk Size",
        "required": false,
        "description": "Size of text chunks (default: 1000)",
        "options": {
            "min": 500,
            "max": 2000
        }
    },
    "chunk_overlap": {
        "type": "int",
        "title": "Chunk Overlap",
        "required": false,
        "description": "Overlap between chunks (default: 200)",
        "options": {
            "min": 0,
            "max": 500
        }
    }
}
*/

import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';

export default async function run({ execution_id, input, data, store }) {
    try {
        // Get file from webhook trigger
        const filePath = data["{{1.body.files.[0].content}}"];
        const fileName = data["{{1.body.files.[0].name}}"] || 'uploaded.pdf';
        
        // Get configuration from custom parameters
        const geminiApiKey = data.gemini_api_key;
        const qdrantUrl = data.qdrant_url;
        const qdrantApiKey = data.qdrant_api_key;
        const collectionName = data.collection_name || 'bge_electrique_docs';
        const chunkSize = data.chunk_size || 1000;
        const chunkOverlap = data.chunk_overlap || 200;

        // Validate input
        if (!filePath) {
            return {
                error: 'No PDF file provided',
                status: 400,
                success: false
            };
        }

        console.log('📄 Processing PDF:', fileName);

        // Step 1: Read and parse PDF
        console.log('📖 Reading PDF file...');
        const fileBuffer = fs.readFileSync(filePath);
        const pdfData = await pdf(fileBuffer);
        const pdfContent = pdfData.text;
        
        console.log(`✅ PDF parsed. Total text length: ${pdfContent.length} characters`);

        // Step 2: Initialize Qdrant client and create collection if needed
        console.log('🔧 Initializing Qdrant...');
        const qdrantClient = new QdrantClient({
            url: qdrantUrl,
            apiKey: qdrantApiKey
        });

        // Check if collection exists, create if not
        try {
            const collections = await qdrantClient.getCollections();
            const collectionExists = collections.collections.some(
                col => col.name === collectionName
            );

            if (!collectionExists) {
                console.log(`Creating collection: ${collectionName}`);
                await qdrantClient.createCollection(collectionName, {
                    vectors: {
                        size: 768,
                        distance: 'Cosine'
                    }
                });
                console.log('✅ Collection created');
            } else {
                console.log(`✅ Collection ${collectionName} exists`);
            }
        } catch (error) {
            console.error('Collection check error:', error.message);
            throw new Error(`Failed to initialize collection: ${error.message}`);
        }

        // Step 3: Split text into chunks
        console.log('✂️ Splitting text into chunks...');
        const chunks = splitIntoChunks(pdfContent, chunkSize, chunkOverlap);
        console.log(`✅ Created ${chunks.length} chunks`);

        // Step 4: Initialize Gemini for embeddings
        console.log('🚀 Generating embeddings...');
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        // Step 5: Generate embeddings and prepare points for Qdrant
        console.log(`⏳ Processing ${chunks.length} chunks (this may take 3-5 minutes)...`);
        const points = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
            
            // Generate embedding for this chunk
            const embeddingResult = await embeddingModel.embedContent(chunk);
            const vector = embeddingResult.embedding.values;
            
            // Create point for Qdrant
            points.push({
                id: Date.now() + i, // Use timestamp + index as unique ID
                vector: vector,
                payload: {
                    pageContent: chunk,
                    text: chunk, // Alternate field name for compatibility
                    fileName: fileName,
                    chunkIndex: i,
                    uploadedAt: new Date().toISOString(),
                    executionId: execution_id
                }
            });
            
            // Add small delay to avoid rate limiting (optional)
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Step 6: Upload to Qdrant
        console.log(`📤 Uploading ${points.length} vectors to Qdrant...`);
        await qdrantClient.upsert(collectionName, {
            wait: true,
            points: points
        });

        console.log(`✅ Successfully uploaded ${documents.length} chunks to Qdrant`);

        // Get collection stats
        const collectionInfo = await qdrantClient.getCollection(collectionName);

        return {
            success: true,
            message: 'PDF processed successfully',
            fileName: fileName,
            chunks: documents.length,
            textLength: pdfContent.length,
            totalVectors: collectionInfo.points_count || 0,
            collectionName: collectionName,
            timestamp: new Date().toISOString(),
            status: 200
        };

    } catch (error) {
        console.error('❌ PDF processing error:', error);
        return {
            error: 'Failed to process PDF',
            message: error.message,
            status: 500,
            success: false
        };
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
