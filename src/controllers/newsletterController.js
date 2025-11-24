const Newsletter = require('../models/Newsletter');
const emailService = require('../services/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase().trim() });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed'
        });
      } else {
        // Reactivate the subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }
    }

    // Create new subscription
    const subscriber = await Newsletter.create({
      email: email.toLowerCase().trim(),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        subscriber: {
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt
        }
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

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
      message: 'Failed to subscribe. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all subscribers
// @route   GET /api/admin/newsletter
// @access  Private/Admin
const getSubscribers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-subscribedAt',
      status = 'all', // all, active, inactive
      search
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by email
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get subscribers
    const subscribers = await Newsletter.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subscribers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: {
        subscribers
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get subscriber by ID
// @route   GET /api/admin/newsletter/:id
// @access  Private/Admin
const getSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findById(req.params.id).select('-__v');

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subscriber
      }
    });
  } catch (error) {
    console.error('Get subscriber error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscriber ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriber',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update subscriber status
// @route   PUT /api/admin/newsletter/:id
// @access  Private/Admin
const updateSubscriber = async (req, res) => {
  try {
    const { isActive } = req.body;

    const subscriber = await Newsletter.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    if (isActive !== undefined) {
      subscriber.isActive = isActive;
    }

    await subscriber.save();

    res.status(200).json({
      success: true,
      message: `Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        subscriber
      }
    });
  } catch (error) {
    console.error('Update subscriber error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscriber ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update subscriber',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete subscriber
// @route   DELETE /api/admin/newsletter/:id
// @access  Private/Admin
const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscriber ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get newsletter statistics
// @route   GET /api/admin/newsletter/stats
// @access  Private/Admin
const getNewsletterStats = async (req, res) => {
  try {
    const total = await Newsletter.countDocuments();
    const active = await Newsletter.countDocuments({ isActive: true });
    const inactive = await Newsletter.countDocuments({ isActive: false });

    // Recent subscribers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubscribers = await Newsletter.countDocuments({
      subscribedAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          active,
          inactive,
          recentSubscribers
        }
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  subscribe,
  getSubscribers,
  getSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getNewsletterStats
};

