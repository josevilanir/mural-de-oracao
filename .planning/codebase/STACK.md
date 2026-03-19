# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.x - All application code (`.ts`, `.tsx`)

**Secondary:**
- CSS (Tailwind utility classes via `globals.css` and component class strings)

## Runtime

**Environment:**
- Node.js v22.16.0

**Package Manager:**
- npm (v10.x implied by Node 22)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.2.29 - Full-stack React framework (App Router)
- React 18.x - UI rendering
- React DOM 18.x - DOM bindings

**Animation:**
- Framer Motion 12.x - UI animations and transitions

**Testing:**
- Not detected — no test framework installed or configured

**Build/Dev:**
- Next.js built-in compiler (SWC) - TypeScript/JSX transpilation
- PostCSS 8.x - CSS processing (`postcss.config.mjs`)
- ESLint 8.x - Linting (`eslint.config.mjs` using `eslint-config-next`)
- Prettier 3.8.1 - Code formatting (no `.prettierrc` config file detected; installed as devDep with `eslint-config-prettier`)
- `dotenv-cli` 11.x - Env injection for scripts

## Key Dependencies

**Critical:**
- `next-auth` ^5.0.0-beta.30 (`@auth/prisma-adapter` ^2.11.1) - Authentication, session management
- `@prisma/client` ^7.5.0 / `prisma` ^7.5.0 - ORM and database access
- `@neondatabase/serverless` ^1.0.2 / `@prisma/adapter-neon` ^7.5.0 - Neon serverless Postgres driver
- `zod` ^4.3.6 - Schema validation (forms and server actions)
- `react-hook-form` ^7.71.2 + `@hookform/resolvers` ^5.2.2 - Form state and validation integration

**Infrastructure:**
- `@aws-sdk/client-s3` ^3.1010.0 + `@aws-sdk/s3-request-presigner` ^3.1010.0 - S3-compatible API for Cloudflare R2 uploads
- `@upstash/redis` ^1.37.0 + `@upstash/ratelimit` ^2.0.8 - Redis-backed rate limiting
- `bcryptjs` ^3.0.3 - Password hashing for credentials auth
- `jose` ^6.2.1 - JWT utilities (used in edge-compatible auth paths)

**UI Component Library:**
- `@radix-ui/react-avatar`, `react-checkbox`, `react-dialog`, `react-dropdown-menu`, `react-select`, `react-slot`, `react-switch`, `react-tooltip` - Headless UI primitives
- `lucide-react` ^0.577.0 - Icon set
- `class-variance-authority` ^0.7.1 - Component variant utilities
- `clsx` ^2.1.1 + `tailwind-merge` ^3.5.0 - Conditional className utilities

**Utilities:**
- `date-fns` ^4.1.0 - Date formatting
- `next-themes` ^0.4.6 - Dark/light theme switching
- `resend` ^6.9.4 - Email SDK (installed but email sending uses Brevo REST API directly; `resend` may be unused or planned)

## Configuration

**Environment:**
- Variables loaded from `.env` and `.env.local`
- Template documented in `.env.example`
- Key required vars: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL`, `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Build:**
- `next.config.mjs` - Next.js config (ESLint and TypeScript errors ignored during builds)
- `tsconfig.json` - TypeScript config with `@/*` path alias mapping to project root
- `tailwind.config.ts` - Custom design tokens (colors, fonts, shadows, radii)
- `prisma.config.ts` - Prisma datasource config
- `prisma/schema.prisma` - Database schema

**Path Aliases:**
- `@/*` resolves to project root (e.g., `@/lib/prisma` → `./lib/prisma`)

## Platform Requirements

**Development:**
- Node.js 22.x
- PostgreSQL-compatible database (Neon serverless recommended)
- Optional: Upstash Redis for rate limiting (gracefully disabled without env vars)

**Production:**
- Deployment target: Vercel or any Node.js-compatible platform
- Next.js middleware runs on Edge Runtime (auth config split for edge compatibility: `lib/auth.config.ts` is edge-safe, `lib/auth.ts` is Node.js only)
- Prisma uses `PrismaNeon` adapter (serverless-compatible HTTP-based Postgres driver)

---

*Stack analysis: 2026-03-19*
