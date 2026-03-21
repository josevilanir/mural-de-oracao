# TESTING.md — Test Structure & Practices

## Framework

- **Vitest 4.1.0** — Test runner
- **Environment:** Node.js (`environment: 'node'` in `vitest.config.ts`)
- **Path alias:** `@/` resolves to project root (via `vitest.config.ts` resolve alias)

## Configuration

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

## Test Files

| File | Focus |
|------|-------|
| `lib/email.test.ts` | Unit tests for email HTML escaping / XSS prevention |
| `tests/prayer-access-control.test.ts` | Unit + integration tests for prayer access control logic |
| `tests/__mocks__/mock-prayer-requests.ts` | Shared mock data fixtures |

**Coverage:** 2 test files, ~30 test cases total. Focused on security-critical paths.

## Test Structure

Tests use standard Vitest describe/it/expect blocks:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('describes expected behavior', async () => {
    // arrange → act → assert
  });
});
```

## Mocking Patterns

**Module mocks** — declared at top before imports (hoisting requirement):

```ts
vi.mock("@/lib/prisma", () => ({
  prisma: {
    prayer: { findMany: vi.fn() },
    groupMember: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
```

**Global mocks** (fetch, env vars):

```ts
vi.stubGlobal('fetch', mockFetchFn);
vi.stubEnv('BREVO_API_KEY', 'test-api-key');
// cleanup in afterEach:
vi.unstubAllGlobals();
vi.unstubAllEnvs();
```

**Mock return values:**

```ts
vi.mocked(prisma.groupMember.findUnique).mockResolvedValue({ status: 'ACTIVE' } as any);
vi.mocked(auth).mockResolvedValue(null as any);
```

## What Is Tested

### `lib/email.test.ts`
- HTML escaping of user input in all email templates (XSS prevention)
- Verifies `<script>`, `<b>`, `<img>` tags are escaped in HTML body
- Verifies plain text fields (subject) are NOT over-escaped
- Verifies button hrefs remain functional (no `&amp;` in URLs)

### `tests/prayer-access-control.test.ts`
- `canAccessPrayer` service — all access control branches:
  - Hidden prayers always denied
  - Public prayers always allowed (no DB lookup)
  - GROUP_ONLY unauthenticated — denied without DB call
  - GROUP_ONLY PENDING member — denied
  - GROUP_ONLY ACTIVE member — allowed
- `fetchFeedAction` — Prisma query filter validation:
  - `scope: 'mural'` passes `visibility: PUBLIC` filter
  - `scope: 'home'` uses OR clause (not top-level visibility)
  - Home scope OR clause never includes GROUP_ONLY group prayers

## Gaps / Missing Coverage

- **No E2E tests** — no Playwright/Cypress setup
- **No component tests** — React components untested
- **No API route tests** — `app/api/` routes have no coverage
- **No server action tests** — beyond access control (create, delete, comment, etc.)
- **No utility function tests** — `lib/utils.ts`, `lib/sanitize.ts` standalone tests missing
- **No auth flow tests** — registration, login, password reset flows untested

## Running Tests

```bash
npm test           # vitest run (single pass)
npm run test       # same
```

No watch mode script configured. Add `"test:watch": "vitest"` if needed.
