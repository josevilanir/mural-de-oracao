# STACK.md — Technology Stack

## Language & Runtime

- **Language:** TypeScript 5.x (strict mode)
- **Runtime:** Node.js (via Next.js server)
- **Package Manager:** npm

## Framework

- **Next.js 14.2.29** — App Router, Server Components, Server Actions
- **React 18** — UI rendering
- **React DOM 18** — DOM bindings

## Styling

- **Tailwind CSS 3.4** — Utility-first CSS framework
- **tailwind-merge 3.x** — Merge conflicting Tailwind classes
- **class-variance-authority 0.7** — Component variant definitions
- **clsx 2.x** — Conditional class utility
- **next-themes 0.4** — Dark/light theme switching
- **framer-motion 12.x** — Animations

## UI Components

- **Radix UI** — Headless accessible primitives:
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-select`
  - `@radix-ui/react-slot`
  - `@radix-ui/react-switch`
  - `@radix-ui/react-tooltip`
- **lucide-react 0.577** — Icon library

## Authentication

- **next-auth 5.0.0-beta.30** — Auth.js v5 (beta)
- **@auth/prisma-adapter 2.x** — Prisma adapter for Auth.js
- **bcryptjs 3.x** — Password hashing for credentials auth
- **jose 6.x** — JWT utilities

## Database & ORM

- **Prisma 7.5** — ORM + migrations
- **@prisma/adapter-neon** — Neon serverless adapter
- **@neondatabase/serverless 1.x** — Neon WebSocket driver for edge

## Form Handling & Validation

- **react-hook-form 7.x** — Form state management
- **@hookform/resolvers 5.x** — Schema resolver for RHF
- **zod 4.x** — Schema validation

## Utilities

- **date-fns 4.x** — Date formatting/manipulation
- **@upstash/ratelimit 2.x** — Rate limiting
- **@upstash/redis 1.x** — Redis client (Upstash)
- **@aws-sdk/client-s3 3.x** — S3-compatible storage (Cloudflare R2)
- **@aws-sdk/s3-presigned-post** — Presigned POST URLs
- **@aws-sdk/s3-request-presigner** — Presigned GET URLs

## Build & Tooling

- **ESLint 8** — Linting (`eslint-config-next`, `eslint-config-prettier`)
- **Prettier 3.x** — Code formatting
- **PostCSS 8** — CSS processing
- **dotenv-cli 11.x** — Env var injection for scripts

## Testing

- **Vitest 4.x** — Test runner (configured, minimal tests present)

## Configuration Files

- `next.config.js` / `next.config.ts` — Next.js config
- `tailwind.config.ts` — Tailwind configuration
- `tsconfig.json` — TypeScript config
- `prisma/schema.prisma` — Database schema
- `.env.example` — Environment variable template
- `vitest.config.ts` — Test configuration

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "postinstall": "prisma generate"
}
```
