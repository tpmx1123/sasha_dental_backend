const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', register); // Create admin user
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);

module.exports = router;

