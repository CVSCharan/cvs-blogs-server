# CVS Blogs Server

> Production-grade REST API for a personal blog platform — built with **Express**, **TypeScript**, **Prisma 7**, and **PostgreSQL (Neon)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) |
| Language | TypeScript 6 |
| Framework | Express 5 |
| ORM | Prisma 7 (with `@prisma/adapter-pg`) |
| Database | PostgreSQL via Neon (serverless) |
| Logger | Winston + `winston-daily-rotate-file` |
| HTTP Logger | Morgan (piped into Winston) |
| Security | Helmet, CORS |
| Dev Server | ts-node-dev (hot-reload) |

---

## Prerequisites

- Node.js `>=20`
- A PostgreSQL database URL (Neon recommended)

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd cvs-blogs-server
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
NODE_ENV=development
PORT=8000
LOG_LEVEL=debug
JWT_SECRET=change_me_to_a_long_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Push the schema to the database

```bash
npm run prisma:push
```

### 4. Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:8000`

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production server |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:migrate` | Create and apply a migration |
| `npm run prisma:push` | Push schema directly to DB (no migration file) |
| `npm run prisma:studio` | Open Prisma Studio GUI |

---

## Project Structure

```
cvs-blogs-server/
├── src/
│   ├── index.ts                  # Entry point — server bootstrap + graceful shutdown
│   ├── app.ts                    # Express app — middleware, routes, error handling
│   ├── routes/
│   │   └── index.ts              # Versioned API router (/api/v1)
│   ├── controllers/
│   │   └── health.controller.ts  # GET /api/v1/health
│   ├── middleware/
│   │   ├── errorHandler.ts       # Global error handler
│   │   └── notFound.ts           # 404 handler
│   └── utils/
│       ├── prisma.ts             # Prisma singleton with PrismaPg adapter
│       ├── logger.ts             # Winston logger (file rotation + console)
│       ├── AppError.ts           # Custom operational error class
│       └── catchAsync.ts         # Async route wrapper (no try/catch boilerplate)
├── prisma/
│   └── schema.prisma             # Database schema (User, Post, Tag, Comment)
├── logs/                         # Auto-generated log files (git-ignored)
├── docs/
│   └── PROGRESS.md               # Day-by-day development log
├── prisma.config.ts              # Prisma 7 config (datasource URL)
├── tsconfig.json
├── .env                          # Local secrets (never commit)
├── .env.example                  # Template for env vars
└── .gitignore
```

---

## API Endpoints

### Health

```
GET /api/v1/health
```

**Response (200)**
```json
{
  "status": "success",
  "message": "Server is healthy",
  "database": "connected",
  "environment": "development",
  "timestamp": "2026-05-12T02:34:45.474Z"
}
```

---

## Database Schema

```
User       — email, name, hashed password, role (USER | ADMIN)
Post       — title, slug (unique), content, excerpt, published flag
Tag        — name, slug (unique), many-to-many with Post
Comment    — content, linked to Post + User, cascades on post delete
```

---

## Logging

Winston writes structured JSON logs to rotating daily files under `logs/`:

| File pattern | Level | Retention |
|---|---|---|
| `combined-YYYY-MM-DD.log` | info+ | 14 days |
| `error-YYYY-MM-DD.log` | error only | 30 days |
| `exceptions-YYYY-MM-DD.log` | uncaught exceptions | 30 days |
| `rejections-YYYY-MM-DD.log` | unhandled rejections | 30 days |

In development, logs are also pretty-printed to the console with colours.

---

## Error Handling

- `AppError` — Operational errors (4xx/5xx) thrown intentionally in controllers
- `catchAsync` — Wraps async handlers, forwards thrown errors to the global handler
- Global middleware handles Prisma errors:
  - `P2002` → 409 Conflict (unique constraint)
  - `P2025` → 404 Not Found
  - `P2003` → 400 Bad Request (foreign key)

---

## Roadmap

See [`docs/PROGRESS.md`](./docs/PROGRESS.md) for day-by-day progress.

- [x] Project scaffold + TypeScript config
- [x] Prisma 7 schema (User, Post, Tag, Comment)
- [x] PostgreSQL connection via Neon + PrismaPg adapter
- [x] Express app (helmet, cors, morgan, payload limits)
- [x] Winston logger with daily-rotating file transports
- [x] Global error handling (AppError + catchAsync)
- [x] Health check endpoint
- [x] Graceful shutdown (SIGTERM / SIGINT)
- [ ] Authentication (JWT — register, login, refresh)
- [ ] Post CRUD (create, read, update, delete, publish)
- [ ] Tags management
- [ ] Comments
- [ ] Pagination + filtering
- [ ] Rate limiting
- [ ] Input validation (Zod)
- [ ] API documentation (Swagger / Scalar)
- [ ] Tests (Jest + Supertest)

---

## Contributing

This is a personal project. PRs are welcome but please open an issue first.

---

## License

ISC © CVS
