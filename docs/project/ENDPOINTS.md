# API Endpoints Reference (Frontend Integration Guide)

All routes are prefixed with `/api/v1`. All success responses follow the shape: `{ status: 'success', data: { ... } }`.

---

## 🔐 Authentication

### **Register**
- **Endpoint**: `POST /auth/register`
- **Body**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response (201)**: Returns user object and `accessToken`. Sets `refresh_token` cookie.

### **Login**
- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response (200)**: Same as Register.

---

## 📝 Posts

### **List Posts**
- **Endpoint**: `GET /posts`
- **Query Params**: `page`, `limit`, `search`, `tag`, `categoryId`
- **Response (200)**: Includes `posts` array and `pagination` object. Each post includes counts for `likes` and `comments`.

### **Get Single Post**
- **Endpoint**: `GET /posts/:slug`
- **Response (200)**: Includes full content, nested comments, and interaction flags:
```json
{
  "isLiked": true,
  "isBookmarked": false,
  "_count": { "likes": 42, "comments": 5 }
}
```

---

## ❤️ Social & Engagement

### **Toggle Like**
- **Endpoint**: `POST /posts/:postId/like`
- **Response**: `{ "liked": true }` or `{ "liked": false }`

### **Toggle Follow**
- **Endpoint**: `POST /users/:userId/follow`
- **Response**: `{ "following": true }` or `{ "following": false }`

---

## 💬 Comments
- **Endpoint**: `POST /posts/:postId/comments`
- **Body**: `{ "content": "...", "parentId": "optional_uuid" }`

---

## 📁 Categories
- **Endpoint**: `GET /categories`
- **Endpoint**: `GET /categories/:slug` (returns category info + all posts in it)

---

## 👤 Users
- **Endpoint**: `GET /users/me`
- **Response**: Includes `_count: { followers: X, following: Y, posts: Z }` and `isFollowing` flag.

---

## 🛡️ Admin
- **Endpoint**: `GET /admin/stats` (Global metrics)

---

## 📚 Documentation
- **Interactive Swagger UI**: `/api-docs`
