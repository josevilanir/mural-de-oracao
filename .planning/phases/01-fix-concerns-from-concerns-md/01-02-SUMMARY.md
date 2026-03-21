---
phase: 01-fix-concerns-from-concerns-md
plan: 02
subsystem: api
tags: [email, sanitization, security, documentation]

# Dependency graph
requires:
  - phase: none
    provides: existing email.ts with ad-hoc sanitizeUserInput calls
provides:
  - buildEmailFields shared sanitization helper centralizing all user-field escaping in email templates
  - email subjects with user-supplied fields now sanitized (previously raw)
  - inline documentation for scope: 'mural' query behavior in feed.ts
affects: [any future email templates, feed behavior documentation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared builder pattern: collect all user-supplied fields into a single object, sanitize at a single call site, use sanitized values throughout"

key-files:
  created: []
  modified:
    - lib/email.ts
    - app/actions/prayers/feed.ts

key-decisions:
  - "Used a generic buildEmailFields<T extends Record<string, string>> so TypeScript preserves the exact field names as keys, keeping usage of s.name / s.groupName type-safe"
  - "sendPasswordResetEmail left unchanged — it has no user-supplied fields, only a system-generated token"
  - "Comment in feed.ts explicitly references canAccessPrayer() so future readers know where access control lives"

patterns-established:
  - "Email sanitization pattern: every template calls buildEmailFields({ ...userFields }) as its first line, uses s.* throughout HTML and subjects"

requirements-completed: [EMAIL-01, CODE-01]

# Metrics
duration: 2min
completed: 2026-03-21
---

# Phase 01 Plan 02: Email Sanitization Builder and Feed Scope Comment Summary

**Centralized email field sanitization via buildEmailFields helper, fixing unsanitized subjects in three templates, and adding mural scope design intent comment in feed.ts**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-21T12:19:17Z
- **Completed:** 2026-03-21T12:20:45Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `buildEmailFields<T>` generic helper to `lib/email.ts` that sanitizes all user-supplied values via `sanitizeUserInput` in a single place
- Refactored all four email templates with user-supplied fields to use the builder, removing ad-hoc `sanitizeUserInput()` inline calls
- Fixed three email subjects that were using raw (unsanitized) user values: `sendCommentNotificationEmail`, `sendGroupStatusEmail`, `sendJoinRequestStatusEmail`
- Added inline comment in `feed.ts` explaining why `scope: 'mural'` shows all non-hidden prayers regardless of visibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Add shared email builder function and refactor templates** - `bd6ed38` (refactor)
2. **Task 2: Add inline comment explaining scope mural behavior in feed.ts** - `64e9e4d` (docs)

**Plan metadata:** (final commit hash — see below)

## Files Created/Modified
- `lib/email.ts` - Added `buildEmailFields` helper, refactored 4 templates to use it, fixed 3 unsanitized subjects
- `app/actions/prayers/feed.ts` - Added inline comment explaining `scope: 'mural'` design intent

## Decisions Made
- Used TypeScript generics (`<T extends Record<string, string>>`) for `buildEmailFields` so property names are preserved and usage of `s.name`, `s.groupName` etc. is type-safe without casting.
- `sendPasswordResetEmail` was left untouched — it has no user-supplied fields.
- The comment in feed.ts explicitly mentions `canAccessPrayer()` and its location so future developers know where per-request access control lives.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Email sanitization is now enforced structurally; future templates cannot forget it if they follow the established pattern.
- Feed scope behavior is documented for future maintainers.

## Self-Check: PASSED

- FOUND: lib/email.ts
- FOUND: app/actions/prayers/feed.ts
- FOUND: .planning/phases/01-fix-concerns-from-concerns-md/01-02-SUMMARY.md
- FOUND commit: bd6ed38 (Task 1)
- FOUND commit: 64e9e4d (Task 2)

---
*Phase: 01-fix-concerns-from-concerns-md*
*Completed: 2026-03-21*
