# Blog API Documentation

## Overview
This API provides endpoints for managing blog posts. Blogs can be created, updated, and deleted by admin users, while public users can view published blogs.

## Base URL
```
http://localhost:5000/api
```

---

## Public Blog Endpoints

### 1. Get All Published Blogs
Get a paginated list of all published blog posts.

**Endpoint:** `GET /api/blogs`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `tag` (optional): Filter by tag
- `search` (optional): Search in title, excerpt, or content
- `sort` (optional): Sort field and direction (default: `-publishedAt`)

**Example Request:**
```bash
GET /api/blogs?page=1&limit=10&category=Dental&search=cleaning
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": {
    "blogs": [
      {
        "_id": "...",
        "title": "Blog Title",
        "slug": "blog-title",
        "excerpt": "Short description...",
        "featuredImage": "/uploads/blog-images/image.jpg",
        "author": {
          "_id": "...",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "category": "Dental",
        "tags": ["cleaning", "hygiene"],
        "views": 150,
        "publishedAt": "2025-11-04T10:00:00.000Z",
        "createdAt": "2025-11-04T10:00:00.000Z"
      }
    ],
    "categories": ["Dental", "Health", "General"],
    "tags": ["cleaning", "hygiene", "treatment"]
  }
}
```

---

### 2. Get Blog by Slug
Get a single published blog post by its slug.

**Endpoint:** `GET /api/blogs/:slug`

**Example Request:**
```bash
GET /api/blogs/dental-cleaning-tips
```

**Response:**
```json
{
  "success": true,
  "data": {
    "blog": {
      "_id": "...",
      "title": "Dental Cleaning Tips",
      "slug": "dental-cleaning-tips",
      "excerpt": "Short description...",
      "content": "Full blog content...",
      "featuredImage": "/uploads/blog-images/image.jpg",
      "author": {
        "_id": "...",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "category": "Dental",
      "tags": ["cleaning", "hygiene"],
      "views": 151,
      "publishedAt": "2025-11-04T10:00:00.000Z",
      "metaDescription": "SEO description",
      "metaKeywords": ["dental", "cleaning"],
      "readingTime": 5,
      "createdAt": "2025-11-04T10:00:00.000Z"
    }
  }
}
```

**Note:** View count is automatically incremented when a blog is accessed.

---

## Admin Blog Endpoints

All admin endpoints require authentication (cookie-based JWT) and admin role.

### 3. Get All Blogs (Admin)
Get all blogs including drafts.

**Endpoint:** `GET /api/admin/blogs`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`draft` or `published`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title, excerpt, or content
- `sort` (optional): Sort field and direction (default: `-createdAt`)

**Example Request:**
```bash
GET /api/admin/blogs?status=draft&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 30,
  "page": 1,
  "pages": 3,
  "data": {
    "blogs": [
      {
        "_id": "...",
        "title": "Blog Title",
        "slug": "blog-title",
        "excerpt": "Short description...",
        "content": "Full content...",
        "featuredImage": "/uploads/blog-images/image.jpg",
        "author": {
          "_id": "...",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "category": "Dental",
        "tags": ["cleaning"],
        "status": "draft",
        "views": 0,
        "publishedAt": null,
        "createdAt": "2025-11-04T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 4. Get Blog by ID (Admin)
Get a single blog by ID (includes drafts).

**Endpoint:** `GET /api/admin/blogs/:id`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Example Request:**
```bash
GET /api/admin/blogs/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "blog": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Blog Title",
      "slug": "blog-title",
      "excerpt": "Short description...",
      "content": "Full content...",
      "featuredImage": "/uploads/blog-images/image.jpg",
      "author": "...",
      "authorName": "Admin User",
      "category": "Dental",
      "tags": ["cleaning"],
      "status": "draft",
      "views": 0,
      "publishedAt": null,
      "createdAt": "2025-11-04T10:00:00.000Z"
    }
  }
}
```

---

### 5. Create Blog
Create a new blog post.

**Endpoint:** `POST /api/admin/blogs`

**Headers:**
```
Cookie: token=<jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (required): Blog title
- `excerpt` (required): Short description (max 500 chars)
- `content` (required): Full blog content
- `featuredImage` (optional): Image file (jpeg, jpg, png, gif, webp - max 5MB)
- `category` (optional): Blog category (default: "General")
- `tags` (optional): Comma-separated tags or array
- `status` (optional): `draft` or `published` (default: "draft")
- `metaDescription` (optional): SEO description (max 160 chars)
- `metaKeywords` (optional): Comma-separated keywords or array

