# CONVENTIONS.md — Code Style & Patterns

## Language & Formatting

- **TypeScript strict mode** — no explicit `any` (ESLint `no-explicit-any` enabled)
- **Prettier** — code formatting enforced via `eslint-config-prettier`
- **ESLint** — `eslint-config-next` + Prettier, runs during build (not skipped)
- **Path alias:** `@/` maps to project root (e.g. `@/lib/prisma`, `@/components/prayers/...`)

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Functions/vars | camelCase | `fetchFeedAction`, `checkRateLimit` |
| Types/interfaces/components | PascalCase | `PrayerCard`, `FetchFeedInput` |
| Enum members | UPPER_SNAKE_CASE | `PRAYER_CLICK`, `GROUP_ONLY` |
| Files — components | PascalCase | `PrayerCard.tsx`, `NewPrayerForm.tsx` |
| Files — lib/utils | camelCase | `rate-limit.ts`, `email.ts` |
| Server actions | `*Action` suffix | `createPrayerAction`, `fetchFeedAction` |

## File Organization

- **`app/`** — Next.js App Router pages and server actions
- **`app/actions/`** — Server actions grouped by domain (`prayers/`, `groups/`, `user/`, `admin/`)
- **`components/`** — React components grouped by domain (`prayers/`, `groups/`, `layout/`, `ui/`, `shared/`)
- **`lib/`** — Shared utilities and service initializations
- **`lib/services/`** — Domain service logic (e.g. `prayer-access.ts`)
- **`schemas/`** — Zod validation schemas
- **`types/`** — TypeScript type definitions
- **`tests/`** — Test files and mocks
- **`prisma/`** — Database schema and migrations

## Server Actions Pattern

All server actions follow this structure:

```ts
"use server";

export async function doSomethingAction(data: unknown) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "..." };

  // 2. Rate limit (where applicable)
  const rl = await checkRateLimit("type", session.user.id);
  if (!rl.success) return { success: false, error: rl.error };

  // 3. Zod validation (accepts `unknown`)
  const parsed = SomeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  // 4. Business logic + DB
  try {
    const result = await prisma.entity.create({ data: { ...parsed.data } });
    revalidatePath("/relevant-path");
    return { success: true, result };
  } catch (err) {
    console.error("[actionName]", err);
    return { success: false, error: "Algo deu errado. Tente novamente." };
  }
}
```

**Return pattern:** Always `{ success: boolean, error?: string, data?: T }` — never throw from server actions.

## Input Sanitization

User-supplied text is sanitized via `lib/sanitize.ts:sanitizeUserInput()` before DB persistence:

```ts
// lib/sanitize.ts
export function sanitizeUserInput(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
```

Applied in: `app/actions/prayers/create.ts`, `app/actions/prayers/resolve.ts`, and email templates via `lib/email.ts`.

## Error Handling

- **Server actions:** return `{ success: false, error: string }` — no throws
- **API routes:** return JSON with HTTP status codes
- **Logging:** `console.error("[context]", err)` prefix pattern for server-side errors
- **Rate limiting:** graceful fallback — blocks in production if Redis unavailable, warns in dev

## Authentication

- Auth checked at top of every server action via `const session = await auth()`
- Middleware handles route-level protection for private/admin routes (`middleware.ts`)
- CSRF protection in middleware for POST/PUT/PATCH/DELETE via Origin header validation

## Data Fetching

- **Server Components** fetch data directly from DB via Prisma (no API layer)
- **Client Components** call server actions or fetch API routes
- **Pagination:** cursor-based using `createdAt` timestamp as cursor

## Comments & Docs

- Minimal inline comments — code should be self-explanatory
- JSDoc only for complex public functions in `lib/`
- Section separators use `// ─────...─────` pattern in Prisma schema and complex files
- Portuguese used for user-facing strings; English for code and comments

## UI Patterns

- **Radix UI** primitives + **Tailwind CSS** for all UI components
- **`cn()` utility** via `clsx` + `tailwind-merge` for conditional classes
- **Loading states:** skeleton components (`PrayerCardSkeleton.tsx`)
- **Empty states:** `EmptyState` shared component
- **Theme:** `next-themes` with `ThemeProvider` wrapping app layout
