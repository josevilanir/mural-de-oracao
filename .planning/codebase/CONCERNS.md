# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

**Pervasive `any` Annotations:**
- Issue: Multiple server actions and API route handlers use `any` as parameter or return types, bypassing TypeScript's safety guarantees.
- Files: `src/app/actions/prayer.ts`, `src/app/actions/group.ts`, `src/lib/db/queries/` (various)
- Impact: Type errors can reach production silently; refactors become unsafe.
- Fix approach: Replace `any` with narrow union types or `unknown` with runtime narrowing. Enforce `@typescript-eslint/no-explicit-any` in ESLint config.

**Fragile Group Deletion Logic:**
- Issue: Group deletion cascades are handled in application code rather than relying on database-level `ON DELETE CASCADE` constraints. Steps are executed sequentially with no transaction wrapping the full operation.
- Files: `src/app/actions/group.ts`, `src/lib/db/queries/groups.ts`
- Impact: A failure mid-sequence leaves orphaned records (members, prayers, invites) in the database.
- Fix approach: Wrap the full deletion sequence in a single `db.transaction()` call, or move cascade rules to the schema DDL.

---

## Known Bugs

None currently identified.

---

## Security Issues

**None currently identified.**

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

**Group Deletion Atomicity (Medium Priority):**
- What's not tested: That partial failures during group deletion leave the database in a consistent state.
- Files: `src/app/actions/group.ts`
- Risk: Orphaned records accumulate silently after any mid-sequence failure.
- Priority: Medium

**Sanitization Coverage (Medium Priority):**
- What's not tested: That all prayer mutation code paths invoke `sanitizePrayer()`.
- Files: `src/lib/sanitize.ts`, `src/app/actions/prayer.ts`
- Risk: A new action added without sanitization passes raw HTML to the database.
- Priority: Medium

---

*Concerns audit: 2026-03-19 — updated 2026-03-20 (Fixed: HTML injection in email templates, CSRF on server actions, rate-limit silent bypass, unprayAction ownership non-issue, presigned upload URL file size limit, unbounded admin queries, missing rate limits on group/register/forgotPassword/removal mutations, IDOR/privacy leak on prayer detail page and mural feed, missing access-control test coverage)*
