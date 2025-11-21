# Appointment System Setup Complete ✅

## What Was Created

### Backend Files

1. **Model** - `src/models/Appointment.js`
   - MongoDB schema for appointments
   - Auto-generates appointment numbers (APT-000001, etc.)
   - Validates dates, emails, and required fields
   - Tracks status: pending, confirmed, cancelled, completed

2. **Controller** - `src/controllers/appointmentController.js`
   - `createAppointment` - Creates new appointment and sends emails
   - `getAppointments` - Get all appointments with pagination
   - `getAppointment` - Get single appointment by ID
   - `updateAppointmentStatus` - Update appointment status
   - `deleteAppointment` - Delete appointment

3. **Service** - `src/services/emailService.js`
   - Sends confirmation email to patient
   - Sends notification email to admin
   - HTML email templates with styling
   - Supports Gmail and generic SMTP

4. **Routes** - `src/routes/appointmentRoutes.js`
   - POST `/api/appointments` - Create appointment
   - GET `/api/appointments` - Get all appointments
   - GET `/api/appointments/:id` - Get single appointment
   - PUT `/api/appointments/:id/status` - Update status
   - DELETE `/api/appointments/:id` - Delete appointment

5. **Updated Files**
   - `server.js` - Added appointment routes
   - `env.example` - Added email configuration
   - `.env` - Updated with email settings

### Frontend Files

1. **Updated Component** - `bookAppointment.jsx`
   - Connected to API endpoint
   - Loading states
   - Success/error messages
   - Form validation
   - Auto-reset form on success

---

## Setup Instructions

### 1. Backend Setup

#### Configure Email in `.env`

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Sasha Smiles
ADMIN_EMAIL=admin@example.com
```

#### Gmail Setup (Recommended)

1. Go to your Google Account settings
2. Enable **2-Step Verification**
3. Generate an **App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Use this password in `EMAIL_PASSWORD`

#### Alternative: Generic SMTP

If not using Gmail, uncomment and configure in `.env`:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Start the Server

```bash
npm run dev
```

You should see:
- ✅ MongoDB Connected
- 🚀 Server running on port 5000

### 3. Test the API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test appointment creation
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 000-0000",
    "preferredDate": "2024-12-25",
    "message": "Need a checkup"
  }'
```

---

## Frontend Configuration

### Environment Variable (Optional)

Create `.env` in your frontend project:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If not set, it defaults to `http://localhost:5000/api`

---

## How It Works

### 1. User Submits Form
- Frontend sends POST request to `/api/appointments`
- Form data validated on backend

### 2. Appointment Created
- Data saved to MongoDB
- Unique appointment number generated (APT-000001)
- Status set to "pending"

### 3. Emails Sent
- **Confirmation Email** → Patient receives appointment details
- **Notification Email** → Admin receives new appointment alert

### 4. Response Sent
- Success response with appointment details
- Frontend shows success message
- Form resets automatically

---

## Email Templates

### Patient Confirmation Email
- Professional HTML template
- Appointment number
- Date and time
- Contact information
- Status: Pending Confirmation

### Admin Notification Email
- All appointment details
- Action required notice
- Formatted for easy review

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Create new appointment |
| GET | `/api/appointments` | Get all appointments (with pagination) |
| GET | `/api/appointments/:id` | Get single appointment |
| PUT | `/api/appointments/:id/status` | Update appointment status |
| DELETE | `/api/appointments/:id` | Delete appointment |

---

## Database Schema

```javascript
{
  fullName: String (required, max 100 chars)
  email: String (required, validated)
  phone: String (required, max 20 chars)
  preferredDate: Date (required, not in past)
  message: String (optional, max 1000 chars)
  status: String (pending|confirmed|cancelled|completed)
  appointmentNumber: String (auto-generated, unique)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## Troubleshooting

### Email Not Sending
1. Check `.env` email configuration
2. Verify Gmail app password is correct
3. Check server logs for email errors
4. Test email service connection

### MongoDB Connection Issues
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify network/firewall settings

### CORS Errors
1. Check `FRONTEND_URL` in `.env`
2. Ensure frontend URL matches backend CORS config
3. Restart server after changing `.env`

---

## Next Steps

1. ✅ Set up email configuration in `.env`
2. ✅ Test appointment creation
3. ✅ Verify emails are being sent
4. ⚠️ Add authentication (recommended for production)
5. ⚠️ Add rate limiting (recommended)
6. ⚠️ Add input sanitization (recommended)
7. ⚠️ Set up admin dashboard to view appointments

---

## Files Structure

```
Backend/
├── src/
│   ├── models/
│   │   └── Appointment.js
│   ├── controllers/
│   │   └── appointmentController.js
│   ├── services/
│   │   └── emailService.js
│   └── routes/
│       └── appointmentRoutes.js
├── server.js
├── .env
└── package.json
```

---

## Support

For issues or questions:
1. Check server logs for errors
2. Verify all environment variables are set
3. Test API endpoints with Postman/curl
4. Check MongoDB connection
5. Verify email service configuration

