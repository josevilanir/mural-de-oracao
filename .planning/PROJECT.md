# Mural de Oração

## What This Is

Mural de Oração is a prayer-sharing web app built on Next.js App Router with server actions, Neon Postgres (via Prisma), Cloudflare R2 for image storage, and Resend for email. The project has shipped two hardening milestones addressing security vulnerabilities and codebase tech debt.

## Core Value

User-submitted content and uploaded files must not be weaponizable against the platform or other users.

## Requirements

### Validated

- ✓ Presigned upload URL enforces 5MB maximum file size — v1.0
- ✓ User-supplied strings in email templates are HTML-escaped before interpolation — v1.0
- ✓ CSRF protection hardened (Origin/Host header validation in middleware) — v1.0
- ✓ Orphaned TypeScript types (`Role`, `NotificationType`) removed — v1.0
- ✓ All explicit `any` annotations removed from server actions and pages — v1.1
- ✓ Group deletion wrapped in single `prisma.$transaction` — v1.1
- ✓ Composite DB indexes added on `Prayer` and `PrayerAction` — v1.1
- ✓ `AutoRefresh` polling removed from pages with server-action revalidation — v1.1
- ✓ Write-path sanitization via `lib/sanitize.ts` applied to prayers and comments — v1.1
- ✓ Authentication via Google OAuth and email/password — existing
- ✓ Prayer creation, editing, deletion — existing
- ✓ Group creation and membership — existing
- ✓ Image upload via R2 presigned URLs — existing
- ✓ Rate limiting on mutation server actions — existing
- ✓ Anonymous prayer anonymity enforced server-side — existing
- ✓ Role-based access control via middleware — existing

### Active

(None — run `/gsd-new-milestone` to define v1.2 or v2.0)

### Out of Scope

- Missing features (notification system, report UI, email verification enforcement) — next milestone
- Scaling (R2 lifecycle policies, multi-region DB) — future milestone
- Dependencies at risk (Neon driver, Resend SDK) — accepted, low probability

## Context

- **Current State:** Shipped v1.0 Security Remediation + v1.1 Tech Debt & Performance. Codebase is now type-safe, has DB indexes, and enforces write-path sanitization.
- **Stack:** Next.js 15 App Router, Prisma + Neon Postgres, NextAuth v5, Cloudflare R2, Upstash Redis, Resend

## Constraints

- **Tech stack:** Must stay within existing stack — no new infrastructure dependencies unless unavoidable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------| 
| Fix security issues before other concerns | Security vulnerabilities have no safe workaround period | ✓ Good |
| CSRF approach: Origin/Host validation in middleware | Next.js server actions have nuanced CSRF exposure | ✓ Good |
| Group delete: use `prisma.$transaction` vs DDL cascade | Prisma abstraction layer makes app-level tx simpler than schema DDL changes | ✓ Good |
| Write-path sanitization: `lib/sanitize.ts` escapeHtml | Centralizes protection without adding external deps | ✓ Good |

---
*Last updated: 2026-03-20 after v1.1 milestone*
