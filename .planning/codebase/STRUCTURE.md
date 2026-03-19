# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
mural-de-oracao/
├── app/                        # Next.js App Router root
│   ├── (app)/                  # Route group: authenticated app pages
│   │   ├── admin/              # Admin moderation pages
│   │   │   ├── grupos/         # Group approval queue
│   │   │   ├── prayers/        # Prayer moderation
│   │   │   └── remocoes/       # Prayer removal requests
│   │   ├── grupos/             # Group browser and management
│   │   │   ├── [id]/           # Individual group page
│   │   │   │   └── gerenciar/  # Group management (leader only)
│   │   │   └── novo/           # Create group form
│   │   ├── meus-pedidos/       # User's own prayer requests
│   │   ├── mural/              # Public prayer board
│   │   ├── novo-pedido/        # Submit new prayer request
│   │   ├── pedido/[id]/        # Prayer detail page
│   │   │   └── resolver/       # Mark prayer answered
│   │   ├── layout.tsx          # App shell (sidebar + main)
│   │   ├── page.tsx            # Home: feed (auth) or landing (guest)
│   │   ├── error.tsx           # App-level error boundary
│   │   └── loading.tsx         # App-level loading UI
│   ├── actions/                # Server Actions (mutations + reads)
│   │   ├── admin/              # moderation.ts
│   │   ├── groups/             # index.ts (all group actions)
│   │   ├── prayers/            # create, delete, feed, pray, comment, resolve
│   │   └── user/               # register, verify-email, password-reset, deleteAccount
│   ├── api/                    # REST API routes (client polling + auth)
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── groups/[id]/        # Group REST endpoints + pending-members
│   │   ├── notifications/      # GET list, POST mark-read
│   │   └── upload/             # R2 presigned URL generation
│   ├── forgot-password/        # Password reset request page
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── reset-password/         # Password reset confirmation page
│   ├── verify-email/           # Email verification page
│   ├── welcome/                # Welcome/onboarding page
│   ├── global-error.tsx        # Root-level error boundary
│   ├── globals.css             # Global CSS + Tailwind base
│   ├── layout.tsx              # Root HTML layout + ThemeProvider
│   └── not-found.tsx           # 404 page
├── components/                 # Reusable React components
│   ├── admin/                  # AdminToggle.tsx
│   ├── groups/                 # GroupCard, DeleteGroupButton
│   ├── layout/                 # AppSidebar, Header, FilterBar, NotificationBell, UserAccountNav
│   ├── prayers/                # PrayerCard, FeedLoadMore, NewPrayerForm, etc.
│   ├── providers/              # ThemeProvider
│   ├── shared/                 # AutoRefresh, EmptyState
│   └── ui/                     # Primitive UI components (button, badge, sidebar, etc.)
├── lib/                        # Singleton clients and shared utilities
│   ├── auth.ts                 # NextAuth full config (Prisma adapter, providers)
│   ├── auth.config.ts          # Edge-safe auth config (used by middleware)
│   ├── email.ts                # Email sending utility
│   ├── prisma.ts               # Singleton PrismaClient with Neon adapter
│   ├── r2.ts                   # Cloudflare R2 S3 client
│   ├── rate-limit.ts           # Upstash Redis rate limiter
│   └── utils.ts                # cn(), sanitizePrayers(), formatRelativeDate(), label maps
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma data model
│   └── migrations/             # SQL migration history
├── schemas/                    # Zod validation schemas
│   ├── prayer.ts               # CreatePrayerSchema, etc.
│   └── user.ts                 # Registration/auth schemas
├── types/                      # TypeScript type definitions
│   ├── next-auth.d.ts          # Session type augmentation (adds role, id to User)
│   ├── prayer.ts               # Prayer-related types
│   └── prisma.ts               # Local mirrors of Prisma enums (Category, PrayerStatus, Role)
├── public/                     # Static assets
├── tasks/                      # Development task tracking (not shipped)
├── memory/                     # Claude memory files (not shipped)
├── Docs/                       # Project documentation
├── middleware.ts               # Edge auth + role guard
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── prisma.config.ts            # Prisma configuration (migrations URL)
```

## Directory Purposes

**`app/(app)/`:**
- Purpose: All authenticated, in-app pages
- Contains: `page.tsx` files for each route, `layout.tsx` for the app shell
- Key files: `app/(app)/layout.tsx` (sidebar shell), `app/(app)/page.tsx` (home/landing), `app/(app)/error.tsx`

**`app/actions/`:**
- Purpose: Every write operation and paginated data read in the application
- Contains: `"use server"` functions, one file per domain area
- Key files: `app/actions/prayers/feed.ts` (paginated feed), `app/actions/prayers/create.ts`, `app/actions/groups/index.ts`

**`app/api/`:**
- Purpose: REST endpoints for client-driven operations not suited to Server Actions
- Contains: NextAuth handler, notification polling, upload presigning, group JSON endpoints

**`components/prayers/`:**
- Purpose: All prayer-related UI
- Key files: `PrayerCard.tsx` (card display), `FeedLoadMore.tsx` (infinite scroll + real-time polling), `NewPrayerForm.tsx` (create form), `PrayButtonClient.tsx` (pray interaction)

**`components/layout/`:**
- Purpose: App chrome components
- Key files: `AppSidebar.tsx` (server), `AppSidebarClient.tsx` (client interactivity), `NotificationBell.tsx`, `FilterBar.tsx`

**`components/ui/`:**
- Purpose: Primitive design system components (shadcn/ui style)
- Contains: `button.tsx`, `badge.tsx`, `dialog.tsx`, `sidebar.tsx`, `skeleton.tsx`, `ThemeToggle.tsx`

**`lib/`:**
- Purpose: Infrastructure layer — instantiated once, imported everywhere
- Never contains business logic. Pure adapters and utilities.

**`schemas/`:**
- Purpose: Input validation. Zod schemas used exclusively in Server Actions.

**`types/`:**
- Purpose: TypeScript declarations. `types/prisma.ts` provides enum string-union mirrors so code typechecks before `prisma generate` runs.

**`prisma/`:**
- Purpose: Single source of truth for the data model
- Key files: `prisma/schema.prisma` (all models, enums, relations)

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML shell + ThemeProvider
- `app/(app)/layout.tsx`: Authenticated app shell (sidebar)
- `middleware.ts`: Edge auth enforcement

**Core Business Logic:**
- `app/actions/prayers/feed.ts`: Prayer feed with cursor pagination and polling
- `app/actions/prayers/create.ts`: Prayer creation with rate limiting and group membership check
- `app/actions/groups/index.ts`: All group lifecycle actions (create, approve, join, manage)
- `app/actions/admin/moderation.ts`: Admin moderation actions
- `lib/utils.ts`: `sanitizePrayers()` — must be called on all prayer data before returning to client

**Authentication:**
- `lib/auth.ts`: Full NextAuth config (use in Server Components and API routes)
- `lib/auth.config.ts`: Edge-safe config (use in `middleware.ts` only)
- `app/api/auth/[...nextauth]/route.ts`: Auth HTTP handler

**Database:**
- `lib/prisma.ts`: Import `prisma` from here everywhere
- `prisma/schema.prisma`: All models and relations

**Infrastructure:**
- `lib/rate-limit.ts`: `checkRateLimit(type, userId)` — call in mutation Server Actions
- `lib/r2.ts`: `r2` client, `R2_BUCKET`, `R2_PUBLIC_URL`
- `lib/email.ts`: Email functions for group approval and join request notifications

**Real-time:**
- `components/prayers/FeedLoadMore.tsx`: Client-side polling (30s interval, `newerThan` cursor)
- `components/shared/AutoRefresh.tsx`: `router.refresh()` interval for SSR pages
- `components/layout/NotificationBell.tsx`: Notification polling

## Naming Conventions

**Files:**
- Page files: `page.tsx` (Next.js convention)
- Layout files: `layout.tsx` (Next.js convention)
- Components: PascalCase (`PrayerCard.tsx`, `FeedLoadMore.tsx`)
- Server Actions files: camelCase or `index.ts` (`create.ts`, `feed.ts`, `index.ts`)
- Library utilities: camelCase (`auth.ts`, `rate-limit.ts`)
- Schemas: camelCase (`prayer.ts`, `user.ts`)

**Exports:**
- Pages: default export (Next.js requirement)
- Components: default export for leaf components, named export for shared utilities (`AutoRefresh`, `EmptyState`)
- Server Actions: named exports (`export async function createPrayerAction`)
- Library singletons: named exports (`export const prisma`)

**Directories:**
- Route groups: lowercase with parentheses `(app)`
- Dynamic segments: `[id]`
- Feature groupings: lowercase kebab-case (`novo-pedido`, `meus-pedidos`)
- Component subdirectories: lowercase (`prayers/`, `layout/`, `ui/`)

## Where to Add New Code

**New page (authenticated):**
- Create `app/(app)/[route-name]/page.tsx`
- Add auth guard in `middleware.ts` if route requires login (add to `PRIVATE_ROUTES`)
- Add admin restriction to `ADMIN_ROUTES` if admin-only

**New Server Action:**
- Add to the matching domain file in `app/actions/[domain]/`
- Create a new file if the domain is new (e.g., `app/actions/comments/index.ts`)
- Always: `"use server"`, `auth()` check, Zod validation, `revalidatePath()`

**New API route:**
- Create `app/api/[resource]/route.ts`
- Use only when Server Actions are inappropriate (polling, presigned URLs, webhook receivers)

**New component:**
- Domain-specific: `components/[domain]/ComponentName.tsx`
- App-wide layout: `components/layout/ComponentName.tsx`
- Shared utility: `components/shared/ComponentName.tsx`
- Design system primitive: `components/ui/component-name.tsx`

**New Zod schema:**
- Add to `schemas/prayer.ts` or `schemas/user.ts` if it fits an existing domain
- Create `schemas/[domain].ts` for a new domain

**New database model:**
- Add to `prisma/schema.prisma`
- Run `npx prisma migrate dev` to generate migration
- If adding enums used in TypeScript directly, mirror them in `types/prisma.ts`

**New utility function:**
- Domain-agnostic helpers: `lib/utils.ts`
- New infrastructure client: `lib/[service].ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents and codebase analysis
- Generated: No (manually maintained)
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`prisma/migrations/`:**
- Purpose: SQL migration history auto-generated by `prisma migrate dev`
- Generated: Yes (by Prisma)
- Committed: Yes

**`tasks/`:**
- Purpose: Development task tracking (`todo.md`, `lessons.md`)
- Generated: No
- Committed: Yes (project convention per CLAUDE.md)

**`memory/`:**
- Purpose: Claude persistent memory files
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-19*
