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

export default router;
