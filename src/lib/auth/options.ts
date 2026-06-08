import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const demoUsers = [
  { id: "demo-student", name: "Demo Student", email: "student@eduoofa.com", role: "STUDENT" },
  { id: "demo-counselor", name: "Demo Counselor", email: "counselor@eduoofa.com", role: "COUNSELOR" },
  { id: "demo-admin", name: "Demo Admin", email: "admin@eduoofa.com", role: "ADMIN" },
  { id: "demo-super-admin", name: "Demo Super Admin", email: "superadmin@eduoofa.com", role: "SUPER_ADMIN" }
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
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const requestedRole = credentials?.role?.toUpperCase();
        const demoUser = demoUsers.find(
          (user) => user.email === email || user.role === requestedRole
        );

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
