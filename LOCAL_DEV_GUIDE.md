# Guia de Desenvolvimento Local - Mural de Oração

Este arquivo fornece instruções rápidas para validar seu ambiente de desenvolvimento local.

## Pré-requisitos
- Node.js instalado.
- Banco de Dados (PostgreSQL) acessível ou as credenciais do Neon configuradas no arquivo `.env`.

## Como Validar o Ambiente
1. **Verifique se o Servidor está Rodando**:
   - O servidor deve estar acessível em [http://localhost:3000](http://localhost:3000).
   - Você deve ver a página inicial (Mural de Oração).

2. **Banco de Dados (Prisma)**:
   - Se você configurou um banco de dados local no `.env`, execute:
     ```bash
     npx prisma db push
     ```
     para garantir que o esquema está sincronizado.
   - Para visualizar os dados, use o Prisma Studio:
     ```bash
     npx prisma studio
     ```

3. **Autenticação**:
   - Para testar o login com Google, você precisará configurar as credenciais no [Google Cloud Console](https://console.cloud.google.com) e atualizar o `.env`.
   - Lembre-se de adicionar `http://localhost:3000/api/auth/callback/google` como uma URI de redirecionamento autorizada.

## Comandos Úteis
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npx prisma generate`: Atualiza o cliente Prisma após mudanças no `schema.prisma`.
- `npx prisma db push`: Sincroniza o banco de dados sem migrações (ideal para dev rápido).

---
*Este é um ambiente isolado na branch `local-development`.*
