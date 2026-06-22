const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { isAdmin } = require('../../middlewares/auth');

// Protect all routes in this router
router.use(isAdmin);

router.get('/me', controller.me);

module.exports = router;
