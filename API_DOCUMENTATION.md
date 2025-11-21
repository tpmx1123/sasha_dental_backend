# Appointment API Documentation

## Base URL
```
http://localhost:5000/api/appointments
```

## Endpoints

### 1. Create Appointment
**POST** `/api/appointments`

Create a new appointment booking.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 000-0000",
  "preferredDate": "2024-12-25",
  "message": "I need a dental checkup"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "appointmentNumber": "APT-000001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1 (555) 000-0000",
      "preferredDate": "2024-12-25T00:00:00.000Z",
      "message": "I need a dental checkup",
      "status": "pending",
      "createdAt": "2024-12-20T10:30:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: fullName, email, phone, preferredDate"
}
```

---

### 2. Get All Appointments
**GET** `/api/appointments`

Retrieve all appointments with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, cancelled, completed)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort field and order (default: -createdAt)

**Example:**
```
GET /api/appointments?status=pending&page=1&limit=10&sort=-createdAt
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": {
    "appointments": [...]
  }
}
```

---

### 3. Get Single Appointment
**GET** `/api/appointments/:id`

Retrieve a specific appointment by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "appointmentNumber": "APT-000001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1 (555) 000-0000",
      "preferredDate": "2024-12-25T00:00:00.000Z",
      "message": "I need a dental checkup",
      "status": "pending",
      "createdAt": "2024-12-20T10:30:00.000Z",
      "updatedAt": "2024-12-20T10:30:00.000Z"
    }
  }
}
```

---

### 4. Update Appointment Status
**PUT** `/api/appointments/:id/status`

Update the status of an appointment.

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
**DELETE** `/api/appointments/:id`

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

## Email Notifications

When an appointment is created, the system automatically sends:

1. **Confirmation Email to Patient**
   - Contains appointment details
   - Appointment number
   - Preferred date
   - Status: Pending Confirmation

2. **Notification Email to Admin**
   - Contains all appointment details
   - Action required notification

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error details"]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create appointment. Please try again.",
  "error": "Error details (development only)"
}
```

---

## Frontend Integration Example

```javascript
// Create appointment
const createAppointment = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        message: formData.message || ''
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Appointment created:', data.data.appointment);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};
```

---

## Environment Variables

Make sure to configure these in your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Sasha Smiles
ADMIN_EMAIL=admin@example.com
```

### Gmail Setup
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `EMAIL_PASSWORD`

