# Backend Setup Guide

## 📋 Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)

## 🚀 Quick Start

### 1. Create .env file
Copy `env.example` to `.env`:
```bash
cp env.example .env
```

Or create `.env` manually with these variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dental_db
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

### 2. Update MongoDB URI
- **Local MongoDB**: `mongodb://localhost:27017/dental_db`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/dental_db`

### 3. Start the server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 4. Test the connection
Visit: `http://localhost:5000/health`

## ✅ Verification

If everything is working, you should see:
- ✅ MongoDB Connected: localhost:27017
- 🚀 Server running in development mode on port 5000

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify network/firewall settings

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 5000

