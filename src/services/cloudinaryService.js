const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'di4caiech',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} filename - Original filename
 * @param {String} folder - Folder path in Cloudinary (optional)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, filename, folder = 'blog-images') => {
  return new Promise((resolve, reject) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = filename.substring(filename.lastIndexOf('.'));
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const uniqueFilename = `${nameWithoutExt}-${uniqueSuffix}`;
    
    // Convert buffer to stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: uniqueFilename,
        resource_type: 'image',
        upload_preset: 'dental_sasha',
        overwrite: false,
        unique_filename: true,
        format: ext.substring(1) // Remove the dot from extension
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    
    // Pipe to Cloudinary
    readableStream.pipe(stream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID or URL
 * @returns {Promise<Object>} Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    // Extract public_id from URL if full URL is provided
    let extractedPublicId = publicId;
    
    // If it's a full Cloudinary URL, extract the public_id
    if (publicId.includes('cloudinary.com')) {
      // Extract public_id from URL like: https://res.cloudinary.com/di4caiech/image/upload/v1234567890/blog-images/filename.jpg
      const urlParts = publicId.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && urlParts.length > uploadIndex + 1) {
        // Get everything after 'upload' and before the version
        const pathParts = urlParts.slice(uploadIndex + 1);
        // Remove version if present (starts with 'v')
        const filteredParts = pathParts.filter(part => !part.startsWith('v') || !/^v\d+$/.test(part));
        extractedPublicId = filteredParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
      }
    } else if (publicId.startsWith('/')) {
      // If it's a local path like /uploads/blog-images/..., extract just the filename
      const pathParts = publicId.split('/');
      const filename = pathParts[pathParts.length - 1];
      extractedPublicId = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    const result = await cloudinary.uploader.destroy(extractedPublicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Check if URL is a Cloudinary URL
 * @param {String} url - URL to check
 * @returns {Boolean}
 */
const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryUrl,
  cloudinary
};

