import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: env.S3_ACCESS_KEY
    ? {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY
      }
    : undefined
});

export { s3 };
export const mediaBucket = env.S3_BUCKET;
