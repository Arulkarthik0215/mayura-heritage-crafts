import { Router, Response } from 'express';
import multer from 'multer';
import { uploadToS3, deleteFromS3 } from '../lib/s3';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Multer stores in memory — we'll push to S3 ourselves
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
});

/**
 * POST /api/upload
 * Protected — uploads a single image file to AWS S3.
 * Returns the public URL of the uploaded image.
 */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const imageUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
);

/**
 * POST /api/upload/multiple
 * Protected — uploads multiple image files to AWS S3.
 * Returns an array of public URLs.
 */
router.post(
  '/multiple',
  authMiddleware,
  upload.array('images', 10),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image files provided' });
        return;
      }

      const urls = await Promise.all(
        files.map((file) => uploadToS3(file.buffer, file.originalname, file.mimetype))
      );

      res.json({ urls });
    } catch (error: any) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
);

/**
 * DELETE /api/upload
 * Protected — deletes an image from AWS S3.
 * Body: { url: "https://..." }
 */
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    await deleteFromS3(url);
    res.json({ message: 'Image deleted successfully' });
  } catch (error: any) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
});

export default router;
