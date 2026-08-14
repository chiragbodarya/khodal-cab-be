import express from 'express';
const router = express.Router();
import controller from './controller';
import { isAdmin } from '../../middlewares/auth';

router.get('/', controller.getBlogs);
router.get('/:slug', controller.getBlogBySlug);

// Admin-only protected routes
router.get('/admin/list', isAdmin, controller.getAdminBlogs);
router.get('/admin/:slug', isAdmin, controller.getAdminBlogBySlug);
router.post('/', isAdmin, controller.createBlog);
router.put('/:id', isAdmin, controller.updateBlog);
router.delete('/:id', isAdmin, controller.deleteBlog);

export default router;
