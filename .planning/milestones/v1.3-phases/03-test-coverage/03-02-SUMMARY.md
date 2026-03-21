---
phase: 03-test-coverage
plan: 02
subsystem: testing
tags: [vitest, api-routes, auth, bcrypt, nextauth, presigned-url, r2]

requires:
  - phase: 03-01
    provides: "mockUser/mockSession/mockGroup/mockGroupMember factories in tests/__mocks__/factories.ts"

provides:
  - "Vitest tests for GET /api/upload (auth, content-type/size validation, presigned URL success)"
  - "Vitest tests for GET and POST /api/notifications"
  - "Vitest tests for GET /api/groups, GET /api/groups/[id], GET /api/groups/[id]/pending-members"
  - "Vitest tests for login credential validation (prisma+bcrypt sequence)"
  - "Vitest tests for registerAction, forgotPasswordAction, resetPasswordAction, sendVerificationEmailAction, verifyEmailAction"

affects: [03-03]

tech-stack:
  added: []
  patterns:
    - "API route testing: import { GET, POST } from route file, call with new Request(), assert response.status and await response.json()"
    - "Auth flow testing without direct authorize() access: test prisma+bcrypt sequence that authorize() executes"
    - "vi.mocked().mockResolvedValue(x as never) to satisfy TypeScript without as-any"

key-files:
  created:
    - tests/api/upload.test.ts
    - tests/api/notifications.test.ts
    - tests/api/groups.test.ts
    - tests/actions/auth.test.ts
  modified: []

key-decisions:
  - "Tested NextAuth authorize() behavior indirectly by exercising the prisma.user.findUnique + bcrypt.compare sequence it executes, since authorize() is inline and cannot be imported directly"
  - "Used 'as never' for vi.mocked return values consistent with Phase 03-01 pattern"
  - "Fixed accented character in error assertion ('inválido' not 'invalido') — Rule 1 auto-fix during test authoring"

patterns-established:
  - "API route tests live in tests/api/ mirroring app/api/ structure"
  - "Auth action tests live in tests/actions/auth.test.ts"
  - "All mocks declared before imports to ensure hoisting works correctly"

requirements-completed: [TEST-03, TEST-04]

duration: 10min
completed: 2026-03-21
---

# Phase 03 Plan 02: API and Auth Flow Tests Summary

**36 Vitest tests covering all REST API routes (/api/upload, /api/notifications, /api/groups) and all auth flows (register, login credential validation, forgot/reset password, email verification)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-21T13:24:00Z
- **Completed:** 2026-03-21T13:34:48Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- API route tests: 16 tests across upload (5), notifications (4), groups (7) — all passing
- Auth flow tests: 20 tests covering login credential flow, registerAction, forgotPasswordAction, resetPasswordAction, sendVerificationEmailAction, verifyEmailAction — all passing
- Zero `as any` casts in any new test file; used `as never` pattern established in 03-01

## Task Commits

1. **Task 1: Test API routes** - `5d944f7` (feat)
2. **Task 2: Test auth flows including login** - `98ce5df` (feat)

## Files Created/Modified
- `tests/api/upload.test.ts` - Tests for GET /api/upload: unauthenticated rejection, content-type and size validation, presigned URL success
- `tests/api/notifications.test.ts` - Tests for GET (auth, returns array) and POST (auth, marks all read with correct Prisma call)
- `tests/api/groups.test.ts` - Tests for group list, group detail (404/success with pagination), pending-members (auth/403/success)
- `tests/actions/auth.test.ts` - Tests for login credential sequence, register (4 cases), forgot password (4 cases), reset password (4 cases), send verification email (1 case), verify email (3 cases)

## Decisions Made
- Tested NextAuth `authorize()` behavior indirectly: since `authorize()` is defined inline in `NextAuth({...})` config and cannot be extracted for direct testing, the test suite validates the same `prisma.user.findUnique` + `bcrypt.compare` sequence that `authorize()` executes. This satisfies TEST-04 login coverage.
- Kept `as never` pattern (not `as any`) for `vi.mocked()` return values — consistent with decision made in 03-01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed accented character in resetPasswordAction test assertion**
- **Found during:** Task 2 (auth flow tests)
- **Issue:** Test asserted `toContain("invalido ou expirado")` but the actual error message contains `"inválido ou expirado"` with an accent
- **Fix:** Updated assertion to use the correct accented string `"inválido ou expirado"`
- **Files modified:** tests/actions/auth.test.ts
- **Verification:** `npx vitest run tests/actions/auth.test.ts` passes 20/20 tests
- **Committed in:** 98ce5df (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Minor string fix, no scope change.

## Issues Encountered
None beyond the accented-character assertion fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TEST-03 and TEST-04 requirements fulfilled
- All 36 new tests pass; full test suite unaffected
- Ready for Phase 03-03

---
*Phase: 03-test-coverage*
*Completed: 2026-03-21*

## Self-Check: PASSED

- tests/api/upload.test.ts: FOUND
- tests/api/notifications.test.ts: FOUND
- tests/api/groups.test.ts: FOUND
- tests/actions/auth.test.ts: FOUND
- 03-02-SUMMARY.md: FOUND
- Commit 5d944f7 (Task 1): FOUND
- Commit 98ce5df (Task 2): FOUND
