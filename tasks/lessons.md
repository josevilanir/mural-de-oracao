# Lessons Learned — Mural de Oração

## Padrões de Código Obrigatórios

### L001 — sanitizePrayer() sempre obrigatória

- **Contexto:** RF05 do PRD — anonimato server-side
- **Regra:** Chamar `sanitizePrayer()` ou `sanitizePrayers()` em TODA query que retorna Prayer[]
- **Arquivo:** lib/utils.ts
- **Violação:** Nunca retornar `authorId` ou dados reais do autor quando `isAnonymous = true`

### L002 — Prisma Singleton

- **Regra:** Nunca instanciar `new PrismaClient()` diretamente. Sempre importar de `@/lib/prisma`
- **Motivo:** Evitar connection pool exhaustion em desenvolvimento (hot reload)

### L003 — Server Actions — sempre auth() primeiro

- **Regra:** Toda Server Action protegida deve chamar `const session = await auth()` antes de qualquer operação
- **Pattern:** Se não há sessão, retornar `{ success: false, error: "..." }` imediatamente

### L004 — Zod antes do banco

- **Regra:** Sempre validar com Zod.safeParse() antes de tocar o banco de dados
- **Motivo:** Evitar dados corrompidos e dar feedback claro ao usuário

### L005 — Middleware duplo para admin

- **Regra:** Verificar `role === 'ADMIN'` tanto no middleware.ts quanto dentro das Server Actions admin
- **Motivo:** Defense in depth — middleware protege a rota, action protege a operação
