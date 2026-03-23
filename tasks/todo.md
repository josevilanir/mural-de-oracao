# Mural de Oração — Tasks

## Status: Em Desenvolvimento

## ✅ Concluído

- [x] Inicialização do projeto Next.js 14 + TypeScript + Tailwind
- [x] Dependências instaladas (Prisma, NextAuth v5, Zod, Radix UI, etc.)
- [x] Tailwind configurado com design tokens do Design Doc
- [x] Prisma schema completo (User, Prayer, PrayerAction, Comment, Notification, Report)
- [x] NextAuth v5 configurado (Google OAuth + Credentials)
- [x] lib/utils.ts — cn(), sanitizePrayer(), formatRelativeDate(), etc.
- [x] lib/prisma.ts — Singleton
- [x] Zod schemas (prayer.ts, user.ts)
- [x] Componentes UI (Button, Badge, Skeleton, Dialog)
- [x] Componentes de layout (Header, FilterBar)
- [x] Componentes de pedido (PrayerCard, PrayerCardSkeleton, PrayButtonClient, NewPrayerForm)
- [x] Componentes admin (AdminToggle)
- [x] Server Actions: create, pray, resolve, delete (prayers), register, deleteAccount (user), moderation (admin), comment
- [x] API Route: NextAuth handler
- [x] Páginas: Home/Feed, Meus Pedidos, Detalhes do Pedido, Novo Pedido, Admin, Resolver Pedido
- [x] Páginas de Auth: Login, Register
- [x] Middleware de proteção de rotas
- [x] Implementação de Seção de Testemunhos na Home
- [x] Implementação do formulário de Comentários
- [x] Adicionado verseReference ao modelo e UI

## 🔲 Próximos Passos (Dev/Infra)

- [x] Configurar banco de dados Neon e adicionar DATABASE_URL no .env.local
- [x] Rodar `npx prisma migrate dev --name init` para criar as tabelas
- [x] Bug corrigido: botão "Editar" removido (rota inexistente, não é MVP CA)
- [ ] Configurar Google OAuth no Google Cloud Console (CA01)
  - Callback URL: `http://localhost:3000/api/auth/callback/google` (dev)
  - Callback URL: `https://<seu-dominio>/api/auth/callback/google` (prod)
  - Variáveis: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET em .env.local
- [ ] Testar fluxo de cadastro e login
- [ ] Testar publicação de pedido anônimo (RF05 / CA02)
- [ ] Testar unicidade de PrayerAction — duplo clique retorna 409 (RF10 / CA04)
- [ ] Testar painel admin e toggle isHidden (RF13/RF14 / CA06)
- [ ] Testar anonimização de conta (LGPD / CA07)
- [ ] Verificar layout mobile em 375px (CA08)
- [ ] Deploy na Vercel

## ✅ Recém Concluído

- [x] Reatividade em tempo real (polling + banner de novos pedidos)
  - [x] `feed.ts` — parâmetro `newerThan` para buscar itens mais recentes
  - [x] `FeedLoadMore.tsx` — polling 30s + banner "X novos pedidos"
  - [x] `AutoRefresh.tsx` — componente client genérico com visibility check
  - [x] `NotificationBell.tsx` — visibility check + intervalo 15s
  - [x] `grupos/page.tsx` — AutoRefresh
  - [x] `meus-pedidos/page.tsx` — AutoRefresh

## Critérios de Aceitação MVP

Referência: PRD v1.1 Seção 7

- [ ] CA01 — Google OAuth funciona em aba anônima
- [ ] CA02 — Pedido anônimo: authorId null na API
- [ ] CA03 — 'Orei por você' incrementa contador
- [ ] CA04 — Duplo clique retorna 409
- [ ] CA05 — Marcar como Respondido com testemunho
- [ ] CA06 — Admin oculta pedido com isHidden
- [ ] CA07 — Exclusão de conta anonimiza dados
- [ ] CA08 — Interface mobile-friendly (375px)
