import { S3Client } from '@aws-sdk/client-s3';
import env from './env';

// Only create S3 client if credentials are provided
const createS3Client = () => {
  if (!env.IDRIVE_ACCESS_KEY || !env.IDRIVE_SECRET_KEY || !env.IDRIVE_ENDPOINT) {
    return null;
  }

  return new S3Client({
    endpoint: env.IDRIVE_ENDPOINT,
    region: 'us-east-1', // Required but not used for Idrive e2
    credentials: {
      accessKeyId: env.IDRIVE_ACCESS_KEY,
      secretAccessKey: env.IDRIVE_SECRET_KEY,
    },
    forcePathStyle: true, // Required for Idrive e2
  });
};

export const s3 = createS3Client();