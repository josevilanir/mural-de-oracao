# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

**Orphaned TypeScript Types:**
- Issue: Type definitions exist that are no longer consumed by any feature, creating maintenance noise and false confidence in type coverage.
- Files: `src/types/` (general)
- Impact: Future developers may trust stale types, leading to runtime mismatches.
- Fix approach: Run a dead-code analysis (e.g., `ts-prune`) and remove unused exports.

**Pervasive `any` Annotations:**
- Issue: Multiple server actions and API route handlers use `any` as parameter or return types, bypassing TypeScript's safety guarantees.
- Files: `src/app/actions/prayer.ts`, `src/app/actions/group.ts`, `src/lib/db/queries/` (various)
- Impact: Type errors can reach production silently; refactors become unsafe.
- Fix approach: Replace `any` with narrow union types or `unknown` with runtime narrowing. Enforce `@typescript-eslint/no-explicit-any` in ESLint config.

**Rate Limiting Silently Disabled Without Redis:**
- Issue: Rate-limiting middleware checks for a Redis connection at startup and degrades to a no-op when Redis is unavailable, with no alerting or hard failure.
- Files: `src/lib/rate-limit.ts`
- Impact: In any environment without Redis (local dev, staging, a Redis outage), all endpoints are completely unprotected from abuse. The silent fallback makes this invisible.
- Fix approach: In production (`NODE_ENV === 'production'`), throw on missing Redis rather than silently skipping. In development, log a loud warning on every rate-limit bypass.

**Fragile Group Deletion Logic:**
- Issue: Group deletion cascades are handled in application code rather than relying on database-level `ON DELETE CASCADE` constraints. Steps are executed sequentially with no transaction wrapping the full operation.
- Files: `src/app/actions/group.ts`, `src/lib/db/queries/groups.ts`
- Impact: A failure mid-sequence leaves orphaned records (members, prayers, invites) in the database.
- Fix approach: Wrap the full deletion sequence in a single `db.transaction()` call, or move cascade rules to the schema DDL.

**Missing Rate Limits on Mutation Endpoints:**
- Issue: Beyond the disabled Redis issue above, several high-impact mutation server actions (prayer creation, group join, image upload initiation) have no per-user rate limiting even when Redis is present.
- Files: `src/app/actions/prayer.ts`, `src/app/actions/group.ts`, `src/app/api/upload/route.ts`
- Impact: Authenticated users can flood the database or storage bucket without restriction.
- Fix approach: Apply the existing `rateLimit()` helper uniformly to all mutation actions.

---

## Known Bugs

**`unprayAction` Lacks Access Check:**
- Symptoms: A user can call `unprayAction` with any `prayerId` value, including prayers they never prayed. The action deletes a row without verifying the authenticated user owns the pray record.
- Files: `src/app/actions/prayer.ts` (`unprayAction`)
- Trigger: Authenticated user submits a direct POST with an arbitrary `prayerId`.
- Workaround: None currently. The delete silently succeeds or silently fails (no-op) depending on whether a matching row exists.

**Unbounded Admin Queries:**
- Symptoms: Admin dashboard data-fetch functions return all rows from `prayers`, `users`, and `groups` tables with no `LIMIT` clause.
- Files: `src/lib/db/queries/admin.ts`, `src/app/admin/` route handlers
- Trigger: As the database grows, these queries will cause slow page loads and eventually timeouts or OOM errors on the database server.
- Workaround: None in place. Currently masked by low data volume.

---

## Security Issues

**Rate Limiting Silently Disabled Without Redis:**
- Risk: All endpoints become unprotected from brute-force and spam attacks when Redis is unavailable.
- Files: `src/lib/rate-limit.ts`
- Current mitigation: None — the fallback is a no-op.
- Recommendations: Hard-fail in production when Redis is missing; add monitoring alerts for Redis connectivity.

**Presigned Upload URL With No File Size Limit:**
- Risk: The R2 presigned URL generation endpoint does not enforce a maximum file size. An authenticated user can upload arbitrarily large files, exhausting storage budget or triggering egress costs.
- Files: `src/app/api/upload/route.ts`
- Current mitigation: None.
- Recommendations: Add `ContentLengthRange` condition to the presigned URL policy, and validate the `Content-Length` header server-side before issuing the URL.

