import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Must be logged in (Admin, Editor, Counselor, Student)
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: { message: "Unauthorized." } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch user with password from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: { message: "User not found or using OAuth." } },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: { message: "Incorrect current password." } },
        { status: 400 }
      );
    }

    // Hash and update new password
    const newHashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: { email: user.email },
      data: { password: newHashedPassword }
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Failed to change password:", error);
    return NextResponse.json(
      { error: { message: "Failed to change password." } },
      { status: 500 }
    );
  }
}
