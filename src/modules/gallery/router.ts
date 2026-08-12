import express  from 'express';
const router = express.Router();
import controller  from './controller';
import { isAdmin }  from '../../middlewares/auth';

router.get('/', controller.getGalleries);
router.get('/:id', controller.getGalleryById);

// Admin-only protected routes
router.post('/', isAdmin, controller.createGallery);
router.put('/:id', isAdmin, controller.updateGallery);
router.delete('/:id', isAdmin, controller.deleteGallery);

export default router;
