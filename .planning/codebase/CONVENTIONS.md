# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- React components: PascalCase, `.tsx` extension — e.g., `PrayerCard.tsx`, `FeedLoadMore.tsx`
- Server actions: camelCase file and function names — e.g., `create.ts` exports `createPrayerAction`
- Utility/lib modules: camelCase — e.g., `rate-limit.ts`, `auth.config.ts`
- API routes: `route.ts` inside Next.js App Router directories
- Types/schemas: camelCase filenames, PascalCase type names — e.g., `schemas/prayer.ts` exports `CreatePrayerSchema`

**Functions:**
- Server actions: suffix `Action` on the function name — e.g., `createPrayerAction`, `fetchFeedAction`, `registerAction`
- Event handlers in components: prefix `handle` — e.g., `handlePray`, `handleDelete`
- React components: PascalCase — e.g., `NewPrayerForm`, `PrayerCard`, `AppSidebarClient`
- Utility functions: camelCase descriptive — e.g., `sanitizePrayer`, `formatRelativeDate`, `checkRateLimit`

**Variables:**
- camelCase throughout
- Booleans: `is`/`has` prefix — e.g., `isAdmin`, `hasPrayed`, `isDeleted`, `isMember`
- Pending/loading states: `isPending`, `isSubmitting`, `isDeletePending`
- Constants (module-level): SCREAMING_SNAKE_CASE — e.g., `FEED_PAGE_SIZE`, `POLL_INTERVAL`, `CATEGORY_LABELS`

**Types/Interfaces:**
- Interface names: PascalCase, no `I` prefix — e.g., `PrayerCardProps`, `FetchFeedInput`, `Props` (local-only)
- Zod schemas: PascalCase + `Schema` suffix — e.g., `CreatePrayerSchema`, `RegisterSchema`
- Inferred types from Zod: PascalCase + `Input` suffix — e.g., `CreatePrayerInput`, `UpdatePrayerInput`
- Enum-equivalent string unions: defined in `types/prisma.ts` as plain string union types

## Code Style

**Formatting:**
- Prettier is installed (`prettier ^3.5.1` in devDependencies)
- `eslint-config-prettier` is present — Prettier rules override ESLint formatting
- No `.prettierrc` file committed; project relies on Prettier defaults (2-space indent inferred from source)

**Linting:**
- ESLint via `next/core-web-vitals` + `eslint-config-next/typescript`
- Minimal custom rules; relies on Next.js defaults
- `eslint-disable` comments are used sparingly and inline only — e.g., `// eslint-disable-next-line @next/next/no-img-element`

**TypeScript:**
- `strict: true` in `tsconfig.json`
- `noEmit: true`, `isolatedModules: true`
- Avoid `any` in types; use it only when bridging server action data to client (e.g., `initialPrayers as any[]` in feed)

## Import Organization

**Order (observed pattern):**
1. React and Next.js built-ins (`"use client"` / `"use server"` directive at top, then `react`, `next/*`)
2. Third-party packages (lucide-react, framer-motion, next-auth, react-hook-form, zod)
3. Internal path-aliased imports (`@/lib/*`, `@/components/*`, `@/app/actions/*`, `@/schemas/*`, `@/types/*`)

**Path Aliases:**
- `@/*` maps to the project root — configured in `tsconfig.json`
- Use `@/` for all cross-directory imports; never use relative `../../` imports

**Directive placement:**
- `"use server"` or `"use client"` must be the first line of the file, before all imports

## Action Return Shape

All server actions return a discriminated union:
```typescript
// Success
{ success: true, [data]?: ... }

// Failure
{ success: false, error: string }
```

First validation error is extracted via `parsed.error.issues[0]?.message ?? "Dados inválidos."`. Generic fallback is always `"Algo deu errado. Tente novamente."`.

## Error Handling

**Server Actions:**
- Check auth first; return early with `{ success: false, error: "..." }` if unauthenticated
- Run rate limit check immediately after auth
- Validate with Zod `safeParse`; return first issue message on failure
- Wrap database writes in `try/catch`; log with context tag then return generic error
- Non-critical side effects (email sends) use `.catch((err) => console.error("[tag] ...", err))` to avoid blocking

**API Routes:**
- Use `NextResponse.json({ error: "..." }, { status: 404 })` for not-found
- No try/catch in simple read-only routes — let Next.js handle uncaught errors

**Client Components:**
- Use `useTransition` for async server action calls
- Track optimistic state locally (`useState`) and roll back on failure by not updating state
- Display server errors via `serverError` state rendered inline in the form

**Error Boundaries:**
- `app/global-error.tsx` — root-level catch-all, logs to console, renders reset button
- `app/(app)/error.tsx` — scoped to the `(app)` route group, uses styled UI components

## Logging

**Framework:** `console.error` only — no logging library

**Patterns:**
- Log prefix format: `[functionName]` — e.g., `console.error("[createPrayerAction]", err)`
- Log only on unexpected errors (caught `catch` blocks) and non-critical side effect failures
- Never log sensitive data (passwords, tokens)
- Client error boundaries also use `console.error("[GlobalError]", error)`

## Comments

**When to Comment:**
- JSDoc-style single-line comments for utility functions with a non-obvious contract — e.g., `/** Merge Tailwind classes safely. */`
- Multi-line JSDoc for security-critical functions — e.g., `sanitizePrayer` has a `MUST` warning
- Inline comments to explain business rule context — e.g., `// Enviar e-mail de verificação (não bloqueia o cadastro se falhar)`
- Section dividers in long action files using `// ─────────...` ASCII lines with section label

**JSDoc/TSDoc:**
- Used selectively on exported utilities and critical security functions
- Not used on React component props interfaces (those use TypeScript directly)

## Function Design

**Size:** Functions are generally short and single-purpose; server actions are the longest (~50-80 lines) and each handles one domain operation

**Parameters:**
- Server actions accept a single `data: unknown` parameter and validate internally with Zod
- Component functions use typed props interfaces; `Props` is used for single-component local interfaces
- Optional props use `?` with default values in destructuring — e.g., `isOwner = false`

**Return Values:**
- Server actions always return plain objects (not thrown errors)
- Components return JSX or `null` for conditionally hidden elements (e.g., `if (isDeleted) return null`)

## Module Design

**Exports:**
- Server action files: named exports per function — e.g., `export async function createPrayerAction`
- Components: default export for page/component, named export for utility components (e.g., `export function AppSidebarClient`, `export function AutoRefresh`)
- UI primitives: named exports — e.g., `export { Button, buttonVariants }`

**Barrel Files:**
- Not used; imports go directly to the file — e.g., `@/app/actions/prayers/create`

## Tailwind Usage

- Use `cn()` from `@/lib/utils` for all conditional class merging — never template literals for class conditions
- Tailwind classes are inlined directly on JSX elements; no CSS modules or styled-components
- Custom design tokens used: `text-navy`, `bg-gold-warm`, `text-gray-text`, `border-gray-med`, `bg-blue-soft`, `bg-card`
- Responsive prefixes follow mobile-first: `sm:`, `md:`, `lg:`

---

*Convention analysis: 2026-03-19*
