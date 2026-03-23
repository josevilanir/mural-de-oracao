<div align="center">

# 🙏 Mural de Oração

**Uma plataforma comunitária de fé e intercessão, construída com tecnologias modernas.**

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[Demonstração ao Vivo](#-deploy) · [Funcionalidades](#-funcionalidades) · [Tech Stack](#-tech-stack) · [Como Rodar](#-como-rodar-localmente)

</div>

---

## 📌 Sobre o Projeto

O **Mural de Oração** é um espaço digital onde pessoas podem compartilhar pedidos de oração, interceder umas pelas outras e celebrar testemunhos de orações respondidas. Projetado para ser acolhedor, seguro e responsivo, conecta uma comunidade em torno da fé.

A aplicação conta com **autenticação completa via Google OAuth 2.0** e credenciais (e-mail/senha), sistema de notificações em tempo real, moderação administrativa e uma interface elegante com animações.

---

## ✨ Funcionalidades

| Funcionalidade                       | Descrição                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| 🔐 **Autenticação Google OAuth 2.0** | Login com conta Google integrado via Auth.js (NextAuth v5), com sessão JWT segura. |
| 📧 **Login com Credenciais**         | Cadastro e login por e-mail e senha, com hash bcrypt.                              |
| 📝 **Pedidos de Oração**             | Publique pedidos de forma pública ou anônima, categorizados por tema.              |
| 🙏 **Intercessão**                   | Clique para registrar que está orando — o autor é notificado em tempo real.        |
| 💬 **Comentários de Apoio**          | Deixe palavras de encorajamento nos pedidos da comunidade.                         |
| ✅ **Testemunhos**                   | Marque orações como respondidas e compartilhe sua vitória.                         |
| 🔔 **Notificações**                  | Sistema de notificações para interações recebidas nos seus pedidos.                |
| 🛡️ **Moderação & Admin**             | Painel administrativo com sistema de denúncias e ocultação de conteúdo.            |
| 🎨 **UI Premium**                    | Interface responsiva com Shadcn UI, Framer Motion e sidebar colapsável.            |
| 🔒 **Middleware de Rotas**           | Proteção de rotas privadas e administrativas via Edge Middleware.                  |

---

## 🔐 Autenticação

A autenticação é um pilar central do projeto, implementada com **Auth.js (NextAuth.js v5)** e totalmente funcional:

- **Google OAuth 2.0** — Login com um clique usando conta Google, configurado via Google Cloud Console.
- **Credenciais (E-mail/Senha)** — Cadastro com hash seguro via `bcryptjs`, validação com Zod.
- **Sessão JWT** — Estratégia stateless com tokens JWT, compatível com Edge Runtime.
- **PrismaAdapter** — Mapeamento automático de contas OAuth para o banco de dados PostgreSQL.
- **Middleware de proteção** — Rotas privadas (`/meus-pedidos`, `/novo-pedido`) e administrativas (`/admin`) protegidas no edge.
- **RBAC (Role-Based Access Control)** — Papéis `USER` e `ADMIN` definidos no schema Prisma e propagados via JWT.

```
Fluxo de Autenticação Google:
┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│  Usuário │───▶│  /login page │───▶│ Google OAuth  │───▶│ Callback │
└──────────┘    └──────────────┘    └──────────────┘    └────┬─────┘
                                                             │
                                                    ┌───────▼────────┐
                                                    │ PrismaAdapter  │
                                                    │  (cria/atualiza│
                                                    │   User + Acct) │
                                                    └───────┬────────┘
                                                             │
                                                    ┌───────▼────────┐
                                                    │  JWT Session   │
                                                    │  (id + role)   │
                                                    └────────────────┘
```

---

## 🛠 Tech Stack

| Camada             | Tecnologia                                                                            |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 14](https://nextjs.org/) (App Router, Server Actions)                        |
| **Linguagem**      | [TypeScript](https://www.typescriptlang.org/)                                         |
| **Estilização**    | [Tailwind CSS](https://tailwindcss.com/)                                              |
| **Componentes UI** | [Shadcn UI](https://ui.shadcn.com/) + [Radix Primitives](https://www.radix-ui.com/)   |
| **Animações**      | [Framer Motion](https://www.framer.com/motion/)                                       |
| **Autenticação**   | [Auth.js / NextAuth v5](https://authjs.dev/) (Google OAuth + Credentials)             |
| **ORM**            | [Prisma](https://www.prisma.io/) v7                                                   |
| **Banco de Dados** | [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) (Serverless) |
| **Validação**      | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)             |
| **Deploy**         | [Vercel](https://vercel.com/)                                                         |
| **Ícones**         | [Lucide React](https://lucide.dev/)                                                   |

---

## 📁 Estrutura do Projeto

```
mural-de-oracao/
├── app/
│   ├── (rotas)
│   │   ├── login/              # Página de login (Google + Credenciais)
│   │   ├── register/           # Cadastro com e-mail/senha
│   │   ├── welcome/            # Página de boas-vindas
│   │   ├── mural/              # Mural público de orações
│   │   ├── meus-pedidos/       # Pedidos do usuário (rota protegida)
│   │   ├── novo-pedido/        # Criar novo pedido (rota protegida)
│   │   ├── pedido/[id]/        # Detalhe de um pedido
│   │   └── admin/              # Painel de moderação (rota admin)
│   ├── actions/                # Server Actions (prayers, admin, user)
│   ├── api/
│   │   ├── auth/[...nextauth]/ # Handlers do NextAuth (Google + Credentials)
│   │   └── notifications/      # API de notificações
│   └── layout.tsx              # Layout raiz com providers
├── components/
│   ├── layout/                 # AppSidebar, NotificationBell
│   ├── prayers/                # PrayerCard, PrayerRequestColumn
│   └── ui/                     # Componentes Shadcn UI
├── lib/
│   ├── auth.ts                 # Configuração NextAuth (providers, adapter)
│   ├── auth.config.ts          # Config edge-compatible (JWT callbacks)
│   ├── prisma.ts               # Singleton do PrismaClient (Neon adapter)
│   └── utils.ts                # Utilitários gerais
├── prisma/
│   └── schema.prisma           # Schema do banco (User, Prayer, Comment...)
├── middleware.ts                # Proteção de rotas (Edge Runtime)
├── types/                      # Tipos TypeScript globais
└── schemas/                    # Schemas de validação Zod
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Node.js** 18+
- **PostgreSQL** (recomendamos [Neon](https://neon.tech/) para setup rápido)
- **Google Cloud Console** com OAuth 2.0 configurado

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/josevilanir/mural-de-oracao.git
cd mural-de-oracao

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
```

Edite o `.env.local` com suas credenciais:

```env
# Banco de Dados (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth
AUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth 2.0 (https://console.cloud.google.com)
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-seu-client-secret"
```

```bash
# 4. Sincronize o banco de dados
npx prisma db push

# 5. Inicie o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

### Scripts Úteis

| Comando              | Descrição                              |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Inicia o servidor de desenvolvimento   |
| `npm run build`      | Gera o build de produção               |
| `npx prisma studio`  | Interface visual para o banco de dados |
| `npx prisma db push` | Sincroniza o schema com o banco        |

---

## ☁️ Deploy

O projeto está configurado para deploy automático na **Vercel**. A cada push na branch `master`, um novo deploy é disparado automaticamente.

As variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) devem ser configuradas no painel da Vercel em **Settings → Environment Variables**.

---

## 📄 Licença

Este projeto é de uso pessoal e educacional.

---

<div align="center">

Desenvolvido com ❤️ por **José Vilanir** — fortalecendo a fé em comunidade.

</div>
