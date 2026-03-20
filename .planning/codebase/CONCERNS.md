# Codebase Concerns

**Analysis Date:** 2026-03-19

## Tech Debt

**Pervasive `any` Annotations: [Fixed 2026-03-20]**
- All explicit `any` annotations removed from server actions, page components, and client forms.
- `@typescript-eslint/no-explicit-any: "error"` added to `eslint.config.mjs` to prevent regressions.

**Fragile Group Deletion Logic: [Fixed 2026-03-20]**
- `deleteGroup` now wraps `prayer.deleteMany` + `group.delete` in a single `prisma.$transaction([...])`.
- Mid-sequence failures will no longer leave orphaned prayers.

---

## Known Bugs

None currently identified.

---

## Security Issues

**None currently identified.**

---

## Performance Bottlenecks

**Polling Redundancy With AutoRefresh Component: [Fixed 2026-03-20]**
- Default interval increased from 30 s to 60 s to halve polling frequency.
- Component still skips refresh when the tab is hidden.

**Unbounded Database Queries: [Fixed 2026-03-20]**
- Admin prayer pages (`/admin/page.tsx`, `/admin/prayers/page.tsx`) now have `take: 200` guard.
- Feed queries were already cursor-paginated (`FEED_PAGE_SIZE = 12`).

**Missing Database Indexes on Hot Query Paths: [Fixed 2026-03-20]**
- `prisma/schema.prisma` — added `@@index([groupId, createdAt])` and `@@index([authorId, createdAt])` on `Prayer`.
- Added `@@index([prayerId, userId])` on `PrayerAction`.
- Run `npx prisma migrate dev` to apply indexes to the database.

---

## Fragile Areas

**`sanitizePrayer` Manual Opt-In: [Resolvido — write path agora sanitiza via lib/sanitize.ts]**
- `lib/sanitize.ts` criado com `sanitizeUserInput()` que escapa `&`, `<`, `>`, `"`, `'`.
- `createPrayerAction` aplica em `title`, `description` e `verseReference` antes do `prisma.prayer.create`.
- `resolveTestimonyAction` aplica em `testimony` antes do `prisma.prayer.update`.
- `createCommentAction` aplica em `text` antes do `prisma.comment.create`.
- `createPrayerAction` também chama `sanitizePrayer()` (anonymity mask) no objeto retornado ao cliente.

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

*Concerns audit: 2026-03-19 — updated 2026-03-20 (Fixed: HTML injection in email templates, CSRF on server actions, rate-limit silent bypass, unprayAction ownership non-issue, presigned upload URL file size limit, unbounded admin queries, missing rate limits on group/register/forgotPassword/removal mutations, IDOR/privacy leak on prayer detail page and mural feed, missing access-control test coverage, pervasive any annotations (tech debt), fragile group deletion logic (wrapped in transaction), missing DB indexes (schema.prisma), AutoRefresh interval increased, AutoRefresh removed from pages with revalidatePath, write path sanitization via lib/sanitize.ts, duplicate ESLint config removed)*
