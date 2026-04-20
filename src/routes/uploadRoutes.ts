import { Router, Request, Response } from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
