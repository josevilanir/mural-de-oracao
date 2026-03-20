---
wave: 1
depends_on: []
files_modified:
  - src/app/actions/prayer.ts
  - src/app/actions/group.ts
  - src/lib/db/queries/groups.ts
  - src/lib/db/queries/prayers.ts
  - src/lib/db/queries/admin.ts
  - src/lib/db/schema.ts
  - src/components/AutoRefresh.tsx
autonomous: true
---

# Phase 01: Fix concerns from CONCERNS.md - Plan 1

<objective>
Resolve pervasive `any` types, introduce a database transaction for group deletion, add missing database indexes, paginate unbounded queries, and refactor/remove fixed-interval polling in `AutoRefresh.tsx`.
</objective>

<requirements>
</requirements>

<verification>
- [ ] Run `npm run lint` and verify no explicit `any` warnings are present.
- [ ] Verify `schema.ts` generates a valid SQL migration.
- [ ] Create a group, add members and prayers, then delete the group. Verify that no orphaned records remain in the DB and that the delete operation succeeded.
</verification>

<must_haves>
- All group deletions must be wrapped in a transaction.
- `schema.ts` must define accurate composite indexes.
- No `any` type usage in server actions.
- Unbounded queries MUST have `limit` or pagination logic.
</must_haves>

<tasks>
<task>
<description>Update ESLint to prevent explicitly `any` annotations and fix existing occurrences</description>
<read_first>
- .eslintrc.json (or equivalent config)
- src/app/actions/prayer.ts
- src/app/actions/group.ts
</read_first>
<action>
1. Edit eslint config to enforce `@typescript-eslint/no-explicit-any`: "error".
2. In `src/app/actions/prayer.ts` and `src/app/actions/group.ts` and query files, replace `any` with the appropriate type interfaces or use `unknown` if the type is truly dynamic, then narrow it.
3. Replace all remaining `any` types in `src/lib/db/queries/`.
</action>
<acceptance_criteria>
- `grep -r ": any" src/app/actions` returns no matches.
- `grep -r ": any" src/lib/db/queries` returns no matches.
- `npm run lint` passes without `@typescript-eslint/no-explicit-any` errors in those files.
</acceptance_criteria>
</task>

<task>
<description>Wrap group deletion in a single database transaction</description>
<read_first>
- src/app/actions/group.ts
- src/lib/db/queries/groups.ts
</read_first>
<action>
1. In `src/lib/db/queries/groups.ts` (or `src/app/actions/group.ts`), locate the sequence of `delete` operations for a group.
2. Refactor it to use `db.transaction(async (tx) => { ... })`.
3. Move the cascading deletions (members, prayers, invites, group itself) inside the `tx` block.
</action>
<acceptance_criteria>
- `src/lib/db/queries/groups.ts` or `group.ts` contains `db.transaction(`.
- All deletion statements inside the group deletion flow use `tx` (or the transaction client adapter) rather than the global `db`.
</acceptance_criteria>
</task>

<task>
<description>Add missing database indexes and pagination to unbounded queries</description>
<read_first>
- src/lib/db/schema.ts
- src/lib/db/queries/prayers.ts
- src/lib/db/queries/admin.ts
</read_first>
<action>
1. In `src/lib/db/schema.ts`, add `index("group_created_idx").on(table.groupId, table.createdAt)` and `index("user_created_idx").on(table.userId, table.createdAt)` to the `prayers` table.
2. Add `index("prayer_user_idx").on(table.prayerId, table.userId)` to the `prayerLikes` table.
3. In `src/lib/db/queries/prayers.ts` and `src/lib/db/queries/admin.ts`, add a `limit(50)` (or cursor logic) to queries that currently return all results (e.g. prayer feed, admin list).
</action>
<acceptance_criteria>
- `src/lib/db/schema.ts` contains `.on(prayers.groupId, prayers.createdAt)` (or equivalent Drizzle syntax).
- `src/lib/db/queries/prayers.ts` contains `.limit(` on the feed queries.
</acceptance_criteria>
</task>

<task>
<description>Refactor or remove fixed-interval AutoRefresh</description>
<read_first>
- src/components/AutoRefresh.tsx
</read_first>
<action>
1. Review `src/components/AutoRefresh.tsx`. If it blindly calls `router.refresh()` every interval without checking if data changed, we need to either conditionally fetch, increase the interval dramatically, or implement a lighter event-driven approach.
2. If we cannot easily swap to event-driven right now, add a flag or remove it from high-traffic pages if they have optimistic UI or better revalidation. Let's start by modifying the component to accept a prop to toggle it, or increase the interval and document it. It was cited in CONCERNS as causing double fetching. We should perhaps just increase the interval to 60s or replace it.
</action>
<acceptance_criteria>
- `src/components/AutoRefresh.tsx` has been refactored to minimize redundant polling (e.g. larger interval or conditional).
</acceptance_criteria>
</task>

<task>
<description>Enforce conditional sanitization on all prayer mutation actions</description>
<read_first>
- src/app/actions/prayer.ts
- src/lib/sanitize.ts
</read_first>
<action>
1. Review the prayer creation and update workflows.
2. Ensure `sanitizePrayer()` is universally called before inserting or updating the database.
3. Instead of placing it in server actions, refactor the DB insertion query in `src/lib/db/queries/prayers.ts` to call `sanitizePrayer()` internally so no server action can bypass it.
</action>
<acceptance_criteria>
- `src/lib/db/queries/prayers.ts` imports and calls `sanitizePrayer` before database `insert` or `update` operations on prayers.
</acceptance_criteria>
</task>
</tasks>
