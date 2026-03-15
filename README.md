# Mural de Oração 🙏

O **Mural de Oração** é uma plataforma comunitária projetada para conectar pessoas através da fé e da intercessão. É um espaço digital onde usuários podem compartilhar pedidos de oração, interceder uns pelos outros e celebrar testemunhos de graças alcançadas.

## ✨ Funcionalidades

- **📝 Pedidos de Oração:** Publique suas necessidades de forma pública ou anônima.
- **🙏 Intercessão em Tempo Real:** Clique para avisar que você está orando por um pedido específico.
- **💬 Comentários de Apoio:** Deixe palavras de encorajamento para outros membros da comunidade.
- **✨ Testemunhos:** Quando uma oração for respondida, compartilhe sua vitória para inspirar outros.
- **🛡️ Moderação e Segurança:** Sistema de denúncias e ferramentas administrativas para manter um ambiente respeitoso.
- **📱 Interface Responsiva:** Design moderno e otimizado para dispositivos móveis e desktop.

## 🚀 Tecnologias

Este projeto foi construído com as tecnologias mais modernas do ecossistema Web:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **Autenticação:** [Auth.js (NextAuth.js)](https://authjs.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)

## 🛠️ Como Iniciar

### Pré-requisitos

- Node.js 18+ instalado.
- Um banco de Dados PostgreSQL (recomendamos o Neon para setup rápido).

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/josevilanir/mural-de-oracao.git
   cd mural-de-oracao
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` na raiz do projeto (use o `.env.example` como base).
   ```bash
   DATABASE_URL="sua_url_do_postgresql"
   AUTH_SECRET="seu_segredo_aleatorio"
   GOOGLE_CLIENT_ID="seu_id_do_google"
   GOOGLE_CLIENT_SECRET="seu_segredo_do_google"
   ```

4. Prepare o banco de dados:
   ```bash
   npx prisma db push
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

- `/app`: Rotas e lógica da aplicação (Next.js App Router).
- `/components`: Componentes reutilizáveis da interface.
- `/lib`: Configurações de bibliotecas (Prisma, Auth, utilitários).
- `/prisma`: Esquema do banco de dados e definições de modelos.
- `/public`: Ativos estáticos (imagens, favicons).
- `/types`: Definições globais de tipos TypeScript.

## 📖 Desenvolvimento

- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npx prisma studio`: Abre uma interface visual para gerenciar o banco de dados.
- `npm run build`: Cria a versão de produção.

---
Desenvolvido com ❤️ para fortalecer a fé em comunidade.
