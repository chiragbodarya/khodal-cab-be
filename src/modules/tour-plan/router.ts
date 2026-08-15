import express from 'express';
const router = express.Router();
import controller from './controller';
import { isAdmin } from '../../middlewares/auth';

router.get('/', controller.getTourPlans);
router.get('/:id', controller.getTourPlanById);

// Admin-only protected routes
router.get('/admin/list', isAdmin, controller.getAdminTourPlans);
router.get('/admin/:id', isAdmin, controller.getAdminTourPlanById);
router.post('/', isAdmin, controller.createTourPlan);
router.put('/:id', isAdmin, controller.updateTourPlan);
router.delete('/:id', isAdmin, controller.deleteTourPlan);

export default router;
