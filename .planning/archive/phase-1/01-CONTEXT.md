# Phase 01: Fix concerns from CONCERNS.md - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/codebase/CONCERNS.md)

<domain>
## Phase Boundary

Address and systematically resolve the primary security, architectural, and technical debt issues identified in the codebase concerns audit. Specifically targeting pervasive `any` annotations and fragile group deletion logic, alongside performance and fragility improvements.

</domain>

<decisions>
## Implementation Decisions

### Pervasive `any` Annotations
- Replace `any` with narrow union types or `unknown` with runtime narrowing in server actions and database queries.
- Enforce `@typescript-eslint/no-explicit-any` in the ESLint configuration.

### Fragile Group Deletion Logic
- Wrap the full deletion sequence (members, prayers, invites, group) in a single `db.transaction()` call to ensure atomicity and prevent orphaned records.

### Performance Bottlenecks
- Address unbounded database queries by applying `LIMIT`/`OFFSET` and cursor-based pagination at the query level for feeds and admin queries.
- Push LIMIT and cursor conditions into SQL queries (`src/lib/db/queries/prayers.ts`, `src/lib/db/queries/admin.ts`).
- Add composite indexes on `(groupId, createdAt)` and `(userId, createdAt)` on the prayers table, and `(prayerId, userId)` on the likes table in the schema.

### Fragile Areas
- Abstract prayer write paths to ensure `sanitizePrayer()` is unconditionally applied, avoiding manual opt-in fragility in new actions.

### the agent's Discretion
- Approach to refactoring `AutoRefresh` polling versus event-driven revalidation.
- Implementation details for the single transaction logic in `group.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Codebase Audit
- `.planning/codebase/CONCERNS.md` — The living document of codebase issues to be resolved and updated as work is completed.

</canonical_refs>

<specifics>
## Specific Ideas

- Modify `src/app/actions/prayer.ts` and `src/app/actions/group.ts` to fix `any` types.
- Modify `src/lib/db/schema.ts` to add the requested indexes.
- Ensure all mutations properly pass through sanitization without relying on the developer remembering to call it.

</specifics>

<deferred>
## Deferred Ideas

- Missing Critical Features (Email Verification, Report UI, Notification System) are out of scope for this specific remediation phase, based on PROJECT.md.
- Scaling Limits (R2 Storage lifecycle policies, Single-Region database) are deferred.
- Dependencies at Risk (Neon serverless driver, Resend Email SDK) are deferred.

</deferred>

---

*Phase: 01-fix-concerns-from-concerns-md*
*Context gathered: 2026-03-20 via PRD Express Path*
