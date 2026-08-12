import express  from 'express';
const router = express.Router();
import controller  from './controller';
import { isAdmin }  from '../../middlewares/auth';

router.get('/', controller.getCabPlans);
router.get('/:id', controller.getCabPlanById);

// Admin-only protected routes
router.get('/admin/list', isAdmin, controller.getAdminCabPlans);
router.get('/admin/:id', isAdmin, controller.getAdminCabPlanById);
router.post('/', isAdmin, controller.createCabPlan);
router.put('/:id', isAdmin, controller.updateCabPlan);
router.delete('/:id', isAdmin, controller.deleteCabPlan);

export default router;
