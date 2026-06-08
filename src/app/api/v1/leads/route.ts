import { NextResponse } from "next/server";
import { z } from "zod";
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
    const lead = await prisma.lead.create({
      data: parsed.data
    });

    await prisma.notification.createMany({
      data: [
        {
          role: "ADMIN",
          title: "New lead captured",
          body: `${lead.fullName} requested premium access from ${lead.sourcePage}.`,
          href: "/internal/admin"
        },
        {
          role: "COUNSELOR",
          title: "New counseling lead",
          body: `${lead.fullName} is interested in ${lead.courseInterestedIn}.`,
          href: "/internal/counselor"
        }
      ]
    });

    return NextResponse.json({
      data: {
        leadId: lead.id,
        unlocked: true
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
