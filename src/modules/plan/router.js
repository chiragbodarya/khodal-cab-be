const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { isAdmin } = require('../../middlewares/auth');

router.get('/', controller.getTravelPlans);
router.get('/:id', controller.getTravelPlanById);

// Admin-only protected routes
router.post('/', isAdmin, controller.createTravelPlan);
router.put('/:id', isAdmin, controller.updateTravelPlan);
router.delete('/:id', isAdmin, controller.deleteTravelPlan);

module.exports = router;
