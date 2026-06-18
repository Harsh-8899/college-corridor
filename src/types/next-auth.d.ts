import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      fullName?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      id?: string;
      phone?: string | null;
      phoneVerified?: boolean;
      city?: string | null;
      state?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    phone?: string | null;
    phoneVerified?: boolean;
    fullName?: string | null;
    city?: string | null;
    state?: string | null;
  }
}

