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
- [ ] Configurar Google OAuth no Google Cloud Console
- [ ] Testar fluxo de cadastro e login
- [ ] Testar publicação de pedido anônimo (RF05)
- [ ] Testar unicidade de PrayerAction (RF10)
- [ ] Testar painel admin e toggle isHidden (RF13/RF14)
- [ ] Testar anonimização de conta (LGPD — seção 4.5 do PRD)
- [ ] Deploy na Vercel

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
