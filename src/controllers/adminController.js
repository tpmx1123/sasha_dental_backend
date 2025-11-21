const Appointment = require('../models/Appointment');
const moment = require('moment');

// @desc    Get all appointments with filters
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};

    // Filter by date range
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) {
        query.preferredDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.preferredDate.$lte = new Date(endDate);
      }
    }

    // Search in name, email, phone, or appointment number
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { appointmentNumber: { $regex: search, $options: 'i' } }
      ];
    }

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
// @route   GET /api/admin/appointments/:id
// @access  Private/Admin
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
// @route   DELETE /api/admin/appointments/:id
// @access  Private/Admin
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

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf('day').toDate();
    const thisMonth = moment().startOf('month').toDate();
    const thisYear = moment().startOf('year').toDate();

    // Total appointments
    const totalAppointments = await Appointment.countDocuments();

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      preferredDate: { $gte: today }
    });

    // This month's appointments
    const monthAppointments = await Appointment.countDocuments({
      preferredDate: { $gte: thisMonth }
    });

    // Recent appointments (last 5)
    const recentAppointments = await Appointment.find()
      .sort('-createdAt')
      .limit(5)
      .select('fullName email preferredDate appointmentNumber createdAt')
      .lean();

    // Appointments this week
    const weekStart = moment().startOf('week').toDate();
    const weekAppointments = await Appointment.countDocuments({
      preferredDate: { $gte: weekStart }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalAppointments,
          today: todayAppointments,
          thisWeek: weekAppointments,
          thisMonth: monthAppointments,
          recentAppointments
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  deleteAppointment,
  getDashboardStats
};

