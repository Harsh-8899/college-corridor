// Mock Prisma and PrismaAdapter first to ensure they are registered before authOptions is imported
jest.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: jest.fn(),
}));

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  },
}));

import { authorizeCredentials } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

describe("NextAuth Options Security Guard Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("CredentialsProvider throws error for BLOCKED accounts", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "blocked-user",
      email: "blocked@collegecorridor.in",
      password: bcrypt.hashSync("password123", 10),
      status: "BLOCKED",
      role: { name: "STUDENT" },
    });

    await expect(
      authorizeCredentials({ email: "blocked@collegecorridor.in", password: "password123" })
    ).rejects.toThrow("Your account has been blocked or suspended");
  });

  test("CredentialsProvider throws error for SUSPENDED accounts", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "suspended-user",
      email: "suspended@collegecorridor.in",
      password: bcrypt.hashSync("password123", 10),
      status: "SUSPENDED",
      role: { name: "STUDENT" },
    });

    await expect(
      authorizeCredentials({ email: "suspended@collegecorridor.in", password: "password123" })
    ).rejects.toThrow("Your account has been blocked or suspended");
  });

  test("CredentialsProvider allows active account logins", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "active-user",
      email: "active@collegecorridor.in",
      password: bcrypt.hashSync("password123", 10),
      status: "ACTIVE",
      role: { name: "STUDENT" },
    });

    const user = await authorizeCredentials({
      email: "active@collegecorridor.in",
      password: "password123",
    });

    expect(user).toBeDefined();
    expect(user?.id).toBe("active-user");
  });
});
