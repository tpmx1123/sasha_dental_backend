const Blog = require('../models/Blog');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get all published blogs (public)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      tag,
      search,
      sort = '-publishedAt'
    } = req.query;

    // Build query - only published blogs
    const query = { status: 'published' };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Search in title, excerpt, or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get blogs
    const blogs = await Blog.find(query)
      .select('-content') // Exclude full content from list
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Blog.countDocuments(query);

    // Get categories for filter
    const categories = await Blog.distinct('category', { status: 'published' });
    const tags = await Blog.distinct('tags', { status: 'published' });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: {
        blogs,
        categories,
        tags
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single blog by slug (public)
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
      .populate('author', 'name email')
      .select('-__v');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single blog by ID (admin)
// @route   GET /api/admin/blogs/:id
// @access  Private/Admin
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email')
      .select('-__v');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all blogs (admin - includes drafts)
// @route   GET /api/admin/blogs
// @access  Private/Admin
const getAllBlogs = async (req, res) => {
  try {
    const { 
      status,
      page = 1, 
      limit = 10, 
      category,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get blogs
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: {
        blogs
      }
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new blog
// @route   POST /api/admin/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    // Get author info
    const author = await User.findById(req.user.id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Handle featured image
    let featuredImage = null;
    if (req.file) {
      // Get the file path relative to the server
      featuredImage = `/uploads/blog-images/${req.file.filename}`;
    }

    // Parse tags if it's a string
    let tags = [];
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      }
    }

    // Parse meta keywords
    let metaKeywords = [];
    if (req.body.metaKeywords) {
      if (typeof req.body.metaKeywords === 'string') {
        metaKeywords = req.body.metaKeywords.split(',').map(kw => kw.trim()).filter(kw => kw);
      } else if (Array.isArray(req.body.metaKeywords)) {
        metaKeywords = req.body.metaKeywords;
      }
    }

    // Create blog
    const blogData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      author: req.user.id,
      authorName: author.name,
      category: req.body.category || 'General',
      tags,
      status: req.body.status || 'draft',
      metaDescription: req.body.metaDescription,
      metaKeywords
    };

    if (featuredImage) {
      blogData.featuredImage = featuredImage;
    }

    const blog = await Blog.create(blogData);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Create blog error:', error);
    
    // Delete uploaded file if blog creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/blog-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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
      message: 'Failed to create blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update blog
// @route   PUT /api/admin/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Handle featured image update
    let oldImagePath = null;
    if (req.file) {
      oldImagePath = blog.featuredImage;
      blog.featuredImage = `/uploads/blog-images/${req.file.filename}`;
    }

    // Parse tags
    if (req.body.tags !== undefined) {
      if (typeof req.body.tags === 'string') {
        blog.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(req.body.tags)) {
        blog.tags = req.body.tags;
      }
    }

    // Parse meta keywords
    if (req.body.metaKeywords !== undefined) {
      if (typeof req.body.metaKeywords === 'string') {
        blog.metaKeywords = req.body.metaKeywords.split(',').map(kw => kw.trim()).filter(kw => kw);
      } else if (Array.isArray(req.body.metaKeywords)) {
        blog.metaKeywords = req.body.metaKeywords;
      }
    }

    // Update other fields
    if (req.body.title) blog.title = req.body.title;
    if (req.body.excerpt) blog.excerpt = req.body.excerpt;
    if (req.body.content) blog.content = req.body.content;
    if (req.body.category) blog.category = req.body.category;
    if (req.body.status) blog.status = req.body.status;
    if (req.body.metaDescription) blog.metaDescription = req.body.metaDescription;

    // If status changed to published, set publishedAt
    if (req.body.status === 'published' && blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    // Delete old image if new image was uploaded
    if (oldImagePath && req.file) {
      const oldFilePath = path.join(__dirname, '../../', oldImagePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: {
        blog
      }
    });
  } catch (error) {
    console.error('Update blog error:', error);

    // Delete uploaded file if update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/blog-images', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete associated image file
    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '../../', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog
};

