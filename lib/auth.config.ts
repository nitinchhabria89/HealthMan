import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no bcrypt/Node APIs) — used by middleware.
// Credentials provider is added in auth.ts for the Node runtime.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: "owner" | "readonly" }).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "owner" | "readonly";
      }
      return session;
    },
  },
};
