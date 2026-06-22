const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { isAdmin } = require('../../middlewares/auth');

router.get('/', controller.getBlogs);
router.get('/:slug', controller.getBlogBySlug);

// Admin-only protected routes
router.post('/', isAdmin, controller.createBlog);
router.put('/:id', isAdmin, controller.updateBlog);
router.delete('/:id', isAdmin, controller.deleteBlog);

module.exports = router;
