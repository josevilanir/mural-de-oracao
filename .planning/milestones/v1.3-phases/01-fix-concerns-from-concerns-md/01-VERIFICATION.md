---
phase: 01-fix-concerns-from-concerns-md
verified: 2026-03-21T00:00:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 01: Fix Concerns Verification Report

**Phase Goal:** Unhandled production errors are visible in an external error tracker, and two small code-quality items are resolved
**Verified:** 2026-03-21
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                        | Status     | Evidence                                                                                                                |
|----|--------------------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------|
| 1  | An unhandled error thrown in a server action is captured by Sentry without any manual captureException call  | VERIFIED   | `instrumentation.ts` exports `captureRequestError as onRequestError` — Next.js calls this hook automatically on errors |
| 2  | An unhandled error thrown in an API route is captured by Sentry without any manual captureException call     | VERIFIED   | Same `onRequestError` hook covers both server actions and API routes in Next.js 14+                                     |
| 3  | Every email template passes user-supplied fields through sanitizeUserInput() via the shared builder          | VERIFIED   | `buildEmailFields` in `lib/email.ts` is the only call site for `sanitizeUserInput`; all 4 templates with user data use it |
| 4  | Email subjects containing user-supplied fields also sanitize those fields                                    | VERIFIED   | `sendCommentNotificationEmail`, `sendGroupStatusEmail`, `sendJoinRequestStatusEmail` all use `s.*` in subject lines    |
| 5  | feed.ts has an inline comment explaining why scope mural shows all non-hidden prayers regardless of visibility | VERIFIED   | Lines 34–39 of `feed.ts` contain the full comment referencing `canAccessPrayer()` in `lib/services/prayer-access.ts`  |
| 6  | The app builds without errors after Sentry integration                                                       | VERIFIED   | Commits 5bdb136 and 700ae9e confirm build passed; `next.config.mjs` wraps via `withSentryConfig` with graceful fallback |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact                   | Provides                                              | Status     | Details                                                                         |
|----------------------------|-------------------------------------------------------|------------|---------------------------------------------------------------------------------|
| `instrumentation.ts`       | Next.js instrumentation hook initializing Sentry      | VERIFIED   | Contains `register()` with conditional imports + `export { captureRequestError as onRequestError }` |
| `sentry.server.config.ts`  | Sentry server-side configuration                      | VERIFIED   | Contains `Sentry.init` with `enabled: !!process.env.SENTRY_DSN`                |
| `sentry.client.config.ts`  | Sentry client-side configuration                      | VERIFIED   | Contains `Sentry.init` with `enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN`    |
| `sentry.edge.config.ts`    | Sentry edge runtime configuration                     | VERIFIED   | Contains `Sentry.init` with `enabled: !!process.env.SENTRY_DSN`                |
| `next.config.mjs`          | Next.js config wrapped with withSentryConfig          | VERIFIED   | Imports `withSentryConfig`, wraps `nextConfig`, disables plugins when no auth token |
| `.env.example`             | Sentry env var documentation                          | VERIFIED   | Documents `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` |
| `lib/email.ts`             | Email templates with shared builder enforcing sanitization | VERIFIED   | Contains `buildEmailFields<T>` function; `sanitizeUserInput` called only inside it |
| `app/actions/prayers/feed.ts` | Feed action with scope documentation               | VERIFIED   | Lines 34–39 contain multi-line comment explaining `scope: 'mural'` design intent |

---

### Key Link Verification

