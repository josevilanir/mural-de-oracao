# Integrations

## Database — Neon Serverless PostgreSQL
- **Connection:** `DATABASE_URL` env var pointing to `ep-xxx.neon.tech`
- **Driver:** `@neondatabase/serverless` WebSocket-based driver (edge-compatible)
- **Adapter:** `@prisma/adapter-neon` wraps the Neon driver for Prisma Client
- **Client:** Singleton pattern in `lib/prisma.ts`, reused across hot-reloads via `globalThis`
- **Logging:** `query`, `error`, `warn` in development; `error` only in production

## Authentication — Google OAuth 2.0
- **Provider:** `next-auth/providers/google` configured in `lib/auth.ts`
- **Env vars:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **DB mapping:** `PrismaAdapter` from `@auth/prisma-adapter` maps OAuth accounts to `User` + `Account` models
- **Remote images:** `lh3.googleusercontent.com` allowed in `next.config.mjs` for Google profile avatars

## Authentication — Credentials
- **Provider:** `next-auth/providers/credentials` in `lib/auth.ts`
- **Password hashing:** bcryptjs (`bcrypt.compare` on login)
- **Flow:** User registers via Server Action (`app/actions/user/register.ts`), logs in via credentials provider
- **Email verification:** Token-based (`EmailVerificationToken` model), verified at `/verify-email`

## Session Management
- **Strategy:** JWT (stateless), configured in `lib/auth.config.ts`
- **Max age:** 30 days
- **Custom claims:** JWT token includes `id` and `role` via callbacks
- **Edge compatibility:** `auth.config.ts` has no Prisma imports, safe for Edge Middleware

## Email — Brevo (Sendinblue)
- **API endpoint:** `https://api.brevo.com/v3/smtp/email`
- **Env vars:** `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`
- **Implementation:** `lib/email.ts` — raw `fetch()` call (no SDK)
- **Templates (HTML inline):**
  - `sendPasswordResetEmail()` — password reset link (1h expiry)
  - `sendVerificationEmail()` — email confirmation link (24h expiry)
  - `sendCommentNotificationEmail()` — comment notification
  - `sendGroupStatusEmail()` — group creation approved/rejected
  - `sendJoinRequestStatusEmail()` — group join request approved/rejected
- **Graceful degradation:** Logs to console when `BREVO_API_KEY` is not set

## Object Storage — Cloudflare R2
- **Client:** `lib/r2.ts` — S3-compatible client using `@aws-sdk/client-s3`
- **Endpoint:** `https://{CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- **Env vars:** `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`
- **Upload strategy:** Presigned URLs via `@aws-sdk/s3-presigned-post` — clients upload directly to R2 without proxying through Vercel functions
- **Upload route:** `app/api/upload/`

## Caching & Rate Limiting — Upstash Redis
- **Client:** `Redis.fromEnv()` via `@upstash/redis`
- **Env vars:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **Rate limiters** (sliding window, defined in `lib/rate-limit.ts`):
  | Action    | Limit       |
  |-----------|-------------|
  | `pray`    | 20 / 1 min  |
  | `comment` | 10 / 1 min  |
  | `prayer`  | 5 / 1 hour  |
  | `join`    | 10 / 1 min  |
- **Dev mode:** Gracefully skips rate limiting when Redis env vars are absent
- **Prod mode:** Blocks actions with error message when Redis is not configured

## Hosting — Vercel
- **Deploy trigger:** Push to `master` branch
- **Functions:** Serverless Functions (Server Actions, API Routes)
- **Edge:** Middleware runs on Edge Runtime
- **Env vars to configure:** `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus Brevo, R2, and Upstash vars
