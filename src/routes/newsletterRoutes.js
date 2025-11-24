const express = require('express');
const router = express.Router();
const {
  subscribe
} = require('../controllers/newsletterController');

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Newsletter routes are working' });
});

// Public routes
router.post('/subscribe', subscribe);

module.exports = router;

