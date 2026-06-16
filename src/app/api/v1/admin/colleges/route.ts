import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth/options";
import { getColleges, addCollege } from "@/lib/data/colleges";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required." } },
      { status: 401 }
    );
  }

  const colleges = await getColleges();
  return NextResponse.json({ data: colleges, error: null });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Admin access required." } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Generate slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    // Generate unique ID if not provided
    if (!body.id) {
      body.id = `clg_${Date.now().toString(36)}`;
    }

    // Ensure arrays for courses and modes
    if (typeof body.courses === "string") {
      body.courses = body.courses.split(",").map((c: string) => c.trim()).filter(Boolean);
    }
    if (typeof body.modes === "string") {
      body.modes = body.modes.split(",").map((m: string) => m.trim()).filter(Boolean);
    }

    const college = await addCollege(body);

    // Revalidate paths for static cache invalidation
    revalidatePath("/colleges");
    revalidatePath(`/colleges/${college.slug}`);
    revalidatePath("/");

    return NextResponse.json({ data: college, error: null }, { status: 201 });
  } catch (error) {
    console.error("Failed to create college:", error);
    return NextResponse.json(
      { error: { code: "CREATE_FAILED", message: "Failed to create college." } },
      { status: 500 }
    );
  }
}
