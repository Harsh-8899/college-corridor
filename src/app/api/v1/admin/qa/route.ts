import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json(
      { error: { message: "Unauthorized. Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { error: { message: "Missing id or type parameters." } },
        { status: 400 }
      );
    }

    if (type === "question") {
      await prisma.question.update({
        where: { id },
        data: { isApproved: true }
      });
    } else if (type === "answer") {
      await prisma.answer.update({
        where: { id },
        data: { isApproved: true }
      });
    } else {
      return NextResponse.json(
        { error: { message: "Invalid type parameter. Must be 'question' or 'answer'." } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to approve Q&A item:", error);
    return NextResponse.json(
      { error: { message: "Failed to approve. Check database logs." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role || "")) {
    return NextResponse.json(
      { error: { message: "Unauthorized. Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { error: { message: "Missing id or type parameters." } },
        { status: 400 }
      );
    }

    if (type === "question") {
      await prisma.question.delete({
        where: { id }
      });
    } else if (type === "answer") {
      await prisma.answer.delete({
        where: { id }
      });
    } else {
      return NextResponse.json(
        { error: { message: "Invalid type parameter. Must be 'question' or 'answer'." } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reject Q&A item:", error);
    return NextResponse.json(
      { error: { message: "Failed to delete item." } },
      { status: 500 }
    );
  }
}
