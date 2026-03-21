# Architecture

## High-Level Pattern
Mural de Oração follows a **server-first Next.js App Router architecture**. React Server Components (RSC) handle data fetching and rendering by default. Client Components are used selectively for interactivity (forms, animations, dropdowns). Data mutations flow through Next.js Server Actions.

## Layers

### 1. Presentation Layer
- **Server Components** — pages (`page.tsx`) and layouts (`layout.tsx`) fetch data directly from Prisma and render HTML on the server
- **Client Components** — explicitly marked with `"use client"`, used for:
  - Form interactions (`NewPrayerForm.tsx`, `CommentForm.tsx`)
  - Animations (`framer-motion`)
  - UI state (sidebars, dropdowns, theme toggle)
  - Real-time interactions (`PrayButtonClient.tsx`, `NotificationBell.tsx`)
- **UI primitives** — Shadcn UI pattern: unstyled Radix components wrapped with Tailwind in `components/ui/`

### 2. Application Logic Layer
- **Server Actions** (`app/actions/`) — entry point for all data mutations
  - `prayers/` — `create.ts`, `delete.ts`, `feed.ts`, `pray.ts`, `resolve.ts`, `comment.ts`
  - `user/` — `register.ts`, `deleteAccount.ts`, `password-reset.ts`, `verify-email.ts`
  - `admin/` — `moderation.ts`
  - `groups/` — `index.ts` (group CRUD, join requests, member management)
- **Services** (`lib/services/`) — reusable business logic
  - `prayer-access.ts` — access control for GROUP_ONLY vs PUBLIC prayers
- **Schemas** (`schemas/`) — Zod validation schemas shared between client forms and server actions
  - `prayer.ts` — `CreatePrayerSchema`, `UpdatePrayerSchema`, `ResolveTestimonySchema`, `CreateCommentSchema`
  - `user.ts` — `RegisterSchema`, `LoginSchema`

### 3. Edge & Middleware Layer
- **`middleware.ts`** — runs on Vercel Edge Runtime
  - **CSRF protection:** Validates `origin` header against `host` for mutation HTTP methods
  - **Route protection:** Redirects unauthenticated users from private routes to `/login`
  - **Admin enforcement:** Redirects non-ADMIN users from `/admin/*` to `/`
  - **Auth-only public:** Redirects authenticated users away from `/welcome`, `/login`, `/register`
  - Uses `auth.config.ts` (edge-safe, no Prisma imports)

### 4. Data Layer
- **Prisma ORM** — 14 models defined in `prisma/schema.prisma`

  **Core domain:**
  | Model | Purpose |
  |-------|---------|
  | `User` | Users with roles (USER/ADMIN), soft-delete (LGPD) |
  | `Prayer` | Prayer requests with category, status, visibility, anonymity |
  | `PrayerAction` | "I'm praying for you" click (unique per user+prayer) |
  | `Comment` | Encouragement comments on prayers |
  | `Notification` | In-app notification system with types |
  | `Report` | User reports on inappropriate prayers |
  | `Group` | Prayer groups with leader + members + approval flow |
  | `GroupMember` | Group membership with PENDING/ACTIVE/REJECTED status |
  | `PrayerRemovalRequest` | Group leader requests to remove a prayer |

  **Auth/Infra:**
  | Model | Purpose |
  |-------|---------|
  | `Account` | OAuth provider accounts (NextAuth) |
  | `Session` | Session tokens (NextAuth) |
  | `VerificationToken` | NextAuth verification |
  | `PasswordResetToken` | Password reset flow |
  | `EmailVerificationToken` | Email verification flow |

  **Enums:** `Role`, `Category`, `PrayerStatus`, `NotificationType`, `GroupStatus`, `GroupMemberStatus`, `PrayerVisibility`

  **Indexes:** `Prayer(groupId, createdAt)`, `Prayer(authorId, createdAt)`, `PrayerAction(prayerId, userId)`

## Data Flow Examples

### Creating a Prayer Request
```
Client (NewPrayerForm.tsx)
  → Zod validation (CreatePrayerSchema)
  → Server Action (app/actions/prayers/create.ts)
    → Session check (auth())
    → Server-side Zod re-validation
    → Rate limit check (lib/rate-limit.ts → Upstash Redis)
    → Input sanitization (lib/sanitize.ts)
    → Prisma create (insert into Prayer table)
    → revalidatePath('/mural')
  → Client receives result
```

### Authentication Flow (Google)
```
User clicks "Login com Google"
  → NextAuth Google provider redirect
  → Google OAuth consent screen
  → Callback to /api/auth/callback/google
  → PrismaAdapter creates/updates User + Account
  → JWT token generated with id + role
  → Middleware verifies JWT on subsequent requests
```

### Group Visibility Access
```
User requests /pedido/[id]
  → Server Component fetches prayer
  → canAccessPrayer(userId, prayer) (lib/services/prayer-access.ts)
    → Hidden prayers → always denied
    → PUBLIC → always allowed
    → GROUP_ONLY → check GroupMember.status === ACTIVE
```

## API Routes
- `/api/auth/[...nextauth]/` — NextAuth handlers (Google OAuth callbacks, session endpoints)
- `/api/notifications/` — Notification data endpoint
- `/api/groups/` — Group-related API routes
- `/api/upload/` — Presigned URL generation for R2 uploads
