# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Next.js App Router — server-first full-stack application

**Key Characteristics:**
- Server Components fetch data directly (no separate API layer for reads)
- Server Actions handle all writes and mutations (`"use server"` directive)
- Route Groups (`(app)`) provide layout scoping and authentication context
- Thin API routes exist only for stateful client-side polling (notifications, upload presigning)
- Middleware enforces auth and role gating at the edge before pages render

## Layers

**Middleware (Edge):**
- Purpose: Route-level authentication and role-based access control
- Location: `middleware.ts`
- Contains: Auth checks, redirects for unauthenticated/unauthorized users
- Depends on: `lib/auth.config.ts` (edge-compatible auth config, no Prisma)
- Used by: Every page request that matches the matcher pattern

**Pages (App Router):**
- Purpose: Server-rendered UI; fetch initial data via Server Actions or direct DB calls
- Location: `app/(app)/` for authenticated app pages, `app/` root for auth pages
- Contains: `page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`
- Depends on: Server Actions, `lib/auth.ts`, components
- Used by: Next.js router

**Server Actions:**
- Purpose: All data mutations and paginated feed reads
- Location: `app/actions/prayers/`, `app/actions/groups/`, `app/actions/admin/`, `app/actions/user/`
- Contains: `"use server"` functions that auth-check, validate, rate-limit, then call Prisma
- Depends on: `lib/auth.ts`, `lib/prisma.ts`, `lib/rate-limit.ts`, `schemas/`
- Used by: Both Server Components (reads) and Client Components (mutations via form actions)

**API Routes:**
- Purpose: Client-driven endpoints not suitable for Server Actions (polling, presigned URLs)
- Location: `app/api/`
- Contains:
  - `app/api/auth/[...nextauth]/route.ts` — NextAuth handler
  - `app/api/notifications/route.ts` — GET (fetch) + POST (mark read)
  - `app/api/upload/route.ts` — R2 presigned URL generation
  - `app/api/groups/[id]/route.ts` and `app/api/groups/[id]/pending-members/route.ts`
- Depends on: `lib/auth.ts`, `lib/prisma.ts`, `lib/r2.ts`
- Used by: Client Components via fetch

**Components:**
- Purpose: Reusable UI; split between Server and Client components
- Location: `components/`
- Contains: Domain components (`prayers/`, `groups/`, `admin/`), layout components (`layout/`), shared utilities (`shared/`), UI primitives (`ui/`)
- Depends on: Server Actions (called from Client Components), `lib/utils.ts`
- Used by: Pages

**Library / Infrastructure:**
- Purpose: Singleton clients and cross-cutting utilities
- Location: `lib/`
- Contains:
  - `lib/prisma.ts` — Singleton PrismaClient with Neon adapter
  - `lib/auth.ts` — NextAuth config with Google + Credentials providers and PrismaAdapter
  - `lib/auth.config.ts` — Edge-safe auth config (no Prisma, used by middleware)
  - `lib/r2.ts` — Cloudflare R2 S3 client
  - `lib/rate-limit.ts` — Upstash Redis sliding-window rate limiter
  - `lib/email.ts` — Email sending utility
  - `lib/utils.ts` — `cn()`, `sanitizePrayers()`, `formatRelativeDate()`, label maps
- Depends on: Environment variables
- Used by: All other layers

**Schemas:**
- Purpose: Zod validation for form inputs and Server Action arguments
- Location: `schemas/`
- Contains: `schemas/prayer.ts`, `schemas/user.ts`
- Depends on: `zod`
- Used by: Server Actions

**Types:**
- Purpose: TypeScript type definitions
- Location: `types/`
- Contains: `types/prisma.ts` (local enum mirrors), `types/prayer.ts`, `types/next-auth.d.ts` (session augmentation)

## Data Flow

**Feed Read (Server-rendered):**

1. User navigates to `/` or `/mural`
2. `app/(app)/page.tsx` (Server Component) calls `fetchFeedAction()` directly
3. `fetchFeedAction` checks auth, queries Prisma, sanitizes anonymity, returns paginated result
4. `FeedLoadMore` Client Component receives initial data as props
5. On "Load more" click: Client Component calls `fetchFeedAction()` via Server Action to append items
6. On poll interval (30s): Client Component calls `fetchFeedAction({ newerThan })` to detect new prayers and shows banner

**Mutation (e.g., create prayer):**

