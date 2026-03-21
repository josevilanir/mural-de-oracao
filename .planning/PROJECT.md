# Mural de Oração

## What This Is

Mural de Oração is a prayer-sharing web app built on Next.js App Router with server actions, Neon Postgres (via Prisma), Cloudflare R2 for image storage, and Resend for email. The project has shipped four hardening milestones covering security, tech debt, NextAuth stability, and quality & observability (Sentry, audit logging, full Vitest test suite).

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
- ✓ External error tracking — Sentry captures unhandled errors in server actions and API routes via `onRequestError` hook — v1.3
- ✓ Email templates consolidated to shared `buildEmailFields()` builder enforcing `sanitizeUserInput()` — v1.3
- ✓ Feed `mural` scope behavior clarified with inline comment — v1.3
- ✓ Admin moderation and group management actions have a durable database audit trail (AuditLog) — v1.3
- ✓ Test coverage: server actions (prayers, groups), API routes, and auth flows — 102 tests passing — v1.3
- ✓ Typed mock factories — zero `as any` casts across entire test suite — v1.3

### Active

- [ ] React component test coverage (TEST-06)
- [ ] End-to-end tests for critical user flows (TEST-07)
- [ ] Notification system (feature work)
- [ ] Report UI (feature work)
- [ ] Email verification enforcement (feature work)

### Out of Scope

- Scaling (R2 lifecycle policies, multi-region DB) — future milestone
- Dependencies at risk (Neon driver, Resend SDK) — accepted, low probability

## Context

- **Current State:** v1.3 Quality & Observability shipped 2026-03-21. Codebase has Sentry error tracking, AuditLog table, and 102 Vitest tests with typed factories. Next milestone: feature work (notifications, report UI) or expanding test coverage to React components.
- **Stack:** Next.js 15 App Router, Prisma + Neon Postgres, NextAuth v5, Cloudflare R2, Upstash Redis, Resend, Sentry

## Constraints

- **Tech stack:** Must stay within existing stack — no new infrastructure dependencies unless unavoidable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix security issues before other concerns | Security vulnerabilities have no safe workaround period | ✓ Good |
| CSRF approach: Origin/Host validation in middleware | Next.js server actions have nuanced CSRF exposure | ✓ Good |
| Group delete: use `prisma.$transaction` vs DDL cascade | Prisma abstraction layer makes app-level tx simpler than schema DDL changes | ✓ Good |
| Write-path sanitization: `lib/sanitize.ts` escapeHtml | Centralizes protection without adding external deps | ✓ Good |
| Sentry: `captureRequestError` not `sentryOnRequestError` | `sentryOnRequestError` doesn't exist in @sentry/nextjs v10.45.0 | ✓ Good |
| AuditLog: string literal enum values in action files | Consistent with existing codebase pattern; avoids import coupling | ✓ Good |
| Test mocking: Partial-spread typed factories, no `as any` | Type safety in tests prevents silent mock drift | ✓ Good |
| `vi.mock` declarations hoisted above imports | Required for Vitest module mock hoisting to work correctly | ✓ Good |

---
*Last updated: 2026-03-21 after v1.3 milestone complete*
