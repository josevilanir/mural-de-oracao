---
phase: 01-fix-concerns-from-concerns-md
plan: "01"
subsystem: observability
tags: [sentry, error-tracking, instrumentation, next.js]
dependency_graph:
  requires: []
  provides: [sentry-error-tracking]
  affects: [next.config.mjs, instrumentation.ts]
tech_stack:
  added: ["@sentry/nextjs@10.45.0"]
  patterns: [Next.js instrumentation hook, withSentryConfig wrapper]
key_files:
  created:
    - sentry.server.config.ts
    - sentry.client.config.ts
    - sentry.edge.config.ts
    - instrumentation.ts
  modified:
    - next.config.mjs
    - .env.example
    - package.json
decisions:
  - "Used captureRequestError (not sentryOnRequestError) as onRequestError hook — sentryOnRequestError does not exist in @sentry/nextjs v10.45.0"
  - "Avoided top-level await in instrumentation.ts — used named re-export instead for TypeScript compatibility"
  - "Source map upload disabled when SENTRY_AUTH_TOKEN unset — graceful in dev/CI without secrets"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_changed: 7
---

# Phase 01 Plan 01: Sentry Error Tracking Setup Summary

Sentry SDK installed and wired into Next.js with automatic error capture for server actions and API routes via the `onRequestError` instrumentation hook using `captureRequestError`.

## What Was Built

- Four Sentry config files: `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`
- `next.config.mjs` wrapped with `withSentryConfig` — source maps upload only when `SENTRY_AUTH_TOKEN` is present
- `.env.example` documents all five Sentry env vars (`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`)
- Sentry is gracefully disabled when `SENTRY_DSN` is unset (all `Sentry.init` calls check `enabled: !!process.env.SENTRY_DSN`)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install Sentry SDK and create configuration files | 700ae9e | package.json, sentry.*.config.ts, instrumentation.ts, .env.example |
| 2 | Wrap Next.js config with Sentry and verify build | 5bdb136 | next.config.mjs, instrumentation.ts |

## Decisions Made

1. **captureRequestError as onRequestError**: The plan specified `sentryOnRequestError` but that symbol does not exist in `@sentry/nextjs` v10.45.0. The correct export is `captureRequestError`, which is explicitly documented as "Reports errors passed to the Next.js `onRequestError` instrumentation hook."

2. **No top-level await**: The plan used `(await import("@sentry/nextjs")).sentryOnRequestError` as a top-level expression. This fails TypeScript compilation unless `target` is `es2017+`. Replaced with a named re-export (`export { captureRequestError as onRequestError }`) which is simpler and correct.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed top-level await type error in instrumentation.ts**
- **Found during:** Task 2 (build verification)
- **Issue:** `export const onRequestError = (await import("@sentry/nextjs")).sentryOnRequestError` fails with TypeScript error: "Top-level 'await' expressions are only allowed when the 'module' option is set to..." — the project's tsconfig target does not support it.
- **Fix:** Replaced with `export { captureRequestError as onRequestError } from "@sentry/nextjs"`
- **Files modified:** instrumentation.ts
- **Commit:** 5bdb136

**2. [Rule 1 - Bug] Fixed non-existent sentryOnRequestError export**
- **Found during:** Task 2 (build verification)
- **Issue:** `sentryOnRequestError` is not exported from `@sentry/nextjs` v10.45.0. TypeScript type error: "Property 'sentryOnRequestError' does not exist on type..."
- **Fix:** Used `captureRequestError` which is the documented function for the `onRequestError` instrumentation hook
- **Files modified:** instrumentation.ts
- **Commit:** 5bdb136

## User Setup Required

Before Sentry captures errors in production, the user must:

1. Create a Next.js project in Sentry Dashboard (Settings -> Projects -> Create Project -> Next.js)
2. Set the following env vars in production:
   - `SENTRY_DSN` — from Sentry Dashboard -> Project Settings -> Client Keys
   - `NEXT_PUBLIC_SENTRY_DSN` — same DSN value (exposed to client)
   - `SENTRY_AUTH_TOKEN` — for source map uploads (optional but recommended)
   - `SENTRY_ORG` — organization slug
   - `SENTRY_PROJECT` — project slug

## Self-Check

Verified before finalizing:
- sentry.server.config.ts: FOUND
- sentry.client.config.ts: FOUND
- sentry.edge.config.ts: FOUND
- instrumentation.ts: FOUND
- next.config.mjs contains withSentryConfig: FOUND
- .env.example contains SENTRY_DSN: FOUND
- Build exits with code 0: PASSED
