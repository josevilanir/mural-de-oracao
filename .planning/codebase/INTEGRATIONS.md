# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**Email:**
- Brevo (formerly Sendinblue) - Transactional email delivery
  - SDK/Client: Raw `fetch` to `https://api.brevo.com/v3/smtp/email`
  - Implementation: `lib/email.ts`
  - Auth: `BREVO_API_KEY` header
  - Sends: password reset, email verification, comment notifications, group status updates, join request status updates
  - Graceful degradation: when `BREVO_API_KEY` is absent, emails are skipped (dev-friendly)

**Note:** `resend` package ^6.9.4 is installed as a dependency but email sending is implemented via Brevo. `resend` appears to be unused or leftover.

## Data Storage

**Databases:**
- Neon PostgreSQL (serverless)
  - Connection: `DATABASE_URL` env var (`postgresql://...neon.tech/...`)
  - Client: Prisma 7.x with `PrismaNeon` adapter (`@prisma/adapter-neon`) for serverless HTTP connections
  - Singleton instantiation: `lib/prisma.ts` (guards against hot-reload duplication)
  - Schema: `prisma/schema.prisma`
  - Migrations: `prisma/migrations/`

**File Storage:**
- Cloudflare R2 (S3-compatible object storage)
  - Client: AWS SDK v3 `@aws-sdk/client-s3` configured with R2 endpoint
  - Implementation: `lib/r2.ts`
  - Upload flow: presigned PUT URL generated server-side at `app/api/upload/route.ts`, client uploads directly to R2
  - Credentials: `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
  - Config: `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`
  - Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Presigned URL TTL: 300 seconds (5 minutes)
  - Key pattern: `grupos/<uuid>.<ext>`

**Caching:**
- Upstash Redis (serverless Redis over HTTP)
  - Client: `@upstash/redis` via `Redis.fromEnv()` (reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`)
  - Implementation: `lib/rate-limit.ts`
  - Purpose: rate limiting only (no general caching)
  - Graceful degradation: when env vars absent, all rate limit checks return `success: true`

## Authentication & Identity

**Auth Provider:**
- NextAuth v5 (beta) with dual-strategy auth
  - Implementation: `lib/auth.ts` (Node.js), `lib/auth.config.ts` (Edge-compatible)
  - Adapter: `PrismaAdapter` from `@auth/prisma-adapter` — stores sessions/accounts in Postgres
  - Session strategy: JWT, 30-day expiry
  - Custom pages: sign-in at `/login`, error at `/login`

**OAuth Providers:**
- Google OAuth 2.0
  - SDK: `next-auth/providers/google`
  - Credentials: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - User avatars served from `lh3.googleusercontent.com` (allowed in `next.config.mjs` `remotePatterns`)

**Credentials Auth:**
- Email + password (custom)
  - Password hashing: `bcryptjs`
  - Email verification flow: tokens stored in `EmailVerificationToken` Prisma model
  - Password reset flow: tokens stored in `PasswordResetToken` Prisma model; email sent via Brevo

**Middleware:**
- `middleware.ts` — Edge-runtime auth guard protecting private routes (`/meus-pedidos`, `/novo-pedido`, `/grupos/novo`) and admin routes (`/admin`)

## Monitoring & Observability

**Error Tracking:**
- Not detected — no Sentry, Datadog, or equivalent configured

**Logs:**
- `console.log` / `console.error` used throughout (e.g., `lib/email.ts`, `lib/prisma.ts`)
- Prisma query logging enabled in development (`"query"`, `"error"`, `"warn"`), errors only in production

## CI/CD & Deployment

**Hosting:**
- Not explicitly configured — likely Vercel (Next.js 14 App Router + serverless Neon Postgres + Cloudflare R2 is standard Vercel stack)

**CI Pipeline:**
- Not detected — no `.github/workflows`, `.gitlab-ci.yml`, or equivalent

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - Neon Postgres connection string
- `AUTH_SECRET` - NextAuth JWT signing secret
- `NEXTAUTH_URL` - Canonical app URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth app credentials
- `CLOUDFLARE_R2_ACCOUNT_ID` / `CLOUDFLARE_R2_ACCESS_KEY_ID` / `CLOUDFLARE_R2_SECRET_ACCESS_KEY` - R2 storage credentials
- `CLOUDFLARE_R2_BUCKET_NAME` / `CLOUDFLARE_R2_PUBLIC_URL` - R2 bucket config
- `BREVO_API_KEY` / `BREVO_FROM_EMAIL` / `BREVO_FROM_NAME` - Email delivery

**Optional env vars (graceful degradation when absent):**
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Rate limiting (disabled without these)

**Secrets location:**
- `.env` and `.env.local` (both gitignored); `.env.example` committed as template

## Webhooks & Callbacks

**Incoming:**
- `/api/auth/[...nextauth]` - NextAuth OAuth callback handler (`app/api/auth/[...nextauth]/route.ts`)

**Outgoing:**
- None detected

## Internal API Routes

- `GET /api/upload` - Generate R2 presigned upload URL (`app/api/upload/route.ts`)
- `GET/POST /api/groups` - Group listing and creation (`app/api/groups/route.ts`)
- `GET/PATCH/DELETE /api/groups/[id]` - Group detail operations (`app/api/groups/[id]/route.ts`)
- `GET /api/groups/[id]/pending-members` - Pending membership list (`app/api/groups/[id]/pending-members/route.ts`)
- `GET/PATCH /api/notifications` - Notification list and mark-read (`app/api/notifications/route.ts`)

---

*Integration audit: 2026-03-19*
