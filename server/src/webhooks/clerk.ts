import express from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import User from '../models/User';
import env from '../config/env';

const router = express.Router();

// Webhook secret from environment variables
const webhookSecret = env.CLERK_WEBHOOK_SECRET;

// Use raw body parser for webhook endpoint
router.post('/clerk-webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing Svix headers:', { svix_id, svix_timestamp, svix_signature });
      return res.status(400).json({ error: 'Missing required headers' });
    }

    // Create a new Webhook instance with your secret
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    try {
      // Convert raw body to string if it's a Buffer
      const payload = req.body.toString('utf8');
      console.log('Webhook payload:', payload);

      // Verify the webhook payload
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ 
        error: 'Webhook verification failed', 
        details: err instanceof Error ? err.message : 'Unknown error' 
      });
    }

    // Handle the webhook
    const { type: eventType, data: eventData } = evt;
    console.log(`Processing webhook event: ${eventType}`, JSON.stringify(eventData, null, 2));

    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, username, first_name, last_name, image_url } = eventData;
        
        const userData = {
          clerkId: id,
          email: email_addresses[0]?.email_address,
          username: username || `${first_name || ''}${last_name || ''}`,
          imageUrl: image_url,
          firstName: first_name,
          lastName: last_name,
        };

        console.log('Creating new user:', userData);
        
        const user = await User.create(userData);
        console.log('User created successfully:', user);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, username, first_name, last_name, image_url } = eventData;
        
        const userData = {
          email: email_addresses[0]?.email_address,
          username: username || `${first_name || ''}${last_name || ''}`,
          imageUrl: image_url,
          firstName: first_name,
          lastName: last_name,
        };

        console.log('Updating user:', id, userData);
        
        const user = await User.findOneAndUpdate(
          { clerkId: id },
          userData,
          { new: true }
        );
        console.log('User updated successfully:', user);
        break;
      }

      case 'user.deleted': {
        const { id } = eventData;
        console.log('Deleting user:', id);
        
        const result = await User.findOneAndDelete({ clerkId: id });
        console.log('User deleted successfully:', result);
        break;
      }

      default: {
        console.log('Unhandled webhook event type:', eventType);
      }
    }

    res.json({ success: true, event: eventType });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ 
      error: 'Webhook error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;