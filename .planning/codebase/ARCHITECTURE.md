# ARCHITECTURE.md — System Architecture

## Pattern

**Full-Stack Next.js App Router** — Server-first architecture with React Server Components, Server Actions for mutations, and selective client-side interactivity.

No separate backend API. The Next.js app serves as both frontend and backend. Database access happens directly in Server Components and Server Actions.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Client)                                        │
│  React Client Components + Server Action calls          │
├─────────────────────────────────────────────────────────┤
│  Next.js Edge Middleware (middleware.ts)                 │
│  Route protection, CSRF validation                      │
├─────────────────────────────────────────────────────────┤
│  Next.js App Router (app/)                              │
│  Server Components → direct DB access via Prisma        │
│  Server Actions → mutations + revalidation              │
│  API Routes → REST endpoints for specific operations    │
├─────────────────────────────────────────────────────────┤
│  Service Layer (lib/services/)                          │
│  Domain logic extracted from actions                    │
├─────────────────────────────────────────────────────────┤
│  Infrastructure (lib/)                                  │
│  Prisma client, Rate limiting, Email, R2 storage        │
├─────────────────────────────────────────────────────────┤
│  Neon PostgreSQL (external)                             │
│  Upstash Redis, Cloudflare R2, Brevo Email (external)   │
└─────────────────────────────────────────────────────────┘
```

## Entry Points

| Entry | File | Purpose |
|-------|------|---------|
| Root layout | `app/layout.tsx` | HTML shell, ThemeProvider |
| App layout | `app/(app)/layout.tsx` | Sidebar + main content area |
| Middleware | `middleware.ts` | Auth protection, CSRF check |
| Auth handler | `app/api/auth/[...nextauth]/` | NextAuth route handler |

## Route Groups

- **`app/(app)/`** — Authenticated app shell with sidebar navigation
- **`app/login/`, `app/register/`, `app/welcome/`** — Auth-only public pages (redirect if logged in)
- **`app/api/`** — REST API routes for operations not suited to server actions

## Data Flow

### Read (Server Components)
```
Page (Server Component)
  → auth() — verify session
  → prisma.entity.findMany() — direct DB query
  → sanitizePrayers() — strip sensitive fields
  → Render with data
```

### Write (Server Actions)
```
Client Component
  → calls server action (RPC-like)
  → auth() + rate limit check
  → Zod validation (accepts `unknown`)
  → prisma.entity.create/update/delete()
  → revalidatePath() — invalidate Next.js cache
  → return { success, error?, data? }
```

### Infinite Scroll / Polling (Client)
```
FeedLoadMore (Client Component)
  → fetchFeedAction({ cursor, scope })
  → cursor-based pagination via createdAt timestamp
  → AutoRefresh polls for newerThan items
```

## Key Abstractions

### Auth (`lib/auth.ts`, `lib/auth.config.ts`)
- NextAuth v5 with Prisma adapter
- Providers: Google OAuth + Credentials
- Session shape extended with `id` and `role` fields
- `auth()` helper used in both Server Components and Server Actions

### Prisma Client (`lib/prisma.ts`)
- Singleton pattern via `globalThis` to avoid multiple connections during hot-reload
- Neon adapter for WebSocket-based serverless connection
- Query logging enabled in development

### Rate Limiting (`lib/rate-limit.ts`)
- Upstash Redis sliding window limiter
- 4 action types: `pray`, `comment`, `prayer`, `join`
- Degrades gracefully: skips in dev if Redis unconfigured; blocks in production

### Access Control (`lib/services/prayer-access.ts`)
- `canAccessPrayer(userId, prayerMeta)` — centralized visibility check
- Handles PUBLIC/GROUP_ONLY visibility + isHidden flag
- Avoids DB lookup for simple cases (PUBLIC prayers)

### Storage (`lib/r2.ts`)
- Cloudflare R2 via AWS SDK v3
- Presigned POST URLs for direct browser-to-R2 uploads
- Presigned GET or public CDN URL for reads

## Security Architecture

- **Route protection:** Middleware intercepts all requests, enforces auth and role checks
- **CSRF:** Origin header validation in middleware for mutating HTTP methods
- **Input sanitization:** `sanitizeUserInput()` applied before all DB writes
- **Rate limiting:** Per-user sliding window on write actions
- **Password hashing:** bcryptjs (never stored plaintext)
- **Soft deletes:** Users have `isDeleted` flag for LGPD compliance (anonymization, not hard delete)
