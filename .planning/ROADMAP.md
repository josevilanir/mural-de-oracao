## Milestones

- ✅ **v1.0 Security Remediation** — Phases 1-4 (shipped 2026-03-20)
- ✅ **v1.1 Tech Debt & Performance** — Phase 1 (shipped 2026-03-20)
- ✅ **v1.2 NextAuth v5 Beta Stability** — Phase 1 (shipped 2026-03-20)
- 🚧 **v1.3 Quality & Observability** — Phases 1-3 (in progress)

## Phases

<details>
<summary>✅ v1.0 Security Remediation (Phases 1-4) — SHIPPED 2026-03-20</summary>

- [x] Phase 1: Upload Size Enforcement (1/1 plans) — completed 2026-03-20
- [x] Phase 2: Email HTML Escaping (1/1 plans) — completed 2026-03-20
- [x] Phase 3: CSRF Hardening + Cleanup (2/2 plans) — completed 2026-03-20
- [x] Phase 4: Remove orphaned TypeScript types in types/prisma.ts (1/1 plans) — completed 2026-03-20

</details>

<details>
<summary>✅ v1.1 Tech Debt & Performance (Phase 1) — SHIPPED 2026-03-20</summary>

- [x] Phase 1: Fix concerns from CONCERNS.md (1/1 plans) — completed 2026-03-20

</details>

<details>
<summary>✅ v1.2 NextAuth v5 Beta Stability (Phase 1) — SHIPPED 2026-03-20</summary>

- [x] Phase 1: NextAuth v5 Beta Stability (1/1 plans) — completed 2026-03-20

</details>

### 🚧 v1.3 Quality & Observability (In Progress)

**Milestone Goal:** Close all active quality gaps — error observability, audit logging, test coverage, and small code-quality fixes.

- [x] **Phase 1: Quick Fixes & Observability** - Instrument error tracking and resolve two small code-quality items
- [x] **Phase 2: Audit Logging** - Add a database audit trail for admin and group management actions (completed 2026-03-21)
- [ ] **Phase 3: Test Coverage** - Write automated tests for server actions, API routes, auth flows, and typed mock factories

## Phase Details

### Phase 1: Quick Fixes & Observability
**Goal**: Unhandled production errors are visible in an external error tracker, and two small code-quality items are resolved
**Depends on**: Nothing (first phase of milestone)
**Requirements**: EMAIL-01, CODE-01, OBSV-01, OBSV-02
**Success Criteria** (what must be TRUE):
  1. A thrown error inside a server action appears in the external error-tracking dashboard without any manual logging call
  2. A thrown error inside an API route appears in the external error-tracking dashboard without any manual logging call
  3. All email templates route user-supplied fields through the shared builder function that calls `sanitizeUserInput()`
  4. `feed.ts` contains an inline comment explaining `scope: 'mural'` query behavior
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Set up Sentry error tracking and instrument server actions and API routes
- [x] 01-02-PLAN.md — Consolidate email templates to shared builder + add feed.ts mural scope comment

### Phase 2: Audit Logging
**Goal**: Admin moderation and group management actions leave a durable, queryable audit trail in the database
**Depends on**: Phase 1
**Requirements**: AUDT-01, AUDT-02
**Success Criteria** (what must be TRUE):
  1. After an admin hides or approves a prayer, a corresponding row exists in the audit log table recording the actor, action type, and timestamp
  2. After an admin approves or rejects a group join request, a corresponding audit log row is written
  3. After a group is created, deleted, or its membership changes, a corresponding audit log row is written
  4. The audit log table is queryable — rows survive application restart and are not ephemeral
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Add AuditLog Prisma model, migration, and write audit entries for moderation and group management actions

### Phase 3: Test Coverage
**Goal**: Server actions, API routes, auth flows, and group management have automated tests that run in CI, with no untyped `as any` casts in test files
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. `npm test` passes and covers create, delete, comment, and resolve prayer server actions
  2. `npm test` passes and covers group create, delete, and membership server actions
  3. `npm test` passes and covers `/api/upload`, `/api/notifications`, and `/api/groups` routes
  4. `npm test` passes and covers registration, login, password reset, and email-verification auth flows
  5. All test files use typed mock factories — no remaining `as any` casts in test code
**Plans**: TBD

Plans:
- [ ] 03-01: Test prayer server actions and group management server actions
- [ ] 03-02: Test API routes and auth flows
- [ ] 03-03: Replace `as any` casts with typed mock factories across all test files

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Upload Size Enforcement | v1.0 | 1/1 | Complete | 2026-03-20 |
| 2. Email HTML Escaping | 1/1 | Complete   | 2026-03-21 | 2026-03-20 |
| 3. CSRF Hardening + Cleanup | v1.0 | 2/2 | Complete | 2026-03-20 |
| 4. Remove orphaned TypeScript types | v1.0 | 1/1 | Complete | 2026-03-20 |
| 1. Fix concerns from CONCERNS.md | v1.1 | 1/1 | Complete | 2026-03-20 |
| 1. NextAuth v5 Beta Stability | v1.2 | 1/1 | Complete | 2026-03-20 |
| 1. Quick Fixes & Observability | v1.3 | 2/2 | Complete | 2026-03-21 |
| 2. Audit Logging | v1.3 | 0/1 | Not started | - |
| 3. Test Coverage | v1.3 | 0/3 | Not started | - |
