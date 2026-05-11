# GEMINI.md — Agent Instructions for CVS Blogs Server

This file gives Gemini (and any Gemini-based agent) full context about this project so it can assist without re-discovering conventions each session.

---

## Project Overview

**CVS Blogs Server** is a production-grade REST API for a personal blog platform.

| | |
|---|---|
| Language | TypeScript 6 (strict mode) |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL (Neon serverless) |
| Logger | Winston + winston-daily-rotate-file |
| Dev Server | ts-node-dev |

Source code lives in `src/`. Entry point is `src/index.ts`.

---

## Critical: Prisma 7 Specifics

Prisma 7 has two major breaking changes from v5/v6. **Never revert these**:

### 1. `prisma.config.ts` is mandatory
The `url` field inside `schema.prisma`'s `datasource` block is **removed**. Connection URLs must live in `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: env("DATABASE_URL") },
});
```

Do **not** add `url = env("DATABASE_URL")` back into `prisma/schema.prisma`.

### 2. Driver adapter is mandatory
`new PrismaClient()` with no arguments **throws** in Prisma 7. Always pass a driver adapter:

```ts
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

The singleton is at `src/utils/prisma.ts`. **Always import from there**, never instantiate a new client.

---

## Architecture Patterns

### Error Handling
Two utilities exist — always use them in controllers:

**`AppError`** (`src/utils/AppError.ts`) — for operational errors:
```ts
throw new AppError('Resource not found', 404);
```

**`catchAsync`** (`src/utils/catchAsync.ts`) — wraps async handlers:
```ts
export const myHandler = catchAsync(async (req, res, next) => {
  // No try/catch needed — errors auto-forward to globalErrorHandler
});
```

**Never** use bare `try/catch` in controllers. **Never** use `console.error` — always use the logger.

### Logging
Import from `src/utils/logger.ts`:
```ts
import logger from '../utils/logger';

logger.info('Something happened');
logger.warn('Something suspicious', { context });
logger.error('Something broke', { error, stack });
```

**Never** use `console.log`, `console.error`, or `console.warn` anywhere in `src/`.

### Routes
All routes are versioned under `/api/v1`. Add new route files inside `src/routes/` and register them in `src/routes/index.ts`.

Pattern for a new resource:
```
src/routes/post.routes.ts
src/controllers/post.controller.ts
```

### Controllers
All controllers must:
1. Be wrapped in `catchAsync`
2. Use `AppError` for predictable failures
3. Return consistent JSON shape:
   - Success: `{ status: 'success', data: { ... } }`
   - Fail: handled by `globalErrorHandler`

---

## File Structure

```
src/
├── index.ts                 # Bootstrap — never add business logic here
├── app.ts                   # Express config — add global middleware here only
├── routes/index.ts          # Central router — register all sub-routers here
├── controllers/             # One file per resource
├── middleware/              # App-wide middleware
│   ├── errorHandler.ts      # Global error handler — DO NOT MODIFY lightly
│   └── notFound.ts          # 404 — DO NOT MODIFY
└── utils/
    ├── prisma.ts            # Prisma singleton — import this everywhere
    ├── logger.ts            # Winston logger — import this everywhere
    ├── AppError.ts          # Operational error class
    └── catchAsync.ts        # Async handler wrapper
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `PORT` | HTTP port (default 8000) |
| `LOG_LEVEL` | Winston level (`debug` in dev) |
| `JWT_SECRET` | Min 32-char JWT signing secret |
| `JWT_EXPIRES_IN` | Token TTL e.g. `7d` |
| `CLIENT_URL` | Allowed CORS origin |

---

## Dev Commands

```bash
npm run dev           # Hot-reload dev server (ts-node-dev)
npm run build         # Compile to dist/
npm start             # Run compiled production build
npm run prisma:push   # Push schema to DB
npm run prisma:studio # Open Prisma Studio
```

---

## Code Conventions

- **No `any` types** unless absolutely unavoidable and commented why
- **No `console.*`** — use `logger`
- **No bare `try/catch`** in controllers — use `catchAsync`
- **No new PrismaClient instances** — use the singleton from `src/utils/prisma.ts`
- All new fields in Prisma schema use `@default(uuid())` for IDs and include `createdAt` / `updatedAt`
- Controllers are thin — logic belongs in service files (to be introduced)

---

## Known Gotchas

1. **Neon uses a pooler URL** — the DATABASE_URL ends in `-pooler.` — this is correct and intentional for connection pooling. Do not "fix" it to a direct URL for regular operation (use direct URL only for migrations if needed).
2. **`prisma db push` vs `prisma migrate dev`** — we used `db push` for rapid prototyping in the early setup. Once the schema stabilizes, switch to `prisma migrate dev` for proper migration history.
3. **`ts-node-dev` uses `--transpile-only`** — TypeScript errors won't crash the dev server. Always run `npx tsc --noEmit` separately to catch type errors.

---

## Progress Tracking

See `docs/PROGRESS.md` for the full day-by-day development log.
