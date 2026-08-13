import { Request, Response, NextFunction } from 'express';
import express  from 'express';
const router = express.Router();

import adminRouter  from '../modules/admin/router';
import vehicleRouter  from '../modules/vehicle/router';
import blogRouter  from '../modules/blog/router';
import uploadRouter  from '../modules/upload/router';
import cabPlanRouter  from '../modules/cab-plan/router';
import tourPlanRouter  from '../modules/tour-plan/router';
import galleryRouter  from '../modules/gallery/router';

router.get('/health', (req: any, res: Response) => {
  res.json({ status: 'ok', message: 'API is working fine' });
});

router.use('/admin', adminRouter);
router.use('/vehicles', vehicleRouter);
router.use('/cab-plans', cabPlanRouter);
router.use('/tour-plans', tourPlanRouter);
router.use('/gallery', galleryRouter);
router.use('/blogs', blogRouter);
router.use('/upload', uploadRouter);

export default router;
