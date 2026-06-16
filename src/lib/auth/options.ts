import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// Ensure initial admin logic is available via env vars
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@collegecorridor.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";


export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "STUDENT" // Default role string placeholder for adapter
        };
      }
    }),
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        // Special case: Initial Admin Setup via ENV vars
        if (email === ADMIN_EMAIL.toLowerCase()) {
          let adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
          if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: "ADMIN", description: "Admin with full access" } });
          }

          let admin = await prisma.user.findUnique({ 
            where: { email },
            include: { role: true }
          });
          
          if (!admin) {
            // Auto-create initial admin if it doesn't exist
            admin = await prisma.user.create({
              data: {
                name: "System Admin",
                email: email,
                password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
                roleId: adminRole.id
              },
              include: { role: true }
            });
          }

          const isValid = bcrypt.compareSync(password, admin.password || "");
          if (isValid) {
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              image: admin.image,
              role: admin.role?.name || "ADMIN"
            };
          }
        }

        // Standard DB lookup
        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true }
        });

        if (!user || !user.password) {
          return null; // User not found or signed up via Google only
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role?.name || "STUDENT"
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Ensure student role is linked in the database for Google signins
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { role: true }
        });

        if (dbUser && !dbUser.roleId) {
          let studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });
          if (!studentRole) {
            studentRole = await prisma.role.create({ data: { name: "STUDENT", description: "Default student role" } });
          }
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { roleId: studentRole.id }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "STUDENT";
      }
      
      // Allow updating session data
      if (trigger === "update" && session?.role) {
         token.role = session.role;
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
