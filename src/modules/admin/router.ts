import express  from 'express';
const router = express.Router();
import controller  from './controller';
import { isAdmin }  from '../../middlewares/auth';

// Protect all routes in this router
router.use(isAdmin);

router.get('/me', controller.me);

export default router;
