import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  MONGODB_URI: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
  FRONTEND_URL: z.string().url(),

  // Optional configurations
  IDRIVE_ACCESS_KEY: z.string().optional(),
  IDRIVE_SECRET_KEY: z.string().optional(),
  IDRIVE_ENDPOINT: z.string().optional(),
  IDRIVE_BUCKET_NAME: z.string().optional(),
  GIPHY_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;