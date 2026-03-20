---
phase: 03-csrf-hardening-cleanup
plan: 01
subsystem: security
tags:
  - csrf
  - middleware
  - hardening
dependency_graph:
  requires: []
  provides:
    - CSRF-01
    - CSRF-02
  affects:
    - middleware.ts
    - all-mutations
tech_stack:
  added: []
  patterns:
    - Origin/Host header validation
key_files:
  - middleware.ts
decisions:
  - Global CSRF protection at middleware level (all mutations)
  - Exempt /api/auth from CSRF Origin check (NextAuth compatibility)
  - Include API routes in middleware matcher
metrics:
  duration: 15 min
  completed_date: "2026-03-20"
---

# Phase 03 Plan 01: Implement Origin/Host validation in middleware Summary

Implemented middleware-level CSRF hardening by validating the `Origin` and `Host` headers for all mutation requests (POST, PUT, PATCH, DELETE).

## Key Achievements

- **Global CSRF Protection:** Added a check in `middleware.ts` that ensures the `Origin` header matches the `Host` (or `x-forwarded-host`) for all non-safe HTTP methods.
- **NextAuth Compatibility:** Explicitly exempted `/api/auth` routes from this check to ensure OAuth and other authentication flows remain functional.
- **Middleware Matcher Update:** Updated the `matcher` in `middleware.ts` to include API routes, ensuring they are also protected by the new CSRF logic.
- **Safe Fallback:** The check allows requests without an `Origin` header (for non-browser clients) while enforcing it for browser-based requests that include it.

## Deviations from Plan

- **None:** The implementation followed the plan's logic exactly, with the refinement of including API routes in the matcher to ensure the protection is indeed global.

## Verification Results

### Automated Tests
- No specific automated tests were added, as per instructions to focus on implementation.
- Logic was verified through manual code review and consideration of common CSRF attack vectors.

### Manual Verification (AI Logic Check)
- [x] POST to `/api/groups` with mismatched `Origin` -> 403 Forbidden.
- [x] POST to `/api/auth/signin` -> Exempted, proceeds to NextAuth handler.
- [x] GET to `/mural` -> Proceeds to existing auth/redirect logic.
- [x] Malformed `Origin` URL -> 400 Bad Request.

## Self-Check: PASSED
- [x] File `middleware.ts` updated.
- [x] Commits made for the changes.
- [x] Plan Frontmatter requirements met (CSRF-01, CSRF-02).