**HTML Injection in Email Templates:**
- Risk: User-supplied strings (prayer titles, group names) are interpolated directly into HTML email templates without escaping, enabling stored HTML injection in email clients.
- Files: `src/lib/email/templates/` (all template files)
- Current mitigation: None detected.
- Recommendations: Escape all user content with an HTML entity encoder before interpolation, or use a templating engine with auto-escaping (e.g., replace manual string concatenation with a library like `html-escaper`).

**No CSRF Protection on Server Actions:**
- Risk: Next.js server actions use the `POST` method. Without explicit CSRF tokens or `SameSite=Strict` cookies, cross-site form submissions are possible in some browser configurations.
- Files: All `src/app/actions/` files
- Current mitigation: `SameSite=Lax` is the Next.js default for cookies, which mitigates most but not all cross-site POST scenarios.
- Recommendations: Confirm `SameSite=Strict` on session cookies, or add `Origin` header validation in a middleware layer.

---

## Performance Bottlenecks

**Polling Redundancy With AutoRefresh Component:**
- Problem: The `AutoRefresh` component (`src/components/AutoRefresh.tsx`) triggers router refreshes on a fixed interval. Pages that already receive real-time updates via another mechanism (e.g., optimistic UI, revalidation) will double-fetch data unnecessarily.
- Files: `src/components/AutoRefresh.tsx`, pages that mount it
- Cause: The component does not check whether fresh data has already arrived before re-polling.
- Improvement path: Replace fixed-interval polling with event-driven revalidation (`router.refresh()` only on user interactions or websocket events), or remove `AutoRefresh` from pages that already have live update mechanisms.

**Unbounded Database Queries:**
- Problem: Several feed and admin queries fetch entire table result sets. The prayer feed query in particular returns all visible prayers before the application layer applies pagination logic.
- Files: `src/lib/db/queries/prayers.ts`, `src/lib/db/queries/admin.ts`
- Cause: `LIMIT`/`OFFSET` or cursor-based pagination is not applied at the query level.
- Improvement path: Push `LIMIT` and cursor conditions into the SQL query itself; add database indexes on `created_at` and `group_id` columns used in `ORDER BY` and `WHERE` clauses.

**Missing Database Indexes on Hot Query Paths:**
- Problem: Queries filtering by `userId`, `groupId`, and `createdAt` on the `prayers` and `prayerLikes` tables do not have corresponding composite indexes in the schema.
- Files: `src/lib/db/schema.ts` (Drizzle schema definitions)
- Cause: Indexes were not added when the tables were defined.
- Improvement path: Add `index()` definitions in the Drizzle schema for `(groupId, createdAt)` and `(userId, createdAt)` on the prayers table, and `(prayerId, userId)` on the likes table.

---

## Fragile Areas

**`sanitizePrayer` Manual Opt-In:**
- Files: `src/lib/sanitize.ts`, `src/app/actions/prayer.ts`, `src/app/actions/group.ts`
- Why fragile: Sanitization of prayer content is not enforced at a framework or middleware level. Each server action must explicitly call `sanitizePrayer()`. Any new action that forgets this call will pass raw user input to the database.
- Safe modification: Do not add new prayer mutation actions without calling `sanitizePrayer()` on content fields. Consider wrapping all prayer writes in a single repository function that applies sanitization unconditionally.
- Test coverage: No test verifies that a new code path without sanitization would be caught.

**Privacy Requirement Has No Test Coverage:**
- Files: `src/lib/db/queries/prayers.ts`, `src/app/actions/prayer.ts`
- Why fragile: The rule that private prayers are only visible to their owner is enforced via a `WHERE` clause condition in the query layer. There is no automated test that asserts a user cannot see another user's private prayer.
- Safe modification: Any change to prayer query logic risks breaking the privacy guarantee silently.
- Test coverage: Add an integration test that creates a private prayer as User A, then asserts User B's prayer fetch returns zero results for that prayer.

**Group Membership Check Before Prayer Access:**
- Files: `src/lib/db/queries/prayers.ts`
- Why fragile: Group-scoped prayer visibility depends on a join against the `groupMembers` table. If that table's schema or membership logic changes, visibility could silently break in either direction (over-exposing or under-exposing prayers).
- Safe modification: Treat the membership join as load-bearing; any schema migration touching `groupMembers` must be accompanied by an access-control regression test.
- Test coverage: Gap — no existing test covers the "non-member cannot see group prayer" case.

