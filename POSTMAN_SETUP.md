# Creating Admin User via Postman

## Method 1: Register Endpoint (Recommended)

### Endpoint
```
POST http://localhost:5000/api/auth/register
```

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "name": "Admin User",
  "email": "admin@sashasmiles.com",
  "password": "admin123"
}
```

### Example using Postman:

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers Tab:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body Tab:**
   - Select: `raw`
   - Select: `JSON` (from dropdown)
   - Paste:
   ```json
   {
     "name": "Admin User",
     "email": "admin@sashasmiles.com",
     "password": "admin123"
   }
   ```
5. **Click "Send"**

### Expected Response (201 Created)
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Admin User",
      "email": "admin@sashasmiles.com",
      "role": "admin"
    }
  }
}
```

**Note:** Token is automatically set in httpOnly cookie. You can immediately login!

---

## Method 2: Using Script (Alternative)

If you prefer using the script:

```bash
cd Backend
npm run create-admin
```

This creates:
- Email: `admin@sashasmiles.com`
- Password: `admin123`

---

## Postman Collection Setup

### 1. Create Admin User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@sashasmiles.com",
  "password": "admin123"
}
```

### 2. Login (Test)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@sashasmiles.com",
  "password": "admin123"
}
```

### 3. Get Current User (Test Auth)
```
GET http://localhost:5000/api/auth/me
```

**Note:** After login, cookies are automatically included in subsequent requests.

---

## Requirements

### Password Requirements:
- Minimum 6 characters
- Will be automatically hashed with bcrypt

### Email Requirements:
- Must be valid email format
- Must be unique (no duplicates)

### Name Requirements:
- Required field
- Max 100 characters

---

## Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

### 400 Bad Request - Email Already Exists
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 400 Bad Request - Password Too Short
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

---

## Testing in Postman

### Step-by-Step:

1. **Open Postman**
2. **Create New Request**
3. **Set Method:** POST
4. **Set URL:** `http://localhost:5000/api/auth/register`
5. **Go to Headers tab:**
   - Add: `Content-Type: application/json`
6. **Go to Body tab:**
   - Select: `raw`
   - Select: `JSON`
   - Add body:
   ```json
   {
     "name": "Admin User",
     "email": "admin@sashasmiles.com",
     "password": "admin123"
   }
   ```
7. **Click Send**

### Verify Success:
- Status: `201 Created`
- Response shows user data
- Cookie is set automatically (check Postman's Cookies tab)

---

## After Creating Admin

You can now:
1. Login at `/secret-login` on frontend
2. Access dashboard at `/secret-dashboard`
3. Use admin endpoints with authentication

---

## Multiple Admins

You can create multiple admin users by calling the register endpoint with different emails:

```json
{
  "name": "Second Admin",
  "email": "admin2@sashasmiles.com",
  "password": "securepassword123"
}
```

---

## Security Note

⚠️ **Important:** In production, you should:
1. Remove or protect the register endpoint
2. Only allow admin creation through secure methods
3. Add rate limiting
4. Add IP whitelisting for admin creation

For now, this endpoint is public for easy setup.

