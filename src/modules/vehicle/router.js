const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { isAdmin } = require('../../middlewares/auth');

router.get('/', controller.getVehicles);
router.get('/:id', controller.getVehicleById);

// Admin-only protected routes
router.post('/', isAdmin, controller.createVehicle);
router.put('/:id', isAdmin, controller.updateVehicle);
router.delete('/:id', isAdmin, controller.deleteVehicle);

module.exports = router;
