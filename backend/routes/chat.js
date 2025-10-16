import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantContext } from '../services/ragService.js';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get relevant context from RAG
        const context = await getRelevantContext(message);

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
