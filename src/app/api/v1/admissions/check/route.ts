import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { evaluateAdmissionChances } from "@/lib/admissions/checker";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: { message: "Invalid JSON body." } }, { status: 400 });
    }

    const {
      name,
      phone,
      email,
      state,
      city,
      currentQualification,
      tenthPercentage,
      twelfthPercentage,
      graduationPercentage,
      entranceExam,
      entranceExamScore,
      preferredCourse,
      preferredSpecialization,
      preferredUniversity, // ID of selected university/institution
      budgetRange,
      sourcePage,
      ctaClicked
    } = body;

    // Validation checks
    if (!name || !phone || !email || !preferredCourse) {
      return NextResponse.json(
        { error: { message: "Name, email, mobile number, and preferred course are required." } },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/[\s-()]/g, "");

    // 1. Run the evaluation engine
    const evaluation = await evaluateAdmissionChances(
      {
        tenthPercentage: parseFloat(tenthPercentage) || 0,
        twelfthPercentage: parseFloat(twelfthPercentage) || 0,
        graduationPercentage: graduationPercentage ? parseFloat(graduationPercentage) : undefined,
        entranceExam: entranceExam || undefined,
        entranceExamScore: entranceExamScore || undefined,
        preferredCourse,
        preferredSpecialization: preferredSpecialization || undefined,
        universityId: preferredUniversity || undefined
      },
      preferredUniversity || undefined
    );

    // 2. Perform Lead Resolution and Save AdmissionChanceResult for authenticated users
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth/options");
    const session = await getServerSession(authOptions);
    let studentUserId: string | null = null;

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (dbUser) {
        studentUserId = dbUser.id;
        
        // Persist history if preferredUniversity is provided
        if (preferredUniversity) {
          await prisma.admissionChanceResult.create({
            data: {
              userId: dbUser.id,
              institutionId: preferredUniversity,
              course: preferredCourse,
              admissionChance: evaluation.status,
              status: "APPROVED"
            }
          });
        }
      }
    }

    // 3. Perform Lead Deduplication & Save
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: cleanEmail }
        ]
      }
    });

    const leadPayload = {
      fullName: name,
      phone: cleanPhone,
      email: cleanEmail,
      state: state || null,
      currentCity: city || "Unknown",
      preferredCourse,
      preferredCategory: "OFFLINE", // default placeholder
      preferredLocation: state || null,
      budget: budgetRange || null,
      highestQualification: currentQualification || null,
      tenthPercentage: parseFloat(tenthPercentage) || null,
      twelfthPercentage: parseFloat(twelfthPercentage) || null,
      graduationPercentage: graduationPercentage ? parseFloat(graduationPercentage) : null,
      entranceExam: entranceExam || null,
      entranceExamScore: entranceExamScore || null,
      preferredSpecialization: preferredSpecialization || null,
      admissionResult: evaluation.status,
      status: "NEW" as const, // Status defaults to NEW as requested
      interestedInstitutionId: preferredUniversity || null,
      sourcePage: sourcePage || "/",
      ctaClicked: ctaClicked || "Check Admission Chances",
      createdStudentUserId: studentUserId || null
    };

    if (lead) {
      // Update existing lead with new academic details
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: leadPayload
      });
    } else {
      // Auto-assign counselor workload logic
      const activeCounselors = await prisma.user.findMany({
        where: {
          role: { name: "COUNSELOR" },
          status: "ACTIVE"
        },
        include: {
          leadsAssigned: {
            where: {
              status: { notIn: ["CLOSED"] }
            }
          }
        }
      });

      let assignedCounselorId: string | null = null;
      if (activeCounselors.length > 0) {
        activeCounselors.sort((a, b) => a.leadsAssigned.length - b.leadsAssigned.length);
        const chosen = activeCounselors[0];
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

    // 3. Record Activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        activityType: "ADMISSION_CHECK",
        description: `Checked admission chances for ${preferredCourse} - Result: ${evaluation.status}`,
        pageUrl: sourcePage || "/",
        ctaClicked: ctaClicked || "Check Admission Chances"
      }
    });

    // 4. Trigger Counselor/Admin Notification
    if (lead.assignedCounselorId) {
      await prisma.notification.create({
        data: {
          userId: lead.assignedCounselorId,
          title: "New Admission Checker Lead",
          body: `${lead.fullName} evaluated admission chances for ${preferredCourse} (${evaluation.status}).`,
          href: `/crm/leads/${lead.id}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      evaluation,
      status: evaluation.status
    });
  } catch (error) {
    console.error("Admissions check endpoint failed:", error);
    return NextResponse.json(
      { error: { message: "Internal server error during admission evaluation." } },
      { status: 500 }
    );
  }
}
