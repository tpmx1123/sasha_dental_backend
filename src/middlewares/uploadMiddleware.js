const multer = require('multer');
const path = require('path');

// Configure multer to store files in memory (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Configure multer - store in memory for Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary supports larger files)
  },
  fileFilter: fileFilter
});

// Export middleware
module.exports = {
  upload,
  uploadSingle: upload.single('featuredImage'),
  uploadMultiple: upload.array('images', 10)
};

