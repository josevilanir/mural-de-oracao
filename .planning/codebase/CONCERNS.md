# CONCERNS.md — Technical Debt & Issues

## Recently Resolved (Phase 1)

The following issues were identified and fixed in Phase 1 (commit `607dd8b`):

- [FIXED] Unused dependencies removed (`resend`, `html-escaper`)
- [FIXED] Build-time checks enabled (no longer ignoring ESLint/TS errors during `next build`)
- [FIXED] Mock data moved out of `lib/` into `tests/__mocks__/`
- [FIXED] Email HTML escaping implemented in `lib/email.ts` via `sanitizeUserInput()`
- [FIXED] CI pipeline established (`.github/workflows/ci.yml`)

---

## Active Concerns

### 1. NextAuth v5 Beta Stability

**Severity:** Medium
**File:** `package.json`

`next-auth` is pinned at `5.0.0-beta.30` — a pre-release version. The Auth.js v5 API (callbacks, session shape, adapter interface) may have breaking changes in future betas or the stable release.

**Risk:** Auth flows break on dependency update; upstream API changes require migration.
**Mitigation:** Version is strictly pinned (no `^`/`~`). Monitor Auth.js changelog before any updates.

---

### 2. Test Coverage Gaps

**Severity:** Medium
**Affected areas:** `app/actions/`, `app/api/`, all React components

Only 2 test files exist covering email XSS escaping and prayer access control. Entirely untested:
- Server actions (create, delete, comment, resolve prayer, group management)
- API routes (`/api/upload`, `/api/notifications`, `/api/groups`)
- Auth flows (registration, login, password reset, email verification)
- React components
- Utility functions in `lib/utils.ts`

**Risk:** Regressions go undetected. Security-sensitive flows (auth, moderation) have no automated verification.

---

### 3. No Error Tracking / Observability

**Severity:** Medium
**Files:** All server actions, API routes

Errors are logged via `console.error("[context]", err)` only. No external error tracking (Sentry, etc.) is configured. Production errors are invisible unless logs are actively monitored.

**Risk:** Silent failures in production go unnoticed.

---

### 4. No Audit Logging

**Severity:** Low-Medium
**Affected:** Admin moderation actions, group management

Admin actions (hiding prayers, approving groups) have no audit trail in the database. If a moderation decision is disputed, there's no record of who did what and when.

**Risk:** Accountability gap in moderation workflow.

---

### 5. Email Template Maintenance Fragility

**Severity:** Low
**File:** `lib/email.ts`

Email templates are built as raw HTML strings in TypeScript. No templating engine, no component system. As emails grow more complex, maintaining consistent styling and escaping across all templates becomes error-prone.

**Risk:** New email types may accidentally skip sanitization; templates drift in style.

---

### 6. Feed `scope: 'mural'` Doesn't Filter by `visibility: PUBLIC`

**Severity:** Low (by design — but worth documenting)
**File:** `app/actions/prayers/feed.ts`

The `mural` scope shows all non-hidden prayers regardless of visibility. GROUP_ONLY prayers are visible on the mural if not hidden. This appears intentional but is subtle — the `home` scope has an explicit OR clause to exclude GROUP_ONLY group prayers; `mural` has no such filter.

**Recommendation:** Confirm this is intentional and add a comment clarifying the design decision.

---

### 7. Database Connection — Edge Compatibility Only

**Severity:** Low
**File:** `lib/prisma.ts`

The app uses `@prisma/adapter-neon` + `@neondatabase/serverless` (WebSocket-based). This is optimized for Vercel Edge/serverless but adds a layer of complexity vs. standard Prisma TCP connections. If the deployment target changes (e.g., traditional Node.js server), the DB setup would need adjustment.

---

### 8. `as any` Casts in Tests

**Severity:** Low
**Files:** `tests/prayer-access-control.test.ts`

Test mocks use `as any` to satisfy Prisma's complex return types (e.g., `{ status: 'ACTIVE' } as any`). Not a production concern, but indicates missing typed mock factories.

---

## Security Posture Summary

| Area | Status |
|------|--------|
| XSS — stored input | Mitigated via `sanitizeUserInput()` in all write actions |
| CSRF | Mitigated via Origin header check in `middleware.ts` |
| Auth route protection | Handled in `middleware.ts` + server action auth checks |
| Rate limiting | Implemented via Upstash Redis; blocks in production if Redis missing |
| SQL injection | Not applicable — Prisma parameterized queries |
| Password storage | bcryptjs hashing |
| Email injection | Sanitized in email templates |
| Audit logging | Missing |
| Error tracking | Missing |
