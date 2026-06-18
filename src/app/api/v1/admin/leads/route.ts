import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const updateLeadsSchema = z.object({
  leadIds: z.array(z.string().min(1)),
  assignedCounselorId: z.string().nullable().optional(),
  status: z.string().optional(),
  note: z.string().optional()
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN", "COUNSELOR", "CRM"].includes(session.user?.role as string)) {
    return NextResponse.json({ error: { message: "Unauthorized. Staff permissions required." } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = updateLeadsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: { 
          message: "Invalid input parameters.", 
          details: parsed.error.flatten() 
        } 
      }, { status: 400 });
    }

    const { leadIds, assignedCounselorId, status, note } = parsed.data;

    if (leadIds.length === 0) {
      return NextResponse.json({ error: { message: "No lead IDs provided for update." } }, { status: 400 });
    }

    const updateData: any = {};
    if (assignedCounselorId !== undefined) {
      updateData.assignedCounselorId = assignedCounselorId;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Perform the database update
    if (Object.keys(updateData).length > 0) {
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: updateData
      });
    }

    // Add activity log and notes if note content is present
    const actor = await prisma.user.findUnique({
      where: { email: session.user.email || "" }
    });

    for (const leadId of leadIds) {
      if (note && note.trim()) {
        await prisma.leadActivity.create({
          data: {
            leadId,
            activityType: "CRM_NOTE",
            description: `Note added by ${actor?.name || "Staff"}: ${note}`,
            ctaClicked: "Save Note"
          }
        });
      }

      // Add assignment activity trace if counselor changed
      if (assignedCounselorId) {
        const counselor = await prisma.user.findUnique({
          where: { id: assignedCounselorId }
        });
        await prisma.leadActivity.create({
          data: {
            leadId,
            activityType: "COUNSELOR_ASSIGN",
            description: `Lead assigned to counselor ${counselor?.name || "Staff"}`,
            ctaClicked: "Assign Lead"
          }
        });
      }
    }

    // Log the event in system audit logs
    await prisma.auditLog.create({
      data: {
        actorId: actor?.id || null,
        action: "BULK_UPDATE_LEADS",
        entityType: "LEAD",
        after: { leadIds, updates: updateData }
      }
    });

    return NextResponse.json({
      data: {
        success: true,
        updatedCount: leadIds.length
      }
    });
  } catch (error: any) {
    console.error("Failed to update leads:", error);
    return NextResponse.json({ error: { message: "Internal server error updating leads." } }, { status: 500 });
  }
}
