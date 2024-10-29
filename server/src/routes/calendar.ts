import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import CalendarEvent from '../models/CalendarEvent';
import Channel from '../models/Channel';

const router = express.Router();

const EventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  allDay: z.boolean(),
  location: z.string().max(500).optional(),
  color: z.string(),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1),
    until: z.string().transform(str => new Date(str)).optional()
  }).optional(),
  reminders: z.array(z.object({
    time: z.number(),
    type: z.enum(['notification', 'email'])
  })).optional()
});

// Get events for a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { start, end } = req.query;
    const channel = await Channel.findById(req.params.channelId);
    if (!channel || channel.type !== 'calendar') {
      return res.status(404).json({ error: 'Calendar channel not found' });
    }

    const query: any = { channelId: req.params.channelId };
    if (start && end) {
      query.$or = [
        {
          startDate: {
            $gte: new Date(start as string),
            $lte: new Date(end as string)
          }
        },
        {
          endDate: {
            $gte: new Date(start as string),
            $lte: new Date(end as string)
          }
        }
      ];
    }

    const events = await CalendarEvent.find(query).sort('startDate');
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create a new event
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = EventSchema.parse(req.body);
    const { channelId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel || channel.type !== 'calendar') {
      return res.status(404).json({ error: 'Calendar channel not found' });
    }

    const event = await CalendarEvent.create({
      ...data,
      channelId,
      createdBy: req.auth.userId,
      attendees: [{ userId: req.auth.userId, status: 'accepted' }]
    });

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
});

// Update event attendance status
router.patch('/:eventId/attend', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['accepted', 'declined', 'maybe'])
    }).parse(req.body);

    const event = await CalendarEvent.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(a => a.userId === req.auth.userId);
    if (attendeeIndex >= 0) {
      event.attendees[attendeeIndex].status = status;
    } else {
      event.attendees.push({ userId: req.auth.userId, status });
    }

    await event.save();
    res.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to update attendance:', error);
      res.status(500).json({ error: 'Failed to update attendance' });
    }
  }
});

export default router;