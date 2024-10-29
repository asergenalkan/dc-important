import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Document from '../models/Document';
import Channel from '../models/Channel';
import { checkPermissions } from '../middleware/permissions';

const router = express.Router();

const DocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  parentId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Get all documents in a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel || channel.type !== 'docs') {
      return res.status(404).json({ error: 'Docs channel not found' });
    }

    const documents = await Document.find({ 
      channelId: req.params.channelId,
      parentId: { $exists: false }
    }).sort('order');

    res.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Create a new document
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = DocumentSchema.parse(req.body);
    const { channelId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel || channel.type !== 'docs') {
      return res.status(404).json({ error: 'Docs channel not found' });
    }

    // Get max order for new document
    const maxOrder = await Document.findOne({
      channelId,
      parentId: data.parentId || { $exists: false }
    })
    .sort('-order')
    .select('order');

    const document = await Document.create({
      ...data,
      channelId,
      createdBy: req.auth.userId,
      lastEditedBy: req.auth.userId,
      order: (maxOrder?.order || 0) + 1000 // Leave space between documents
    });

    // Update channel metadata
    await Channel.findByIdAndUpdate(channelId, {
      $set: {
        'metadata.lastEditedBy': req.auth.userId,
        'metadata.lastEditedAt': new Date()
      }
    });

    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create document:', error);
      res.status(500).json({ error: 'Failed to create document' });
    }
  }
});

// Update a document
router.patch('/:id', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = DocumentSchema.partial().parse(req.body);
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        lastEditedBy: req.auth.userId
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update channel metadata
    await Channel.findByIdAndUpdate(document.channelId, {
      $set: {
        'metadata.lastEditedBy': req.auth.userId,
        'metadata.lastEditedAt': new Date()
      }
    });

    res.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }
});

// Reorder documents
router.post('/reorder', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { documentId, newOrder, parentId } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update orders of affected documents
    await Document.updateMany(
      {
        channelId: document.channelId,
        parentId: parentId || { $exists: false },
        order: { $gte: newOrder }
      },
      { $inc: { order: 1000 } }
    );

    document.order = newOrder;
    document.parentId = parentId;
    await document.save();

    res.json(document);
  } catch (error) {
    console.error('Failed to reorder documents:', error);
    res.status(500).json({ error: 'Failed to reorder documents' });
  }
});

export default router;