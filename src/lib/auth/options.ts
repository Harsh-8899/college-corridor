import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const demoUsers = [
  { id: "demo-student", name: "Demo Student", email: "student@collegecorridor.com", role: "STUDENT" },
  { id: "demo-counselor", name: "Demo Counselor", email: "counselor@collegecorridor.com", role: "COUNSELOR" },
  { id: "demo-crm", name: "Demo CRM Executive", email: "crm@collegecorridor.com", role: "CRM_EXECUTIVE" },
  { id: "demo-admin", name: "Demo Admin", email: "admin@collegecorridor.com", role: "ADMIN" }
];

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Demo login",
      credentials: {
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const demoUser = demoUsers.find((user) => user.email === email);

        if (!demoUser) {
          return null;
        }

        return demoUser;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  }
};
