import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

const leadCreateSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  currentCity: z.string().min(2, "Current city is required"),
  preferredCourse: z.string().min(2, "Preferred course is required"),
  preferredCategory: z.enum(["OFFLINE", "ONLINE", "STUDY_ABROAD", "DISTANCE"], {
    errorMap: () => ({ message: "Preferred category must be OFFLINE, ONLINE, STUDY_ABROAD, or DISTANCE" })
  }),
  preferredLocation: z.string().optional(),
  budget: z.string().optional(),
  highestQualification: z.string().optional(),
  interestedInstitutionId: z.string().optional(),
  interestedProgramId: z.string().optional(),
  
  // Tracking
  pageUrl: z.string().optional(),
  ctaClicked: z.string().optional(),
  utmSource: z.string().optional(),
  device: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = leadCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.errors[0].message,
            details: parsed.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedPhone = data.phone.replace(/[\s-()]/g, "");

    // 2. Retrieve authenticated user session and check if they are already verified
    const session = await getServerSession(authOptions);
    let studentUserId: string | null = null;
    let isPhoneAlreadyVerified = false;

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        studentUserId = dbUser.id;
        // Check if the user is already verified with this phone number or if their user record has phoneVerified: true
        if (dbUser.phoneVerified && dbUser.phone && dbUser.phone.replace(/[\s-()]/g, "") === normalizedPhone) {
          isPhoneAlreadyVerified = true;
        }
      }
    }

    // 1. Strict Server-Side OTP Verification Check
    if (!isPhoneAlreadyVerified) {
      // Verifies that a successful OTP verification occurred within the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const otpVerified = await prisma.oTPVerification.findFirst({
        where: {
          phone: normalizedPhone,
          status: "VERIFIED",
          createdAt: { gte: fifteenMinutesAgo }
        }
      });

      if (!otpVerified) {
        return NextResponse.json(
          {
            data: null,
            error: {
              code: "OTP_NOT_VERIFIED",
              message: "Mobile verification is required. Please verify with OTP before proceeding."
            }
          },
          { status: 400 }
        );
      }

      // If the user is logged in, mark their profile verified and store the phone number
      if (studentUserId) {
        await prisma.user.update({
          where: { id: studentUserId },
          data: { phoneVerified: true, phone: normalizedPhone }
        });
      }
    }

    // 3. Lead Deduplication and Upsert Logic
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { email: data.email.toLowerCase().trim() }
        ]
      }
    });

    const leadPayload = {
      fullName: data.fullName,
      phone: normalizedPhone,
      email: data.email.toLowerCase().trim(),
      currentCity: data.currentCity,
      preferredCourse: data.preferredCourse,
      preferredCategory: data.preferredCategory,
      preferredLocation: data.preferredLocation || null,
      budget: data.budget || null,
      highestQualification: data.highestQualification || null,
      interestedInstitutionId: data.interestedInstitutionId || null,
      interestedProgramId: data.interestedProgramId || null,
      status: "OTP_VERIFIED" as const,
      createdStudentUserId: studentUserId
    };

    if (lead) {
      // Update existing lead
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: leadPayload
      });
    } else {
      // 3. Auto-assign Counselor based on Specialties & Workload
      const activeCounselors = await prisma.user.findMany({
        where: {
          role: { name: "COUNSELOR" },
          status: "ACTIVE"
        },
        include: {
          staffProfile: true,
          leadsAssigned: {
            where: {
              status: { notIn: ["ENROLLED", "LOST"] }
            }
          }
        }
      });

      let assignedCounselorId: string | null = null;

      if (activeCounselors.length > 0) {
        // Filter by matching category specialty if available
        const matchingCounselors = activeCounselors.filter((c) => {
          const specialties = c.staffProfile?.specialties || [];
          return specialties.some((spec) =>
            spec.toUpperCase() === data.preferredCategory.toUpperCase()
          );
        });

        const candidates = matchingCounselors.length > 0 ? matchingCounselors : activeCounselors;
        // Sort by workload (fewest active leads assigned)
        candidates.sort((a, b) => a.leadsAssigned.length - b.leadsAssigned.length);

        const chosen = candidates[0];
        if (chosen) {
          assignedCounselorId = chosen.id;
        }
      }

      // Create new lead record
      lead = await prisma.lead.create({
        data: {
          ...leadPayload,
          assignedCounselorId
        }
      });
    }

    // 4. Record lead activity trace in LeadActivity
    const activityDesc = data.ctaClicked 
      ? `Clicked CTA "${data.ctaClicked}" on page ${data.pageUrl || "/"}`
      : `Submitted lead capture form on page ${data.pageUrl || "/"}`;

    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        activityType: "LEAD_CAPTURE",
        description: activityDesc,
        pageUrl: data.pageUrl || null,
        ctaClicked: data.ctaClicked || null,
        utmSource: data.utmSource || null,
        device: data.device || null
      }
    });

    // 5. Trigger Counselor Assignment Notification
    if (lead.assignedCounselorId) {
      await prisma.notification.create({
        data: {
          userId: lead.assignedCounselorId,
          title: "New Lead Assigned",
          body: `${lead.fullName} (${lead.preferredCategory}) is assigned to you. Mobile: ${lead.phone}`,
          href: `/crm/leads/${lead.id}`
        }
      });
    }

    return NextResponse.json({
      data: {
        success: true,
        leadId: lead.id,
        assignedCounselorId: lead.assignedCounselorId,
        status: lead.status
      },
      error: null
    });
  } catch (error) {
    console.error("Lead capture failed:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "DATABASE_ERROR",
          message: "Internal server error saving lead data."
        }
      },
      { status: 500 }
    );
  }
}
