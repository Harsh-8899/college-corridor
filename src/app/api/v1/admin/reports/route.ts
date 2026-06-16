import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["ADMIN", "SUPER_ADMIN", "MANAGEMENT"].includes(session.user?.role as string)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Privileged access required." } },
      { status: 401 }
    );
  }

  try {
    // Query leads with interested institution details
    const leads = await prisma.lead.findMany({
      include: {
        interestedInstitution: true,
        assignedCounselor: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Generate CSV output
    const headers = ["Lead ID", "Full Name", "Phone", "Email", "City", "Course", "Category", "Institution", "Status", "Counselor", "Created At"];
    const rows = leads.map(l => [
      l.id,
      l.fullName,
      l.phone,
      l.email,
      l.currentCity,
      l.preferredCourse,
      l.preferredCategory,
      l.interestedInstitution?.name || "N/A",
      l.status,
      l.assignedCounselor?.name || "Unassigned",
      l.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="college_corridor_leads_report_${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: { code: "REPORT_FAILED", message: "Failed to generate csv report." } },
      { status: 500 }
    );
  }
}
