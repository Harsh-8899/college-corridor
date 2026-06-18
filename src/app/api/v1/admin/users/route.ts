import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "COUNSELOR", "CRM", "EDITOR", "FINANCE", "STUDENT", "UNIVERSITY_PARTNER"])
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json(
      { error: { message: "Unauthorized. Admin or Super Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        fullName: true,
        email: true,
        phone: true,
        phoneVerified: true,
        city: true,
        state: true,
        status: true,
        role: { select: { name: true } },
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json(
      { error: { message: "Failed to fetch users" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json(
      { error: { message: "Unauthorized. Admin or Super Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid input. Please check the fields." } },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { message: "A user with this email already exists." } },
        { status: 400 }
      );
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: { message: `Role ${role} does not exist.` } },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        roleId: roleRecord.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: { message: "Failed to create user." } },
      { status: 500 }
    );
  }
}
