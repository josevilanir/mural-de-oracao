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

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 2 | 4 | Initial security remediation baseline established |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | N/A | 1 (html-escaper) |

### Top Lessons (Verified Across Milestones)

1. Securing infrastructure limits (R2) is as critical as application-level limits.
2. Middleware is the most reliable bottleneck for CSRF protection in Next.js App Router.
