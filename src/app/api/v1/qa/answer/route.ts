import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let questionId = "";
    let body = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      questionId = formData.get("questionId") as string;
      body = formData.get("body") as string;
    } else {
      const json = await request.json();
      questionId = json.questionId;
      body = json.body;
    }

    if (!questionId || !body) {
      return NextResponse.json(
        { error: { message: "Question ID and answer text are required." } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email },
      include: { role: true }
    });

    // Auto-approve answer if from staff or partners
    const isStaffOrPartner = ["ADMIN", "SUPER_ADMIN", "COUNSELOR", "UNIVERSITY_PARTNER"].includes(user.role?.name || "");
    const isApproved = isStaffOrPartner;

    await prisma.answer.create({
      data: {
        questionId,
        userId: user.id,
        body,
        isApproved
      }
    });

    if (!isApproved) {
      // Notify administrators of pending answer
      const adminRole = await prisma.role.findUnique({
        where: { name: "ADMIN" }
      });

      if (adminRole) {
        await prisma.notification.create({
          data: {
            roleId: adminRole.id,
            title: "New reply pending approval",
            body: `A student answer needs moderation.`,
            href: "/admin/qa"
          }
        });
      }
    }

    // Redirect to community page
    return NextResponse.redirect(new URL("/community?answered=1", request.url), 303);
  } catch (error) {
    console.error("Failed to create answer:", error);
    return NextResponse.json(
      { error: { message: "Internal server error occurred." } },
      { status: 500 }
    );
  }
}
