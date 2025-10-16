/**
 * Latenode Workflow: Chat Streaming API
 * 
 * This workflow handles streaming chat responses using BGE ELECTRIQUE's RAG system
 * Endpoint equivalent: POST /api/chat/stream
 * 
 * Prerequisites in Latenode:
 * 1. Add a "Trigger on Webhook" node before this JavaScript node
 * 2. Set webhook response type to support streaming (if available)
 * 3. Configure environment variables for API keys
 * 
 * Note: Streaming in Latenode may have limitations. Consider using the non-streaming
 * version (chat-message.js) for most use cases.
 */

/** @CustomParams
{
    "message": {
        "type": "string",
        "title": "User Message",
        "required": true,
        "description": "The user's question or message"
    },
    "chatId": {
        "type": "string",
        "title": "Chat ID",
        "required": false,
        "description": "Optional chat session identifier"
    },
    "gemini_api_key": {
        "type": "string",
        "title": "Gemini API Key",
        "required": true,
        "description": "Your Google Gemini API key"
    },
    "qdrant_url": {
        "type": "string",
        "title": "Qdrant URL",
        "required": true,
        "description": "Qdrant instance URL"
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
    "top_k": {
        "type": "int",
        "title": "Top K Results",
        "required": false,
        "description": "Number of relevant chunks to retrieve (default: 5)",
        "options": {
            "min": 1,
            "max": 20
        }
    }
}
*/

import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';

export default async function run({ execution_id, input, data, store }) {
    try {
        // Debug: Log all input data
        console.log('📥 Input data:', JSON.stringify(data, null, 2));
        
        // Get input from custom parameters or webhook trigger
        let message = data.message;
        let chatId = data.chatId;
        
        // If message is a template string, try to get from variables
        if (typeof message === 'string' && message.startsWith('{{')) {
            console.log('⚠️ Message is a template string, trying variables...');
            message = data.variables?.["1.body.message"] || 
                      data.variables?.["$1.body.message"] ||
                      data["1.body.message"] ||
                      data["$1.body.message"];
        }
        
        // Same for chatId
        if (typeof chatId === 'string' && chatId.startsWith('{{')) {
            chatId = data.variables?.["1.body.chatId"] || 
                     data.variables?.["$1.body.chatId"] ||
                     data["1.body.chatId"] ||
                     data["$1.body.chatId"];
        }
        
        // Get configuration
        const geminiApiKey = data.gemini_api_key;
        const qdrantUrl = data.qdrant_url;
        const qdrantApiKey = data.qdrant_api_key;
        const collectionName = data.collection_name || 'bge_electrique_docs';
        const topK = data.top_k || 5;

        console.log('📝 Extracted message:', message);
        console.log('🔑 Chat ID:', chatId);

        // Validate input
        if (!message || !message.trim()) {
            return {
                error: 'Message is required',
                status: 400,
                debug: {
                    receivedMessage: message,
                    dataKeys: Object.keys(data)
                }
            };
        }

        console.log('🔍 Processing streaming message:', message.substring(0, 50) + '...');

        // Step 1: Get relevant context from Qdrant
        let context = null;
        try {
            console.log('📚 Retrieving relevant context...');
            
            // Generate embedding for the query
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
            const embeddingResult = await embeddingModel.embedContent(message);
            const queryVector = embeddingResult.embedding.values;

            console.log('🔍 Generated query embedding, searching Qdrant...');

            // Initialize Qdrant client
            const qdrantClient = new QdrantClient({
                url: qdrantUrl,
                apiKey: qdrantApiKey
            });

            // Perform similarity search
            const searchResult = await qdrantClient.search(collectionName, {
                vector: queryVector,
                limit: topK,
                with_payload: true
            });

            if (searchResult && searchResult.length > 0) {
                context = searchResult
                    .map(result => {
                        // Try multiple field names: content (current), pageContent (old), text (alternative)
                        const text = result.payload?.content || result.payload?.pageContent || result.payload?.text || '';
                        return text;
                    })
                    .filter(text => text.length > 0)
                    .join('\n\n---\n\n');
                console.log(`✅ Found ${searchResult.length} relevant chunks`);
                console.log('📚 Total context length:', context.length);
            } else {
                console.log('⚠️ No relevant context found');
            }
        } catch (error) {
            console.error('❌ Context retrieval error:', error.message);
            console.error('Stack trace:', error.stack);
        }

        // Step 2: Generate streaming response
        console.log('🤖 Generating streaming response...');
        
        const chatGenAI = new GoogleGenerativeAI(geminiApiKey);
        const model = chatGenAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are BGE ELECTRIQUE's intelligent assistant.
${context ? `Context: ${context}\n\n` : ''}
User: ${message}\nAssistant:`;

        // Since Latenode has limitations on streaming, we'll collect all chunks
        // and return them as an array
        const chunks = [];
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            chunks.push(chunkText);
        }

        // Combine all chunks
        const fullResponse = chunks.join('');

        console.log('✅ Streaming completed');

        return {
            response: fullResponse,
            chatId: chatId,
            chunks: chunks,
            chunkCount: chunks.length,
            timestamp: new Date().toISOString(),
            hasContext: !!context,
            status: 200,
            success: true
        };

    } catch (error) {
        console.error('❌ Streaming error:', error);
        return {
            error: 'Failed to stream response',
            message: error.message,
            status: 500,
            success: false
        };
    }
}
