import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Prisma, no Node.js-only modules)
// Used by middleware.ts which runs on the Edge Runtime
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 dias
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
