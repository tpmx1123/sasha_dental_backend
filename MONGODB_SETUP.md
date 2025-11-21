# MongoDB Setup Guide

## Current Issue
Your server is trying to connect to MongoDB but it's not running. Here are two solutions:

---

## Option 1: MongoDB Atlas (Cloud - Recommended) ⭐

MongoDB Atlas is free and doesn't require local installation.

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (closest to you)
4. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Choose "Password" authentication
3. Username: `dentaladmin` (or your choice)
4. Password: Generate a strong password (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Address
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP: `0.0.0.0/0`
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Driver: "Node.js", Version: "5.5 or later"
4. Copy the connection string
   - Example: `mongodb+srv://dentaladmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 6: Update .env File
Replace the connection string in your `.env`:

```env
MONGODB_URI=mongodb+srv://dentaladmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dental_db?retryWrites=true&w=majority
```

**Important:** Replace:
- `YOUR_PASSWORD` with your actual database user password
- `cluster0.xxxxx` with your actual cluster name
- Add `/dental_db` before the `?` to specify database name

### Step 7: Restart Server
```bash
npm run dev
```

You should see: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`

---

## Option 2: Local MongoDB Installation

### Windows Installation

#### Method A: MongoDB Community Server
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service (recommended)
5. Install MongoDB Compass (GUI tool - optional)

#### Method B: MongoDB via Chocolatey
```powershell
choco install mongodb
```

#### Start MongoDB
```powershell
# If installed as service (automatic)
# OR manually:
mongod --dbpath "C:\data\db"
```

#### Create Data Directory (if needed)
```powershell
mkdir C:\data\db
```

### macOS Installation
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux Installation
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Verify Local MongoDB is Running
```bash
# Check if MongoDB is running
mongosh

# Or test connection
mongosh "mongodb://localhost:27017/dental_db"
```

If connected, you'll see: `Current database: dental_db`

---

## Testing Your Connection

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test 2: Create Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "preferredDate": "2024-12-25"
  }'
```

Should return:
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": { ... }
}
```

---

## Troubleshooting

### Error: `connect ECONNREFUSED 127.0.0.1:27017`
**Cause:** MongoDB not running locally

**Solutions:**
1. Start MongoDB: `mongod`
2. Check if MongoDB service is running
3. Use MongoDB Atlas instead (easier)

### Error: `authentication failed`
**Cause:** Wrong username/password in connection string

**Solution:** 
- Verify credentials in MongoDB Atlas
- Update `.env` with correct password

### Error: `IP not whitelisted`
**Cause:** Your IP address not allowed in MongoDB Atlas

**Solution:**
- Go to MongoDB Atlas → Network Access
- Add your IP address or `0.0.0.0/0` (for development)

### Error: `connection timeout`
**Cause:** Network issues or wrong connection string

**Solution:**
- Check internet connection
- Verify connection string format
- Try from different network

---

## Quick Start (MongoDB Atlas)

1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0)
5. Get connection string
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dental_db
   ```
7. Restart server: `npm run dev`

---

## Recommended: MongoDB Atlas

✅ **Advantages:**
- Free tier available
- No local installation needed
- Accessible from anywhere
- Automatic backups
- Easy to scale

❌ **Local MongoDB:**
- Requires installation
- Must be running on your machine
- Manual maintenance
- Not accessible remotely

---

## Next Steps

After MongoDB is connected:
1. ✅ Server will start successfully
2. ✅ Appointment API will work
3. ✅ Data will be saved to MongoDB
4. ✅ Emails will be sent

---

## Need Help?

1. Check server logs for specific error messages
2. Verify `.env` file has correct `MONGODB_URI`
3. Test connection string with MongoDB Compass
4. Check MongoDB Atlas dashboard for connection status

