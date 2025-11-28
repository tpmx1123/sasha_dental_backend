const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Test email configuration
router.get('/test', contactController.testEmail);

// Submit contact form
router.post('/', contactController.sendContactEmail);

module.exports = router;
