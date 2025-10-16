import express from 'express';
import multer from 'multer';
import { processPDF, getVectorStoreStats } from '../services/ragService.js';

const router = express.Router();

// Configure multer for PDF upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Upload and process PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        console.log('Processing PDF:', req.file.originalname);
        
        const result = await processPDF(req.file.buffer, req.file.originalname);

        res.json({
            message: 'PDF processed successfully',
            fileName: req.file.originalname,
            chunks: result.chunks,
            success: true
        });

    } catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({ 
            error: 'Failed to process PDF',
            message: error.message 
        });
    }
});

// Get vector store statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await getVectorStoreStats();
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

export default router;
