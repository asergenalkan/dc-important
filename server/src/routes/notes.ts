import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Note from '../models/Note';

const router = express.Router();

const NoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  serverId: z.string().optional(),
  channelId: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  tags: z.array(z.string()).optional(),
  sharedWith: z.array(z.string()).optional()
});

// Get user's notes
router.get('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { serverId, channelId } = req.query;
    const query: any = { userId: req.auth.userId };
    
    if (serverId) query.serverId = serverId;
    if (channelId) query.channelId = channelId;

    const notes = await Note.find(query).sort('-pinned -updatedAt');
    res.json(notes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = NoteSchema.parse(req.body);
    
    const note = await Note.create({
      ...data,
      userId: req.auth.userId
    });

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create note:', error);
      res.status(500).json({ error: 'Failed to create note' });
    }
  }
});

// Toggle pin status
router.patch('/:id/pin', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.auth.userId
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Failed to toggle pin:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// Toggle bookmark
router.patch('/:id/bookmark', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const userIndex = note.bookmarkedBy.indexOf(req.auth.userId);
    if (userIndex === -1) {
      note.bookmarkedBy.push(req.auth.userId);
    } else {
      note.bookmarkedBy.splice(userIndex, 1);
    }
    note.bookmarked = note.bookmarkedBy.length > 0;
    
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
});

// Share note
router.post('/:id/share', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userIds } = z.object({
      userIds: z.array(z.string())
    }).parse(req.body);

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.auth.userId
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.sharedWith = [...new Set([...note.sharedWith, ...userIds])];
    await note.save();

    res.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to share note:', error);
      res.status(500).json({ error: 'Failed to share note' });
    }
  }
});

export default router;