**Example Request (Form Data):**
```javascript
const formData = new FormData();
formData.append('title', 'Dental Cleaning Tips');
formData.append('excerpt', 'Learn the best practices for dental hygiene...');
formData.append('content', 'Full blog content here...');
formData.append('category', 'Dental');
formData.append('tags', 'cleaning,hygiene,health');
formData.append('status', 'published');
formData.append('featuredImage', imageFile);
```

**Response:**
```json
{
  "success": true,
  "message": "Blog created successfully",
  "data": {
    "blog": {
      "_id": "...",
      "title": "Dental Cleaning Tips",
      "slug": "dental-cleaning-tips",
      "excerpt": "Learn the best practices...",
      "content": "Full blog content...",
      "featuredImage": "/uploads/blog-images/image-1234567890.jpg",
      "author": "...",
      "authorName": "Admin User",
      "category": "Dental",
      "tags": ["cleaning", "hygiene", "health"],
      "status": "published",
      "views": 0,
      "publishedAt": "2025-11-04T10:00:00.000Z",
      "createdAt": "2025-11-04T10:00:00.000Z"
    }
  }
}
```

**Note:** Slug is automatically generated from the title. If status is set to "published", `publishedAt` is automatically set.

---

### 6. Update Blog
Update an existing blog post.

**Endpoint:** `PUT /api/admin/blogs/:id`

**Headers:**
```
Cookie: token=<jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (optional): Blog title
- `excerpt` (optional): Short description
- `content` (optional): Full blog content
- `featuredImage` (optional): New image file (replaces old image)
- `category` (optional): Blog category
- `tags` (optional): Comma-separated tags or array
- `status` (optional): `draft` or `published`
- `metaDescription` (optional): SEO description
- `metaKeywords` (optional): Comma-separated keywords or array

**Example Request:**
```javascript
const formData = new FormData();
formData.append('title', 'Updated Title');
formData.append('status', 'published');
formData.append('featuredImage', newImageFile);
```

**Response:**
```json
{
  "success": true,
  "message": "Blog updated successfully",
  "data": {
    "blog": {
      "_id": "...",
      "title": "Updated Title",
      ...
    }
  }
}
```

**Note:** If a new image is uploaded, the old image is automatically deleted from the server.

---

### 7. Delete Blog
Delete a blog post and its associated image.

**Endpoint:** `DELETE /api/admin/blogs/:id`

**Headers:**
```
Cookie: token=<jwt_token>
```

**Example Request:**
```bash
DELETE /api/admin/blogs/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Blog deleted successfully",
  "data": {}
}
```

**Note:** The associated featured image file is automatically deleted from the server.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Error message 1", "Error message 2"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Blog not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch blogs",
  "error": "Error details (only in development)"
}
```

---

## File Upload Notes

- **Supported formats:** JPEG, JPG, PNG, GIF, WEBP
- **Max file size:** 5MB
- **Storage location:** `uploads/blog-images/`
- **Access URL:** `/uploads/blog-images/filename.jpg`
- **Naming:** Files are renamed with timestamp and random number to ensure uniqueness

---

## Blog Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | Blog title (max 200 chars) |
| slug | String | Auto | URL-friendly identifier (auto-generated) |
| excerpt | String | Yes | Short description (max 500 chars) |
| content | String | Yes | Full blog content |
| featuredImage | String | No | Path to featured image |
| author | ObjectId | Yes | Reference to User model |
| authorName | String | Yes | Author's name |
| category | String | No | Blog category (default: "General") |
| tags | Array | No | Array of tag strings |
| status | String | No | `draft` or `published` (default: "draft") |
| views | Number | No | View count (default: 0) |
| publishedAt | Date | Auto | Set when status changes to "published" |
| metaDescription | String | No | SEO description (max 160 chars) |
| metaKeywords | Array | No | SEO keywords |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

---

## Examples

### Create Blog with Image (cURL)
```bash
curl -X POST http://localhost:5000/api/admin/blogs \
  -H "Cookie: token=your_jwt_token" \
  -F "title=Dental Health Tips" \
  -F "excerpt=Learn important dental health tips" \
  -F "content=Full blog content here..." \
  -F "category=Dental" \
  -F "tags=health,tips,hygiene" \
  -F "status=published" \
  -F "featuredImage=@/path/to/image.jpg"
```

### Update Blog Status (cURL)
```bash
curl -X PUT http://localhost:5000/api/admin/blogs/507f1f77bcf86cd799439011 \
  -H "Cookie: token=your_jwt_token" \
  -F "status=published"
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Slug is automatically generated from title and is unique
- View count increments automatically when a blog is accessed via slug
- Only published blogs are visible to public users
- Draft blogs are only accessible to admin users
- Image files are automatically deleted when blog is deleted or image is replaced