1. User submits form in `NewPrayerForm` (Client Component)
2. Client Component calls `createPrayerAction(data)` — a Server Action
3. Server Action: auth check → rate limit check → Zod validation → Prisma write
4. On success: `revalidatePath()` invalidates affected pages, Server Component re-renders on next visit
5. Returns `{ success: boolean, error?: string }` to Client Component for UI feedback

**Image Upload:**

1. Client Component requests presigned URL via `GET /api/upload?contentType=image/...`
2. API route validates auth and content type, calls R2 to generate presigned URL
3. Client uploads directly to R2 using presigned URL
4. Client stores returned `publicUrl` in form state, submits it as part of group creation

**Notifications:**

1. `NotificationBell` Client Component polls `GET /api/notifications` on mount
2. On bell click: marks all read via `POST /api/notifications`
3. Admin/leader actions create `Notification` records in Prisma during Server Action execution

## Key Abstractions

**sanitizePrayers (RF05 — anonymity):**
- Purpose: Strip author identity from anonymous prayer requests server-side
- Location: `lib/utils.ts`
- Pattern: Called in every Server Action / API route that returns Prayer data before sending to client. The client NEVER receives real author data for anonymous prayers.

**checkRateLimit:**
- Purpose: Sliding-window rate limiting backed by Upstash Redis
- Location: `lib/rate-limit.ts`
- Pattern: Called at the top of mutation Server Actions. Gracefully no-ops when Redis env vars are absent (safe for local dev).

**Server Action pattern:**
- Purpose: All mutations follow a consistent shape
- Pattern:
  ```typescript
  "use server";
  export async function someAction(data: unknown) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "..." };
    // rate limit check (for user-facing actions)
    const parsed = Schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "..." };
    // Prisma write
    revalidatePath("/affected-path");
    return { success: true };
  }
  ```

**Route Group `(app)`:**
- Purpose: Applies the authenticated app layout (sidebar + main) to all protected pages
- Location: `app/(app)/layout.tsx`
- Pattern: All pages under `(app)/` share `AppSidebar`. Auth pages (`/login`, `/register`, etc.) are outside this group and render without the sidebar.

**AutoRefresh:**
- Purpose: Keep SSR pages fresh without full page reload
- Location: `components/shared/AutoRefresh.tsx`
- Pattern: Client Component that calls `router.refresh()` on an interval, pausing when tab is hidden. Added to SSR pages that should stay current.

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Responsibilities: HTML shell, ThemeProvider, global CSS

**App Layout:**
- Location: `app/(app)/layout.tsx`
- Responsibilities: AppSidebar + main content area for all authenticated pages

**Middleware:**
- Location: `middleware.ts`
- Triggers: Every request matching `/((?!api|_next/static|_next/image|favicon.ico|public).*)`
- Responsibilities: Auth check, role guard, redirect unauthenticated to login

**Home Page:**
- Location: `app/(app)/page.tsx`
- Responsibilities: Shows landing/marketing section to guests, prayer feed to authenticated users

**NextAuth Handler:**
- Location: `app/api/auth/[...nextauth]/route.ts`
- Responsibilities: Handles all OAuth and credentials auth flows

## Error Handling

**Strategy:** Two-tier boundary system with console logging

**Patterns:**
- `app/global-error.tsx` — catches errors in the root layout (full-page recovery UI)
- `app/(app)/error.tsx` — catches errors within the app route group (inline recovery with back-to-home button)
- Server Actions return `{ success: false, error: string }` instead of throwing — errors are surfaced in UI
- Prisma unique constraint violations caught by error code `P2002` in Server Actions
- Fire-and-forget email sending: `sendEmail().catch(err => console.error(...))` — failures do not block the user action

## Cross-Cutting Concerns

**Logging:** `console.error` with bracketed action name prefix (e.g., `[createPrayerAction]`). No structured logging library.

**Validation:** Zod schemas in `schemas/` used in Server Actions. Middleware uses NextAuth session shape. No client-side validation separate from native form constraints.

**Authentication:** `auth()` from `lib/auth.ts` called at the top of every Server Action and API route. Middleware handles page-level enforcement. Two auth methods: Google OAuth and email/password with bcrypt.

**Rate Limiting:** `checkRateLimit(type, userId)` from `lib/rate-limit.ts`. Applied to: prayer creation (5/hour), comments (10/min), pray actions (20/min), join requests (10/min).

**Data Sanitization:** `sanitizePrayers()` from `lib/utils.ts` must be called on all prayer queries before returning to client.

---

*Architecture analysis: 2026-03-19*
