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
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        return authorizeCredentials(credentials as any);
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

        if (dbUser) {
          if (["BLOCKED", "SUSPENDED", "DELETED"].includes(dbUser.status)) {
            return false;
          }
          
          if (!dbUser.roleId) {
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
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "STUDENT";
        token.phone = (user as any).phone || null;
        token.phoneVerified = (user as any).phoneVerified || false;
        token.fullName = (user as any).fullName || null;
        token.city = (user as any).city || null;
        token.state = (user as any).state || null;
      }
      
      // Allow updating session data
      if (trigger === "update" && session) {
         if (session.role) token.role = session.role;
         if (session.phoneVerified !== undefined) token.phoneVerified = session.phoneVerified;
         if (session.phone) token.phone = session.phone;
         if (session.fullName !== undefined) token.fullName = session.fullName;
         if (session.city !== undefined) token.city = session.city;
         if (session.state !== undefined) token.state = session.state;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phone = token.phone as string | null;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.fullName = token.fullName as string | null;
        session.user.city = token.city as string | null;
        session.user.state = token.state as string | null;
      }
      return session;
    }
  }
};

export async function authorizeCredentials(credentials: Record<string, string> | undefined) {
  const email = credentials?.email?.toLowerCase().trim();
  const password = credentials?.password;
  const otp = credentials?.otp;

  if (!email) {
    return null;
  }

  // 1. Check if OTP is provided for Login
  if (otp) {
    const record = await prisma.emailOTP.findFirst({
      where: {
        email: email,
        status: "PENDING"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!record) {
      return null;
    }

    if (new Date() > record.expiresAt) {
      await prisma.emailOTP.update({
        where: { id: record.id },
        data: { status: "EXPIRED" }
      });
      return null;
    }

    if (record.attempts >= 3) {
      await prisma.emailOTP.update({
        where: { id: record.id },
        data: { status: "FAILED" }
      });
      return null;
    }

    if (record.otp !== otp) {
      await prisma.emailOTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      return null;
    }

    // Mark verified
    await prisma.emailOTP.update({
      where: { id: record.id },
      data: { status: "VERIFIED" }
    });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) return null;

    if (["BLOCKED", "SUSPENDED", "DELETED"].includes(user.status)) {
      throw new Error("Your account has been blocked or suspended. Please contact support.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role?.name || "STUDENT",
      fullName: user.fullName || null,
      phone: user.phone || null,
      phoneVerified: user.phoneVerified || false,
      city: user.city || null,
      state: user.state || null
    };
  }

  // 2. Fall back to standard password evaluation
  if (!password) {
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
        role: admin.role?.name || "ADMIN",
        fullName: admin.fullName || null,
        phone: admin.phone || null,
        phoneVerified: admin.phoneVerified || false,
        city: admin.city || null,
        state: admin.state || null
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

  if (["BLOCKED", "SUSPENDED", "DELETED"].includes(user.status)) {
    throw new Error("Your account has been blocked or suspended. Please contact support.");
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
    role: user.role?.name || "STUDENT",
    fullName: user.fullName || null,
    phone: user.phone || null,
    phoneVerified: user.phoneVerified || false,
    city: user.city || null,
    state: user.state || null
  };
}