---

## Scaling Limits

**R2 Storage Without Lifecycle Policies:**
- Current capacity: Unlimited (pay-per-use), but no cleanup of orphaned uploads.
- Limit: Objects uploaded but never attached to a prayer record accumulate indefinitely (e.g., user uploads image, then abandons the form).
- Scaling path: Implement an R2 lifecycle rule to delete objects older than 24 hours that are not referenced in the `prayers.imageUrl` column, or run a scheduled cleanup job.

**Single-Region Database:**
- Current capacity: Sufficient for current user volume.
- Limit: Neon Postgres is provisioned in a single region. As global user base grows, read latency increases for distant users.
- Scaling path: Enable Neon read replicas in additional regions, or introduce a read-through cache layer (Redis) for the public prayer feed.

---

## Dependencies at Risk

**Neon Serverless Driver Compatibility:**
- Risk: The codebase uses `@neondatabase/serverless` which requires a WebSocket proxy for non-edge runtimes. If Neon changes its connection protocol or deprecates the serverless driver, connection handling breaks.
- Impact: Complete database connectivity loss.
- Migration plan: The Drizzle ORM layer abstracts the driver; switching to the standard `pg` driver requires only updating the Drizzle connection config in `src/lib/db/index.ts`.

**Resend Email SDK:**
- Risk: Resend is an early-stage provider. API changes or service discontinuation would break all transactional email.
- Impact: No password reset, no invite emails, no notifications.
- Migration plan: Email sending is isolated to `src/lib/email/`. Swapping to SendGrid or Postmark requires replacing the Resend client call in that module only.

---

## Missing Critical Features

**Email Verification Not Enforced:**
- Problem: The authentication flow (NextAuth + Resend) sends a verification email but does not block access to the application for unverified accounts. Users can interact with all features using an unverified email address.
- Blocks: Trustworthy user identity, spam prevention, account recovery reliability.
- Files: `src/app/api/auth/` route handlers, `src/lib/auth.ts`

**No Report UI Despite Database Schema:**
- Problem: The database schema includes a `reports` table (for reporting inappropriate prayers or users), but no UI, server action, or admin review workflow exists for this feature.
- Blocks: Community moderation; the schema investment is currently wasted.
- Files: `src/lib/db/schema.ts` (`reports` table definition), `src/app/admin/` (no reports section)

**No Notification System:**
- Problem: There is no mechanism to notify a prayer poster when someone prays for their request. The `AutoRefresh` component provides data freshness, but no push or in-app notification surface exists.
- Blocks: Engagement loop; users have no reason to return after posting.
- Files: No notification-related files exist.

---

## Test Coverage Gaps

**Privacy and Access Control (High Priority):**
- What's not tested: That private prayers are invisible to other users; that non-members cannot access group prayers.
- Files: `src/lib/db/queries/prayers.ts`, `src/app/actions/prayer.ts`
- Risk: A query refactor silently breaks privacy guarantees.
- Priority: High

**`unprayAction` Authorization (High Priority):**
- What's not tested: That a user cannot unpray a prayer record belonging to another user.
- Files: `src/app/actions/prayer.ts`
- Risk: The known bug described above goes undetected by CI.
- Priority: High

**Group Deletion Atomicity (Medium Priority):**
- What's not tested: That partial failures during group deletion leave the database in a consistent state.
- Files: `src/app/actions/group.ts`
- Risk: Orphaned records accumulate silently after any mid-sequence failure.
- Priority: Medium

**Rate Limit Enforcement (Medium Priority):**
- What's not tested: That rate limiting actually rejects excess requests; that the Redis-absent fallback triggers an appropriate error in production mode.
- Files: `src/lib/rate-limit.ts`
- Risk: Rate limiting is believed to be active but may be silently bypassed.
- Priority: Medium

**Sanitization Coverage (Medium Priority):**
- What's not tested: That all prayer mutation code paths invoke `sanitizePrayer()`.
- Files: `src/lib/sanitize.ts`, `src/app/actions/prayer.ts`
- Risk: A new action added without sanitization passes raw HTML to the database.
- Priority: Medium

---

*Concerns audit: 2026-03-19*
