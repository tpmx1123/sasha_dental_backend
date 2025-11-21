const express = require('express');
const router = express.Router();
const {
  getBlogById,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { uploadSingle } = require('../middlewares/uploadMiddleware');

// All admin blog routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Blog routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', uploadSingle, createBlog);
router.put('/:id', uploadSingle, updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;

