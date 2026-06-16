import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth/options";
import { getCollegeById, updateCollege, deleteCollege } from "@/lib/data/colleges";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN", "EDITOR", "COUNSELOR", "CRM"].includes(session.user?.role as string)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Internal access required." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const college = await getCollegeById(id);
  if (!college) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "College not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: college, error: null });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN", "EDITOR"].includes(session.user?.role as string)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    // Ensure arrays for courses and modes
    if (typeof body.courses === "string") {
      body.courses = body.courses.split(",").map((c: string) => c.trim()).filter(Boolean);
    }
    if (typeof body.modes === "string") {
      body.modes = body.modes.split(",").map((m: string) => m.trim()).filter(Boolean);
    }

    // Regenerate slug if name changed
    if (body.name && !body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    const updated = await updateCollege(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "College not found." } },
        { status: 404 }
      );
    }

    // Revalidate paths for static cache invalidation
    revalidatePath("/colleges");
    revalidatePath(`/colleges/${updated.slug}`);
    revalidatePath("/");

    return NextResponse.json({ data: updated, error: null });
  } catch (error) {
    console.error("Failed to update college:", error);
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message: "Failed to update college." } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role as string)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin privileges required." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const college = await getCollegeById(id);
  if (!college) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "College not found." } },
      { status: 404 }
    );
  }

  const deleted = await deleteCollege(id);
  if (!deleted) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "College not found." } },
      { status: 404 }
    );
  }

  // Revalidate paths for static cache invalidation
  revalidatePath("/colleges");
  revalidatePath(`/colleges/${college.slug}`);
  revalidatePath("/");

  return NextResponse.json({ data: { deleted: true }, error: null });
}
