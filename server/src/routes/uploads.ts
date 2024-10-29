import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import env from '../config/env';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload endpoint
router.post('/', ClerkExpressRequireAuth(), upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // For now, just return success without actual file upload since storage is not configured
    res.json({ 
      urls: req.files.map(file => `/uploads/${nanoid()}${path.extname(file.originalname)}`)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

export default router;