const express = require('express');
const router = express.Router();
const {
  getSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getNewsletterStats
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin newsletter routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Newsletter routes
router.get('/stats', getNewsletterStats);
router.get('/', getSubscribers);
router.get('/:id', getSubscriber);
router.put('/:id', updateSubscriber);
router.delete('/:id', deleteSubscriber);

module.exports = router;

