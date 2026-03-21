# Mural de Oração

## What This Is

Mural de Oração is a prayer-sharing web app built on Next.js App Router with server actions, Neon Postgres (via Prisma), Cloudflare R2 for image storage, and Resend for email. The project has shipped three hardening milestones addressing security vulnerabilities, codebase tech debt, and NextAuth stability.

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

- [ ] Test coverage for React components (remaining)

### Validated (Phase 3 — Test Coverage)

- ✓ Test coverage for server actions (prayers, groups), API routes, and auth flows — Validated in Phase 03: Test Coverage
- ✓ `as any` casts in tests replaced with typed mock factories — Validated in Phase 03: Test Coverage
- ✓ Admin moderation and group management actions have an audit trail — Validated in Phase 02: Audit Logging

### Validated (Phase 1 — Quick Fixes & Observability)

- ✓ External error tracking integrated — Sentry captures unhandled errors in server actions and API routes automatically via `onRequestError` hook — v1.3
- ✓ Email templates consolidated to shared `buildEmailFields()` builder enforcing `sanitizeUserInput()` on all user-supplied fields including subjects — v1.3
- ✓ Feed `mural` scope behavior clarified with inline comment referencing `canAccessPrayer()` — v1.3

### Out of Scope

- Missing features (notification system, report UI, email verification enforcement) — next milestone
- Scaling (R2 lifecycle policies, multi-region DB) — future milestone
- Dependencies at risk (Neon driver, Resend SDK) — accepted, low probability

## Context

- **Current State:** Shipped v1.0 Security Remediation + v1.1 Tech Debt & Performance + v1.2 NextAuth v5 Beta Stability + v1.3 Phase 1 Complete (Sentry error tracking, email sanitization consolidation, feed.ts scope comment) + v1.3 Phase 2 Complete (AuditLog model, migration, 9 audit writes across moderation and group actions) + v1.3 Phase 3 Complete (102 Vitest tests across 8 files, zero `as any` casts, typed mock factories). Milestone complete.
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

## Current Milestone: v1.3 Quality & Observability

**Goal:** Close all active concerns from CONCERNS.md — test coverage, error tracking, audit logging, and quick fixes.

**Target features:**
- Test suite covering server actions, API routes, auth flows, and components
- External error tracking (Sentry or equivalent)
- Audit log table for admin/moderation actions
- Email template consolidation
- Feed `mural` scope comment + typed test mock factories

---
*Last updated: 2026-03-21 after Phase 03 (Test Coverage) complete — v1.3 milestone complete*
