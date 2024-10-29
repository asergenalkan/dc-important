import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import env from './config/env';
import { connectDB } from './config/database';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { initSocket } from './socket';
import { runMigrations } from './services/settingsMigration';

// Import routes
import channelsRouter from './routes/channels';
import messagesRouter from './routes/messages';
import serversRouter from './routes/servers';
import rolesRouter from './routes/roles';
import webhooksRouter from './webhooks/clerk';
import settingsRouter from './routes/settings';
import voiceRouter from './routes/voice';
import uploadsRouter from './routes/uploads';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);
app.set('io', io);

// Configure CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Webhook route needs raw body - must come before JSON parser
app.use('/api/webhooks', webhooksRouter);

app.use(express.json());
app.use(ClerkExpressWithAuth());

// API Routes
app.use('/api/channels', channelsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/servers', serversRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/uploads', uploadsRouter);

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await runMigrations();
    
    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();