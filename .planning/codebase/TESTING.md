# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:** None configured

No test runner (Jest, Vitest, Playwright, Cypress) is present in `package.json` dependencies or devDependencies. No test config files exist (`jest.config.*`, `vitest.config.*`, `playwright.config.*` are all absent).

**Assertion Library:** None

**Run Commands:**
```bash
# No test script defined in package.json
npm run lint   # Only quality check available
```

## Test File Organization

**Location:** No test files exist in the repository

**Naming:** No established pattern — no `*.test.*` or `*.spec.*` files found

**Structure:** Not applicable

## Test Structure

No tests are written. The codebase has no test infrastructure at all.

## Mocking

**Framework:** None

No mocking utilities are installed or configured.

## Fixtures and Factories

**Test Data:**
- `lib/mock-prayer-requests.ts` exists — contains static mock data used for UI development/seeding, not test fixtures

**Location:**
- `lib/mock-prayer-requests.ts` — mock prayer request objects for development use only

## Coverage

**Requirements:** None enforced

No coverage tooling is configured. The `package.json` scripts section contains only `dev`, `build`, `start`, `lint`, and `postinstall`.

## Test Types

**Unit Tests:** Not present

**Integration Tests:** Not present

**E2E Tests:** Not present

## What Exists Instead

The codebase relies on:

1. **TypeScript strict mode** (`strict: true` in `tsconfig.json`) for compile-time correctness
2. **Zod schema validation** at runtime — all form inputs and server action inputs are validated via `safeParse` in `schemas/prayer.ts` and `schemas/user.ts`
3. **ESLint** (`next/core-web-vitals` + `typescript`) for static analysis
4. **Manual testing** implied by the development workflow

## Recommendations for Adding Tests

**Suggested framework stack:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

**Where to place tests (proposed):**
- Unit tests co-located: `app/actions/prayers/create.test.ts` beside `create.ts`
- Component tests co-located: `components/prayers/PrayerCard.test.tsx` beside `PrayerCard.tsx`
- Integration tests: `tests/` directory at root

**High-priority test targets:**
- `lib/utils.ts` — `sanitizePrayer` and `sanitizePrayers` (security-critical, pure functions, easy to test)
- `app/actions/prayers/create.ts` — auth guard, rate limit, Zod validation, group membership check
- `app/actions/user/register.ts` — duplicate email guard, password hashing, email send failure tolerance
- `schemas/prayer.ts` and `schemas/user.ts` — Zod schema edge cases

---

*Testing analysis: 2026-03-19*
