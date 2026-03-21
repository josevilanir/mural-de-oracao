# INTEGRATIONS.md — External Services & APIs

## Database — Neon PostgreSQL

- **Service:** Neon (serverless PostgreSQL)
- **Driver:** `@neondatabase/serverless` + `@prisma/adapter-neon`
- **Connection:** WebSocket-based serverless adapter for edge compatibility
- **Env vars:**
  - `DATABASE_URL` — Full connection string (`postgresql://...neon.tech/neondb?sslmode=require`)
- **Usage:** All persistent data (users, prayers, groups, comments, notifications)
- **ORM:** Prisma 7.5 with generated client (`postinstall` hook runs `prisma generate`)

## Authentication — NextAuth v5 (Auth.js)

- **Service:** Auth.js v5 beta with Google OAuth + Credentials provider
- **Adapter:** `@auth/prisma-adapter` — stores sessions/accounts in Neon DB
- **Providers:**
  - **Google OAuth** — social login via Google Console
  - **Credentials** — email/password with bcryptjs hashing
- **Env vars:**
  - `AUTH_SECRET` — session signing secret
  - `NEXTAUTH_URL` — canonical app URL
  - `GOOGLE_CLIENT_ID` — Google OAuth client ID
  - `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- **DB models used:** `Account`, `Session`, `VerificationToken`

## Email — Brevo (formerly Sendinblue)

- **Service:** Brevo transactional email API
- **Purpose:** Email verification, password reset tokens
- **Integration:** REST API via fetch (no SDK — direct HTTP calls)
- **Env vars:**
  - `BREVO_API_KEY` — API key (`xkeysib-...`)
  - `BREVO_FROM_EMAIL` — Sender email address
  - `BREVO_FROM_NAME` — Sender display name

## Rate Limiting — Upstash Redis

- **Service:** Upstash Redis (serverless Redis)
- **Client:** `@upstash/redis` + `@upstash/ratelimit`
- **Purpose:** API route rate limiting (auth endpoints, prayer actions)
- **Protocol:** REST API (HTTP-based, edge-compatible)
- **Env vars:**
  - `UPSTASH_REDIS_REST_URL` — Redis REST endpoint
  - `UPSTASH_REDIS_REST_TOKEN` — Auth token

## Object Storage — Cloudflare R2

- **Service:** Cloudflare R2 (S3-compatible)
- **Client:** AWS SDK v3 (`@aws-sdk/client-s3`, presigned URLs)
- **Purpose:** User/group image uploads
- **Access pattern:** Presigned POST for upload, presigned GET or public URL for read
- **Env vars:**
  - `CLOUDFLARE_R2_ACCOUNT_ID` — Cloudflare account ID
  - `CLOUDFLARE_R2_ACCESS_KEY_ID` — R2 access key
  - `CLOUDFLARE_R2_SECRET_ACCESS_KEY` — R2 secret key
  - `CLOUDFLARE_R2_BUCKET_NAME` — Bucket name
  - `CLOUDFLARE_R2_PUBLIC_URL` — Public CDN base URL (`https://pub-...`)

## Summary Table

| Service         | Purpose               | Package                          | Auth Method    |
|-----------------|-----------------------|----------------------------------|----------------|
| Neon PostgreSQL | Primary database      | `@neondatabase/serverless`       | Connection URL |
| Google OAuth    | Social auth           | `next-auth`                      | Client ID/Secret |
| Brevo           | Transactional email   | Fetch (HTTP)                     | API Key        |
| Upstash Redis   | Rate limiting         | `@upstash/redis`                 | REST token     |
| Cloudflare R2   | Image storage         | `@aws-sdk/client-s3`             | Access key pair |
