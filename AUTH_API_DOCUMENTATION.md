# Authentication & Admin API Documentation

## Base URLs
- Auth: `http://localhost:5000/api/auth`
- Admin: `http://localhost:5000/api/admin`

---

## Authentication Endpoints

### 1. Login
**POST** `/api/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@sashasmiles.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@sashasmiles.com",
      "role": "admin"
    }
  }
}
```

**Note:** Token is automatically sent as an **httpOnly cookie** (more secure than headers). The frontend doesn't need to handle tokens manually - cookies are sent automatically with each request.

---

### 2. Get Current User
**GET** `/api/auth/me`

Get current logged-in user information.

**Note:** Token is automatically read from httpOnly cookie. No headers needed.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@sashasmiles.com",
      "role": "admin",
      "createdAt": "2024-12-20T10:00:00.000Z"
    }
  }
}
```

---

### 3. Logout
**POST** `/api/auth/logout`

Logout user (clears httpOnly cookie).

**Note:** Token is automatically read from cookie. No headers needed.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

### 4. Forgot Password
**POST** `/api/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "admin@sashasmiles.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

**Note:** Email will be sent with reset link (valid for 15 minutes).

---

### 5. Reset Password
**PUT** `/api/auth/reset-password/:resettoken`

Reset password using token from email.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "user": {...},
    "token": "new_token..."
  }
}
```

---

### 6. Update Password
**PUT** `/api/auth/update-password`

Change password (requires current password).

**Note:** Token is automatically read from httpOnly cookie. No headers needed.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": {
    "user": {...},
    "token": "new_token..."
  }
}
```

---

## Admin Dashboard Endpoints

**All admin endpoints require:**
- Authentication (httpOnly cookie - sent automatically)
- Admin role

### 1. Get Dashboard Statistics
**GET** `/api/admin/stats`

Get dashboard statistics and overview.

**Note:** Token is automatically read from httpOnly cookie. No headers needed.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 150,
      "today": 5,
      "thisWeek": 25,
      "thisMonth": 80,
      "statusBreakdown": {
        "pending": 30,
        "confirmed": 50,
        "cancelled": 10,
        "completed": 60
      },
      "recentAppointments": [...]
    }
  }
}
```

---

### 2. Get All Appointments
**GET** `/api/admin/appointments`

Get all appointments with filters and pagination.

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, cancelled, completed)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort field (default: -createdAt)
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `search` - Search in name, email, phone, appointment number

**Example:**
```
GET /api/admin/appointments?status=pending&page=1&limit=20&search=john
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 20,
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": {
    "appointments": [...]
  }
}
```

---

### 3. Get Single Appointment
**GET** `/api/admin/appointments/:id`

Get appointment details by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointment": {...}
  }
}
```

---

### 4. Update Appointment Status
**PUT** `/api/admin/appointments/:id/status`

Update appointment status.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `cancelled`
- `completed`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "appointment": {...}
  }
}
```

---

### 5. Delete Appointment
**DELETE** `/api/admin/appointments/:id`

Delete an appointment.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment deleted successfully",
  "data": {}
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'user' is not authorized to access this route"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

---

## Setup Instructions

### 1. Create Admin User

Run the script to create the first admin user:

```bash
npm run create-admin
```

Default credentials:
- Email: `admin@sashasmiles.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change the password after first login!

### 2. Update .env

Make sure these are set in `.env`:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

---

## Frontend Integration Example

### Login (with credentials for cookies)
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // IMPORTANT: Include cookies
  body: JSON.stringify({
    email: 'admin@sashasmiles.com',
    password: 'admin123'
  })
});

const data = await response.json();
// Token is automatically stored in httpOnly cookie - no manual handling needed!
// Just use data.data.user for user info
```

### Authenticated Request (cookies sent automatically)
```javascript
// No need to manually add token - cookies are sent automatically!
const response = await fetch('http://localhost:5000/api/admin/stats', {
  credentials: 'include' // IMPORTANT: Include cookies in request
});

const data = await response.json();
```

### Logout (clears cookie)
```javascript
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Include cookies
});
```

**Key Points:**
- ✅ Always use `credentials: 'include'` in fetch requests
- ✅ Token is stored in httpOnly cookie (secure, not accessible via JavaScript)
- ✅ No need to manually store or send tokens
- ✅ Cookies are sent automatically with every request

---

## Security Notes

1. **Password Requirements:**
   - Minimum 6 characters
   - Stored as bcrypt hash

2. **Token Expiration:**
   - Default: 7 days
   - Configurable via `JWT_EXPIRE` in `.env`

3. **Password Reset:**
   - Token expires in 15 minutes
   - Token is single-use

4. **Role-Based Access:**
   - Admin routes require `admin` role
   - Regular users cannot access admin endpoints

