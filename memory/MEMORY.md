# Mural de Oração — Memória do Projeto

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI
- Prisma v7 + Neon PostgreSQL (serverless via `@prisma/adapter-neon`)
- NextAuth v5 beta (JWT strategy) + Google OAuth + Credentials
- Zod v4, bcryptjs, date-fns

## Arquivos-chave
- `prisma/schema.prisma` — modelos completos (sem `url` no datasource — Prisma v7 usa `prisma.config.ts`)
- `prisma.config.ts` — datasource url via `process.env.DATABASE_URL`
- `lib/prisma.ts` — singleton com PrismaNeon adapter
- `lib/auth.ts` — NextAuth config (JWT, Google + Credentials)
- `lib/utils.ts` — `sanitizePrayer()`, `sanitizePrayers()`, `CATEGORY_LABELS`, `STATUS_LABELS`
- `middleware.ts` — protege `/meus-pedidos`, `/novo-pedido`, `/admin`

## Padrões Críticos (ver tasks/lessons.md)
- `sanitizePrayers()` obrigatória em TODA query que retorna Prayer[]
- Admin page NÃO sanitiza (mostra dados reais para moderação)
- `isOwner` no detail page usa `prayer.authorId` NÃO sanitizado (correto)
- Server Actions: sempre `auth()` primeiro, depois Zod, depois DB

## Status do MVP (2026-03-12)
- Código completo e revisado — sem bugs críticos
- Único bug corrigido: botão "Editar" removido (rota não existe)
- Pendente: Google OAuth no Google Cloud Console + testes manuais + deploy Vercel
