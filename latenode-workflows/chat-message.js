/**
 * Latenode Workflow: Chat Message API
 * 
 * This workflow handles chat messages using BGE ELECTRIQUE's RAG system
 * Endpoint equivalent: POST /api/chat/message
 * 
 * Prerequisites in Latenode:
 * 1. Add a "Trigger on Webhook" node before this JavaScript node
 * 2. Add environment variables or custom parameters for API keys
 * 3. Connect to a Qdrant instance (cloud or self-hosted)
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
        "description": "Qdrant instance URL (e.g., http://localhost:6333 or https://xyz.cloud.qdrant.io)"
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
        // Try multiple ways to access the message
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
        
        // Get configuration from custom parameters
        const geminiApiKey = data.gemini_api_key;
        const qdrantUrl = data.qdrant_url;
        const qdrantApiKey = data.qdrant_api_key;
        const collectionName = data.collection_name || 'bge_electrique_docs';
        const topK = data.top_k || 5;

        console.log('📝 Extracted message:', message);
        console.log('🔑 Chat ID:', chatId);
        console.log('🗄️ Collection:', collectionName);
        console.log('📊 Top K:', topK);

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

        console.log('🔍 Processing message:', message.substring(0, 50) + '...');

        // Step 1: Get relevant context from Qdrant using RAG
        let context = null;
        try {
            console.log('📚 Retrieving relevant context from Qdrant...');
            
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

            console.log('🔍 Search result count:', searchResult.length);

            if (searchResult && searchResult.length > 0) {
                context = searchResult
                    .map(result => {
                        // Try multiple field names: content (current), pageContent (old), text (alternative)
                        const text = result.payload?.content || result.payload?.pageContent || result.payload?.text || '';
                        console.log('📄 Chunk preview:', text.substring(0, 100) + '...');
                        return text;
                    })
                    .filter(text => text.length > 0)
                    .join('\n\n---\n\n');
                console.log(`✅ Found ${searchResult.length} relevant chunks`);
                console.log('📚 Total context length:', context.length);
            } else {
                console.log('⚠️ No relevant context found in search results');
            }
        } catch (error) {
            console.error('❌ Context retrieval error:', error.message);
            console.error('Stack trace:', error.stack);
            // Continue without context
        }

        // Step 2: Generate AI response using Gemini
        console.log('🤖 Generating AI response...');
        
        const chatGenAI = new GoogleGenerativeAI(geminiApiKey);
        const model = chatGenAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Create prompt with context
        const prompt = `You are BGE ELECTRIQUE's intelligent assistant, an expert in electrical systems, installations, and services.

${context ? `Relevant Information from Documents:\n${context}\n\n` : ''}

User Question: ${message}

Instructions:
- Provide accurate, professional, and helpful responses
- If the information is in the provided context, use it to answer
- If you're unsure or the information isn't available, be honest about it
- Keep responses clear, concise, and technical when appropriate
- Focus on electrical safety, quality, and best practices

Your Response:`;

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Response generated successfully');

        // Return result
        return {
            response: text,
            chatId: chatId,
            timestamp: new Date().toISOString(),
            hasContext: !!context,
            relevantChunks: context ? (context.match(/---/g) || []).length + 1 : 0,
            contextLength: context ? context.length : 0,
            status: 200,
            context,
            success: true,
            debug: {
                qdrantUrl,
                collectionName,
                topK,
                messageLength: message.length
            }
        };

    } catch (error) {
        console.error('❌ Chat error:', error);
        console.error('Stack trace:', error.stack);
        return {
            error: 'Failed to generate response',
            message: error.message,
            stack: error.stack,
            status: 500,
            success: false
        };
    }
}
