import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import path from 'path';

const REGION = process.env.AWS_REGION || 'ap-south-1';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'mayura-heritage-crafts-media';

// Base URL stored in the DB for uploaded files. Point this at a CDN/custom domain to serve images from there.
const PUBLIC_URL = (
  process.env.S3_PUBLIC_URL || `https://${BUCKET}.s3.${REGION}.amazonaws.com`
).replace(/\/+$/, '');

/**
 * Uploads a file buffer to S3 and returns the public URL.
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = path.extname(originalName);
  const key = `products/${randomUUID()}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    })
  );

  // Return the public URL (assumes bucket has public read or CloudFront)
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Deletes a file from S3 by its key (extracted from URL).
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const key = fileUrl.startsWith(`${PUBLIC_URL}/`)
      ? fileUrl.slice(PUBLIC_URL.length + 1)
      : new URL(fileUrl).pathname.slice(1); // remove leading /

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Failed to delete from S3:', error);
  }
}

export { s3Client, BUCKET };
