const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@sashasmiles.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('   Email: admin@sashasmiles.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@sashasmiles.com',
      password: 'admin123', // Change this password after first login!
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@sashasmiles.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin;

