const express = require('express');
const router = express.Router();

const adminLoginRouter = require('../modules/admin-login/router');
const adminRouter = require('../modules/admin/router');
const vehicleRouter = require('../modules/vehicle/router');
const planRouter = require('../modules/plan/router');
const blogRouter = require('../modules/blog/router');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is working fine' });
});

router.use('/admin/auth', adminLoginRouter);
router.use('/admin', adminRouter);
router.use('/vehicles', vehicleRouter);
router.use('/travel-plans', planRouter);
router.use('/blogs', blogRouter);

module.exports = router;
