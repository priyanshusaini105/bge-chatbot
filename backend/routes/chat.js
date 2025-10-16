import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantContext } from '../services/ragService.js';

const router = express.Router();

// Lazy initialization of Gemini AI
let genAI = null;

function initializeGenAI() {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error('No API key found for Gemini AI. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file');
        }
        genAI = new GoogleGenerativeAI(apiKey);
        console.log('✅ Gemini AI initialized in chat route');
    }
    return genAI;
}

// Chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get relevant context from RAG
        const context = await getRelevantContext(message);

        // Initialize Gemini model (using gemini-2.0-flash-lite - smallest and most cost effective)
        const ai = initializeGenAI();
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

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

        res.json({
            response: text,
            chatId: chatId,
            timestamp: new Date().toISOString(),
            hasContext: !!context
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            message: error.message 
        });
    }
});

// Streaming chat endpoint (optional for future use)
router.post('/stream', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const context = await getRelevantContext(message);
        const ai = initializeGenAI();
        const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        const prompt = `You are BGE ELECTRIQUE's intelligent assistant.
${context ? `Context: ${context}\n\n` : ''}
User: ${message}\nAssistant:`;

        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({ error: 'Failed to stream response' });
    }
});

export default router;
