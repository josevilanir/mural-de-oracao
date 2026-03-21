# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Security Remediation

**Shipped:** 2026-03-20
**Phases:** 4 | **Plans:** 5 | **Sessions:** ~2

### What Was Built
- Enforced 5MB file-size ceiling via createPresignedPost content-length-range and server-side contentLength validation
- Installed html-escaper, added escape coverage for all user-controlled interpolations in email templates
- Implemented Origin/Host validation in middleware to prevent CSRF on mutation routes
- Cleaned up obsolete TypeScript types (`Role`, `NotificationType`) from `types/prisma.ts`

### What Worked
- Handling security first established a secure baseline before expanding features.
- Using middleware for CSRF protection provided wide coverage without needing to patch individual server actions iteratively.
- Relying on R2 pre-signed post policies for size limits enforces constraints at the infrastructure level.

### What Was Inefficient
- `CONCERNS.md` manual grooming step required direct intervention; automated tasks could do this more structurally.

### Patterns Established
- Security-first remediation before technical debt cleanup.
- Validation checks integrated directly into `npx tsc` and `ts-prune` scripts.

### Key Lessons
1. Next.js server actions bypass standard CSRF protections out of the box; explicit Origin/Host checking is mandatory.
2. File uploads must be constrained in both the presigned policy *and* the endpoint generating the policy for defense-in-depth.

### Cost Observations
- Model mix: 100% Claude 3.7 Sonnet (via Claude Code) and Antigravity.
- Notable: Very high efficiency executing precise plans via Claude Code CLI.

---

## Milestone: v1.3 — Quality & Observability

**Shipped:** 2026-03-21
**Phases:** 3 | **Plans:** 6 | **Files changed:** 97 | **LOC:** +12,750 / -2,887

### What Was Built
- Sentry error tracking via `captureRequestError` in Next.js `onRequestError` instrumentation hook
- `buildEmailFields<T>` generic helper centralizing `sanitizeUserInput()` across all email templates
- `AuditLog` Prisma model + migration with 9 audit writes across admin moderation and group management
- `tests/__mocks__/factories.ts` — 7 typed Prisma mock factories using Partial-spread, zero `as any`
- 102 Vitest tests: server actions (prayers/groups), API routes (upload/notifications/groups), auth flows (register/login/forgot-password/reset-password/verify-email)
- Eliminated all `as any` casts from pre-existing test files

### What Worked
- Wave-based parallel plan execution (3 sequential waves) kept each plan focused on a single concern
- Typed factory pattern (`Partial<T>` spread) solved the `as any` problem cleanly — no workarounds needed
- `vi.mock` hoisting pattern (declare above imports) is the only reliable way to mock modules in Vitest — discovered early and standardized across all test files
- Sentry's `captureRequestError` (not `sentryOnRequestError`) was the correct hook — the right API name came from reading the actual SDK, not the docs

### What Was Inefficient
- v1.3-ROADMAP.md archive created by gsd-tools had stale plan checkboxes (03-02, 03-03 unchecked) — required manual fix in ROADMAP.md
- MILESTONES.md auto-generated with "(none recorded)" for accomplishments — required manual population

### Patterns Established
- `vi.mock` must be declared before imports in Vitest (hoisting requirement)
- Typed factories with `Partial<T>` spread pattern is the standard mock approach — never `as any`
- `beforeEach(vi.clearAllMocks)` prevents cross-test contamination
- Audit writes inside `$transaction` arrays for atomicity in delete operations

### Key Lessons
1. Always read the actual SDK source or installed package types — docs for beta SDKs lag behind reality (Sentry `captureRequestError` vs `sentryOnRequestError`).
2. Vitest module mocking requires `vi.mock()` declarations to be hoisted above all imports; declare them at the top of the file.
3. Typed mock factories pay off immediately — `as any` creates silent drift between mock shape and real Prisma types.
4. Email subject HTML-escaping was a pre-existing bug caught during test cleanup (Plan 03-03) — test suites surface bugs that manual review misses.

### Cost Observations
- Model mix: 100% Claude Sonnet 4.6 (orchestrator + all executors)
- Sessions: 2 (plan phase, execute phase + complete milestone)
- Notable: 6 plans executed via gsd-executor subagents; each completed in 2-12 minutes

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 2 | 4 | Initial security remediation baseline established |
| v1.1 | 1 | 1 | Tech debt & performance cleanup |
| v1.2 | 1 | 1 | NextAuth v5 beta stability |
| v1.3 | 2 | 3 | Observability, audit trail, full test suite |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | N/A | 1 (html-escaper) |
| v1.1 | 0 | N/A | 0 |
| v1.2 | 0 | N/A | 0 |
| v1.3 | 102 | server actions + API routes + auth | 2 (@sentry/nextjs, vitest infra) |

### Top Lessons (Verified Across Milestones)

1. Securing infrastructure limits (R2) is as critical as application-level limits.
2. Middleware is the most reliable bottleneck for CSRF protection in Next.js App Router.
3. Always read actual installed SDK types, not docs — beta SDK APIs change faster than documentation.
4. Typed mock factories (Partial-spread) are strictly better than `as any` — zero extra cost after initial setup.
