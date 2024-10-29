import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Poll from '../models/Poll';
import Channel from '../models/Channel';

const router = express.Router();

const PollSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string()
  })).min(2),
  settings: z.object({
    allowMultipleVotes: z.boolean(),
    showResultsBeforeEnd: z.boolean(),
    endDate: z.string().transform(str => new Date(str)).optional()
  })
});

// Get polls for a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel || channel.type !== 'polls') {
      return res.status(404).json({ error: 'Polls channel not found' });
    }

    const polls = await Poll.find({ 
      channelId: req.params.channelId 
    }).sort('-createdAt');

    res.json(polls);
  } catch (error) {
    console.error('Failed to fetch polls:', error);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Create a new poll
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = PollSchema.parse(req.body);
    const { channelId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel || channel.type !== 'polls') {
      return res.status(404).json({ error: 'Polls channel not found' });
    }

    const poll = await Poll.create({
      ...data,
      channelId,
      createdBy: req.auth.userId,
      options: data.options.map(option => ({
        ...option,
        votes: []
      }))
    });

    res.status(201).json(poll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create poll:', error);
      res.status(500).json({ error: 'Failed to create poll' });
    }
  }
});

// Vote on a poll
router.post('/:pollId/vote', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { optionIds } = z.object({
      optionIds: z.array(z.string()).min(1)
    }).parse(req.body);

    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    if (poll.status === 'ended') {
      return res.status(400).json({ error: 'Poll has ended' });
    }

    if (!poll.settings.allowMultipleVotes && optionIds.length > 1) {
      return res.status(400).json({ error: 'Multiple votes not allowed' });
    }

    // Remove existing votes
    poll.options.forEach(option => {
      option.votes = option.votes.filter(userId => userId !== req.auth.userId);
    });

    // Add new votes
    optionIds.forEach(optionId => {
      const option = poll.options.find(o => o.id === optionId);
      if (option) {
        option.votes.push(req.auth.userId);
      }
    });

    await poll.save();
    res.json(poll);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to vote:', error);
      res.status(500).json({ error: 'Failed to vote' });
    }
  }
});

export default router;