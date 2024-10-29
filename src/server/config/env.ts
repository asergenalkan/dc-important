import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/discord-clone'),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  RAILWAY_STATIC_URL: z.string().optional(),
});

// Validate and export environment variables
const env = envSchema.parse(process.env);

export default env;