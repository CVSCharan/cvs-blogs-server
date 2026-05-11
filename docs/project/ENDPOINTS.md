# API Endpoints Reference

All routes are prefixed with `/api/v1`.

## 🔐 Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login & get refresh cookie |
| POST | `/auth/refresh` | Cookie | Rotate access/refresh tokens |
| POST | `/auth/logout` | Cookie | Revoke current session |
| POST | `/auth/logout-all`| Bearer | Revoke all sessions |

## 📝 Posts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/posts` | Public | List posts (search/tag/paginated) |
| GET | `/posts/:slug` | Public | Get post details & comments |
| POST | `/posts` | Bearer | Create a new post |
| PATCH | `/posts/:id` | Bearer | Update post (Author/Admin) |
| DELETE| `/posts/:id` | Bearer | Soft delete post (Author/Admin)|

## 💬 Comments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/posts/:postId/comments` | Bearer | Add comment or reply |
| DELETE| `/posts/:postId/comments/:id`| Bearer | Soft delete comment |

## 👤 Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Bearer | Get current user profile |
| PATCH | `/users/me` | Bearer | Update bio/avatar/name |
| DELETE| `/users/me` | Bearer | Soft delete own account |

## 🛡️ Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Platform statistics & insights |

## 📚 Documentation
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api-docs` | Public | Swagger UI |
| GET | `/api-docs.json` | Public | Raw OpenAPI Specification |
