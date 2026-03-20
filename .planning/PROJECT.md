# Mural de Oração — Security Remediation

## What This Is

Mural de Oração is a prayer-sharing web app built on Next.js App Router with server actions, Neon Postgres (via Prisma), Cloudflare R2 for image storage, and Resend for email. This project focuses on closing three confirmed security vulnerabilities identified in the codebase audit, plus one minor tech debt cleanup.

## Core Value

User-submitted content and uploaded files must not be weaponizable against the platform or other users.

## Requirements

### Validated

- ✓ Presigned upload URL enforces 5MB maximum file size (ContentLengthRange policy + server-side Content-Length validation) — v1.0
- ✓ User-supplied strings in email templates are HTML-escaped before interpolation — v1.0
- ✓ CSRF protection hardened beyond SameSite=Lax (Origin/Host header validation in middleware) — v1.0
- ✓ Orphaned TypeScript types (`Role`, `NotificationType`) removed to reduce tech debt — v1.0
- ✓ Authentication via Google OAuth and email/password — existing
- ✓ Prayer creation, editing, deletion — existing
- ✓ Group creation and membership — existing
- ✓ Image upload via R2 presigned URLs — existing
- ✓ Transactional email via Resend (invites, password reset) — existing
- ✓ Rate limiting on mutation server actions (prayer creation, comments, pray, join) — existing
- ✓ Anonymous prayer anonymity enforced server-side — existing
- ✓ Role-based access control via middleware — existing

### Active

(None yet — run `/gsd-new-milestone` to start v1.1 or v2.0)

### Out of Scope

- Tech debt cleanup (`any` annotations) — separate milestone
- Performance improvements (unbounded queries, missing indexes) — separate milestone
- Missing features (notification system, report UI, email verification enforcement) — separate milestone
- Fragile area hardening (sanitizePrayer opt-in, privacy test coverage) — separate milestone

## Context

- **Current State:** Shipped v1.0 Security Remediation removing vulnerabilities.
- **Stack:** Next.js 15 App Router, Prisma + Neon Postgres, NextAuth v5, Cloudflare R2, Upstash Redis, Resend

## Constraints

- **Tech stack:** Must stay within existing stack — no new infrastructure dependencies unless unavoidable
- **CONCERNS.md:** Security issues entries and fixed tech debt have been cleaned from `.planning/codebase/CONCERNS.md`.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix security issues before other concerns | Security vulnerabilities have no safe workaround period | ✓ Good |
| CSRF approach: Origin/Host validation in middleware | Next.js server actions have nuanced CSRF exposure; middleware approach offers global protection without breaking existing auth | ✓ Good |

---
*Last updated: 2026-03-20 after v1.0 milestone*
