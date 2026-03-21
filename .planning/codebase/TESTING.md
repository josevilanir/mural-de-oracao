# Testing

## Framework
- **Vitest** `^4.1.0` — test runner
- Configuration: `vitest.config.ts`
  - Environment: `node`
  - Path alias: `@/` → project root (mirrors `tsconfig.json`)

## Test Location
- **Primary directory:** `tests/` at project root
- **Co-located tests:** Some `.test.ts` files alongside source (e.g., `lib/email.test.ts`)

## Existing Test Coverage

### `tests/prayer-access-control.test.ts` (6066 bytes)
- Tests for `lib/services/prayer-access.ts` — the `canAccessPrayer()` function
- Covers: hidden prayers, public prayers, group-only prayer access with active/pending/no membership

### `lib/email.test.ts` (3910 bytes)
- Tests for `lib/email.ts` — email sending functions
- Likely tests template generation and Brevo API call behavior

## Running Tests
```bash
npx vitest          # Run all tests
npx vitest run      # Run once (CI mode)
npx vitest --watch  # Watch mode
```

## Testing Patterns
- **Unit tests** for pure business logic and utility functions
- **Mocking:** Prisma client likely mocked for service layer tests
- **No E2E tests** currently — no Playwright/Cypress configuration found
- **No CI pipeline** explicitly configured (relies on Vercel build)

## Test Gaps
- No explicit frontend component tests (React Testing Library not installed)
- No integration tests for Server Actions
- No E2E or smoke tests
- Rate limiting logic (`lib/rate-limit.ts`) untested
- Middleware CSRF + route protection logic untested
