const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  featuredImage: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Generate slug from title before saving
blogSchema.pre('save', async function(next) {
  if (this.isModified('title') && !this.slug) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure uniqueness
    const count = await mongoose.model('Blog').countDocuments({ slug });
    if (count > 0) {
      slug = `${slug}-${Date.now()}`;
    }
    this.slug = slug;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ createdAt: -1 });

// Virtual for reading time estimation
blogSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;

