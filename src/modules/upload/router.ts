import express from 'express';
const router = express.Router();
import controller from './controller';
import { isAdmin } from '../../middlewares/auth';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// Admin-only protected routes
router.post('/', isAdmin, upload.single('image'), controller.uploadImage);
router.get('/', isAdmin, controller.listImages);
router.delete('/:filename', isAdmin, controller.deleteImage);

export default router;
