const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

// Create appointment
router.post('/', createAppointment);

// Get all appointments
router.get('/', getAppointments);

// Get single appointment
router.get('/:id', getAppointment);

// Delete appointment
router.delete('/:id', deleteAppointment);

module.exports = router;

