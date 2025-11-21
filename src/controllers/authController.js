const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Create cookie options (secure httpOnly cookie)
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000)),
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict' // CSRF protection
    };

    // Send token in httpOnly cookie (more secure than headers)
    res.cookie('token', token, cookieOptions);

    // Send response (without token in body for security)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
        // Token is sent in httpOnly cookie, not in response body
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear token cookie
    res.cookie('token', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    // For frontend, you might want to use a frontend URL
    const frontendResetUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      : resetUrl;

    try {
      // Send email
      await emailService.sendPasswordResetEmail(user, frontendResetUrl, resetToken);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Clear reset token if email fails
      user.clearResetToken();
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.clearResetToken();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set token in httpOnly cookie
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
        // Token is sent in httpOnly cookie
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    // Set token in httpOnly cookie
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
        // Token is sent in httpOnly cookie
      }
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
};

// @desc    Register/Create Admin User
// @route   POST /api/auth/register
// @access  Public (for initial setup)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user (default role is admin)
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    // Generate token
    const token = generateToken(user._id);

    // Set token in httpOnly cookie
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
        // Token is sent in httpOnly cookie
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
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
      message: 'Failed to create admin user. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  login,
  register,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword
};

