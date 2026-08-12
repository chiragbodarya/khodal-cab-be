import express  from 'express';
const router = express.Router();
import controller  from './controller';

router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

export default router;
