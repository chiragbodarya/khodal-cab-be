import express from 'express';
const router = express.Router();
import controller from './controller';
import { isAdmin } from '../../middlewares/auth';

// Unprotected routes
router.post('/auth/login', controller.login);
router.post('/auth/refresh', controller.refresh);
router.post('/auth/logout', controller.logout);

// Protect all routes below
router.use(isAdmin);

router.get('/me', controller.me);

// Admin Management
router.get('/', controller.getAdmins);
router.post('/', controller.createAdmin);
router.put('/:id/password', controller.changePassword);
router.delete('/:id', controller.deleteAdmin);

export default router;
