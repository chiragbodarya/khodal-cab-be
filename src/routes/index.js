const express = require('express');
const router = express.Router();
const taskRoutes = require('./taskRoutes');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is working fine' });
});

// router.use('/tasks', taskRoutes);

module.exports = router;
