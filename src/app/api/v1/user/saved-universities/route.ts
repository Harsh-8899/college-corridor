import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const saveUniversitySchema = z.object({
  institutionId: z.string().cuid(),
  status: z.enum(["INTERESTED", "SHORTLISTED", "APPLIED"])
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: { message: "Unauthorized. Student login required." } }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: { message: "User not found." } }, { status: 404 });
    }

    const shortlist = await prisma.savedInstitution.findMany({
      where: { userId: user.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            city: true,
            state: true,
            ownership: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(shortlist);
  } catch (error) {
    console.error("Failed to fetch saved universities:", error);
    return NextResponse.json({ error: { message: "Internal server error." } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: { message: "Unauthorized. Please login to save universities." } }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = saveUniversitySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { institutionId, status } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: { message: "User profile not found." } }, { status: 404 });
    }

    // Upsert the saved university state
    const saved = await prisma.savedInstitution.upsert({
      where: {
        userId_institutionId: {
          userId: user.id,
          institutionId
        }
      },
      update: {
        status
      },
      create: {
        userId: user.id,
        institutionId,
        status
      }
    });

    return NextResponse.json({
      success: true,
      data: saved
    });

  } catch (error) {
    console.error("Failed to save university interest:", error);
    return NextResponse.json({ error: { message: "Internal server error saving university." } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: { message: "Unauthorized." } }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (!institutionId) {
      return NextResponse.json({ error: { message: "Institution ID is required." } }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: { message: "User not found." } }, { status: 404 });
    }

    await prisma.savedInstitution.delete({
      where: {
        userId_institutionId: {
          userId: user.id,
          institutionId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "University removed from shortlist."
    });

  } catch (error) {
    console.error("Failed to delete saved university:", error);
    return NextResponse.json({ error: { message: "Internal server error deleting saved university." } }, { status: 500 });
  }
}
