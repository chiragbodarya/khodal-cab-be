import express from 'express';
const router = express.Router();
import controller from './controller';
import { isAdmin } from '../../middlewares/auth';

// Public endpoint for submitting any inquiry / contact us form
router.post('/', controller.createInquiry);

// Admin-only protected endpoints
router.get('/admin/list', isAdmin, controller.getInquiries);
router.get('/admin/stats', isAdmin, controller.getInquiryStats);
router.get('/admin/:id', isAdmin, controller.getInquiryById);
router.patch('/admin/:id', isAdmin, controller.updateInquiry);
router.delete('/admin/:id', isAdmin, controller.deleteInquiry);

export default router;
