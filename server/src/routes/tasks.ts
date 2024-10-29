import express from 'express';
import { z } from 'zod';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Task from '../models/Task';
import Channel from '../models/Channel';

const router = express.Router();

const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  columnId: z.string(),
  assignees: z.array(z.string()).optional(),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  labels: z.array(z.string()).optional(),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean()
  })).optional()
});

// Get tasks for a channel
router.get('/channel/:channelId', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel || channel.type !== 'tasks') {
      return res.status(404).json({ error: 'Task channel not found' });
    }

    const tasks = await Task.find({ 
      channelId: req.params.channelId 
    }).sort('position');

    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const data = TaskSchema.parse(req.body);
    const { channelId } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel || channel.type !== 'tasks') {
      return res.status(404).json({ error: 'Task channel not found' });
    }

    // Get max position for new task
    const maxPosition = await Task.findOne({
      channelId,
      columnId: data.columnId
    })
    .sort('-position')
    .select('position');

    const task = await Task.create({
      ...data,
      channelId,
      createdBy: req.auth.userId,
      position: (maxPosition?.position || 0) + 1000
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Failed to create task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
});

// Update task position
router.patch('/reorder', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { taskId, newPosition, newColumnId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update positions of affected tasks
    if (newColumnId && newColumnId !== task.columnId) {
      // Moving to new column
      await Task.updateMany(
        {
          channelId: task.channelId,
          columnId: newColumnId,
          position: { $gte: newPosition }
        },
        { $inc: { position: 1000 } }
      );
      task.columnId = newColumnId;
    } else {
      // Reordering within same column
      await Task.updateMany(
        {
          channelId: task.channelId,
          columnId: task.columnId,
          position: { $gte: newPosition }
        },
        { $inc: { position: 1000 } }
      );
    }

    task.position = newPosition;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Failed to reorder task:', error);
    res.status(500).json({ error: 'Failed to reorder task' });
  }
});

export default router;