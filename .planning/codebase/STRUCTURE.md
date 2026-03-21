# STRUCTURE.md — Directory Layout & Organization

## Top-Level Structure

```
mural-de-oracao/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Shared utilities and service clients
├── schemas/                # Zod validation schemas
├── types/                  # TypeScript type definitions
├── tests/                  # Test files and mocks
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── Docs/                   # Project documentation
├── tasks/                  # Claude Code task tracking (todo.md, lessons.md)
├── .planning/              # GSD planning artifacts
├── middleware.ts            # Next.js edge middleware
├── vitest.config.ts         # Vitest configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── prisma.config.ts         # Prisma configuration
├── package.json
└── .env.example
```

## `app/` — Next.js App Router

```
app/
├── layout.tsx               # Root HTML shell (ThemeProvider)
├── globals.css              # Global styles
├── not-found.tsx            # 404 page
├── global-error.tsx         # Global error boundary
│
├── (app)/                   # Route group: authenticated app shell
│   ├── layout.tsx           # App layout (sidebar + main)
│   ├── page.tsx             # Home feed (/)
│   ├── error.tsx            # Error boundary
│   ├── loading.tsx          # Loading state
│   ├── mural/               # Public prayer wall (/mural)
│   ├── meus-pedidos/        # My prayer requests (/meus-pedidos)
│   ├── novo-pedido/         # Create new prayer (/novo-pedido)
│   ├── pedido/[id]/         # Prayer detail + resolve (/pedido/[id])
│   ├── grupos/              # Groups list (/grupos)
│   │   ├── page.tsx
│   │   ├── novo/            # Create group (/grupos/novo)
│   │   └── [id]/            # Group detail (/grupos/[id])
│   │       └── gerenciar/   # Group management (/grupos/[id]/gerenciar)
│   └── admin/               # Admin panel (/admin, role=ADMIN only)
│       ├── page.tsx
│       ├── grupos/          # Admin group moderation
│       ├── prayers/         # Admin prayer moderation
│       └── remocoes/        # Admin removal requests
│
├── actions/                 # Server Actions (grouped by domain)
│   ├── admin/
│   │   └── moderation.ts
│   ├── groups/
│   │   └── index.ts
│   ├── prayers/
│   │   ├── comment.ts
│   │   ├── create.ts
│   │   ├── delete.ts
│   │   ├── feed.ts
│   │   ├── pray.ts
│   │   └── resolve.ts
│   └── user/
│       ├── deleteAccount.ts
│       ├── password-reset.ts
│       ├── register.ts
│       └── verify-email.ts
│
├── api/                     # REST API routes
│   ├── auth/[...nextauth]/  # NextAuth handler
│   ├── groups/              # Groups API
│   │   └── [id]/pending-members/
│   ├── notifications/       # Notifications API
│   └── upload/              # Image upload presigned URL
│
├── login/                   # Auth pages (redirect if logged in)
├── register/
├── welcome/
├── forgot-password/
├── reset-password/
└── verify-email/
```

## `components/` — React Components

```
components/
├── admin/
│   └── AdminToggle.tsx       # Admin role toggle UI
├── groups/
│   ├── DeleteGroupButton.tsx
│   └── GroupCard.tsx
├── layout/
│   ├── AppSidebar.tsx        # Main navigation sidebar (server)
│   ├── AppSidebarClient.tsx  # Client-side sidebar interactions
│   ├── FilterBar.tsx         # Feed filter controls
│   ├── Header.tsx
│   ├── NotificationBell.tsx
│   └── UserAccountNav.tsx
├── prayers/
│   ├── CommentForm.tsx
│   ├── DeleteButtons.tsx
│   ├── FeedLoadMore.tsx      # Infinite scroll client component
│   ├── NewPrayerForm.tsx
│   ├── PrayButtonClient.tsx
│   ├── PrayerCard.tsx
│   ├── PrayerCardSkeleton.tsx
│   ├── PrayerRequestsSection.tsx
│   └── ShareButton.tsx
├── providers/
│   └── ThemeProvider.tsx     # next-themes wrapper
├── shared/
│   ├── AutoRefresh.tsx       # Polling for new prayers
│   └── EmptyState.tsx
└── ui/                       # Base UI primitives (Radix + Tailwind)
    ├── badge.tsx
    ├── button.tsx
    ├── dialog.tsx
    ├── prayer-request-column.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    └── ThemeToggle.tsx
```

## `lib/` — Shared Utilities

```
lib/
├── auth.ts                  # NextAuth configuration + auth() helper
├── auth.config.ts           # Auth.js provider/callback configuration
├── email.ts                 # Brevo email templates and send logic
├── email.test.ts            # Email unit tests (co-located)
├── prisma.ts                # Prisma singleton client
├── r2.ts                    # Cloudflare R2 / AWS SDK client
├── rate-limit.ts            # Upstash Redis rate limiter
├── sanitize.ts              # HTML sanitization utility
├── utils.ts                 # General utilities (cn, sanitizePrayer, etc.)
└── services/
    └── prayer-access.ts     # canAccessPrayer() access control service
```

## `schemas/` — Zod Schemas

```
schemas/
├── prayer.ts                # CreatePrayerSchema, UpdatePrayerSchema
└── user.ts                  # RegisterSchema, LoginSchema, etc.
```

## `types/` — TypeScript Types

```
types/
├── prayer.ts                # Prayer-related type definitions
└── prisma.ts                # Re-exports from Prisma client (Category, PrayerStatus, etc.)
```

## `tests/` — Tests

```
tests/
├── __mocks__/
│   └── mock-prayer-requests.ts   # Shared mock prayer data
└── prayer-access-control.test.ts # Access control tests
```

## `prisma/` — Database

```
prisma/
├── schema.prisma            # Full data model (13 models, 6 enums)
└── migrations/
    ├── 20260312191722_init/         # Initial schema
    ├── 20260316145741_add_groups/   # Groups feature
    └── 20260317161623_add_auth_tokens/ # Auth token models
```

## Key File Locations (Quick Reference)

| What | Where |
|------|-------|
| Auth setup | `lib/auth.ts`, `lib/auth.config.ts` |
| DB client | `lib/prisma.ts` |
| Rate limiting | `lib/rate-limit.ts` |
| Email sending | `lib/email.ts` |
| Image upload | `lib/r2.ts`, `app/api/upload/route.ts` |
| Route protection | `middleware.ts` |
| Input sanitization | `lib/sanitize.ts` |
| Prayer access control | `lib/services/prayer-access.ts` |
| Data models | `prisma/schema.prisma` |
| Feed pagination | `app/actions/prayers/feed.ts` |
| Home page | `app/(app)/page.tsx` |
| Global styles | `app/globals.css` |
