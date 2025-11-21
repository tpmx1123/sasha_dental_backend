const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  deleteAppointment,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Appointment routes
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;

