import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const leadSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  city: z.string().min(2),
  courseInterestedIn: z.string().min(2),
  interestedCollegeId: z.string().optional(),
  sourcePage: z.string().min(1),
  selectedCollegeIds: z.array(z.string()).default([]),
  unlockedContentKeys: z.array(z.string()).default([])
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        data: null,
        meta: {},
        error: {
          code: "VALIDATION_ERROR",
          message: "Please complete all required lead fields.",
          details: parsed.error.flatten()
        }
      },
      { status: 400 }
    );
  }

  try {
    const data = parsed.data;

    // 1. Calculate Priority Lead Score
    let score = 10; // Base score
    const course = data.courseInterestedIn.toLowerCase();
    
    if (course.includes("mba") || course.includes("pg") || course.includes("postgrad")) {
      score += 20; // High value postgraduate
    } else if (course.includes("btech") || course.includes("b.tech") || course.includes("ug") || course.includes("engineering")) {
      score += 15;
    } else if (course.includes("bba") || course.includes("bca") || course.includes("mca")) {
      score += 10;
    }

    if (data.city) score += 5;
    if (data.interestedCollegeId) score += 5;
    if (data.selectedCollegeIds && data.selectedCollegeIds.length > 0) {
      score += 5;
    }

    // Merge metadata
    const finalMetadata = {
      score,
      scoringRules: "program-level-plus-details",
      assignmentRule: "specialty-matched-workload-balance",
      timestamp: new Date().toISOString()
    };

    // 2. Auto-assign Counselor based on Specialties & Workload
    const activeCounselors = await prisma.user.findMany({
      where: {
        role: "COUNSELOR",
        status: "ACTIVE"
      },
      include: {
        counselorProfile: true,
        leadsAssigned: {
          where: {
            status: { in: ["NEW", "ASSIGNED", "CONTACTED"] }
          }
        }
      }
    });

    let assignedCounselorId: string | null = null;
    let status: "NEW" | "ASSIGNED" = "NEW";

    if (activeCounselors.length > 0) {
      // Find specialty matches
      const matchingCounselors = activeCounselors.filter((c) => {
        const specialties = c.counselorProfile?.specialties || [];
        return specialties.some((spec) =>
          course.includes(spec.toLowerCase()) || spec.toLowerCase().includes(course)
        );
      });

      // Sort by workload (fewest active leads first)
      const candidates = matchingCounselors.length > 0 ? matchingCounselors : activeCounselors;
      candidates.sort((a, b) => a.leadsAssigned.length - b.leadsAssigned.length);

      const chosen = candidates[0];
      if (chosen) {
        assignedCounselorId = chosen.id;
        status = "ASSIGNED";
      }
    }

    // 3. Save Lead with Score and Assignment
    const lead = await prisma.lead.create({
      data: {
        ...data,
        status,
        assignedCounselorId,
        metadata: finalMetadata as Prisma.InputJsonValue
      }
    });

    // 4. Create system notifications
    const notifications: Array<{
      userId?: string | null;
      role?: UserRole | null;
      title: string;
      body: string;
      href?: string | null;
    }> = [
      {
        role: UserRole.ADMIN,
        title: "New lead captured",
        body: `${lead.fullName} requested premium access from ${lead.sourcePage}. Score: ${score}. Assigned to: ${assignedCounselorId ? "Counselor" : "Unassigned"}.`,
        href: "/internal/admin"
      }
    ];

    if (assignedCounselorId) {
      notifications.push({
        userId: assignedCounselorId,
        title: "New lead assigned to you",
        body: `${lead.fullName} interested in ${lead.courseInterestedIn} is assigned to you (Score: ${score}).`,
        href: "/internal/counselor"
      });
    } else {
      notifications.push({
        role: UserRole.COUNSELOR,
        title: "Unassigned Lead Alert",
        body: `${lead.fullName} is interested in ${lead.courseInterestedIn}.`,
        href: "/internal/counselor"
      });
    }

    await prisma.notification.createMany({
      data: notifications
    });

    return NextResponse.json({
      data: {
        leadId: lead.id,
        unlocked: true,
        assignedCounselorId,
        score
      },
      meta: {},
      error: null
    });
  } catch (error) {
    console.error("Lead creation failed", error);
    return NextResponse.json(
      {
        data: null,
        meta: {},
        error: {
          code: "LEAD_CREATE_FAILED",
          message: "Lead could not be saved. Check PostgreSQL connection and migrations."
        }
      },
      { status: 503 }
    );
  }
}
