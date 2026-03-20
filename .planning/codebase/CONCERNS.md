# Codebase Concerns

**Analysis Date:** 2026-03-19 — updated 2026-03-20

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
