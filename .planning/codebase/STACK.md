# Stack

## Language & Runtime
- **TypeScript** (`^5`) — strict mode enabled in `tsconfig.json`
- **Node.js** 18+ (runtime for dev server and Server Actions)
- **Edge Runtime** — used by `middleware.ts` for route protection (no Node.js APIs)

## Framework
- **Next.js 14.2.29** — App Router (`app/` directory)
  - Server Components by default
  - Server Actions in `app/actions/`
  - Route Handlers in `app/api/`
  - Edge Middleware in `middleware.ts`
  - Config: `next.config.mjs` (ESLint and TypeScript errors ignored during build)

## Styling
- **Tailwind CSS** `^3.4.1` with **PostCSS**
  - Dark mode: `class` strategy via `next-themes`
  - Custom design tokens defined as CSS variables in `app/globals.css` (RGB channels)
  - Custom color palette: `cream`, `navy`, `blue-main`, `gold-warm`, etc.
  - Custom fonts: `Lora` (display/serif), `Nunito Sans` (body/sans), `JetBrains Mono` (mono) — loaded from Google Fonts
  - Configured in `tailwind.config.ts`

## UI Components
- **Shadcn UI** pattern — components in `components/ui/` using Radix Primitives
  - `@radix-ui/react-avatar`, `react-checkbox`, `react-dialog`, `react-dropdown-menu`, `react-select`, `react-slot`, `react-switch`, `react-tooltip`
- **Framer Motion** `^12.36.0` — animations
- **Lucide React** `^0.577.0` — icons
- **class-variance-authority** `^0.7.1`, **clsx** `^2.1.1`, **tailwind-merge** `^3.5.0` — class utilities

## Database
- **PostgreSQL** via **Neon Serverless** (`@neondatabase/serverless ^1.0.2`)
- **Prisma** `^7.5.0` — ORM, uses Neon adapter (`@prisma/adapter-neon ^7.5.0`)
  - `prisma.config.ts` defines schema path and datasource URL
  - `postinstall` script runs `prisma generate`
  - Singleton client in `lib/prisma.ts` (dev logging: query, error, warn)

## Authentication
- **Auth.js / NextAuth v5** (`next-auth ^5.0.0-beta.30`)
  - Providers: Google OAuth 2.0, Credentials (email/password)
  - `@auth/prisma-adapter ^2.11.1` for DB mapping
  - **bcryptjs** `^3.0.3` — password hashing
  - **jose** `^6.2.1` — JWT operations
  - JWT strategy, 30-day session max age

## Forms & Validation
- **React Hook Form** `^7.71.2` + **@hookform/resolvers** `^5.2.2`
- **Zod** `^4.3.6` — schema validation (shared between client and server)

## Email
- **Brevo API** (SMTP via `https://api.brevo.com/v3/smtp/email`) — transactional emails
  - `resend ^6.9.4` in `package.json` but actual implementation in `lib/email.ts` uses Brevo
  - Templates: password reset, email verification, comment notifications, group status emails

## Object Storage
- **Cloudflare R2** — uses AWS S3-compatible SDK
  - `@aws-sdk/client-s3 ^3.1010.0`, `@aws-sdk/s3-presigned-post ^3.1013.0`, `@aws-sdk/s3-request-presigner ^3.1010.0`
  - Client configured in `lib/r2.ts`

## Caching & Rate Limiting
- **Upstash Redis** (`@upstash/redis ^1.37.0`)
- **Upstash Rate Limit** (`@upstash/ratelimit ^2.0.8`)
  - Sliding window limiters per action type: pray (20/min), comment (10/min), prayer (5/hr), join (10/min)
  - Gracefully disabled in dev when Redis env vars are absent

## Date/Time
- **date-fns** `^4.1.0` — `formatDistanceToNow` with `ptBR` locale

## Security
- **html-escaper** `^3.0.3` — escaping user input in email templates
- Custom `sanitizeUserInput()` in `lib/sanitize.ts` for stored XSS prevention

## Theme
- **next-themes** `^0.4.6` — system/light/dark toggle wrapped in `ThemeProvider`

## Testing
- **Vitest** `^4.1.0` — test runner, `vitest.config.ts` resolves `@/` alias

## Dev Tooling
- **ESLint** `^8` with `eslint-config-next 14.2.29` + `eslint-config-prettier ^10.1.8`
  - Rule: `@typescript-eslint/no-explicit-any: error`
- **Prettier** `^3.8.1`
- **dotenv-cli** `^11.0.0` — for loading env in scripts

## Path Aliases
- `@/*` → project root (configured in `tsconfig.json` `paths`)

## Deployment
- **Vercel** — automatic deploys on `master` branch push
  - Remote images allowed from `lh3.googleusercontent.com` (Google profile avatars)
