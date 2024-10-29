import express, { Request, Response } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// Get voice channel participants
router.get('/channel/:channelId/participants', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const io = req.app.get('io');
    const participants = Array.from(io.sockets.adapter.rooms.get(req.params.channelId) || []);
    res.json(participants);
  } catch (error) {
    console.error('Failed to get participants:', error);
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

// Update user voice settings
router.patch('/settings', ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { inputVolume, outputVolume, inputDevice, outputDevice } = req.body;
    
    // In a real app, save these settings to the database
    res.json({ inputVolume, outputVolume, inputDevice, outputDevice });
  } catch (error) {
    console.error('Failed to update voice settings:', error);
    res.status(500).json({ error: 'Failed to update voice settings' });
  }
});

export default router;