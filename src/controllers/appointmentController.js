const Appointment = require('../models/Appointment');
const emailService = require('../services/emailService');
const telecrmService = require('../services/telecrmService');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res) => {
  try {
    const { fullName, email, phone, preferredDate, preferredTime, service, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !preferredDate || !preferredTime || !service) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, phone, preferredDate, preferredTime, service'
      });
    }

    // Validate date is not in the past
    const selectedDate = new Date(preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date cannot be in the past'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(preferredTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Please use HH:MM format (24-hour)'
      });
    }

    // Validate time is not in the past if date is today
    if (selectedDate.toDateString() === today.toDateString()) {
      const [hours, minutes] = preferredTime.split(':').map(Number);
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      
      if (selectedDateTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Selected time cannot be in the past'
        });
      }
    }

    // Validate time is within business hours (9am to 9pm)
    const [hours] = preferredTime.split(':').map(Number);
    if (hours < 9 || hours > 21) {
      return res.status(400).json({
        success: false,
        message: 'Appointments are only available between 9:00 AM and 9:00 PM'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      fullName,
      email,
      phone,
      preferredDate: selectedDate,
      preferredTime,
      service,
      message: message || ''
    });

    // Send confirmation email to patient
    try {
      await emailService.sendAppointmentConfirmation(appointment);
      console.log(`✅ Confirmation email sent to ${appointment.email}`);
    } catch (emailError) {
      console.error('Email sending failed, but appointment saved:', emailError);
      // Don't fail the request if email fails, just log it
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminNotification(appointment);
      console.log('✅ Admin notification email sent');
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError);
      // Don't fail the request if email fails
    }

    // Send lead to TeleCRM (fire-and-forget)
    try {
      await telecrmService.createLead(appointment);
    } catch (telecrmError) {
      console.error('Failed to send lead to TeleCRM:', telecrmError);
      // Don't fail the request if TeleCRM fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment: {
          id: appointment._id,
          appointmentNumber: appointment.appointmentNumber,
          fullName: appointment.fullName,
          email: appointment.email,
          phone: appointment.phone,
          preferredDate: appointment.preferredDate,
          preferredTime: appointment.preferredTime,
          service: appointment.service,
          message: appointment.message,
          createdAt: appointment.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    
    // Handle duplicate appointment number error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment number already exists. Please try again.'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create appointment. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public (should be protected in production)
const getAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build query
    const query = {};

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get appointments
    const appointments = await Appointment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: {
        appointments
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Public (should be protected in production)
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).select('-__v');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Public (should be protected in production)
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  deleteAppointment
};

