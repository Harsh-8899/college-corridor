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
    let title = "";
    let body = "";
    let category = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      body = formData.get("body") as string;
      category = formData.get("category") as string;
    } else {
      const json = await request.json();
      title = json.title;
      body = json.body;
      category = json.category;
    }

    if (!title || !body || !category) {
      return NextResponse.json(
        { error: { message: "Category, title, and body are required." } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: session.user.email }
    });

    await prisma.question.create({
      data: {
        userId: user.id,
        title,
        body,
        category,
        isApproved: false // Requires moderation
      }
    });

    // Notify administrators of new question
    const adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" }
    });

    if (adminRole) {
      await prisma.notification.create({
        data: {
          roleId: adminRole.id,
          title: "New question pending approval",
          body: `Question: "${title.substring(0, 50)}..." by ${user.name || "student"} is pending review.`,
          href: "/admin/qa"
        }
      });
    }

    // Redirect to community page
    return NextResponse.redirect(new URL("/community?submitted=1", request.url), 303);
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json(
      { error: { message: "Internal server error occurred." } },
      { status: 500 }
    );
  }
}
