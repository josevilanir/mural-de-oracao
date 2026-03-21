# Conventions

## Code Style & Formatting
- **Prettier** (`^3.8.1`) — code formatting
- **ESLint** (`^8`) — `eslint-config-next` + `eslint-config-prettier`
  - Custom rule: `@typescript-eslint/no-explicit-any: error` (enforced in `.eslintrc.json`)
  - ESLint errors ignored during build (`next.config.mjs`: `ignoreDuringBuilds: true`)
- **TypeScript** — `strict: true` in `tsconfig.json`
  - Type errors ignored during build (`next.config.mjs`: `ignoreBuildErrors: true`)

## Naming Conventions

### Files
- **Components:** PascalCase — `PrayerCard.tsx`, `AppSidebar.tsx`, `ThemeProvider.tsx`
- **Server Actions:** camelCase — `create.ts`, `deleteAccount.ts`, `password-reset.ts`
- **Utilities:** camelCase — `rate-limit.ts`, `sanitize.ts`, `utils.ts`
- **Schemas:** camelCase — `prayer.ts`, `user.ts`
- **Type declarations:** camelCase with `.d.ts` suffix — `next-auth.d.ts`

### Code
- **React components:** PascalCase exports — `export default function PrayerCard()`
- **Utility functions:** camelCase exports — `export function cn()`, `export function sanitizePrayer()`
- **Constants:** SCREAMING_SNAKE_CASE — `CATEGORY_LABELS`, `STATUS_LABELS`, `R2_BUCKET`
- **Prisma models:** PascalCase — `User`, `Prayer`, `GroupMember`
- **Prisma enums:** SCREAMING_SNAKE_CASE — `HEALTH`, `ACTIVE`, `PRAYER_CLICK`
- **Zod schemas:** PascalCase — `CreatePrayerSchema`, `RegisterSchema`

### Imports
- Path alias: `@/*` maps to project root — `import { prisma } from "@/lib/prisma"`
- Relative imports for sibling files within the same directory

## Language
- **UI text:** Portuguese (pt-BR) — all user-facing strings, error messages, and labels are in Brazilian Portuguese
- **Code:** English — variable names, function names, comments are mixed (English code, Portuguese inline comments)
- **Documentation:** Portuguese (README, LOCAL_DEV_GUIDE)

## Component Patterns

### Server vs Client Components
- **Default:** Server Components (no directive)
- **Client:** Explicitly marked with `"use client"` directive at top of file
- **Pattern:** Server Component fetches data, passes to Client Component for interactivity
  - Example: `AppSidebar.tsx` (server) → `AppSidebarClient.tsx` (client)

### Shadcn UI Components (`components/ui/`)
- Radix primitive wrapped with Tailwind styling
- CVA (`class-variance-authority`) for variants
- `cn()` utility for conditional class merging

### Form Pattern
```typescript
// Client Component
"use client"
const form = useForm<CreatePrayerInput>({
  resolver: zodResolver(CreatePrayerSchema),
  defaultValues: { ... }
});
// Submit calls Server Action directly
```

## Data Mutation Pattern (Server Actions)
Standard pattern across all Server Actions:

```typescript
"use server"
export async function createPrayer(data: CreatePrayerInput) {
  // 1. Authenticate — const session = await auth()
  // 2. Validate — CreatePrayerSchema.parse(data)
  // 3. Rate limit — checkRateLimit("prayer", session.user.id)
  // 4. Sanitize — sanitizeUserInput(data.title)
  // 5. Persist — prisma.prayer.create(...)
  // 6. Revalidate — revalidatePath("/mural")
  // 7. Return result or redirect
}
```

## Error Handling
- **Server Actions:** Return discriminated results (success/error objects) rather than throwing
- **Error boundaries:** `global-error.tsx` (root), `error.tsx` (route-level)
- **Auth errors:** Redirected to `/login` via `auth.config.ts` pages config
- **Rate limit failures:** Return user-facing error message in Portuguese
- **Email failures:** Caught and logged to console, never throw to user

## Privacy & Security Conventions
- **Anonymous prayers:** Server-side sanitization via `sanitizePrayer()` in `lib/utils.ts` — strips `authorId` and `author` data before sending to client
- **XSS prevention:** `sanitizeUserInput()` in `lib/sanitize.ts` escapes HTML entities before database persistence
- **CSRF:** Middleware validates `origin` header on mutation requests
- **Soft delete:** `User.isDeleted` flag for LGPD compliance (account anonymization)

## Design System
- **Design tokens:** CSS custom properties in `app/globals.css` using RGB channel format for Tailwind opacity support
- **Color naming:** Semantic names — `cream`, `navy`, `gold-warm`, `status-blue`, etc.
- **Dark mode:** `.dark` class strategy, automatic via `next-themes` system preference
- **Custom shadows:** `sm`, `md`, `lg` with specific rgba values
- **Custom border-radius:** `sm` (4px) through `2xl` (20px)
