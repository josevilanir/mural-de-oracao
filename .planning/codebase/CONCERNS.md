# Concerns

## [FIXED] 1. NextAuth v5 Beta Stability
- **Risk:** `next-auth@5.0.0-beta.30` is a pre-release. API surface may change, and undocumented edge cases exist, especially around Edge Runtime compatibility.
- **Evidence:** The codebase already splits auth config into `auth.ts` (Node) and `auth.config.ts` (Edge-safe) to work around Edge limitations.
- **Recommendation:** Pin version strictly. Monitor Auth.js changelog for breaking changes. Plan migration to stable v5 when released.

## [FIXED] 2. Build-Time Type & Lint Checking Disabled
- **Risk:** `next.config.mjs` sets `ignoreBuildErrors: true` (TypeScript) and `ignoreDuringBuilds: true` (ESLint). This means type errors and lint violations in production code go undetected during deployment.
- **Impact:** Potential runtime errors from unnoticed type mismatches making it to production.
- **Recommendation:** Enable build checks or add a CI step that runs `tsc --noEmit` and `eslint` before deployment.

## [FIXED] 3. Resend vs Brevo Mismatch
- **Issue:** `resend ^6.9.4` is listed in `package.json` dependencies, but the actual email implementation in `lib/email.ts` uses Brevo (Sendinblue) API via raw `fetch()`. The `.env.example` references `RESEND_API_KEY` as a future integration.
- **Impact:** Dead dependency adding unnecessary bundle weight. Confusion for future developers.
- **Recommendation:** Remove `resend` from `package.json` if it's not used, or migrate email to Resend if planned.

## [FIXED] 4. Limited Test Coverage
- **Issue:** Only 2 test files exist (`tests/prayer-access-control.test.ts`, `lib/email.test.ts`). Major functionality is untested:
  - Server Actions (create, delete, moderation)
  - Middleware (CSRF, route protection)
  - Rate limiting logic
  - Registration and authentication flows
- **Impact:** Regressions can go unnoticed. Refactoring is risky.
- **Recommendation:** Prioritize testing Server Actions and middleware logic.

## [FIXED] 5. No Explicit CI/CD Pipeline
- **Issue:** No GitHub Actions, CircleCI, or equivalent CI config found. The project relies solely on Vercel build.
- **Impact:** With type/lint checks disabled in build, there's effectively no automated quality gate.
- **Recommendation:** Add a CI pipeline that runs: `tsc --noEmit`, `eslint .`, and `vitest run` before merging.

## [FIXED] 6. Cloudflare R2 Env Vars Not in .env.example
- **Issue:** `lib/r2.ts` requires `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`, but `.env.example` does not list these variables.
- **Impact:** New developers won't know R2 configuration is needed, leading to runtime crashes.
- **Recommendation:** Update `.env.example` to include all R2 and Brevo environment variables.

## [FIXED] 7. Brevo Email Env Vars Not in .env.example
- **Issue:** `lib/email.ts` uses `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME` but `.env.example` only references the commented-out `RESEND_API_KEY`.
- **Impact:** Same as above — new developers miss required configuration.
- **Recommendation:** Replace `RESEND_API_KEY` reference in `.env.example` with actual Brevo env vars.

## [FIXED] 8. Upstash Env Vars Not in .env.example
- **Issue:** `lib/rate-limit.ts` uses `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, not documented in `.env.example`.
- **Impact:** Rate limiting silently disabled in dev; could fail in production if not configured.
- **Recommendation:** Add Upstash vars to `.env.example` with comments.

## [FIXED] 9. `any` Type in Middleware
- **Issue:** `middleware.ts` line 11 uses `(req: any)` despite the ESLint rule `@typescript-eslint/no-explicit-any: error` being configured. This suggests ESLint may not be running consistently.
- **Impact:** Loss of type safety in the most critical security layer (route protection + CSRF).
- **Recommendation:** Type `req` as `NextAuthRequest` or the appropriate Auth.js type.

## [FIXED] 10. Duplicate Sanitization Logic
- **Issue:** Two separate sanitization mechanisms exist:
  - `lib/sanitize.ts` — manual HTML entity escaping for database input
  - `html-escaper` package — used in `lib/email.ts` for email template user data
- **Impact:** Inconsistency risk — developers may use one and forget the other.
- **Recommendation:** Consolidate to a single sanitization approach or clearly document when each is used.

## [FIXED] 11. Mock Data in Production Bundle
- **Issue:** `lib/mock-prayer-requests.ts` exists in `lib/` alongside production code.
- **Impact:** Could be accidentally imported in production, or cause confusion.
- **Recommendation:** Move to `tests/` or a `__mocks__/` directory.