| From                     | To                       | Via                                       | Status   | Details                                                                                          |
|--------------------------|--------------------------|-------------------------------------------|----------|--------------------------------------------------------------------------------------------------|
| `instrumentation.ts`     | `sentry.server.config.ts`| dynamic import in `register()`            | WIRED    | Line 3: `await import("./sentry.server.config")` inside `NEXT_RUNTIME === "nodejs"` guard        |
| `instrumentation.ts`     | `sentry.edge.config.ts`  | dynamic import in `register()`            | WIRED    | Line 6: `await import("./sentry.edge.config")` inside `NEXT_RUNTIME === "edge"` guard            |
| `next.config.mjs`        | `@sentry/nextjs`         | `withSentryConfig` wrapper                | WIRED    | Line 1 import + line 15 `export default withSentryConfig(nextConfig, {...})`                     |
| `instrumentation.ts`     | `@sentry/nextjs`         | `captureRequestError as onRequestError`   | WIRED    | Line 10: named re-export — Next.js invokes `onRequestError` automatically on unhandled errors    |
| `lib/email.ts`           | `lib/sanitize.ts`        | `buildEmailFields` calls `sanitizeUserInput` | WIRED | Line 1 import; line 63 usage inside the loop — no other call sites exist in the file            |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                               | Status    | Evidence                                                                                             |
|-------------|-------------|-------------------------------------------------------------------------------------------|-----------|------------------------------------------------------------------------------------------------------|
| OBSV-01     | 01-01       | Unhandled errors in server actions are captured in external error tracking                | SATISFIED | `onRequestError` hook (via `captureRequestError`) in `instrumentation.ts` covers server actions automatically |
| OBSV-02     | 01-01       | Unhandled errors in API routes are captured in external error tracking                    | SATISFIED | Same `onRequestError` hook covers API routes — this is the documented Next.js mechanism              |
| EMAIL-01    | 01-02       | Email templates use a shared builder function that enforces `sanitizeUserInput()` on all user-supplied fields | SATISFIED | `buildEmailFields` is the single sanitization point; all 4 templates with user data use it; subjects sanitized |
| CODE-01     | 01-02       | `scope: 'mural'` query behavior clarified with inline comment in `feed.ts`                | SATISFIED | 5-line comment at `feed.ts` lines 34–38 explains the design intent and references `canAccessPrayer()` |

No orphaned requirements: all four phase-1 requirements (OBSV-01, OBSV-02, EMAIL-01, CODE-01) are claimed by plans and satisfied by implementation. REQUIREMENTS.md traceability table marks all four as Complete.

---

### Anti-Patterns Found

No blockers or warnings found.

| File                      | Pattern Checked                        | Result  |
|---------------------------|----------------------------------------|---------|
| `instrumentation.ts`      | TODO/placeholder, empty return         | Clean   |
| `sentry.server.config.ts` | stub init, empty object                | Clean   |
| `sentry.client.config.ts` | stub init, empty object                | Clean   |
| `sentry.edge.config.ts`   | stub init, empty object                | Clean   |
| `next.config.mjs`         | stub wrapper, missing original config  | Clean   |
| `lib/email.ts`            | ad-hoc sanitizeUserInput in templates  | Clean — only one call site (inside `buildEmailFields`) |
| `app/actions/prayers/feed.ts` | comment missing or placeholder     | Clean   |

---

### Deviation from Plan: Correctly Handled

The plan specified `sentryOnRequestError` as the `onRequestError` export. The implementation correctly deviated to `captureRequestError` because `sentryOnRequestError` does not exist in `@sentry/nextjs` v10.45.0. The named re-export `export { captureRequestError as onRequestError }` is the documented correct approach for this SDK version. The functional outcome — automatic error capture without `captureException` calls — is fully achieved.

---

### Human Verification Required

One item cannot be verified programmatically:

**1. Sentry dashboard receives errors in production**

**Test:** Deploy with `SENTRY_DSN` set. Trigger a deliberate unhandled `throw new Error("test")` inside any server action. Check the Sentry dashboard for the event.

**Expected:** Error appears in Sentry within seconds with stack trace, environment tag, and no manual `captureException` call in the codebase.

**Why human:** Requires a live Sentry project, valid DSN, and production deployment. Cannot be verified from the codebase alone — wiring is correct but end-to-end capture depends on the external service and user-provided credentials.

---

## Commit Verification

All four documented commits verified present in git history:

| Commit    | Message                                                                |
|-----------|------------------------------------------------------------------------|
| `700ae9e` | feat(01-01): install Sentry SDK and create configuration files         |
| `5bdb136` | feat(01-01): wrap Next.js config with Sentry and fix instrumentation hook |
| `bd6ed38` | refactor(01-02): add buildEmailFields shared sanitization helper and refactor email templates |
| `64e9e4d` | docs(01-02): add inline comment explaining scope mural behavior in feed.ts |

---

_Verified: 2026-03-21_
_Verifier: Claude (gsd-verifier)_
