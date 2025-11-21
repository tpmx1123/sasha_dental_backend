const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required'],
    validate: {
      validator: function(value) {
        // Ensure the date is not in the past
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Preferred date cannot be in the past'
    }
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    trim: true,
    maxlength: [200, 'Service name cannot exceed 200 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  appointmentNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate appointment number before saving
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentNumber && this.isNew) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentNumber = `APT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for better query performance
appointmentSchema.index({ email: 1, preferredDate: 1 });
appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

