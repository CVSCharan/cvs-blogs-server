# API Endpoints Reference (Frontend Integration Guide)

All routes are prefixed with `/api/v1`. All success responses follow the shape: `{ status: 'success', data: { ... } }`.

---

## 🔐 Authentication

### **Register**
- **Endpoint**: `POST /auth/register`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```
- **Response (201)**:
```json
{
  "status": "success",
  "data": {
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "USER" },
    "accessToken": "jwt_string"
  }
}
```

### **Login**
- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "john@example.com", "password": "Password123!" }`
- **Response (200)**: Same as Register. *Note: Also sets an HttpOnly `refresh_token` cookie.*

---

## 📝 Posts

### **List Posts**
- **Endpoint**: `GET /posts`
- **Query Params**: `page`, `limit`, `search`, `tag`
- **Response (200)**:
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Post Title",
        "slug": "post-title",
        "author": { "name": "Admin", "avatarUrl": "..." },
        "tags": [{ "name": "Tech" }],
        "_count": { "comments": 5 }
      }
    ],
    "pagination": { "total": 100, "page": 1, "limit": 10, "pages": 10 }
  }
}
```

### **Get Single Post**
- **Endpoint**: `GET /posts/:slug`
- **Response (200)**: Includes full content and nested comments.

---

## 💬 Comments

### **Create Comment/Reply**
- **Endpoint**: `POST /posts/:postId/comments`
- **Body**: 
```json
{
  "content": "Great post!",
  "parentId": "optional_uuid_for_replies"
}
```

---

## 👤 Users

### **Update Profile**
- **Endpoint**: `PATCH /users/me`
- **Body**: `{ "name": "New Name", "bio": "...", "avatarUrl": "..." }`

---

## 🛡️ Admin

### **System Stats**
- **Endpoint**: `GET /admin/stats`
- **Response (200)**:
```json
{
  "status": "success",
  "data": {
    "stats": {
      "overview": { "totalUsers": 10, "totalPosts": 50, "totalViews": 5000 },
      "popularPosts": [...],
      "recentUsers": [...]
    }
  }
}
```

---

## 📚 Documentation
- **Interactive Swagger UI**: `/api-docs`
- **Raw OpenAPI JSON**: `/api-docs.json`
