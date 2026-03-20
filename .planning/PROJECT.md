# Mural de Oração — Security Remediation

## What This Is

Mural de Oração is a prayer-sharing web app built on Next.js App Router with server actions, Neon Postgres (via Prisma), Cloudflare R2 for image storage, and Resend for email. This project focuses on closing three confirmed security vulnerabilities identified in the codebase audit.

## Core Value

User-submitted content and uploaded files must not be weaponizable against the platform or other users.

## Requirements

### Validated

- ✓ Presigned upload URL enforces 5MB maximum file size (ContentLengthRange policy + server-side Content-Length validation) — Phase 1
- ✓ Authentication via Google OAuth and email/password — existing
- ✓ Prayer creation, editing, deletion — existing
- ✓ Group creation and membership — existing
- ✓ Image upload via R2 presigned URLs — existing
- ✓ Transactional email via Resend (invites, password reset) — existing
- ✓ Rate limiting on mutation server actions (prayer creation, comments, pray, join) — existing
- ✓ Anonymous prayer anonymity enforced server-side — existing
- ✓ Role-based access control via middleware — existing

### Active

- [ ] User-supplied strings in email templates are HTML-escaped before interpolation
- [ ] CSRF protection hardened beyond SameSite=Lax (Origin/Host header validation in middleware or equivalent)

### Out of Scope

- Tech debt cleanup (orphaned types, `any` annotations) — separate milestone
- Performance improvements (unbounded queries, missing indexes) — separate milestone
- Missing features (notification system, report UI, email verification enforcement) — separate milestone
- Fragile area hardening (sanitizePrayer opt-in, privacy test coverage) — separate milestone

## Context

- **Stack:** Next.js 15 App Router, Prisma + Neon Postgres, NextAuth v5, Cloudflare R2, Upstash Redis, Resend
- **Upload flow:** Client requests presigned URL from `app/api/upload/route.ts` → uploads directly to R2 → stores `publicUrl` in form state
- **Email flow:** Resend client in `lib/email.ts`; templates are in `src/lib/email/templates/` using manual string concatenation
- **Auth cookies:** Managed by NextAuth; current SameSite policy is Lax (framework default)
- **Middleware:** `middleware.ts` runs on every request matching the app path pattern; already handles auth and role gating

## Constraints

- **Tech stack:** Must stay within existing stack — no new infrastructure dependencies unless unavoidable
- **Scope:** Only the three security issues listed in Active; do not expand to other CONCERNS.md items
- **CONCERNS.md:** Remove each security issue entry from `.planning/codebase/CONCERNS.md` after it is fixed and verified

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix security issues before other concerns | Security vulnerabilities have no safe workaround period | — Pending |
| CSRF approach: research-first | Next.js server actions have nuanced CSRF exposure; let planner determine best fit for current auth setup | — Pending |

---
*Last updated: 2026-03-20 after Phase 1 (Upload Size Enforcement)*
