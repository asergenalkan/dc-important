import express from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import User from '../models/User';

const router = express.Router();

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

router.post('/clerk-webhooks', async (req, res) => {
  try {
    const webhook = new Webhook(webhookSecret);
    const payload = webhook.verify(
      JSON.stringify(req.body),
      req.headers as Record<string, string>
    );
    
    const event = payload as WebhookEvent;

    switch (event.type) {
      case 'user.created':
        await User.create({
          clerkId: event.data.id,
          username: event.data.username || event.data.first_name,
          email: event.data.email_addresses[0].email_address,
          imageUrl: event.data.image_url,
        });
        break;

      case 'user.updated':
        await User.findOneAndUpdate(
          { clerkId: event.data.id },
          {
            username: event.data.username || event.data.first_name,
            email: event.data.email_addresses[0].email_address,
            imageUrl: event.data.image_url,
          }
        );
        break;

      case 'user.deleted':
        await User.findOneAndDelete({ clerkId: event.data.id });
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

export default router;