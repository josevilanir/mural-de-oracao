# Structure

## Root Directory Layout

```
mural-de-oracao/
├── app/                        # Next.js App Router
├── components/                 # React components
├── lib/                        # Core utilities and integrations
├── prisma/                     # Database schema
├── schemas/                    # Zod validation schemas
├── types/                      # TypeScript type declarations
├── tests/                      # Test suites
├── public/                     # Static assets
├── middleware.ts               # Edge middleware (auth + CSRF)
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind design tokens
├── vitest.config.ts            # Test runner config
├── prisma.config.ts            # Prisma datasource config
├── tsconfig.json               # TypeScript (strict, @/* alias)
├── .eslintrc.json              # ESLint rules
├── postcss.config.mjs          # PostCSS (Tailwind)
├── CLAUDE.md                   # AI assistant context
├── README.md                   # Project documentation
└── LOCAL_DEV_GUIDE.md          # Local development setup
```

## `/app` — Routes & Server Logic

```
app/
├── (app)/                      # Route group — shared layout with sidebar
│   ├── layout.tsx              # Sidebar + header layout
│   ├── page.tsx                # Home / landing page
│   ├── loading.tsx             # Suspense loading state
│   ├── error.tsx               # Error boundary
│   ├── mural/page.tsx          # Public prayer wall
│   ├── meus-pedidos/page.tsx   # User's own prayers (protected)
│   ├── novo-pedido/page.tsx    # Create prayer form (protected)
│   ├── pedido/[id]/
│   │   ├── page.tsx            # Prayer detail view
│   │   └── resolver/page.tsx   # Mark prayer as answered (testimony)
│   ├── grupos/
│   │   ├── page.tsx            # Groups listing
│   │   ├── novo/page.tsx       # Create group form
│   │   └── [id]/
│   │       ├── page.tsx        # Group detail
│   │       └── gerenciar/
│   │           ├── page.tsx    # Group management (leader)
│   │           └── PrayerRemovalForm.tsx
│   └── admin/
│       ├── page.tsx            # Admin dashboard
│       ├── prayers/page.tsx    # Prayer moderation
│       ├── grupos/page.tsx     # Group moderation
│       └── remocoes/page.tsx   # Removal request management
├── actions/                    # Server Actions
│   ├── prayers/
│   │   ├── create.ts           # Create prayer request
│   │   ├── delete.ts           # Delete prayer
│   │   ├── feed.ts             # Fetch prayer feed
│   │   ├── pray.ts             # Toggle "praying" action
│   │   ├── resolve.ts          # Mark prayer as answered
│   │   └── comment.ts          # Add comment
│   ├── user/
│   │   ├── register.ts         # User registration
│   │   ├── deleteAccount.ts    # Account deletion (LGPD)
│   │   ├── password-reset.ts   # Password reset flow
│   │   └── verify-email.ts     # Email verification
│   ├── admin/moderation.ts     # Admin moderation actions
│   └── groups/index.ts         # Group CRUD + member management
├── api/
│   ├── auth/[...nextauth]/     # NextAuth route handler
│   ├── notifications/          # Notification API
│   ├── groups/                 # Group API routes
│   └── upload/                 # R2 presigned URL generation
├── login/                      # Login page
├── register/                   # Registration page
├── welcome/                    # Welcome/onboarding page
├── forgot-password/            # Password reset request
├── reset-password/             # Password reset form
├── verify-email/               # Email verification landing
├── layout.tsx                  # Root layout (ThemeProvider)
├── globals.css                 # CSS variables + Tailwind directives
├── global-error.tsx            # Global error boundary
├── not-found.tsx               # 404 page
└── favicon.ico
```

## `/components` — UI Components

```
components/
├── layout/
│   ├── AppSidebar.tsx          # Main sidebar (server part)
│   ├── AppSidebarClient.tsx    # Sidebar (client interactivity)
│   ├── FilterBar.tsx           # Category/status filter bar
│   ├── Header.tsx              # Page header
│   ├── NotificationBell.tsx    # Notification dropdown
│   └── UserAccountNav.tsx      # User avatar + menu
├── prayers/
│   ├── PrayerCard.tsx          # Prayer request card
│   ├── PrayerCardSkeleton.tsx  # Loading skeleton
│   ├── PrayerRequestsSection.tsx # Section wrapper
│   ├── NewPrayerForm.tsx       # Create prayer form
│   ├── CommentForm.tsx         # Add comment form
│   ├── PrayButtonClient.tsx    # "I'm praying" button
│   ├── DeleteButtons.tsx       # Delete prayer/comment
│   ├── FeedLoadMore.tsx        # Infinite scroll loader
│   └── ShareButton.tsx         # Share prayer link
├── groups/
│   ├── GroupCard.tsx            # Group card display
│   └── DeleteGroupButton.tsx   # Delete group button
├── admin/
│   └── AdminToggle.tsx         # Admin moderation toggle
├── providers/
│   └── ThemeProvider.tsx       # next-themes wrapper
├── shared/
│   ├── AutoRefresh.tsx         # Auto-refresh component
│   └── EmptyState.tsx          # Empty state placeholder
└── ui/                         # Shadcn UI primitives
    ├── button.tsx
    ├── dialog.tsx
    ├── badge.tsx
    ├── skeleton.tsx
    ├── sidebar.tsx
    ├── prayer-request-column.tsx
    └── ThemeToggle.tsx
```

## `/lib` — Core Utilities

```
lib/
├── auth.ts                     # NextAuth config (providers + adapter)
├── auth.config.ts              # Edge-safe auth config (JWT callbacks)
├── prisma.ts                   # PrismaClient singleton (Neon adapter)
├── r2.ts                       # Cloudflare R2 / S3 client
├── rate-limit.ts               # Upstash rate limiters
├── email.ts                    # Brevo email sender + templates
├── sanitize.ts                 # XSS input sanitization
├── utils.ts                    # cn(), formatRelativeDate(), sanitizePrayer(), domain labels
├── email.test.ts               # Email module tests
├── mock-prayer-requests.ts     # Mock data for testing
└── services/
    └── prayer-access.ts        # Prayer visibility access control
```

## `/schemas` — Validation

```
schemas/
├── prayer.ts                   # CreatePrayerSchema, UpdatePrayerSchema, ResolveTestimonySchema, CreateCommentSchema
└── user.ts                     # RegisterSchema, LoginSchema
```

## `/types` — Type Declarations

```
types/
├── next-auth.d.ts              # NextAuth session/JWT type augmentation (id + role)
├── prayer.ts                   # Category, PrayerStatus type aliases
└── prisma.ts                   # Local Prisma type aliases (pre-generate compatibility)
```

## Key File Locations
| Need | File |
|------|------|
| Auth setup | `lib/auth.ts` + `lib/auth.config.ts` |
| DB client | `lib/prisma.ts` |
| DB schema | `prisma/schema.prisma` |
| Middleware | `middleware.ts` |
| Design tokens | `app/globals.css` |
| Tailwind config | `tailwind.config.ts` |
| Root layout | `app/layout.tsx` |
| App layout (sidebar) | `app/(app)/layout.tsx` |
| Zod schemas | `schemas/prayer.ts`, `schemas/user.ts` |
