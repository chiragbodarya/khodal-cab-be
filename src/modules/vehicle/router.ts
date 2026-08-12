import express  from 'express';
const router = express.Router();
import controller  from './controller';
import { isAdmin }  from '../../middlewares/auth';

router.get('/', controller.getVehicles);
router.get('/:id', controller.getVehicleById);

// Admin-only protected routes
router.get('/admin/list', isAdmin, controller.getAdminVehicles);
router.get('/admin/:id', isAdmin, controller.getAdminVehicleById);
router.post('/', isAdmin, controller.createVehicle);
router.put('/:id', isAdmin, controller.updateVehicle);
router.delete('/:id', isAdmin, controller.deleteVehicle);

export default router;
